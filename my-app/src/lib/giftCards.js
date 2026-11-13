/*
 * Gift card requests (cartes cadeaux): pure logic and French texts.
 * Contract: Massage-backend docs/gift-card-requests.md and
 * docs/frontend-handoff.md §5. The studio handles each request by hand:
 * no online payment, no card code, no automatic issue — no text here may
 * say the card is paid or issued.
 * No React, relative imports only — tested with `node --test`.
 */

/** Largest amount the API stores (INTEGER column), in cents. */
export const MAX_AMOUNT_CENTS = 2147483647;
export const MAX_DESCRIPTION = 1000;

/**
 * Amount typed in euros → integer cents, without float arithmetic.
 * Accepts "150", "150,5", "150.50", "1 500", "1 500,00 €".
 * Returns `{ cents }` or `{ error }` (French message).
 */
export function parseEuroAmount(input) {
  const text = String(input ?? '')
    .replace(/[\s  ]/g, '')
    .replace(/€$/, '')
    .replace(/^€/, '');
  if (!text) return { error: 'Indiquez le montant de la carte cadeau.' };
  const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(text);
  if (!match) {
    return {
      error:
        'Montant invalide : indiquez un nombre en euros, par exemple 80 ou 80,50.',
    };
  }
  const euros = match[1].replace(/^0+(?=\d)/, '');
  const fraction = (match[2] ?? '').padEnd(2, '0');
  if (euros.length > 8) return { error: 'Ce montant est trop élevé.' };
  const cents = Number(euros) * 100 + Number(fraction);
  if (cents <= 0) return { error: 'Le montant doit être supérieur à 0 €.' };
  if (cents > MAX_AMOUNT_CENTS) return { error: 'Ce montant est trop élevé.' };
  return { cents };
}

/**
 * Body of POST /api/gift-card-requests: only the documented fields.
 * Contacts are never sent (the server reads them from the profile and the
 * verified identity); an empty description is left out.
 */
export function requestBody({ amountCents, description, channel }) {
  const text = (description ?? '').trim();
  return {
    amountCents,
    ...(text ? { description: text } : {}),
    preferredContactChannel: channel,
  };
}

/**
 * Text the server refuses (control characters other than line breaks and
 * tabs) — checked before sending.
 */
export function descriptionError(description) {
  const text = (description ?? '').trim();
  if (text.length > MAX_DESCRIPTION) {
    return `${MAX_DESCRIPTION} caractères maximum.`;
  }
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) {
    return 'Ce message contient des caractères non autorisés.';
  }
  return null;
}

/*
 * What the card offers: a free amount, or one soin of the catalogue. The
 * API only knows an amount and a message, so a soin is sent as its current
 * price plus « Soin offert : … » at the top of the message (the admin
 * reads it there).
 */
export const GIFT_KINDS = [
  { value: 'amount', label: 'Un montant' },
  { value: 'soin', label: 'Un soin' },
];

/**
 * Catalogue (lib/booking/catalog buildCatalog) → choices grouped by
 * prestation: `[{ name, options: [{ id, label, title, cents, currency }] }]`.
 */
export function soinOptions(catalog) {
  return (catalog ?? [])
    .map((prestation) => ({
      name: prestation.name,
      options: prestation.variants
        .filter((variant) => Number.isInteger(variant.effectivePriceCents))
        .map((variant) => ({
          id: variant.id,
          label: `${variant.durationMinutes} min`,
          title: `${prestation.name} — ${variant.durationMinutes} min`,
          cents: variant.effectivePriceCents,
          currency: variant.currency ?? 'EUR',
        })),
    }))
    .filter((group) => group.options.length > 0);
}

export const soinLine = (option) => `Soin offert : ${option.title}`;

/** Room left for the visitor's own message once the soin line is added. */
export const messageLimit = (option) =>
  option ? MAX_DESCRIPTION - soinLine(option).length - 2 : MAX_DESCRIPTION;

/** The message sent: the soin line (if any), then the visitor's text. */
export function giftDescription(option, message) {
  const text = (message ?? '').trim();
  if (!option) return text;
  return text ? `${soinLine(option)}\n\n${text}` : soinLine(option);
}

