import Image from 'next/image';

import PillButton from '@/components/ui/PillButton';
import SectionEyebrow from '@/components/ui/SectionEyebrow';
import { ENDOSPHERES_SERVICE_ID } from '@/content/services';

/**
 * Figma «Endosphérologie» (704:1654): full-bleed photo, mirrored and
 * enlarged as in the mock-up (device on the right), a dark gradient from
 * the left, text on the bottom edge (120 px above it on desktop).
 */
export default function EndosphereSection() {
  return (
    <section className="bg-third-900 relative flex min-h-[880px] flex-col justify-end overflow-hidden lg:min-h-[960px]">
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        {/* Full size of the original (1897 px): no extra enlargement, so
            the photo stays sharp; mirrored as in the mock-up. */}
        <div className="absolute inset-0">
          <Image
            src="/images/endosphere-device.jpg"
            alt=""
            fill
            quality={90}
            sizes="100vw"
            className="-scale-x-100 object-cover object-[22%_40%] lg:object-[60%_45%]"
          />
        </div>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#1a0f08_0%,#1a0f08_25%,rgba(26,15,8,0)_60%)] lg:bg-[linear-gradient(90deg,#1a0f08_0%,rgba(26,15,8,0)_96%)]" />
      </div>

      <div className="px-page relative pt-40 pb-16 lg:pb-[120px]">
        <div className="max-w-content mx-auto flex flex-col gap-10">
          <div className="flex max-w-[662px] flex-col gap-8">
            {/* Mobile mock-up (704:1592) only. */}
            <SectionEyebrow className="lg:hidden [&_p]:text-gray-50 [&_span]:bg-gray-100">
              Soin signature
            </SectionEyebrow>
            <h2 className="font-faustina text-h5 sm:text-h3 xl:text-h2 font-normal tracking-[-0.64px] text-gray-50">
              Découvrez le massage
              <span className="text-third-200 block font-light italic">
                Endosphérologie
              </span>
            </h2>
            <p className="font-montserrat text-body-lg text-gray-100">
              Une technologie de compression mécanique par rouleaux, pensée pour
              stimuler la microcirculation, drainer les tissus en profondeur et
              redessiner la silhouette. Un soin d’exception pour un corps
              visiblement plus tonique.
            </p>
          </div>
          {/* Books this very service: the choice is kept. */}
          <PillButton
            href={`/reserver/${ENDOSPHERES_SERVICE_ID}`}
            className="max-sm:min-h-12 max-sm:w-[260px] sm:w-fit"
          >
            Réserver ce soin
          </PillButton>
        </div>
      </div>
    </section>
  );
}
