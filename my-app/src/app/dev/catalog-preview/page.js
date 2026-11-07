import { notFound } from 'next/navigation';

import { ServiceList } from '@/components/booking/ServiceCard';

export const metadata = {
  title: 'Catalogue — aperçu local',
  robots: { index: false, follow: false },
};

const SAMPLE =
  'Exemple de texte pour l’aperçu local uniquement — aucune description n’est encore validée pour ce soin.';

const service = (id, name, durationMinutes, priceCents, sale) => ({
  id,
  name,
  durationMinutes,
  priceCents,
  effectivePriceCents: sale ?? priceCents,
  salePriceCents: sale ?? null,
  saleEndsAt: sale ? '2026-11-30T23:00:00.000Z' : null,
  currency: 'EUR',
});

// Sample cards to review the description toggle, the duration choice and a
// sale. Dev only (404 in production builds); never real catalogue content.
const PRESTATIONS = [
  {
    key: 'sample-long',
    name: 'Prestation avec description longue',
    description: `${SAMPLE} ${SAMPLE} ${SAMPLE}`,
    variants: [
      service('preview-a60', 'A', 60, 8500),
      service('preview-a90', 'A', 90, 12000),
      service('preview-a120', 'A', 120, 15500, 13900),
    ],
  },
  {
    key: 'sample-short',
    name: 'Prestation avec description courte',
    description: SAMPLE,
    variants: [service('preview-b45', 'B', 45, 11000)],
  },
  {
    key: 'sample-none',
    name: 'Prestation sans description (cas actuel)',
    description: null,
    variants: [
      service('preview-c55', 'C', 55, 9000),
      service('preview-c85', 'C', 85, 13500),
    ],
  },
];

export default function CatalogPreviewPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  return (
    <main className="px-page bg-gray-50 py-12">
      <div className="max-w-content mx-auto flex flex-col gap-6">
        <p className="font-montserrat text-body-sm text-gray-800">
          Aperçu local (next dev uniquement) — données fictives. Les liens «
          Réserver » mènent à des identifiants d’exemple (404).
        </p>
        <ServiceList catalog={PRESTATIONS} />
      </div>
    </main>
  );
}
