import Header from '@/components/layout/Header';
import HomeMotion from '@/components/motion/HomeMotion';
import AboutMeSection from '@/components/sections/AboutMeSection';
import ApproachSection from '@/components/sections/ApproachSection';
import EndosphereSection from '@/components/sections/EndosphereSection';
import GiftCardSection from '@/components/sections/GiftCardSection';
import HeroSection from '@/components/sections/HeroSection';
import NewsletterSection from '@/components/sections/NewsletterSection';
import ServicesSection from '@/components/sections/ServicesSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import JsonLd from '@/components/seo/JsonLd';
import { loadCatalog } from '@/lib/booking/loadCatalog';
import { getT, setRequestLocale } from '@/i18n/server';
import { localBusinessJsonLd, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = getT(lang);
  return pageMetadata({
    title: t('Massage à Bordeaux | Massage by Stefania Ben'),
    absoluteTitle: true,
    description: t(
      'Cabinet de massage à Bordeaux, rue Castéja : massage thérapeutique et relaxant, Tuina, drainage lymphatique, anti-cellulite et Endosphères. Réservez en ligne.'
    ),
    path: '/',
    locale: lang,
  });
}

export default async function Home({ params }) {
  const { lang } = await params;
  setRequestLocale(lang);
  // Real prices for « Nos soins populaires »; the page renders without them
  // if the API is slow or down.
  const { catalog } = await loadCatalog({ timeoutMs: 2500, locale: lang });
  const featured = catalog?.filter((prestation) => prestation.featured) ?? null;

  return (
    <>
      <Header variant="overlay" />
      {/* Motion (test): GSAP scroll animations attach to these sections. */}
      <main className="home-motion">
        <JsonLd data={localBusinessJsonLd(catalog, lang)} />
        <HomeMotion />
        <HeroSection />
        <AboutMeSection id="about" />
        <ServicesSection id="services" prestations={featured} />
        <ApproachSection id="approach" />
        <EndosphereSection />
        <GiftCardSection />
        <TestimonialsSection id="testimonials" />
        <NewsletterSection />
      </main>
    </>
  );
}
