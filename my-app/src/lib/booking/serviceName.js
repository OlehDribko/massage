/*
 * Name of a service or prestation in the visitor's language (the API sends
 * French only). Kept apart from catalogI18n.js so the browser bundles only
 * the names, not every translated description. Pure.
 */

import { SERVICE_GROUPS } from '../../content/services.js';
import { SERVICE_NAMES } from '../../content/i18n/serviceNames.js';

export const GROUP_OF = new Map(
  SERVICE_GROUPS.flatMap((group) =>
    group.serviceIds.map((id) => [id, group.key])
  )
);

export const sameText = (a, b) => (a ?? '').trim() === (b ?? '').trim();

/**
 * Name of a service (by id) or prestation (by key) in `locale`. A name the
 * API changed since the translation stays French until it is updated.
 */
export function localizedServiceName({ id, key, name }, locale) {
  if (!locale || locale === 'fr') return name;
  const groupKey = key && SERVICE_NAMES[key] ? key : GROUP_OF.get(id);
  const entry = groupKey ? SERVICE_NAMES[groupKey] : null;
  if (!entry?.[locale]) return name;
  if (name && !sameText(entry.fr, name)) return name;
  return entry[locale];
}
