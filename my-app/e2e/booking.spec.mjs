/*
 * Key booking flows in a real browser.
 *
 * [real API]   the request reaches the local Booking API (PostgreSQL + Auth
 *              Emulator); the result is read back from the API.
 * [fault]      real API, with one browser-side failure injected by
 *              Playwright (a lost answer) to test the client's retry.
 * [mocked]     the API answer is replaced in the browser to show a UI state
 *              the local backend cannot produce on demand.
 */
import {
  SPORTIF,
  bookAs,
  bookingsOf,
  client,
  expect,
  firstFreeSlot,
  readyClient,
  signInOnSite,
  studioTime,
  test,
} from './fixtures.mjs';

const times = (page) => page.getByRole('group', { name: /^Horaires du/ });
// The booking's own alert (Next.js also has a route announcer with role=alert).
const alertOf = (page) => page.getByRole('main').getByRole('alert');

/** Waits for the picker's first week and picks `slot` in it. */
async function pickSlot(page, slot) {
  await times(page)
    .getByRole('button', { name: studioTime(slot.startsAt), exact: true })
    .click();
  await expect(
    times(page).getByRole('button', {
      name: studioTime(slot.startsAt),
      exact: true,
    })
  ).toHaveAttribute('aria-pressed', 'true');
}

const confirmButton = (page) =>
  page
    .getByRole('complementary', { name: 'Votre réservation' })
    .getByRole('button', { name: /Confirmer la réservation|Réessayer/ });

test('[real API] @mobile choose a soin and a time, book, read it in the account', async ({
  page,
  isMobile,
}) => {
  const user = await readyClient();
  await signInOnSite(page, user, '/reserver');
  await expect(page).toHaveURL(/\/reserver$/);

  // Catalogue (server-rendered from the API): « Massage sportif », 1 h 30.
  const card = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Massage sportif', exact: true }),
  });
  await card.getByText('1 h 30', { exact: true }).click();
  // Texts of that duration come from the API.
  await card.getByRole('button', { name: 'Description' }).click();
  await expect(card.getByRole('listitem').first()).toBeVisible();
  await card.getByRole('link', { name: /Choisir l’horaire/ }).click();

  // The variant id of the chosen duration is kept.
  await expect(page).toHaveURL(new RegExp(`/reserver/${SPORTIF.min90}$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Massage sportif'
  );

  const slot = await firstFreeSlot(SPORTIF.min90);
  await pickSlot(page, slot);
  if (isMobile) {
    await page.getByRole('button', { name: 'Confirmer', exact: true }).click();
  } else {
    await confirmButton(page).click();
  }

  await page.waitForURL(/\/compte\/reservations\/[0-9a-f-]+\?confirmee=1/);
  const [booking] = await bookingsOf(user);
  expect(booking.service.id).toBe(SPORTIF.min90);
  expect(booking.startsAt).toBe(slot.startsAt);

  await page.goto('/compte/reservations');
  const next = page.getByRole('region', { name: 'Prochain rendez-vous' });
  await expect(next).toContainText('Massage sportif · 1 h 30');
  await expect(next).toContainText(studioTime(slot.startsAt));
  await expect(next.getByRole('link', { name: 'Gérer' })).toHaveAttribute(
    'href',
    `/compte/reservations/${booking.id}`
  );
});

test('[real API] the time is taken after it was chosen: conflict shown, times refreshed', async ({
  page,
}) => {
  const user = await readyClient();
  const other = await readyClient();
  await signInOnSite(page, user, `/reserver/${SPORTIF.min55}`);

  const slot = await firstFreeSlot(SPORTIF.min55);
  await pickSlot(page, slot);
  await expect(confirmButton(page)).toBeEnabled();

  // Someone else books that very start in the meantime.
  const taken = await bookAs(other, SPORTIF.min55, slot.startsAt);
  expect(taken.status).toBe(201);

  const refreshed = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/services/${SPORTIF.min55}/availability`) &&
      response.request().method() === 'GET'
  );
  await confirmButton(page).click();

  await expect(alertOf(page)).toContainText(
    'Ce créneau vient d’être réservé. Choisissez un autre horaire.'
  );
  await refreshed;
  await expect(
    times(page).getByRole('button', {
      name: studioTime(slot.startsAt),
      exact: true,
    })
  ).toHaveCount(0);
  // Nothing was booked for this visitor, and no success page was shown.
  expect(await bookingsOf(user)).toHaveLength(0);
  await expect(page).toHaveURL(new RegExp(`/reserver/${SPORTIF.min55}$`));
});

test('[fault] a lost answer is retried with the same Idempotency-Key: one booking', async ({
  page,
}) => {
  const user = await readyClient();
  await signInOnSite(page, user, `/reserver/${SPORTIF.min120}`);
  const slot = await firstFreeSlot(SPORTIF.min120);
  await pickSlot(page, slot);

  const attempts = [];
  await page.route('**/api/bookings', async (route) => {
    const request = route.request();
    if (request.method() !== 'POST') return route.continue();
    attempts.push({
      key: request.headers()['idempotency-key'],
      body: request.postData(),
    });
    if (attempts.length === 1) {
      // The server creates the booking, the browser never gets the answer.
      const answer = await route.fetch();
      expect(answer.status()).toBe(201);
      return route.abort('internetdisconnected');
    }
    return route.continue();
  });

  await confirmButton(page).click();
  await expect(alertOf(page)).toContainText('Impossible de joindre le service');
  await expect(confirmButton(page)).toHaveText('Réessayer');

  const replay = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/bookings') &&
      response.request().method() === 'POST'
  );
  await confirmButton(page).click();
  const answer = await replay;
  expect(answer.status()).toBe(200);
  expect(answer.headers()['idempotent-replayed']).toBe('true');
  await page.waitForURL(/\/compte\/reservations\/[0-9a-f-]+\?confirmee=1/);

  expect(attempts).toHaveLength(2);
  expect(attempts[1].key).toBe(attempts[0].key);
  expect(attempts[1].body).toBe(attempts[0].body);
  expect(attempts[0].key).toMatch(/^[A-Za-z0-9_-]{8,128}$/);
  expect(await bookingsOf(user)).toHaveLength(1);
});

