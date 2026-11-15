import en from './en.js';
import ru from './ru.js';
import uk from './uk.js';
import adminUk from './admin.uk.js';

/*
 * Dictionaries: « texte français » → translation. French needs none (the
 * keys are French). The administration exists in French and Ukrainian only:
 * its texts are in admin.uk.js and are not sent to the public pages.
 */
const PUBLIC = { en, uk, ru };
const ADMIN = { uk: adminUk };

export function getMessages(locale, { admin = false } = {}) {
  const base = PUBLIC[locale] ?? {};
  return admin ? { ...base, ...(ADMIN[locale] ?? {}) } : base;
}
