/*
 * Translation keys of the code: every French text passed to t('…') or
 * marked with msg('…') (src/i18n/translate.js), plus the few texts read
 * from configuration objects. Administration files (src/components/admin,
 * src/app/[lang]/admin, src/lib/admin) form their own set: they are
 * translated into Ukrainian only.
 *
 * `node scripts/i18n-keys.mjs` lists the keys missing per language;
 * tests/i18n/messages.test.mjs fails on any.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const KEY = /\b(?:t|msg)\(\s*(['"`])((?:\\.|(?!\1)[^\\])*?)\1\s*[,)]/gs;
const ADMIN = [
  /\/components\/admin\//,
  /\/app\/\[lang\]\/admin\//,
  /\/lib\/admin\//,
];

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* files(full);
    else if (/\.(js|jsx|mjs)$/.test(name)) yield full;
  }
}

const unescape = (text) => text.replace(/\\(['"`\\])/g, '$1');

export function collectKeys() {
  const sets = { public: new Map(), admin: new Map() };
  for (const file of files(path.join(root, 'src'))) {
    // The i18n module itself (its doc examples) holds no texts of the site.
    if (file.includes(`${path.sep}src${path.sep}i18n${path.sep}`)) continue;
    const rel = path.relative(root, file);
    const scope = ADMIN.some((re) => re.test(`/${rel}`)) ? 'admin' : 'public';
    for (const match of readFileSync(file, 'utf8').matchAll(KEY)) {
      const key = unescape(match[2]);
      if (match[1] === '`' && key.includes('${')) continue;
      if (!sets[scope].has(key)) sets[scope].set(key, rel);
    }
  }
  return sets;
}

/** Texts translated through t(variable) from configuration objects. */
export async function configKeys() {
  const { SITE, BUSINESS } = await import('../src/config/site.js');
  const { MARKETING_CONSENT } = await import('../src/config/marketing.js');
  return [
    SITE.description,
    SITE.ogImage.alt,
    BUSINESS.openingHours.display,
    MARKETING_CONSENT.text,
  ];
}

export async function missingKeys() {
  const { default: en } = await import('../src/i18n/messages/en.js');
  const { default: uk } = await import('../src/i18n/messages/uk.js');
  const { default: ru } = await import('../src/i18n/messages/ru.js');
  const { default: adminUk } = await import('../src/i18n/messages/admin.uk.js');
  const { public: publicKeys, admin } = collectKeys();
  const all = [...publicKeys.keys(), ...(await configKeys())];
  const missing = {
    en: all.filter((key) => !(key in en)),
    uk: all.filter((key) => !(key in uk)),
    ru: all.filter((key) => !(key in ru)),
    'admin.uk': [...admin.keys()].filter(
      (key) => !(key in adminUk) && !(key in uk)
    ),
  };
  return missing;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const missing = await missingKeys();
  const json = process.argv.includes('--json');
  if (json) {
    console.log(JSON.stringify(missing, null, 2));
  } else {
    for (const [lang, keys] of Object.entries(missing)) {
      console.log(`${lang}: ${keys.length} missing`);
      for (const key of keys) console.log(`  ${JSON.stringify(key)}`);
    }
  }
}
