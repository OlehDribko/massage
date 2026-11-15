'use client';

import { useId, useRef, useState, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';

import AdminShell, { AdminError } from '@/components/admin/AdminShell';
import {
  Link,
  useFormat,
  useRouter,
  useServiceName,
  useT,
} from '@/i18n/client';
import { msg } from '@/i18n/translate';
import { rich } from '@/i18n/rich';
import BlockDialog, { BLOCK_STYLE } from '@/components/admin/BlockDialog';
import { useAccountData } from '@/components/auth/useAccountData';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DateField from '@/components/ui/DateField';
import Notice from '@/components/ui/Notice';
import {
  agendaItems,
  applyBlockChange,
  blockTimeLabel,
  blocksCountLabel,
  blocksOf,
  layoutLanes,
} from '@/lib/admin/blocks';
import { dayState } from '@/lib/admin/calendar';
import { validatorFor } from '@/lib/api/contract';
import { sortDayBookings } from '@/lib/booking/bookings';
import {
  ADMIN_NOTIFICATION_REASONS,
  ADMIN_NOTIFICATION_STATUS,
  NOTIFICATION_EVENTS,
  bookingErrorMessage,
  cancelledByLabel,
} from '@/lib/booking/labels';
import { toMinutes } from '@/lib/booking/schedule';
import { addDays, localDateOf, studioToday } from '@/lib/format';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
/** The day agenda lives inside the calendar (no separate tab). */
export const DAY_PATH = '/admin/calendrier/jour';
const noopSubscribe = () => () => {};
const MAX_REASON = 500;
const HOUR_PX = 64;
const BREAK_MINUTES = 15; // docs/booking.md §2: one break after each session
const checkDays = validatorFor('scheduleDays');

const PHASE_LABEL = {
  upcoming: msg('confirmé'),
  in_progress: msg('en cours'),
  finished: msg('terminé'),
  cancelled: msg('annulé'),
};

/** "4 rendez-vous · 5 h réservées · 1 annulé · 1 indisponibilité". */
function daySummary(bookings, blockCount = 0, t) {
  const confirmed = bookings.filter((b) => b.status !== 'cancelled');
  const minutes = confirmed.reduce(
    (sum, b) => sum + (Date.parse(b.endsAt) - Date.parse(b.startsAt)) / 60_000,
    0
  );
  const cancelled = bookings.length - confirmed.length;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  const time = hours
    ? `${hours} ${t('h')}${rest ? ` ${String(rest).padStart(2, '0')}` : ''}`
    : `${rest} ${t('min')}`;
  return [
    t('{n} rendez-vous|{n} rendez-vous', { n: confirmed.length }),
    confirmed.length ? t('{time} réservées', { time }) : null,
    cancelled ? t('{n} annulé|{n} annulés', { n: cancelled }) : null,
    blockCount ? blocksCountLabel(blockCount, t) : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Parts of [from, to] (minutes) not covered by the working intervals. */
function gapsOf(intervals, from, to) {
  const ranges = (intervals ?? [])
    .map(({ start, end }) => [toMinutes(start), toMinutes(end)])
    .filter(([a, b]) => a !== null && b !== null)
    .sort((x, y) => x[0] - y[0]);
  const gaps = [];
  let cursor = from;
  for (const [a, b] of ranges) {
    if (a > cursor) gaps.push([cursor, Math.min(a, to)]);
    cursor = Math.max(cursor, b);
  }
  if (cursor < to) gaps.push([cursor, to]);
  return gaps.filter(([a, b]) => b > a);
}

const hatch =
  'bg-[repeating-linear-gradient(135deg,var(--color-secondary-50)_0_8px,var(--color-secondary-100)_8px_16px)]';

/**
 * The day as a vertical timeline (Figma-like «Agenda du jour»): hours,
 * time outside the working hours hatched, bookings and busy times
 * («indisponibilités») in time order — overlapping ones side by side. A
 * booking (a click selects it) is followed by the 15-minute break the
 * calendar keeps free; a busy time opens its form.
 */
function DayTimeline({
  date,
  bookings,
  blocks,
  timeZone,
  scheduleDay,
  selectedId,
  onSelect,
  onOpenBlock,
}) {
  const t = useT();
  const serviceName = useServiceName();
  const { formatDuration, formatTime } = useFormat();
  const state = dayState(scheduleDay);
  const spans = layoutLanes(agendaItems(bookings, blocks, date, timeZone));
  const hoursOpen = state.kind === 'open' ? state.hours : [];
  const first = Math.min(
    9 * 60,
    ...spans.map((span) => span.start),
    ...hoursOpen.map((item) => toMinutes(item.start) ?? 9 * 60)
  );
  const last = Math.max(
    20 * 60,
    ...spans.map((span) => span.end + BREAK_MINUTES),
    ...hoursOpen.map((item) => toMinutes(item.end) ?? 20 * 60)
  );
  const fromHour = Math.floor(first / 60);
  const toHour = Math.min(24, Math.ceil(last / 60));
  const top = (minute) => ((minute - fromHour * 60) / 60) * HOUR_PX;
  const height = (toHour - fromHour) * HOUR_PX;
  const hours = Array.from(
    { length: toHour - fromHour + 1 },
    (_, index) => fromHour + index
  );
  const closedLabel =
    state.kind === 'closed'
      ? t('Fermé aux nouvelles réservations')
      : state.kind === 'off'
        ? t('Jour de repos')
        : t('Pause · fermé');
  const gaps =
    state.kind === 'open'
      ? gapsOf(state.hours, fromHour * 60, toHour * 60)
      : scheduleDay
        ? [[fromHour * 60, toHour * 60]]
        : [];

  return (
    <section
      aria-label={t('Planning du jour')}
      className="rounded-panel flex gap-3 border border-black/10 bg-white p-4 sm:p-6"
    >
      <div aria-hidden className="relative w-12 shrink-0" style={{ height }}>
        {hours.map((hour) => (
          <span
            key={hour}
            className="font-montserrat absolute right-0 -translate-y-1/2 text-xs text-gray-800"
            style={{ top: top(hour * 60) }}
          >
            {String(hour).padStart(2, '0')}:00
          </span>
        ))}
      </div>
      <div
        className="relative flex-1 border-l border-black/10"
        style={{ height }}
      >
        {hours.map((hour) => (
          <span
            key={hour}
            aria-hidden
            className="absolute inset-x-0 h-px bg-black/[0.08]"
            style={{ top: top(hour * 60) }}
          />
        ))}
        {gaps.map(([from, to]) => (
          <div
            key={from}
            aria-hidden
            className={`font-montserrat absolute inset-x-0 flex items-start px-4 pt-2 text-xs text-gray-800 ${hatch}`}
            style={{ top: top(from), height: top(to) - top(from) }}
          >
            {top(to) - top(from) >= 24 ? closedLabel : null}
          </div>
        ))}
        {spans.map(({ kind, item, start, end, lane, lanes }) => {
          const place = {
            left: `calc(0.75rem + (100% - 1.5rem) * ${lane / lanes})`,
            width: `calc((100% - 1.5rem) / ${lanes} - ${lanes > 1 ? 4 : 0}px)`,
          };
          if (kind === 'block') {
            return (
              <button
                key={`block-${item.id}`}
                type="button"
                onClick={() => onOpenBlock(item)}
                className={`font-montserrat focus-visible:outline-third-200 absolute z-[1] flex flex-col items-start gap-0.5 overflow-hidden rounded-xl px-3 py-1.5 text-left transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 ${BLOCK_STYLE}`}
                style={{
                  ...place,
                  top: top(start) + 1,
                  height: Math.max(((end - start) / 60) * HOUR_PX - 2, 26),
                }}
              >
                <span className="text-xs font-semibold">
                  {blockTimeLabel(item, date, t)} · {t('indisponible')}
                </span>
                <span className="w-full truncate text-sm font-semibold">
                  {item.title}
                </span>
                <span className="sr-only">{t(' — modifier ou supprimer')}</span>
              </button>
            );
          }
          const booking = item;
          const cancelled = booking.status === 'cancelled';
          const selected = booking.id === selectedId;
          return (
            <div key={`booking-${booking.id}`}>
              {!cancelled ? (
                <span
                  aria-hidden
                  className="absolute rounded bg-[repeating-linear-gradient(90deg,rgb(205_152_79/0.28)_0_4px,transparent_4px_8px)]"
                  style={{
                    ...place,
                    top: top(end),
                    height: (BREAK_MINUTES / 60) * HOUR_PX,
                  }}
                />
              ) : null}
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(booking.id)}
                className={`font-montserrat focus-visible:outline-third-200 absolute flex flex-col items-start gap-0.5 overflow-hidden rounded-xl px-3 py-1.5 text-left transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  cancelled
                    ? 'z-0 border border-dashed border-black/30 bg-white text-gray-800'
                    : selected
                      ? 'bg-third-900 text-cream ring-primary-200 z-[2] ring-[3px]'
                      : 'bg-primary-50 text-third-900 z-[1] hover:shadow-md'
                }`}
                style={{
                  ...place,
                  top: top(start) + 1,
                  height: Math.max(((end - start) / 60) * HOUR_PX - 2, 26),
                }}
              >
                <span className="text-xs font-semibold">
                  {formatTime(booking.startsAt)}–{formatTime(booking.endsAt)}
                  {cancelled ? ` · ${t('annulé')}` : ''}
                </span>
                <span className="w-full truncate text-sm font-semibold">
                  {booking.client.name ?? t('Nom non renseigné')}
                </span>
                <span
                  className={`w-full truncate text-xs ${selected ? 'text-secondary-200' : ''}`}
                >
                  {serviceName(booking.service)} ·{' '}
                  {formatDuration(booking.service.durationMinutes)}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const MAIL_TONE = {
  accepted: 'text-[#1d6b3a]',
  failed: 'text-error',
  interrupted: 'text-error',
};

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

/** The selected booking: contact, emails and cancellation, on the side. */
function BookingPanel({ booking, controller, onChanged }) {
  const t = useT();
  const serviceName = useServiceName();
  const { formatDateTime, formatDuration, formatPrice, formatTime } =
    useFormat();
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);
  const busyRef = useRef(false);
  const reasonId = useId();

  const cancelled = booking.status === 'cancelled';
  const notifications = (booking.notifications ?? []).slice(-2);

  const cancel = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPending(true);
    setError(null);
    try {
      const trimmed = reason.trim();
      const result = await controller.api(
        `/api/admin/bookings/${booking.id}/cancel`,
        { method: 'POST', body: trimmed ? { reason: trimmed } : {} }
      );
      onChanged(result.booking);
      setDone(
        result.changed
          ? t(
              'Rendez-vous annulé. Le client est prévenu par e-mail si l’envoi est actif.'
            )
          : t('Ce rendez-vous était déjà annulé.')
      );
      setConfirming(false);
      setReason('');
    } catch (caught) {
      setError(caught);
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  };

  return (
    <aside
      aria-label={t('Rendez-vous sélectionné')}
      className="rounded-panel flex flex-col gap-5 border border-black/10 bg-white p-6 sm:p-7 lg:sticky lg:top-6"
    >
      <div className="flex flex-col gap-1">
        <p
          className={`font-montserrat text-label-sm font-semibold uppercase ${cancelled ? 'text-gray-800' : 'text-primary-300'}`}
        >
          {formatTime(booking.startsAt)}–{formatTime(booking.endsAt)} ·{' '}
          {PHASE_LABEL[booking.phase]
            ? t(PHASE_LABEL[booking.phase])
            : booking.phase}
        </p>
        <h2 className="font-faustina text-third-900 text-[1.875rem] leading-tight font-medium break-words">
          {booking.client.name ?? t('Nom non renseigné')}
        </h2>
        <p className="font-montserrat text-body-sm text-gray-800">
          {serviceName(booking.service)} ·{' '}
          {formatDuration(booking.service.durationMinutes)} ·{' '}
          {formatPrice(booking.service.priceCents, booking.service.currency)}
        </p>
      </div>

      {booking.client.phone || booking.client.email ? (
        <div className="flex flex-col gap-2.5">
          {booking.client.phone ? (
            <ContactRow
              href={`tel:${booking.client.phone}`}
              icon={
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
              }
            >
              {booking.client.phone}
            </ContactRow>
          ) : null}
          {booking.client.email ? (
            <ContactRow
              href={`mailto:${booking.client.email}`}
              icon={
                <>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </>
              }
            >
              {booking.client.email}
            </ContactRow>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5 border-t border-black/[0.08] pt-4">
        <h3 className="font-montserrat text-label-sm font-semibold text-gray-800 uppercase">
          {t('E-mails')}
        </h3>
        {notifications.length ? (
          <ul className="font-montserrat text-body-sm flex flex-col gap-2">
            {notifications.flatMap((entry) =>
              [
                ['client', t('client'), entry.client],
                ['studio', t('cabinet'), entry.studio],
              ].map(([key, who, result]) => (
                <li
                  key={`${entry.event}-${entry.occurredAt}-${key}`}
                  className="flex justify-between gap-3"
                >
                  <span className="text-gray-900">
                    {t(NOTIFICATION_EVENTS[entry.event] ?? 'Modification')} →{' '}
                    {who}
                  </span>
                  <span
                    className={`text-right font-medium ${MAIL_TONE[result?.status] ?? 'text-gray-800'}`}
                  >
                    {ADMIN_NOTIFICATION_STATUS[result?.status]
                      ? t(ADMIN_NOTIFICATION_STATUS[result.status])
                      : '—'}
                    {result?.reason ? (
                      <span className="block text-xs font-normal">
                        {t(
                          ADMIN_NOTIFICATION_REASONS[result.reason] ??
                            ADMIN_NOTIFICATION_REASONS.other
                        )}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))
            )}
          </ul>
        ) : (
          <p className="font-montserrat text-body-sm text-gray-800">
            {t('Aucun e-mail enregistré pour ce rendez-vous.')}
          </p>
        )}
      </div>

      <div role="status">{done ? <Notice>{done}</Notice> : null}</div>

      {cancelled && booking.cancellation ? (
        <p className="font-montserrat text-body-sm border-t border-black/[0.08] pt-4 text-gray-800">
          {t('Annulé {by} le {date}', {
            by: cancelledByLabel(booking.cancellation.by, t),
            date: formatDateTime(booking.cancellation.at),
          })}
          {booking.cancellation.reason
            ? ` — motif : ${booking.cancellation.reason}`
            : ''}
        </p>
      ) : null}

      {booking.allowedActions?.cancel ? (
        <div className="flex flex-col gap-2 border-t border-black/[0.08] pt-4">
          <label
            htmlFor={reasonId}
            className="font-montserrat text-body-sm font-medium text-gray-900"
          >
            {t('Motif d’annulation')}{' '}
            <span className="font-normal text-gray-800">
              {t('(facultatif)')}
            </span>
          </label>
          <textarea
            id={reasonId}
            rows={2}
            maxLength={MAX_REASON}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="font-montserrat text-body focus:border-third-200 focus:ring-third-200/30 resize-y rounded-xl border border-black/20 px-3.5 py-3 text-gray-900 focus:ring-2 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              setError(null);
              setConfirming(true);
            }}
            className="font-montserrat text-label border-error text-error hover:bg-error/5 focus-visible:outline-error min-h-12 rounded-full border font-medium tracking-wide uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {t('Annuler ce rendez-vous')}
          </button>
        </div>
      ) : null}

      <Link
        href={`/admin/reservations/${booking.id}?date=${booking.startsAt ? localDateOf(booking.startsAt) : ''}`}
        className="font-montserrat text-body-sm hover:text-third-200 self-start text-gray-800 underline underline-offset-4"
      >
        {t('Historique complet')}
      </Link>

      <ConfirmDialog
        open={confirming}
        title={t('Annuler ce rendez-vous ?')}
        confirmLabel={t('Oui, annuler')}
        cancelLabel={t('Garder')}
        pending={pending}
        error={error ? bookingErrorMessage(error, t) : null}
        onConfirm={cancel}
        onClose={() => setConfirming(false)}
      >
        {t(
          '{client} — {date}, {service}. L’horaire est libéré et le client est prévenu par e-mail (si l’envoi est actif).',
          {
            client: booking.client.name ?? t('Ce client'),
            date: formatDateTime(booking.startsAt),
            service: serviceName(booking.service),
          }
        )}
        {reason.trim() ? ` Motif : « ${reason.trim()} ».` : ''}
      </ConfirmDialog>
    </aside>
  );
}

/** Booking shown first: the next one to come, else a kept one, else any. */
function defaultSelection(bookings) {
  const kept = bookings.filter((booking) => booking.status !== 'cancelled');
  const live = kept.filter((booking) => booking.phase !== 'finished');
  return (live[0] ?? kept[0] ?? bookings[0])?.id ?? null;
}

function DayContent({ date, today, enabled, controller, header }) {
  const t = useT();
  const bookings = useAccountData(`/api/admin/bookings?date=${date}`, {
    enabled,
  });
  const schedule = useAccountData(
    `/api/admin/schedule/days?from=${date}&to=${date}`,
    { enabled, validate: checkDays }
  );
  const [chosen, setChosen] = useState(null);
  const [editor, setEditor] = useState(null); // { date } | { block }
  const [blockNotice, setBlockNotice] = useState(null);
  const panelRef = useRef(null);
  const addButtonRef = useRef(null);

  if (bookings.status === 'loading' || bookings.status === 'idle') {
    return (
      <>
        {header('')}
        <p role="status" className="font-montserrat text-body text-gray-800">
          {t('Chargement des rendez-vous…')}
        </p>
      </>
    );
  }
  if (bookings.status === 'error') {
    return (
      <>
        {header('')}
        <AdminError
          error={bookings.error}
          onRetry={bookings.reload}
          message={bookingErrorMessage(bookings.error, t)}
        />
      </>
    );
  }

  const list = sortDayBookings(bookings.data.bookings);
  const scheduleDay = schedule.data?.days?.[0] ?? null;
  const blocks = blocksOf(scheduleDay);

  // The open day is the only one loaded: a block moved to another date
  // leaves it at once, a block moved here joins it; then reload.
  const blockChanged = ({ removedId, block, action }) => {
    if (schedule.data) {
      schedule.replace({
        ...schedule.data,
        days: applyBlockChange(schedule.data.days, { removedId, block }),
      });
    }
    schedule.reload();
    setEditor(null);
    setBlockNotice(
      action === 'deleted'
        ? t(
            'Indisponibilité supprimée : le créneau est de nouveau réservable selon les horaires.'
          )
        : action === 'created'
          ? t(
              'Indisponibilité ajoutée : les clients ne peuvent plus réserver ce créneau.'
            )
          : t('Indisponibilité modifiée.')
    );
  };
  const canAdd = Boolean(today) && date >= today;
  const selectedId = list.some((booking) => booking.id === chosen)
    ? chosen
    : defaultSelection(list);
  const selected = list.find((booking) => booking.id === selectedId);

  const select = (id) => {
    setChosen(id);
    // On phones the panel is below the timeline: bring it into view.
    if (window.matchMedia('(max-width: 1023px)').matches) {
      requestAnimationFrame(() =>
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      );
    }
  };

  return (
    <>
      {header(
        list.length || blocks.length
          ? daySummary(list, blocks.length, t)
          : t('Aucun rendez-vous')
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          ref={addButtonRef}
          type="button"
          onClick={() => {
            setBlockNotice(null);
            setEditor({ date: canAdd ? date : today });
          }}
          disabled={!today}
          className="font-montserrat text-body-sm hover:border-third-200 focus-visible:outline-third-200 min-h-11 rounded-full border border-black/20 bg-white px-5 font-medium text-gray-900 transition-colors focus-visible:outline-2 disabled:opacity-50"
        >
          <span aria-hidden>+ </span>
          {t('Ajouter une indisponibilité')}
        </button>
        {schedule.status === 'error' ? (
          <p className="font-montserrat text-body-sm text-error">
            {t('Horaires et indisponibilités non chargés.')}{' '}
            <button
              type="button"
              onClick={schedule.reload}
              className="underline underline-offset-2"
            >
              {t('Réessayer')}
            </button>
          </p>
        ) : null}
      </div>
      <div role="status">
        {blockNotice ? <Notice>{blockNotice}</Notice> : null}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)] lg:items-start">
        <DayTimeline
          date={date}
          bookings={list}
          blocks={blocks}
          timeZone={bookings.data.timeZone}
          scheduleDay={scheduleDay}
          selectedId={selectedId}
          onSelect={select}
          onOpenBlock={(block) => {
            setBlockNotice(null);
            setEditor({ block });
          }}
        />
        <div ref={panelRef} className="scroll-mt-6">
          {selected ? (
            <BookingPanel
              key={selected.id}
              booking={selected}
              controller={controller}
              onChanged={(updated) =>
                bookings.replace({
                  ...bookings.data,
                  bookings: bookings.data.bookings.map((booking) =>
                    booking.id === updated.id
                      ? { ...booking, ...updated }
                      : booking
                  ),
                })
              }
            />
          ) : (
            <div className="rounded-panel bg-secondary-50 flex flex-col items-center gap-2 border border-dashed border-black/15 px-6 py-10 text-center">
              <p className="font-faustina text-third-900 text-2xl">
                {t('Aucun rendez-vous')}
              </p>
              <p className="font-montserrat text-body-sm text-gray-800">
                {t('Rien de prévu ce jour-là.')}
              </p>
            </div>
          )}
        </div>
      </div>
      {editor ? (
        <BlockDialog
          key={editor.block?.id ?? `new-${editor.date}`}
          editor={editor}
          today={today}
          controller={controller}
          fallbackFocus={addButtonRef}
          onClose={() => setEditor(null)}
          onChanged={blockChanged}
          onGone={schedule.reload}
        />
      ) : null}
    </>
  );
}

const roundButton =
  'flex size-11 shrink-0 items-center justify-center rounded-full border border-black/20 bg-white text-third-900 transition-colors hover:border-third-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-third-200';

function Chevron({ back = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
      className="size-[18px]"
    >
      <path d={back ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
  );
}

/**
 * /admin/calendrier/jour?date=YYYY-MM-DD — «Agenda du jour», opened from a
 * day of the calendar (week or month): the day's
 * timeline (all statuses, GET /api/admin/bookings?date=) with the working
 * hours of the date, and the selected booking on the side (contact, email
 * results, cancellation with an optional reason).
 */
export default function AdminDayBookings() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = useSyncExternalStore(noopSubscribe, studioToday, () => null);
  const asked = searchParams.get('date');
  const date = asked && DATE.test(asked) ? asked : today;

  const go = (next) =>
    router.replace(`${DAY_PATH}?date=${next}`, { scroll: false });

  return (
    <AdminShell
      title={
        <>
          {rich(t('Agenda du <accent>jour</accent>'), {
            accent: (chunks) => (
              <span className="heading-accent">{chunks}</span>
            ),
          })}
        </>
      }
      current="calendrier"
      returnTo={date ? `${DAY_PATH}?date=${date}` : DAY_PATH}
    >
      {({ status, controller }) =>
        date ? (
          <div className="flex flex-col gap-6">
            <Link
              href={`/admin/calendrier?date=${date}`}
              className="font-montserrat text-body-sm hover:border-third-200 focus-visible:outline-third-200 flex min-h-11 w-fit items-center gap-2 rounded-full border border-black/15 bg-white px-5 text-gray-900 transition-colors focus-visible:outline-2"
            >
              <span aria-hidden>←</span> {t('Calendrier')}
            </Link>
            <DayContent
              key={date}
              date={date}
              today={today}
              enabled={status === 'admin'}
              controller={controller}
              header={(summaryText) => (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => go(addDays(date, -1))}
                        aria-label={t('Jour précédent')}
                        className={roundButton}
                      >
                        <Chevron back />
                      </button>
                      <DateField
                        variant="title"
                        label={t('Journée')}
                        value={date}
                        today={today}
                        onChange={go}
                      />
                      <button
                        type="button"
                        onClick={() => go(addDays(date, 1))}
                        aria-label={t('Jour suivant')}
                        className={roundButton}
                      >
                        <Chevron />
                      </button>
                    </span>
                    <button
                      type="button"
                      onClick={() => go(today)}
                      disabled={date === today}
                      className="font-montserrat text-body-sm hover:border-third-200 focus-visible:outline-third-200 min-h-11 rounded-full border border-black/20 bg-white px-5 font-medium text-gray-900 transition-colors focus-visible:outline-2 disabled:opacity-50"
                    >
                      {t('Aujourd’hui')}
                    </button>
                  </div>
                  <p
                    aria-live="polite"
                    className="font-montserrat text-body-sm text-gray-800"
                  >
                    {summaryText}
                  </p>
                </div>
              )}
            />
          </div>
        ) : (
          <p role="status" className="font-montserrat text-body text-gray-800">
            {t('Chargement…')}
          </p>
        )
      }
    </AdminShell>
  );
}
