import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  CONTRACT,
  findMismatch,
  normalizeService,
  validatorFor,
} from '../../src/lib/api/contract.js';
import { describeFailure, logFailure } from '../../src/lib/api/diagnostics.js';
import { ApiError, apiRequest, errorKind } from '../../src/lib/auth/session.js';
import { loadCatalogFrom } from '../../src/lib/booking/catalog.js';
import {
  bookingErrorMessage,
  errorReference,
  isRetryable,
} from '../../src/lib/booking/labels.js';
import {
  COMPONENTS,
  RESPONSES,
  responsesOf,
  subsetOf,
} from '../../scripts/contract-check.mjs';

const snapshot = JSON.parse(
  readFileSync(new URL('../../contracts/openapi-subset.json', import.meta.url))
);

// ---------------------------------------------------------------------------
// The site's runtime schemas are a subset of the backend OpenAPI snapshot.

/** OpenAPI node → set of JSON types it allows ('integer' also as number). */
function typesOf(node) {
  if (!node) return new Set();
  if (node.anyOf || node.oneOf) {
    return new Set(
      (node.anyOf ?? node.oneOf).flatMap((item) => [...typesOf(item)])
    );
  }
  return new Set([node.type ?? []].flat());
}

function assertSubset(ours, theirs, where) {
  assert.ok(theirs, `${where}: missing in the OpenAPI snapshot`);
  const allowed = typesOf(theirs);
  for (const type of [ours.type].flat()) {
    assert.ok(
      allowed.has(type) || (type === 'integer' && allowed.has('number')),
      `${where}: type ${type} not allowed by OpenAPI (${[...allowed]})`
    );
  }
  if (ours.enum) {
    const values = theirs.enum ?? (theirs.const ? [theirs.const] : null);
    assert.ok(values, `${where}: OpenAPI has no enum`);
    for (const value of ours.enum) {
      assert.ok(
        values.includes(value),
        `${where}: enum value ${value} unknown`
      );
    }
  }
  const objectNode =
    theirs.type === 'object'
      ? theirs
      : (theirs.anyOf ?? []).find((item) => item.type === 'object');
  if (ours.properties) {
    assert.ok(objectNode, `${where}: not an object in OpenAPI`);
    for (const key of ours.required ?? []) {
      assert.ok(
        objectNode.required?.includes(key),
        `${where}.${key}: required by the site, optional in OpenAPI`
      );
    }
    for (const [key, child] of Object.entries(ours.properties)) {
      assertSubset(child, objectNode.properties?.[key], `${where}.${key}`);
    }
  }
  if (ours.items) {
    const arrayNode =
      theirs.type === 'array'
        ? theirs
        : (theirs.anyOf ?? []).find((item) => item.type === 'array');
    assertSubset(ours.items, arrayNode?.items, `${where}[]`);
  }
}

for (const [name, entry] of Object.entries(CONTRACT)) {
  test(`contract: ${name} is a subset of OpenAPI ${entry.component ?? entry.response} (${snapshot.source.commit.slice(0, 7)})`, () => {
    const component = entry.response
      ? snapshot.responses[entry.response]
      : snapshot.components[entry.component];
    const ours = entry.envelope
      ? entry.schema.properties[entry.envelope]
      : entry.schema;
    // Envelopes hold one item ({ booking }) or a list ({ services: [] }).
    assertSubset(
      ours.items ?? ours,
      component,
      entry.component ?? entry.response
    );
  });
}

test('contract: the check fails on a field the backend dropped or made optional', () => {
  const service = structuredClone(snapshot.components.Service);
  service.required = service.required.filter((key) => key !== 'priceCents');
  assert.throws(
    () =>
      assertSubset(
        CONTRACT.services.schema.properties.services.items,
        service,
        'Service'
      ),
    /priceCents: required by the site/
  );
});

test('contract-check: a changed backend component is detected', () => {
  const openapi = {
    components: { schemas: structuredClone(snapshot.components) },
  };
  assert.deepEqual(subsetOf(openapi), snapshot.components);
  openapi.components.schemas.Availability.required.pop();
  const changed = COMPONENTS.filter(
    (name) =>
      JSON.stringify(subsetOf(openapi)[name]) !==
      JSON.stringify(snapshot.components[name])
  );
  assert.deepEqual(changed, ['Availability']);
});

// ---------------------------------------------------------------------------
// Runtime checks of answers.

