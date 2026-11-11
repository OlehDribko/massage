/*
 * Session packages ("forfaits") shown as INFORMATION next to a prestation
 * of the booking catalogue. They cannot be booked online: the booking API
 * has single sessions only (no package entity, Massage-backend
 * docs/booking.md «Початковий каталог»). A package is bought at the studio;
 * each session is then booked as a single one.
 *
 * Unlike the rest of the catalogue these prices are NOT from the API: they
 * are copied from the studio's Planity page (2026-11-12) and must be
 * updated here by hand when they change.
 * TODO: confirm the list and prices with the practitioner.
 *
 * Keyed by the prestation key of content/services.js. `sessions` × the
 * single-session price of the API gives the "au lieu de" amount; set
 * `compare: false` when there is no single session to compare with.
 */
export const FORFAITS = {
  endospheres: [
    { label: '6 séances · demi-corps', sessions: 6, priceCents: 60000 },
    { label: '12 séances · demi-corps', sessions: 12, priceCents: 108000 },
    { label: '18 séances · demi-corps', sessions: 18, priceCents: 144000 },
    { label: '24 séances · demi-corps', sessions: 24, priceCents: 168000 },
    {
      label: '12 séances · corps complet',
      sessions: 12,
      priceCents: 150000,
      compare: false,
    },
  ],
};

/**
 * Rows to show for a package list, given the regular single-session price
 * in cents: per-session price and, when comparable and cheaper, the total
 * at the single price and the saving. Pure — tested with `node --test`.
 */
export function forfaitRows(forfaits, singlePriceCents) {
  return (forfaits ?? []).map((forfait) => {
    const perSessionCents = Math.round(forfait.priceCents / forfait.sessions);
    const fullCents =
      forfait.compare === false || !singlePriceCents
        ? null
        : forfait.sessions * singlePriceCents;
    const saving =
      fullCents !== null && fullCents > forfait.priceCents
        ? fullCents - forfait.priceCents
        : null;
    return {
      ...forfait,
      perSessionCents,
      fullCents: saving ? fullCents : null,
      savingCents: saving,
    };
  });
}
