import Location from '@/components/LocationMap';
import Planity from '@/components/Planity';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Location />
      <Planity />
    </main>
  );
}