const service = (overrides = {}) => ({
  id: 's-60',
  name: 'Massage sportif',
  description: 'Texte.',
  features: ['Un point.'],
  durationMinutes: 60,
  priceCents: 8500,
  effectivePriceCents: 8500,
  salePriceCents: null,
  saleEndsAt: null,
  currency: 'EUR',
  ...overrides,
});

test('validators: a complete answer passes, extra fields are accepted', () => {
  const check = validatorFor('services');
  assert.equal(check({ services: [service({ newField: 1 })] }), null);
  assert.equal(check({ services: [] }), null);
});

test('validators: the first bad field is reported by path, never by value', () => {
  const check = validatorFor('services');
  const { priceCents, ...withoutPrice } = service();
  assert.ok(priceCents);
  assert.deepEqual(check({ services: [service(), withoutPrice] }), {
    path: 'services[1].priceCents',
    expected: 'present',
  });
  assert.deepEqual(check({ services: [service({ priceCents: '85' })] }), {
    path: 'services[0].priceCents',
    expected: 'integer',
  });
  assert.deepEqual(check({ services: [service({ durationMinutes: 59.5 })] }), {
    path: 'services[0].durationMinutes',
    expected: 'integer',
  });
  assert.deepEqual(check(null), { path: '(root)', expected: 'object' });
  assert.deepEqual(check({}), { path: 'services', expected: 'present' });
});

test('validators: availability, profile and booking', () => {
  const availability = {
    serviceId: 's-60',
    durationMinutes: 60,
    timeZone: 'Europe/Paris',
    from: '2027-03-01',
    to: '2027-03-07',
    days: [
      {
        date: '2027-03-01',
        slots: [
          {
            startsAt: '2027-03-01T08:00:00.000Z',
            endsAt: '2027-03-01T09:00:00.000Z',
          },
        ],
      },
    ],
  };
  assert.equal(findMismatch(availability, CONTRACT.availability.schema), null);
  assert.equal(
    findMismatch(
      { ...availability, days: [{ date: '2027-03-01' }] },
      CONTRACT.availability.schema
    )?.path,
    'days[0].slots'
  );

  const profile = {
    profile: {
      id: 'p',
      role: 'client',
      authState: 'registered',
      name: null,
      email: null,
      emailVerified: true,
      phone: null,
    },
    bookingReadiness: { ready: true, blockers: [] },
    marketing: null,
    marketingAvailable: false,
  };
  assert.equal(validatorFor('profile')(profile), null);
  assert.equal(
    validatorFor('profile')({
      ...profile,
      profile: { ...profile.profile, role: 'owner' },
    })?.path,
    'profile.role'
  );
  assert.equal(
    validatorFor('syncedProfile')({
      ...profile,
      bookingReadiness: { ready: true },
    })?.path,
    'bookingReadiness.blockers'
  );

  assert.equal(
    validatorFor('booking')({
      booking: {
        id: 'b',
        status: 'confirmed',
        startsAt: 'x',
        endsAt: 'y',
        service: { id: 's', name: 'n', durationMinutes: 60, priceCents: 1 },
      },
    }),
    null
  );
  assert.equal(
    validatorFor('booking')({ booking: { status: 'confirmed' } })?.path,
    'booking.id'
  );
});

test('normalizeService: missing or blank texts become null / []', () => {
  const { description, features, ...rest } = service();
  assert.ok(description && features);
  assert.deepEqual(normalizeService(rest), {
    ...rest,
    description: null,
    features: [],
  });
  assert.deepEqual(
    normalizeService(service({ description: '  ', features: ['', 'A', 3] })),
    { ...service(), description: null, features: ['A'] }
  );
});

// ---------------------------------------------------------------------------
// apiRequest: one distinct failure per cause.

const headers = (values = {}) => ({
  get: (name) => values[name.toLowerCase()] ?? null,
});

const answer = (status, body, extra = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: headers({ 'x-request-id': 'req-1', ...extra }),
  json: async () => {
    if (body instanceof Error) throw body;
    return body;
  },
});

const call = (fetchImpl, options = {}) =>
  apiRequest({
    baseUrl: 'https://api.test',
    path: '/api/services?from=2027-03-01',
    fetchImpl,
    ...options,
  });

test('apiRequest: success returns the checked body', async () => {
  const body = { services: [service()] };
  assert.deepEqual(
    await call(async () => answer(200, body), {
      validate: validatorFor('services'),
    }),
    body
  );
});

