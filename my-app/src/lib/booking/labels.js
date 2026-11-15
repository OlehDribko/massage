/*
 * French texts for booking data and errors. API enums and English messages
 * are never shown as such. Sources: Massage-backend docs/booking.md (§6),
 * docs/notifications.md (§11), docs/auth-and-profiles.md (bookingReadiness).
 * Pure — tested with `node --test`. Texts are French keys: functions take
 * an optional `t` (src/i18n, French by default); constants are marked with
 * msg() and translated where they are shown.
 */

import { frenchT, msg } from '../../i18n/translate.js';

/** Booking `phase` (server clock) → label and badge tone. */
export const PHASES = {
  upcoming: { label: msg('À venir'), tone: 'accent' },
  in_progress: { label: msg('En cours'), tone: 'accent' },
  finished: { label: msg('Terminé'), tone: 'muted' },
  cancelled: { label: msg('Annulé'), tone: 'muted' },
};

export function phaseLabel(phase, t = frenchT) {
  return t(PHASES[phase]?.label ?? msg('Statut inconnu'));
}

export function cancelledByLabel(by, t = frenchT) {
  return by === 'admin' ? t('par le cabinet') : t('par vous');
}

/**
 * `bookingReadiness.blockers` → what the visitor must do, in the documented
 * order. `href` keeps the booking context through `retour`.
 */
export function readinessSteps(blockers, { returnTo, t = frenchT } = {}) {
  const back = returnTo ? `?retour=${encodeURIComponent(returnTo)}` : '';
  const steps = {
    not_a_client: {
      text: t('Un compte administrateur ne peut pas réserver pour lui-même.'),
    },
    anonymous_session: {
      text: t('Connectez-vous ou créez un compte.'),
      href: `/connexion${back}`,
      action: t('Se connecter'),
    },
    email_not_verified: {
      text: t('Confirmez votre adresse e-mail.'),
      href: `/compte${back}`,
      action: t('Confirmer mon e-mail'),
    },
    name_missing: {
      text: t('Indiquez votre nom.'),
      href: `/compte${back}#profil`,
      action: t('Compléter mon profil'),
    },
    phone_missing: {
      text: t('Indiquez votre numéro de téléphone.'),
      href: `/compte${back}#profil`,
      action: t('Compléter mon profil'),
    },
  };
  return (blockers ?? [])
    .filter((blocker) => steps[blocker])
    .map((blocker) => ({ blocker, ...steps[blocker] }));
}

const SLOT_REASONS = {
  too_soon: msg('Ce créneau commence dans moins de 12 heures.'),
  beyond_horizon: msg('Ce créneau est trop éloigné dans le temps.'),
  outside_schedule: msg(
    'Ce créneau ne correspond plus aux horaires du cabinet.'
  ),
  taken: msg('Ce créneau vient d’être réservé.'),
};

/** Booking API error → French message (docs/booking.md, «Коди помилок»). */
export function bookingErrorMessage(error, t = frenchT) {
  switch (error?.code) {
    case 'SLOT_UNAVAILABLE':
      return `${t(SLOT_REASONS[error.details?.reason] ?? msg('Ce créneau n’est plus disponible.'))} ${t('Choisissez un autre horaire.')}`;
    case 'SERVICE_NOT_BOOKABLE':
    case 'SERVICE_NOT_FOUND':
      return t('Cette prestation n’est plus proposée à la réservation.');
    case 'BOOKING_NOT_READY':
      return t('Votre profil doit être complété avant de réserver.');
    case 'RESCHEDULE_WINDOW_CLOSED':
      return t(
        'Le rendez-vous ne peut plus être déplacé à moins de 12 heures. Vous pouvez encore l’annuler.'
      );
    case 'CANCELLATION_WINDOW_CLOSED':
      return t(
        'Le rendez-vous a déjà commencé ou est terminé : il ne peut plus être annulé.'
      );
    case 'BOOKING_NOT_ACTIVE':
      return t('Ce rendez-vous est annulé.');
    case 'BOOKING_NOT_FOUND':
      return t('Rendez-vous introuvable.');
    case 'CALENDAR_BUSY':
      return t(
        'Le calendrier est momentanément occupé. Réessayez dans quelques secondes.'
      );
    case 'SCHEDULE_CONFLICT':
      return t(
        'Des rendez-vous confirmés se trouvent en dehors des nouveaux horaires. Annulez-les d’abord, puis enregistrez à nouveau.'
      );
    case 'VALIDATION_FAILED':
      return t(
        'Certaines informations sont invalides. Vérifiez le formulaire.'
      );
    case 'FORBIDDEN':
      return t('Vous n’avez pas accès à cette page.');
    case 'AUTH_REQUIRED':
    case 'INVALID_TOKEN':
    case 'TOKEN_EXPIRED':
    case 'SESSION_REVOKED':
      return t('Votre session a expiré. Veuillez vous reconnecter.');
    case 'AUTH_UNAVAILABLE':
      return t(
        'Le service de compte est momentanément indisponible. Réessayez dans quelques instants.'
      );
    case 'NETWORK_ERROR':
      return t(
        'Impossible de joindre le service. Vérifiez votre connexion et réessayez.'
      );
    case 'TIMEOUT':
      return t(
        'Le service met trop de temps à répondre. Réessayez dans quelques instants.'
      );
    case 'INVALID_RESPONSE':
      return t(
        'La réponse du service est incomplète. Réessayez dans quelques instants.'
      );
    case 'NOT_CONFIGURED':
      return t('Le service de réservation n’est pas encore configuré.');
    default:
      return t('Une erreur est survenue. Réessayez dans quelques instants.');
  }
}

