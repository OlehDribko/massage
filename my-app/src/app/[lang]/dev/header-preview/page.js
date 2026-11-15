import { notFound } from 'next/navigation';

import HeaderPreview from './HeaderPreview';

export const metadata = {
  title: 'Header — aperçu local',
  robots: { index: false, follow: false },
};

// Local review of the header account states with sample data. It exists only
// under `next dev`: production builds answer 404, so it cannot switch roles
// or bypass anything on a deployed site.
export default function HeaderPreviewPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  return <HeaderPreview />;
}
