import Image from 'next/image';

import SectionEyebrow from '@/components/ui/SectionEyebrow';

const COLUMNS = [
  {
    image: '/images/approach-hands.jpg',
    imageAlt: 'Mains posées sur une serviette après un massage',
    imageFirst: true,
    heading: 'Qui est concerné',
    items: [
      'Tensions chroniques du dos et de la nuque',
      'Stress accumulé et sommeil perturbé',
      'Manque d’énergie au quotidien',
    ],
  },
  {
    image: '/images/approach-cupping.jpg',
    imageAlt: 'Pose de ventouses sur le dos pendant une séance',
    imageFirst: false,
    heading: 'Ce que vous recevez',
    items: [
      'Spécialiste certifiée, formée à l’Institut de Vertébrologie',
      'Un traitement personnalisé selon votre morphologie.',
      'Des techniques professionnelles éprouvées',
    ],
  },
  {
    image: '/images/approach-shoulder.jpg',
    imageAlt: '',
    imageFirst: true,
    heading: 'Résultats',
    items: [
      'Dès la 1ère séance — soulagement immédiat',
      'Après 3 séances — mobilité restaurée',
      'Suivi régulier — bien-être durable, dans un cadre confortable et confidentiel',
    ],
  },
];

/**
 * Figma «how-it-works-steps» (577:651): a 3 × 2 grid of 345 px cells,
 * photos and text cells alternating (photo / text, text / photo,
 * photo / text). Phones: each text follows its photo.
 */
export default function ApproachSection({ id }) {
  return (
    <section
      id={id}
      className="bg-secondary-100 px-page pt-[100px] pb-[100px] lg:pt-20 lg:pb-40"
    >
      <div className="max-w-content mx-auto flex flex-col gap-12 lg:gap-20">
        <div className="flex flex-col gap-10 lg:gap-[60px]">
          <SectionEyebrow>Pourquoi me choisir</SectionEyebrow>
          <h2 className="font-faustina text-third-900 text-h5 sm:text-h3 xl:text-h2 max-w-[879px] leading-[1.1] font-light tracking-[0.64px]">
            Une approche pensée pour votre bien-être,{' '}
            <span className="text-third-200 font-light italic">
              pas juste une séance
            </span>
          </h2>
        </div>

        <div className="rounded-card grid overflow-hidden sm:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.heading} className="flex flex-col">
              <div
                className={`relative h-[260px] overflow-hidden bg-white lg:h-[345px] ${column.imageFirst ? '' : 'sm:order-last'}`}
              >
                <Image
                  src={column.image}
                  alt={column.imageAlt}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex min-h-[260px] flex-col justify-center gap-6 border border-black/7 p-8 text-gray-900 lg:h-[345px] lg:p-10">
                <h3 className="font-montserrat text-body-lg font-bold">
                  {column.heading}
                </h3>
                <ul className="font-montserrat text-body list-disc pl-6 font-medium">
                  {column.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
