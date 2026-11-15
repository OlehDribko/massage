'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useSearchParams } from 'next/navigation';

import { DAY_PATH } from '@/components/admin/AdminDayBookings';
import AdminShell, { AdminError } from '@/components/admin/AdminShell';
import { Link, useFormat, useRouter, useT } from '@/i18n/client';
import { msg } from '@/i18n/translate';
import { rich } from '@/i18n/rich';
import BlockDialog, { BLOCK_STYLE } from '@/components/admin/BlockDialog';
import { useAccountData } from '@/components/auth/useAccountData';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import { validatorFor } from '@/lib/api/contract';
import {
  agendaItems,
  applyBlockChange,
  blockTimeLabel,
  blocksCountLabel,
  blocksOf,
  layoutLanes,
} from '@/lib/admin/blocks';
import {
  bookingsByDate,
  dayState,
  freeSegments,
  gapsOf,
  hoursLabel,
  isSelectable,
  mergeDays,
  minutesLabel,
  selectionSummary,
  SLOT_MINUTES,
  slotAt,
  stepAnchor,
  studioMinute,
  toMinutes,
  visibleRange,
} from '@/lib/admin/calendar';
import { bookingErrorMessage } from '@/lib/booking/labels';
import { studioToday } from '@/lib/format';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const checkDays = validatorFor('scheduleDays');
const noopSubscribe = () => () => {};
// Phones (below 640 px): three days at once instead of the week.
const COMPACT_QUERY = '(max-width: 39.99rem)';
const subscribeCompact = (onChange) => {
  const query = window.matchMedia(COMPACT_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const isCompact = () => window.matchMedia(COMPACT_QUERY).matches;
// Arrow keys stay native in fields, menus and dialogs.
const KEEPS_ARROWS =
  'input, textarea, select, [contenteditable="true"], dialog, [role="dialog"], [role="listbox"], [role="menu"], [role="slider"]';
// Monday-first short weekday names in the admin's language.
const weekdayShort = (intlLocale) =>
  Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(intlLocale, {
      weekday: 'short',
      timeZone: 'UTC',
    })
      .format(new Date(Date.UTC(2024, 0, 1 + index, 12)))
      .replace('.', '')
  );

// Day states, styled like the rest of the site: white panels (20 px
// radius), a closed day drawn dark with a lock, a day off muted.
const STATE_STYLE = {
  open: {
    label: msg('Ouvert'),
    legend: msg('Jour ouvert'),
    card: 'border-black/10 bg-white',
    swatch: 'border border-black/15 bg-white',
  },
  closed: {
    label: msg('Fermé aux réservations'),
    legend: msg('Fermé aux nouvelles réservations'),
    card: 'border-third-900 bg-[repeating-linear-gradient(135deg,var(--color-secondary-100)_0_10px,var(--color-secondary-50)_10px_20px)]',
    swatch:
      'border border-third-900 bg-[repeating-linear-gradient(135deg,var(--color-secondary-200)_0_3px,var(--color-secondary-50)_3px_6px)]',
  },
  off: {
    label: msg('Jour de repos'),
    legend: msg('Jour de repos (planning)'),
    card: 'border-dashed border-black/15 bg-secondary-50',
    swatch: 'border border-dashed border-black/25 bg-secondary-50',
  },
  unknown: {
    label: '—',
    legend: '—',
    card: 'border-black/10 bg-white',
    swatch: 'border border-black/10',
  },
};

function LockIcon({ className = 'size-3.5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CheckIcon({ className = 'size-3.5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden
      className={className}
    >
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

const monthTitle = (intlLocale, month) =>
  new Intl.DateTimeFormat(intlLocale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${month}-15T12:00:00Z`));

/** Bookings still to come (not cancelled, not finished). */
const activeBookings = (list) =>
  (list ?? []).filter(
    (booking) =>
      booking.status !== 'cancelled' &&
      booking.phase !== 'finished' &&
      booking.phase !== 'cancelled'
  );

/** Round checkbox in the corner of a day (today or later only). */
function DayCheckbox({ date, checked, onToggle }) {
  const t = useT();
  const { formatLocalDate } = useFormat();
  return (
    <label className="relative -m-1.5 flex size-11 shrink-0 cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(date)}
        className="peer absolute inset-0 cursor-pointer opacity-0"
      />
      <span
        aria-hidden
        className={`peer-focus-visible:outline-third-200 flex size-7 items-center justify-center rounded-full border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 ${
          checked
            ? 'border-primary-200 bg-primary-200 text-on-gold'
            : 'hover:border-third-200 border-black/25 bg-white text-transparent'
        }`}
      >
        <CheckIcon />
      </span>
      <span className="sr-only">
        {t('Sélectionner le {date}', {
          date: formatLocalDate(date, { year: true }),
        })}
      </span>
    </label>
  );
}

/** One line: what the day is and, when open, its opening hours. */
function DayStatus({ state }) {
  const t = useT();
  if (state.kind === 'closed') {
    return (
      <p className="font-montserrat bg-third-900 text-cream flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
        <LockIcon />
        {t(STATE_STYLE.closed.label)}
      </p>
    );
  }
  if (state.kind === 'off') {
    return (
      <p className="font-montserrat text-xs font-medium text-gray-800">
        {t(STATE_STYLE.off.label)}
      </p>
    );
  }
  if (state.kind === 'open') {
    return (
      <p className="font-montserrat flex items-center gap-1.5 text-xs text-gray-800">
        <span aria-hidden className="bg-primary-200 size-2 rounded-full" />
        <span>
          <span className="sr-only">{t('Heures d’ouverture : ')}</span>
          {hoursLabel(state.hours)}
        </span>
      </p>
    );
  }
  return null;
}

// Time grid: 48 px per hour, one row per 15 minutes.
const HOUR_PX = 48;
const MINUTE_PX = HOUR_PX / 60;
const hatch =
  'bg-[repeating-linear-gradient(135deg,var(--color-secondary-50)_0_8px,var(--color-secondary-100)_8px_16px)]';
// Quarter-hour lines inside the working hours.
const quarterLines = {
  backgroundImage: `repeating-linear-gradient(to bottom, rgb(0 0 0 / 0.055) 0 1px, transparent 1px ${SLOT_MINUTES * MINUTE_PX}px)`,
};

/** A booking in the grid: opens its detail page. */
function GridBooking({ booking, date, style }) {
  const t = useT();
  const { formatTime } = useFormat();
  const cancelled = booking.status === 'cancelled';
  return (
    <Link
      href={`/admin/reservations/${booking.id}?date=${date}`}
      style={style}
      className={`font-montserrat focus-visible:outline-third-200 absolute flex flex-col overflow-hidden rounded-lg px-1.5 py-1 text-left leading-tight transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-2 ${
        cancelled
          ? 'z-0 border border-dashed border-black/25 bg-white/80 text-gray-800'
          : 'bg-third-900 text-cream z-[2]'
      }`}
    >
      <span className="truncate text-[0.6875rem] font-semibold">
        {formatTime(booking.startsAt)}–{formatTime(booking.endsAt)}
      </span>
      <span
        className={`truncate text-xs font-medium ${cancelled ? 'line-through' : ''}`}
      >
        {booking.client?.name ?? t('Nom non renseigné')}
      </span>
      <span className="sr-only">
        {cancelled ? t(' (annulé)') : ''}
        {t(' — voir le détail')}
      </span>
    </Link>
  );
}

/** A busy time in the grid: opens its form (edit, delete). */
function GridBlock({ block, date, style, onOpen }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={() => onOpen(block)}
      style={style}
      className={`font-montserrat focus-visible:outline-third-200 absolute z-[2] flex flex-col overflow-hidden rounded-lg px-1.5 py-1 text-left leading-tight transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-2 ${BLOCK_STYLE}`}
    >
      <span className="truncate text-[0.6875rem] font-semibold">
        {blockTimeLabel(block, date, t)}
      </span>
      <span className="truncate text-xs font-medium">{block.title}</span>
      <span className="sr-only">
        {t('Indisponible')}
        {t(' — modifier ou supprimer')}
      </span>
    </button>
  );
}

/**
 * One day of the grid: working hours ruled every 15 minutes, time outside
 * them hatched, bookings and busy times at their place (overlapping ones
 * side by side). A click (or tap) on a free part proposes a busy time
 * there; a pointer shows the proposal first. Keyboard users have the
 * « Indisponibilité » button under the grid.
 */
function DayGrid({
  date,
  state,
  items,
  segments,
  from,
  to,
  hover,
  onHover,
  onPick,
  onOpenBlock,
  ignoreClick,
}) {
  const t = useT();
  const top = (minute) => (minute - from) * MINUTE_PX;
  const hours = Array.from(
    { length: (to - from) / 60 + 1 },
    (_, index) => from + index * 60
  );
  const working = state.kind === 'open' ? state.hours : [];
  const gaps = gapsOf(working, from, to);
  const pickAt = (event, [a]) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return slotAt(a + (event.clientY - rect.top) / MINUTE_PX, segments);
  };

  return (
    <div className="relative" style={{ height: (to - from) * MINUTE_PX }}>
      {working.map(({ start, end }) => {
        const a = toMinutes(start);
        const b = toMinutes(end);
        if (a === null || b === null || b <= from) return null;
        return (
          <div
            key={start}
            aria-hidden
            className="absolute inset-x-0"
            style={{
              ...quarterLines,
              backgroundPositionY: `${-((a - from) % SLOT_MINUTES) * MINUTE_PX}px`,
              top: top(Math.max(a, from)),
              height: (Math.min(b, to) - Math.max(a, from)) * MINUTE_PX,
            }}
          />
        );
      })}
      {gaps.map(([a, b]) => (
        <div
          key={a}
          aria-hidden
          className={`absolute inset-x-0 ${hatch}`}
          style={{ top: top(a), height: (b - a) * MINUTE_PX }}
        />
      ))}
      {hours.map((minute) => (
        <span
          key={minute}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-[1] border-t border-black/10"
          style={{ top: top(minute) }}
        >
          <span className="font-montserrat absolute top-0.5 left-0.5 text-[0.625rem] leading-none text-gray-800/80">
            {minutesLabel(minute)}
          </span>
        </span>
      ))}
      {segments.map((segment) => (
        <div
          key={segment[0]}
          aria-hidden
          onClick={(event) => {
            if (ignoreClick()) return;
            const slot = pickAt(event, segment);
            if (slot) onPick(date, slot);
          }}
          onPointerMove={(event) => {
            if (event.pointerType !== 'mouse') return;
            const slot = pickAt(event, segment);
            onHover(slot ? { date, ...slot } : null);
          }}
          onPointerLeave={() => onHover(null)}
          className="absolute inset-x-0 cursor-pointer"
          style={{
            top: top(segment[0]),
            height: (segment[1] - segment[0]) * MINUTE_PX,
          }}
        />
      ))}
      {hover?.date === date ? (
        <div
          aria-hidden
          className="border-third-200 bg-primary-50/70 font-montserrat text-third-900 pointer-events-none absolute inset-x-0.5 z-[1] overflow-hidden rounded-lg border border-dashed px-1.5 py-0.5 text-[0.6875rem] leading-tight font-semibold"
          style={{
            top: top(hover.start),
            height: (hover.end - hover.start) * MINUTE_PX,
          }}
        >
          + {minutesLabel(hover.start)}–{minutesLabel(hover.end)}
        </div>
      ) : null}
      {layoutLanes(items).map(({ kind, item, start, end, lane, lanes }) => {
        const style = {
          top: top(start) + 1,
          height: Math.max((end - start) * MINUTE_PX - 2, 22),
          left: `calc(2px + (100% - 4px) * ${lane / lanes})`,
          width: `calc((100% - 4px) / ${lanes} - ${lanes > 1 ? 2 : 0}px)`,
        };
        return kind === 'block' ? (
          <GridBlock
            key={`block-${item.id}`}
            block={item}
            date={date}
            style={style}
            onOpen={onOpenBlock}
          />
        ) : (
          <GridBooking
            key={`booking-${item.id}`}
            booking={item}
            date={date}
            style={style}
          />
        );
      })}
      {state.kind !== 'open' && !items.length ? (
        <p className="font-montserrat pointer-events-none absolute inset-x-0 top-8 z-[1] px-2 text-center text-xs text-gray-800">
          {state.kind === 'closed'
            ? t('Fermé')
            : state.kind === 'off'
              ? t('Repos')
              : ''}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Week (main view): one column per day, Monday → Sunday, each with its
 * time grid. All 7 side by side from 1024 px; between 640 and 1024 px the
 * row scrolls sideways. On a phone (`compact`): three consecutive days,
 * moved one day by the buttons or a horizontal swipe (vertical scrolling
 * stays native; a swipe never counts as a tap).
 */
function WeekView({
  dates,
  daysByDate,
  byDate,
  timeZone,
  today,
  compact,
  selected,
  onToggle,
  onOpenBlock,
  onAddBlock,
  onShift,
}) {
  const t = useT();
  const { formatLocalDate, formatMonthShort, formatWeekday } = useFormat();
  const scrollerRef = useRef(null);
  const [hover, setHover] = useState(null);
  const touchRef = useRef(null);
  const ignoreUntilRef = useRef(0);

  // When the row scrolls, start it at today's column.
  const datesKey = dates.join();
  useEffect(() => {
    const scroller = scrollerRef.current;
    const column = scroller?.querySelector('[data-today="true"]');
    if (scroller && column && scroller.scrollWidth > scroller.clientWidth) {
      scroller.scrollLeft = column.offsetLeft - scroller.offsetLeft;
    }
  }, [datesKey]);

  const nowMinute = today ? studioMinute(new Date(), timeZone) : 0;
  const columns = dates.map((date) => {
    const day = daysByDate.get(date);
    const state = dayState(day);
    const items = agendaItems(byDate.get(date), blocksOf(day), date, timeZone);
    const selectable = isSelectable(date, today);
    const segments =
      selectable && state.kind === 'open'
        ? freeSegments(state.hours, items, {
            notBefore: date === today ? nowMinute : 0,
          })
        : [];
    return { date, state, items, selectable, segments };
  });
  // One time scale for all the columns: 09:00–20:00 at least, widened to
  // the working hours and events of the days on screen.
  const first = Math.min(
    9 * 60,
    ...columns.flatMap(({ state, items }) => [
      ...state.hours.map((hour) => toMinutes(hour.start) ?? 9 * 60),
      ...items.map((item) => item.start),
    ])
  );
  const last = Math.max(
    20 * 60,
    ...columns.flatMap(({ state, items }) => [
      ...state.hours.map((hour) => toMinutes(hour.end) ?? 20 * 60),
      ...items.map((item) => item.end),
    ])
  );
  const from = Math.floor(first / 60) * 60;
  const to = Math.min(24 * 60, Math.ceil(last / 60) * 60);

  const onTouchStart = (event) => {
    const touch = event.touches[0];
    touchRef.current = { x: touch.clientX, y: touch.clientY };
  };
  const onTouchMove = (event) => {
    const start = touchRef.current;
    const touch = event.touches[0];
    // Any real movement: the gesture is a scroll or a swipe, not a tap.
    if (
      start &&
      Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > 10
    ) {
      ignoreUntilRef.current = Date.now() + 600;
    }
  };
  const onTouchEnd = (event) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start || !compact) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      ignoreUntilRef.current = Date.now() + 600;
      onShift(dx < 0 ? 1 : -1);
    }
  };

  return (
    <div
      ref={scrollerRef}
      tabIndex={0}
      aria-label={t(
        'Jours affichés — flèches gauche et droite pour changer de période'
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`focus-visible:outline-third-200 relative rounded-[1.25rem] focus-visible:outline-2 focus-visible:outline-offset-4 ${
        compact
          ? 'touch-pan-y'
          : 'sm:-mx-section-x-tablet sm:px-section-x-tablet sm:scroll-px-section-x-tablet snap-x snap-mandatory overflow-x-auto pb-3 lg:mx-0 lg:snap-none lg:overflow-visible lg:px-0 lg:pb-0'
      }`}
    >
      <ol
        className={
          compact
            ? 'grid grid-cols-3 gap-1.5'
            : 'grid w-max grid-cols-[repeat(7,minmax(11rem,1fr))] gap-2.5 lg:w-full lg:grid-cols-7 lg:gap-2'
        }
      >
        {columns.map(({ date, state, items, selectable, segments }) => {
          const isToday = date === today;
          const isSelected = selected.has(date);
          return (
            <li
              key={date}
              data-today={isToday || undefined}
              className={`flex min-w-0 snap-start flex-col gap-2 rounded-2xl border p-1.5 transition-shadow sm:gap-3 sm:rounded-[1.25rem] sm:p-2.5 ${STATE_STYLE[state.kind].card} ${
                isSelected
                  ? 'ring-primary-200 ring-2 ring-offset-2'
                  : isToday && state.kind !== 'closed'
                    ? 'border-primary-200'
                    : ''
              } ${selectable ? '' : 'opacity-70'}`}
            >
              <div className="flex items-start justify-between gap-1 px-1 pt-1">
                <h3 className="min-w-0">
                  <Link
                    href={`${DAY_PATH}?date=${date}`}
                    className="group focus-visible:outline-third-200 flex flex-col rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span
                      className={`font-montserrat truncate text-[0.6875rem] tracking-[0.1em] uppercase ${isToday ? 'text-primary-300 font-semibold' : 'text-gray-800'}`}
                      aria-hidden
                    >
                      {isToday ? t('Aujourd’hui') : formatWeekday(date)}
                    </span>
                    <span aria-hidden className="flex items-baseline gap-1">
                      <span
                        className={`font-faustina text-[1.75rem] leading-none ${isToday ? 'text-primary-300' : 'text-third-900'}`}
                      >
                        {Number(date.slice(8))}
                      </span>
                      <span className="font-montserrat text-body-sm group-hover:text-third-200 truncate text-gray-800 transition-colors">
                        {formatMonthShort(date)}
                      </span>
                    </span>
                    <span className="sr-only">
                      {formatLocalDate(date, { year: true })}
                      {isToday ? t(' (aujourd’hui)') : ''}
                      {t(' — voir la journée')}
                    </span>
                  </Link>
                </h3>
                {selectable ? (
                  <DayCheckbox
                    date={date}
                    checked={isSelected}
                    onToggle={onToggle}
                  />
                ) : null}
              </div>

              <div className="px-1">
                <DayStatus state={state} />
              </div>

              <DayGrid
                date={date}
                state={state}
                items={items}
                segments={segments}
                from={from}
                to={to}
                hover={hover}
                onHover={setHover}
                onPick={(day, slot) =>
                  onAddBlock(day, {
                    start: minutesLabel(slot.start),
                    end: minutesLabel(slot.end),
                  })
                }
                onOpenBlock={onOpenBlock}
                ignoreClick={() => Date.now() < ignoreUntilRef.current}
              />

              {selectable ? (
                <button
                  type="button"
                  onClick={() => onAddBlock(date)}
                  className="font-montserrat hover:border-third-200 hover:text-third-900 focus-visible:outline-third-200 flex min-h-11 items-center justify-center gap-1 rounded-xl border border-dashed border-black/20 px-1 text-xs text-gray-800 transition-colors focus-visible:outline-2"
                >
                  <span aria-hidden className="text-lg leading-none">
                    +
                  </span>
                  <span className={compact ? 'sr-only' : ''}>
                    {t('Indisponibilité')}
                  </span>
                  <span className="sr-only">
                    {' '}
                    {t('le {date}', {
                      date: formatLocalDate(date, { year: true }),
                    })}
                  </span>
                </button>
              ) : null}
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
  selecting,
  onToggle,
}) {
  const t = useT();
  const { formatLocalDate, intlLocale } = useFormat();
  return (
    <div className="flex flex-col gap-2">
      <div aria-hidden className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
        {weekdayShort(intlLocale).map((label) => (
          <span
            key={label}
            className="font-montserrat text-center text-[0.6875rem] tracking-[0.12em] text-gray-800 uppercase"
          >
            {label}
          </span>
        ))}
      </div>
      <ol className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
        {dates.map((date) => {
          const inMonth = date.startsWith(month);
          const state = dayState(daysByDate.get(date));
          const active = activeBookings(byDate.get(date)).length;
          const busy = blocksOf(daysByDate.get(date)).length;
          const isToday = date === today;
          const selectable = isSelectable(date, today);
          const isSelected = selected.has(date);
          const label = `${formatLocalDate(date, { year: true })} — ${t(STATE_STYLE[state.kind].legend)}${
            state.kind === 'open' ? ` (${hoursLabel(state.hours)})` : ''
          } — ${active ? t('{n} rendez-vous|{n} rendez-vous', { n: active }) : t('aucun rendez-vous')}${busy ? ` — ${blocksCountLabel(busy, t)}` : ''}`;
          const cellClass = `relative flex aspect-square w-full flex-col justify-between rounded-2xl border p-1.5 text-left sm:aspect-auto sm:min-h-28 sm:rounded-panel sm:p-3 ${STATE_STYLE[state.kind].card} ${
            isSelected
              ? 'ring-primary-200 ring-2 ring-offset-1 sm:ring-offset-2'
              : isToday && state.kind !== 'closed'
                ? 'border-primary-200'
                : ''
          } ${inMonth ? '' : 'opacity-40'}`;
          const content = (
            <>
              <span className="flex items-start justify-between gap-1">
                <span
                  className={`font-faustina text-lg leading-none sm:text-[1.75rem] ${
                    isToday
                      ? 'text-primary-300 font-semibold'
                      : 'text-third-900'
                  }`}
                >
                  {Number(date.slice(8))}
                </span>
                {isSelected ? (
                  <span
                    aria-hidden
                    className="bg-primary-200 text-on-gold absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full sm:static sm:size-6"
                  >
                    <CheckIcon className="size-3 sm:size-3.5" />
                  </span>
                ) : state.kind === 'closed' ? (
                  <span
                    aria-hidden
                    className="bg-third-900 text-cream flex size-5 items-center justify-center rounded-full sm:size-6"
                  >
                    <LockIcon className="size-3 sm:size-3.5" />
                  </span>
                ) : null}
              </span>
              <span className="flex items-end justify-between gap-1">
                <span className="font-montserrat hidden truncate text-[0.6875rem] text-gray-800 sm:inline">
                  {state.kind === 'open'
                    ? hoursLabel(state.hours)
                    : state.kind === 'closed'
                      ? t('Fermé')
                      : state.kind === 'off'
                        ? t('Repos')
                        : ''}
                </span>
                <span className="ml-auto flex items-center gap-1">
                  {busy ? (
                    <span
                      title={blocksCountLabel(busy, t)}
                      className={`font-montserrat flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6875rem] font-semibold sm:h-6 sm:min-w-6 ${BLOCK_STYLE}`}
                    >
                      {busy}
                    </span>
                  ) : null}
                  {active ? (
                    <span className="font-montserrat bg-third-900 text-cream flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.6875rem] font-semibold sm:h-6 sm:min-w-6">
                      {active}
                    </span>
                  ) : null}
                </span>
              </span>
            </>
          );
          if (!selecting) {
            return (
              <li key={date} className="min-w-0">
                <Link
                  href={`${DAY_PATH}?date=${date}`}
                  aria-label={`${label}${t(' — voir la journée')}`}
                  className={`${cellClass} hover:border-third-200 focus-visible:outline-third-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2`}
                >
                  {content}
                </Link>
              </li>
            );
          }
          return (
            <li key={date} className="min-w-0">
              {selectable ? (
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={label}
                  onClick={() => onToggle(date)}
                  className={`${cellClass} hover:border-third-200 focus-visible:outline-third-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2`}
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
  const t = useT();
  return (
    <ul className="font-montserrat flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-800">
      {['open', 'closed', 'off'].map((kind) => (
        <li key={kind} className="flex items-center gap-2">
          <span
            aria-hidden
            className={`size-4 rounded-md ${STATE_STYLE[kind].swatch}`}
          />
          {t(STATE_STYLE[kind].legend)}
        </li>
      ))}
      {view === 'month' ? (
        <>
          <li className="flex items-center gap-2">
            <span
              aria-hidden
              className="bg-third-900 text-cream flex size-5 items-center justify-center rounded-full text-[0.6875rem] font-semibold"
            >
              2
            </span>
            {t('Rendez-vous à venir')}
          </li>
          <li className="flex items-center gap-2">
            <span
              aria-hidden
              className={`flex size-5 items-center justify-center rounded-full text-[0.6875rem] font-semibold ${BLOCK_STYLE}`}
            >
              1
            </span>
            {t('Indisponibilités')}
          </li>
        </>
      ) : (
        <li className="flex items-center gap-2">
          <span aria-hidden className={`size-4 rounded-md ${BLOCK_STYLE}`} />
          {t('Indisponibilité (temps pris ailleurs)')}
        </li>
      )}
    </ul>
  );
}

/** What the last bulk action did, from the server answer. */
function ActionResult({ result, onDismiss }) {
  const t = useT();
  const { formatDateTime, formatLocalDate } = useFormat();
  return (
    <div
      role="status"
      className="rounded-panel flex flex-col gap-4 border border-black/10 bg-white p-5 sm:p-6"
    >
      {result.kind === 'reopen' ? (
        <>
          <p className="font-montserrat text-body font-semibold text-gray-900">
            {t(
              'Fermeture retirée pour {n} date.|Fermeture retirée pour {n} dates.',
              {
                n: result.dates.length,
              }
            )}
          </p>
          <p className="font-montserrat text-body text-gray-800">
            {t('Chaque date reprend son planning habituel.')}
            {result.stillOff.length
              ? ` ${t(
                  'Jour de repos dans le planning, cette date reste fermée : {dates}. Pour y travailler, modifiez les horaires.|Jour de repos dans le planning, ces dates restent fermées : {dates}. Pour y travailler, modifiez les horaires.',
                  {
                    n: result.stillOff.length,
                    dates: result.stillOff
                      .map((date) =>
                        formatLocalDate(date, { weekday: undefined })
                      )
                      .join(', '),
                  }
                )}`
              : ''}
          </p>
        </>
      ) : (
        <>
          <p className="font-montserrat text-body font-semibold text-gray-900">
            {t(
              '{n} date fermée aux nouvelles réservations.|{n} dates fermées aux nouvelles réservations.',
              { n: result.dates.length }
            )}
          </p>
          {result.bookings.length ? (
            <>
              <p className="font-montserrat text-body text-gray-800">
                {t(
                  'Ces rendez-vous sont conservés, aucun n’a été annulé. Vous pouvez les assurer ou contacter les clients vous-même.'
                )}
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
              {t('Aucun rendez-vous n’était prévu ces jours-là.')}
            </p>
          )}
        </>
      )}
      <PillButton variant="text" onClick={onDismiss} className="self-start">
        {t('Fermer ce message')}
      </PillButton>
    </div>
  );
}

function CalendarContent({ controller, enabled }) {
  const t = useT();
  const { formatLocalDate, intlLocale } = useFormat();
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = useSyncExternalStore(noopSubscribe, studioToday, () => null);
  const view = searchParams.get('vue') === 'mois' ? 'month' : 'week';
  const asked = searchParams.get('date');
  const anchor = asked && DATE.test(asked) ? asked : today;
  const compact = useSyncExternalStore(
    subscribeCompact,
    isCompact,
    () => false
  );

  const [selected, setSelected] = useState(() => new Set());
  // Month: a tap opens the day; this mode makes taps select dates instead.
  const [selecting, setSelecting] = useState(false);
  const [dialog, setDialog] = useState(null); // 'close' | 'reopen'
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [result, setResult] = useState(null);
  const busyRef = useRef(false);
  const [editor, setEditor] = useState(null); // { date } | { block }
  const [blockNotice, setBlockNotice] = useState(null);
  const addButtonRef = useRef(null);

  // One range for the title, the columns and both requests.
  const range = anchor ? visibleRange(view, anchor, compact) : null;
  const query = range ? `from=${range.from}&to=${range.to}` : null;
  const days = useAccountData(
    query ? `/api/admin/schedule/days?${query}` : null,
    { enabled, validate: checkDays }
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
    if (nextView !== view) setSelecting(false);
    router.replace(`/admin/calendrier?${params}`, { scroll: false });
  };

  // Previous / next page: a week (a day on a phone) or a month.
  const step = (delta) => go(view, stepAnchor(view, anchor, delta, compact));

  // ← / → anywhere in the calendar change the page, except where the
  // arrows already mean something (fields, open menus, dialogs).
  const onKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (event.defaultPrevented || event.altKey || event.ctrlKey) return;
    if (event.metaKey || event.shiftKey) return;
    if (event.target.closest?.(KEEPS_ARROWS)) return;
    event.preventDefault();
    step(event.key === 'ArrowRight' ? 1 : -1);
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
        {t('Chargement…')}
      </p>
    );
  }

  const addDate = () => {
    const picked = [...selected].sort();
    if (picked.length === 1) return picked[0];
    if (today && range.dates.includes(today)) return today;
    return range.dates.find((date) => isSelectable(date, today)) ?? today;
  };

  // Blocks are listed by /days: update the loaded days at once (old and new
  // date of a moved block), then reload them from the server.
  const blockChanged = ({ removedId, block, action }) => {
    if (days.data) {
      days.replace({
        ...days.data,
        days: applyBlockChange(days.data.days, { removedId, block }),
      });
    }
    days.reload();
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
      ? monthTitle(intlLocale, range.month)
      : t('Du {from} au {to}', {
          from: formatLocalDate(range.from, { weekday: undefined }),
          to: formatLocalDate(range.to, { weekday: undefined, year: true }),
        });
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
      onKeyDown={onKeyDown}
      className={`flex flex-col gap-6 ${selected.size ? 'pb-56 sm:pb-36 lg:pb-28' : ''}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-montserrat text-label-sm font-medium text-gray-800 uppercase">
            {view === 'month'
              ? t('Vue du mois')
              : compact
                ? t('Jours affichés')
                : t('Semaine affichée')}
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
          aria-label={t('Affichage')}
          className="font-montserrat text-label flex w-fit rounded-full border border-black/15 bg-white p-1 uppercase"
        >
          {[
            ['week', t('Semaine')],
            ['month', t('Mois')],
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
        aria-label={
          view === 'month'
            ? t('Changer de mois')
            : compact
              ? t('Changer de jours')
              : t('Changer de semaine')
        }
        className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-full border border-black/10 bg-white p-1"
      >
        <button
          type="button"
          onClick={() => step(-1)}
          className={`${navButton} justify-self-start`}
        >
          <span aria-hidden>←</span>
          <span aria-hidden className="sm:hidden">
            {t('Préc.')}
          </span>
          <span className="sr-only sm:not-sr-only">
            {view === 'month'
              ? t('Mois précédent')
              : compact
                ? t('Jour précédent')
                : t('Semaine précédente')}
          </span>
        </button>
        <button
          type="button"
          onClick={() => go(view, today)}
          disabled={!today || showsToday}
          className="font-montserrat text-label focus-visible:outline-third-200 bg-third-900 text-cream min-h-11 rounded-full px-5 font-medium uppercase focus-visible:outline-2 disabled:bg-transparent disabled:text-gray-800"
        >
          {t('Aujourd’hui')}
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          className={`${navButton} justify-self-end`}
        >
          <span aria-hidden className="sm:hidden">
            {t('Suiv.')}
          </span>
          <span className="sr-only sm:not-sr-only">
            {view === 'month'
              ? t('Mois suivant')
              : compact
                ? t('Jour suivant')
                : t('Semaine suivante')}
          </span>
          <span aria-hidden>→</span>
        </button>
      </nav>

      <div className="flex flex-col gap-2">
        <Legend view={view} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-montserrat text-body-sm text-gray-800">
            {view === 'month'
              ? selecting
                ? t(
                    'Touchez les dates (à partir d’aujourd’hui) pour les sélectionner, puis choisissez l’action en bas.'
                  )
                : t(
                    'Touchez une date pour ouvrir l’agenda du jour. Pour fermer ou rouvrir des dates, passez en sélection.'
                  )
              : t(
                  'Touchez un créneau libre pour ajouter une indisponibilité, une date pour ouvrir l’agenda du jour. Cochez des jours pour les fermer aux nouvelles réservations ou retirer leur fermeture.'
                )}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              ref={addButtonRef}
              type="button"
              onClick={() => {
                setBlockNotice(null);
                setEditor({ date: addDate() });
              }}
              disabled={!today}
              className="font-montserrat text-body-sm hover:border-third-200 focus-visible:outline-third-200 min-h-11 shrink-0 rounded-full border border-black/20 bg-white px-5 font-medium text-gray-900 transition-colors focus-visible:outline-2 disabled:opacity-50"
            >
              <span aria-hidden>+ </span>
              {t('Ajouter une indisponibilité')}
            </button>
            {view === 'month' ? (
              <button
                type="button"
                aria-pressed={selecting}
                onClick={() => {
                  setSelecting((value) => !value);
                  setSelected(new Set());
                }}
                className={`font-montserrat text-body-sm focus-visible:outline-third-200 min-h-11 shrink-0 rounded-full border px-5 font-medium transition-colors focus-visible:outline-2 ${
                  selecting
                    ? 'border-third-900 bg-third-900 text-cream'
                    : 'hover:border-third-200 border-black/20 bg-white text-gray-900'
                }`}
              >
                {selecting
                  ? t('Terminer la sélection')
                  : t('Sélectionner des dates')}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {result ? (
        <ActionResult result={result} onDismiss={() => setResult(null)} />
      ) : null}

      <div role="status">
        {blockNotice ? <Notice>{blockNotice}</Notice> : null}
      </div>

      {failed ? (
        <AdminError
          error={failed.error}
          onRetry={() => {
            days.reload();
            bookings.reload();
          }}
          message={bookingErrorMessage(failed.error, t)}
        />
      ) : loading ? (
        <div role="status">
          <span className="sr-only">{t('Chargement du calendrier…')}</span>
          <div
            aria-hidden
            className={`grid gap-2 overflow-hidden ${view === 'month' ? 'grid-cols-7' : compact ? 'grid-cols-3' : 'grid-cols-[repeat(7,minmax(11rem,1fr))] lg:grid-cols-7'}`}
          >
            {range.dates.map((date) => (
              <span
                key={date}
                className={`bg-secondary-50 animate-pulse rounded-xl motion-reduce:animate-none ${view === 'month' ? 'h-16 sm:h-28' : 'h-[36rem]'}`}
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
          selecting={selecting}
          onToggle={toggle}
        />
      ) : (
        <WeekView
          dates={range.dates}
          daysByDate={daysByDate}
          byDate={byDate}
          timeZone={bookings.data?.timeZone}
          today={today}
          compact={compact}
          selected={selected}
          onToggle={toggle}
          onShift={step}
          onOpenBlock={(block) => {
            setBlockNotice(null);
            setEditor({ block });
          }}
          onAddBlock={(date, times) => {
            setBlockNotice(null);
            setEditor({ date, ...times });
          }}
        />
      )}

      {selected.size ? (
        <div
          role="region"
          aria-label={t('Dates sélectionnées')}
          className="px-page fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white/95 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:py-4"
        >
          <div className="max-w-content mx-auto flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
            <div className="flex items-center justify-between gap-4 lg:justify-start">
              <p className="font-montserrat text-body font-medium whitespace-nowrap text-gray-900">
                {t('{n} date sélectionnée|{n} dates sélectionnées', {
                  n: selected.size,
                })}
              </p>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="font-montserrat text-body-sm hover:text-third-200 focus-visible:outline-third-200 min-h-11 text-gray-800 underline underline-offset-4 focus-visible:outline-2"
              >
                {t('Réinitialiser')}
                <span className="hidden sm:inline">{t(' la sélection')}</span>
              </button>
            </div>
            <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
              <PillButton
                size="sm"
                onClick={() => {
                  setActionError(null);
                  setDialog('close');
                }}
                disabled={!summary.open.length}
                className="disabled:opacity-50"
              >
                {t('Fermer aux nouvelles réservations')}
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
                {t('Retirer la fermeture')}
              </PillButton>
            </div>
          </div>
        </div>
      ) : null}

      {editor ? (
        <BlockDialog
          key={editor.block?.id ?? `new-${editor.date}-${editor.start ?? ''}`}
          editor={editor}
          today={today}
          controller={controller}
          fallbackFocus={addButtonRef}
          onClose={() => setEditor(null)}
          onChanged={blockChanged}
          onGone={days.reload}
        />
      ) : null}

      <ConfirmDialog
        open={dialog !== null}
        title={
          dialog === 'close'
            ? t('Fermer aux nouvelles réservations ?')
            : t('Retirer la fermeture ?')
        }
        confirmLabel={
          dialog === 'close' ? t('Fermer ces dates') : t('Retirer la fermeture')
        }
        pending={pending}
        error={actionError ? bookingErrorMessage(actionError, t) : null}
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
              {t(
                'Plus aucune nouvelle réservation ni aucun déplacement vers cette date.|Plus aucune nouvelle réservation ni aucun déplacement vers ces dates.',
                { n: targets.length }
              )}
            </span>
            <span className="mt-2 block font-medium text-gray-900">
              {keptBookings.length
                ? t(
                    'Les rendez-vous existants ne sont pas annulés ({n} à venir) : leur liste s’affichera ensuite.',
                    { n: keptBookings.length }
                  )
                : t('Les rendez-vous existants ne sont pas annulés.')}
            </span>
          </>
        ) : (
          <>
            <span className="block">
              {t(
                'Seule la fermeture est retirée : chaque date reprend son planning habituel.'
              )}
            </span>
            {staysOff.length ? (
              <span className="mt-2 block">
                {t(
                  'Jour de repos dans le planning, cette date restera fermée : {dates}.|Jour de repos dans le planning, ces dates resteront fermées : {dates}.',
                  {
                    n: staysOff.length,
                    dates: staysOff
                      .map((date) =>
                        formatLocalDate(date, { weekday: undefined })
                      )
                      .join(', '),
                  }
                )}
              </span>
            ) : null}
          </>
        )}
        {skipped.length ? (
          <span className="text-body-sm mt-2 block">
            {dialog === 'close'
              ? t(
                  '{n} date déjà fermée, inchangée.|{n} dates déjà fermées, inchangées.',
                  { n: skipped.length }
                )
              : t(
                  '{n} date non fermée, inchangée.|{n} dates non fermées, inchangées.',
                  { n: skipped.length }
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
  const t = useT();
  return (
    <AdminShell
      title={
        <>
          {rich(t('Calendrier du <accent>cabinet</accent>'), {
            accent: (chunks) => (
              <span className="heading-accent">{chunks}</span>
            ),
          })}
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
