import { test, expect } from '@playwright/test';

test.describe('Navigation & routing', () => {
  test('home page loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Conciergerie.*Crozon.*CMD Breizh/i);
  });

  test('home page has services section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /services/i })).toBeVisible();
  });

  test('navigate to /about via link', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /about|propos/i }).click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page).toHaveTitle(/À propos|About.*CMD Breizh/i);
  });

  test('navigate to /contact via link', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /contact/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/contact/);
    await expect(page).toHaveTitle(/Contact|Contactez.*CMD Breizh/i);
  });

  test('navigate to /reviews via link', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /reviews|avis/i }).click();
    await expect(page).toHaveURL(/\/reviews/);
    await expect(page).toHaveTitle(/Avis|Reviews.*CMD Breizh/i);
  });

  test('contact page has form heading', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('reviews page has heading', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('about page has location section', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { name: /location|localisation/i })).toBeVisible();
  });

  test('GDPR page loads', async ({ page }) => {
    await page.goto('/gdpr');
    await expect(page).toHaveTitle(/confidentialité|RGPD|GDPR/i);
  });

  test('404 page returns not found', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
  });

  test('logo links back to home', async ({ page }) => {
    await page.goto('/about');
    await page.getByRole('link', { name: /CMD Breizh.*Accueil|CMD Breizh.*Home/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
