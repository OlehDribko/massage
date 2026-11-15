/*
 * Manual busy times of the calendar («indisponibilités»: Planity, another
 * channel, a personal appointment). Massage-backend docs/booking.md
 * «Блоки зайнятості» and docs/frontend-handoff.md §2a:
 *
 * - a block is { id, title, note|null, start, end, startsAt, endsAt };
 *   `start` / `end` are studio local times WITHOUT offset
 *   ("2027-03-03T14:00", minutes multiple of 5); `startsAt` / `endsAt` are
 *   the same bounds in UTC. Everything shown here comes from `start` /
 *   `end`, as strings — never through the browser's time zone;
 * - the form (v1) makes one-day blocks: a Europe/Paris date, a start and an
 *   end on that date; the end of the day is typed 24:00, sent as "…T24:00"
 *   of the same date, and comes back as the next date "T00:00" — the form
 *   shows it as 24:00 again and saves the same bounds;
 * - the server decides what is valid (one local date, at least 15 min of
 *   real time, the end in the future at every write — PATCH included —,
 *   start date ≤ today + 365, times that do not exist or exist twice on a
 *   clock change). The checks below are hints before sending.
 *
 * Pure, relative imports only — tested with `node --test`.
 */

import { addDays, localDateOf } from '../format.js';
import { bookingErrorMessage, isRetryable } from '../booking/labels.js';

export const BLOCKS_PATH = '/api/admin/schedule/blocks';
export const blockPath = (id) => `${BLOCKS_PATH}/${encodeURIComponent(id)}`;
export const BLOCK_ROUTE = `${BLOCKS_PATH}/{blockId}`;

export const TITLE_MAX = 100;
export const NOTE_MAX = 500;
export const STEP_MINUTES = 5;
export const MIN_MINUTES = 15;
export const HORIZON_DAYS = 365;

const DAY = 24 * 60;
const LOCAL = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/;
const HH_MM = /^(?:([01]\d|2[0-3]):([0-5]\d)|24:00)$/;

/** "2027-03-03T14:05" → { date: "2027-03-03", time: "14:05" } or null. */
export function splitLocal(value) {
  const match = LOCAL.exec(value ?? '');
  return match ? { date: match[1], time: `${match[2]}:${match[3]}` } : null;
}

