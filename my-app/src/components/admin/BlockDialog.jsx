'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Link, useFormat, useT } from '@/i18n/client';

import { TimeBox } from '@/components/admin/IntervalsEditor';
import DateField from '@/components/ui/DateField';
import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import TextField from '@/components/ui/TextField';
import { validatorFor } from '@/lib/api/contract';
import {
  BLOCKS_PATH,
  BLOCK_ROUTE,
  HORIZON_DAYS,
  NOTE_MAX,
  TITLE_MAX,
  blockErrorMessage,
  blockIsGone,
  blockPath,
  blockTimeLabel,
  blockToForm,
  isBlockOver,
  conflictsOf,
  createBlockIntent,
  createBody,
  fieldErrorsFrom,
  newBlockForm,
  patchBody,
  validateBlockForm,
} from '@/lib/admin/blocks';
import { errorReference, isRetryable } from '@/lib/booking/labels';
import { addDays } from '@/lib/format';

const checkBlock = validatorFor('scheduleBlock');
const checkUpdate = validatorFor('scheduleBlockUpdate');
const checkDeleted = validatorFor('scheduleBlockDeleted');

/** Style of a manual busy time («indisponibilité»), apart from bookings. */
export const BLOCK_STYLE =
  'border border-dashed border-third-200 bg-[repeating-linear-gradient(135deg,var(--color-secondary-100)_0_6px,var(--color-secondary-50)_6px_12px)] text-third-900';

const FIELD_ORDER = ['date', 'start', 'end', 'title', 'note'];
const LABEL =
  'font-montserrat text-label-sm font-medium text-gray-800 uppercase';

/**
 * «Ajouter une indisponibilité» / edit or delete one: a modal form (native
 * <dialog>: focus stays inside, Escape closes). `editor` is
 * `{ date }` to create on that date or `{ block }` to edit it.
 *
 * - `start` / `end` are typed as HH:MM like the working hours (5-minute
 *   steps, 24:00 = midnight); they are sent as local times of the studio,
 *   whatever the browser's time zone;
 * - creating keeps one Idempotency-Key per body: «Réessayer» after an
 *   unknown outcome (network, CALENDAR_BUSY, 5xx) sends the same request;
 * - `onChanged({ removedId, block })` after any write; `onGone()` when the
 *   server says the block no longer exists (the caller reloads).
 * Focus goes back to the control that opened it (or `fallbackFocus`).
 */
