// Private client area: no page under /compte is indexed (not in the sitemap
// either — see src/config/site.js).
export const metadata = {
  robots: { index: false, follow: false },
};

export default function CompteLayout({ children }) {
  return children;
}
