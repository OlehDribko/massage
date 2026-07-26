export const PLANITY_WIDGET_BASE =
  'https://d2skjte8udjqxw.cloudfront.net/widget/production/2';

export const PLANITY_PRIMARY_COLOR =
  process.env.NEXT_PUBLIC_PLANITY_PRIMARY_COLOR ?? '#171717';

export const PLANITY_BOOKING_URL =
  process.env.NEXT_PUBLIC_PLANITY_BOOKING_URL ??
  'https://www.planity.com/stefania-33000-bordeaux';

/** ID d’UNE prestation (deep link Planity `?serviceId=`). */
export function getPlanitySingleServiceId() {
  return (process.env.NEXT_PUBLIC_PLANITY_SERVICE_ID ?? '').trim();
}

/**
 * Lien Planity qui ouvre directement le RDV pour cette prestation
 * (calendrier via `initialServiceId` côté Planity).
 */
export function getPlanitySingleServiceBookingUrl() {
  const serviceId = getPlanitySingleServiceId();
  if (!serviceId) return PLANITY_BOOKING_URL;

  const url = new URL(PLANITY_BOOKING_URL);
  url.searchParams.set('serviceId', serviceId);
  return url.toString();
}
