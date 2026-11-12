/*
 * Catalogue display. In the API every duration is its own service ("Massage
 * sportif" 55 / 90 / 120 min = three ids). The editorial layer
 * (src/content/services.js) lists which ids are durations of one prestation;
 * nothing is merged by name. Pure — tested with `node --test`.
 */

const byDuration = (a, b) => a.durationMinutes - b.durationMinutes;

/**
 * API services + editorial groups → prestations in editorial order:
 * `{ key, name, description, featured, variants }`. A grouped id missing
 * from the API (archived) is skipped; a variant whose API name differs from
 * the first one (renamed later) and any service unknown to the layer get a
 * card of their own, after the listed ones, in API order.
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
    catalog.push({
      key: group.key,
      name,
      description: group.description ?? null,
      featured: Boolean(group.featured),
      category: group.category ?? null,
      variants: same.sort(byDuration),
    });
  }

  for (const service of services ?? []) {
    if (used.has(service.id)) continue;
    catalog.push({
      key: service.id,
      name: service.name,
      description: null,
      featured: false,
      category: null,
      variants: [service],
    });
  }
  return catalog;
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
 * Filters of the booking catalogue (/reserver). A prestation matches when
 * at least one of its durations matches the duration AND budget filters,
 * so the card can open on that duration.
 */
export const DURATION_FILTERS = [
  { key: '30', label: '30 min', min: 0, max: 40 },
  { key: '60', label: '1 h', min: 41, max: 70 },
  { key: '90', label: '1 h 30', min: 71, max: 100 },
  { key: '120', label: '2 h', min: 101, max: Infinity },
];

export const BUDGET_FILTERS = [
  { key: 'moins-60', label: 'Jusqu’à 60 €', min: 0, max: 6000 },
  { key: '60-100', label: '60 – 100 €', min: 6001, max: 10000 },
  { key: 'plus-100', label: '100 € et plus', min: 10001, max: Infinity },
];

const within = (value, range) =>
  !range || (value >= range.min && value <= range.max);

/** Variants of a prestation that fit the duration and budget filters. */
export function matchingVariants(prestation, { duration, budget } = {}) {
  const durationRange = DURATION_FILTERS.find((item) => item.key === duration);
  const budgetRange = BUDGET_FILTERS.find((item) => item.key === budget);
  return prestation.variants.filter(
    (service) =>
      within(service.durationMinutes, durationRange) &&
      within(service.effectivePriceCents, budgetRange)
  );
}

/**
 * Catalogue → the prestations matching every active filter, popular ones
 * first (stable otherwise). Unknown filter values are ignored.
 */
export function filterCatalog(
  catalog,
  { category, duration, budget, popular } = {}
) {
  return (catalog ?? [])
    .filter((prestation) => !category || prestation.category === category)
    .filter((prestation) => !popular || prestation.featured)
    .filter(
      (prestation) =>
        matchingVariants(prestation, { duration, budget }).length > 0
    )
    .map((prestation, index) => ({ prestation, index }))
    .sort(
      (a, b) =>
        Number(b.prestation.featured) - Number(a.prestation.featured) ||
        a.index - b.index
    )
    .map(({ prestation }) => prestation);
}
