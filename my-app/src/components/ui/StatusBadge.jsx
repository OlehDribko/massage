// Small pill for statuses (no Figma frame): accent = third-200 on its light
// tint, muted = gray. Text always accompanies the colour.
const tones = {
  accent: 'bg-third-200/10 text-third-900 border-third-200/40',
  muted: 'bg-black/5 text-gray-800 border-black/10',
  error: 'bg-error/10 text-error border-error/30',
};

export default function StatusBadge({
  tone = 'muted',
  children,
  className = '',
}) {
  return (
    <span
      className={`rounded-pill font-montserrat text-label-sm inline-flex w-fit items-center border px-3 py-1 font-medium whitespace-nowrap uppercase ${tones[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
