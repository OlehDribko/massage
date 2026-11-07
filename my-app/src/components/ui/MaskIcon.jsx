// Single-colour Figma SVG drawn as a CSS mask, so it takes `currentColor`:
// the same file serves the dark hero and the light pages. Size it with
// width/height classes; with `label` it is announced as an image.
export default function MaskIcon({ src, label, className = '' }) {
  const a11y = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true };
  const mask = `url(${src}) center / contain no-repeat`;

  return (
    <span
      {...a11y}
      className={`inline-block shrink-0 bg-current ${className}`.trim()}
      style={{ mask, WebkitMask: mask }}
    />
  );
}
