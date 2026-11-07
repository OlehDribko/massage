/*
 * Own profile edit (PATCH /api/me, docs/auth-and-profiles.md §4):
 * `name` 1–80 characters — letters (any language), spaces, ' . - ;
 * `phone` international format with "+", stored as E.164 after a full check
 * on the server (no country guessing). `null` clears a field. The same basic
 * rules run here; the server stays the authority (libphonenumber).
 * Pure — tested with `node --test`.
 */

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;
export const MAX_NAME_LENGTH = 80;

export function validateName(value) {
  const name = value.trim();
  if (!name) return null; // empty = clear the field
  if (name.length > MAX_NAME_LENGTH) {
    return `${MAX_NAME_LENGTH} caractères maximum.`;
  }
  if (!NAME_PATTERN.test(name)) {
    return 'Lettres, espaces, apostrophes, points et tirets uniquement.';
  }
  return null;
}

export function validatePhone(value) {
  const phone = value.trim();
  if (!phone) return null;
  if (!/^\+[\d\s().-]{6,}$/.test(phone)) {
    return 'Format international avec indicatif, par exemple +33 6 12 34 56 78.';
  }
  return null;
}

/**
 * Body with only the changed fields (empty → null). `null` when nothing
 * changed.
 */
export function profileChanges(profile, form) {
  const changes = {};
  const name = form.name.trim() || null;
  const phone = form.phone.trim() || null;
  if (name !== (profile.name ?? null)) changes.name = name;
  // The server stores E.164: compare digits so "+33 6 12…" equals "+33612…".
  const digits = (value) => (value ?? '').replace(/[^\d+]/g, '') || null;
  if (digits(phone) !== digits(profile.phone)) changes.phone = phone;
  return Object.keys(changes).length ? changes : null;
}

/** VALIDATION_FAILED `errors: [{ field: ['phone'], … }]` → { phone: text }. */
export function profileServerErrors(error) {
  const result = {};
  for (const issue of error?.details?.errors ?? []) {
    const field = issue?.field?.[0];
    if (field === 'name') result.name = 'Ce nom n’est pas accepté.';
    if (field === 'phone') {
      result.phone =
        'Numéro invalide : utilisez le format international, par exemple +33 6 12 34 56 78.';
    }
  }
  return result;
}
