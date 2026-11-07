/*
 * Newsletter consent (Massage-backend docs/auth-and-profiles.md, «Модель
 * маркетингової згоди»). The text shown next to every opt-in and its
 * version go together: the API stores the version with the consent and
 * refuses an outdated one (409 CONSENT_TEXT_OUTDATED). Changing the wording
 * = a new version here AND in the backend (MARKETING_CONSENT_TEXT_VERSION).
 *
 * TODO before release: confirm with the owner that this wording is the
 * approved text of version 2026-10-28.fr.1.
 */
export const MARKETING_CONSENT = {
  version: '2026-10-28.fr.1',
  text: 'En vous inscrivant, vous acceptez de recevoir par e-mail les offres et actualités du cabinet. Un lien de confirmation vous sera envoyé ; désinscription possible à tout moment.',
};
