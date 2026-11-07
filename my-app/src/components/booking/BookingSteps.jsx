import Link from 'next/link';

const STEPS = ['Soin', 'Horaire', 'Coordonnées', 'Confirmation'];

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden
      className="size-3"
    >
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

/**
 * Booking progress (1 Soin → 4 Confirmation). `current` is 1-based; done
 * steps link back when `links[index]` is given. Text, not colour, says the
 * state: a hidden "(terminé)" / aria-current="step".
 */
export default function BookingSteps({ current, links = [] }) {
  return (
    <ol
      aria-label="Étapes de la réservation"
      className="font-montserrat text-body-sm flex flex-wrap gap-2 font-medium"
    >
      {STEPS.map((label, index) => {
        const step = index + 1;
        const done = step < current;
        const active = step === current;
        const href = done ? links[index] : null;
        const dot = (
          <span
            className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${
              active
                ? 'bg-primary-200 text-on-gold'
                : done
                  ? 'bg-secondary-100 text-third-900'
                  : 'border border-gray-100 text-gray-800'
            }`}
          >
            {done ? <Check /> : step}
          </span>
        );
        const text = (
          <>
            {label}
            {done ? <span className="sr-only"> (terminé)</span> : null}
          </>
        );

        return (
          <li
            key={label}
            aria-current={active ? 'step' : undefined}
            className={`rounded-pill flex items-center gap-2.5 py-2 pr-4 pl-2 ${
              active
                ? 'bg-third-900 text-cream'
                : done
                  ? 'text-gray-900'
                  : 'hidden text-gray-800 sm:flex'
            }`}
          >
            {dot}
            {href ? (
              <Link
                href={href}
                className="hover:text-third-200 underline-offset-4 hover:underline"
              >
                {text}
              </Link>
            ) : (
              <span>{text}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
