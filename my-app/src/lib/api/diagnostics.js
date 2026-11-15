/*
 * Server-side diagnostics of failed API calls. One JSON line per failure
 * with what is needed to find the request in the backend logs
 * (Massage-backend docs/frontend-handoff.md, «Звіт про збій і
 * X-Request-Id»): method, route template, HTTP status, `code` and the
 * server's X-Request-Id. Never logged: tokens, request bodies, query
 * strings, ids in the path, emails, phones, response bodies.
 *
 * Pure, relative imports only — tested with `node --test`.
 */

import { errorKind } from '../auth/session.js';

/** Safe summary of a failure (no personal data, no query, no token). */
export function describeFailure(error, { operation } = {}) {
  const kind = error?.kind ?? errorKind(error);
  return {
    operation: operation ?? null,
    kind,
    method: error?.method ?? null,
    route: error?.route ?? null,
    status: typeof error?.status === 'number' ? error.status : null,
    code: typeof error?.code === 'string' ? error.code : (error?.name ?? null),
    requestId: error?.requestId ?? null,
    ...(error?.details?.field ? { field: error.details.field } : {}),
  };
}

/** Writes one diagnostic line (server logs: Vercel / `next start`). */
export function logFailure(error, context, log = console.error) {
  log(`[api] ${JSON.stringify(describeFailure(error, context))}`);
}
