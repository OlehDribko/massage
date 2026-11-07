// Inline message box for forms and account pages (no Figma frame): white
// card, card radius, error text in --color-error.
export default function Notice({ tone = 'info', children, className = '' }) {
  const colours =
    tone === 'error'
      ? 'border-error/40 text-error'
      : 'border-black/10 text-gray-900';

  return (
    <div
      className={`rounded-card font-montserrat text-body-sm border bg-white px-4 py-3 ${colours} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
