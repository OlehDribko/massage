const variants = {
  primary: 'w-fit bg-gold px-btn-x text-on-gold',
  outline:
    'inline-flex items-center border border-on-dark px-btn-outline-x font-semibold',
};

export default function PillButton({
  children,
  variant = 'primary',
  href,
  className = '',
  ...props
}) {
  const classes = `rounded-pill py-btn-y ${variants[variant]} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
