'use client';

import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import AdminShell, { AdminError } from '@/components/admin/AdminShell';
import { useAccountData } from '@/components/auth/useAccountData';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Notice from '@/components/ui/Notice';
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
    label: 'Ouvert',
    short: 'Ouvert',
    badge: 'bg-white text-third-900 border-black/15',
    dot: 'bg-primary-200',
  },
  closed: {
    label: 'Fermé aux réservations',
    short: 'Fermé',
    badge: 'bg-third-900 text-cream border-third-900',
    dot: 'bg-third-900',
  },
  off: {
    label: 'Jour de repos',
    short: 'Repos',
    badge: 'bg-secondary-50 text-gray-800 border-dashed border-gray-200',
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

/** Active bookings (not cancelled, not finished) of a day. */
const activeBookings = (list) =>
  (list ?? []).filter(
    (booking) =>
      booking.status !== 'cancelled' &&
      booking.phase !== 'finished' &&
      booking.phase !== 'cancelled'
  );

function BookingLine({ booking, date }) {
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
        {formatTime(booking.startsAt)}–{formatTime(booking.endsAt)}
        {cancelled ? ' · annulé' : ''}
      </span>
      <span className={`truncate text-sm ${cancelled ? 'line-through' : ''}`}>
        {booking.client?.name ?? 'Nom non renseigné'}
      </span>
      <span className={`truncate ${cancelled ? '' : 'text-secondary-200'}`}>
        {booking.service.name}
      </span>
    </Link>
  );
}

function StateBadge({ state }) {
  const style = STATE_STYLE[state.kind];
  return (
    <span
      className={`font-montserrat inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-medium tracking-wide uppercase ${style.badge}`}
    >
      {style.label}
    </span>
  );
}

function SelectToggle({ date, selected, onToggle, children, className = '' }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onToggle(date)}
      className={`focus-visible:outline-third-200 text-left focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`}
    >
      {children}
      <span className="sr-only">
        {selected ? ' — sélectionnée' : ' — sélectionner'}
      </span>
    </button>
  );
}

