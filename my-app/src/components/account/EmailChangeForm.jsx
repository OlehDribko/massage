'use client';

import { useId, useRef, useState } from 'react';

import { useT } from '@/i18n/client';

import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import TextField from '@/components/ui/TextField';
import { authErrorMessage } from '@/lib/auth/session';

/**
 * Email change (docs/auth-and-profiles.md §5.7): Firebase sends a link to
 * the new address (`verifyBeforeUpdateEmail`); the address changes only after
 * that link, then the user signs in again and the profile is synced. The
 * `email` field of PATCH /api/me is not accepted by the API.
 */
export default function EmailChangeForm({ currentEmail, onSubmit }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);
  const busyRef = useRef(false);
  const id = useId();

  if (!open) {
    return (
      <PillButton
        variant="text"
        onClick={() => setOpen(true)}
        className="self-start"
      >
        {t('Modifier mon adresse e-mail')}
      </PillButton>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    if (busyRef.current) return;
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(t('Adresse e-mail invalide.'));
      return;
    }
    if (value.toLowerCase() === (currentEmail ?? '').toLowerCase()) {
      setError(t('C’est déjà votre adresse actuelle.'));
      return;
    }
    busyRef.current = true;
    setPending(true);
    setError(null);
    try {
      await onSubmit(value);
      setMessage(
        t(
          'Un lien de confirmation a été envoyé à {email}. Votre adresse changera après l’ouverture de ce lien ; vous devrez alors vous reconnecter.',
          { email: value }
        )
      );
      setEmail('');
    } catch (caught) {
      setError(authErrorMessage(caught, t));
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <TextField
        id={id}
        label={t('Nouvelle adresse e-mail')}
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={error}
      />
      <div role="status">{message ? <Notice>{message}</Notice> : null}</div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <PillButton
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="disabled:opacity-60"
        >
          {pending ? t('Envoi…') : t('Envoyer le lien')}
        </PillButton>
        <PillButton
          variant="text"
          onClick={() => setOpen(false)}
          className="self-start sm:self-auto"
        >
          {t('Fermer')}
        </PillButton>
      </div>
    </form>
  );
}
