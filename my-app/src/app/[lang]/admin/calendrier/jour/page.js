import { Suspense } from 'react';

import AdminDayBookings from '@/components/admin/AdminDayBookings';
import Header from '@/components/layout/Header';
import SectionEyebrow from '@/components/ui/SectionEyebrow';

export const metadata = {
  title: 'Agenda du jour — administration',
};

export default function AdminDayPage() {
  return (
    <>
      <Header variant="solid" />
      <main className="px-page flex-1 py-16 sm:py-24">
        <div className="max-w-content mx-auto flex w-full flex-col gap-10">
          <SectionEyebrow>Administration</SectionEyebrow>
          <Suspense
            fallback={
              <p className="font-montserrat text-body text-gray-800">
                Chargement…
              </p>
            }
          >
            <AdminDayBookings />
          </Suspense>
        </div>
      </main>
    </>
  );
}
