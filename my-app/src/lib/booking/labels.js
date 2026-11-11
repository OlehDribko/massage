/*
 * French texts for booking data and errors. API enums and English messages
 * are never shown as such. Sources: Massage-backend docs/booking.md (§6),
 * docs/notifications.md (§11), docs/auth-and-profiles.md (bookingReadiness).
 * Pure — tested with `node --test`.
 */

/** Booking `phase` (server clock) → label and badge tone. */
export const PHASES = {
  upcoming: { label: 'À venir', tone: 'accent' },
  in_progress: { label: 'En cours', tone: 'accent' },
  finished: { label: 'Terminé', tone: 'muted' },
  cancelled: { label: 'Annulé', tone: 'muted' },
};

export function phaseLabel(phase) {
  return PHASES[phase]?.label ?? 'Statut inconnu';
}

export function cancelledByLabel(by) {
  return by === 'admin' ? 'par le cabinet' : 'par vous';
}

/**
 * `bookingReadiness.blockers` → what the visitor must do, in the documented
 * order. `href` keeps the booking context through `retour`.
 */
export function readinessSteps(blockers, { returnTo } = {}) {
  const back = returnTo ? `?retour=${encodeURIComponent(returnTo)}` : '';
  const steps = {
    not_a_client: {
      text: 'Un compte administrateur ne peut pas réserver pour lui-même.',
    },
    anonymous_session: {
      text: 'Connectez-vous ou créez un compte.',
      href: `/connexion${back}`,
      action: 'Se connecter',
    },
    email_not_verified: {
      text: 'Confirmez votre adresse e-mail.',
      href: `/compte${back}`,
      action: 'Confirmer mon e-mail',
    },
    name_missing: {
      text: 'Indiquez votre nom.',
      href: `/compte${back}#profil`,
      action: 'Compléter mon profil',
    },
    phone_missing: {
      text: 'Indiquez votre numéro de téléphone.',
      href: `/compte${back}#profil`,
      action: 'Compléter mon profil',
    },
  };
  return (blockers ?? [])
    .filter((blocker) => steps[blocker])
    .map((blocker) => ({ blocker, ...steps[blocker] }));
}

const SLOT_REASONS = {
  too_soon: 'Ce créneau commence dans moins de 12 heures.',
  beyond_horizon: 'Ce créneau est trop éloigné dans le temps.',
  outside_schedule: 'Ce créneau ne correspond plus aux horaires du cabinet.',
  taken: 'Ce créneau vient d’être réservé.',
};

/** Booking API error → French message (docs/booking.md, «Коди помилок»). */
export function bookingErrorMessage(error) {
  switch (error?.code) {
    case 'SLOT_UNAVAILABLE':
      return `${SLOT_REASONS[error.details?.reason] ?? 'Ce créneau n’est plus disponible.'} Choisissez un autre horaire.`;
    case 'SERVICE_NOT_BOOKABLE':
    case 'SERVICE_NOT_FOUND':
      return 'Cette prestation n’est plus proposée à la réservation.';
    case 'BOOKING_NOT_READY':
      return 'Votre profil doit être complété avant de réserver.';
    case 'RESCHEDULE_WINDOW_CLOSED':
      return 'Le rendez-vous ne peut plus être déplacé à moins de 12 heures. Vous pouvez encore l’annuler.';
    case 'CANCELLATION_WINDOW_CLOSED':
      return 'Le rendez-vous a déjà commencé ou est terminé : il ne peut plus être annulé.';
    case 'BOOKING_NOT_ACTIVE':
      return 'Ce rendez-vous est annulé.';
    case 'BOOKING_NOT_FOUND':
      return 'Rendez-vous introuvable.';
    case 'CALENDAR_BUSY':
      return 'Le calendrier est momentanément occupé. Réessayez dans quelques secondes.';
    case 'SCHEDULE_CONFLICT':
      return 'Des rendez-vous confirmés se trouvent en dehors des nouveaux horaires. Annulez-les d’abord, puis enregistrez à nouveau.';
    case 'VALIDATION_FAILED':
      return 'Certaines informations sont invalides. Vérifiez le formulaire.';
    case 'FORBIDDEN':
      return 'Vous n’avez pas accès à cette page.';
    case 'AUTH_REQUIRED':
    case 'INVALID_TOKEN':
    case 'TOKEN_EXPIRED':
    case 'SESSION_REVOKED':
      return 'Votre session a expiré. Veuillez vous reconnecter.';
    case 'AUTH_UNAVAILABLE':
      return 'Le service de compte est momentanément indisponible. Réessayez dans quelques instants.';
    case 'NETWORK_ERROR':
      return 'Impossible de joindre le service. Vérifiez votre connexion et réessayez.';
    default:
      return 'Une erreur est survenue. Réessayez dans quelques instants.';
  }
}

