import Link from 'next/link';

import { getPlanitySingleServiceBookingUrl } from '@/components/integrations/planity/planityConfig';

const PRIMARY_COLOR =
  process.env.NEXT_PUBLIC_PLANITY_PRIMARY_COLOR ?? '#171717';

export default function PlanitySection() {
  const singleServiceUrl = getPlanitySingleServiceBookingUrl();

  return (
    <section aria-label="Réservation en ligne" className="w-full py-8">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/reserver"
          className="rounded-md px-6 py-3 text-sm font-medium text-white"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          Prendre rendez-vous
        </Link>
        <a
          href={singleServiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border px-6 py-3 text-sm font-medium"
          style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
        >
          Réserver Massage Tuina
        </a>
      </div>
    </section>
  );
}