export default function BlockDialog({
  editor,
  today,
  controller,
  onClose,
  onChanged,
  onGone,
  fallbackFocus,
}) {
  const t = useT();
  const { formatDateTime, formatLocalDate } = useFormat();
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const busyRef = useRef(false);
  // One holder per open form (its key survives re-renders, not a reopen).
  const [intent] = useState(() => createBlockIntent());
  const block = editor.block ?? null;
  const [form, setForm] = useState(() =>
    block ? blockToForm(block) : newBlockForm(editor.date)
  );
  const [step, setStep] = useState('form'); // 'form' | 'delete'
  const [touched, setTouched] = useState(false);
  const [failure, setFailure] = useState(null); // { error, action }
  const [pending, setPending] = useState(false);
  const [gone, setGone] = useState(false);
  // v1: a block that is over can be read and deleted, not changed (the
  // server re-checks the bounds on every PATCH, even a new title). Decided
  // when the form opens; a block that ends while it is open gets the
  // server's error on the end field.
  const [past] = useState(() => Boolean(block) && isBlockOver(block));
  const titleId = useId();
  const ids = {
    date: useId(),
    start: useId(),
    end: useId(),
    title: useId(),
    note: useId(),
  };
  const onCloseRef = useRef(onClose);
  const pendingRef = useRef(pending);
  useEffect(() => {
    onCloseRef.current = onClose;
    pendingRef.current = pending;
  });

  // Open on mount, give the focus back on unmount.
  useEffect(() => {
    const dialog = dialogRef.current;
    openerRef.current = document.activeElement;
    dialog.showModal();
    const handleCancel = (event) => {
      event.preventDefault();
      // Escape in the date picker closes the picker, not the form.
      if (dialog.querySelector('[aria-expanded="true"]')) return;
      if (!pendingRef.current) onCloseRef.current();
    };
    dialog.addEventListener('cancel', handleCancel);
    const opener = openerRef;
    const fallback = fallbackFocus;
    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      if (dialog.open) dialog.close();
      requestAnimationFrame(() => {
        const target = opener.current?.isConnected
          ? opener.current
          : fallback?.current;
        target?.focus?.();
      });
    };
  }, [fallbackFocus]);

  const hints = touched ? validateBlockForm(form, today, t) : {};
  const server = failure ? fieldErrorsFrom(failure.error, t) : {};
  const errors = { ...server, ...hints };
  const set = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (failure?.error?.code === 'VALIDATION_FAILED') setFailure(null);
  };

  const run = async (action) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPending(true);
    setFailure(null);
    try {
      if (action === 'create') {
        const body = createBody(form);
        const answer = await controller.api(BLOCKS_PATH, {
          method: 'POST',
          headers: { 'Idempotency-Key': intent.keyFor(body) },
          body,
          validate: checkBlock,
          route: BLOCKS_PATH,
        });
        intent.settle(null);
        onChanged({ block: answer.block, action: 'created' });
      } else if (action === 'update') {
        const changes = patchBody(block, form);
        if (Object.keys(changes).length) {
          const answer = await controller.api(blockPath(block.id), {
            method: 'PATCH',
            body: changes,
            validate: checkUpdate,
            route: BLOCK_ROUTE,
          });
          onChanged({
            removedId: block.id,
            block: answer.block,
            action: 'updated',
          });
        } else {
          onClose();
        }
      } else {
        await controller.api(blockPath(block.id), {
          method: 'DELETE',
          validate: checkDeleted,
          route: BLOCK_ROUTE,
        });
        onChanged({ removedId: block.id, block: null, action: 'deleted' });
      }
    } catch (error) {
      if (action === 'create') intent.settle(error);
      if (blockIsGone(error)) {
        setGone(true);
        onGone?.();
      }
      setFailure({ error, action });
      const fields = fieldErrorsFrom(error, t);
      const first = FIELD_ORDER.find((field) => fields[field]);
      if (first) {
        setStep('form');
        requestAnimationFrame(() =>
          document.getElementById(ids[first])?.focus()
        );
      }
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    setTouched(true);
    const found = validateBlockForm(form, today, t);
    const first = FIELD_ORDER.find((field) => found[field]);
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }
    run(block ? 'update' : 'create');
  };

  const conflicts = failure ? conflictsOf(failure.error) : [];
  const retryable = failure && isRetryable(failure.error);
  const reference = failure ? errorReference(failure.error, t) : null;
  const errorId = `${titleId}-error`;
  const describe = (field) =>
    errors[field] ? `${ids[field]}-error` : undefined;
  const fieldError = (field) =>
    errors[field] ? (
      <p
        id={`${ids[field]}-error`}
        className="font-montserrat text-body-sm text-error pt-1"
      >
        {errors[field]}
      </p>
    ) : null;

  const failureBox = failure ? (
    <div
      id={errorId}
      role="alert"
      className="border-error/40 rounded-card flex flex-col gap-3 border bg-white px-4 py-3"
    >
      <p className="font-montserrat text-body-sm text-error">
        {server.form ?? blockErrorMessage(failure.error, t)}
      </p>
      {conflicts.length ? (
        <ul className="font-montserrat text-body-sm flex flex-col gap-1.5 text-gray-900">
          {conflicts.map((item) => (
            <li key={item.bookingId}>
              <Link
                href={`/admin/reservations/${item.bookingId}?date=${item.date}`}
                className="hover:text-third-200 underline underline-offset-2"
              >
                <span className="inline-block first-letter:uppercase">
                  {formatDateTime(item.startsAt)}
                </span>{' '}
                — {item.serviceName ?? t('Rendez-vous')}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {reference ? (
        <p className="font-montserrat text-xs text-gray-800">{reference}</p>
      ) : null}
      {retryable ? (
        <PillButton
          type="button"
          variant="outline"
          tone="dark"
          size="sm"
          onClick={() => run(failure.action)}
          disabled={pending}
          className="self-start disabled:opacity-60"
        >
          {t('Réessayer')}
        </PillButton>
      ) : null}
    </div>
  ) : null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="rounded-card m-auto max-h-[calc(100dvh-2rem)] w-[min(36rem,calc(100vw-2rem))] max-w-none overflow-y-auto bg-white p-0 text-gray-900 shadow-xl backdrop:bg-[rgba(28,25,20,0.6)]"
    >
      {past && step === 'form' ? (
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <p className={LABEL}>{t('Indisponibilité terminée')}</p>
            <h2
              id={titleId}
              className="font-faustina text-title-sm text-third-900 break-words sm:text-[2rem] sm:leading-tight"
            >
              {block.title}
            </h2>
            <p className="font-montserrat text-body text-gray-900">
              <span className="inline-block first-letter:uppercase">
                {formatLocalDate(form.date, { year: true })}
              </span>
              , {blockTimeLabel(block, undefined, t)}
            </p>
          </div>
          {block.note ? (
            <p className="font-montserrat text-body-sm break-words whitespace-pre-line text-gray-800">
              {block.note}
            </p>
          ) : null}
          <Notice>
            {t(
              'Cette indisponibilité est terminée : elle ne peut plus être modifiée. Vous pouvez la supprimer.'
            )}
          </Notice>
          {gone ? (
            <Notice>{t('Le calendrier a été mis à jour.')}</Notice>
          ) : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <PillButton
              type="button"
              variant="text"
              tone="primary"
              onClick={() => {
                setFailure(null);
                setStep('delete');
              }}
              disabled={gone}
              className="text-error self-center disabled:opacity-60 sm:mr-auto"
            >
              {t('Supprimer')}
            </PillButton>
            <PillButton
              type="button"
              variant="outline"
              tone="dark"
              onClick={onClose}
            >
              {t('Fermer')}
            </PillButton>
          </div>
        </div>
      ) : step === 'delete' ? (
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <h2
            id={titleId}
            className="font-faustina text-title-sm text-third-900 sm:text-[2rem] sm:leading-tight"
          >
            {t('Supprimer cette indisponibilité ?')}
          </h2>
          <p className="font-montserrat text-body text-gray-800">
            {t('« {title} » —', { title: block.title })}{' '}
            <span className="first-letter:uppercase">
              {formatLocalDate(form.date, { year: true })}
            </span>
            ,{' '}
            {t(
              '{time}. Ce créneau redevient réservable par les clients selon les horaires du cabinet.',
              { time: blockTimeLabel(block, undefined, t) }
            )}
          </p>
          {failureBox}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <PillButton
              type="button"
              variant="outline"
              tone="dark"
              onClick={() => {
                setFailure(null);
                setStep('form');
              }}
              disabled={pending}
              className="disabled:opacity-60"
            >
              {t('Retour')}
            </PillButton>
            <PillButton
              type="button"
              onClick={() => run('delete')}
              disabled={pending || gone}
              aria-busy={pending}
              className="disabled:opacity-60"
            >
              {pending ? t('Un instant…') : t('Supprimer')}
            </PillButton>
          </div>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={submit}
          aria-describedby={failure ? errorId : undefined}
          className="flex flex-col gap-6 p-6 sm:p-8"
        >
          <div className="flex flex-col gap-1">
            <h2
              id={titleId}
              className="font-faustina text-title-sm text-third-900 sm:text-[2rem] sm:leading-tight"
            >
              {block ? t('Indisponibilité') : t('Ajouter une indisponibilité')}
            </h2>
            <p className="font-montserrat text-body-sm text-gray-800">
              {t(
                'Temps déjà pris ailleurs (Planity, rendez-vous personnel…). Les clients ne peuvent plus réserver sur ce créneau, ni dans la pause de 15 min avant et après. Visible uniquement par l’administration.'
              )}
            </p>
          </div>

          {form.lockedBounds ? (
            <div className="flex flex-col gap-2">
              <p className={LABEL}>{t('Date et horaires')}</p>
              <p className="font-montserrat text-body text-gray-900 first-letter:uppercase">
                {formatLocalDate(form.date, { year: true })},{' '}
                {blockTimeLabel(block, undefined, t)}
              </p>
              <Notice>
                {t(
                  'Cette indisponibilité dépasse minuit (créée hors de ce formulaire) : ses horaires restent tels quels. Vous pouvez modifier le titre et la note, ou la supprimer puis en créer une par jour.'
                )}
              </Notice>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <DateField
                  buttonId={ids.date}
                  label={t('Date')}
                  value={form.date}
                  today={today}
                  min={today ?? undefined}
                  max={today ? addDays(today, HORIZON_DAYS) : undefined}
                  invalid={Boolean(errors.date)}
                  describedBy={describe('date')}
                  onChange={set('date')}
                />
                {fieldError('date')}
              </div>

              <fieldset className="flex flex-col gap-2">
                <legend className={`${LABEL} mb-1`}>{t('Horaires')}</legend>
                <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
                  <label className="flex flex-col gap-1" htmlFor={ids.start}>
                    <span className="font-montserrat text-body-sm text-gray-800">
                      {t('Début')}
                    </span>
                    <TimeBox
                      id={ids.start}
                      label={t('Début (HH:MM)')}
                      value={form.start}
                      onChange={set('start')}
                      invalid={Boolean(errors.start)}
                      describedBy={describe('start')}
                    />
                  </label>
                  <span aria-hidden className="pb-2 text-gray-800">
                    –
                  </span>
                  <label className="flex flex-col gap-1" htmlFor={ids.end}>
                    <span className="font-montserrat text-body-sm text-gray-800">
                      {t('Fin')}
                    </span>
                    <TimeBox
                      id={ids.end}
                      label={t('Fin (HH:MM, 24:00 pour minuit)')}
                      value={form.end}
                      onChange={set('end')}
                      invalid={Boolean(errors.end)}
                      describedBy={[describe('end'), `${ids.end}-hint`]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  </label>
                </div>
                {fieldError('start')}
                {fieldError('end')}
                <p
                  id={`${ids.end}-hint`}
                  className="font-montserrat text-xs text-gray-800"
                >
                  {t(
                    'Un seul jour, heure de Paris, par pas de 5 min. Pour aller jusqu’à minuit, indiquez 24:00. Au moins 15 min.'
                  )}
                </p>
              </fieldset>
            </>
          )}

          <TextField
            id={ids.title}
            label={t('Titre ({n}/{max})', {
              n: form.title.trim().length,
              max: TITLE_MAX,
            })}
            value={form.title}
            maxLength={TITLE_MAX}
            placeholder={t('Planity, rendez-vous personnel…')}
            required
            error={errors.title}
            onChange={(event) => set('title')(event.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor={ids.note} className={LABEL}>
              {t('Note')}{' '}
              <span className="font-normal normal-case">
                {t('(facultatif, {n}/{max})', {
                  n: form.note.trim().length,
                  max: NOTE_MAX,
                })}
              </span>
            </label>
            <textarea
              id={ids.note}
              rows={3}
              maxLength={NOTE_MAX}
              value={form.note}
              aria-invalid={errors.note ? true : undefined}
              aria-describedby={describe('note')}
              onChange={(event) => set('note')(event.target.value)}
              className={`font-montserrat text-body focus:border-third-200 focus:ring-third-200/30 resize-y rounded-xl border px-3.5 py-3 text-gray-900 focus:ring-2 focus:outline-none ${errors.note ? 'border-error' : 'border-black/20'}`}
            />
            {fieldError('note')}
          </div>

          {gone ? (
            <Notice>{t('Le calendrier a été mis à jour.')}</Notice>
          ) : null}
          {failureBox}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            {block ? (
              <PillButton
                type="button"
                variant="text"
                tone="primary"
                onClick={() => {
                  setFailure(null);
                  setStep('delete');
                }}
                disabled={pending || gone}
                className="text-error self-center disabled:opacity-60 sm:mr-auto"
              >
                {t('Supprimer')}
              </PillButton>
            ) : null}
            <PillButton
              type="button"
              variant="outline"
              tone="dark"
              onClick={onClose}
              disabled={pending}
              className="disabled:opacity-60"
            >
              {gone ? t('Fermer') : t('Annuler')}
            </PillButton>
            <PillButton
              type="submit"
              disabled={pending || gone}
              aria-busy={pending}
              className="disabled:opacity-60"
            >
              {pending
                ? t('Un instant…')
                : block
                  ? t('Enregistrer')
                  : t('Ajouter')}
            </PillButton>
          </div>
        </form>
      )}
    </dialog>
  );
}
