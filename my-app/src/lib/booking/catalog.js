/*
 * Catalogue display. In the API every duration is its own service ("Massage
 * sportif" 55 / 90 / 120 min = three ids). The editorial layer
 * (src/content/services.js) lists which ids are durations of one prestation;
 * nothing is merged by name. Pure — tested with `node --test`.
 */

import { describeFailure } from '../api/diagnostics.js';

const byDuration = (a, b) => a.durationMinutes - b.durationMinutes;

/**
 * API services + editorial groups → prestations in editorial order:
 * `{ key, name, description, features, featured, category, variants }`. A
 * grouped id missing from the API (archived) is skipped; a variant whose API
 * name differs from the first one (renamed later) and any service unknown to
 * the layer get a card of their own, after the listed ones, in API order.
 *
 * Texts: the API gives `description` and `features` per service, that is
 * per duration (backend migration 20261103120100: « un texte par durée »).
 * They stay on each variant; where one text stands for the whole prestation
 * (home accordion, JSON-LD), it is the text of `variants[0]` — the shortest
 * duration, the one those places link to. See `variantTexts`.
 */
export function buildCatalog(services, groups) {
  const byId = new Map(
    (services ?? []).map((service) => [service.id, service])
  );
  const used = new Set();
  const catalog = [];

  for (const group of groups ?? []) {
    const variants = group.serviceIds.map((id) => byId.get(id)).filter(Boolean);
    if (!variants.length) continue;
    const name = variants[0].name;
    const same = variants.filter((service) => service.name === name);
    same.forEach((service) => used.add(service.id));
    const sorted = same.sort(byDuration);
    catalog.push({
      key: group.key,
      name,
      ...variantTexts(sorted[0]),
      featured: Boolean(group.featured),
      category: group.category ?? null,
      variants: sorted,
    });
  }

  for (const service of services ?? []) {
    if (used.has(service.id)) continue;
    catalog.push({
      key: service.id,
      name: service.name,
      ...variantTexts(service),
      featured: false,
      category: null,
      variants: [service],
    });
  }
  return catalog;
}

/** `{ description, features }` of one variant (null / [] when absent). */
export function variantTexts(service) {
  return {
    description: service?.description ?? null,
    features: service?.features ?? [],
  };
}

/**
 * Catalogue load with injected dependencies (tested without Next):
 * `fetchServices({ timeoutMs })`, editorial `groups`, `onError(error,
 * context)` for the server log. Never throws → `{ catalog, error }`.
 */
export async function loadCatalogFrom(
  { fetchServices, groups, onError = () => {} },
  { timeoutMs } = {}
) {
  let services;
  try {
    services = await fetchServices({ timeoutMs });
  } catch (error) {
    onError(error, { operation: 'catalog' });
    return {
      catalog: null,
      error: describeFailure(error, { operation: 'catalog' }),
    };
  }
  try {
    return { catalog: buildCatalog(services, groups), error: null };
  } catch (cause) {
    const error = { kind: 'transform', name: cause?.name ?? 'Error' };
    onError(error, { operation: 'catalog' });
    return {
      catalog: null,
      error: describeFailure(error, { operation: 'catalog' }),
    };
  }
}

/** The prestation that contains `serviceId`, or null. */
export function findPrestation(catalog, serviceId) {
  return (
    catalog.find((group) =>
      group.variants.some((service) => service.id === serviceId)
    ) ?? null
  );
}

/** A sale is shown only when the API says so (active sale fields). */
export function hasActiveSale(service) {
  return (
    service.salePriceCents !== null &&
    service.salePriceCents !== undefined &&
    service.saleEndsAt !== null &&
    service.effectivePriceCents < service.priceCents
  );
}

/** Lowest current price of a prestation, for "à partir de". */
export function lowestPrice(group) {
  return Math.min(
    ...group.variants.map((service) => service.effectivePriceCents)
  );
}

/*
 * Booking catalogue (/reserver), after the designer mock-up « Choix du
 * soin »: one filter at a time — « Promotions », « Populaires » (the
 * prestations marked `featured` in content/services.js), everything (null)
 * or one category. Everything is shown in sections, one per category, in the
 * order of CATEGORIES; prestations keep the order of content/services.js.
 */
export const PROMOTIONS = 'promotions';
export const POPULAR = 'populaires';
/** Section of the prestations without a known category (API-only ones). */
export const OTHERS = 'autres';

/** True when one of the durations is on sale right now. */
export function hasPromotion(prestation) {
  return prestation.variants.some(hasActiveSale);
}

/**
 * The duration a catalogue row shows: the one on sale when there is one,
 * otherwise the one closest to 1 h (the shorter on a tie) — « Tarif
 * affiché pour une séance d’1 h (ou la durée indiquée) ». The others are
 * chosen on the next step.
 */
export function shownVariant(prestation) {
  const sale = prestation.variants.find(hasActiveSale);
  if (sale) return sale;
  return prestation.variants.reduce((best, service) =>
    Math.abs(service.durationMinutes - 60) < Math.abs(best.durationMinutes - 60)
      ? service
      : best
  );
}

/**
 * Catalogue → sections `{ key, items }` for one filter (`PROMOTIONS`,
 * `POPULAR`, a category key, or null for everything). Empty sections are left out;
 * an unknown filter shows everything.
 */
export function catalogSections(catalog, categories, filter = null) {
  const list = catalog ?? [];
  if (filter === PROMOTIONS || filter === POPULAR) {
    const items = list.filter(
      filter === PROMOTIONS ? hasPromotion : (prestation) => prestation.featured
    );
    return items.length ? [{ key: filter, items }] : [];
  }
  const known = categories.some((category) => category.key === filter);
  const sections = categories
    .filter((category) => !known || category.key === filter)
    .map((category) => ({
      key: category.key,
      items: list.filter((prestation) => prestation.category === category.key),
    }));
  if (!known) {
    sections.push({
      key: OTHERS,
      items: list.filter(
        (prestation) =>
          !categories.some((category) => category.key === prestation.category)
      ),
    });
  }
  return sections.filter((section) => section.items.length);
}
