import AdminSchedule from '@/components/admin/AdminSchedule';
import Header from '@/components/layout/Header';
import SectionEyebrow from '@/components/ui/SectionEyebrow';

export const metadata = {
  title: 'Horaires — administration',
};

export default function AdminHorairesPage() {
  return (
    <>
      <Header variant="solid" />
      <main className="px-page flex-1 py-16 sm:py-24">
        <div className="max-w-content mx-auto flex w-full flex-col gap-10">
          <SectionEyebrow>Administration</SectionEyebrow>
          <AdminSchedule />
        </div>
      </main>
    </>
  );
}
