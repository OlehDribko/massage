'use client';

import { useEffect, useId, useState, useSyncExternalStore } from 'react';

import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import { fetchAvailability } from '@/lib/api/public';
import { bookingErrorMessage, errorReference } from '@/lib/booking/labels';
import { WEEK, groupSlotsByPeriod, pickDay, weekOf } from '@/lib/booking/slots';
import { useFormat, useT } from '@/i18n/client';
import { addDays, studioToday } from '@/lib/format';

const noopSubscribe = () => () => {};

function ChevronIcon({ direction }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
      className="size-[18px]"
    >
      <path d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
  );
}

const roundButton =
  'flex size-11 items-center justify-center rounded-full border border-black/20 bg-white text-third-900 transition-colors hover:border-third-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-third-200 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none';

/**
 * Free start times of a service, one week at a time, from the public
 * availability API (studio time, horizon handled by the server: today →
 * today + 45). Only free moments are returned; nothing about other clients.
 *
 * A strip of 7 days (with the number of free starts), then the starts of
 * the chosen day grouped by part of the day.
 *
 * `value` is the selected slot's `startsAt`; `exclude` hides one start (the
 * current time of a booking being moved); `refreshKey` reloads the week
 * (e.g. after "slot just taken").
 */
export default function SlotPicker({
  serviceId,
  value,
  onChange,
  exclude,
  refreshKey = 0,
  title,
}) {
  const [weekChoice, setWeekChoice] = useState(null);
  const [dayChoice, setDayChoice] = useState(null);
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState({ key: null });
  const t = useT();
  const { formatLocalDate, formatTime, formatWeekday } = useFormat();
  const headingId = useId();
  // "Today" in Paris exists only in the browser (null during server render).
  const today = useSyncExternalStore(noopSubscribe, studioToday, () => null);

  // A restored choice (?creneau=) opens on its own week.
  const week = weekChoice ?? weekOf(value, today);
  const from = today ? addDays(today, week * WEEK) : null;
  const to = from ? addDays(from, WEEK - 1) : null;
  const key = from ? `${serviceId}:${from}:${refreshKey}:${reload}` : null;

  useEffect(() => {
    if (!key) return undefined;
    const abort = new AbortController();
    let current = true;
    fetchAvailability(serviceId, { from, to }, { signal: abort.signal })
      .then((data) => {
        if (current) setResult({ key, status: 'ready', data });
      })
      .catch((error) => {
        if (current && error?.name !== 'AbortError') {
          setResult({ key, status: 'error', error });
        }
      });
    return () => {
      current = false;
      abort.abort();
    };
  }, [serviceId, from, to, key]);

  // Until the answer for the current week arrives, show loading.
  const view = result.key === key ? result : { status: 'loading' };

  const days =
    view.status === 'ready'
      ? view.data.days.map((day) => ({
          ...day,
          slots: day.slots.filter((slot) => slot.startsAt !== exclude),
        }))
      : [];
  const hasSlots = days.some((day) => day.slots.length);
  // The server clips the range at the horizon: a shorter answer is the end.
  const lastWeek = view.status === 'ready' && to !== null && view.data.to < to;
  const activeDate = pickDay(days, {
    selectedStart: value,
    current: dayChoice,
  });
  const activeDay = days.find((day) => day.date === activeDate);
  const groups = activeDay
    ? groupSlotsByPeriod(activeDay.slots, view.data.timeZone)
    : [];
  const nextOpen = activeDay
    ? days.find((day) => day.date > activeDay.date && day.slots.length)
    : null;

  const changeWeek = (delta) => {
    setWeekChoice(week + delta);
    setDayChoice(null);
  };

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-panel flex flex-col gap-6 border border-black/10 bg-white p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2
            id={headingId}
            className="font-montserrat text-body-lg font-semibold text-gray-900"
          >
            {title ?? t('Choisissez un horaire')}
          </h2>
          {from ? (
            <p className="font-montserrat text-body-sm text-gray-800">
              {t('Du {from} au {to}', {
                from: formatLocalDate(from, { weekday: undefined }),
                to: formatLocalDate(to, { weekday: undefined, year: true }),
              })}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t('Semaine précédente')}
            onClick={() => changeWeek(-1)}
            disabled={week === 0 || view.status === 'loading'}
            className={roundButton}
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            aria-label={t('Semaine suivante')}
            onClick={() => changeWeek(1)}
            disabled={lastWeek || view.status === 'loading'}
            className={roundButton}
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>

      {view.status === 'loading' ? (
        <div className="flex flex-col gap-6" role="status">
          <span className="sr-only">{t('Chargement des disponibilités…')}</span>
          <div aria-hidden className="grid grid-cols-7 gap-2">
            {Array.from({ length: WEEK }, (_, index) => (
              <span
                key={index}
                className="bg-secondary-50 h-[5.5rem] animate-pulse rounded-2xl motion-reduce:animate-none"
              />
            ))}
          </div>
          <div
            aria-hidden
            className="grid grid-cols-4 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(5.25rem,1fr))]"
          >
            {Array.from({ length: 8 }, (_, index) => (
              <span
                key={index}
                className="bg-secondary-50 h-11 animate-pulse rounded-xl motion-reduce:animate-none"
              />
            ))}
          </div>
        </div>
      ) : null}

      {view.status === 'error' ? (
        <div className="flex flex-col gap-3">
          <Notice tone="error">
            {bookingErrorMessage(view.error, t)}
            {errorReference(view.error, t) ? (
              <span className="mt-1 block text-xs">
                {errorReference(view.error, t)}
              </span>
            ) : null}
          </Notice>
          <PillButton
            variant="outline"
            tone="dark"
            size="sm"
            onClick={() => setReload((count) => count + 1)}
            className="self-start"
          >
            {t('Réessayer')}
          </PillButton>
        </div>
      ) : null}

      {view.status === 'ready' ? (
        <>
          <div
            role="group"
            aria-label={t('Jour')}
            className="-mx-5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-7 sm:overflow-visible sm:px-0 sm:pb-0"
          >
            {days.map((day) => {
              const selected = day.date === activeDate;
              const count = day.slots.length;
              return (
                <button
                  key={day.date}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${formatLocalDate(day.date)} — ${
                    count
                      ? t('{n} horaire|{n} horaires', { n: count })
                      : t('aucun horaire')
                  }`}
                  onClick={() => setDayChoice(day.date)}
                  className={`font-montserrat focus-visible:outline-third-200 flex min-h-[5.5rem] min-w-14 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none sm:min-w-0 ${
                    selected
                      ? 'border-third-900 bg-third-900 text-cream'
                      : count
                        ? 'hover:border-third-200 border-black/15 bg-white text-gray-900'
                        : 'bg-secondary-50 border-dashed border-gray-100 text-gray-800'
                  }`}
                >
                  <span
                    aria-hidden
                    className="text-xs tracking-wider uppercase"
                  >
                    {formatWeekday(day.date, 'short')}
                  </span>
                  <span
                    aria-hidden
                    className="font-faustina text-[1.625rem] leading-none"
                  >
                    {Number(day.date.slice(8))}
                  </span>
                  <span
                    aria-hidden
                    className={`hidden text-[0.6875rem] sm:block ${selected ? 'text-primary-100' : 'text-gray-800'}`}
                  >
                    {count
                      ? t('{n} horaire|{n} horaires', { n: count })
                      : t('Aucun')}
                  </span>
                </button>
              );
            })}
          </div>

          {!hasSlots ? (
            <Notice>
              {t('Aucun créneau disponible sur cette période.')}
              {lastWeek ? '' : ` ${t('Consultez la semaine suivante.')}`}
            </Notice>
          ) : groups.length ? (
            <div
              role="group"
              aria-label={t('Horaires du {date}', {
                date: formatLocalDate(activeDate),
              })}
              className="flex flex-col gap-5"
            >
              {groups.map((group) => (
                <div key={group.key} className="flex flex-col gap-3">
                  <h3 className="font-montserrat text-label-sm font-semibold text-gray-800 uppercase">
                    {t(group.label)} · {group.slots.length}
                  </h3>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(5.25rem,1fr))]">
                    {group.slots.map((slot) => {
                      const selected = slot.startsAt === value;
                      return (
                        <button
                          key={slot.startsAt}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => onChange(slot)}
                          className={`font-montserrat text-body-sm focus-visible:outline-third-200 min-h-11 rounded-xl border font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none ${
                            selected
                              ? 'border-primary-200 bg-primary-200 text-on-gold'
                              : 'hover:border-third-200 border-black/20 bg-white text-gray-900'
                          }`}
                        >
                          {formatTime(slot.startsAt)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-secondary-50 flex flex-col items-center gap-3 rounded-xl px-6 py-8 text-center">
              <p className="font-faustina text-third-900 text-2xl">
                {t('Aucun horaire ce jour-là')}
              </p>
              {nextOpen ? (
                <PillButton
                  variant="outline"
                  tone="dark"
                  size="sm"
                  onClick={() => setDayChoice(nextOpen.date)}
                >
                  {t('Voir le {date}', {
                    date: formatLocalDate(nextOpen.date),
                  })}
                </PillButton>
              ) : (
                <p className="font-montserrat text-body-sm text-gray-800">
                  {lastWeek
                    ? t('Plus aucun horaire ouvert cette semaine.')
                    : t('Consultez la semaine suivante.')}
                </p>
              )}
            </div>
          )}
        </>
      ) : null}

      <p className="font-montserrat text-body-sm flex items-start gap-2 border-t border-black/10 pt-4 text-gray-800">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
          className="mt-0.5 size-4 shrink-0"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        {t(
          'Réservation au plus tard 12 h à l’avance, jusqu’à 45 jours. Horaires à l’heure de Bordeaux.'
        )}
      </p>
    </section>
  );
}
