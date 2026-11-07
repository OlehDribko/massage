// Administration: never indexed, not in the sitemap. Access is enforced by
// the API on every request (requireAdmin); these pages only show it.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return children;
}
