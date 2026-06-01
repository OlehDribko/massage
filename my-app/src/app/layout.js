import './globals.css';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export const metadata = {
  title: 'Stefaniya Ben',
  description: 'Massage',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <Header />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
