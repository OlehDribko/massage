/**
 * Planity ne s'affiche pas en mode sombre par défaut (bug connu côté widget).
 * Cette page force le thème clair.
 */
export default function ReserverLayout({ children }) {
  return (
    <div
      className="planity-page min-h-full bg-white text-neutral-900"
      style={{ colorScheme: 'light' }}
    >
      {children}
    </div>
  );
}
