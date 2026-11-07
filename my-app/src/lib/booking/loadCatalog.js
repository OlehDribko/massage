import { SERVICE_GROUPS } from '@/content/services';
import { fetchServices } from '@/lib/api/public';
import { buildCatalog } from '@/lib/booking/catalog';

/**
 * Catalogue for server-rendered pages: API services + editorial layer.
 * A slow API must not hold the page: after `timeoutMs` the page renders
 * without the catalogue (and says so) instead of waiting.
 */
export async function loadCatalog({ timeoutMs = 4000 } = {}) {
  try {
    const services = await fetchServices({
      signal: AbortSignal.timeout(timeoutMs),
    });
    return { catalog: buildCatalog(services, SERVICE_GROUPS) };
  } catch {
    return { catalog: null };
  }
}
