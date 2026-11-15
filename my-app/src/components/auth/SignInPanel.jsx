'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useAuth } from '@/components/auth/AuthProvider';
import ConsentText from '@/components/marketing/ConsentText';
import { useRouter, useT } from '@/i18n/client';
import { msg } from '@/i18n/translate';
import { rich } from '@/i18n/rich';
import Notice from '@/components/ui/Notice';
import GoogleLogo from '@/components/ui/GoogleLogo';
import PillButton from '@/components/ui/PillButton';
import TextField from '@/components/ui/TextField';
import { AUTH_ROUTES } from '@/config/auth';
import { MARKETING_CONSENT } from '@/config/marketing';
import {
  SILENT_AUTH_ERRORS,
  authErrorMessage,
  currentProfile,
  safeReturnPath,
} from '@/lib/auth/session';
import { marketingAvailability } from '@/lib/marketing';

const MODES = {
  signin: { title: msg('Se connecter'), submit: msg('Se connecter') },
  signup: { title: msg('Créer un compte'), submit: msg('Créer mon compte') },
};

// Firebase default minimum; a stricter console policy is reported by Firebase.
const MIN_PASSWORD_LENGTH = 6;

const NOTICES = {
  session_revoked: msg(
    'Votre session a expiré ou a été fermée sur un autre appareil. Veuillez vous reconnecter.'
  ),
  account_disabled: msg(
    'Ce compte est désactivé. Contactez-nous si vous pensez qu’il s’agit d’une erreur.'
  ),
};

function validate({ email, password }, mode, t) {
  const errors = {};
  if (!email.trim()) errors.email = t('Indiquez votre adresse e-mail.');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = t('Adresse e-mail invalide.');
  }
  if (!password) errors.password = t('Indiquez votre mot de passe.');
  else if (mode === 'signup' && password.length < MIN_PASSWORD_LENGTH) {
    errors.password = t('{n} caractères minimum.', { n: MIN_PASSWORD_LENGTH });
  }
  return errors;
}

/**
 * Sign-in and sign-up (docs: Massage-backend docs/auth-and-profiles.md §5).
 * A guest who creates an account is linked (same UID, same profile). Signing
 * in to an EXISTING account replaces the guest session at once: the guest
 * session is an internal mechanism the visitor never sees, so nothing is
 * asked or explained about it. No merge is done.
 */
