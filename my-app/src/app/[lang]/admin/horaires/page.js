import AdminSchedule from '@/components/admin/AdminSchedule';
import Header from '@/components/layout/Header';
import SectionEyebrow from '@/components/ui/SectionEyebrow';
import { getT, setRequestLocale } from '@/i18n/server';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = getT(lang, { admin: true });
  return { title: t('Horaires — administration') };
}

export default async function AdminHorairesPage({ params }) {
  setRequestLocale((await params).lang);
  const t = getT(undefined, { admin: true });
  return (
    <>
      <Header variant="solid" />
      <main className="px-page flex-1 py-16 sm:py-24">
        <div className="max-w-content mx-auto flex w-full flex-col gap-10">
          <SectionEyebrow>{t('Administration')}</SectionEyebrow>
          <AdminSchedule />
        </div>
      </main>
    </>
  );
}
