'use client';

import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';

import AdminShell, { AdminError } from '@/components/admin/AdminShell';
import IntervalsEditor, {
  DEFAULT_INTERVAL,
} from '@/components/admin/IntervalsEditor';
import { useAccountData } from '@/components/auth/useAccountData';
import { DateTile } from '@/components/booking/BookingCard';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DatePicker from '@/components/ui/DatePicker';
import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import { bookingErrorMessage } from '@/lib/booking/labels';
import {
  WEEKDAYS,
  hasErrors,
  normalizeIntervals,
  sameAsWeekly,
  toMinutes,
  validateDay,
  weeklyBody,
  weeklyByDay,
} from '@/lib/booking/schedule';
import { useFormat, useT } from '@/i18n/client';
import { rich } from '@/i18n/rich';
import { localDateOf, studioToday } from '@/lib/format';

const noopSubscribe = () => () => {};

/** 409 SCHEDULE_CONFLICT: the active bookings that block the change. */
function Conflicts({ conflicts }) {
  const t = useT();
  const { formatDateTime } = useFormat();
  return (
    <div role="alert" className="flex flex-col gap-3">
      <Notice tone="error">
        {t(
          'Des rendez-vous confirmés seraient en dehors des horaires. Annulez-les ou gardez des horaires qui les incluent, puis enregistrez à nouveau. Pour seulement bloquer de nouvelles réservations, fermez la date dans le Calendrier : les rendez-vous existants y restent valables.'
        )}
      </Notice>
      <ul className="font-montserrat text-body-sm flex list-disc flex-col gap-1 pl-5 text-gray-900">
        {conflicts.map((conflict) => (
          <li key={conflict.bookingId}>
            <Link
              href={`/admin/reservations/${conflict.bookingId}?date=${localDateOf(conflict.startsAt)}`}
              className="hover:text-third-200 underline underline-offset-2"
            >
              {formatDateTime(conflict.startsAt)} — {conflict.serviceName}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function useWrite(controller) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const busyRef = useRef(false);
  const run = async (path, options) => {
    if (busyRef.current) return null;
    busyRef.current = true;
    setPending(true);
    setError(null);
    try {
      return await controller.api(path, options);
    } catch (caught) {
      setError(caught);
      return null;
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  };
  return { pending, error, setError, run };
}

function SectionHead({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-faustina text-third-900 text-[1.75rem] leading-tight">
        {title}
      </h2>
      <p className="font-montserrat text-body-sm max-w-2xl text-gray-800">
        {children}
      </p>
    </div>
  );
}

/** « Semaine type »: one panel, one row per weekday. */
function WeeklyEditor({ weekly, controller }) {
  const t = useT();
  const [days, setDays] = useState(() => weeklyByDay(weekly));
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const write = useWrite(controller);

  const errors = Object.fromEntries(
    WEEKDAYS.map(({ value }) => [value, validateDay(days[value], t)])
  );
  const invalid = hasErrors(errors);

  const change = (next) => {
    setDays(next);
    setDirty(true);
    setSaved(false);
  };

  // Monday's hours on every open day (days off stay off).
  const copyMonday = () => {
    const monday = days[1].length ? days[1] : [DEFAULT_INTERVAL];
    change(
      Object.fromEntries(
        WEEKDAYS.map(({ value }) => [
          value,
          value === 1 || !days[value].length
            ? days[value]
            : monday.map((item) => ({ ...item })),
        ])
      )
    );
  };

  const save = async (event) => {
    event.preventDefault();
    if (invalid) return;
    const result = await write.run('/api/admin/schedule/weekly', {
      method: 'PUT',
      body: weeklyBody(days),
    });
    if (result) {
      setDays(weeklyByDay(result.weekly));
      setDirty(false);
      setSaved(true);
    }
  };

  return (
    <form noValidate onSubmit={save} className="flex flex-col gap-5">
      <div className="rounded-panel border border-black/10 bg-white px-5 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 py-4">
          <p className="font-montserrat text-label-sm font-medium text-gray-800 uppercase">
            {t('Heure de Paris')}
          </p>
          <button
            type="button"
            onClick={copyMonday}
            className="font-montserrat text-body-sm hover:text-third-200 focus-visible:outline-third-200 min-h-10 text-left text-gray-900 underline underline-offset-4 focus-visible:outline-2"
          >
            {t('Copier les horaires du lundi sur les jours ouverts')}
          </button>
        </div>
        <div className="divide-y divide-black/10">
          {WEEKDAYS.map(({ value, label }) => (
            <IntervalsEditor
              key={value}
              label={t(label)}
              intervals={days[value]}
              errors={dirty ? errors[value] : {}}
              onChange={(next) => change({ ...days, [value]: next })}
            />
          ))}
        </div>
      </div>
      <p className="font-montserrat text-body-sm text-gray-800">
        {t(
          'Le dernier début de séance reste fixé à 19:00 ; une pause de 15 minutes sépare deux séances.'
        )}
      </p>
      {write.error?.code === 'SCHEDULE_CONFLICT' ? (
        <Conflicts conflicts={write.error.details.conflicts ?? []} />
      ) : write.error ? (
        <AdminError
          error={write.error}
          message={bookingErrorMessage(write.error, t)}
        />
      ) : null}
      <div role="status">
        {saved ? (
          <Notice>{t('Horaires de la semaine enregistrés.')}</Notice>
        ) : null}
      </div>
      {/* Same size: full width one under the other on phones, two equal
          columns from 640 px. */}
      <div className="grid gap-3 sm:max-w-xl sm:grid-cols-2">
        <PillButton
          type="submit"
          disabled={!dirty || invalid || write.pending}
          aria-busy={write.pending}
          className="w-full! px-4! disabled:opacity-60"
        >
          {write.pending ? t('Enregistrement…') : t('Enregistrer la semaine')}
        </PillButton>
        <PillButton
          variant="outline"
          tone="dark"
          disabled={!dirty || write.pending}
          onClick={() => {
            setDays(weeklyByDay(weekly));
            setDirty(false);
            write.setError(null);
          }}
          className="w-full px-4! disabled:opacity-60"
        >
          {t('Annuler les modifications')}
        </PillButton>
      </div>
    </form>
  );
}

/** Choice between two options, as a segmented pill. */
function Segmented({ value, onChange, options, label }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="bg-secondary-50 grid w-full grid-cols-2 rounded-full border border-black/10 p-1 sm:w-fit"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`font-montserrat text-body-sm focus-visible:outline-third-200 min-h-10 rounded-full px-4 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
            value === option.value
              ? 'bg-third-900 text-cream'
              : 'hover:text-third-200 text-gray-800'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Add or replace the hours of one date: calendar on the left, hours on the right. */
/** The form values of a saved date (to edit it). */
function formValues(exception) {
  return exception?.closed
    ? { mode: 'off', intervals: [{ ...DEFAULT_INTERVAL }] }
    : {
        mode: 'hours',
        intervals: exception?.intervals?.length
          ? exception.intervals.map(({ start, end }) => ({ start, end }))
          : [{ ...DEFAULT_INTERVAL }],
      };
}

const sameIntervals = (a, b) =>
  a.length === b.length &&
  a.every(
    (item, index) =>
      toMinutes(item.start) === toMinutes(b[index].start) &&
      toMinutes(item.end) === toMinutes(b[index].end)
  );

/**
 * A specific date: pick it, set its hours (or a day off), save. Picking a
 * date that already has its own hours (or « Modifier » on its card) loads
 * them to edit. Saving what the weekly schedule — or the saved date —
 * already says is refused: nothing would change.
 */
function ExceptionForm({
  controller,
  today,
  existing,
  weekly,
  initialDate = null,
  notice,
  onSaved,
  onCancelEdit,
}) {
  const t = useT();
  const { formatLocalDate } = useFormat();
  const start = formValues(initialDate ? existing.get(initialDate) : null);
  const [date, setDate] = useState(initialDate);
  const [mode, setMode] = useState(start.mode); // 'hours' | 'off'
  const [intervals, setIntervals] = useState(start.intervals);
  const [touched, setTouched] = useState(false);
  const write = useWrite(controller);

  const intervalErrors = mode === 'off' ? {} : validateDay(intervals, t);
  const emptyIntervals = mode === 'hours' && intervals.length === 0;
  const replacing = date ? existing.get(date) : null;
  const next = mode === 'off' ? [] : normalizeIntervals(intervals);
  const asUsual =
    Boolean(date) &&
    !emptyIntervals &&
    !Object.keys(intervalErrors).length &&
    sameAsWeekly(date, next, weekly);
  const unchanged =
    Boolean(replacing) &&
    !asUsual &&
    (replacing.closed
      ? mode === 'off'
      : mode === 'hours' &&
        sameIntervals(normalizeIntervals(replacing.intervals), next));
  const invalid =
    !date ||
    emptyIntervals ||
    Object.keys(intervalErrors).length > 0 ||
    asUsual ||
    unchanged;

  const pick = (value) => {
    setDate(value);
    write.setError(null);
    // A date that already has its own hours: load them to edit.
    const current = existing.get(value);
    if (current) {
      const values = formValues(current);
      setMode(values.mode);
      setIntervals(values.intervals);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    setTouched(true);
    if (invalid) return;
    const result = await write.run(`/api/admin/schedule/exceptions/${date}`, {
      method: 'PUT',
      body: mode === 'off' ? { closed: true } : { intervals: next },
    });
    if (result) {
      setDate(null);
      setTouched(false);
      onSaved(
        t('{date} : enregistré.', {
          date: formatLocalDate(date, { year: true }),
        })
      );
    }
  };

  return (
    <form
      noValidate
      onSubmit={save}
      className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-8"
    >
      <div className="flex flex-col gap-3">
        <h3 className="font-montserrat text-body-lg font-semibold text-gray-900">
          {t('1. Choisissez la date')}
        </h3>
        <DatePicker
          value={date}
          today={today}
          min={today ?? undefined}
          marked={new Set(existing.keys())}
          label={t('Date particulière')}
          onChange={pick}
        />
        {touched && !date ? (
          <p className="font-montserrat text-body-sm text-error">
            {t('Choisissez une date dans le calendrier.')}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-5">
        <h3 className="font-montserrat text-body-lg font-semibold text-gray-900">
          {t('2. Horaires de ce jour')}
        </h3>
        <div className="bg-secondary-50 flex items-center gap-4 rounded-2xl p-4">
          {date ? (
            <DateTile startsAt={`${date}T12:00:00Z`} />
          ) : (
            <span
              aria-hidden
              className="flex h-[3.75rem] w-14 items-center justify-center rounded-xl border border-dashed border-black/20 text-gray-800"
            >
              ?
            </span>
          )}
          <div className="font-montserrat flex flex-col">
            <span className="text-body font-medium text-gray-900 first-letter:uppercase">
              {date
                ? formatLocalDate(date, { year: true })
                : t('Aucune date choisie')}
            </span>
            <span className="text-body-sm text-gray-800">
              {replacing
                ? t('Date personnalisée : modifiez ses horaires ci-dessous.')
                : t('Remplace les horaires de la semaine type pour ce jour.')}
            </span>
          </div>
        </div>

        <Segmented
          label={t('Ce jour-là')}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'hours', label: t('Horaires spéciaux') },
            { value: 'off', label: t('Jour de repos') },
          ]}
        />

        {mode === 'hours' ? (
          <IntervalsEditor
            layout="stack"
            label={t('Ce jour')}
            intervals={intervals}
            errors={touched ? intervalErrors : {}}
            onChange={setIntervals}
          />
        ) : (
          <p className="font-montserrat text-body-sm text-gray-800">
            {t(
              'Aucun horaire ce jour-là. Refusé s’il y a déjà des rendez-vous : pour bloquer seulement les nouvelles réservations, fermez la date dans le'
            )}{' '}
            <Link
              href="/admin/calendrier"
              className="hover:text-third-200 underline underline-offset-2"
            >
              {t('Calendrier')}
            </Link>
            .
          </p>
        )}
        {touched && emptyIntervals ? (
          <p className="font-montserrat text-body-sm text-error">
            {t('Ajoutez au moins une plage, ou choisissez « Jour de repos ».')}
          </p>
        ) : null}
        {asUsual ? (
          <p role="alert" className="font-montserrat text-body-sm text-error">
            {t(
              'Aucun changement : ce sont déjà les horaires de la semaine type pour ce jour.'
            )}
            {replacing
              ? t(
                  ' Pour revenir à la semaine type, supprimez cette date dans la liste.'
                )
              : ''}
          </p>
        ) : unchanged ? (
          <p className="font-montserrat text-body-sm text-gray-800">
            {t('Modifiez les horaires de cette date, puis enregistrez.')}
          </p>
        ) : null}

        {write.error?.code === 'SCHEDULE_CONFLICT' ? (
          <Conflicts conflicts={write.error.details.conflicts ?? []} />
        ) : write.error ? (
          <AdminError
            error={write.error}
            message={bookingErrorMessage(write.error, t)}
          />
        ) : null}
        <div role="status">{notice ? <Notice>{notice}</Notice> : null}</div>
        {/* Full width of the column, one under the other at the same size
            (side by side they would wrap in this narrow column). */}
        <div className="mt-auto grid gap-3">
          <PillButton
            type="submit"
            disabled={write.pending || asUsual || unchanged}
            aria-busy={write.pending}
            className="w-full! px-4! disabled:opacity-60"
          >
            {write.pending
              ? t('Enregistrement…')
              : replacing
                ? t('Enregistrer les modifications')
                : t('Enregistrer la date')}
          </PillButton>
          {initialDate ? (
            <PillButton
              type="button"
              variant="outline"
              tone="dark"
              onClick={onCancelEdit}
              className="w-full px-4!"
            >
              {t('Annuler la modification')}
            </PillButton>
          ) : null}
        </div>
      </div>
    </form>
  );
}

function ExceptionsList({
  exceptions,
  controller,
  onChanged,
  onEdit,
  editing,
}) {
  const t = useT();
  const { formatLocalDate } = useFormat();
  const [removing, setRemoving] = useState(null); // date
  const write = useWrite(controller);

  const remove = async () => {
    const result = await write.run(
      `/api/admin/schedule/exceptions/${removing}`,
      { method: 'DELETE' }
    );
    if (result) {
      setRemoving(null);
      onChanged();
    }
  };

  if (!exceptions.length) {
    return (
      <p className="rounded-panel font-montserrat text-body-sm border border-dashed border-black/15 px-5 py-6 text-center text-gray-800">
        {t('Aucune date particulière à venir : la semaine type s’applique.')}
      </p>
    );
  }

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1">
        {exceptions.map((exception) => (
          <li
            key={exception.date}
            className="rounded-panel bg-secondary-50 flex min-h-24 items-center gap-4 border border-black/7 p-4"
          >
            <DateTile startsAt={`${exception.date}T12:00:00Z`} />
            <div className="font-montserrat flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-body font-medium text-gray-900 first-letter:uppercase">
                {formatLocalDate(exception.date)}
              </span>
              <span className="text-body-sm text-gray-800">
                {exception.closed
                  ? t('Jour de repos')
                  : exception.intervals
                      .map((item) => `${item.start}–${item.end}`)
                      .join(', ')}
              </span>
            </div>
            {/* Edit at the top right, delete at the bottom right. */}
            <div className="-my-2 -mr-2 flex shrink-0 flex-col justify-between gap-1 self-stretch">
              <button
                type="button"
                onClick={() => onEdit(exception.date)}
                aria-label={t('Modifier le {date}', {
                  date: formatLocalDate(exception.date, { year: true }),
                })}
                aria-pressed={editing === exception.date}
                title={t('Modifier')}
                className={`focus-visible:outline-third-200 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 ${
                  editing === exception.date
                    ? 'bg-third-900 text-cream'
                    : 'hover:bg-secondary-100 hover:text-third-900 text-gray-800'
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden
                  className="size-5"
                >
                  <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  write.setError(null);
                  setRemoving(exception.date);
                }}
                aria-label={t('Revenir à la semaine type le {date}', {
                  date: formatLocalDate(exception.date, { year: true }),
                })}
                title={t('Revenir à la semaine type')}
                className="hover:bg-error/10 hover:text-error focus-visible:outline-error flex size-9 shrink-0 items-center justify-center rounded-full text-gray-800 transition-colors focus-visible:outline-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden
                  className="size-5"
                >
                  <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={removing !== null}
        title={t('Revenir à la semaine type ?')}
        confirmLabel={t('Supprimer la date particulière')}
        pending={write.pending}
        error={
          write.error && write.error.code !== 'SCHEDULE_CONFLICT'
            ? bookingErrorMessage(write.error, t)
            : null
        }
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      >
        {removing ? (
          <>
            {t('Le {date} suivra de nouveau les horaires de la semaine type.', {
              date: formatLocalDate(removing, { year: true }),
            })}
            {write.error?.code === 'SCHEDULE_CONFLICT' ? (
              <div className="mt-4">
                <Conflicts conflicts={write.error.details.conflicts ?? []} />
              </div>
            ) : null}
          </>
        ) : null}
      </ConfirmDialog>
    </>
  );
}

function ScheduleContent({ controller, enabled }) {
  const t = useT();
  const today = useSyncExternalStore(noopSubscribe, studioToday, () => null);
  const { status, data, error, reload } = useAccountData(
    '/api/admin/schedule',
    { enabled }
  );
  const existing = useMemo(
    () => new Map((data?.exceptions ?? []).map((item) => [item.date, item])),
    [data]
  );
  // « Modifier » on a saved date: the form reopens with its values.
  const [editing, setEditing] = useState(null); // { date, nonce }
  const [notice, setNotice] = useState(null);
  const formRef = useRef(null);
  const edit = (date) => {
    setEditing({ date, nonce: Date.now() });
    setNotice(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (status === 'loading' || status === 'idle') {
    return (
      <p role="status" className="font-montserrat text-body text-gray-800">
        {t('Chargement des horaires…')}
      </p>
    );
  }
  if (status === 'error') {
    return (
      <AdminError
        error={error}
        onRetry={reload}
        message={bookingErrorMessage(error, t)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col gap-6">
        <SectionHead title={t('Semaine type')}>
          {t(
            'Les horaires habituels de chaque jour. Désactivez un jour pour en faire un jour de repos.'
          )}
        </SectionHead>
        <WeeklyEditor
          key={JSON.stringify(data.weekly)}
          weekly={data.weekly}
          controller={controller}
        />
      </section>
      <section className="flex flex-col gap-6">
        <SectionHead title={t('Dates particulières')}>
          {t(
            'Des horaires différents pour un jour précis (jour férié, horaires réduits…). Pour bloquer des dates sans toucher aux rendez-vous, utilisez le Calendrier.'
          )}
        </SectionHead>
        {/* One row on wide screens: 1. date, 2. hours of that day,
            3. the dates already set. Below, the saved dates come last. */}
        <div
          ref={formRef}
          className="rounded-panel grid scroll-mt-24 gap-8 border border-black/10 bg-white p-5 sm:p-7 xl:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] xl:gap-8"
        >
          <ExceptionForm
            key={editing ? `${editing.date}-${editing.nonce}` : 'new'}
            controller={controller}
            today={today}
            existing={existing}
            weekly={data.weekly}
            initialDate={editing?.date ?? null}
            onCancelEdit={() => setEditing(null)}
            notice={notice}
            onSaved={(message) => {
              setNotice(message);
              setEditing(null);
              reload();
            }}
          />
          <div className="flex flex-col gap-3 border-t border-black/7 pt-6 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-8">
            <h3 className="font-montserrat text-body-lg font-semibold text-gray-900">
              {t('3. Dates personnalisées')}
            </h3>
            <ExceptionsList
              exceptions={data.exceptions}
              controller={controller}
              editing={editing?.date ?? null}
              onEdit={edit}
              onChanged={reload}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * /admin/horaires — weekly working hours and date exceptions
 * (/api/admin/schedule…). Changes that would leave confirmed bookings
 * outside working hours are refused by the server (409) and listed; nothing
 * is cancelled automatically.
 */
export default function AdminSchedule() {
  const t = useT();
  return (
    <AdminShell
      title={
        <>
          {rich(t('Horaires du <accent>cabinet</accent>'), {
            accent: (chunks) => (
              <span className="heading-accent">{chunks}</span>
            ),
          })}
        </>
      }
      current="horaires"
      returnTo="/admin/horaires"
    >
      {({ controller, status }) => (
        <ScheduleContent controller={controller} enabled={status === 'admin'} />
      )}
    </AdminShell>
  );
}
