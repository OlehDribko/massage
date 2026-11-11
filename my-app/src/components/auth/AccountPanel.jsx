'use client';

import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import EmailChangeForm from '@/components/account/EmailChangeForm';
import MarketingStatus from '@/components/account/MarketingStatus';
import ProfileForm from '@/components/account/ProfileForm';
import AccountShell from '@/components/auth/AccountShell';
import Notice from '@/components/ui/Notice';
import PillButton from '@/components/ui/PillButton';
import { AUTH_ROUTES } from '@/config/auth';
import {
  authErrorMessage,
  currentProfile,
  profileErrorMessage,
  safeReturnPath,
} from '@/lib/auth/session';
import { SIGN_IN_PROVIDERS, readinessSteps } from '@/lib/booking/labels';
import { marketingAvailability } from '@/lib/marketing';

function Section({ id, title, children }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-6 flex-col gap-5 border-t border-black/10 pt-8"
    >
      <h2
        id={`${id}-title`}
        className="font-faustina text-third-900 text-[1.75rem] leading-tight"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * /compte: the backend profile of the signed-in user, its editable fields
 * (name, phone), email verification and change, newsletter status and
 * sign-out on this device. `?retour=` (checked, same site only) brings the
 * visitor back to an unfinished booking once nothing blocks it any more.
 */
export default function AccountPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('retour')
    ? safeReturnPath(searchParams.get('retour'), null)
    : null;
  const [pending, setPending] = useState(null); // 'resend' | 'refresh' | 'signout'
  const [message, setMessage] = useState(null); // { tone, text }
  const busyRef = useRef(false);

  const run = async (kind, task) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPending(kind);
    setMessage(null);
    try {
      await task();
    } catch (error) {
      setMessage({ tone: 'error', text: authErrorMessage(error) });
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  };

  return (
    <AccountShell
      title={
        <>
          Mon <span className="heading-accent">compte</span>
        </>
      }
      current="profil"
      returnTo={returnTo ?? AUTH_ROUTES.account}
    >
      {({ controller, state }) => {
        const view = currentProfile(state);
        const profile = view?.profile;
        const profileError =
          state.profile.status === 'error' ? state.profile.error : null;
        const needsVerification =
          profile &&
          !profile.emailVerified &&
          profile.signInProvider === 'password';
        const blockers = view?.bookingReadiness?.blockers ?? [];
        const remaining = readinessSteps(blockers);

        const signOut = () =>
          run('signout', async () => {
            await controller.signOut();
            router.replace('/');
          });

        return (
          <div className="flex flex-col gap-10">
            {returnTo && view ? (
              remaining.length ? (
                <Notice>
                  Pour terminer votre réservation :{' '}
                  {remaining.map((step) => step.text).join(' ')}
                </Notice>
              ) : (
                <div className="rounded-card flex flex-col gap-4 border border-black/10 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-montserrat text-body text-gray-900">
                    Votre profil est complet : vous pouvez reprendre votre
                    réservation.
                  </p>
                  <PillButton href={returnTo}>Continuer</PillButton>
                </div>
              )
            ) : null}

            {profileError ? (
              <div className="flex flex-col gap-4">
                <Notice tone="error">
                  {profileErrorMessage(profileError)}
                </Notice>
                {profileError.code !== 'NOT_CONFIGURED' ? (
                  <PillButton
                    variant="outline"
                    tone="dark"
                    onClick={() => controller.retry()}
                    disabled={state.profile.status === 'loading'}
                    className="self-start"
                  >
                    Réessayer
                  </PillButton>
                ) : null}
              </div>
            ) : null}

            {!profile && !profileError ? (
              <p
                role="status"
                className="font-montserrat text-body text-gray-800"
              >
                Chargement de votre profil…
              </p>
            ) : null}

            {profile ? (
              <>
                <Section id="profil" title="Coordonnées">
                  <p className="font-montserrat text-body text-gray-800">
                    Votre nom et votre téléphone sont nécessaires pour réserver.
                  </p>
                  <ProfileForm
                    key={`${profile.name}|${profile.phone}`}
                    profile={profile}
                    onSave={(changes) => controller.updateProfile(changes)}
                  />
                </Section>

                <Section id="connexion" title="Connexion">
                  <dl className="font-montserrat text-body flex flex-col gap-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
                      <dt className="text-label-sm font-medium text-gray-800 uppercase sm:w-44 sm:shrink-0 sm:pt-0.5">
                        Adresse e-mail
                      </dt>
                      <dd className="min-w-0 break-words text-gray-900">
                        {profile.email ?? '—'}{' '}
                        <span className="text-gray-800">
                          {profile.emailVerified
                            ? '(confirmée)'
                            : '(non confirmée)'}
                        </span>
                      </dd>
                    </div>
                    {SIGN_IN_PROVIDERS[profile.signInProvider] ? (
                      <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
                        <dt className="text-label-sm font-medium text-gray-800 uppercase sm:w-44 sm:shrink-0 sm:pt-0.5">
                          Mode de connexion
                        </dt>
                        <dd className="text-gray-900">
                          {SIGN_IN_PROVIDERS[profile.signInProvider]}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  {needsVerification ? (
                    <div className="rounded-card flex flex-col gap-4 border border-black/10 bg-white p-6">
                      <h3 className="font-montserrat text-body-lg font-semibold text-gray-900">
                        Confirmez votre adresse e-mail
                      </h3>
                      <p className="font-montserrat text-body text-gray-800">
                        Un lien de confirmation a été envoyé à {profile.email}.
                        Après l’avoir ouvert, revenez ici et actualisez votre
                        statut.
                      </p>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <PillButton
                          onClick={() =>
                            run('refresh', () =>
                              controller.refreshVerification()
                            )
                          }
                          disabled={pending !== null}
                          aria-busy={pending === 'refresh'}
                          className="disabled:opacity-60"
                        >
                          {pending === 'refresh'
                            ? 'Vérification…'
                            : 'J’ai confirmé'}
                        </PillButton>
                        <PillButton
                          variant="text"
                          onClick={() =>
                            run('resend', async () => {
                              await controller.resendVerification();
                              setMessage({
                                tone: 'info',
                                text: 'E-mail de confirmation renvoyé.',
                              });
                            })
                          }
                          disabled={pending !== null}
                          className="self-start disabled:opacity-60 sm:self-auto"
                        >
                          {pending === 'resend'
                            ? 'Envoi…'
                            : 'Renvoyer l’e-mail'}
                        </PillButton>
                      </div>
                    </div>
                  ) : null}

                  {profile.signInProvider === 'password' ? (
                    <EmailChangeForm
                      currentEmail={profile.email}
                      onSubmit={(email) => controller.changeEmail(email)}
                    />
                  ) : null}
                </Section>

                <Section id="newsletter" title="Newsletter">
                  <MarketingStatus
                    marketing={view.marketing}
                    available={marketingAvailability({
                      status: state.profile.status,
                      data: view,
                    })}
                    emailVerified={profile.emailVerified === true}
                    onSubscribe={(version) =>
                      controller.subscribeMarketing(version)
                    }
                    onUnsubscribe={() => controller.unsubscribeMarketing()}
                  />
                </Section>
              </>
            ) : null}

            <div role="status">
              {message ? (
                <Notice tone={message.tone}>{message.text}</Notice>
              ) : null}
            </div>

            <div className="border-t border-black/10 pt-8">
              <PillButton
                variant="outline"
                tone="dark"
                onClick={signOut}
                disabled={pending !== null}
                aria-busy={pending === 'signout'}
                className="disabled:opacity-60"
              >
                {pending === 'signout' ? 'Déconnexion…' : 'Se déconnecter'}
              </PillButton>
            </div>
          </div>
        );
      }}
    </AccountShell>
  );
}
