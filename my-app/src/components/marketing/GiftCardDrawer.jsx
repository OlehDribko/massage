'use client';

import { useEffect, useId, useRef, useState } from 'react';

import MaskIcon from '@/components/ui/MaskIcon';
import { BUSINESS } from '@/config/site';

export const GIFT_CARD_HASH = '#carte-cadeau';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s().-]{8,}$/;

function validate({ name, phone, email }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Indiquez votre prénom et votre nom.';
  if (!phone.trim()) errors.phone = 'Indiquez votre numéro de téléphone.';
  else if (!PHONE.test(phone.trim())) {
    errors.phone = 'Numéro invalide, par exemple +33 6 12 34 56 78.';
  }
  if (email.trim() && !EMAIL.test(email.trim())) {
    errors.email = 'Adresse e-mail invalide.';
  }
  return errors;
}

/** The request as an email to the studio, ready to send. */
function requestMailto({ name, phone, email }) {
  const body = [
    'Bonjour,',
    '',
    'Je souhaite offrir une carte cadeau. Merci de me recontacter.',
    '',
    `Prénom et nom : ${name.trim()}`,
    `Téléphone : ${phone.trim()}`,
    email.trim() ? `E-mail : ${email.trim()}` : null,
  ]
    .filter((line) => line !== null)
    .join('\n');
  return `mailto:${BUSINESS.email}?subject=${encodeURIComponent(
    'Demande de carte cadeau'
  )}&body=${encodeURIComponent(body)}`;
}

