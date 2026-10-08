import { test, expect } from '@playwright/test';

test.describe('SEO metadata', () => {
  test('home page has canonical link', async ({ page }) => {
    await page.goto('/');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /localhost:3000|cmd\.bzh/);
  });

  test('legacy /about redirects to #about anchor', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL(/#about/);
  });

  test('legacy /contact redirects to #contact anchor', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveURL(/#contact/);
  });

  test('legacy /reviews redirects to #reviews anchor', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page).toHaveURL(/#reviews/);
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
    expect(content).toContain('/gdpr');
  });

  test('manifest.webmanifest is accessible', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest');
    expect(response?.status()).toBe(200);
    const content = await response?.text();
    expect(content).toContain('CMD Breizh');
    expect(content).toContain('icons');
  });

  test('only one h1 per page', async ({ page, context }) => {
    for (const path of ['/', '/gdpr']) {
      // A fresh page per path keeps the renderer's memory footprint low —
      // successive heavy navigations in one page can crash software rasterizers
      const p = await context.newPage();
      await p.goto(path, { waitUntil: 'domcontentloaded' });
      const h1Count = await p.locator('h1').count();
      expect(h1Count, `Path ${path} should have exactly one h1`).toBe(1);
      await p.close();
    }
  });

  test('old ?tab= URLs redirect to section anchors', async ({ page }) => {
    await page.goto('/?tab=About');
    expect(page.url()).toMatch(/#about/);
  });
});
