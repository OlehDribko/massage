import { SERVICE_GROUPS } from '@/content/services';
import { fetchServices } from '@/lib/api/public';
import { logFailure } from '@/lib/api/diagnostics';
import { loadCatalogFrom } from '@/lib/booking/catalog';

/**
 * Catalogue for server-rendered pages: API services + editorial layer.
 * A slow API must not hold the page: after `timeoutMs` the page renders
 * without the catalogue (and says so) instead of waiting. Every failure is
 * logged once on the server (src/lib/api/diagnostics.js); nothing is
 * cached, so the next request tries again.
 *
 * → `{ catalog, error }`: `catalog` null when unavailable, `error` the safe
 * summary (`kind`: timeout | network | http | invalid_response |
 * not_configured | transform).
 */
export function loadCatalog({ timeoutMs = 4000 } = {}) {
  return loadCatalogFrom(
    { fetchServices, groups: SERVICE_GROUPS, onError: logFailure },
    { timeoutMs }
  );
}
