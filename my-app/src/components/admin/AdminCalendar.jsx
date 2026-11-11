'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import AdminShell, { AdminError } from '@/components/admin/AdminShell';
import { useAccountData } from '@/components/auth/useAccountData';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import PillButton from '@/components/ui/PillButton';
import {
  bookingsByDate,
  calendarRange,
  dayState,
  hoursLabel,
  isSelectable,
  mergeDays,
  selectionSummary,
  shiftAnchor,
} from '@/lib/admin/calendar';
import { bookingErrorMessage } from '@/lib/booking/labels';
import {
  formatDateTime,
  formatLocalDate,
  formatTime,
  studioToday,
} from '@/lib/format';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const noopSubscribe = () => () => {};
const WEEKDAY_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const STATE_STYLE = {
  open: {
    label: 'Jour ouvré',
    short: 'Ouvert',
    badge: 'border-black/15 bg-white text-third-900',
    dot: 'bg-primary-200',
  },
  closed: {
    label: 'Fermé aux nouvelles réservations',
    short: 'Fermé',
    badge: 'border-third-900 bg-third-900 text-cream',
    dot: 'bg-third-900',
  },
  off: {
    label: 'Jour de repos (planning)',
    short: 'Repos',
    badge: 'border-dashed border-gray-200 bg-secondary-50 text-gray-800',
    dot: 'bg-gray-200',
  },
  unknown: {
    label: '—',
    short: '—',
    badge: 'border-black/10',
    dot: 'bg-black/10',
  },
};

const monthTitle = (month) =>
  new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${month}-15T12:00:00Z`));

const plural = (count, one, many) => (count > 1 ? many : one);

/** Bookings still to come (not cancelled, not finished). */
const activeBookings = (list) =>
  (list ?? []).filter(
    (booking) =>
      booking.status !== 'cancelled' &&
      booking.phase !== 'finished' &&
      booking.phase !== 'cancelled'
  );

function BookingItem({ booking, date }) {
  const cancelled = booking.status === 'cancelled';
  return (
    <Link
      href={`/admin/reservations/${booking.id}?date=${date}`}
      className={`font-montserrat focus-visible:outline-third-200 flex flex-col gap-0.5 rounded-xl px-3 py-2 text-xs transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 ${
        cancelled
          ? 'border border-dashed border-gray-200 bg-white text-gray-800'
          : 'bg-third-900 text-cream'
      }`}
    >
      <span className="font-semibold">
        {formatTime(booking.startsAt)} – {formatTime(booking.endsAt)}
        {cancelled ? ' · annulé' : ''}
      </span>
      <span
        className={`text-sm leading-snug ${cancelled ? 'line-through' : 'text-secondary-200'}`}
      >
        {booking.service.name}
      </span>
      <span
        className={`text-sm font-medium break-words ${cancelled ? 'line-through' : ''}`}
      >
        {booking.client?.name ?? 'Nom non renseigné'}
      </span>
      <span className="sr-only"> — voir le détail</span>
    </Link>
  );
}

function DayCheckbox({ date, today, checked, onToggle }) {
  const selectable = isSelectable(date, today);
  return (
    <label
      className={`font-montserrat flex min-h-11 items-center gap-2.5 text-xs font-medium tracking-wide uppercase ${
        selectable
          ? 'cursor-pointer text-gray-900'
          : 'cursor-not-allowed text-gray-800/60'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={!selectable}
        onChange={() => onToggle(date)}
        className="accent-third-200 size-5 shrink-0"
      />
      {selectable ? 'Sélectionner' : 'Date passée'}
      <span className="sr-only">
        {' '}
        le {formatLocalDate(date, { year: true })}
      </span>
    </label>
  );
}

/**
 * Week (main view): 7 vertical columns, Monday → Sunday. All 7 side by
 * side on wide screens; on narrower ones the row scrolls horizontally and
 * the week buttons stay the way to change weeks.
 */
