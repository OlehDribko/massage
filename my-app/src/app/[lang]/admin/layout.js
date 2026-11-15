import { I18nProvider } from '@/i18n/client';
import { ADMIN_LOCALES, DEFAULT_LOCALE } from '@/i18n/config';
import { getMessages } from '@/i18n/messages';
import { setRequestLocale } from '@/i18n/server';

// Administration: never indexed, not in the sitemap. Access is enforced by
// the API on every request (requireAdmin); these pages only show it.
export const metadata = {
  robots: { index: false, follow: false },
};

// French or Ukrainian (src/proxy.js sends /en/admin and /ru/admin to
// /admin); the administration's texts are added to the site's dictionary.
export default async function AdminLayout({ children, params }) {
  const { lang } = await params;
  const locale = ADMIN_LOCALES.includes(lang) ? lang : DEFAULT_LOCALE;
  setRequestLocale(locale);
  return (
    <I18nProvider
      locale={locale}
      messages={getMessages(locale, { admin: true })}
    >
      {children}
    </I18nProvider>
  );
}