export const CONTACT_CHANNELS = [
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Téléphone' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

export function channelLabel(value) {
  return (
    CONTACT_CHANNELS.find((channel) => channel.value === value)?.label ?? '—'
  );
}

/** Request status → label and badge tone (StatusBadge). */
export const GIFT_STATUSES = {
  new: { label: 'Nouvelle', tone: 'accent' },
  in_progress: { label: 'En cours', tone: 'accent' },
  completed: { label: 'Traitée', tone: 'muted' },
  cancelled: { label: 'Clôturée', tone: 'muted' },
};

export function statusLabel(status) {
  return GIFT_STATUSES[status]?.label ?? 'Statut inconnu';
}

/**
 * Button for a target status, from the current one. `completed` means the
 * manual handling is finished — never "paid" or "card issued".
 */
export function statusAction(from, to) {
  if (to === 'in_progress') {
    return from === 'new'
      ? { label: 'Prendre en charge', tone: 'primary' }
      : { label: 'Rouvrir', tone: 'outline' };
  }
  if (to === 'completed') {
    return { label: 'Marquer comme traitée', tone: 'primary' };
  }
  if (to === 'cancelled') return { label: 'Clôturer', tone: 'danger' };
  return { label: statusLabel(to), tone: 'outline' };
}

/** History entry → "Demande reçue" / "Nouvelle → En cours". */
export function historyTitle(entry) {
  if (!entry.fromStatus) return 'Demande reçue';
  if (entry.toStatus === 'in_progress' && entry.fromStatus !== 'new') {
    return `Rouverte (${statusLabel(entry.fromStatus).toLowerCase()} → en cours)`;
  }
  return `${statusLabel(entry.fromStatus)} → ${statusLabel(entry.toStatus).toLowerCase()}`;
}

/**
 * `blockers` (GIFT_CARD_REQUEST_NOT_READY or bookingReadiness) → what the
 * visitor must do. `returnTo` brings them back to the open form.
 */
export function giftReadinessSteps(blockers, { returnTo } = {}) {
  const back = returnTo ? `?retour=${encodeURIComponent(returnTo)}` : '';
  const steps = {
    not_a_client: {
      text: 'Un compte administrateur ne peut pas demander de carte cadeau.',
    },
    anonymous_session: {
      text: 'Connectez-vous ou créez un compte client.',
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
    phone_invalid: {
      text: 'Le numéro de téléphone de votre profil n’est pas valide.',
      href: `/compte${back}#profil`,
      action: 'Modifier mon numéro',
    },
  };
  return (blockers ?? [])
    .filter((blocker) => steps[blocker])
    .map((blocker) => ({ blocker, ...steps[blocker] }));
}

function waitText(seconds) {
  if (!seconds) return 'plus tard';
  if (seconds < 90) return 'dans quelques instants';
  const hours = Math.ceil(seconds / 3600);
  if (seconds < 3600) return `dans ${Math.ceil(seconds / 60)} minutes`;
  return hours === 1 ? 'dans 1 heure' : `dans ${hours} heures`;
}

/** API error of a gift card call → French message. */
export function giftCardErrorMessage(error) {
  switch (error?.code) {
    case 'GIFT_CARD_REQUEST_NOT_READY':
      return 'Votre compte doit être complété avant d’envoyer la demande.';
    case 'GIFT_CARD_REQUEST_LIMIT_REACHED':
      return `Vous avez envoyé plusieurs demandes aujourd’hui. Réessayez ${waitText(error.retryAfterSeconds)}.`;
    case 'GIFT_CARD_REQUEST_BUSY':
      return 'Le service est momentanément occupé. Réessayez dans quelques secondes.';
    case 'IDEMPOTENCY_KEY_REUSED':
      return 'La demande a changé pendant l’envoi. Vérifiez-la puis renvoyez-la.';
    case 'VALIDATION_FAILED':
      return 'Certaines informations sont invalides. Vérifiez le formulaire.';
    case 'GIFT_CARD_REQUEST_NOT_FOUND':
      return 'Demande introuvable.';
    case 'GIFT_CARD_STATUS_TRANSITION_NOT_ALLOWED':
      return 'Ce changement de statut n’est plus possible : la demande vient d’être mise à jour.';
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

/**
 * Outcome unknown (network, 5xx, busy): the next try must reuse the same
 * Idempotency-Key and body, so the server never records the request twice.
 * GIFT_CARD_REQUEST_NOT_READY too: after fixing the profile the documented
 * retry is with the same key.
 */
export function keepsIdempotencyKey(error) {
  return (
    [
      'NETWORK_ERROR',
      'GIFT_CARD_REQUEST_BUSY',
      'AUTH_UNAVAILABLE',
      'GIFT_CARD_REQUEST_NOT_READY',
      'GIFT_CARD_REQUEST_LIMIT_REACHED',
    ].includes(error?.code) || (error?.status ?? 0) >= 500
  );
}

/* --- Administration --------------------------------------------------- */

export const PAGE_SIZE = 20;

/** "YYYY-MM-DD" or empty; anything else is dropped. */
const isLocalDate = (value) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

/**
 * List filters from the address (?statut=&du=&au=&page=), validated:
 * unknown values are ignored instead of sent (the API answers 400).
 */
export function readListFilters(params) {
  const get = (name) => params?.get?.(name) ?? null;
  const status = GIFT_STATUSES[get('statut')] ? get('statut') : '';
  const from = isLocalDate(get('du')) ? get('du') : '';
  const to = isLocalDate(get('au')) ? get('au') : '';
  const page = Math.max(1, Number.parseInt(get('page') ?? '1', 10) || 1);
  return { status, from, to, page };
}

/** Address query of the admin list (empty filters left out). */
export function listSearch({ status, from, to, page }) {
  const query = new URLSearchParams();
  if (status) query.set('statut', status);
  if (from) query.set('du', from);
  if (to) query.set('au', to);
  if (page > 1) query.set('page', String(page));
  const text = query.toString();
  return text ? `?${text}` : '';
}

/** GET /api/admin/gift-card-requests path for the filters. */
export function listApiPath({ status, from, to, page }, pageSize = PAGE_SIZE) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (status) query.set('status', status);
  if (from) query.set('createdFrom', from);
  if (to) query.set('createdTo', to);
  return `/api/admin/gift-card-requests?${query}`;
}

export function pageCount(total, pageSize) {
  return Math.max(1, Math.ceil((total ?? 0) / (pageSize || PAGE_SIZE)));
}
