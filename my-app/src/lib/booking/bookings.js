/*
 * Booking lists. `phase` comes from the server clock; the client only sorts.
 * Pure — tested with `node --test`.
 */

const ACTIVE_PHASES = new Set(['upcoming', 'in_progress']);

/** → { upcoming: soonest first, past: latest first (finished/cancelled) }. */
export function splitBookings(bookings) {
  const upcoming = [];
  const past = [];
  for (const booking of bookings ?? []) {
    (ACTIVE_PHASES.has(booking.phase) ? upcoming : past).push(booking);
  }
  const at = (booking) => Date.parse(booking.startsAt);
  upcoming.sort((a, b) => at(a) - at(b));
  past.sort((a, b) => at(b) - at(a));
  return { upcoming, past };
}

/** Admin day list: by start time, cancelled after confirmed at equal time. */
export function sortDayBookings(bookings) {
  return [...(bookings ?? [])].sort(
    (a, b) =>
      Date.parse(a.startsAt) - Date.parse(b.startsAt) ||
      (a.status === 'cancelled') - (b.status === 'cancelled')
  );
}