export default function SignInPanel({
  returnTo: returnToProp,
  embedded = false,
}) {
  const t = useT();
  const { enabled, controller, state, status } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo =
    returnToProp ??
    safeReturnPath(searchParams.get('retour'), AUTH_ROUTES.account);
  // Inside the booking page the panel is one step of a section: smaller
  // heading, no page title.
  const Title = embedded ? 'h3' : 'h1';
  const titleClass = embedded
    ? 'font-montserrat text-body-lg font-semibold text-gray-900'
    : 'text-section-title text-third-900';

  const [mode, setMode] = useState(
    searchParams.get('mode') === 'inscription' ? 'signup' : 'signin'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [pending, setPending] = useState(null); // 'email' | 'google' | 'reset'
  const [done, setDone] = useState(false);
  // Newsletter at sign-up: optional, unticked by default.
  const [newsletter, setNewsletter] = useState(false);
  // Synchronous guard: a double click must not start two requests.
  const busyRef = useRef(false);
  const ids = {
    email: useId(),
    password: useId(),
    heading: useId(),
    newsletter: useId(),
    consent: useId(),
  };

  // The checkbox needs the loaded profile saying newsletters are on.
  const profileView = currentProfile(state);
  const offerNewsletter =
    marketingAvailability({
      status: state.profile.status,
      data: profileView,
    }) === 'on';

  // After a failed check, focus the field once it is rendered, so an error
  // is announced with the field.
  const focusFieldRef = useRef(null);
  useEffect(() => {
    if (!focusFieldRef.current) return;
    document.getElementById(focusFieldRef.current)?.focus();
    focusFieldRef.current = null;
  }, [fieldErrors]);

  const run = async (kind, task) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPending(kind);
    setError(null);
    setInfo(null);
    controller.clearNotice();
    try {
      await task();
    } catch (caught) {
      if (!SILENT_AUTH_ERRORS.has(caught?.code)) {
        setError({ code: caught?.code, text: authErrorMessage(caught, t) });
      }
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  };

  // Sent only when the visitor ticked the box on the sign-up tab.
  const optInVersion = () =>
    mode === 'signup' && newsletter && offerNewsletter
      ? MARKETING_CONSENT.version
      : undefined;

  const finish = () => {
    setDone(true);
    router.replace(returnTo);
  };

  const signInWithEmail = () =>
    run('email', async () => {
      await controller.signInWithEmail(email.trim(), password);
      finish();
    });

  const handleSubmit = (event) => {
    event.preventDefault();
    const errors = validate({ email, password }, mode, t);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      focusFieldRef.current = errors.email ? ids.email : ids.password;
      return;
    }

    if (mode === 'signup') {
      run('email', async () => {
        await controller.signUpWithEmail(email.trim(), password, {
          marketingConsent: optInVersion(),
        });
        finish();
      });
      return;
    }
    signInWithEmail();
  };

  const handleGoogle = () =>
    run('google', async () => {
      const options = { marketingConsent: optInVersion() };
      const result = await controller.continueWithGoogle(options);
      // This Google account already has its own account: switch to it.
      if (result?.conflict) {
        await controller.confirmExistingGoogle(
          result.conflict.credential,
          options
        );
      }
      finish();
    });

  const handleReset = () => {
    if (!email.trim()) {
      setFieldErrors({ email: t('Indiquez votre adresse e-mail.') });
      focusFieldRef.current = ids.email;
      return;
    }
    setFieldErrors({});
    run('reset', async () => {
      await controller.sendPasswordReset(email.trim());
      // Same answer whether or not the address has an account.
      setInfo(
        t(
          'Si un compte existe pour cette adresse, un e-mail pour choisir un nouveau mot de passe vient d’être envoyé.'
        )
      );
    });
  };

  const switchMode = (next) => {
    setMode(next);
    setError(null);
    setInfo(null);
    setFieldErrors({});
  };

  if (!enabled) {
    return (
      <section className="flex flex-col gap-6">
        <Title className={titleClass}>{t('Connexion')}</Title>
        <Notice>
          {t('La connexion en ligne n’est pas encore disponible.')}
        </Notice>
        <PillButton href="/reserver">{t('Découvrir les soins')}</PillButton>
      </section>
    );
  }

  if (status === 'unavailable') {
    return (
      <section className="flex flex-col gap-6">
        <Title className={titleClass}>{t('Connexion')}</Title>
        <Notice tone="error">
          {t('Le service de connexion est momentanément indisponible.')}
        </Notice>
        <PillButton
          variant="outline"
          tone="dark"
          onClick={() => controller.retry()}
        >
          {t('Réessayer')}
        </PillButton>
      </section>
    );
  }

  if ((status === 'member' || status === 'admin') && !pending && !done) {
    return (
      <section className="flex flex-col gap-6">
        <Title className={titleClass}>
          {rich(t('Vous êtes <accent>connecté·e</accent>'), {
            accent: (chunks) => (
              <span className="heading-accent">{chunks}</span>
            ),
          })}
        </Title>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <PillButton href={AUTH_ROUTES.account}>{t('Mon compte')}</PillButton>
          <PillButton
            variant="text"
            onClick={() => controller.signOut()}
            className="self-start sm:self-auto"
          >
            {t('Se déconnecter')}
          </PillButton>
        </div>
      </section>
    );
  }

  // The form needs the guest session itself (linking keeps its UID), not
  // only the knowledge that there is no permanent account.
  const ready = status === 'guest' && Boolean(state.user);
  const busy = pending !== null || done;
  const modeCopy = MODES[mode];

  return (
    <section aria-labelledby={ids.heading} className="flex flex-col gap-8">
      <Title id={ids.heading} className={titleClass}>
        {t(modeCopy.title)}
      </Title>

      <div
        role="group"
        aria-label={t('Type de connexion')}
        className="font-montserrat text-label flex border-b border-black/10 uppercase"
      >
        {Object.entries(MODES).map(([key, copy]) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => switchMode(key)}
            className={`focus-visible:outline-third-200 -mb-px flex-1 border-b-2 px-2 py-3 font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 motion-reduce:transition-none ${
              mode === key
                ? 'border-third-200 text-third-900'
                : 'hover:text-third-200 border-transparent text-gray-800'
            }`}
          >
            {key === 'signin' ? t('J’ai un compte') : t('Nouveau compte')}
          </button>
        ))}
      </div>

      {state.notice ? (
        <Notice tone="error">{t(NOTICES[state.notice])}</Notice>
      ) : null}

      {mode === 'signup' ? (
        <p className="font-montserrat text-body text-gray-800">
          {t('Votre compte vous permettra de retrouver vos informations.')}
        </p>
      ) : null}

      <>
        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          <TextField
            id={ids.email}
            label={t('Adresse e-mail')}
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
          />
          <TextField
            id={ids.password}
            label={t('Mot de passe')}
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete={
              mode === 'signup' ? 'new-password' : 'current-password'
            }
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            hint={
              mode === 'signup'
                ? t('{n} caractères minimum.', { n: MIN_PASSWORD_LENGTH })
                : undefined
            }
            action={
              <button
                type="button"
                aria-pressed={showPassword}
                aria-controls={ids.password}
                aria-label={
                  showPassword
                    ? t('Masquer le mot de passe')
                    : t('Afficher le mot de passe')
                }
                onClick={() => setShowPassword((value) => !value)}
                className="font-montserrat text-label-sm hover:text-third-200 focus-visible:outline-third-200 shrink-0 px-1 py-2 font-medium text-gray-800 uppercase focus-visible:outline-2"
              >
                {showPassword ? t('Masquer') : t('Afficher')}
              </button>
            }
          />

          {mode === 'signup' && offerNewsletter ? (
            <div className="flex items-start gap-3">
              <input
                id={ids.newsletter}
                type="checkbox"
                checked={newsletter}
                onChange={(event) => setNewsletter(event.target.checked)}
                disabled={busy}
                aria-describedby={ids.consent}
                className="accent-third-200 mt-1 size-5 shrink-0"
              />
              <div className="flex flex-col gap-1">
                <label
                  htmlFor={ids.newsletter}
                  className="font-montserrat text-body font-medium text-gray-900"
                >
                  {t('Recevoir la newsletter du cabinet (facultatif)')}
                </label>
                <p
                  id={ids.consent}
                  className="font-montserrat text-body-sm text-gray-800"
                >
                  <ConsentText />
                </p>
              </div>
            </div>
          ) : null}

          {error ? (
            <div role="alert">
              <Notice tone="error">
                {error.text}
                {mode === 'signup' &&
                error.code === 'auth/email-already-in-use' ? (
                  <>
                    {' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="text-third-900 font-medium underline"
                    >
                      {t('Se connecter')}
                    </button>
                  </>
                ) : null}
              </Notice>
            </div>
          ) : null}
          <div role="status">{info ? <Notice>{info}</Notice> : null}</div>

          <PillButton
            type="submit"
            disabled={!ready || busy}
            aria-busy={pending === 'email'}
            className="w-full disabled:opacity-60"
          >
            {pending === 'email' || done
              ? t('Un instant…')
              : t(modeCopy.submit)}
          </PillButton>

          {mode === 'signin' ? (
            <PillButton
              variant="text"
              onClick={handleReset}
              disabled={!ready || busy}
              className="self-center disabled:opacity-60"
            >
              {pending === 'reset' ? t('Envoi…') : t('Mot de passe oublié ?')}
            </PillButton>
          ) : null}
        </form>

        <p className="font-montserrat text-label-sm flex items-center gap-4 text-gray-800 uppercase">
          <span aria-hidden className="h-px flex-1 bg-black/10" />
          {t('ou')}
          <span aria-hidden className="h-px flex-1 bg-black/10" />
        </p>

        <PillButton
          variant="outline"
          tone="dark"
          onClick={handleGoogle}
          disabled={!ready || busy}
          aria-busy={pending === 'google'}
          className="w-full disabled:opacity-60"
        >
          <span className="flex items-center gap-3">
            <GoogleLogo />
            {pending === 'google'
              ? t('Connexion avec Google…')
              : t('Continuer avec Google')}
          </span>
        </PillButton>
      </>

      {!ready && !done ? (
        <p role="status" className="font-montserrat text-body-sm text-gray-800">
          {t('Préparation de votre session…')}
        </p>
      ) : null}
    </section>
  );
}
