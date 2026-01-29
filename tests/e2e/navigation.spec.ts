import { test, expect } from '@playwright/test';

/**
 * Navigation Tests
 *
 * Verifies that all pages load correctly and navigation works as expected.
 * These tests ensure users can access all content on the site.
 */

const pages = [
  { path: '/', title: 'Skyview Academy Cross Country' },
  { path: '/newsletter-archive.html', title: 'Newsletter Archive' },
  { path: '/training.html', title: 'Training' },
  { path: '/results.html', title: 'Results' },
  { path: '/season-plan.html', title: 'Season Plan' },
  { path: '/training-level-guide.html', title: 'Training Level Guide' },
  { path: '/daniels-method-guide.html', title: 'Jack Daniels Method' },
];

test.describe('Page Loading', () => {
  for (const page of pages) {
    test(`${page.path} loads successfully`, async ({ page: browserPage }) => {
      const response = await browserPage.goto(page.path);

      // Verify HTTP 200 response
      expect(response?.status()).toBe(200);

      // Verify page title contains expected text
      await expect(browserPage).toHaveTitle(new RegExp(page.title, 'i'));

      // Verify no JavaScript errors
      const errors: string[] = [];
      browserPage.on('pageerror', (error) => errors.push(error.message));
      await browserPage.waitForLoadState('networkidle');
      expect(errors).toHaveLength(0);
    });
  }
});

test.describe('Navigation Header', () => {
  test('header navigation links work correctly', async ({ page }) => {
    await page.goto('/');

    // Click each nav link and verify navigation
    const navLinks = [
      { text: 'Newsletters', expectedUrl: '/newsletter-archive.html' },
      { text: 'Training', expectedUrl: '/training.html' },
      { text: 'Results', expectedUrl: '/results.html' },
      { text: 'Season Plan', expectedUrl: '/season-plan.html' },
    ];

    for (const link of navLinks) {
      await page.goto('/');

      // On mobile, open the menu first
      const mobileToggle = page.locator('.mobile-menu-toggle');
      if (await mobileToggle.isVisible()) {
        await mobileToggle.click();
        await page.waitForTimeout(100); // Wait for menu animation
      }

      await page.click(`nav >> text=${link.text}`);
      await expect(page).toHaveURL(new RegExp(link.expectedUrl));
    }
  });

  test('logo links back to homepage', async ({ page }) => {
    await page.goto('/training.html');
    await page.click('.nav-logo');
    await expect(page).toHaveURL('/');
  });

  test('dark mode toggle works', async ({ page }) => {
    await page.goto('/');

    // Initial state should be light mode (or system preference)
    const html = page.locator('html');

    // Click toggle
    await page.click('.theme-toggle');

    // Should have data-theme attribute after clicking
    await expect(html).toHaveAttribute('data-theme', /(dark|light)/);

    // Click again to toggle back
    const currentTheme = await html.getAttribute('data-theme');
    await page.click('.theme-toggle');
    const newTheme = await html.getAttribute('data-theme');

    expect(newTheme).not.toBe(currentTheme);
  });
});

test.describe('Newsletter Navigation', () => {
  test('can navigate to current newsletter from homepage', async ({ page }) => {
    await page.goto('/');

    // Click the current newsletter link
    await page.click('a[href*="week12-newsletter"]');

    await expect(page).toHaveURL(/newsletters\/week12-newsletter\.html/);
    await expect(page.locator('h1')).toContainText(/cross country/i);
  });

  test('newsletter archive shows all newsletters', async ({ page }) => {
    await page.goto('/newsletter-archive.html');

    // Should have multiple newsletter cards
    const newsletterCards = page.locator('.newsletter-card');
    const count = await newsletterCards.count();

    expect(count).toBeGreaterThanOrEqual(5);
  });
});

test.describe('Footer', () => {
  test('footer appears on all pages', async ({ page }) => {
    for (const p of pages) {
      await page.goto(p.path);
      await expect(page.locator('.site-footer')).toBeVisible();
    }
  });

  test('footer contains attribution link', async ({ page }) => {
    await page.goto('/');

    const linkedIn = page.locator('.footer-attribution >> a[href*="linkedin"]');
    await expect(linkedIn).toBeVisible();
    await expect(linkedIn).toHaveAttribute('target', '_blank');
  });

  test('footer contains GitHub link', async ({ page }) => {
    await page.goto('/');

    const github = page.locator('.footer-attribution >> a[href*="github"]');
    await expect(github).toBeVisible();
    await expect(github).toHaveAttribute('target', '_blank');
  });
});
