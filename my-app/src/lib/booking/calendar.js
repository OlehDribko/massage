/*
 * "Add to my calendar" and "directions" for a confirmed booking. Built in
 * the browser from the booking itself (no API). Pure — tested with
 * `node --test`.
 */

/** "2027-03-02T08:00:00.000Z" → "20270302T080000Z" (iCalendar / Google). */
export function calendarStamp(instant) {
  return new Date(instant)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

/** One-line address: "23 rue Castéja, 33000 Bordeaux". */
export function addressLine(address) {
  return `${address.street}, ${address.postalCode} ${address.city}`;
}

function eventText(booking, business) {
  return {
    title: `${booking.service.name} — ${business.name}`,
    details: 'Règlement sur place, au cabinet.',
    location: addressLine(business.address),
  };
}

/** Google Calendar "new event" link. */
export function googleCalendarUrl(booking, business) {
  const { title, details, location } = eventText(booking, business);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${calendarStamp(booking.startsAt)}/${calendarStamp(booking.endsAt)}`,
    details,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

// RFC 5545 text: escape \ ; , and newlines.
const icsText = (value) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');

/** .ics file content (Apple Calendar, Outlook…), CRLF line ends. */
export function icsContent(booking, business, now = new Date()) {
  const { title, details, location } = eventText(booking, business);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//massage//reservation//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.id}@reservation`,
    `DTSTAMP:${calendarStamp(now)}`,
    `DTSTART:${calendarStamp(booking.startsAt)}`,
    `DTEND:${calendarStamp(booking.endsAt)}`,
    `SUMMARY:${icsText(title)}`,
    `DESCRIPTION:${icsText(details)}`,
    `LOCATION:${icsText(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

/** Google Maps directions to the studio. */
export function directionsUrl(address) {
  const params = new URLSearchParams({
    api: '1',
    destination: addressLine(address),
  });
  return `https://www.google.com/maps/dir/?${params}`;
}
