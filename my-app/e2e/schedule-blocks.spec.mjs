/*
 * Manual busy times («indisponibilités») of the admin calendar, against the
 * local Booking API (PostgreSQL with the backend's migrations, including
 * 20261116120000_schedule_blocks). [real API]: every request reaches the
 * local API; results are read back from it (admin list, public
 * availability, a client's booking attempt). Nothing reaches staging.
 */
import { randomUUID } from 'node:crypto';

import {
  SPORTIF,
  admin,
  api,
  bookAs,
  expect,
  firstFreeSlot,
  readyClient,
  signInOnSite,
  slotsOn,
  studioTime,
  test,
} from './fixtures.mjs';
import { E2E } from './env.mjs';

const SERVICE = SPORTIF.min55;
const BREAK_MS = 15 * 60_000;

/** "09:15" + 60 → "10:15" (same date). */
const plus = (time, minutes) => {
  const [hours, mins] = time.split(':').map(Number);
  const total = hours * 60 + mins + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const nextDate = (date) => {
  const day = new Date(`${date}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() + 1);
  return day.toISOString().slice(0, 10);
};

const frenchDate = (date) =>
  new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));

/** The admin's blocks of one date, from the API. */
async function blocksOn(user, date) {
  const { status, body } = await api(
    user.token,
    `/api/admin/schedule/blocks?from=${date}&to=${date}`
  );
  expect(status).toBe(200);
  return body.blocks;
}

/** No free start overlaps the block or its 15-minute breaks. */
function expectNoSlotIn(slots, block) {
  const from = Date.parse(block.startsAt) - BREAK_MS;
  const to = Date.parse(block.endsAt) + BREAK_MS;
  const inside = slots.filter(
    (slot) => Date.parse(slot.startsAt) < to && from < Date.parse(slot.endsAt)
  );
  expect(inside).toEqual([]);
}

/** Fills the open block form (start / end / title) with the keyboard. */
async function fillBlock(dialog, { start, end, title }) {
  await dialog.getByLabel('Début (HH:MM)').fill(start);
  await dialog.getByLabel('Fin (HH:MM, 24:00 pour minuit)').fill(end);
  await dialog.getByLabel(/^Titre/).fill(title);
}

test('[real API] @mobile admin adds a busy time: the client loses those times, booking it is refused', async ({
  page,
}) => {
  const owner = await admin();
  const visitor = await readyClient();
  const slot = await firstFreeSlot(SERVICE);
  const start = studioTime(slot.startsAt);
  const title = `Planity ${randomUUID().slice(0, 8)}`;

  await signInOnSite(page, owner, `/admin/calendrier/jour?date=${slot.date}`);
  const add = page.getByRole('button', { name: 'Ajouter une indisponibilité' });
  await add.click();
  const dialog = page.getByRole('dialog', {
    name: 'Ajouter une indisponibilité',
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: /^Date/ })).toContainText(
    frenchDate(slot.date)
  );
  await fillBlock(dialog, { start, end: plus(start, 60), title });
  // Keyboard: Enter in the title submits the form.
  await dialog.getByLabel(/^Titre/).press('Enter');

  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole('status').filter({ hasText: 'ajoutée' })
  ).toBeVisible();
  await expect(add).toBeFocused();
  const timeline = page.getByRole('region', { name: 'Planning du jour' });
  await expect(
    timeline.getByRole('button', { name: new RegExp(title) })
  ).toContainText(`${start}–${plus(start, 60)}`);

  const [block] = (await blocksOn(owner, slot.date)).filter(
    (item) => item.title === title
  );
  expect(block.start).toBe(`${slot.date}T${start}`);

  // The client's availability no longer offers that time (nor its breaks).
  const slots = await slotsOn(SERVICE, slot.date);
  expect(slots.map((item) => item.startsAt)).not.toContain(slot.startsAt);
  expectNoSlotIn(slots, block);

  // Booking it anyway → SLOT_UNAVAILABLE (taken).
  const refused = await bookAs(visitor, SERVICE, slot.startsAt);
  expect(refused.status).toBe(409);
  expect(refused.body).toMatchObject({
    code: 'SLOT_UNAVAILABLE',
    reason: 'taken',
  });
});

test('[real API] a busy time over a confirmed booking shows the conflict with a link', async ({
  page,
}) => {
  const owner = await admin();
  const visitor = await readyClient();
  const slot = await firstFreeSlot(SERVICE);
  const booked = await bookAs(visitor, SERVICE, slot.startsAt);
  expect(booked.status).toBe(201);
  const bookingId = booked.body.booking.id;
  const start = studioTime(slot.startsAt);
  const title = `Formation ${randomUUID().slice(0, 8)}`;

  await signInOnSite(page, owner, `/admin/calendrier/jour?date=${slot.date}`);
  await page
    .getByRole('button', { name: 'Ajouter une indisponibilité' })
    .click();
  const dialog = page.getByRole('dialog', {
    name: 'Ajouter une indisponibilité',
  });
  await fillBlock(dialog, { start, end: plus(start, 30), title });
  await dialog.getByRole('button', { name: 'Ajouter' }).click();

  const alert = dialog.getByRole('alert');
  await expect(alert).toContainText('Des rendez-vous confirmés');
  await expect(alert.getByRole('link')).toHaveAttribute(
    'href',
    `/admin/reservations/${bookingId}?date=${slot.date}`
  );
  await expect(dialog).toBeVisible(); // the form stays to change the times
  expect(
    (await blocksOn(owner, slot.date)).filter((item) => item.title === title)
  ).toEqual([]);

  // Escape closes the form; the focus is back on the button that opened it.
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole('button', { name: 'Ajouter une indisponibilité' })
  ).toBeFocused();
});

test('[real API] changing, moving and deleting a busy time refresh the calendar and availability', async ({
  page,
}) => {
  const owner = await admin();
  // A date nobody else books in these tests: the last one with free starts.
  const { days } = await (
    await fetch(`${E2E.apiUrl}/api/services/${SERVICE}/availability`)
  ).json();
  const day = days.filter((item) => item.slots.length).at(-1);
  const date = day.date;
  const following = nextDate(date);
  const before = await slotsOn(SERVICE, date);
  const beforeFollowing = await slotsOn(SERVICE, following);
  const slot = before[0];
  const start = studioTime(slot.startsAt);
  const title = `Perso ${randomUUID().slice(0, 8)}`;

  const created = await api(owner.token, '/api/admin/schedule/blocks', {
    method: 'POST',
    headers: { 'Idempotency-Key': randomUUID() },
    body: {
      title,
      start: `${date}T${start}`,
      end: `${date}T${plus(start, 60)}`,
    },
  });
  expect(created.status).toBe(201);
  expect((await slotsOn(SERVICE, date)).map((s) => s.startsAt)).not.toContain(
    slot.startsAt
  );

  // Week view: the block, with its time, opens its form.
  await signInOnSite(page, owner, `/admin/calendrier?date=${date}`);
  const card = page.getByRole('button', { name: new RegExp(title) });
  await expect(card).toContainText(`${start}–${plus(start, 60)}`);
  await card.click();
  let dialog = page.getByRole('dialog', { name: 'Indisponibilité' });
  await expect(dialog.getByLabel('Début (HH:MM)')).toHaveValue(start);

  // 1. Later the same day: the first start is free again, the new time is not.
  const later = plus(start, 120);
  await dialog.getByLabel('Début (HH:MM)').fill(later);
  await dialog
    .getByLabel('Fin (HH:MM, 24:00 pour minuit)')
    .fill(plus(later, 60));
  await dialog.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(dialog).toBeHidden();
  await expect(card).toContainText(`${later}–${plus(later, 60)}`);
  const [moved] = await blocksOn(owner, date);
  const afterChange = await slotsOn(SERVICE, date);
  expect(afterChange.map((s) => s.startsAt)).toContain(slot.startsAt);
  expectNoSlotIn(afterChange, moved);

  // 2. To the next date: it leaves this date and appears on the other one.
  await card.click();
  dialog = page.getByRole('dialog', { name: 'Indisponibilité' });
  await dialog.getByRole('button', { name: /^Date/ }).click();
  if (following.slice(0, 7) !== date.slice(0, 7)) {
    await dialog.getByRole('button', { name: 'Mois suivant' }).click();
  }
  await dialog
    .getByRole('button', { name: frenchDate(following), exact: true })
    .click();
  await dialog.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(dialog).toBeHidden();
  const dateColumn = page.getByRole('listitem').filter({
    has: page.getByRole('link', {
      name: new RegExp(`${frenchDate(date)}.*voir la journée`),
    }),
  });
  await expect(
    dateColumn.getByRole('button', { name: new RegExp(title) })
  ).toHaveCount(0);
  expect(await blocksOn(owner, date)).toEqual([]);
  expect(await slotsOn(SERVICE, date)).toEqual(before);

  await page.goto(`/admin/calendrier/jour?date=${following}`);
  const onFollowing = page
    .getByRole('region', { name: 'Planning du jour' })
    .getByRole('button', { name: new RegExp(title) });
  await expect(onFollowing).toContainText(`${later}–${plus(later, 60)}`);

  // 3. Delete, with a confirmation: gone from the agenda and the API.
  await onFollowing.click();
  dialog = page.getByRole('dialog', { name: 'Indisponibilité' });
  await dialog.getByRole('button', { name: 'Supprimer' }).click();
  const confirm = page.getByRole('dialog', {
    name: 'Supprimer cette indisponibilité ?',
  });
  await confirm.getByRole('button', { name: 'Supprimer' }).click();
  await expect(confirm).toBeHidden();
  await expect(onFollowing).toHaveCount(0);
  await expect(
    page.getByRole('status').filter({ hasText: 'supprimée' })
  ).toBeVisible();
  expect(await blocksOn(owner, following)).toEqual([]);
  expect(await slotsOn(SERVICE, following)).toEqual(beforeFollowing);
});

test.describe('browser in another time zone', () => {
  test.use({ timezoneId: 'America/Los_Angeles' });

  test('[real API] a block until 24:00 reopens as 24:00 and keeps its bounds when saved', async ({
    page,
  }) => {
    const owner = await admin();
    const { days } = await (
      await fetch(`${E2E.apiUrl}/api/services/${SERVICE}/availability`)
    ).json();
    const date = days.filter((item) => item.slots.length).at(-2).date;
    const title = `Soirée ${randomUUID().slice(0, 8)}`;
    const created = await api(owner.token, '/api/admin/schedule/blocks', {
      method: 'POST',
      headers: { 'Idempotency-Key': randomUUID() },
      body: { title, start: `${date}T21:00`, end: `${date}T24:00` },
    });
    expect(created.status).toBe(201);
    // The API answers the end of the day as the next date at 00:00.
    expect(created.body.block.end).toBe(`${nextDate(date)}T00:00`);
    // v1: one date — any end after that midnight is refused on `end`.
    const later = await api(owner.token, '/api/admin/schedule/blocks', {
      method: 'POST',
      headers: { 'Idempotency-Key': randomUUID() },
      body: { title, start: `${date}T22:00`, end: `${nextDate(date)}T01:00` },
    });
    expect(later.status).toBe(400);
    expect(later.body.code).toBe('VALIDATION_FAILED');
    expect(later.body.errors.map((item) => item.field[0])).toContain('end');

    await signInOnSite(page, owner, `/admin/calendrier/jour?date=${date}`);
    const card = page
      .getByRole('region', { name: 'Planning du jour' })
      .getByRole('button', { name: new RegExp(title) });
    await expect(card).toContainText('21:00–24:00');
    await card.click();
    const dialog = page.getByRole('dialog', { name: 'Indisponibilité' });
    await expect(dialog.getByLabel('Début (HH:MM)')).toHaveValue('21:00');
    await expect(
      dialog.getByLabel('Fin (HH:MM, 24:00 pour minuit)')
    ).toHaveValue('24:00');
    // v1: one day — no option to end after this midnight.
    await expect(dialog.getByText('Se termine le lendemain')).toHaveCount(0);

    const patched = page.waitForRequest(
      (request) =>
        request.method() === 'PATCH' &&
        request.url().includes('/api/admin/schedule/blocks/')
    );
    await dialog.getByLabel(/^Titre/).fill(`${title} (bis)`);
    await dialog.getByRole('button', { name: 'Enregistrer' }).click();
    expect((await patched).postDataJSON()).toEqual({ title: `${title} (bis)` });
    await expect(dialog).toBeHidden();

    const [saved] = (await blocksOn(owner, date)).filter((item) =>
      item.title.startsWith(title)
    );
    expect(saved).toMatchObject({
      start: `${date}T21:00`,
      end: `${nextDate(date)}T00:00`,
      startsAt: created.body.block.startsAt,
      endsAt: created.body.block.endsAt,
    });
  });
});

/** Paris "YYYY-MM-DD" and "HH:MM" of an instant. */
const paris = (instant) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'Europe/Paris',
    })
      .formatToParts(instant)
      .map(({ type, value }) => [type, value])
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
};

/** Today's block around now: started (when possible), not over. */
function ongoingBounds() {
  const now = paris(new Date());
  const [h, m] = now.time.split(':').map(Number);
  const minute = h * 60 + m - ((h * 60 + m) % 5);
  const start = Math.max(0, minute - 30);
  const end = Math.min(24 * 60, minute + 60);
  const time = (total) =>
    `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  return { date: now.date, start: time(start), end: time(end) };
}

test('[real API] a block that has started but is not over can be edited', async ({
  page,
}) => {
  const owner = await admin();
  const bounds = ongoingBounds();
  const title = `En cours ${randomUUID().slice(0, 8)}`;
  const created = await api(owner.token, '/api/admin/schedule/blocks', {
    method: 'POST',
    headers: { 'Idempotency-Key': randomUUID() },
    body: {
      title,
      start: `${bounds.date}T${bounds.start}`,
      end: `${bounds.date}T${bounds.end}`,
    },
  });
  expect(created.status).toBe(201);

  await signInOnSite(page, owner, `/admin/calendrier/jour?date=${bounds.date}`);
  await page
    .getByRole('region', { name: 'Planning du jour' })
    .getByRole('button', { name: new RegExp(title) })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Indisponibilité' });
  await expect(dialog.getByLabel('Début (HH:MM)')).toBeEditable();
  await dialog.getByLabel(/^Titre/).fill(`${title} (modifié)`);
  await dialog.getByLabel('Note (facultatif').fill('Prolongé');
  await dialog.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(dialog).toBeHidden();

  const [saved] = (await blocksOn(owner, bounds.date)).filter((item) =>
    item.title.startsWith(title)
  );
  expect(saved).toMatchObject({
    title: `${title} (modifié)`,
    note: 'Prolongé',
    startsAt: created.body.block.startsAt,
    endsAt: created.body.block.endsAt,
  });
});

test('[real API] a block that is over can be read and deleted, not edited', async ({
  page,
}) => {
  const owner = await admin();
  const bounds = ongoingBounds();
  const title = `Terminé ${randomUUID().slice(0, 8)}`;
  const created = await api(owner.token, '/api/admin/schedule/blocks', {
    method: 'POST',
    headers: { 'Idempotency-Key': randomUUID() },
    body: {
      title,
      note: 'Rendez-vous Planity',
      start: `${bounds.date}T${bounds.start}`,
      end: `${bounds.date}T${bounds.end}`,
    },
  });
  expect(created.status).toBe(201);

  await signInOnSite(page, owner, `/admin/calendrier/jour?date=${bounds.date}`);
  const card = page
    .getByRole('region', { name: 'Planning du jour' })
    .getByRole('button', { name: new RegExp(title) });
  await expect(card).toBeVisible();
  // The API refuses to create a block that is already over: move the
  // browser's clock past its end instead (the server keeps real time).
  await page.clock.setFixedTime(
    new Date(Date.parse(created.body.block.endsAt) + 60_000)
  );
  await card.click();
  const dialog = page.getByRole('dialog', { name: title });
  await expect(dialog).toContainText('Indisponibilité terminée');
  await expect(dialog).toContainText('Rendez-vous Planity');
  await expect(dialog).toContainText(`${bounds.start}–${bounds.end}`);
  await expect(dialog.getByRole('textbox')).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Enregistrer' })).toHaveCount(
    0
  );

  await dialog.getByRole('button', { name: 'Supprimer' }).click();
  const confirm = page.getByRole('dialog', {
    name: 'Supprimer cette indisponibilité ?',
  });
  await confirm.getByRole('button', { name: 'Supprimer' }).click();
  await expect(confirm).toBeHidden();
  await expect(card).toHaveCount(0);
  expect(
    (await blocksOn(owner, bounds.date)).filter((item) => item.title === title)
  ).toEqual([]);
});

test('[mocked] the block ends while its form is open: the server error is on the end field', async ({
  page,
}) => {
  const owner = await admin();
  const { days } = await (
    await fetch(`${E2E.apiUrl}/api/services/${SERVICE}/availability`)
  ).json();
  const date = days.filter((item) => item.slots.length).at(-3).date;
  const title = `Bientôt fini ${randomUUID().slice(0, 8)}`;
  const created = await api(owner.token, '/api/admin/schedule/blocks', {
    method: 'POST',
    headers: { 'Idempotency-Key': randomUUID() },
    body: { title, start: `${date}T12:00`, end: `${date}T12:30` },
  });
  expect(created.status).toBe(201);
  // The documented answer of c2610b6 when the end is no longer in the
  // future at the time of the PATCH (re-checked even for a new title).
  await page.route('**/api/admin/schedule/blocks/*', (route) =>
    route.request().method() === 'PATCH'
      ? route.fulfill({
          status: 400,
          contentType: 'application/json',
          headers: {
            'X-Request-Id': 'req-e2e-past',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Expose-Headers': 'X-Request-Id',
          },
          body: JSON.stringify({
            code: 'VALIDATION_FAILED',
            message: 'Invalid request',
            errors: [{ field: ['end'], message: 'must be in the future' }],
          }),
        })
      : route.continue()
  );

  await signInOnSite(page, owner, `/admin/calendrier/jour?date=${date}`);
  await page
    .getByRole('region', { name: 'Planning du jour' })
    .getByRole('button', { name: new RegExp(title) })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Indisponibilité' });
  await dialog.getByLabel(/^Titre/).fill(`${title} !`);
  await dialog.getByRole('button', { name: 'Enregistrer' }).click();

  const end = dialog.getByLabel('Fin (HH:MM, 24:00 pour minuit)');
  await expect(end).toBeFocused();
  await expect(end).toHaveAttribute('aria-invalid', 'true');
  const describedBy = (await end.getAttribute('aria-describedby')).split(' ');
  await expect(dialog.locator(`[id="${describedBy[0]}"]`)).toContainText(
    'déjà passée'
  );
  await expect(dialog.getByLabel('Début (HH:MM)')).not.toHaveAttribute(
    'aria-invalid',
    'true'
  );
  // A documented refusal: no «Réessayer», no reference to report.
  await expect(dialog.getByRole('button', { name: 'Réessayer' })).toHaveCount(
    0
  );
  await expect(dialog).not.toContainText('Référence');
});
