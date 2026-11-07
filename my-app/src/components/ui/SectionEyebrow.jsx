// Figma: label + line before section titles (mobile 704:1523, desktop 520:307).
// Mobile: 12-caps, line 60 px (shrinks when the label is long);
// tablet/desktop: 14 px caps, line 120 px.
export default function SectionEyebrow({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-6 ${className}`.trim()}>
      <p className="font-montserrat text-label-sm text-third-200 font-medium whitespace-nowrap uppercase sm:text-[0.875rem] sm:leading-normal">
        {children}
      </p>
      <span
        aria-hidden
        className="bg-third-200 h-px w-[60px] min-w-0 sm:w-[120px]"
      />
    </div>
  );
}
