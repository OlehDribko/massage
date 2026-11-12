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
 * photo / text) — from 1280 px, where the columns are wide enough for the
 * text. Tablets and small laptops: one row per block, photo beside text
 * (alternating sides). Phones: each text follows its photo.
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

        <div className="rounded-panel grid overflow-hidden border border-black/7 bg-white/40 xl:grid-cols-3">
          {COLUMNS.map((column, index) => (
            <div
              key={column.heading}
              className={`grid sm:grid-cols-2 xl:grid-cols-1 ${index ? 'border-t border-black/7 xl:border-t-0 xl:border-l' : ''}`}
            >
              <div
                className={`relative h-[240px] overflow-hidden sm:h-auto sm:min-h-[300px] xl:h-[345px] xl:min-h-0 ${column.imageFirst ? '' : 'sm:order-last'}`}
              >
                <Image
                  src={column.image}
                  alt={column.imageAlt}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center gap-5 p-7 text-gray-900 sm:p-10 xl:h-[345px] xl:px-9 xl:py-8">
                <h3 className="font-faustina text-third-900 text-[1.625rem] leading-tight font-normal">
                  {column.heading}
                </h3>
                <ul className="font-montserrat text-body flex flex-col gap-3">
                  {column.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-pretty text-gray-800"
                    >
                      <span
                        aria-hidden
                        className="bg-primary-200 mt-[0.6em] size-1.5 shrink-0 rounded-full"
                      />
                      <span>{item}</span>
                    </li>
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