function CheckMark({ selected }) {
  return (
    <span
      aria-hidden
      className={`flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
        selected
          ? 'border-primary-200 bg-primary-200 text-on-gold'
          : 'border-black/25 bg-white text-transparent'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="size-4"
      >
        <path d="M5 12l5 5 9-10" />
      </svg>
    </span>
  );
}

/** Week: one column per day (a list on phones), bookings in full. */
export function WeekView({
  dates,
  daysByDate,
  byDate,
  today,
  selecting,
  selected,
  onToggle,
}) {
  return (
    <ol className="grid gap-3 lg:grid-cols-7 lg:gap-2">
      {dates.map((date) => {
        const state = dayState(daysByDate.get(date));
        const bookings = byDate.get(date) ?? [];
        const isToday = date === today;
        const canSelect = selecting && isSelectable(date, today);
        const isSelected = selected.has(date);
        const header = (
          <span className="flex items-start justify-between gap-2">
            <span className="flex flex-col">
              <span className="font-montserrat text-xs tracking-wider text-gray-800 uppercase">
                {formatLocalDate(date, { weekday: 'long' }).split(' ')[0]}
              </span>
              <span
                className={`font-faustina text-[1.75rem] leading-none ${isToday ? 'text-primary-300' : 'text-third-900'}`}
              >
                {Number(date.slice(8))}
                <span className="sr-only">
                  {' '}
                  {formatLocalDate(date, { year: true, weekday: undefined })}
                  {isToday ? ' (aujourd’hui)' : ''}
                </span>
              </span>
            </span>
            {canSelect ? <CheckMark selected={isSelected} /> : null}
          </span>
        );
        return (
          <li
            key={date}
            className={`rounded-card flex min-w-0 flex-col gap-3 border p-3 ${
              isSelected
                ? 'border-primary-200 ring-primary-200 bg-white ring-2'
                : state.kind === 'closed'
                  ? 'bg-secondary-50 border-black/15'
                  : 'border-black/10 bg-white'
            }`}
          >
            {canSelect ? (
              <SelectToggle
                date={date}
                selected={isSelected}
                onToggle={onToggle}
                className="-m-1 rounded-lg p-1"
              >
                {header}
              </SelectToggle>
            ) : (
              header
            )}
            <div className="flex flex-col gap-1">
              <StateBadge state={state} />
              {state.kind === 'open' ? (
                <span className="font-montserrat text-xs text-gray-800">
                  {hoursLabel(state.hours)}
                </span>
              ) : null}
            </div>
            {bookings.length ? (
              <ul className="flex flex-col gap-1.5">
                {bookings.map((booking) => (
                  <li key={booking.id}>
                    <BookingLine booking={booking} date={date} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-montserrat text-xs text-gray-800">
                Aucun rendez-vous
              </p>
            )}
            <Link
              href={`/admin/reservations?date=${date}`}
              className="font-montserrat text-label-sm hover:text-third-200 mt-auto font-medium text-gray-800 uppercase underline underline-offset-4"
            >
              Journée
              <span className="sr-only"> du {formatLocalDate(date)}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/** Month: compact cells (state, count); a cell opens its day. */
export function MonthView({
  dates,
  month,
  daysByDate,
  byDate,
  today,
  selecting,
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
          const bookings = byDate.get(date) ?? [];
          const active = activeBookings(bookings).length;
          const isToday = date === today;
          const canSelect = selecting && isSelectable(date, today);
          const isSelected = selected.has(date);
          const label = `${formatLocalDate(date, { year: true })} — ${STATE_STYLE[state.kind].label}${
            state.kind === 'open' ? ` (${hoursLabel(state.hours)})` : ''
          } — ${active ? `${active} rendez-vous` : 'aucun rendez-vous'}`;
          const content = (
            <>
              <span className="flex items-start justify-between gap-1">
                <span
                  className={`font-faustina text-lg leading-none sm:text-2xl ${
                    isToday
                      ? 'text-primary-300 font-semibold'
                      : inMonth
                        ? 'text-third-900'
                        : 'text-gray-200'
                  }`}
                >
                  {Number(date.slice(8))}
                </span>
                {canSelect ? (
                  <span className="hidden sm:block">
                    <CheckMark selected={isSelected} />
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
          const cellClass = `rounded-xl sm:rounded-card flex h-full min-h-16 flex-col gap-1 border p-1.5 transition-colors sm:min-h-28 sm:p-2.5 ${
            isSelected
              ? 'border-primary-200 ring-primary-200 bg-white ring-2'
              : state.kind === 'closed'
                ? 'bg-secondary-50 border-black/15'
                : 'border-black/10 bg-white'
          } ${inMonth ? '' : 'opacity-60'}`;
          return (
            <li key={date} className="min-w-0">
              {canSelect ? (
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={label}
                  onClick={() => onToggle(date)}
                  className={`${cellClass} focus-visible:outline-third-200 w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2`}
                >
                  {content}
                </button>
              ) : (
                <Link
                  href={`/admin/reservations?date=${date}`}
                  aria-label={label}
                  className={`${cellClass} hover:border-third-200 focus-visible:outline-third-200 focus-visible:outline-2 focus-visible:outline-offset-2`}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Legend() {
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
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="bg-primary-200 text-on-gold rounded-full px-1.5 text-[0.6875rem] font-semibold"
        >
          2
        </span>
        Rendez-vous à venir
      </li>
    </ul>
  );
}

/** Result of a closure: the bookings that stay, with links. */
export function ClosureResult({ result, onDismiss }) {
  if (result.kind === 'reopen') {
    return (
      <div role="status" className="flex flex-col gap-3">
        <Notice>
          {result.dates.length > 1
            ? `${result.dates.length} dates rouvertes aux réservations.`
            : 'Date rouverte aux réservations.'}
          {result.stillOff.length ? (
            <>
              {' '}
              Sans horaires dans le planning, ces dates restent fermées :{' '}
              {result.stillOff
                .map((date) => formatLocalDate(date, { weekday: undefined }))
                .join(', ')}
              . Modifiez les horaires pour les ouvrir.
            </>
          ) : null}
        </Notice>
        <PillButton variant="text" onClick={onDismiss} className="self-start">
          Fermer ce message
        </PillButton>
      </div>
    );
  }
  return (
    <div
      role="status"
      className="rounded-card flex flex-col gap-4 border border-black/10 bg-white p-5 sm:p-6"
    >
      <p className="font-montserrat text-body font-semibold text-gray-900">
        {result.dates.length > 1
          ? `${result.dates.length} dates fermées aux nouvelles réservations.`
          : 'Date fermée aux nouvelles réservations.'}
      </p>
      {result.bookings.length ? (
        <>
          <p className="font-montserrat text-body text-gray-800">
            Les rendez-vous déjà pris ces jours-là sont conservés : aucun n’a
            été annulé. Vous pouvez les assurer ou contacter les clients
            vous-même.
          </p>
          <ul className="font-montserrat text-body-sm flex flex-col gap-1.5 text-gray-900">
            {result.bookings.map((booking) => (
              <li key={booking.bookingId}>
                <Link
                  href={`/admin/reservations/${booking.bookingId}?date=${booking.date}`}
                  className="hover:text-third-200 underline underline-offset-2"
                >
                  <span className="first-letter:uppercase">
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

  const [selecting, setSelecting] = useState(false);
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

  const go = (nextView, nextAnchor) => {
    const params = new URLSearchParams();
    if (nextView === 'month') params.set('vue', 'mois');
    params.set('date', nextAnchor);
    router.replace(`/admin/calendrier?${params}`, { scroll: false });
  };

  const toggle = (date) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });

  const stopSelecting = () => {
    setSelecting(false);
    setSelected(new Set());
  };

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
      stopSelecting();
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
  const loading =
    days.status === 'loading' ||
    days.status === 'idle' ||
    bookings.status === 'loading' ||
    bookings.status === 'idle';
  const failed =
    days.status === 'error'
      ? days
      : bookings.status === 'error'
        ? bookings
        : null;

  return (
    <div
      className={`flex flex-col gap-6 ${selecting && selected.size ? 'pb-40 sm:pb-28' : ''}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="flex flex-wrap items-center gap-2">
          <PillButton
            variant="text"
            underline={false}
            onClick={() => go(view, shiftAnchor(view, anchor, -1))}
          >
            ← {view === 'month' ? 'Mois précédent' : 'Semaine précédente'}
          </PillButton>
          <PillButton
            variant="text"
            underline={false}
            onClick={() => go(view, today)}
            disabled={
              range.dates.includes(today) &&
              (view === 'week' || today.startsWith(range.month))
            }
            className="disabled:opacity-40"
          >
            Aujourd’hui
          </PillButton>
          <PillButton
            variant="text"
            underline={false}
            onClick={() => go(view, shiftAnchor(view, anchor, 1))}
          >
            {view === 'month' ? 'Mois suivant' : 'Semaine suivante'} →
          </PillButton>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-faustina text-third-900 text-[1.75rem] leading-tight first-letter:uppercase">
          {title}
        </h2>
        {selecting ? (
          <PillButton
            variant="outline"
            tone="dark"
            size="sm"
            onClick={stopSelecting}
          >
            Terminer la sélection
          </PillButton>
        ) : (
          <PillButton
            variant="outline"
            tone="dark"
            size="sm"
            onClick={() => {
              setResult(null);
              setSelecting(true);
            }}
            disabled={loading || Boolean(failed)}
            className="disabled:opacity-60"
          >
            Fermer ou rouvrir des dates
          </PillButton>
        )}
      </div>

      {selecting ? (
        <Notice>
          Touchez les dates à fermer ou à rouvrir (aujourd’hui et après). Les
          rendez-vous déjà pris restent valables dans tous les cas.
        </Notice>
      ) : null}

      {result ? (
        <ClosureResult result={result} onDismiss={() => setResult(null)} />
      ) : null}

      <Legend />

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
        <div role="status" className="flex flex-col gap-3">
          <span className="sr-only">Chargement du calendrier…</span>
          <div
            aria-hidden
            className={`grid gap-2 ${view === 'month' ? 'grid-cols-7' : 'lg:grid-cols-7'}`}
          >
            {range.dates.map((date) => (
              <span
                key={date}
                className={`bg-secondary-50 animate-pulse rounded-xl motion-reduce:animate-none ${view === 'month' ? 'h-16 sm:h-28' : 'h-40'}`}
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
          selecting={selecting}
          selected={selected}
          onToggle={toggle}
        />
      ) : (
        <WeekView
          dates={range.dates}
          daysByDate={daysByDate}
          byDate={byDate}
          today={today}
          selecting={selecting}
          selected={selected}
          onToggle={toggle}
        />
      )}

      {selecting && selected.size ? (
        <div className="px-page fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white/95 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm">
          <div className="max-w-content mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-montserrat text-body text-gray-900">
              {selected.size} date{selected.size > 1 ? 's' : ''} sélectionnée
              {selected.size > 1 ? 's' : ''}
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-body-sm hover:text-third-200 ml-3 text-gray-800 underline underline-offset-2"
              >
                Tout désélectionner
              </button>
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <PillButton
                size="sm"
                onClick={() => {
                  setActionError(null);
                  setDialog('close');
                }}
                disabled={!summary.open.length}
                className="disabled:opacity-50"
              >
                Fermer
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
                Rouvrir
              </PillButton>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={dialog !== null}
        title={
          dialog === 'close'
            ? 'Fermer ces dates aux réservations ?'
            : 'Rouvrir ces dates ?'
        }
        confirmLabel={
          dialog === 'close' ? 'Fermer les dates' : 'Rouvrir les dates'
        }
        pending={pending}
        error={actionError ? bookingErrorMessage(actionError) : null}
        onConfirm={apply}
        onClose={() => setDialog(null)}
      >
        <ul className="bg-secondary-50 mb-4 flex max-h-40 flex-col gap-1 overflow-y-auto rounded-2xl p-4 text-gray-900">
          {targets.map((date) => (
            <li key={date} className="first-letter:uppercase">
              {formatLocalDate(date, { year: true })}
            </li>
          ))}
        </ul>
        {dialog === 'close' ? (
          <>
            Plus aucune nouvelle réservation ni aucun déplacement vers ces
            dates.{' '}
            {keptBookings.length
              ? `${keptBookings.length} rendez-vous déjà pris ${keptBookings.length > 1 ? 'restent valables' : 'reste valable'} : rien n’est annulé, la liste s’affichera ensuite.`
              : 'Aucun rendez-vous à venir n’est prévu ces jours-là.'}
            {summary.closed.length ? (
              <span className="text-body-sm mt-2 block">
                Déjà fermée{summary.closed.length > 1 ? 's' : ''}, non modifiée
                {summary.closed.length > 1 ? 's' : ''} : {summary.closed.length}
                .
              </span>
            ) : null}
          </>
        ) : (
          <>
            Seule la fermeture est retirée : chaque date reprend les horaires de
            son planning.
            {staysOff.length ? (
              <span className="mt-2 block">
                {staysOff.length > 1 ? 'Ces dates n’ont' : 'Cette date n’a'} pas
                d’horaires dans le planning et{' '}
                {staysOff.length > 1 ? 'resteront' : 'restera'} sans réservation
                possible :{' '}
                {staysOff
                  .map((date) => formatLocalDate(date, { weekday: undefined }))
                  .join(', ')}
                .
              </span>
            ) : null}
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}

/**
 * /admin/calendrier — week or month view: working hours in force, closures
 * and bookings (two range requests, no polling). Several dates can be
 * closed for new bookings or reopened at once; existing bookings are never
 * cancelled by a closure and are listed afterwards.
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
