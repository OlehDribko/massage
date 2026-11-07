// Figma UI kit «Inputs base» (797:1684): 12-caps label, 16 px value, 1 px
// underline; Error state in --color-error. The kit draws it on dark; this is
// the same field for light pages (gray-900 text, black/20 line, third-200
// when focused). `action` is an optional control inside the field (e.g. the
// password visibility toggle).
export default function TextField({
  id,
  label,
  hint,
  error,
  action,
  className = '',
  ...inputProps
}) {
  // An error replaces the hint (they often say the same thing).
  const showHint = Boolean(hint) && !error;
  const hintId = showHint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex flex-col gap-0.5 ${className}`.trim()}>
      <label
        htmlFor={id}
        className="font-montserrat text-label-sm font-medium text-gray-800 uppercase"
      >
        {label}
      </label>
      <div
        className={`focus-within:border-third-200 flex items-center gap-2 border-b transition-colors motion-reduce:transition-none ${error ? 'border-error' : 'border-black/20'}`}
      >
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`font-montserrat text-body min-w-0 flex-1 bg-transparent py-2 placeholder:text-gray-100 focus:outline-none disabled:opacity-60 ${error ? 'text-error' : 'text-gray-900'}`}
          {...inputProps}
        />
        {action}
      </div>
      {error ? (
        <p
          id={errorId}
          className="font-montserrat text-body-sm text-error pt-1"
        >
          {error}
        </p>
      ) : null}
      {showHint ? (
        <p
          id={hintId}
          className="font-montserrat text-body-sm pt-1 text-gray-800"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
