import Link from 'next/link';

const PRIMARY_COLOR =
  process.env.NEXT_PUBLIC_PLANITY_PRIMARY_COLOR ?? '#171717';

export default function PlanitySection() {
  return (
    <section aria-label="Réservation en ligne" className="w-full py-8">
      <div className="flex justify-center">
        <Link
          href="/reserver"
          className="rounded-md px-6 py-3 text-sm font-medium text-white"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          Prendre rendez-vous
        </Link>
      </div>
    </section>
  );
}
