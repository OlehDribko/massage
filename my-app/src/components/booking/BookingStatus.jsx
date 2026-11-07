import StatusBadge from '@/components/ui/StatusBadge';
import { PHASES } from '@/lib/booking/labels';

// Phase badge of a booking (upcoming / in progress / finished / cancelled).
export default function BookingStatus({ phase }) {
  const entry = PHASES[phase] ?? { label: 'Statut inconnu', tone: 'muted' };
  return <StatusBadge tone={entry.tone}>{entry.label}</StatusBadge>;
}
