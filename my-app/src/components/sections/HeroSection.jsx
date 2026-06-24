import PillButton from '@/components/ui/PillButton';
import SectionLabel from '@/components/ui/SectionLabel';

export default function HeroSection() {
  return (
    <section className="bg-hero bg-cover bg-center bg-no-repeat">
      <div className="w-full px-section-x">
        <div className="flex h-hero w-full max-w-hero flex-col justify-end pb-hero-bottom text-on-dark">
          <SectionLabel>Soins professionnels du corps</SectionLabel>
          <h1 className="font-faustina text-hero font-medium text-cream">
            The Most Amazing Way{' '}
            <span className="font-light text-cream/70 italic">to Restore</span>
          </h1>
          <div className="mt-actions-top font-montserrat font-medium">
            <PillButton>Prendre rendez-vous</PillButton>
            <button className="ml-actions-inline font-montserrat text-link font-medium text-on-dark uppercase underline decoration-link underline-offset-link">
              Découvrir les services
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
