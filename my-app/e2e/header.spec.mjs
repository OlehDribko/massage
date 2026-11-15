/*
 * Header account element: present from the first render (server HTML, no
 * empty gap while Firebase restores the session), then labelled by the
 * session type; the admin link only after the API confirms the role.
 */
import { expect, readyClient, signInOnSite, test } from './fixtures.mjs';

test('[real API] the account element is in the server HTML, then follows the session', async ({
  page,
  request,
}) => {
  // Server render: the neutral entry, before any script runs.
  const html = await (await request.get('/reserver')).text();
  expect(html).toContain('Espace personnel');
  expect(html).not.toContain('Administration');

  // A first visit: guest → « Se connecter ».
  await page.goto('/reserver');
  const banner = page.getByRole('banner');
  await expect(
    banner.getByRole('link', { name: 'Se connecter' })
  ).toBeVisible();

  // A signed-in client: « Mon compte », no admin entry.
  const user = await readyClient();
  await signInOnSite(page, user, '/reserver');
  const menu = banner.getByRole('button', { name: 'Mon compte' });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(
    banner.getByRole('link', { name: /Administration/ })
  ).toHaveCount(0);
});