/** "14:05" → 845; "24:00" → 1440; anything else → null. */
export function minutesOf(time) {
  if (!HH_MM.test(time ?? '')) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

const timeOf = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/**
 * Local minutes of the block on `date`, clipped to that date:
 * `{ start, end }` with 0 ≤ start < end ≤ 1440, or null when the block does
 * not touch the date. A block from 22:00 to 02:00 the next day is
 * [1320, 1440] on its first date and [0, 120] on the second.
 */
export function blockSpanOn(block, date) {
  const start = splitLocal(block?.start);
  const end = splitLocal(block?.end);
  if (!start || !end) return null;
  if (start.date > date || end.date < date) return null;
  const from = start.date === date ? minutesOf(start.time) : 0;
  const to = end.date === date ? minutesOf(end.time) : DAY;
  if (from === null || to === null || to <= from) return null;
  return { start: from, end: to };
}

/** Dates (YYYY-MM-DD) the block covers, at least its start date. */
export function blockDates(block) {
  const start = splitLocal(block?.start);
  const end = splitLocal(block?.end);
  if (!start || !end) return [];
  const dates = [];
  for (let date = start.date; date <= end.date; date = addDays(date, 1)) {
    if (blockSpanOn(block, date)) dates.push(date);
    if (dates.length > 3) break; // at most 24 h: two dates
  }
  return dates.length ? dates : [start.date];
}

/**
 * "14:00–15:00" on `date` (default: its start date). Midnight at the end
 * reads 24:00; a part of a block that runs over midnight says so:
 * "22:00–24:00 (jusqu’au lendemain 02:00)", "00:00–02:00 (depuis la veille)".
 */
export function blockTimeLabel(block, date = splitLocal(block?.start)?.date) {
  const span = blockSpanOn(block, date);
  if (!span) return '';
  const text = `${timeOf(span.start)}–${timeOf(span.end)}`;
  const start = splitLocal(block.start);
  const end = splitLocal(block.end);
  const endsNextDayAfterMidnight =
    end.date > date && !(end.date === addDays(date, 1) && end.time === '00:00');
  if (start.date < date) return `${text} (depuis la veille)`;
  if (endsNextDayAfterMidnight)
    return `${text} (jusqu’au lendemain ${end.time})`;
  return text;
}

/* --- Form ----------------------------------------------------------------- */

export const EMPTY_FORM = {
  date: '',
  start: '',
  end: '',
  title: '',
  note: '',
  lockedBounds: null,
};

/** New block on `date`: empty times, the admin types them. */
export function newBlockForm(date) {
  return { ...EMPTY_FORM, date: date ?? '' };
}

/**
 * True when the block fits the form's rule (v1): one Europe/Paris date,
 * from its start to at most the next midnight (shown as 24:00).
 */
export function isOneDayBlock(block) {
  const start = splitLocal(block?.start);
  const end = splitLocal(block?.end);
  if (!start || !end) return false;
  return (
    end.date === start.date ||
    (end.date === addDays(start.date, 1) && end.time === '00:00')
  );
}

/**
 * API block → form values: one date, start and end times of that date.
 * The API's next date at 00:00 is the end of the day, shown as "24:00".
 * A block over midnight (possible through the API, not through this form)
 * keeps its exact bounds in `lockedBounds`: its times are not editable
 * here, so saving a new title or note never moves it.
 */
export function blockToForm(block) {
  const start = splitLocal(block.start);
  const end = splitLocal(block.end);
  const oneDay = isOneDayBlock(block);
  return {
    date: start.date,
    start: start.time,
    end: !oneDay ? end.time : end.date === start.date ? end.time : '24:00',
    title: block.title ?? '',
    note: block.note ?? '',
    lockedBounds: oneDay ? null : { start: block.start, end: block.end },
  };
}

/**
 * Form → the local bounds sent to the API: both on the chosen date,
 * "…T24:00" for its midnight. No time zone involved (strings only).
 */
export function formBounds(form) {
  if (form.lockedBounds) return { ...form.lockedBounds };
  return {
    start: `${form.date}T${form.start}`,
    end: `${form.date}T${form.end}`,
  };
}

/** POST body: trimmed title, note only when written. */
export function createBody(form) {
  const note = form.note.trim();
  return {
    title: form.title.trim(),
    ...(note ? { note } : {}),
    ...formBounds(form),
  };
}

/**
 * PATCH body: only what changed against the loaded block (null clears the
 * note). An end "24:00" and the API's next date "T00:00" are the same
 * bound: unchanged bounds are not sent. Empty object → nothing to save.
 */
export function patchBody(block, form) {
  const before = blockToForm(block);
  const changes = {};
  const title = form.title.trim();
  if (title !== block.title) changes.title = title;
  const note = form.note.trim() || null;
  if (note !== (block.note ?? null)) changes.note = note;
  const was = formBounds(before);
  const now = formBounds(form);
  if (now.start !== was.start) changes.start = now.start;
  if (now.end !== was.end) changes.end = now.end;
  return changes;
}

/**
 * Hints before sending, by field (French). `today` is the studio date.
 * {} when nothing is wrong; the server still has the last word.
 */
export function validateBlockForm(form, today) {
  const errors = {};
  const title = form.title.trim();
  if (!title) errors.title = 'Indiquez un titre.';
  else if (title.length > TITLE_MAX)
    errors.title = `${TITLE_MAX} caractères maximum.`;
  if (form.note.trim().length > NOTE_MAX)
    errors.note = `${NOTE_MAX} caractères maximum.`;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
    errors.date = 'Choisissez une date.';
  } else if (today && form.date < today) {
    errors.date = 'La date ne peut pas être passée.';
  } else if (today && form.date > addDays(today, HORIZON_DAYS)) {
    errors.date = `Au plus ${HORIZON_DAYS} jours à l’avance.`;
  }

  // Times of a block over midnight are kept as they are (not editable).
  if (form.lockedBounds) return errors;
  const start = minutesOf(form.start);
  const end = minutesOf(form.end);
  if (start === null || start === DAY) {
    errors.start = 'Heure de début au format HH:MM (00:00–23:55).';
  } else if (start % STEP_MINUTES) {
    errors.start = `Minutes par pas de ${STEP_MINUTES} (ex. 14:05).`;
  }
  if (end === null) {
    errors.end = 'Heure de fin au format HH:MM (24:00 pour minuit).';
  } else if (end % STEP_MINUTES) {
    errors.end = `Minutes par pas de ${STEP_MINUTES} (ex. 15:35).`;
  }
  if (!errors.start && !errors.end) {
    const length = end - start;
    if (length <= 0)
      errors.end =
        'La fin doit être après le début, le même jour (24:00 au plus).';
    else if (length < MIN_MINUTES)
      errors.end = `Au moins ${MIN_MINUTES} minutes.`;
  }
  return errors;
}

