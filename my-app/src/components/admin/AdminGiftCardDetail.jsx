'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import AdminShell, { AdminError } from '@/components/admin/AdminShell';
import { useAccountData } from '@/components/auth/useAccountData';
import Notice from '@/components/ui/Notice';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  ADMIN_NOTIFICATION_REASONS,
  ADMIN_NOTIFICATION_STATUS,
} from '@/lib/booking/labels';
import { Link, useFormat, useT } from '@/i18n/client';
import { rich } from '@/i18n/rich';
import {
  GIFT_STATUSES,
  channelLabel,
  giftCardErrorMessage,
  historyTitle,
  listSearch,
  readListFilters,
  statusAction,
  statusLabel,
} from '@/lib/giftCards';

function Panel({ title, eyebrow, children }) {
  return (
    <section className="rounded-panel flex flex-col gap-5 border border-black/10 bg-white p-6 sm:p-7">
      <div className="flex flex-col gap-1">
        {eyebrow ? (
          <p className="font-montserrat text-label-sm text-primary-300 font-semibold uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-faustina text-third-900 text-[1.625rem] leading-tight break-words">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function ContactRow({ href, icon, children }) {
  return (
    <a
      href={href}
      className="bg-secondary-50 hover:bg-secondary-100 focus-visible:outline-third-200 font-montserrat text-body flex min-h-12 items-center gap-3 rounded-xl px-4 break-all text-gray-900 transition-colors focus-visible:outline-2"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden
        className="size-[18px] shrink-0"
      >
        {icon}
      </svg>
      {children}
    </a>
  );
}

const ACTION_STYLES = {
  primary:
    'bg-third-900 hover:bg-third-200 border-transparent text-white focus-visible:outline-third-200',
  outline:
    'hover:border-third-200 border-black/20 bg-white text-gray-900 focus-visible:outline-third-200',
  danger:
    'border-error text-error hover:bg-error/5 bg-white focus-visible:outline-error',
};

/** Studio email about the request (the client gets no email). */
function StudioEmail({ notification }) {
  const t = useT();
  const { formatDateTime } = useFormat();
  if (!notification) {
    return (
      <p className="font-montserrat text-body-sm text-gray-800">
        {t(
          'Envoi des e-mails désactivé sur ce serveur : la demande est enregistrée, aucun e-mail n’est envoyé au cabinet.'
        )}
      </p>
    );
  }
  const reason = notification.reason
    ? t(
        ADMIN_NOTIFICATION_REASONS[notification.reason] ??
          ADMIN_NOTIFICATION_REASONS.other
      )
    : null;
  return (
    <dl className="font-montserrat text-body-sm grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2">
      <dt className="text-gray-800">{t('État')}</dt>
      <dd className="text-gray-900">
        {t(ADMIN_NOTIFICATION_STATUS[notification.status] ?? 'Inconnu')}
        {reason ? ` (${reason})` : ''}
      </dd>
      <dt className="text-gray-800">{t('Tentatives')}</dt>
      <dd className="text-gray-900">{notification.attempts ?? 0}</dd>
      {notification.lastAttemptAt ? (
        <>
          <dt className="text-gray-800">{t('Dernier essai')}</dt>
          <dd className="text-gray-900 first-letter:uppercase">
            {formatDateTime(notification.lastAttemptAt)}
          </dd>
        </>
      ) : null}
      {notification.acceptedAt ? (
        <>
          <dt className="text-gray-800">{t('Accepté le')}</dt>
          <dd className="text-gray-900 first-letter:uppercase">
            {formatDateTime(notification.acceptedAt)}
          </dd>
        </>
      ) : null}
      <dd className="col-span-2 text-xs text-gray-800">
        {t(
          '« Accepté » signifie pris en charge par le service d’envoi, pas forcément arrivé dans la boîte de réception.'
        )}
      </dd>
    </dl>
  );
}

function History({ history }) {
  const t = useT();
  const { formatDateTime } = useFormat();
  return (
    <ol className="flex flex-col">
      {history.map((entry, index) => {
        const last = index === history.length - 1;
        return (
          <li
            key={`${entry.toStatus}-${entry.at}`}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {!last ? (
              <span
                aria-hidden
                className="absolute top-9 bottom-0 left-[1.0625rem] w-px bg-black/10"
              />
            ) : null}
            <span
              aria-hidden
              className="bg-secondary-100 text-third-900 relative flex size-9 shrink-0 items-center justify-center rounded-full"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4"
              >
                <path
                  d={
                    entry.fromStatus
                      ? 'M5 12h14M13 6l6 6-6 6'
                      : 'M12 5v14M5 12h14'
                  }
                />
              </svg>
            </span>
            <div className="font-montserrat flex min-w-0 flex-col gap-1 pt-1.5">
              <p className="text-body font-medium text-gray-900">
                {historyTitle(entry, t)}
              </p>
              <p className="text-body-sm text-gray-800 first-letter:uppercase">
                {formatDateTime(entry.at)}
              </p>
              <p className="text-xs break-words text-gray-800">
                {entry.by?.role === 'admin' ? t('Administration') : t('Client')}
                {entry.by?.name || entry.by?.email
                  ? ` · ${[entry.by.name, entry.by.email].filter(Boolean).join(' · ')}`
                  : ''}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Detail({ requestId, controller, enabled }) {
  const t = useT();
  const { formatDateTime, formatPrice } = useFormat();
  const searchParams = useSearchParams();
  const back = `/admin/cartes-cadeaux${listSearch(readListFilters(searchParams))}`;
  const { status, data, error, reload, replace } = useAccountData(
    `/api/admin/gift-card-requests/${encodeURIComponent(requestId)}`,
    { enabled }
  );
  const [pending, setPending] = useState(null); // target status
  const [actionError, setActionError] = useState(null);
  const [done, setDone] = useState(null);
  const busyRef = useRef(false);

  const backLink = (
    <Link
      href={back}
      className="font-montserrat text-body-sm hover:border-third-200 focus-visible:outline-third-200 flex min-h-11 w-fit items-center gap-2 rounded-full border border-black/15 bg-white px-5 text-gray-900 transition-colors focus-visible:outline-2"
    >
      <span aria-hidden>←</span> {t('Toutes les demandes')}
    </Link>
  );

  if (status === 'loading' || status === 'idle') {
    return (
      <p role="status" className="font-montserrat text-body text-gray-800">
        {t('Chargement de la demande…')}
      </p>
    );
  }
  if (status === 'error' && !data) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <AdminError
          error={error}
          onRetry={error?.status === 404 ? undefined : reload}
          message={giftCardErrorMessage(error, t)}
        />
      </div>
    );
  }

  const request = data.giftCardRequest;
  const tone = GIFT_STATUSES[request.status]?.tone ?? 'muted';

  const changeStatus = async (target) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPending(target);
    setActionError(null);
    setDone(null);
    try {
      const result = await controller.api(
        `/api/admin/gift-card-requests/${request.id}/status`,
        { method: 'PATCH', body: { status: target } }
      );
      replace({ giftCardRequest: result.giftCardRequest });
      setDone(
        result.changed
          ? t('Statut mis à jour : {status}.', {
              status: statusLabel(
                result.giftCardRequest.status,
                t
              ).toLowerCase(),
            })
          : t('Le statut était déjà à jour.')
      );
    } catch (caught) {
      setActionError(caught);
      // Someone else changed it: show the current state.
      if (caught?.status === 409 || caught?.status === 404) reload();
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {backLink}

      <div role="status">{done ? <Notice>{done}</Notice> : null}</div>
      {actionError ? (
        <div role="alert">
          <Notice tone="error">{giftCardErrorMessage(actionError, t)}</Notice>
        </div>
      ) : null}

      <section className="rounded-panel bg-secondary-50 flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-montserrat text-label-sm text-primary-300 font-semibold uppercase">
              {t('Demande n° {number}', { number: request.number })}
            </p>
            <p className="font-faustina text-third-900 text-[2.25rem] leading-tight">
              {formatPrice(request.amountCents)}
            </p>
          </div>
          <StatusBadge tone={tone}>
            {statusLabel(request.status, t)}
          </StatusBadge>
        </div>
        <dl className="font-montserrat text-body grid gap-x-6 gap-y-2 sm:grid-cols-[auto_minmax(0,1fr)]">
          <dt className="text-gray-800">{t('Reçue le')}</dt>
          <dd className="text-gray-900 first-letter:uppercase">
            {formatDateTime(request.createdAt)}
          </dd>
          <dt className="text-gray-800">{t('Contact souhaité')}</dt>
          <dd className="text-gray-900">
            {channelLabel(request.preferredContactChannel, t)}
          </dd>
          <dt className="text-gray-800">{t('Message')}</dt>
          <dd className="break-words whitespace-pre-line text-gray-900">
            {request.description ?? '—'}
          </dd>
          <dt className="text-gray-800">{t('Mise à jour')}</dt>
          <dd className="text-gray-900 first-letter:uppercase">
            {formatDateTime(request.updatedAt)}
          </dd>
        </dl>
        <p className="font-montserrat text-xs text-gray-800">
          {t(
            'Aucun paiement en ligne ni carte émise par le site : la demande est traitée à la main avec le client.'
          )}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="flex flex-col gap-6">
          <Panel eyebrow={t('Client')} title={request.client.name}>
            <div className="flex flex-col gap-2.5">
              <ContactRow
                href={`tel:${request.client.phone}`}
                icon={
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                }
              >
                <span className="flex flex-col">
                  {request.client.phone}
                  <span className="text-xs text-gray-800">
                    {t('Téléphone non vérifié')}
                  </span>
                </span>
              </ContactRow>
              <ContactRow
                href={`mailto:${request.client.email}`}
                icon={
                  <>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </>
                }
              >
                {request.client.email}
              </ContactRow>
            </div>
            <p className="font-montserrat text-xs text-gray-800">
              {t('Coordonnées au moment de la demande.')}
            </p>
          </Panel>

          <Panel title={t('Statut')}>
            {request.allowedStatuses.length ? (
              <div className="flex flex-wrap gap-3">
                {request.allowedStatuses.map((target) => {
                  const action = statusAction(request.status, target, t);
                  return (
                    <button
                      key={target}
                      type="button"
                      disabled={pending !== null}
                      aria-busy={pending === target}
                      onClick={() => changeStatus(target)}
                      className={`font-montserrat text-label min-h-12 rounded-full border px-6 font-medium tracking-wide uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 ${ACTION_STYLES[action.tone]}`}
                    >
                      {pending === target ? t('Mise à jour…') : action.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="font-montserrat text-body-sm text-gray-800">
                {t('Aucun changement de statut possible.')}
              </p>
            )}
            <p className="font-montserrat text-xs text-gray-800">
              {t(
                '« Traitée » : traitement terminé à la main (ce n’est ni un paiement ni une carte émise par le site). « Clôturée » : demande erronée, en double ou retirée. Une demande traitée ou clôturée peut être rouverte.'
              )}
            </p>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title={t('Historique')}>
            <History history={request.history} />
          </Panel>
          <Panel title={t('E-mail au cabinet')}>
            <StudioEmail notification={request.notification} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

/** /admin/cartes-cadeaux/[id] — one request: client, status, history, email. */
export default function AdminGiftCardDetail({ requestId }) {
  const t = useT();
  return (
    <AdminShell
      title={
        <>
          {rich(t('Demande de <accent>carte cadeau</accent>'), {
            accent: (chunks) => (
              <span className="heading-accent">{chunks}</span>
            ),
          })}
        </>
      }
      current="cartes-cadeaux"
      returnTo={`/admin/cartes-cadeaux/${requestId}`}
    >
      {({ controller, status }) => (
        <Detail
          requestId={requestId}
          controller={controller}
          enabled={status === 'admin'}
        />
      )}
    </AdminShell>
  );
}
