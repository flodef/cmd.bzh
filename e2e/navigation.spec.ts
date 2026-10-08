import { test, expect } from '@playwright/test';

test.describe('Navigation & anchors', () => {
  test('home page loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Conciergerie.*Crozon.*CMD Breizh/i);
  });

  test('home page has services section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /services/i })).toBeVisible();
  });

  test('navigate to #about via nav link', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /about|propos/i })
      .first()
      .click();
    await expect(page).toHaveURL(/#about/);
    await expect(page.locator('#about')).toBeInViewport();
  });

  test('navigate to #contact via nav link', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /^contact$/i })
      .first()
      .click();
    await expect(page).toHaveURL(/#contact/);
    await expect(page.locator('#contact')).toBeInViewport();
  });

  test('navigate to #reviews via nav link', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /reviews|avis/i })
      .first()
      .click();
    await expect(page).toHaveURL(/#reviews/);
    await expect(page.locator('#reviews')).toBeInViewport();
  });

  test('contact section has form heading', async ({ page }) => {
    await page.goto('/#contact');
    await expect(page.locator('#contact h2').first()).toBeVisible();
  });

  test('reviews section has heading', async ({ page }) => {
    await page.goto('/#reviews');
    await expect(page.locator('#reviews h2').first()).toBeVisible();
  });

  test('about section has location heading', async ({ page }) => {
    await page.goto('/#about');
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
    await page.goto('/gdpr');
    await page
      .getByRole('link', { name: /accueil|CMD Breizh/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/#?home|\/$/);
  });
});
