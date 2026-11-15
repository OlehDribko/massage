/*
 * npm run i18n:catalog — compares the French catalogue texts of the API
 * (GET <NEXT_PUBLIC_API_BASE_URL>/api/services, read-only) with the sources
 * of the translations in src/content/i18n. Every line printed is a text to
 * translate again (the site shows the French text meanwhile).
 */
import { catalogDrift } from '../src/lib/booking/catalogI18n.js';

const base = process.env.NEXT_PUBLIC_API_BASE_URL || process.argv[2];
if (!base) {
  console.error('Set NEXT_PUBLIC_API_BASE_URL or pass the API origin.');
  process.exit(2);
}
const response = await fetch(new URL('/api/services', base));
const { services } = await response.json();
const drift = catalogDrift(services);
if (!drift.length) {
  console.log(`OK — ${services.length} services, translations up to date.`);
} else {
  for (const item of drift) {
    console.log(`\n[${item.field}] ${item.id}`);
    console.log(`  API:    ${JSON.stringify(item.api)}`);
    console.log(`  source: ${JSON.stringify(item.source)}`);
  }
  console.log(`\n${drift.length} text(s) to update in src/content/i18n.`);
  process.exitCode = 1;
}
