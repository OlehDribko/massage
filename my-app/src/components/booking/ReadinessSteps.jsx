import PillButton from '@/components/ui/PillButton';
import { readinessSteps } from '@/lib/booking/labels';

/**
 * What is missing before booking, from the server's
 * `bookingReadiness.blockers` (never a local rule). Each step links to the
 * page that fixes it and comes back to `returnTo`.
 */
export default function ReadinessSteps({ blockers, returnTo }) {
  const steps = readinessSteps(blockers, { returnTo });
  if (!steps.length) return null;
  // One button per destination: name and phone are fixed on the same form.
  const actions = [
    ...new Map(steps.filter((s) => s.href).map((s) => [s.href, s])).values(),
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="font-montserrat text-body font-medium text-gray-900">
        Avant de réserver :
      </p>
      <ul className="font-montserrat text-body flex list-disc flex-col gap-1 pl-5 text-gray-800">
        {steps.map((step) => (
          <li key={step.blocker}>{step.text}</li>
        ))}
      </ul>
      {actions.length ? (
        <div className="flex flex-col gap-3">
          {actions.map((step, index) => (
            <PillButton
              key={step.href}
              href={step.href}
              variant={index === 0 ? 'primary' : 'outline'}
              tone="dark"
              className="w-full"
            >
              {step.action}
            </PillButton>
          ))}
        </div>
      ) : null}
    </div>
  );
}
