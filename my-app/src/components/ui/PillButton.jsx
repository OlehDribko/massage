import Link from 'next/link';

// Figma UI kit «buttons» (546:151). Focus ring is not in the kit — added for
// keyboard users in the button's own accent colour.
const base =
  'inline-flex items-center justify-center gap-2 font-montserrat text-label font-medium uppercase transition-[color,background-color,border-color,box-shadow] duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2';

const variants = {
  // «primary» 54 px. Hover = 546:152, On click = 546:180 (pressed → :active).
  primary:
    'w-fit rounded-pill border border-transparent bg-primary-200 text-on-gold hover:border-[#f3bb78] hover:shadow-button-hover active:border-transparent active:bg-primary-100 active:shadow-button-active focus-visible:outline-primary-200',
  // «secondary». Hover = 729:2604. Colours come from outlineTones.
  outline: 'rounded-pill border',
  // «Extra» 40 px text button (673:7177).
  text: 'min-h-10 px-3 py-2',
};

// Kit sizes of primary/secondary: 54 px (ML, default) and 48 px (SM, 546:193).
const sizes = {
  primary: {
    md: 'min-h-[54px] px-btn-x py-btn-y',
    sm: 'min-h-12 px-8 py-[11px]',
  },
  outline: {
    md: 'min-h-[54px] px-btn-outline-x py-btn-y',
    sm: 'min-h-12 px-6 py-[11px]',
  },
};

// «Extra» colours: primary (673:7177 / 673:7218), secondary (673:7188 / 673:7224).
const textTones = {
  primary:
    'text-primary-200 hover:text-primary-300 focus-visible:outline-primary-200',
  light: 'text-gray-50 hover:text-gray-100 focus-visible:outline-gray-50',
};

// «secondary» exists only on dark in the kit; `dark` is the same button for
// light pages (not in Figma), with the section-title colour.
const outlineTones = {
  light:
    'border-on-dark text-on-dark hover:border-third-200 hover:text-third-200 focus-visible:outline-on-dark',
  dark: 'border-third-900 text-third-900 hover:border-third-200 hover:text-third-200 focus-visible:outline-third-900',
};

export default function PillButton({
  children,
  variant = 'primary',
  tone = 'primary',
  size = 'md',
  underline = true,
  href,
  className = '',
  ...props
}) {
  const isText = variant === 'text';
  const toneClasses = isText
    ? textTones[tone]
    : variant === 'outline'
      ? outlineTones[tone === 'dark' ? 'dark' : 'light']
      : '';
  const classes =
    `${base} ${variants[variant]} ${sizes[variant]?.[size] ?? ''} ${toneClasses} ${className}`.trim();
  // Underline sits right under the 1.5 line box, 1.2 px thick, as in Figma.
  const content =
    isText && underline ? (
      <span className="inline-block border-b-[1.2px] border-current">
        {children}
      </span>
    ) : (
      children
    );

  if (href) {
    const isExternal = /^https?:\/\//.test(href) || href.startsWith('#');

    if (isExternal) {
      return (
        <a href={href} className={classes} {...props}>
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}
