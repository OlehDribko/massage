import { redirect } from 'next/navigation';

// The day agenda moved inside the calendar; old links keep working.
export default async function AdminReservationsPage({ searchParams }) {
  const { date } = await searchParams;
  redirect(
    typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? `/admin/calendrier/jour?date=${date}`
      : '/admin/calendrier/jour'
  );
}
