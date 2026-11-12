import Image from 'next/image';

import PillButton from '@/components/ui/PillButton';
import PlanityBadge from '@/components/ui/PlanityBadge';
import SectionLabel from '@/components/ui/SectionLabel';

/**
 * The photo fills the first screen (100svh — never a fixed height that
 * would push the actions below the fold). Taller content makes the section
 * taller.
 * - Phones (Figma 542:1585): title and full-width button centred in the
 *   screen, the Planity rating as a full-width strip on the bottom edge.
 * - From 768 px (Figma 412:171): label, title and both actions on the
 *   bottom-left, the Planity card on the bottom-right, 120 px above the
 *   edge on desktop.
 */
export default function HeroSection() {
  return (
    <section className="bg-secondary-900 relative flex min-h-[max(100svh,40rem)] flex-col overflow-hidden md:justify-end">
      <Image
        src="/images/hero-br.jpg"
        alt="Massage du dos dans un cabinet de massage à Bordeaux"
        fill
        preload
        sizes="100vw"
        className="hero-photo object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-black/40" />

      <div className="px-page relative flex flex-1 flex-col justify-center gap-10 pt-32 pb-12 md:flex-none md:pt-40 md:pb-20 lg:flex-row lg:items-end lg:justify-between lg:pb-[120px]">
        <div className="max-w-hero flex flex-col gap-10 max-md:items-center max-md:text-center md:gap-5 lg:gap-10">
          <div className="flex flex-col gap-5">
            <SectionLabel className="hero-in hidden text-gray-100 md:flex">
              Soins professionnels du corps
            </SectionLabel>
            <h1
              style={{ '--hero-step': 1 }}
              className="hero-in font-faustina text-base-white lg:text-hero text-[54px] leading-[1.1] font-normal tracking-[-0.27px] md:text-[64px] lg:leading-[1.05] lg:tracking-[-0.84px]"
            >
              Le massage qui vous{' '}
              <span className="font-light text-gray-200 italic">ressource</span>
            </h1>
          </div>
          <div
            style={{ '--hero-step': 2 }}
            className="hero-in md:gap-actions-inline flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-center"
          >
            <PillButton
              href="/reserver"
              className="max-md:min-h-12 max-md:w-full max-md:py-2.5"
            >
              Prendre rendez-vous
            </PillButton>
            <div className="hidden md:block">
              <PillButton variant="text" href="#services" tone="light">
                Découvrir les services
              </PillButton>
            </div>
          </div>
        </div>

        {/* Planity card (tablet / desktop) — links to all reviews. */}
        <PlanityBadge
          variant="card"
          style={{ '--hero-step': 3 }}
          className="hero-in hidden md:flex"
        />
      </div>

      {/* Planity strip (phones). */}
      <PlanityBadge
        variant="strip"
        style={{ '--hero-step': 3 }}
        className="hero-in relative md:hidden"
      />
    </section>
  );
}
