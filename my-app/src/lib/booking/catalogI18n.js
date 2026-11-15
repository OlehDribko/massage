/*
 * Catalogue texts in the visitor's language. The API sends names,
 * descriptions and features in French only; translations live in
 * src/content/i18n (by prestation key and service id) next to the French
 * text they were made from. A translation is used only while that French
 * source still equals the API text: when the backend text changes, the
 * French text is shown until the translation is updated (see README,
 * « Traductions du catalogue », and `npm run i18n:catalog`). Prices,
 * durations and availability are never translated data — always the API's.
 * Pure — tested with `node --test`.
 */

import { SERVICE_NAMES } from '../../content/i18n/serviceNames.js';
import { SERVICE_TEXTS } from '../../content/i18n/serviceTexts.js';
import { GROUP_OF, localizedServiceName, sameText } from './serviceName.js';

export { localizedServiceName };

const sameList = (a, b) =>
  (a ?? []).length === (b ?? []).length &&
  (a ?? []).every((item, index) => sameText(item, b[index]));

/** `{ description, features }` of a service in `locale`. */
export function localizedServiceTexts(service, locale) {
  const description = service?.description ?? null;
  const features = service?.features ?? [];
  if (!locale || locale === 'fr' || !service) return { description, features };
  const entry = SERVICE_TEXTS[service.id];
  const translated = entry?.[locale];
  if (!translated) return { description, features };
  return {
    description:
      description && sameText(entry.fr.description, description)
        ? translated.description
        : description,
    features: sameList(entry.fr.features, features)
      ? translated.features
      : features,
  };
}

/** A service of the API with its texts in `locale`. */
export function localizeService(service, locale) {
  if (!service || !locale || locale === 'fr') return service;
  return {
    ...service,
    name: localizedServiceName(service, locale),
    ...localizedServiceTexts(service, locale),
  };
}

/** Catalogue (lib/booking/catalog.js) with every text in `locale`. */
export function localizeCatalog(catalog, locale) {
  if (!catalog || !locale || locale === 'fr') return catalog;
  return catalog.map((prestation) => {
    const variants = prestation.variants.map((service) =>
      localizeService(service, locale)
    );
    return {
      ...prestation,
      name: localizedServiceName(
        {
          key: prestation.key,
          id: prestation.variants[0]?.id,
          name: prestation.name,
        },
        locale
      ),
      description: variants[0]?.description ?? prestation.description,
      features: variants[0]?.features ?? prestation.features,
      variants,
    };
  });
}

/**
 * API services whose French texts differ from the sources of the
 * translations (or have none): what to translate again.
 * → [{ id, field, api, source }]
 */
export function catalogDrift(services) {
  const drift = [];
  for (const service of services ?? []) {
    const entry = SERVICE_TEXTS[service.id];
    const groupKey = GROUP_OF.get(service.id);
    const nameEntry = groupKey ? SERVICE_NAMES[groupKey] : null;
    if (!entry || !nameEntry) {
      drift.push({
        id: service.id,
        field: 'missing',
        api: service.name,
        source: null,
      });
      continue;
    }
    if (!sameText(nameEntry.fr, service.name)) {
      drift.push({
        id: service.id,
        field: 'name',
        api: service.name,
        source: nameEntry.fr,
      });
    }
    if (!sameText(entry.fr.description, service.description)) {
      drift.push({
        id: service.id,
        field: 'description',
        api: service.description,
        source: entry.fr.description,
      });
    }
    if (!sameList(entry.fr.features, service.features)) {
      drift.push({
        id: service.id,
        field: 'features',
        api: service.features,
        source: entry.fr.features,
      });
    }
  }
  return drift;
}
