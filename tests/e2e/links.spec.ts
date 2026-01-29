import { test, expect } from '@playwright/test';

/**
 * Link Validation Tests
 *
 * Ensures no broken internal links exist on the site.
 * External links are checked for proper attributes but not fetched.
 */

const pagesToCheck = [
  '/',
  '/newsletter-archive.html',
  '/training.html',
  '/results.html',
  '/season-plan.html',
  '/training-level-guide.html',
  '/daniels-method-guide.html',
];

test.describe('Internal Links', () => {
  for (const pagePath of pagesToCheck) {
    test(`all internal links on ${pagePath} are valid`, async ({ page, request }) => {
      await page.goto(pagePath);

      // Get all internal links
      const internalLinks = await page.$$eval('a[href]', (links) =>
        links
          .filter((link) => {
            const href = link.getAttribute('href') || '';
            return (
              href.startsWith('/') ||
              href.startsWith('./') ||
              (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#'))
            );
          })
          .map((link) => link.getAttribute('href'))
      );

      // Remove duplicates
      const uniqueLinks = [...new Set(internalLinks)];

      // Check each link
      for (const link of uniqueLinks) {
        if (!link) continue;

        const response = await request.get(link);
        expect(
          response.status(),
          `Link ${link} on page ${pagePath} returned ${response.status()}`
        ).toBe(200);
      }
    });
  }
});

test.describe('External Links', () => {
  test('external links have proper security attributes', async ({ page }) => {
    await page.goto('/');

    const externalLinks = page.locator('a[href^="http"]');
    const count = await externalLinks.count();

    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      const href = await link.getAttribute('href');

      // External links should open in new tab
      await expect(link, `External link ${href} should have target="_blank"`).toHaveAttribute(
        'target',
        '_blank'
      );

      // External links should have rel="noopener noreferrer" for security
      const rel = await link.getAttribute('rel');
      expect(rel, `External link ${href} should have noopener`).toContain('noopener');
    }
  });

  test('results page external links point to valid timing services', async ({ page }) => {
    await page.goto('/results.html');

    const resultLinks = page.locator('.result-card');
    const count = await resultLinks.count();

    // Should have race result links
    expect(count).toBeGreaterThan(0);

    // Each result card should have a valid href
    for (let i = 0; i < count; i++) {
      const link = resultLinks.nth(i);
      const href = await link.getAttribute('href');

      expect(href).toBeTruthy();
      expect(href).toMatch(/^https?:\/\//);
    }
  });
});

test.describe('Newsletter Links', () => {
  test('all newsletter archive links work', async ({ page, request }) => {
    await page.goto('/newsletter-archive.html');

    const newsletterLinks = await page.$$eval('.newsletter-card', (links) =>
      links.map((link) => link.getAttribute('href'))
    );

    for (const link of newsletterLinks) {
      if (!link) continue;

      const response = await request.get(link);
      expect(response.status(), `Newsletter ${link} should exist`).toBe(200);
    }
  });
});