/* --- Server answers -------------------------------------------------------- */

const FIELD_MESSAGES = {
  title: `Indiquez un titre (${TITLE_MAX} caractères maximum).`,
  note: `${NOTE_MAX} caractères maximum.`,
  start:
    'Début refusé : vérifiez la date et l’heure (pas de 5 min, horizon de 365 jours, heure qui n’existe pas ou existe deux fois au changement d’heure).',
  end: 'Fin refusée par le serveur : vérifiez qu’elle n’est pas déjà passée, qu’elle reste le même jour (24:00 au plus), à au moins 15 minutes du début, minutes par pas de 5 (heure du changement d’heure non acceptée).',
};

/**
 * 400 VALIDATION_FAILED `errors: [{ field: ["start"], message }]` → French
 * messages by form field (the English message is never shown). A field
 * the form does not have is reported under `form`.
 */
export function fieldErrorsFrom(error) {
  if (error?.code !== 'VALIDATION_FAILED') return {};
  const found = {};
  for (const entry of error.details?.errors ?? []) {
    const field = Array.isArray(entry?.field) ? entry.field[0] : entry?.field;
    if (FIELD_MESSAGES[field]) found[field] = FIELD_MESSAGES[field];
    else found.form = bookingErrorMessage(error);
  }
  if (!Object.keys(found).length) found.form = bookingErrorMessage(error);
  return found;
}

/** Message of a failed block request (French). */
export function blockErrorMessage(error) {
  switch (error?.code) {
    case 'BLOCK_CONFLICT':
      return 'Des rendez-vous confirmés (avec leur pause de 15 min) se trouvent sur ce créneau. Rien n’a été enregistré : déplacez ou annulez-les d’abord, ou changez les horaires.';
    case 'BLOCK_DELETED':
      return 'Cette indisponibilité a été supprimée entre-temps : elle n’a pas été recréée. Le calendrier est mis à jour.';
    case 'BLOCK_NOT_FOUND':
      return 'Cette indisponibilité n’existe plus (supprimée entre-temps). Le calendrier est mis à jour.';
    case 'IDEMPOTENCY_KEY_REUSED':
      return 'Cette demande a déjà servi pour une autre indisponibilité. Vérifiez le calendrier, puis enregistrez à nouveau : une nouvelle demande sera envoyée.';
    case 'VALIDATION_FAILED':
      return 'Certaines informations sont refusées. Vérifiez les champs signalés.';
    default:
      return bookingErrorMessage(error);
  }
}

/** The block is gone on the server: reload the calendar. */
export const blockIsGone = (error) =>
  error?.code === 'BLOCK_DELETED' || error?.code === 'BLOCK_NOT_FOUND';

/** BLOCK_CONFLICT → bookings in the way, each with its studio date. */
export function conflictsOf(error) {
  if (error?.code !== 'BLOCK_CONFLICT') return [];
  return (error.details?.conflicts ?? [])
    .filter((item) => item?.bookingId && item.startsAt)
    .map((item) => ({ ...item, date: localDateOf(item.startsAt) }));
}

/**
 * Idempotency-Key of «create this block» (docs/frontend-handoff.md §2a):
 * - the same body keeps its key, so a retry after an unknown outcome
 *   (network, timeout, 5xx, CALENDAR_BUSY, unreadable answer) replays the
 *   first request instead of creating a second block;
 * - another body is a new intent with a new key;
 * - `settle(error)`: a definite answer (success: no error, or a refusal)
 *   ends the intent, an unknown outcome keeps it.
 */
export function createBlockIntent(newKey = () => crypto.randomUUID()) {
  let current = null; // { fingerprint, key }
  return {
    keyFor(body) {
      const fingerprint = JSON.stringify(body);
      if (current?.fingerprint !== fingerprint) {
        current = { fingerprint, key: newKey() };
      }
      return current.key;
    },
    settle(error) {
      if (!error || !isRetryable(error)) current = null;
    },
    get current() {
      return current;
    },
  };
}

