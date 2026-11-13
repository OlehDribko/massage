'use client';

import { useId } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import AdminShell, { AdminError } from '@/components/admin/AdminShell';
import { useAccountData } from '@/components/auth/useAccountData';
import Notice from '@/components/ui/Notice';
import StatusBadge from '@/components/ui/StatusBadge';
import { adminNotificationLabel } from '@/lib/booking/labels';
import { formatDateTime, formatPrice } from '@/lib/format';
import {
  GIFT_STATUSES,
  PAGE_SIZE,
  channelLabel,
  giftCardErrorMessage,
  listApiPath,
  listSearch,
  pageCount,
  readListFilters,
  statusLabel,
} from '@/lib/giftCards';

const DATE_INPUT =
  'font-montserrat text-body focus:border-third-200 focus:ring-third-200/30 min-h-11 rounded-xl border border-black/20 bg-white px-3.5 text-gray-900 focus:ring-2 focus:outline-none';

function Filters({ filters, onChange }) {
  const fromId = useId();
  const toId = useId();
  const set = (changes) => onChange({ ...filters, ...changes, page: 1 });
  const filtered = filters.status || filters.from || filters.to;

  return (
    <div className="rounded-panel flex flex-col gap-5 border border-black/10 bg-white p-5 sm:p-6">
      <div role="group" aria-label="Statut" className="flex flex-wrap gap-2">
        {[
          ['', 'Toutes'],
          ...Object.entries(GIFT_STATUSES).map(([key, s]) => [key, s.label]),
        ].map(([value, label]) => (
          <button
            key={value || 'all'}
            type="button"
            aria-pressed={filters.status === value}
            onClick={() => set({ status: value })}
            className={`rounded-pill font-montserrat text-body-sm focus-visible:outline-third-200 min-h-10 border px-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
              filters.status === value
                ? 'border-third-900 bg-third-900 text-white'
                : 'hover:border-third-200 border-black/15 bg-white text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={fromId}
            className="font-montserrat text-body-sm font-medium text-gray-900"
          >
            Reçues du
          </label>
          <input
            id={fromId}
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(event) => set({ from: event.target.value })}
            className={DATE_INPUT}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={toId}
            className="font-montserrat text-body-sm font-medium text-gray-900"
          >
            au
          </label>
          <input
            id={toId}
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(event) => set({ to: event.target.value })}
            className={DATE_INPUT}
          />
        </div>
        {filtered ? (
          <button
            type="button"
            onClick={() => onChange({ status: '', from: '', to: '', page: 1 })}
            className="font-montserrat text-body-sm hover:text-third-200 min-h-11 text-gray-800 underline underline-offset-4"
          >
            Réinitialiser les filtres
          </button>
        ) : null}
      </div>
      <p className="font-montserrat text-xs text-gray-800">
        Dates de réception, heure de Paris, bornes incluses.
      </p>
    </div>
  );
}

function RequestRow({ request, search }) {
  const tone = GIFT_STATUSES[request.status]?.tone ?? 'muted';
  return (
    <li>
      <Link
        href={`/admin/cartes-cadeaux/${request.id}${search}`}
        className="rounded-panel hover:border-third-200 focus-visible:outline-third-200 grid gap-3 border border-black/10 bg-white p-5 transition-colors focus-visible:outline-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6"
      >
        <div className="font-montserrat flex min-w-0 flex-col gap-1.5">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-faustina text-third-900 text-[1.375rem] leading-tight">
              n° {request.number} · {formatPrice(request.amountCents)}
            </span>
            <span className="text-body-sm text-gray-800 first-letter:uppercase">
              {formatDateTime(request.createdAt)}
            </span>
          </p>
          <p className="text-body truncate text-gray-900">
            {request.client.name}
            <span className="text-gray-800">
              {' '}
              · contact : {channelLabel(request.preferredContactChannel)}
            </span>
          </p>
          <p className="text-xs text-gray-800">
            E-mail au cabinet :{' '}
            {request.notification
              ? adminNotificationLabel(request.notification)
              : 'envoi désactivé'}
          </p>
        </div>
        <StatusBadge tone={tone}>{statusLabel(request.status)}</StatusBadge>
      </Link>
    </li>
  );
}

function List({ enabled }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = readListFilters(searchParams);
  const badRange = filters.from && filters.to && filters.from > filters.to;
  const { status, data, error, reload } = useAccountData(
    badRange ? null : listApiPath(filters),
    { enabled }
  );
  const search = listSearch(filters);

  const go = (next) =>
    router.replace(`/admin/cartes-cadeaux${listSearch(next)}`, {
      scroll: false,
    });

  let body;
  if (badRange) {
    body = (
      <Notice tone="error">
        La date de début doit précéder la date de fin.
      </Notice>
    );
  } else if (status === 'loading' || status === 'idle') {
    body = (
      <p role="status" className="font-montserrat text-body text-gray-800">
        Chargement des demandes…
      </p>
    );
  } else if (status === 'error' && !data) {
    body = (
      <AdminError
        error={error}
        onRetry={reload}
        message={giftCardErrorMessage(error)}
      />
    );
  } else {
    const pages = pageCount(data.total, data.pageSize ?? PAGE_SIZE);
    const requests = data.giftCardRequests;
    body = (
      <div className="flex flex-col gap-5">
        <p className="font-montserrat text-body-sm text-gray-800" role="status">
          {data.total === 0
            ? 'Aucune demande pour ces filtres.'
            : `${data.total} demande${data.total > 1 ? 's' : ''} · page ${data.page} sur ${pages}`}
        </p>
        {requests.length ? (
          <ul className="flex flex-col gap-3">
            {requests.map((request) => (
              <RequestRow key={request.id} request={request} search={search} />
            ))}
          </ul>
        ) : data.total > 0 ? (
          <Notice>
            Cette page est vide.{' '}
            <button
              type="button"
              onClick={() => go({ ...filters, page: 1 })}
              className="underline underline-offset-4"
            >
              Revenir à la première page
            </button>
          </Notice>
        ) : null}
        {pages > 1 ? (
          <nav
            aria-label="Pages"
            className="font-montserrat flex items-center justify-between gap-3"
          >
            <button
              type="button"
              disabled={filters.page <= 1}
              onClick={() => go({ ...filters, page: filters.page - 1 })}
              className="text-body-sm hover:border-third-200 min-h-11 rounded-full border border-black/15 bg-white px-5 text-gray-900 disabled:opacity-40"
            >
              ← Précédente
            </button>
            <span className="text-body-sm text-gray-800">
              {data.page} / {pages}
            </span>
            <button
              type="button"
              disabled={filters.page >= pages}
              onClick={() => go({ ...filters, page: filters.page + 1 })}
              className="text-body-sm hover:border-third-200 min-h-11 rounded-full border border-black/15 bg-white px-5 text-gray-900 disabled:opacity-40"
            >
              Suivante →
            </button>
          </nav>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="font-montserrat text-body max-w-3xl text-gray-800">
        Demandes envoyées depuis le site. Elles sont traitées à la main :
        contactez le client, convenez du règlement et de la remise de la carte,
        puis mettez à jour le statut.
      </p>
      <Filters filters={filters} onChange={go} />
      {body}
    </div>
  );
}

/** /admin/cartes-cadeaux — gift card requests, newest first. */
export default function AdminGiftCards() {
  return (
    <AdminShell
      title={
        <>
          Cartes <span className="heading-accent">cadeaux</span>
        </>
      }
      current="cartes-cadeaux"
      returnTo="/admin/cartes-cadeaux"
    >
      {({ status }) => <List enabled={status === 'admin'} />}
    </AdminShell>
  );
}