/** Errors after which the same write may be sent again by the user. */
export function isRetryable(error) {
  return (
    ['NETWORK_ERROR', 'CALENDAR_BUSY', 'AUTH_UNAVAILABLE'].includes(
      error?.code
    ) || (error?.status ?? 0) >= 500
  );
}

/** Client email about the latest change (`notification`) → text or null. */
const DONE_BY_EVENT = {
  created: 'Le rendez-vous est bien enregistré',
  rescheduled: 'Le nouvel horaire est bien enregistré',
  cancelled: 'L’annulation est bien enregistrée',
};

/**
 * The client's own email about the latest change (`booking.notification`).
 * The booking's state never depends on it: `null` (emails off on this
 * server) and `skipped` show nothing, `accepted` means accepted by the
 * email service, not delivered.
 */
export function clientNotificationText(notification) {
  const event = notification?.event;
  switch (notification?.status) {
    case 'pending':
    case 'sending':
      return event === 'cancelled'
        ? 'Un e-mail confirmant l’annulation est en cours d’envoi.'
        : 'Un e-mail avec les détails est en cours d’envoi.';
    case 'accepted':
      return event === 'cancelled'
        ? 'Un e-mail confirmant l’annulation vous a été envoyé.'
        : 'Un e-mail avec les détails vous a été envoyé.';
    case 'failed':
      return `${DONE_BY_EVENT[event] ?? DONE_BY_EVENT.created}, mais l’e-mail n’a pas pu être envoyé. Les détails restent disponibles ici.`;
    case 'interrupted':
      return 'L’e-mail est retardé. Les détails restent disponibles ici.';
    default:
      return null; // skipped, or emails switched off (null)
  }
}

export const NOTIFICATION_EVENTS = {
  created: 'Réservation',
  rescheduled: 'Déplacement',
  cancelled: 'Annulation',
};

export const ADMIN_NOTIFICATION_STATUS = {
  pending: 'En attente',
  sending: 'Envoi en cours',
  accepted: 'Accepté par le service d’envoi',
  failed: 'Échec',
  skipped: 'Non envoyé',
  interrupted: 'Interrompu',
};

export const ADMIN_NOTIFICATION_REASONS = {
  scheduled: 'envoi prévu 30 min après la dernière modification',
  unchanged: 'horaire revenu à celui du dernier e-mail',
  retry_scheduled: 'nouvel essai prévu',
  superseded: 'remplacé par un e-mail plus récent',
  session_already_started: 'séance déjà commencée',
  test_environment: 'environnement de test',
  no_valid_address: 'adresse invalide',
  temporary_errors: 'erreurs temporaires',
  provider_retry_after_too_long: 'délai du service d’envoi trop long',
  provider_rejected: 'refusé par le service d’envoi',
  provider_configuration: 'configuration du service d’envoi',
  invalid_event: 'événement invalide',
  processing_interrupted: 'traitement interrompu',
  processing_delayed: 'traitement retardé',
  other: 'autre',
};

/** "Accepté par le service d’envoi" or "Échec (adresse invalide)". */
export function adminNotificationLabel(result) {
  if (!result) return '—';
  const status = ADMIN_NOTIFICATION_STATUS[result.status] ?? 'Inconnu';
  const reason = result.reason
    ? (ADMIN_NOTIFICATION_REASONS[result.reason] ??
      ADMIN_NOTIFICATION_REASONS.other)
    : null;
  return reason ? `${status} (${reason})` : status;
}

/** Profile `signInProvider` → label. */
export const SIGN_IN_PROVIDERS = {
  'google.com': 'Google',
  password: 'E-mail et mot de passe',
};
