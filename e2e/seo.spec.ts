import { test, expect } from '@playwright/test';

test.describe('SEO metadata', () => {
  test('home page has canonical link', async ({ page }) => {
    await page.goto('/');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /localhost:3000|cmd\.bzh/);
  });

  test('about page has canonical link', async ({ page }) => {
    await page.goto('/about');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /\/about$/);
  });

  test('home page has OG image', async ({ page }) => {
    await page.goto('/');
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', /Logo\.png/);
  });

  test('home page has Twitter card', async ({ page }) => {
    await page.goto('/');
    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');
  });

  test('home page has JSON-LD LocalBusiness', async ({ page }) => {
    await page.goto('/');
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const content = await jsonLd.textContent();
    expect(content).toContain('LocalBusiness');
    expect(content).toContain('"geo"');
    expect(content).toContain('"@id"');
    expect(content).toContain('"logo"');
  });

  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const content = await response?.text();
    expect(content).toContain('User-Agent');
    expect(content).toContain('Sitemap');
  });

  test('sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    const content = await response?.text();
    expect(content).toContain('<urlset');
    expect(content).toContain('/about');
    expect(content).toContain('/contact');
    expect(content).toContain('/reviews');
  });

  test('manifest.webmanifest is accessible', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest');
    expect(response?.status()).toBe(200);
    const content = await response?.text();
    expect(content).toContain('CMD Breizh');
    expect(content).toContain('icons');
  });

  test('only one h1 per page', async ({ page }) => {
    for (const path of ['/', '/about', '/contact', '/reviews', '/gdpr']) {
      await page.goto(path);
      const h1Count = await page.locator('h1').count();
      expect(h1Count, `Path ${path} should have exactly one h1`).toBe(1);
    }
  });

  test('old ?tab= URLs redirect to new routes', async ({ page }) => {
    const response = await page.goto('/?tab=About');
    expect(response?.url()).toMatch(/\/about/);
  });
});