test('apiRequest: invalid 2xx body → INVALID_RESPONSE with field and request id', async () => {
  await assert.rejects(
    call(async () => answer(200, { services: [{ id: 1 }] }), {
      validate: validatorFor('services'),
      route: '/api/services',
    }),
    (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.code, 'INVALID_RESPONSE');
      assert.equal(error.status, 200);
      assert.equal(error.details.field, 'services[0].id');
      assert.equal(error.requestId, 'req-1');
      assert.equal(error.route, '/api/services');
      assert.equal(errorKind(error), 'invalid_response');
      return true;
    }
  );
  await assert.rejects(
    call(async () => answer(200, new SyntaxError('bad json'))),
    {
      code: 'INVALID_RESPONSE',
    }
  );
});

test('apiRequest: no answer in time → TIMEOUT (not a network error)', async () => {
  const hanging = (url, { signal }) =>
    new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason));
    });
  await assert.rejects(call(hanging, { timeoutMs: 20 }), (error) => {
    assert.equal(error.code, 'TIMEOUT');
    assert.equal(error.status, 0);
    assert.equal(error.route, '/api/services');
    assert.equal(errorKind(error), 'timeout');
    return true;
  });
});

test('apiRequest: the caller’s own abort is passed through as AbortError', async () => {
  const controller = new AbortController();
  const hanging = (url, { signal }) =>
    new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason));
    });
  const pending = call(hanging, { signal: controller.signal, timeoutMs: 5000 });
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});

test('apiRequest: network failure and HTTP error stay distinct', async () => {
  await assert.rejects(
    call(async () => {
      throw new TypeError('fetch failed');
    }),
    (error) => errorKind(error) === 'network' && error.code === 'NETWORK_ERROR'
  );
  await assert.rejects(
    call(async () =>
      answer(503, {
        code: 'CALENDAR_BUSY',
        message: 'Busy',
        retryAfterSeconds: 2,
      })
    ),
    (error) => {
      assert.equal(errorKind(error), 'http');
      assert.equal(error.status, 503);
      assert.equal(error.code, 'CALENDAR_BUSY');
      assert.equal(error.retryAfterSeconds, 2);
      assert.equal(error.requestId, 'req-1');
      assert.equal(error.details.message, undefined);
      return true;
    }
  );
  // A gateway page instead of JSON.
  await assert.rejects(
    call(async () => answer(502, new SyntaxError('html'))),
    {
      code: 'HTTP_502',
    }
  );
});

// ---------------------------------------------------------------------------
// Server diagnostics: what is logged and what is not.