/* --- Calendar data ---------------------------------------------------------- */

/** Blocks listed on a schedule day (none on an API without blocks). */
export const blocksOf = (day) => (Array.isArray(day?.blocks) ? day.blocks : []);

const byStart = (a, b) =>
  a.start < b.start ? -1 : a.start > b.start ? 1 : a.id < b.id ? -1 : 1;

/**
 * Loaded schedule days after a block was created, changed or deleted:
 * the block leaves every date it was on (`removedId`) and joins the dates
 * the new version covers — the old and the new date both change when a
 * block moves. Dates that are not loaded are left alone (the reload that
 * follows brings the server's view).
 */
export function applyBlockChange(days, { removedId = null, block = null }) {
  const dates = new Set(block ? blockDates(block) : []);
  return (days ?? []).map((day) => {
    const before = blocksOf(day);
    let blocks = before.some((item) => item.id === removedId)
      ? before.filter((item) => item.id !== removedId)
      : before;
    if (block && dates.has(day.date)) {
      blocks = [...blocks.filter((item) => item.id !== block.id), block].sort(
        byStart
      );
    }
    return blocks === before ? day : { ...day, blocks };
  });
}

/** Bookings (instants) and blocks (local strings) as minutes of `date`. */
function bookingSpan(booking, date, timeZone) {
  const startDate = localDateOf(booking.startsAt, timeZone);
  const endDate = localDateOf(booking.endsAt, timeZone);
  const minute = (instant) => {
    const [hours, minutes] = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone,
    })
      .format(new Date(instant))
      .split(':')
      .map(Number);
    return hours * 60 + minutes;
  };
  const start = startDate < date ? 0 : minute(booking.startsAt);
  const end = endDate > date ? DAY : minute(booking.endsAt);
  return { start, end: Math.max(end, start + 1) };
}

/**
 * One date's agenda: bookings and blocks in time order (start, then end),
 * each `{ kind: 'booking' | 'block', id, start, end, item }` in local
 * minutes of that date. Ties: blocks before bookings, then by id.
 */
export function agendaItems(bookings, blocks, date, timeZone = 'Europe/Paris') {
  const items = [
    ...(bookings ?? []).map((booking) => ({
      kind: 'booking',
      id: booking.id,
      ...bookingSpan(booking, date, timeZone),
      item: booking,
    })),
    ...(blocks ?? []).flatMap((block) => {
      const span = blockSpanOn(block, date);
      return span
        ? [{ kind: 'block', id: block.id, ...span, item: block }]
        : [];
    }),
  ];
  return items.sort(
    (a, b) =>
      a.start - b.start ||
      a.end - b.end ||
      (a.kind === b.kind ? 0 : a.kind === 'block' ? -1 : 1) ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  );
}

/**
 * Side-by-side layout of overlapping events in a day timeline: each item
 * gets `lane` (0-based column) and `lanes` (columns of its group of
 * overlapping events), so nothing hides another. Touching events
 * (one ends when the next starts) do not overlap. Input: agendaItems().
 */
export function layoutLanes(items) {
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end);
  const placed = [];
  let group = [];
  let groupEnd = -1;
  let laneEnds = [];
  const close = () => {
    for (const entry of group) entry.lanes = laneEnds.length;
    group = [];
    laneEnds = [];
  };
  for (const item of sorted) {
    if (group.length && item.start >= groupEnd) close();
    let lane = laneEnds.findIndex((end) => end <= item.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(item.end);
    } else {
      laneEnds[lane] = item.end;
    }
    const entry = { ...item, lane, lanes: 1 };
    group.push(entry);
    placed.push(entry);
    groupEnd = Math.max(groupEnd, item.end);
  }
  close();
  return placed; // time order (the sort is stable: agendaItems ties kept)
}

/**
 * The block is over at `now` (its UTC end is not in the future): v1 lets
 * the admin read and delete it, not change it.
 */
export const isBlockOver = (block, now = Date.now()) =>
  Date.parse(block?.endsAt) <= now;

/** "1 indisponibilité", "3 indisponibilités". */
export const blocksCountLabel = (count) =>
  `${count} indisponibilité${count > 1 ? 's' : ''}`;
