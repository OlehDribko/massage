'use client';

import { useEffect, useId, useRef } from 'react';

import PillButton from '@/components/ui/PillButton';

/**
 * `secondaryLabel` / `onSecondary`: an optional softer alternative (e.g.
 * "Plutôt déplacer" next to "Annuler le rendez-vous").
 *
 * Modal confirmation for irreversible actions (cancel a booking, remove a
 * schedule exception). Native <dialog>: focus stays inside, the page is
 * inert, Escape closes; focus returns to the opener. While `pending`, it
 * cannot be closed and the confirm button is disabled (no double send).
 */
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Retour',
  secondaryLabel,
  onSecondary,
  pending = false,
  error,
  onConfirm,
  onClose,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  const pendingRef = useRef(pending);

  useEffect(() => {
    onCloseRef.current = onClose;
    pendingRef.current = pending;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const handleCancel = (event) => {
      event.preventDefault();
      if (!pendingRef.current) onCloseRef.current();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="rounded-card m-auto w-[min(32rem,calc(100vw-2rem))] max-w-none bg-white p-0 text-gray-900 shadow-xl backdrop:bg-[rgba(28,25,20,0.6)]"
    >
      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <h2
          id={titleId}
          className="font-faustina text-title-sm text-third-900 sm:text-[2rem] sm:leading-tight"
        >
          {title}
        </h2>
        <div className="font-montserrat text-body text-gray-800">
          {children}
        </div>
        {error ? (
          <p role="alert" className="font-montserrat text-body-sm text-error">
            {error}
          </p>
        ) : null}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <PillButton
            variant={secondaryLabel ? 'text' : 'outline'}
            tone={secondaryLabel ? 'primary' : 'dark'}
            onClick={onClose}
            disabled={pending}
            className={`disabled:opacity-60 ${secondaryLabel ? 'text-third-900 self-center sm:mr-auto' : ''}`}
          >
            {cancelLabel}
          </PillButton>
          {secondaryLabel ? (
            <PillButton
              variant="outline"
              tone="dark"
              onClick={onSecondary}
              disabled={pending}
              className="disabled:opacity-60"
            >
              {secondaryLabel}
            </PillButton>
          ) : null}
          <PillButton
            onClick={onConfirm}
            disabled={pending}
            aria-busy={pending}
            className="disabled:opacity-60"
          >
            {pending ? 'Un instant…' : confirmLabel}
          </PillButton>
        </div>
      </div>
    </dialog>
  );
}
