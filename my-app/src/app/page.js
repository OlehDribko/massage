import HeroSection from '@/components/sections/HeroSection';
import LocationSection from '@/components/sections/LocationSection';
import PlanitySection from '@/components/sections/PlanitySection';

export const metadata = {
  title: 'Massage Bordeaux | Dos, Tuina, drainage & Endosphères',

  description:
    'Cabinet de massage à Bordeaux spécialisé dans le mal de dos, le massage Tuina chinois, le drainage lymphatique et les soins anti-cellulite Endosphères sur appareil spécialisé.',

  keywords: [
    'massage Bordeaux',
    'massage thérapeutique Bordeaux',
    'massage du dos Bordeaux',
    'mal de dos Bordeaux',
    'massage Tuina Bordeaux',
    'massage chinois Bordeaux',
    'drainage lymphatique Bordeaux',
    'massage anti-cellulite Bordeaux',
    'Endosphères Bordeaux',
    'Endosphera Bordeaux',
    'cabinet massage Bordeaux',
    'prendre rendez-vous massage Bordeaux',
  ],
};

export default function Home() {
  return (
    <main>
      <HeroSection />
      <div className="px-section-x">
        <LocationSection />
        <PlanitySection />
      </div>
    </main>
  );
}
