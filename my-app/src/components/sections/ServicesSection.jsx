import PillButton from '@/components/ui/PillButton';
import PopularAccordion from '@/components/sections/PopularAccordion';

/**
 * Figma «Nos soins populaires» (704:1296): title row, then a full-width
 * band (hairlines above and below) with the numbered accordion on the left
 * and the photo on the right, then «Découvrir les services».
 * The open item picks the photo (PopularAccordion). Names, durations and
 * prices are the featured prestations of the API;
 * `prestations` null = catalogue unavailable: only the catalogue link.
 */
export default function ServicesSection({ id, prestations }) {
  return (
    <section
      id={id}
      className="bg-secondary-50 pt-[100px] pb-20 lg:pt-40 lg:pb-40"
    >
      <div className="px-page">
        <div className="max-w-content mx-auto flex flex-col gap-4 pb-12 lg:flex-row lg:items-center lg:justify-between lg:pb-20">
          <h2 className="font-faustina text-third-900 text-h5 sm:text-h3 xl:text-h2 font-normal">
            Nos soins <span className="heading-accent">populaires</span>
          </h2>
          <p className="font-montserrat text-body-lg font-medium text-gray-800">
            {prestations?.length ? `${prestations.length} soins` : 'Les soins'}{' '}
            les plus demandés.
            <br />
            Un doute ? Consultation gratuite.
          </p>
        </div>
      </div>

      <div className="px-page border-y border-black/7">
        <div className="max-w-content mx-auto">
          {prestations?.length ? (
            <PopularAccordion prestations={prestations} />
          ) : (
            <p className="font-montserrat text-body py-10 text-gray-800">
              Retrouvez tous nos soins, leurs durées et leurs tarifs sur la page
              de réservation.
            </p>
          )}
        </div>
      </div>

      <div className="px-page">
        <div className="max-w-content mx-auto pt-10">
          <PillButton variant="text" tone="primary" href="/reserver">
            Découvrir les services
          </PillButton>
        </div>
      </div>
    </section>
  );
}
