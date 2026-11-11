import { Faustina, Montserrat } from 'next/font/google';

import './globals.css';
import AuthProvider from '@/components/auth/AuthProvider';
import OptInNotice from '@/components/marketing/OptInNotice';
import Footer from '@/components/layout/Footer';
import { IS_INDEXABLE, SITE, SITE_URL } from '@/config/site';
import { ACCOUNT_HINT_SCRIPT } from '@/lib/auth/accountHint';
import { rootOpenGraph } from '@/lib/seo';

export const metadata = {
  ...(SITE_URL && { metadataBase: new URL(SITE_URL) }),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: rootOpenGraph,
  twitter: { card: 'summary_large_image' },
  // Preview/test builds and builds without a confirmed domain stay out of the index.
  ...(!IS_INDEXABLE && { robots: { index: false, follow: false } }),
};

// The site is French-only for now; no Cyrillic glyphs are needed.
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

// Faustina ships as a variable font (wght 300–800): one file per style
// instead of one per weight.
const faustina = Faustina({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-faustina',
  style: ['normal', 'italic'],
});

export default function RootLayout({ children }) {
  return (
    <html lang={SITE.language} suppressHydrationWarning>
      <head>
        {/* Sets <html data-account> before the first paint, so the header
            shows the right account label at once (lib/auth/accountHint.js).
            A plain blocking script on purpose: next/script queues inline
            code until the JS bundle runs, i.e. after the first paint. React
            warns about it in development only. */}
        <script dangerouslySetInnerHTML={{ __html: ACCOUNT_HINT_SCRIPT }} />
      </head>
      <body
        className={`${montserrat.variable} ${faustina.variable} font-montserrat bg-background text-foreground flex min-h-screen flex-col antialiased`}
      >
        {/* Header is rendered by each page: it picks its variant explicitly. */}
        {/* Client boundary for the session only: pages stay server-rendered. */}
        <AuthProvider>
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
          <OptInNotice />
        </AuthProvider>
      </body>
    </html>
  );
}
