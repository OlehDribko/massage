/*
 * Runtime checks of the API answers the site depends on: catalogue,
 * availability, profile, a created booking, and the admin schedule blocks
 * (manual busy times) with the schedule days that list them.
 *
 * Source of truth: `docs/openapi.json` of Massage-backend (OpenAPI 3.1,
 * generated from the backend's Zod schemas; the backend CI fails when the
 * file and the code disagree). `contracts/openapi-subset.json` in this
 * repository holds the components these schemas are compared with, plus the
 * backend commit it was taken from:
 *
 * - `npm test` (tests/api/contract.test.mjs) fails when a field below is
 *   missing from that snapshot, has another type or is optional there;
 * - `npm run contract:check -- <path to backend docs/openapi.json>` fails
 *   when the backend's current file differs from the snapshot (refresh it
 *   with `-- --write` after reading the diff).
 *
 * Only the fields the UI reads are checked (a subset of the OpenAPI
 * schemas, same JSON Schema keywords). Extra fields are accepted: the
 * backend may add fields without breaking the site. A failed check never
 * reveals values — only the schema name and the field path.
 *
 * Pure, relative imports only — tested with `node --test`.
 */

const string = { type: 'string' };
const integer = { type: 'integer' };
const boolean = { type: 'boolean' };
const nullable = (schema) => ({ ...schema, type: [schema.type, 'null'] });
const array = (items) => ({ type: 'array', items });
const object = (properties, required = Object.keys(properties)) => ({
  type: 'object',
  properties,
  required,
});

/** components/schemas/Service — every card, price and booking link. */
const service = object(
  {
    id: string,
    name: string,
    // Client-facing texts: optional here, so an older API without them still
    // shows the catalogue (normalised to null / [] by normalizeService).
    description: nullable(string),
    features: array(string),
    durationMinutes: integer,
    priceCents: integer,
    effectivePriceCents: integer,
    salePriceCents: nullable(integer),
    saleEndsAt: nullable(string),
    currency: string,
  },
  [
    'id',
    'name',
    'durationMinutes',
    'priceCents',
    'effectivePriceCents',
    'salePriceCents',
    'saleEndsAt',
    'currency',
  ]
);

const slot = object({ startsAt: string, endsAt: string });

/** components/schemas/Availability — the time picker. */
const availability = object({
  serviceId: string,
  durationMinutes: integer,
  timeZone: string,
  from: string,
  to: string,
  days: array(object({ date: string, slots: array(slot) })),
});

/** components/schemas/ProfileView (also SyncResponse) — role, readiness. */
const profileView = object(
  {
    profile: object(
      {
        id: string,
        role: { type: 'string', enum: ['client', 'admin'] },
        authState: { type: 'string', enum: ['anonymous', 'registered'] },
        name: nullable(string),
        email: nullable(string),
        emailVerified: boolean,
        phone: nullable(string),
      },
      ['id', 'role', 'authState', 'emailVerified']
    ),
    bookingReadiness: object({ ready: boolean, blockers: array(string) }),
    marketingAvailable: boolean,
  },
  ['profile', 'bookingReadiness', 'marketingAvailable']
);

/** components/schemas/Booking — what the confirmation needs. */
const booking = object(
  {
    id: string,
    status: { type: 'string', enum: ['confirmed', 'cancelled'] },
    startsAt: string,
    endsAt: string,
    service: object(
      {
        id: string,
        name: string,
        durationMinutes: integer,
        priceCents: integer,
      },
      ['id', 'name', 'durationMinutes', 'priceCents']
    ),
  },
  ['id', 'status', 'startsAt', 'endsAt', 'service']
);

/**
 * components/schemas/ScheduleBlock — a manual busy time of the calendar.
 * `start` / `end`: studio local time without offset ("2027-03-03T14:00");
 * a block ending at midnight has the next date at "T00:00".
 */
