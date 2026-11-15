/*
 * Public booking API (no token): catalogue and availability. Works on the
 * server (catalogue pages) and in the browser (availability). Responses are
 * `no-store` on the API side: prices depend on the moment of the request.
 */

import { API_BASE_URL } from '@/config/auth';
import { normalizeService, validatorFor } from '@/lib/api/contract';
import { ApiError, apiRequest } from '@/lib/auth/session';

function publicGet(path, { signal, timeoutMs, validate, route } = {}) {
  if (!API_BASE_URL) {
    return Promise.reject(
      new ApiError(0, 'NOT_CONFIGURED', undefined, {}, { method: 'GET', route })
    );
  }
  return apiRequest({
    baseUrl: API_BASE_URL,
    path,
    signal,
    timeoutMs,
    validate,
    route,
  });
}

/**
 * GET /api/services → services open for booking, checked against the
 * contract (src/lib/api/contract.js); `description` / `features` are
 * normalised (null / []).
 */
export async function fetchServices(options = {}) {
  const { services } = await publicGet('/api/services', {
    ...options,
    validate: validatorFor('services'),
    route: '/api/services',
  });
  return services.map(normalizeService);
}

/** GET /api/services/:id → the service, or null (404 SERVICE_NOT_FOUND). */
export async function fetchService(serviceId) {
  try {
    const { service } = await publicGet(
      `/api/services/${encodeURIComponent(serviceId)}`,
      { route: '/api/services/{serviceId}' }
    );
    return service ? normalizeService(service) : null;
  } catch (error) {
    // Unknown, archived or malformed id.
    if (error instanceof ApiError && [400, 404].includes(error.status)) {
      return null;
    }
    throw error;
  }
}

/**
 * GET /api/services/:id/availability?from=&to= (studio dates). The server
 * clips the range to [today, today + 45].
 */
export function fetchAvailability(serviceId, { from, to } = {}, options) {
  const query = new URLSearchParams();
  if (from) query.set('from', from);
  if (to) query.set('to', to);
  const suffix = query.size ? `?${query}` : '';
  return publicGet(
    `/api/services/${encodeURIComponent(serviceId)}/availability${suffix}`,
    {
      ...options,
      validate: validatorFor('availability'),
      route: '/api/services/{serviceId}/availability',
    }
  );
}

/**
 * Public newsletter link actions (docs/auth-and-profiles.md, «Маркетингова
 * підписка»): the token from the email link goes in the POST body. The
 * routes exist only while newsletters are switched on (404 otherwise).
 */
export function postMarketingAction(action, token) {
  if (!API_BASE_URL) {
    return Promise.reject(new ApiError(0, 'NOT_CONFIGURED'));
  }
  return apiRequest({
    baseUrl: API_BASE_URL,
    path: `/api/marketing/subscriptions/${action}`,
    method: 'POST',
    body: { token },
  });
}

/**
 * POST /api/marketing/subscriptions — newsletter form (double opt-in). The
 * answer is the same for a new, pending or subscribed address (202
 * SUBSCRIPTION_REQUESTED): nothing reveals whether an address is known.
 * Errors: 503 CONFIRMATION_EMAIL_NOT_SENT, 409 CONSENT_TEXT_OUTDATED.
 */
export function subscribeNewsletter(email, consentTextVersion) {
  if (!API_BASE_URL) {
    return Promise.reject(new ApiError(0, 'NOT_CONFIGURED'));
  }
  return apiRequest({
    baseUrl: API_BASE_URL,
    path: '/api/marketing/subscriptions',
    method: 'POST',
    body: { email, consentTextVersion },
  });
}
