/*
 * Languages (src/i18n): the switcher opens the same page in another
 * language and the choice is remembered for the next visit; the catalogue
 * texts follow the language; the administration exists in French and
 * Ukrainian.
 */
import { SPORTIF, admin, expect, signInOnSite, test } from './fixtures.mjs';

test('[real API] @mobile the switcher opens the same page in English, remembered on the next visit', async ({
  page,
}) => {
  await page.goto('/reserver?duree=60');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

  await page.getByRole('button', { name: /^Langue/ }).click();
  await page.getByRole('button', { name: 'English' }).click();

  await page.waitForURL(/\/en\/reserver\?duree=60$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Book a massage in Bordeaux'
  );
  // Catalogue texts by service id; prices stay the API's.
  await expect(
    page.getByRole('heading', { name: 'Sports massage' })
  ).toBeVisible();
  // The filter from the URL is kept.
  await expect(
    page.getByRole('button', { name: '1 h', pressed: true })
  ).toBeVisible();

  // Next visit to a French URL: the remembered language.
  await page.goto('/');
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'The massage that'
  );

  // Back to French.
  await page.getByRole('button', { name: /^Language/ }).click();
  await page.getByRole('button', { name: 'Français' }).click();
  await page.waitForURL((url) => url.pathname === '/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await page.goto(`/reserver/${SPORTIF.min55}`);
  await expect(page).toHaveURL(new RegExp(`/reserver/${SPORTIF.min55}$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Massage sportif'
  );
});