const scheduleBlock = object({
  id: string,
  title: string,
  note: nullable(string),
  start: string,
  end: string,
  startsAt: string,
  endsAt: string,
});

const timeZone = { type: 'string', enum: ['Europe/Paris'] };

/**
 * components/schemas/ScheduleDays — the calendar layers of each date.
 * `blocks` is optional here: an API without blocks (staging before the
 * migration) still shows the calendar, without busy times.
 */
const scheduleDays = object(
  {
    timeZone,
    days: array(
      object(
        {
          date: string,
          closed: boolean,
          intervals: array(object({ start: string, end: string })),
          effective: object({
            open: boolean,
            intervals: array(object({ start: string, end: string })),
          }),
          blocks: array(scheduleBlock),
        },
        ['date', 'closed', 'intervals', 'effective']
      )
    ),
  },
  ['days']
);

/**
 * Checked schemas. `component` names the OpenAPI component it is a subset
 * of; `envelope` the property of the response that holds it, if any.
 */
export const CONTRACT = {
  services: {
    component: 'Service',
    schema: object({ services: array(service) }),
    envelope: 'services',
  },
  availability: { component: 'Availability', schema: availability },
  profile: { component: 'ProfileView', schema: profileView },
  syncedProfile: { component: 'SyncResponse', schema: profileView },
  booking: {
    component: 'Booking',
    schema: object({ booking }),
    envelope: 'booking',
  },
  scheduleDays: { component: 'ScheduleDays', schema: scheduleDays },
  scheduleBlock: {
    component: 'ScheduleBlockResult',
    schema: object({ timeZone, block: scheduleBlock }),
  },
  scheduleBlockUpdate: {
    component: 'ScheduleBlockUpdateResult',
    schema: object({ timeZone, block: scheduleBlock, changed: boolean }),
  },
  scheduleBlocks: {
    component: 'ScheduleBlockList',
    schema: object({ timeZone, blocks: array(scheduleBlock) }),
  },
  scheduleBlockDeleted: {
    // Inline in the operation (no named component).
    response: 'DELETE /api/admin/schedule/blocks/{blockId} 200',
    schema: object({ id: string, deleted: boolean }),
  },
};

const typeOf = (value) => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isInteger(value)) return 'integer';
  return typeof value;
};

const allows = (schemaType, actual) => {
  const types = [schemaType].flat();
  return (
    types.includes(actual) || (actual === 'integer' && types.includes('number'))
  );
};

/** First mismatch as a field path ("services[3].priceCents"), or null. */
export function findMismatch(value, schema, path = '') {
  const actual = typeOf(value);
  if (!allows(schema.type, actual)) {
    return { path: path || '(root)', expected: [schema.type].flat().join('|') };
  }
  if (schema.enum && !schema.enum.includes(value)) {
    return { path: path || '(root)', expected: 'enum' };
  }
  if (actual === 'array' && schema.items) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findMismatch(
        value[index],
        schema.items,
        `${path}[${index}]`
      );
      if (found) return found;
    }
  }
  if (actual === 'object' && schema.properties) {
    for (const [key, child] of Object.entries(schema.properties)) {
      const field = path ? `${path}.${key}` : key;
      if (!(key in value)) {
        if (schema.required?.includes(key)) {
          return { path: field, expected: 'present' };
        }
        continue;
      }
      const found = findMismatch(value[key], child, field);
      if (found) return found;
    }
  }
  return null;
}

/** API service → the same object with `description` / `features` set. */
export function normalizeService(item) {
  return {
    ...item,
    description:
      typeof item.description === 'string' && item.description.trim()
        ? item.description
        : null,
    features: Array.isArray(item.features)
      ? item.features.filter((text) => typeof text === 'string' && text.trim())
      : [],
  };
}

/** `validate` option of apiRequest for one of the CONTRACT entries. */
export const validatorFor = (name) => (payload) =>
  findMismatch(payload, CONTRACT[name].schema);
