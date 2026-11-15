import { redirect } from 'next/navigation';

import { localizePath } from '@/i18n/config';

// The day agenda moved inside the calendar; old links keep working.
export default async function AdminReservationsPage({ params, searchParams }) {
  const { lang } = await params;
  const { date } = await searchParams;
  redirect(
    localizePath(
      lang,
      typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? `/admin/calendrier/jour?date=${date}`
        : '/admin/calendrier/jour'
    )
  );
}
