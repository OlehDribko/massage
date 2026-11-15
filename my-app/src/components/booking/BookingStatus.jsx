'use client';

import { useT } from '@/i18n/client';
import StatusBadge from '@/components/ui/StatusBadge';
import { PHASES } from '@/lib/booking/labels';

// Phase badge of a booking (upcoming / in progress / finished / cancelled).
export default function BookingStatus({ phase }) {
  const t = useT();
  const entry = PHASES[phase] ?? { label: 'Statut inconnu', tone: 'muted' };
  return <StatusBadge tone={entry.tone}>{t(entry.label)}</StatusBadge>;
}