function Field({ id, label, error, ...input }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label
        htmlFor={id}
        className="font-montserrat text-label-sm font-medium tracking-[0.08em] text-gray-200 uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`font-montserrat text-body text-base-white focus:border-primary-200 border-b bg-transparent py-2 tracking-[0.01em] placeholder:text-gray-900 focus:outline-none ${
          error ? 'border-error' : 'border-white/20'
        }`}
        {...input}
      />
      {error ? (
        <p
          id={`${id}-error`}
          className="font-montserrat text-body-sm text-error pt-1"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Figma «Carte cadeau — modal» (797:1821, mobile 799:1916): a dark panel on
 * the right (full screen on phones) asking for the visitor's details; the
 * practitioner calls back for the purchase. There is no backend route for
 * these requests yet, so « Envoyer la demande » opens the visitor's email
 * app with the request written to the studio (nothing is sent by the site
 * itself) — the direct phone / email stay below.
 *
 * Opens from any link to #carte-cadeau (header, gift card section) and on
 * arrival with that hash; native <dialog>: focus stays inside, Escape and
 * the backdrop close it.
 */
export default function GiftCardDrawer() {
  const dialogRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const ids = {
    title: useId(),
    name: useId(),
    phone: useId(),
    email: useId(),
  };

  // Links to #carte-cadeau open the panel (captured before smooth-scroll
  // libraries try to scroll to a missing anchor).
  useEffect(() => {
    const onClick = (event) => {
      const link = event.target.closest?.('a[href$="#carte-cadeau"]');
      if (!link) return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(true);
    };
    document.addEventListener('click', onClick, true);
    // Arriving with #carte-cadeau in the address opens it too.
    const frame =
      window.location.hash === GIFT_CARD_HASH
        ? requestAnimationFrame(() => setOpen(true))
        : null;
    return () => {
      document.removeEventListener('click', onClick, true);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => {
    setOpen(false);
    if (window.location.hash === GIFT_CARD_HASH) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
  };

  const change = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: null }));
  };

  const submit = (event) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    const first = ['name', 'phone', 'email'].find((field) => found[field]);
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }
    window.location.href = requestMailto(form);
    setSent(true);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={ids.title}
      onClose={close}
      onClick={(event) => {
        // A click on the backdrop (outside the panel) closes it.
        if (event.target === dialogRef.current) close();
      }}
      className="gift-drawer bg-secondary-900 m-0 ml-auto h-dvh max-h-none w-full max-w-none p-0 text-gray-100 backdrop:bg-[rgba(28,25,20,0.6)] sm:w-[545px]"
    >
      <div className="relative flex min-h-full flex-col justify-between gap-12 px-4 pt-24 pb-10 sm:px-12 sm:pt-24 sm:pb-12">
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="hover:text-base-white focus-visible:outline-primary-200 absolute top-6 right-4 flex size-11 items-center justify-center text-gray-800 transition-colors focus-visible:outline-2 sm:top-10 sm:right-10"
        >
          <MaskIcon src="/icons/close-modal.svg" className="size-7" />
        </button>

        <div className="flex flex-col gap-[60px]">
          <div className="flex flex-col gap-4">
            <p className="font-montserrat text-third-200 flex items-center gap-4 text-[11px] font-medium tracking-[0.2em] uppercase">
              Carte cadeau
              <span aria-hidden className="bg-third-200 h-px w-[54px]" />
            </p>
            <h2
              id={ids.title}
              className="font-faustina text-[32px] leading-[1.15] text-gray-50 sm:text-[36px]"
            >
              Laissez vos coordonnées
            </h2>
            <p className="font-montserrat text-body-sm text-gray-100">
              Remplissez le formulaire, notre praticienne vous contactera pour
              l’achat. Vous pouvez aussi nous joindre directement.
            </p>
          </div>

          {sent ? (
            <div role="status" className="flex flex-col gap-4">
              <p className="font-faustina text-2xl text-gray-50">
                Merci, {form.name.trim().split(' ')[0]} !
              </p>
              <p className="font-montserrat text-body text-gray-100">
                Votre messagerie s’ouvre avec la demande prête à envoyer : il
                vous suffit de l’envoyer. Si rien ne s’ouvre, appelez ou
                écrivez-nous directement (coordonnées ci-dessous).
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="font-montserrat text-body-sm text-primary-200 self-start underline underline-offset-4"
              >
                Modifier la demande
              </button>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={submit}
              className="flex flex-col gap-[60px]"
            >
              <div className="flex flex-col gap-6">
                <Field
                  id={ids.name}
                  label="Prénom et nom *"
                  name="name"
                  autoComplete="name"
                  placeholder="Marie Dupont"
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={change('name')}
                  error={errors.name}
                />
                <Field
                  id={ids.phone}
                  label="Téléphone *"
                  name="tel"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+33 6 12 34 56 78"
                  required
                  value={form.phone}
                  onChange={change('phone')}
                  error={errors.phone}
                />
                <Field
                  id={ids.email}
                  label="Email — facultatif"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="marie@exemple.com"
                  value={form.email}
                  onChange={change('email')}
                  error={errors.email}
                />
              </div>
              <button
                type="submit"
                className="rounded-pill bg-primary-200 font-montserrat hover:shadow-button-hover focus-visible:outline-primary-200 min-h-[54px] px-10 text-[14px] font-medium tracking-[0.05em] text-[#131212] uppercase focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Envoyer la demande
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-5 border-t border-white/10 pt-5">
          <p className="font-montserrat text-xs tracking-[0.01em] text-gray-800 uppercase">
            Ou directement
          </p>
          <div className="flex flex-col gap-2">
            <p className="font-montserrat text-primary-200 flex flex-wrap gap-x-6 gap-y-1 text-base">
              <a
                href={`tel:${BUSINESS.phone.e164}`}
                className="hover:text-primary-100"
              >
                {BUSINESS.phone.display}
              </a>
              <a
                href={`mailto:${BUSINESS.email}`}
                className="hover:text-primary-100 break-all"
              >
                {BUSINESS.email}
              </a>
            </p>
            <p className="font-montserrat text-primary-200 flex gap-5 text-sm">
              <a
                href={BUSINESS.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-100 underline underline-offset-4"
              >
                Instagram
              </a>
              <a
                href={BUSINESS.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-100 underline underline-offset-4"
              >
                Facebook
              </a>
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
}
