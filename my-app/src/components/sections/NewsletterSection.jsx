'use client';

import { useId, useRef, useState } from 'react';
import Image from 'next/image';

import { useAuth } from '@/components/auth/AuthProvider';
import { MARKETING_CONSENT } from '@/config/marketing';
import { subscribeNewsletter } from '@/lib/api/public';
import { currentProfile } from '@/lib/auth/session';
import {
  isVerifiedOwner,
  marketingAvailability,
  marketingErrorMessage,
  newsletterRoute,
  ownSubscriptionResult,
  subscriptionState,
} from '@/lib/marketing';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
 * offre» with the email field (docs/frontend-handoff.md §4).
 * - A verified, registered visitor subscribing their OWN address: account
 *   route (POST /api/me/marketing/subscription), active at once.
 * - Anyone else, or another address: public route (POST
 *   /api/marketing/subscriptions), confirmed by the emailed link; the answer
 *   is the same for any address, so the text says «check your inbox».
 * - Hidden only when the loaded profile says newsletters are off; while the
 *   profile is unknown the form stays and the API answer decides (404).
 */
export default function NewsletterSection() {
  const auth = useAuth();
  const view = currentProfile(auth.state);
  const available = marketingAvailability({
    status: auth.state.profile.status,
    data: view,
  });
  const owner = isVerifiedOwner(view) ? view.profile : null;
  const ownerState = owner ? subscriptionState(view.marketing) : null;

  const [email, setEmail] = useState('');
  // The verified owner sees one button with their address; «another
  // address» opens the regular field.
  const [otherAddress, setOtherAddress] = useState(false);
  const [state, setState] = useState({ status: 'idle' });
  const busyRef = useRef(false);
  const ids = { field: useId(), consent: useId(), status: useId() };

  const ownerMode = Boolean(owner) && !otherAddress;

  const send = async (address) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setState({ status: 'pending' });
    try {
      if (newsletterRoute(view, address) === 'account') {
        // Never falls back to the public route after an error.
        const result = await auth.controller.subscribeMarketing(
          MARKETING_CONSENT.version
        );
        setState({ status: 'done', text: ownSubscriptionResult(result).text });
      } else {
        await subscribeNewsletter(address, MARKETING_CONSENT.version);
        setState({
          status: 'done',
          text: 'Merci ! Si cette adresse n’est pas encore inscrite, un lien de confirmation vient de lui être envoyé.',
        });
        setEmail('');
      }
    } catch (error) {
      setState({ status: 'error', text: marketingErrorMessage(error) });
    } finally {
      busyRef.current = false;
    }
  };

  if (available === 'off') return null;

  const submit = (event) => {
    event.preventDefault();
    if (ownerMode) {
      send(owner.email);
      return;
    }
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setState({
        status: 'error',
        text: 'Indiquez une adresse e-mail valide.',
      });
      return;
    }
    send(value);
  };

  return (
    <section id="newsletter" className="bg-secondary-100 scroll-mt-20 pb-20">
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
            {ownerMode && ownerState === 'subscribed' ? (
              <p className="font-montserrat text-body text-gray-900">
                Vous êtes inscrit·e avec{' '}
                <span className="font-semibold break-all">{owner.email}</span>.{' '}
                <a
                  href="/compte#newsletter"
                  className="hover:text-third-200 underline underline-offset-4"
                >
                  Gérer mon inscription
                </a>
              </p>
            ) : ownerMode ? (
              <div className="flex flex-col items-center gap-3">
                <button
                  type="submit"
                  disabled={state.status === 'pending'}
                  aria-busy={state.status === 'pending'}
                  className="bg-third-200 text-on-dark hover:bg-third-900 focus-visible:outline-third-200 font-montserrat flex min-h-12 w-full max-w-full items-center justify-center gap-3 rounded-full px-6 py-2 text-[14px] font-medium tracking-[0.14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 motion-reduce:transition-none sm:w-auto"
                >
                  <span className="min-w-0 truncate">
                    {state.status === 'pending'
                      ? 'Inscription…'
                      : `S’inscrire avec ${owner.email}`}
                  </span>
                  <ArrowIcon />
                </button>
                {ownerState === 'pending' ? (
                  <p className="font-montserrat text-body-sm text-gray-800">
                    Une inscription attend la confirmation par e-mail : ce
                    bouton l’active tout de suite.
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setOtherAddress(true);
                    setState({ status: 'idle' });
                  }}
                  className="font-montserrat text-body-sm hover:text-third-200 text-gray-800 underline underline-offset-4"
                >
                  Utiliser une autre adresse
                </button>
              </div>
            ) : (
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
            )}
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
                ? state.text
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