test('diagnostics: method, route, status, code and X-Request-Id only', () => {
  const error = new ApiError(
    503,
    'CALENDAR_BUSY',
    2,
    { blockers: ['x'] },
    {
      method: 'POST',
      route: '/api/bookings',
      requestId: 'req-9',
    }
  );
  assert.deepEqual(describeFailure(error, { operation: 'booking' }), {
    operation: 'booking',
    kind: 'http',
    method: 'POST',
    route: '/api/bookings',
    status: 503,
    code: 'CALENDAR_BUSY',
    requestId: 'req-9',
  });
  const lines = [];
  logFailure(error, { operation: 'booking' }, (line) => lines.push(line));
  assert.equal(lines.length, 1);
  assert.match(lines[0], /^\[api\] \{.*"requestId":"req-9"/);
});

test('diagnostics: the route has no query, ids or token even when the path had them', async () => {
  const lines = [];
  await assert.rejects(
    apiRequest({
      baseUrl: 'https://api.test',
      path: '/api/services/123e4567/availability?from=2027-03-01&email=a@b.c',
      route: '/api/services/{serviceId}/availability',
      getToken: async () => 'SECRET-TOKEN',
      fetchImpl: async () => answer(500, { code: 'INTERNAL' }),
    }).catch((error) => {
      logFailure(error, { operation: 'availability' }, (line) =>
        lines.push(line)
      );
      throw error;
    })
  );
  assert.doesNotMatch(lines[0], /SECRET|from=|email|a@b|123e4567/);
  assert.match(
    lines[0],
    /"route":"\/api\/services\/\{serviceId\}\/availability"/
  );

  // Without a template, at least the query is dropped.
  const error = await call(async () => answer(500, {})).catch(
    (caught) => caught
  );
  assert.equal(error.route, '/api/services');
});

// ---------------------------------------------------------------------------
// Catalogue load: success, failures by kind, recovery.

const groups = [{ key: 'sportif', serviceIds: ['s-60', 's-90'] }];

test('loadCatalog: success builds the catalogue with API texts per duration', async () => {
  const { catalog, error } = await loadCatalogFrom({
    fetchServices: async () => [
      service({
        id: 's-90',
        durationMinutes: 90,
        description: 'Texte 90.',
        features: [],
      }),
      service(),
    ],
    groups,
  });
  assert.equal(error, null);
  assert.deepEqual(
    catalog[0].variants.map((item) => [item.id, item.description]),
    [
      ['s-60', 'Texte.'],
      ['s-90', 'Texte 90.'],
    ]
  );
  // The group text is the one of its shortest duration (variants[0]).
  assert.equal(catalog[0].description, 'Texte.');
});

test('loadCatalog: each failure kind is reported and logged once', async () => {
  const cases = [
    [
      new ApiError(
        0,
        'TIMEOUT',
        undefined,
        {},
        { method: 'GET', route: '/api/services' }
      ),
      'timeout',
    ],
    [new ApiError(0, 'NETWORK_ERROR'), 'network'],
    [new ApiError(503, 'HTTP_503', undefined, {}, { requestId: 'r' }), 'http'],
    [
      new ApiError(200, 'INVALID_RESPONSE', undefined, {
        field: 'services[0].id',
      }),
      'invalid_response',
    ],
    [new ApiError(0, 'NOT_CONFIGURED'), 'not_configured'],
  ];
  for (const [failure, kind] of cases) {
    const logged = [];
    const { catalog, error } = await loadCatalogFrom({
      fetchServices: async () => {
        throw failure;
      },
      groups,
      onError: (caught) => logged.push(caught),
    });
    assert.equal(catalog, null);
    assert.equal(error.kind, kind);
    assert.equal(logged.length, 1);
  }
});

test('loadCatalog: a transform failure is its own kind', async () => {
  const logged = [];
  const { catalog, error } = await loadCatalogFrom({
    fetchServices: async () => [service()],
    groups: [{ key: 'broken' }], // serviceIds missing → buildCatalog throws
    onError: (caught) => logged.push(caught),
  });
  assert.equal(catalog, null);
  assert.equal(error.kind, 'transform');
  assert.equal(logged.length, 1);
});

test('loadCatalog: a failure is not remembered — the next load recovers', async () => {
  let calls = 0;
  const deps = {
    fetchServices: async ({ timeoutMs }) => {
      calls += 1;
      assert.equal(timeoutMs, 4000);
      if (calls === 1) throw new ApiError(0, 'TIMEOUT');
      return [service()];
    },
    groups,
  };
  assert.equal(
    (await loadCatalogFrom(deps, { timeoutMs: 4000 })).catalog,
    null
  );
  const second = await loadCatalogFrom(deps, { timeoutMs: 4000 });
  assert.equal(second.error, null);
  assert.equal(second.catalog[0].variants[0].id, 's-60');
});

// ---------------------------------------------------------------------------
// UI side of the new failure kinds.

test('labels: timeout and invalid answer have French messages and keep the intent', () => {
  assert.match(bookingErrorMessage({ code: 'TIMEOUT' }), /trop de temps/);
  assert.match(bookingErrorMessage({ code: 'INVALID_RESPONSE' }), /incomplète/);
  // Unknown outcome: retried with the same Idempotency-Key.
  assert.equal(isRetryable({ code: 'TIMEOUT', status: 0 }), true);
  assert.equal(isRetryable({ code: 'INVALID_RESPONSE', status: 201 }), true);
  assert.equal(
    isRetryable({ code: 'IDEMPOTENCY_KEY_REUSED', status: 422 }),
    false
  );
  assert.equal(
    errorReference({ code: 'HTTP_500', status: 500, requestId: 'r-1' }),
    'Référence : r-1'
  );
  // A documented refusal needs no reference.
  assert.equal(
    errorReference({ code: 'SLOT_UNAVAILABLE', status: 409, requestId: 'r-2' }),
    null
  );
});

test('contract-check: inline responses (DELETE block) are compared too', () => {
  const [entry] = RESPONSES;
  const [method, route, status] = entry.split(' ');
  const openapi = {
    paths: {
      [route]: {
        [method.toLowerCase()]: {
          responses: {
            [status]: {
              content: {
                'application/json': {
                  schema: structuredClone(snapshot.responses[entry]),
                },
              },
            },
          },
        },
      },
    },
  };
  assert.deepEqual(responsesOf(openapi), snapshot.responses);
  openapi.paths[route].delete.responses['200'].content[
    'application/json'
  ].schema.required = ['id'];
  assert.notDeepEqual(responsesOf(openapi), snapshot.responses);
  assert.deepEqual(responsesOf({}), { [entry]: null });
});
