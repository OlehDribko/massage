import { notFound } from 'next/navigation';

import { ServiceList } from '@/components/booking/ServiceCard';

export const metadata = {
  title: 'Catalogue — aperçu local',
  robots: { index: false, follow: false },
};

const SAMPLE = 'Exemple de texte pour l’aperçu local uniquement.';
const FEATURES = ['Premier point de l’aperçu.', 'Second point de l’aperçu.'];

const service = (id, name, durationMinutes, priceCents, extra = {}) => ({
  id,
  name,
  description: null,
  features: [],
  durationMinutes,
  priceCents,
  effectivePriceCents: extra.sale ?? priceCents,
  salePriceCents: extra.sale ?? null,
  saleEndsAt: extra.sale ? '2026-11-30T23:00:00.000Z' : null,
  currency: 'EUR',
  ...extra.texts,
});

// Sample cards to review the texts of each duration (the API has one text
// per duration: switching the duration switches the text), texts missing
// for one duration, the duration choice and a sale. Dev only (404 in
// production builds); never real catalogue content.
const PRESTATIONS = [
  {
    key: 'sample-long',
    name: 'Texte différent par durée',
    variants: [
      service('preview-a60', 'A', 60, 8500, {
        texts: { description: `60 min — ${SAMPLE}`, features: FEATURES },
      }),
      service('preview-a90', 'A', 90, 12000, {
        texts: {
          description: `90 min — ${SAMPLE} ${SAMPLE} ${SAMPLE}`,
          features: [...FEATURES, 'Troisième point (90 min).'],
        },
      }),
      // No text for this duration: no « Description » button.
      service('preview-a120', 'A', 120, 15500, { sale: 13900 }),
    ],
  },
  {
    key: 'sample-short',
    name: 'Description sans particularités',
    variants: [
      service('preview-b45', 'B', 45, 11000, {
        texts: { description: SAMPLE },
      }),
    ],
  },
  {
    key: 'sample-features',
    name: 'Particularités sans description',
    variants: [
      service('preview-d30', 'D', 30, 5000, { texts: { features: FEATURES } }),
    ],
  },
  {
    key: 'sample-none',
    name: 'Sans texte',
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