function WeekView({ dates, daysByDate, byDate, today, selected, onToggle }) {
  const scrollerRef = useRef(null);

  // When the row scrolls, start it at today's column.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const column = scroller?.querySelector('[data-today="true"]');
    if (scroller && column && scroller.scrollWidth > scroller.clientWidth) {
      scroller.scrollLeft = column.offsetLeft - scroller.offsetLeft;
    }
  }, [dates]);

  return (
    <div
      ref={scrollerRef}
      className="sm:-mx-section-x-tablet sm:px-section-x-tablet sm:scroll-px-section-x-tablet -mx-4 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-3 xl:mx-0 xl:snap-none xl:overflow-visible xl:px-0 xl:pb-0"
    >
      <ol className="grid w-max grid-cols-[repeat(7,minmax(15rem,1fr))] gap-3 sm:grid-cols-[repeat(7,minmax(13.5rem,1fr))] xl:w-full xl:grid-cols-7 xl:gap-2">
        {dates.map((date) => {
          const state = dayState(daysByDate.get(date));
          const bookings = byDate.get(date) ?? [];
          const isToday = date === today;
          const isSelected = selected.has(date);
          return (
            <li
              key={date}
              data-today={isToday || undefined}
              className={`rounded-card flex min-w-0 snap-start flex-col gap-3 border p-3 ${
                isSelected
                  ? 'border-primary-200 ring-primary-200 bg-white ring-2'
                  : state.kind === 'closed'
                    ? 'bg-secondary-50 border-black/15'
                    : isToday
                      ? 'border-primary-200 bg-white'
                      : 'border-black/10 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="flex flex-col">
                  <span
                    className={`font-montserrat text-xs tracking-wider uppercase ${isToday ? 'text-primary-300 font-semibold' : 'text-gray-800'}`}
                  >
                    {formatLocalDate(date).split(' ')[0]}
                  </span>
                  <span
                    className={`font-faustina text-2xl leading-tight ${isToday ? 'text-primary-300' : 'text-third-900'}`}
                  >
                    {formatLocalDate(date, { weekday: undefined })}
                  </span>
                </h3>
                {isToday ? (
                  <span className="font-montserrat bg-primary-200 text-on-gold rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold uppercase">
                    Aujourd’hui
                  </span>
                ) : null}
              </div>

              <DayCheckbox
                date={date}
                today={today}
                checked={isSelected}
                onToggle={onToggle}
              />

              <div className="flex flex-col gap-1.5">
                <span
                  className={`font-montserrat inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-medium tracking-wide uppercase ${STATE_STYLE[state.kind].badge}`}
                >
                  {STATE_STYLE[state.kind].label}
                </span>
                {state.kind === 'open' ? (
                  <p className="font-montserrat text-xs text-gray-800">
                    Heures d’ouverture : {hoursLabel(state.hours)}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5 border-t border-black/10 pt-3">
                <p className="font-montserrat text-label-sm font-medium text-gray-800 uppercase">
                  Rendez-vous
                </p>
                {bookings.length ? (
                  <ul className="flex flex-col gap-1.5">
                    {bookings.map((booking) => (
                      <li key={booking.id}>
                        <BookingItem booking={booking} date={date} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-montserrat text-xs text-gray-800">
                    Aucun rendez-vous
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Month (extra overview): a tap on a date selects it for a bulk action. */
function MonthView({
  dates,
  month,
  daysByDate,
  byDate,
  today,
  selected,
  onToggle,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div aria-hidden className="grid grid-cols-7 gap-1 sm:gap-2">
        {WEEKDAY_SHORT.map((label) => (
          <span
            key={label}
            className="font-montserrat text-center text-[0.6875rem] tracking-wider text-gray-800 uppercase"
          >
            {label}
          </span>
        ))}
      </div>
      <ol className="grid grid-cols-7 gap-1 sm:gap-2">
        {dates.map((date) => {
          const inMonth = date.startsWith(month);
          const state = dayState(daysByDate.get(date));
          const active = activeBookings(byDate.get(date)).length;
          const isToday = date === today;
          const selectable = isSelectable(date, today);
          const isSelected = selected.has(date);
          const label = `${formatLocalDate(date, { year: true })} — ${STATE_STYLE[state.kind].label}${
            state.kind === 'open' ? ` (${hoursLabel(state.hours)})` : ''
          } — ${active ? `${active} rendez-vous` : 'aucun rendez-vous'}`;
          const cellClass = `rounded-xl sm:rounded-card flex h-full min-h-16 w-full flex-col gap-1 border p-1.5 text-left sm:min-h-28 sm:p-2.5 ${
            isSelected
              ? 'border-primary-200 ring-primary-200 bg-white ring-2'
              : state.kind === 'closed'
                ? 'bg-secondary-50 border-black/15'
                : 'border-black/10 bg-white'
          } ${inMonth ? '' : 'opacity-50'}`;
          const content = (
            <>
              <span className="flex items-start justify-between gap-1">
                <span
                  className={`font-faustina text-lg leading-none sm:text-2xl ${
                    isToday
                      ? 'text-primary-300 font-semibold'
                      : 'text-third-900'
                  }`}
                >
                  {Number(date.slice(8))}
                </span>
                {selectable ? (
                  <span
                    aria-hidden
                    className={`hidden size-5 items-center justify-center rounded border sm:flex ${
                      isSelected
                        ? 'border-primary-200 bg-primary-200 text-on-gold'
                        : 'border-black/25 bg-white text-transparent'
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="size-3.5"
                    >
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  </span>
                ) : null}
              </span>
              <span className="mt-auto flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={`size-2 shrink-0 rounded-full ${STATE_STYLE[state.kind].dot}`}
                />
                <span className="font-montserrat hidden truncate text-[0.6875rem] text-gray-800 sm:inline">
                  {state.kind === 'open'
                    ? hoursLabel(state.hours)
                    : STATE_STYLE[state.kind].short}
                </span>
              </span>
              {active ? (
                <span className="font-montserrat bg-primary-200 text-on-gold w-fit rounded-full px-1.5 text-[0.6875rem] font-semibold sm:px-2">
                  {active}
                  <span className="hidden sm:inline"> rdv</span>
                </span>
              ) : null}
            </>
          );
          return (
            <li key={date} className="min-w-0">
              {selectable ? (
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={label}
                  onClick={() => onToggle(date)}
                  className={`${cellClass} hover:border-third-200 focus-visible:outline-third-200 focus-visible:outline-2 focus-visible:outline-offset-2`}
                >
                  {content}
                </button>
              ) : (
                <div role="img" aria-label={label} className={cellClass}>
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Legend({ view }) {
  return (
    <ul className="font-montserrat flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-800">
      {['open', 'closed', 'off'].map((kind) => (
        <li key={kind} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={`size-2.5 rounded-full ${STATE_STYLE[kind].dot}`}
          />
          {STATE_STYLE[kind].label}
        </li>
      ))}
      {view === 'month' ? (
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="bg-primary-200 text-on-gold rounded-full px-1.5 text-[0.6875rem] font-semibold"
          >
            2
          </span>
          Rendez-vous à venir
        </li>
      ) : null}
    </ul>
  );
}

/** What the last bulk action did, from the server answer. */
function ActionResult({ result, onDismiss }) {
  return (
    <div
      role="status"
      className="rounded-card flex flex-col gap-4 border border-black/10 bg-white p-5 sm:p-6"
    >
      {result.kind === 'reopen' ? (
        <>
          <p className="font-montserrat text-body font-semibold text-gray-900">
            Fermeture retirée pour {result.dates.length}{' '}
            {plural(result.dates.length, 'date', 'dates')}.
          </p>
          <p className="font-montserrat text-body text-gray-800">
            Chaque date reprend son planning habituel.
            {result.stillOff.length
              ? ` Jour de repos dans le planning, ${plural(result.stillOff.length, 'cette date reste fermée', 'ces dates restent fermées')} : ${result.stillOff
                  .map((date) => formatLocalDate(date, { weekday: undefined }))
                  .join(', ')}. Pour y travailler, modifiez les horaires.`
              : ''}
          </p>
        </>
      ) : (
        <>
          <p className="font-montserrat text-body font-semibold text-gray-900">
            {result.dates.length}{' '}
            {plural(result.dates.length, 'date fermée', 'dates fermées')} aux
            nouvelles réservations.
          </p>
          {result.bookings.length ? (
            <>
              <p className="font-montserrat text-body text-gray-800">
                Ces rendez-vous sont conservés, aucun n’a été annulé. Vous
                pouvez les assurer ou contacter les clients vous-même.
              </p>
              <ul className="font-montserrat text-body-sm flex flex-col gap-1.5 text-gray-900">
                {result.bookings.map((booking) => (
                  <li key={booking.bookingId}>
                    <Link
                      href={`/admin/reservations/${booking.bookingId}?date=${booking.date}`}
                      className="hover:text-third-200 underline underline-offset-2"
                    >
                      <span className="inline-block first-letter:uppercase">
                        {formatDateTime(booking.startsAt)}
                      </span>{' '}
                      — {booking.serviceName}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="font-montserrat text-body text-gray-800">
              Aucun rendez-vous n’était prévu ces jours-là.
            </p>
          )}
        </>
      )}
      <PillButton variant="text" onClick={onDismiss} className="self-start">
        Fermer ce message
      </PillButton>
    </div>
  );
}

function CalendarContent({ controller, enabled }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = useSyncExternalStore(noopSubscribe, studioToday, () => null);
  const view = searchParams.get('vue') === 'mois' ? 'month' : 'week';
  const asked = searchParams.get('date');
  const anchor = asked && DATE.test(asked) ? asked : today;

  const [selected, setSelected] = useState(() => new Set());
  const [dialog, setDialog] = useState(null); // 'close' | 'reopen'
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [result, setResult] = useState(null);
  const busyRef = useRef(false);

  const range = anchor ? calendarRange(view, anchor) : null;
  const query = range ? `from=${range.from}&to=${range.to}` : null;
  const days = useAccountData(
    query ? `/api/admin/schedule/days?${query}` : null,
    { enabled }
  );
  const bookings = useAccountData(
    query ? `/api/admin/bookings?${query}` : null,
    { enabled }
  );

  const daysByDate = useMemo(
    () => new Map((days.data?.days ?? []).map((day) => [day.date, day])),
    [days.data]
  );
  const byDate = useMemo(
    () => bookingsByDate(bookings.data?.bookings, bookings.data?.timeZone),
    [bookings.data]
  );

  // The selection belongs to the dates on screen.
  const go = (nextView, nextAnchor) => {
    const params = new URLSearchParams();
    if (nextView === 'month') params.set('vue', 'mois');
    params.set('date', nextAnchor);
    setSelected(new Set());
    router.replace(`/admin/calendrier?${params}`, { scroll: false });
  };

  const toggle = (date) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });

  if (!range) {
    return (
      <p role="status" className="font-montserrat text-body text-gray-800">
        Chargement…
      </p>
    );
  }

  const summary = selectionSummary(selected, daysByDate);
  const targets = dialog === 'close' ? summary.open : summary.closed;
  const keptBookings =
    dialog === 'close'
      ? targets.flatMap((date) => activeBookings(byDate.get(date)))
      : [];
  const staysOff =
    dialog === 'reopen'
      ? targets.filter((date) => dayState(daysByDate.get(date)).scheduleOff)
      : [];
  const skipped = dialog === 'close' ? summary.closed : summary.open;

  const apply = async () => {
    if (busyRef.current || !targets.length) return;
    busyRef.current = true;
    setPending(true);
    setActionError(null);
    try {
      const path =
        dialog === 'close'
          ? '/api/admin/schedule/closures'
          : '/api/admin/schedule/closures/reopen';
      const answer = await controller.api(path, {
        method: 'POST',
        body: { dates: targets },
      });
      days.replace({
        ...days.data,
        days: mergeDays(days.data?.days, answer.days),
      });
      setResult(
        dialog === 'close'
          ? { kind: 'close', dates: targets, bookings: answer.bookings ?? [] }
          : {
              kind: 'reopen',
              dates: targets,
              stillOff: (answer.days ?? [])
                .filter((day) => !day.effective?.open)
                .map((day) => day.date),
            }
      );
      setDialog(null);
      setSelected(new Set());
    } catch (caught) {
      setActionError(caught);
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  };

  const title =
    view === 'month'
      ? monthTitle(range.month)
      : `Du ${formatLocalDate(range.from, { weekday: undefined })} au ${formatLocalDate(range.to, { weekday: undefined, year: true })}`;
  const showsToday =
    view === 'week'
      ? range.dates.includes(today)
      : Boolean(today?.startsWith(range.month));
  const loading = [days.status, bookings.status].some(
    (value) => value === 'loading' || value === 'idle'
  );
  const failed =
    days.status === 'error'
      ? days
      : bookings.status === 'error'
        ? bookings
        : null;
  const navButton =
    'font-montserrat text-label hover:bg-secondary-50 focus-visible:outline-third-200 flex min-h-11 items-center gap-2 rounded-full px-3 font-medium text-gray-900 uppercase focus-visible:outline-2 sm:px-4';

  return (
    <div
      className={`flex flex-col gap-6 ${selected.size ? 'pb-56 sm:pb-36 lg:pb-28' : ''}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-montserrat text-label-sm font-medium text-gray-800 uppercase">
            {view === 'month' ? 'Vue du mois' : 'Semaine affichée'}
          </p>
          <h2
            aria-live="polite"
            className="font-faustina text-third-900 text-[1.75rem] leading-tight first-letter:uppercase"
          >
            {title}
          </h2>
        </div>
        <div
          role="group"
          aria-label="Affichage"
          className="font-montserrat text-label flex w-fit rounded-full border border-black/15 bg-white p-1 uppercase"
        >
          {[
            ['week', 'Semaine'],
            ['month', 'Mois'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={view === key}
              onClick={() => go(key, anchor)}
              className={`focus-visible:outline-third-200 min-h-10 rounded-full px-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                view === key
                  ? 'bg-third-900 text-cream'
                  : 'hover:text-third-200 text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <nav
        aria-label={view === 'month' ? 'Changer de mois' : 'Changer de semaine'}
        className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-full border border-black/10 bg-white p-1"
      >
        <button
          type="button"
          onClick={() => go(view, shiftAnchor(view, anchor, -1))}
          className={`${navButton} justify-self-start`}
        >
          <span aria-hidden>←</span>
          <span className="sr-only sm:not-sr-only">
            {view === 'month' ? 'Mois précédent' : 'Semaine précédente'}
          </span>
        </button>
        <button
          type="button"
          onClick={() => go(view, today)}
          disabled={!today || showsToday}
          className="font-montserrat text-label focus-visible:outline-third-200 bg-third-900 text-cream min-h-11 rounded-full px-5 font-medium uppercase focus-visible:outline-2 disabled:bg-transparent disabled:text-gray-800"
        >
          Aujourd’hui
        </button>
        <button
          type="button"
          onClick={() => go(view, shiftAnchor(view, anchor, 1))}
          className={`${navButton} justify-self-end`}
        >
          <span className="sr-only sm:not-sr-only">
            {view === 'month' ? 'Mois suivant' : 'Semaine suivante'}
          </span>
          <span aria-hidden>→</span>
        </button>
      </nav>

      <div className="flex flex-col gap-2">
        <Legend view={view} />
        <p className="font-montserrat text-body-sm text-gray-800">
          {view === 'month'
            ? 'Touchez les dates (à partir d’aujourd’hui) pour les sélectionner. Le détail des rendez-vous est dans la vue Semaine.'
            : 'Cochez des jours pour les fermer aux nouvelles réservations ou retirer leur fermeture. Les heures d’ouverture peuvent déjà contenir des rendez-vous.'}
        </p>
      </div>

      {result ? (
        <ActionResult result={result} onDismiss={() => setResult(null)} />
      ) : null}

      {failed ? (
        <AdminError
          error={failed.error}
          onRetry={() => {
            days.reload();
            bookings.reload();
          }}
          message={bookingErrorMessage(failed.error)}
        />
      ) : loading ? (
        <div role="status">
          <span className="sr-only">Chargement du calendrier…</span>
          <div
            aria-hidden
            className={`grid gap-2 overflow-hidden ${view === 'month' ? 'grid-cols-7' : 'grid-cols-[repeat(7,minmax(13.5rem,1fr))] xl:grid-cols-7'}`}
          >
            {range.dates.map((date) => (
              <span
                key={date}
                className={`bg-secondary-50 animate-pulse rounded-xl motion-reduce:animate-none ${view === 'month' ? 'h-16 sm:h-28' : 'h-72'}`}
              />
            ))}
          </div>
        </div>
      ) : view === 'month' ? (
        <MonthView
          dates={range.dates}
          month={range.month}
          daysByDate={daysByDate}
          byDate={byDate}
          today={today}
          selected={selected}
          onToggle={toggle}
        />
      ) : (
        <WeekView
          dates={range.dates}
          daysByDate={daysByDate}
          byDate={byDate}
          today={today}
          selected={selected}
          onToggle={toggle}
        />
      )}

      {selected.size ? (
        <div
          role="region"
          aria-label="Dates sélectionnées"
          className="px-page fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white/95 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm"
        >
          <div className="max-w-content mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <p className="font-montserrat text-body font-medium text-gray-900">
              {selected.size}{' '}
              {plural(
                selected.size,
                'date sélectionnée',
                'dates sélectionnées'
              )}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <PillButton
                size="sm"
                onClick={() => {
                  setActionError(null);
                  setDialog('close');
                }}
                disabled={!summary.open.length}
                className="disabled:opacity-50"
              >
                Fermer aux nouvelles réservations
              </PillButton>
              <PillButton
                variant="outline"
                tone="dark"
                size="sm"
                onClick={() => {
                  setActionError(null);
                  setDialog('reopen');
                }}
                disabled={!summary.closed.length}
                className="disabled:opacity-50"
              >
                Retirer la fermeture
              </PillButton>
              <PillButton
                variant="text"
                onClick={() => setSelected(new Set())}
                className="self-center"
              >
                Réinitialiser la sélection
              </PillButton>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={dialog !== null}
        title={
          dialog === 'close'
            ? 'Fermer aux nouvelles réservations ?'
            : 'Retirer la fermeture ?'
        }
        confirmLabel={
          dialog === 'close' ? 'Fermer ces dates' : 'Retirer la fermeture'
        }
        pending={pending}
        error={actionError ? bookingErrorMessage(actionError) : null}
        onConfirm={apply}
        onClose={() => setDialog(null)}
      >
        <ul className="bg-secondary-50 mb-4 flex max-h-44 flex-col gap-1 overflow-y-auto rounded-2xl p-4 text-gray-900">
          {targets.map((date) => (
            <li key={date} className="first-letter:uppercase">
              {formatLocalDate(date, { year: true })}
            </li>
          ))}
        </ul>
        {dialog === 'close' ? (
          <>
            <span className="block">
              Plus aucune nouvelle réservation ni aucun déplacement vers{' '}
              {plural(targets.length, 'cette date', 'ces dates')}.
            </span>
            <span className="mt-2 block font-medium text-gray-900">
              Les rendez-vous existants ne sont pas annulés
              {keptBookings.length
                ? ` (${keptBookings.length} à venir) : leur liste s’affichera ensuite.`
                : '.'}
            </span>
          </>
        ) : (
          <>
            <span className="block">
              Seule la fermeture est retirée : chaque date reprend son planning
              habituel.
            </span>
            {staysOff.length ? (
              <span className="mt-2 block">
                Jour de repos dans le planning,{' '}
                {plural(
                  staysOff.length,
                  'cette date restera fermée',
                  'ces dates resteront fermées'
                )}{' '}
                :{' '}
                {staysOff
                  .map((date) => formatLocalDate(date, { weekday: undefined }))
                  .join(', ')}
                .
              </span>
            ) : null}
          </>
        )}
        {skipped.length ? (
          <span className="text-body-sm mt-2 block">
            {skipped.length}{' '}
            {dialog === 'close'
              ? plural(
                  skipped.length,
                  'date déjà fermée, inchangée.',
                  'dates déjà fermées, inchangées.'
                )
              : plural(
                  skipped.length,
                  'date non fermée, inchangée.',
                  'dates non fermées, inchangées.'
                )}
          </span>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}

/**
 * /admin/calendrier — main view: the week, Monday → Sunday, one column per
 * day with its state, working hours (not free times: they may hold
 * bookings) and bookings. The month is an extra overview to select dates.
 * Two range requests per view, no polling. Selected dates can be closed
 * for new bookings or have their closure removed; existing bookings are
 * never cancelled and are listed after a closure.
 */
export default function AdminCalendar() {
  return (
    <AdminShell
      title={
        <>
          Calendrier du <span className="heading-accent">cabinet</span>
        </>
      }
      current="calendrier"
      returnTo="/admin/calendrier"
    >
      {({ controller, status }) => (
        <CalendarContent controller={controller} enabled={status === 'admin'} />
      )}
    </AdminShell>
  );
}