test('[real API] a guest signs in on the booking page, keeps the time, then books', async ({
  page,
}) => {
  const user = await readyClient();
  await page.goto(`/reserver/${SPORTIF.min55}`);
  const slot = await firstFreeSlot(SPORTIF.min55);
  await pickSlot(page, slot);

  await page
    .getByRole('complementary', { name: 'Votre réservation' })
    .getByRole('button', { name: 'Continuer' })
    .click();
  // The next step is named and offered in place; no booking button yet.
  const main = page.getByRole('main');
  const account = main.getByRole('region', { name: 'Se connecter' });
  await expect(account).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Confirmer la réservation' })
  ).toHaveCount(0);

  await account.getByLabel('Adresse e-mail').fill(user.email);
  await account.getByLabel('Mot de passe', { exact: true }).fill(user.password);
  await account
    .getByRole('button', { name: 'Se connecter', exact: true })
    .click();

  // Same page, same time, now ready.
  await expect(
    main.getByRole('heading', { name: /Tout est prêt/ })
  ).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/reserver/${SPORTIF.min55}`));
  await expect(
    page.getByRole('complementary', { name: 'Votre réservation' })
  ).toContainText(studioTime(slot.startsAt));
  // The main panel's button (the summary aside has the same one).
  await main
    .getByRole('button', { name: 'Confirmer la réservation' })
    .first()
    .click();
  await page.waitForURL(/\/compte\/reservations\/[0-9a-f-]+\?confirmee=1/);
  expect((await bookingsOf(user)).map((item) => item.startsAt)).toEqual([
    slot.startsAt,
  ]);
});

test('[real API] a profile without phone completes it inline, keeps the time, then books', async ({
  page,
}) => {
  const user = await client({ phone: null });
  await signInOnSite(page, user, `/reserver/${SPORTIF.min55}`);
  const slot = await firstFreeSlot(SPORTIF.min55);
  await pickSlot(page, slot);
  await page
    .getByRole('complementary', { name: 'Votre réservation' })
    .getByRole('button', { name: 'Continuer' })
    .click();

  // Only the missing step is asked, on the booking page itself.
  const main = page.getByRole('main');
  await expect(
    main.getByRole('heading', { name: 'Vos coordonnées' })
  ).toBeVisible();
  await expect(main.getByRole('heading', { name: /^Compte/ })).toContainText(
    'terminé'
  );
  await expect(
    page.getByRole('button', { name: 'Confirmer la réservation' })
  ).toHaveCount(0);
  expect(await bookingsOf(user)).toHaveLength(0);

  await main
    .getByRole('textbox', { name: 'Téléphone' })
    .fill('+33 6 12 34 56 78');
  await main.getByRole('button', { name: 'Enregistrer et continuer' }).click();
  await expect(
    main.getByRole('heading', { name: /Tout est prêt/ })
  ).toBeVisible();
  await expect(
    page.getByRole('complementary', { name: 'Votre réservation' })
  ).toContainText(studioTime(slot.startsAt));
  // The main panel's button (the summary aside has the same one).
  await main
    .getByRole('button', { name: 'Confirmer la réservation' })
    .first()
    .click();
  await page.waitForURL(/\/compte\/reservations\/[0-9a-f-]+\?confirmee=1/);
  expect(await bookingsOf(user)).toHaveLength(1);
});

test('[mocked] an expired session: clear message, sign-in link, no false success', async ({
  page,
}) => {
  const user = await readyClient();
  await signInOnSite(page, user, `/reserver/${SPORTIF.min55}`);
  const slot = await firstFreeSlot(SPORTIF.min55);
  await pickSlot(page, slot);

  // Both the first try and the one after the forced token refresh.
  let calls = 0;
  await page.route('**/api/bookings', (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    calls += 1;
    return route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Token expired', code: 'TOKEN_EXPIRED' }),
    });
  });

  await confirmButton(page).click();
  const alert = alertOf(page);
  await expect(alert).toContainText('Votre session a expiré');
  const again = alert.getByRole('link', { name: 'Se reconnecter' });
  // The sign-in page brings the visitor back to this time.
  const href = new URL(await again.getAttribute('href'), 'http://site');
  const back = new URL(href.searchParams.get('retour'), 'http://site');
  expect(back.pathname).toBe(`/reserver/${SPORTIF.min55}`);
  expect(back.searchParams.get('creneau')).toBe(slot.startsAt);
  expect(calls).toBe(2);
  await expect(page).toHaveURL(new RegExp(`/reserver/${SPORTIF.min55}$`));
  expect(await bookingsOf(user)).toHaveLength(0);
});
