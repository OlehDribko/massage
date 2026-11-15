import { redirect } from 'next/navigation';

import { localizePath } from '@/i18n/config';

export default async function AdminPage({ params }) {
  const { lang } = await params;
  redirect(localizePath(lang, '/admin/calendrier'));
}
