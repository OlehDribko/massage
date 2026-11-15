'use client';

import { useId, useRef, useState } from 'react';

import { useT } from '@/i18n/client';

import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import TextField from '@/components/ui/TextField';
import {
  profileChanges,
  profileServerErrors,
  validateName,
  validatePhone,
} from '@/lib/account/profile';
import { bookingErrorMessage } from '@/lib/booking/labels';

/**
 * Name and phone of the own profile (PATCH /api/me). The phone is not
 * verified (no SMS) and never used to sign in. Saved values come back from
 * the server and replace the shared profile.
 */
export default function ProfileForm({ profile, onSave, submitLabel }) {
  const t = useT();
  const [form, setForm] = useState({
    name: profile.name ?? '',
    phone: profile.phone ?? '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);
  const busyRef = useRef(false);
  const ids = { name: useId(), phone: useId() };

  const update = (field) => (event) => {
    setForm((value) => ({ ...value, [field]: event.target.value }));
    setMessage(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busyRef.current) return;
    const local = {
      ...(validateName(form.name, t)
        ? { name: validateName(form.name, t) }
        : {}),
      ...(validatePhone(form.phone, t)
        ? { phone: validatePhone(form.phone, t) }
        : {}),
    };
    setErrors(local);
    if (Object.keys(local).length) {
      document.getElementById(local.name ? ids.name : ids.phone)?.focus();
      return;
    }
    const changes = profileChanges(profile, form);
    if (!changes) {
      setMessage({
        tone: 'info',
        text: t('Aucune modification à enregistrer.'),
      });
      return;
    }

    busyRef.current = true;
    setPending(true);
    setMessage(null);
    try {
      const view = await onSave(changes);
      setForm({
        name: view.profile.name ?? '',
        phone: view.profile.phone ?? '',
      });
      setMessage({ tone: 'info', text: t('Profil enregistré.') });
    } catch (error) {
      const fields = profileServerErrors(error, t);
      setErrors(fields);
      setMessage({
        tone: 'error',
        text: Object.keys(fields).length
          ? t('Certaines informations sont invalides.')
          : bookingErrorMessage(error, t),
      });
    } finally {
      busyRef.current = false;
      setPending(false);
    }
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-6">
      <TextField
        id={ids.name}
        label={t('Nom et prénom')}
        name="name"
        autoComplete="name"
        value={form.name}
        onChange={update('name')}
        error={errors.name}
        maxLength={80}
      />
      <TextField
        id={ids.phone}
        label={t('Téléphone')}
        name="phone"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder="+33 6 12 34 56 78"
        value={form.phone}
        onChange={update('phone')}
        error={errors.phone}
        hint={t(
          'Format international. Utilisé uniquement pour vos rendez-vous.'
        )}
      />
      <div role="status">
        {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
      </div>
      <PillButton
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="self-start disabled:opacity-60"
      >
        {pending ? t('Enregistrement…') : (submitLabel ?? t('Enregistrer'))}
      </PillButton>
    </form>
  );
}
