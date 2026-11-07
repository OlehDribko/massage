import Link from 'next/link';

const tones = {
  header: 'text-on-dark hover:text-gold',
  // Header on light pages (no Figma frame): section-title colour.
  headerSolid: 'text-third-900 hover:text-third-200',
  footer: 'text-gray-100 hover:text-base-white',
};

export default function NavLink({
  href,
  children,
  tone = 'header',
  className = '',
  ...props
}) {
  const classes =
    `font-montserrat text-[16px] tracking-[0.16px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current motion-reduce:transition-none ${tones[tone]} ${className}`.trim();

  if (href.startsWith('#')) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
