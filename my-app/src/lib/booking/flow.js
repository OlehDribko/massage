/*
 * Decisions of the booking panel (steps 2–3, BookingPanel.jsx), kept out of
 * React so they are tested with `node --test`:
 * - `bookingAccount` — what the account allows right now;
 * - `createBookingIntent` — one Idempotency-Key per booking intent;
 * - `afterBookingError` — what a failed POST /api/bookings changes.
 * Pure, relative imports only.
 */

import { isRetryable } from './labels.js';

/**
 * Account state for booking, from the server profile only:
 * - 'off'         sign-in not configured on this build;
 * - 'unavailable' Firebase session failed;
 * - 'error'       a permanent account whose profile did not load;
 * - 'loading'     session or profile not known yet;
 * - 'missing'     steps to do (`blockers`, or a guest without profile yet);
 * - 'ready'       nothing missing: the booking can be sent.
 * A guest's profile may be missing: the documented first step
 * ('anonymous_session') is enough to show the sign-in step.
 */
export function bookingAccount({ enabled, status, blockers, profileStatus }) {
  if (!enabled) return 'off';
  if (status === 'unavailable') return 'unavailable';
  if (blockers === null && status !== 'guest') {
    if (profileStatus === 'error') return 'error';
    return 'loading';
  }
  if (status === 'loading') return 'loading';
  if (blockers === null || blockers.length) return 'missing';
  return 'ready';
}

/** Steps to show: the profile's blockers, or the guest's first step. */
export const missingSteps = (blockers) => blockers ?? ['anonymous_session'];

/**
 * Idempotency-Key holder (Massage-backend docs/frontend-handoff.md, §3):
 * - the same service + time keeps its key until the intent ends, so a retry
 *   after an unknown outcome replays instead of booking twice;
 * - another time or service is a new intent with a new key;
 * - `end()` after a definite answer (success, refusal): the next try of
 *   the same time is a new intent.
 */
export function createBookingIntent(newKey = () => crypto.randomUUID()) {
  let current = null; // { serviceId, startsAt, key }
  return {
    keyFor(serviceId, startsAt) {
      if (current?.serviceId !== serviceId || current?.startsAt !== startsAt) {
        current = { serviceId, startsAt, key: newKey() };
      }
      return current.key;
    },
    end() {
      current = null;
    },
    get current() {
      return current;
    },
  };
}

/**
 * A failed booking → what the panel does next:
 * - `keepIntent`: unknown outcome (network, timeout, 5xx, CALENDAR_BUSY,
 *   unreadable 2xx) → the same key and body on the next try;
 * - `backToTimes`: the time is gone (SLOT_UNAVAILABLE) → clear the choice,
 *   go back to the times and reload them, the message stays;
 * - `resyncProfile`: the server says the profile is not ready → reload it.
 */
export function afterBookingError(error) {
  return {
    keepIntent: isRetryable(error),
    backToTimes: error?.code === 'SLOT_UNAVAILABLE',
    resyncProfile: error?.code === 'BOOKING_NOT_READY',
  };
}
