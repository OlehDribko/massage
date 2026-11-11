'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { signupOptInMessage } from '@/lib/marketing';

/**
 * Result of the sign-up newsletter checkbox (`marketingOptIn` of that one
 * sync). The visitor is redirected right after signing up, so it is shown
 * on whatever page comes next, once, until dismissed. Nothing is shown for
 * outcomes that promise nothing (no_action, unavailable).
 */
export default function OptInNotice() {
  const { controller, state } = useAuth();
  const message = signupOptInMessage(state.optIn);
  if (!controller || !message) return null;

  return (
    <div
      role="status"
      className="px-page pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center"
    >
      <div
        className={`rounded-card font-montserrat text-body-sm pointer-events-auto flex w-full max-w-xl items-start gap-4 border bg-white px-5 py-4 shadow-lg ${
          message.tone === 'error'
            ? 'border-error/40 text-error'
            : 'border-black/10 text-gray-900'
        }`}
      >
        <p className="flex-1">{message.text}</p>
        <button
          type="button"
          onClick={() => controller.clearOptIn()}
          className="hover:text-third-200 focus-visible:outline-third-200 -m-2 shrink-0 p-2 text-gray-800 focus-visible:outline-2"
          aria-label="Fermer le message"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
            className="size-5"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
