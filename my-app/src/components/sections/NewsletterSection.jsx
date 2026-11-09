'use client';

import { useId, useRef, useState } from 'react';
import Image from 'next/image';

import { MARKETING_CONSENT } from '@/config/marketing';
import { subscribeNewsletter } from '@/lib/api/public';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function message(error) {
  // The API mounts /api/marketing only with ENABLE_MARKETING_SUBSCRIPTION=true
  // (switched off on staging): otherwise every request is 404 NOT_FOUND.
  if (error?.status === 404) {
    return 'L’inscription à la newsletter n’est pas encore ouverte.';
  }
  switch (error?.code) {
    case 'VALIDATION_FAILED':
      return 'Adresse e-mail invalide.';
    case 'CONFIRMATION_EMAIL_NOT_SENT':
      return 'L’e-mail de confirmation n’a pas pu être envoyé. Réessayez dans quelques minutes.';
    case 'CONSENT_TEXT_OUTDATED':
      return 'Le texte de consentement a changé. Rechargez la page puis réessayez.';
    case 'NOT_CONFIGURED':
      return 'L’inscription à la newsletter n’est pas encore ouverte.';
    case 'NETWORK_ERROR':
      return 'Impossible de joindre le service. Vérifiez votre connexion et réessayez.';
    default:
      return 'Une erreur est survenue. Réessayez dans quelques instants.';
  }
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
      className="size-5"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/**
 * Figma «no-surprise-offer» (645:198): wide photo, then «Ne manquez aucune
 * offre» with the email field. Double opt-in: the API sends a confirmation
 * link and answers the same for any address (nothing reveals whether it is
 * known), so the success text always says «check your inbox».
 */
export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle' });
  const busyRef = useRef(false);
  const ids = { field: useId(), consent: useId(), status: useId() };

  const submit = async (event) => {
    event.preventDefault();
    if (busyRef.current) return;
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setState({
        status: 'error',
        text: 'Indiquez une adresse e-mail valide.',
      });
      return;
    }
    busyRef.current = true;
    setState({ status: 'pending' });
    try {
      await subscribeNewsletter(value, MARKETING_CONSENT.version);
      setState({ status: 'done' });
      setEmail('');
    } catch (error) {
      setState({ status: 'error', text: message(error) });
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <section className="bg-secondary-100 pb-20">
      <div className="relative h-[320px] w-full overflow-hidden sm:h-[380px] lg:h-[494px]">
        <Image
          src="/images/newsletter.jpg"
          alt=""
          fill
          sizes="100vw"
          className="-scale-x-100 object-cover object-[50%_45%]"
        />
        <div aria-hidden className="absolute inset-0 bg-[rgba(37,34,30,0.6)]" />
      </div>

      <div className="px-page pt-[60px] lg:pt-20">
        <div className="mx-auto flex max-w-[664px] flex-col items-center gap-10 text-center lg:gap-[60px]">
          <div className="flex flex-col gap-6">
            <h2 className="font-faustina sm:text-h3 xl:text-h2 text-[32px] leading-[1.08] font-normal tracking-[-0.64px] text-gray-900">
              Ne manquez aucune offre
            </h2>
            <p className="font-montserrat text-body-lg text-gray-200">
              Recevez en avant-première nos offres saisonnières, tarifs spéciaux
              et invitations pour des séances à prix réduit ou offertes.
            </p>
          </div>

          <form
            noValidate
            onSubmit={submit}
            className="flex w-full flex-col gap-3"
          >
            <div className="bg-base-white focus-within:outline-third-200 flex items-center gap-3 rounded-full py-2 pr-2 pl-5 focus-within:outline-2">
              <label htmlFor={ids.field} className="sr-only">
                Adresse e-mail
              </label>
              <input
                id={ids.field}
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                required
                placeholder="nom@exemple.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (state.status === 'error') setState({ status: 'idle' });
                }}
                aria-invalid={state.status === 'error' || undefined}
                aria-describedby={`${ids.consent} ${ids.status}`}
                className="font-montserrat min-w-0 flex-1 bg-transparent text-[14px] font-medium tracking-[0.14px] text-gray-900 placeholder:text-gray-100 focus:outline-none"
              />
              <button
                type="submit"
                disabled={state.status === 'pending'}
                aria-busy={state.status === 'pending'}
                aria-label="S’inscrire à la newsletter"
                className="bg-third-200 text-on-dark hover:bg-third-900 focus-visible:outline-third-200 flex size-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 motion-reduce:transition-none"
              >
                <ArrowIcon />
              </button>
            </div>
            <p
              id={ids.consent}
              className="font-montserrat text-body-sm px-5 text-gray-200"
            >
              {MARKETING_CONSENT.text}
            </p>
            <p
              id={ids.status}
              role="status"
              className={`font-montserrat text-body-sm px-5 ${state.status === 'error' ? 'text-error' : 'text-gray-900'}`}
            >
              {state.status === 'done'
                ? 'Merci ! Un lien de confirmation vient de vous être envoyé par e-mail.'
                : state.status === 'error'
                  ? state.text
                  : ''}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
