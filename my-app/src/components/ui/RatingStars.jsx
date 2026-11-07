function StarIcon({ size }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
      style={{ width: size, height: size }}
    >
      <path d="M8 0.667 10.06 5.2l4.94.51-3.71 3.37 1.03 4.85L8 11.53l-4.32 2.4 1.03-4.85L1 5.71l4.94-.51L8 .667Z" />
    </svg>
  );
}

export default function RatingStars({ count = 5, size = 16, className = '' }) {
  return (
    <div className={`text-gold flex items-center gap-0.5 ${className}`.trim()}>
      {Array.from({ length: count }).map((_, i) => (
        <StarIcon key={i} size={size} />
      ))}
    </div>
  );
}
