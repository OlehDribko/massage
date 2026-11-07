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
