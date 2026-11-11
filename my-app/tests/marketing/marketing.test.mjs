import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  marketingAvailability,
  marketingErrorMessage,
  newsletterRoute,
  ownSubscriptionResult,
  signupOptInMessage,
  subscriptionState,
} from '../../src/lib/marketing.js';

const verified = {
  profile: {
    authState: 'registered',
    email: 'Lea@Example.com',
    emailVerified: true,
  },
};

test('availability: only a loaded profile says on or off', () => {
  assert.equal(
    marketingAvailability({ status: 'loading', data: null }),
    'unknown'
  );
  assert.equal(
    marketingAvailability({ status: 'error', data: null }),
    'unknown'
  );
  assert.equal(
    marketingAvailability({ status: 'idle', data: null }),
    'unknown'
  );
  assert.equal(
    marketingAvailability({
      status: 'ready',
      data: { marketingAvailable: false },
    }),
    'off'
  );
  assert.equal(
    marketingAvailability({
      status: 'ready',
      data: { marketingAvailable: true },
    }),
    'on'
  );
});

test('home form route: account route only for the verified owner’s own address', () => {
  assert.equal(newsletterRoute(verified, ' lea@example.com '), 'account');
  assert.equal(newsletterRoute(verified, 'other@example.com'), 'public');
  assert.equal(newsletterRoute(null, 'lea@example.com'), 'public');
  assert.equal(
    newsletterRoute(
      { profile: { ...verified.profile, emailVerified: false } },
      'lea@example.com'
    ),
    'public'
  );
  assert.equal(
    newsletterRoute(
      { profile: { ...verified.profile, authState: 'anonymous' } },
      'lea@example.com'
    ),
    'public'
  );
});

test('three subscription states, unknown before the email is verified', () => {
  assert.equal(subscriptionState(null), null);
  assert.equal(
    subscriptionState({ subscribed: false, pendingConfirmation: false }),
    'none'
  );
  assert.equal(
    subscriptionState({ subscribed: false, pendingConfirmation: true }),
    'pending'
  );
  assert.equal(
    subscriptionState({ subscribed: true, pendingConfirmation: false }),
    'subscribed'
  );
});

test('direct subscription stays a success when the welcome email is not sent', () => {
  for (const welcomeEmail of ['sent', 'not_sent', 'unknown']) {
    const shown = ownSubscriptionResult({
      outcome: 'subscribed',
      welcomeEmail,
    });
    assert.equal(shown.active, true);
    assert.equal(shown.tone, 'success');
    assert.match(shown.text, /inscrit·e/);
    assert.doesNotMatch(shown.text, /pas pu|échec/i);
  }
  assert.doesNotMatch(
    ownSubscriptionResult({ outcome: 'subscribed', welcomeEmail: 'not_sent' })
      .text,
    /envoyé/
  );
  assert.equal(
    ownSubscriptionResult({ outcome: 'already_subscribed' }).active,
    true
  );
});

test('double opt-in answers never claim an active subscription', () => {
  const sent = ownSubscriptionResult({ outcome: 'confirmation_sent' });
  assert.equal(sent.active, false);
  assert.match(sent.text, /lien de confirmation/);
  const wait = ownSubscriptionResult({
    outcome: 'no_action',
    retryAfterSeconds: 412,
  });
  assert.equal(wait.retryAfterSeconds, 412);
  assert.match(wait.text, /dans 7 minutes/);
  const none = ownSubscriptionResult({ outcome: 'no_action' });
  assert.equal(none.active, false);
  assert.doesNotMatch(none.text, /envoyé/);
});

test('sign-up opt-in outcomes', () => {
  assert.equal(signupOptInMessage({ outcome: 'subscribed' }).tone, 'success');
  assert.equal(
    signupOptInMessage({ outcome: 'confirmation_sent' }).tone,
    'info'
  );
  assert.equal(signupOptInMessage({ outcome: 'no_action' }), null);
  assert.equal(signupOptInMessage({ outcome: 'unavailable' }), null);
  assert.equal(
    signupOptInMessage({ outcome: 'test_recipient_not_allowed' }).tone,
    'error'
  );
  assert.equal(signupOptInMessage(null), null);
});

test('error messages', () => {
  assert.match(
    marketingErrorMessage({ status: 404, code: 'NOT_FOUND' }),
    /pas encore ouverte/
  );
  assert.match(
    marketingErrorMessage({ status: 403, code: 'TEST_RECIPIENT_NOT_ALLOWED' }),
    /environnement de test/
  );
  assert.match(
    marketingErrorMessage({
      status: 503,
      code: 'CONFIRMATION_EMAIL_NOT_SENT',
      retryAfterSeconds: 60,
    }),
    /dans 1 minute\./
  );
  assert.match(
    marketingErrorMessage({
      status: 429,
      code: 'HTTP_429',
      retryAfterSeconds: 30,
    }),
    /dans 30 secondes/
  );
});
