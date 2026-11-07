'use client';

import { useId, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';

import AdminShell, { AdminError } from '@/components/admin/AdminShell';
import IntervalsEditor from '@/components/admin/IntervalsEditor';
import { useAccountData } from '@/components/auth/useAccountData';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import { bookingErrorMessage } from '@/lib/booking/labels';
import {
  WEEKDAYS,
  hasErrors,
  validateDay,
  weeklyBody,
  weeklyByDay,
} from '@/lib/booking/schedule';
import {
  formatDateTime,
  formatLocalDate,
  localDateOf,
  studioToday,
} from '@/lib/format';

const noopSubscribe = () => () => {};

/** 409 SCHEDULE_CONFLICT: the active bookings that block the change. */
function Conflicts({ conflicts }) {
  return (
    <div role="alert" className="flex flex-col gap-3">
      <Notice tone="error">
        Des rendez-vous confirmés seraient en dehors des horaires. Annulez-les
        ou gardez des horaires qui les incluent, puis enregistrez à nouveau.
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

function WeeklyEditor({ weekly, controller }) {
  const [days, setDays] = useState(() => weeklyByDay(weekly));
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const write = useWrite(controller);

  const errors = Object.fromEntries(
    WEEKDAYS.map(({ value }) => [value, validateDay(days[value])])
  );
  const invalid = hasErrors(errors);

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
    <form noValidate onSubmit={save} className="flex flex-col gap-6">
      <div className="grid gap-8 md:grid-cols-2">
        {WEEKDAYS.map(({ value, label }) => (
          <IntervalsEditor
            key={value}
            label={label}
            intervals={days[value]}
            errors={dirty ? errors[value] : {}}
            onChange={(next) => {
              setDays((current) => ({ ...current, [value]: next }));
              setDirty(true);
              setSaved(false);
            }}
          />
        ))}
      </div>
      <p className="font-montserrat text-body-sm text-gray-800">
        Heure de Paris. Le dernier début de séance reste fixé à 19:00 ; une
        pause de 15 minutes sépare deux séances.
      </p>
      {write.error?.code === 'SCHEDULE_CONFLICT' ? (
        <Conflicts conflicts={write.error.details.conflicts ?? []} />
      ) : write.error ? (
        <AdminError
          error={write.error}
          message={bookingErrorMessage(write.error)}
        />
      ) : null}
      <div role="status">
        {saved ? <Notice>Horaires de la semaine enregistrés.</Notice> : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <PillButton
          type="submit"
          disabled={!dirty || invalid || write.pending}
          aria-busy={write.pending}
          className="disabled:opacity-60"
        >
          {write.pending ? 'Enregistrement…' : 'Enregistrer la semaine'}
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
          className="disabled:opacity-60"
        >
          Annuler les modifications
        </PillButton>
      </div>
    </form>
  );
}

function ExceptionForm({ controller, today, onSaved }) {
  const [date, setDate] = useState('');
  const [closed, setClosed] = useState(true);
  const [intervals, setIntervals] = useState([{ start: '', end: '' }]);
  const [touched, setTouched] = useState(false);
  const [saved, setSaved] = useState(null);
  const write = useWrite(controller);
  const dateId = useId();

  const dateError = !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ? 'Choisissez une date.'
    : today && date < today
      ? 'La date doit être aujourd’hui ou plus tard.'
      : null;
  const intervalErrors = closed ? {} : validateDay(intervals);
  const emptyIntervals = !closed && intervals.length === 0;
  const invalid =
    Boolean(dateError) ||
    emptyIntervals ||
    Object.keys(intervalErrors).length > 0;

  const save = async (event) => {
    event.preventDefault();
    setTouched(true);
    if (invalid) return;
    const result = await write.run(`/api/admin/schedule/exceptions/${date}`, {
      method: 'PUT',
      body: closed ? { closed: true } : { intervals },
    });
    if (result) {
      setSaved(
        `Exception du ${formatLocalDate(date, { year: true })} enregistrée.`
      );
      setDate('');
      setTouched(false);
      onSaved();
    }
  };

  return (
    <form
      noValidate
      onSubmit={save}
      className="rounded-card flex flex-col gap-5 border border-black/10 bg-white p-6"
    >
      <h3 className="font-montserrat text-body-lg font-semibold text-gray-900">
        Ajouter ou remplacer une date
      </h3>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={dateId}
          className="font-montserrat text-label-sm font-medium text-gray-800 uppercase"
        >
          Date
        </label>
        <input
          id={dateId}
          type="date"
          min={today ?? undefined}
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setSaved(null);
          }}
          aria-invalid={touched && dateError ? true : undefined}
          className="font-montserrat text-body focus:border-third-200 w-fit border-b border-black/20 bg-transparent py-2 text-gray-900 focus:outline-none"
        />
        {touched && dateError ? (
          <p className="font-montserrat text-body-sm text-error">{dateError}</p>
        ) : null}
      </div>
      <fieldset className="font-montserrat text-body flex flex-col gap-2 text-gray-900">
        <legend className="text-label-sm mb-1 font-medium text-gray-800 uppercase">
          Ce jour-là
        </legend>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="exception-mode"
            checked={closed}
            onChange={() => setClosed(true)}
            className="accent-third-200"
          />
          Cabinet fermé
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="exception-mode"
            checked={!closed}
            onChange={() => setClosed(false)}
            className="accent-third-200"
          />
          Horaires particuliers
        </label>
      </fieldset>
      {!closed ? (
        <IntervalsEditor
          label="Plages horaires"
          intervals={intervals}
          errors={touched ? intervalErrors : {}}
          onChange={setIntervals}
        />
      ) : null}
      {touched && emptyIntervals ? (
        <p className="font-montserrat text-body-sm text-error">
          Ajoutez au moins une plage, ou choisissez « Cabinet fermé ».
        </p>
      ) : null}
      <p className="font-montserrat text-body-sm text-gray-800">
        Une date déjà personnalisée est remplacée.
      </p>
      {write.error?.code === 'SCHEDULE_CONFLICT' ? (
        <Conflicts conflicts={write.error.details.conflicts ?? []} />
      ) : write.error ? (
        <AdminError
          error={write.error}
          message={bookingErrorMessage(write.error)}
        />
      ) : null}
      <div role="status">{saved ? <Notice>{saved}</Notice> : null}</div>
      <PillButton
        type="submit"
        disabled={write.pending}
        aria-busy={write.pending}
        className="self-start disabled:opacity-60"
      >
        {write.pending ? 'Enregistrement…' : 'Enregistrer la date'}
      </PillButton>
    </form>
  );
}

function ExceptionsList({ exceptions, controller, onChanged }) {
  const [removing, setRemoving] = useState(null); // date
  const write = useWrite(controller);

  const remove = async () => {
    const result = await write.run(
      `/api/admin/schedule/exceptions/${removing}`,
      {
        method: 'DELETE',
      }
    );
    if (result) {
      setRemoving(null);
      onChanged();
    }
  };

  if (!exceptions.length) {
    return (
      <p className="font-montserrat text-body text-gray-800">
        Aucune date particulière à venir : les horaires de la semaine
        s’appliquent.
      </p>
    );
  }

  return (
    <>
      <ul className="rounded-card divide-y divide-black/10 border border-black/10 bg-white">
        {exceptions.map((exception) => (
          <li
            key={exception.date}
            className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="font-montserrat flex flex-col gap-1">
              <span className="text-body font-medium text-gray-900 first-letter:uppercase">
                {formatLocalDate(exception.date, { year: true })}
              </span>
              <span className="text-body-sm text-gray-800">
                {exception.closed
                  ? 'Cabinet fermé'
                  : exception.intervals
                      .map((item) => `${item.start}–${item.end}`)
                      .join(', ')}
              </span>
            </div>
            <PillButton
              variant="text"
              underline={false}
              onClick={() => {
                write.setError(null);
                setRemoving(exception.date);
              }}
              className="self-start sm:self-auto"
            >
              Supprimer
              <span className="sr-only"> l’exception du {exception.date}</span>
            </PillButton>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={removing !== null}
        title="Revenir aux horaires de la semaine ?"
        confirmLabel="Supprimer l’exception"
        pending={write.pending}
        error={
          write.error && write.error.code !== 'SCHEDULE_CONFLICT'
            ? bookingErrorMessage(write.error)
            : null
        }
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      >
        {removing ? (
          <>
            Le {formatLocalDate(removing, { year: true })} suivra de nouveau les
            horaires habituels.
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
  const today = useSyncExternalStore(noopSubscribe, studioToday, () => null);
  const { status, data, error, reload } = useAccountData(
    '/api/admin/schedule',
    {
      enabled,
    }
  );

  if (status === 'loading' || status === 'idle') {
    return (
      <p role="status" className="font-montserrat text-body text-gray-800">
        Chargement des horaires…
      </p>
    );
  }
  if (status === 'error') {
    return (
      <AdminError
        error={error}
        onRetry={reload}
        message={bookingErrorMessage(error)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-6">
        <h2 className="font-faustina text-third-900 text-[1.75rem] leading-tight">
          Semaine type
        </h2>
        <WeeklyEditor
          key={JSON.stringify(data.weekly)}
          weekly={data.weekly}
          controller={controller}
        />
      </section>
      <section className="flex flex-col gap-6">
        <h2 className="font-faustina text-third-900 text-[1.75rem] leading-tight">
          Dates particulières
        </h2>
        <ExceptionsList
          exceptions={data.exceptions}
          controller={controller}
          onChanged={reload}
        />
        <ExceptionForm controller={controller} today={today} onSaved={reload} />
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
  return (
    <AdminShell
      title={
        <>
          Horaires du <span className="heading-accent">cabinet</span>
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
