/*
 * Newsletter states and messages (Massage-backend docs/frontend-handoff.md
 * §4, docs/auth-and-profiles.md). Pure — tested with `node --test`.
 *
 * - Availability comes only from a LOADED profile (`marketingAvailable`);
 *   a profile still loading or failed is "unknown", never "off".
 * - A verified, registered user subscribing their own address uses the
 *   account route (active at once); everything else uses the public form
 *   route (confirmation link). An account-route failure never falls back to
 *   the public route.
 * - The subscription and the welcome / confirmation email are different
 *   things: an active subscription is never reported as failed because an
 *   email was not sent.
 *
 * Texts: functions take an optional `t` (src/i18n) — French by default.
 */

import { frenchT } from '../i18n/translate.js';

/** 'on' | 'off' | 'unknown' from the auth snapshot's profile. */
export function marketingAvailability(profileState) {
  if (profileState?.status !== 'ready' || !profileState.data) return 'unknown';
  const available = profileState.data.marketingAvailable;
  if (available === true) return 'on';
  if (available === false) return 'off';
  return 'unknown';
}

/** Registered account with a verified email (the server checks the same). */
export function isVerifiedOwner(view) {
  const profile = view?.profile;
  return Boolean(
    profile &&
    profile.authState === 'registered' &&
    profile.emailVerified === true &&
    profile.email
  );
}

const normalise = (email) => (email ?? '').trim().toLowerCase();

/**
 * Route for the home page form: 'account' only for the verified owner's
 * own address; 'public' for guests, unknown profiles, unverified emails or
 * another address.
 */
export function newsletterRoute(view, email) {
  if (!isVerifiedOwner(view)) return 'public';
  return normalise(email) === normalise(view.profile.email)
    ? 'account'
    : 'public';
}

/** 'none' | 'pending' | 'subscribed' | null (unknown until verified). */
export function subscriptionState(marketing) {
  if (!marketing) return null;
  if (marketing.subscribed) return 'subscribed';
  if (marketing.pendingConfirmation) return 'pending';
  return 'none';
}

/**
 * Answer of POST /api/me/marketing/subscription → what to show.
 * `{ tone: 'success' | 'info', text, active, retryAfterSeconds? }`.
 */
export function ownSubscriptionResult(result, t = frenchT) {
  switch (result?.outcome) {
    case 'subscribed':
      return {
        tone: 'success',
        active: true,
        text:
          result.welcomeEmail === 'sent'
            ? t(
                'Vous êtes inscrit·e à la newsletter. Un e-mail de bienvenue vous a été envoyé.'
              )
            : t('Vous êtes inscrit·e à la newsletter.'),
      };
    case 'already_subscribed':
      return {
        tone: 'success',
        active: true,
        text: t('Vous êtes déjà inscrit·e à la newsletter.'),
      };
    case 'confirmation_sent':
      return {
        tone: 'info',
        active: false,
        text: t(
          'Un lien de confirmation vous a été envoyé par e-mail : ouvrez-le pour activer l’inscription.'
        ),
      };
    case 'no_action':
      return result.retryAfterSeconds
        ? {
            tone: 'info',
            active: false,
            retryAfterSeconds: result.retryAfterSeconds,
            text: t(
              'Un e-mail de confirmation a déjà été envoyé récemment. Vous pourrez en demander un nouveau {wait}.',
              { wait: waitText(result.retryAfterSeconds, t) }
            ),
          }
        : {
            tone: 'info',
            active: false,
            text: t(
              'Votre demande est déjà enregistrée. Aucun nouvel e-mail n’est nécessaire pour le moment.'
            ),
          };
    default:
      return {
        tone: 'info',
        active: false,
        text: t('Votre demande a été prise en compte.'),
      };
  }
}

/**
 * `marketingOptIn` of a sign-up sync → message, or null when there is
 * nothing to say. The sync itself succeeded whatever the outcome.
 */
export function signupOptInMessage(optIn, t = frenchT) {
  switch (optIn?.outcome) {
    case 'subscribed':
      return {
        tone: 'success',
        text: t('Vous êtes inscrit·e à la newsletter.'),
      };
    case 'already_subscribed':
      return {
        tone: 'success',
        text: t('Vous êtes déjà inscrit·e à la newsletter.'),
      };
    case 'confirmation_sent':
      return {
        tone: 'info',
        text: t(
          'Newsletter : un lien de confirmation vous a été envoyé par e-mail.'
        ),
      };
    case 'delivery_failed':
      return {
        tone: 'error',
        text: t(
          'Newsletter : l’e-mail de confirmation n’a pas pu être envoyé. Vous pourrez vous inscrire depuis votre compte.'
        ),
      };
    case 'test_recipient_not_allowed':
      return {
        tone: 'error',
        text: t(
          'Newsletter : adresse non autorisée sur l’environnement de test.'
        ),
      };
    case 'consent_text_outdated':
    case 'failed':
      return {
        tone: 'error',
        text: t(
          'Newsletter : l’inscription n’a pas pu être enregistrée. Vous pourrez vous inscrire depuis votre compte.'
        ),
      };
    default:
      // no_action (e.g. unsubscribed earlier: only the explicit button
      // subscribes again), unavailable: nothing to claim.
      return null;
  }
}

/** "dans 7 minutes" / "dans 40 secondes". */
export function waitText(seconds, t = frenchT) {
  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60);
    return t('dans {n} minute|dans {n} minutes', { n: minutes });
  }
  return t('dans {n} seconde|dans {n} secondes', { n: seconds });
}

/** French message for a subscription error (both routes). */
export function marketingErrorMessage(error, t = frenchT) {
  if (error?.status === 404 || error?.code === 'NOT_CONFIGURED') {
    return t('L’inscription à la newsletter n’est pas encore ouverte.');
  }
  switch (error?.code) {
    case 'TEST_RECIPIENT_NOT_ALLOWED':
      return t('Adresse non autorisée sur l’environnement de test.');
    case 'VALIDATION_FAILED':
      return t('Adresse e-mail invalide.');
    case 'CONFIRMATION_EMAIL_NOT_SENT':
      return error.retryAfterSeconds
        ? t(
            'L’e-mail de confirmation n’a pas pu être envoyé. Réessayez {wait}.',
            {
              wait: waitText(error.retryAfterSeconds, t),
            }
          )
        : t(
            'L’e-mail de confirmation n’a pas pu être envoyé. Réessayez dans quelques minutes.'
          );
    case 'CONSENT_TEXT_OUTDATED':
      return t(
        'Le texte de consentement a changé. Rechargez la page puis réessayez.'
      );
    case 'REGISTERED_ACCOUNT_REQUIRED':
      return t('Connectez-vous à votre compte pour gérer la newsletter.');
    case 'EMAIL_NOT_VERIFIED':
      return t('Confirmez d’abord votre adresse e-mail.');
    case 'NETWORK_ERROR':
      return t(
        'Impossible de joindre le service. Vérifiez votre connexion et réessayez.'
      );
    default:
      // Gateway throttling has no documented code: only the HTTP status.
      if (error?.status === 429) {
        return error.retryAfterSeconds
          ? t('Trop de demandes. Réessayez {wait}.', {
              wait: waitText(error.retryAfterSeconds, t),
            })
          : t('Trop de demandes. Réessayez dans quelques minutes.');
      }
      return t('Une erreur est survenue. Réessayez dans quelques instants.');
  }
}
