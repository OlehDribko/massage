import Image from 'next/image';

import SectionEyebrow from '@/components/ui/SectionEyebrow';

const BIO = [
  'Je suis Stefaniia, masseuse certifiée avec plus de 10 ans d’expérience.',
  'J’ai travaillé à l’Institut de Vertébrologie et je suis spécialisée dans différents types de massages : thérapeutique, drainage lymphatique, anti-cellulite, relaxant et bien d’autres.',
  'Mon objectif n’est pas seulement de réaliser une séance, mais d’obtenir des résultats concrets et d’améliorer votre bien-être.',
];

const STATS = [
  { value: '500+', label: 'clients' },
  { value: '12', label: 'ans d’expérience', short: 'ans d’exp.' },
  { value: '98%', label: 'reviennent' },
];

/**
 * Figma «massage-confirmed-section» (380:213): text column (661 px at
 * 1440) with the stats under a hairline, photo 554 × 650 on the right.
 * The portrait is the original of the mock-up (not mirrored); between
 * 1024 and 1280 px it takes 44 % of the width so the row never overflows.
 */
export default function AboutMeSection({ id }) {
  return (
    <section id={id} className="bg-secondary-100 px-page pt-6 pb-20 lg:py-40">
      <div className="max-w-content mx-auto flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="flex min-w-0 flex-col gap-12 max-lg:order-last lg:max-w-[661px] lg:flex-1 lg:gap-20">
          <div className="flex flex-col gap-10 lg:gap-[60px]">
            <SectionEyebrow>Pourquoi mes clients me choisissent</SectionEyebrow>
            <div className="flex flex-col gap-8 lg:gap-10">
              <h2 className="font-faustina text-third-900 text-h5 sm:text-h3 xl:text-h2 leading-[1.1] font-light tracking-normal">
                Massage professionnel avec des{' '}
                <span className="text-third-200 font-normal italic">
                  résultats visibles
                </span>
              </h2>
              <div className="font-montserrat text-body-lg flex flex-col gap-3 text-gray-800">
                {BIO.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          <dl className="flex justify-between gap-4 border-t border-black/7 pt-8">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col-reverse gap-1 md:min-w-[140px]"
              >
                <dt className="font-montserrat text-body-sm md:text-body text-gray-800 md:font-medium md:uppercase">
                  {stat.short ? (
                    <>
                      <span className="md:hidden">{stat.short}</span>
                      <span className="hidden md:inline">{stat.label}</span>
                    </>
                  ) : (
                    stat.label
                  )}
                </dt>
                <dd className="font-faustina text-third-900 text-[36px] leading-[1.15] font-light tracking-[-0.36px] md:text-[64px] md:leading-none md:tracking-[-0.64px]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-card relative aspect-[358/349] w-full shrink-0 overflow-hidden sm:aspect-[554/650] sm:max-w-[554px] lg:w-[44%] xl:w-[554px]">
          <Image
            src="/images/about-stefania.jpg"
            alt="Stefaniia, masseuse certifiée à Bordeaux"
            fill
            sizes="(min-width: 640px) 554px, 100vw"
            quality={90}
            data-parallax="soft"
            className="object-cover object-[50%_30%] sm:object-[50%_75%]"
          />
        </div>
      </div>
    </section>
  );
}
