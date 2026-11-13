import Image from 'next/image';

import PillButton from '@/components/ui/PillButton';
import SectionEyebrow from '@/components/ui/SectionEyebrow';

const POINTS = [
  'Idéale pour toute personne recherchant détente, récupération ou un moment rien qu’à elle.',
  'Au choix : un montant libre, utilisable sur l’ensemble des soins, ou un soin précis à offrir.',
  'Valable 1 an à compter de la date d’achat, envoyée par email prête à offrir.',
];

// No online gift-card purchase: the request form (GiftCardDrawer) asks for
// the visitor's details and the practitioner calls back.
const REQUEST_HREF = '#carte-cadeau';

/**
 * Figma «Carte cadeau» (704:1672): eyebrow, then a band between hairlines
 * with the gift-card photo laid over a stone texture (offset 113 / 62 px
 * at 1440, drawn here in % so it scales) and the offer on the right.
 */
export default function GiftCardSection() {
  return (
    <section className="bg-secondary-50 py-20 lg:py-40">
      <div className="px-page">
        <SectionEyebrow className="max-w-content mx-auto mb-10 lg:mb-15">
          Carte cadeau
        </SectionEyebrow>
      </div>

      <div className="px-page border-y border-black/7">
        <div className="max-w-content mx-auto flex flex-col items-center gap-10 lg:flex-row lg:gap-[66px]">
          <div className="relative aspect-[661/411] w-full max-w-[661px] lg:flex-[661]">
            <div
              aria-hidden
              className="rounded-card absolute right-0 bottom-0 h-[84.9%] w-[82.9%] overflow-hidden opacity-50"
            >
              <Image
                src="/images/gift-card-stone.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 548px, 83vw"
                className="object-cover"
              />
            </div>
            <div className="rounded-card absolute top-0 left-0 h-[89.8%] w-[92.9%] overflow-hidden">
              <Image
                src="/images/gift-card.jpg"
                alt="Carte cadeau : massage dans une ambiance aux bougies"
                fill
                sizes="(min-width: 1024px) 614px, 93vw"
                className="object-cover"
              />
              <div aria-hidden className="absolute inset-0 bg-black/19" />
            </div>
          </div>

          <div className="flex w-full flex-col gap-6 lg:flex-[554]">
            <h2 className="font-montserrat text-body-lg font-bold text-gray-800">
              Offrez un moment de bien-être
            </h2>
            <ul className="font-montserrat text-body-lg flex list-disc flex-col gap-3 pl-[27px] text-gray-800">
              {POINTS.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <PillButton
              href={REQUEST_HREF}
              className="mt-2 w-full sm:w-[276px]"
            >
              Laisser une demande
            </PillButton>
          </div>
        </div>
      </div>
    </section>
  );
}
