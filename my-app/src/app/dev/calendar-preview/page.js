import { notFound } from 'next/navigation';

import CalendarPreview from './CalendarPreview';

export const metadata = {
  title: 'Calendrier — aperçu local',
  robots: { index: false, follow: false },
};

// Local review of the admin calendar views with sample data. It exists only
// under `next dev`: production builds answer 404 and nothing here calls the
// API.
export default function CalendarPreviewPage() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <CalendarPreview />;
}
