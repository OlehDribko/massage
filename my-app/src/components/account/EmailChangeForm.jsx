'use client';

import { useId, useRef, useState } from 'react';

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
        Modifier mon adresse e-mail
      </PillButton>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    if (busyRef.current) return;
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Adresse e-mail invalide.');
      return;
    }
    if (value.toLowerCase() === (currentEmail ?? '').toLowerCase()) {
      setError('C’est déjà votre adresse actuelle.');
      return;
    }
    busyRef.current = true;
    setPending(true);
    setError(null);
    try {
      await onSubmit(value);
      setMessage(
        `Un lien de confirmation a été envoyé à ${value}. Votre adresse changera après l’ouverture de ce lien ; vous devrez alors vous reconnecter.`
      );
      setEmail('');
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <TextField
        id={id}
        label="Nouvelle adresse e-mail"
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
          {pending ? 'Envoi…' : 'Envoyer le lien'}
        </PillButton>
        <PillButton
          variant="text"
          onClick={() => setOpen(false)}
          className="self-start sm:self-auto"
        >
          Fermer
        </PillButton>
      </div>
    </form>
  );
}