/**
 * Errors after which the same write may be sent again by the user — with
 * the same Idempotency-Key, because the outcome is unknown: no answer
 * (network, timeout), a 5xx / CALENDAR_BUSY, or a 2xx whose body could not
 * be read (the booking may exist; the replay returns it).
 */
export function isRetryable(error) {
  return (
    [
      'NETWORK_ERROR',
      'TIMEOUT',
      'INVALID_RESPONSE',
      'CALENDAR_BUSY',
      'AUTH_UNAVAILABLE',
    ].includes(error?.code) || (error?.status ?? 0) >= 500
  );
}

/**
 * "Référence : <X-Request-Id>" for errors worth reporting (no answer from
 * the backend's logic: 5xx, unreadable answer), or null. Only the server's
 * id is shown — never the request, the token or personal data.
 */
export function errorReference(error, t = frenchT) {
  if (!error?.requestId) return null;
  const worth = error.code === 'INVALID_RESPONSE' || (error.status ?? 0) >= 500;
  return worth ? t('Référence : {id}', { id: error.requestId }) : null;
}

/** Client email about the latest change (`notification`) → text or null. */
const DONE_BY_EVENT = {
  created: msg('Le rendez-vous est bien enregistré'),
  rescheduled: msg('Le nouvel horaire est bien enregistré'),
  cancelled: msg('L’annulation est bien enregistrée'),
};

/**
 * The client's own email about the latest change (`booking.notification`).
 * The booking's state never depends on it: `null` (emails off on this
 * server) and `skipped` show nothing, `accepted` means accepted by the
 * email service, not delivered.
 */
export function clientNotificationText(notification, t = frenchT) {
  const event = notification?.event;
  switch (notification?.status) {
    case 'pending':
    case 'sending':
      return event === 'cancelled'
        ? t('Un e-mail confirmant l’annulation est en cours d’envoi.')
        : t('Un e-mail avec les détails est en cours d’envoi.');
    case 'accepted':
      return event === 'cancelled'
        ? t('Un e-mail confirmant l’annulation vous a été envoyé.')
        : t('Un e-mail avec les détails vous a été envoyé.');
    case 'failed':
      return t(
        '{done}, mais l’e-mail n’a pas pu être envoyé. Les détails restent disponibles ici.',
        { done: t(DONE_BY_EVENT[event] ?? DONE_BY_EVENT.created) }
      );
    case 'interrupted':
      return t('L’e-mail est retardé. Les détails restent disponibles ici.');
    default:
      return null; // skipped, or emails switched off (null)
  }
}

export const NOTIFICATION_EVENTS = {
  created: msg('Réservation'),
  rescheduled: msg('Déplacement'),
  cancelled: msg('Annulation'),
};

export const ADMIN_NOTIFICATION_STATUS = {
  pending: msg('En attente'),
  sending: msg('Envoi en cours'),
  accepted: msg('Accepté par le service d’envoi'),
  failed: msg('Échec'),
  skipped: msg('Non envoyé'),
  interrupted: msg('Interrompu'),
};

export const ADMIN_NOTIFICATION_REASONS = {
  scheduled: msg('envoi prévu 30 min après la dernière modification'),
  unchanged: msg('horaire revenu à celui du dernier e-mail'),
  retry_scheduled: msg('nouvel essai prévu'),
  superseded: msg('remplacé par un e-mail plus récent'),
  session_already_started: msg('séance déjà commencée'),
  test_environment: msg('environnement de test'),
  no_valid_address: msg('adresse invalide'),
  temporary_errors: msg('erreurs temporaires'),
  provider_retry_after_too_long: msg('délai du service d’envoi trop long'),
  provider_rejected: msg('refusé par le service d’envoi'),
  provider_configuration: msg('configuration du service d’envoi'),
  invalid_event: msg('événement invalide'),
  processing_interrupted: msg('traitement interrompu'),
  processing_delayed: msg('traitement retardé'),
  other: msg('autre'),
};

/** "Accepté par le service d’envoi" or "Échec (adresse invalide)". */
export function adminNotificationLabel(result, t = frenchT) {
  if (!result) return '—';
  const status = t(ADMIN_NOTIFICATION_STATUS[result.status] ?? msg('Inconnu'));
  const reason = result.reason
    ? t(
        ADMIN_NOTIFICATION_REASONS[result.reason] ??
          ADMIN_NOTIFICATION_REASONS.other
      )
    : null;
  return reason ? `${status} (${reason})` : status;
}

/** Profile `signInProvider` → label. */
export const SIGN_IN_PROVIDERS = {
  'google.com': 'Google',
  password: msg('E-mail et mot de passe'),
};
