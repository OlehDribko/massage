import { Faustina, Montserrat } from 'next/font/google';

import './globals.css';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

export const metadata = {
  title: 'Stefaniya Ben',
  description: 'Massage',
};

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-montserrat',
});

const faustina = Faustina({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-faustina',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${faustina.variable} font-montserrat bg-background text-foreground flex min-h-screen flex-col antialiased`}
      >
        <Header />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
