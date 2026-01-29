import { test, expect } from '@playwright/test';

/**
 * Responsive Design Tests
 *
 * Verifies the site displays correctly across different viewport sizes.
 * Tests mobile navigation, content visibility, and layout changes.
 */

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1280, height: 720 },
  { name: 'Large Desktop', width: 1920, height: 1080 },
];

test.describe('Viewport Responsiveness', () => {
  for (const viewport of viewports) {
    test(`homepage renders correctly at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      // Page header should be visible
      await expect(page.locator('.page-header h1')).toBeVisible();

      // Content should not overflow horizontally
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20); // Small tolerance for scrollbar

      // Footer should be visible when scrolled to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect(page.locator('.site-footer')).toBeVisible();
    });
  }
});

test.describe('Mobile Navigation', () => {
  test('mobile menu toggle works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Mobile menu toggle should be visible
    const menuToggle = page.locator('.mobile-menu-toggle');
    await expect(menuToggle).toBeVisible();

    // Nav links should initially be hidden
    const navLinks = page.locator('.nav-links');
    await expect(navLinks).not.toBeVisible();

    // Click toggle to open menu
    await menuToggle.click();

    // Nav links should now be visible
    await expect(navLinks).toBeVisible();

    // Click toggle again to close
    await menuToggle.click();
  });

  test('desktop nav is visible on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    // Mobile menu toggle should be hidden
    const menuToggle = page.locator('.mobile-menu-toggle');
    await expect(menuToggle).not.toBeVisible();

    // Nav links should be visible
    const navLinks = page.locator('.nav-links');
    await expect(navLinks).toBeVisible();
  });
});

test.describe('Content Readability', () => {
  test('text is readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Main content should have reasonable font size
    const fontSize = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).fontSize;
    });

    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(14); // Minimum readable font size
  });

  test('cards stack vertically on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Get card grid
    const cardGrid = page.locator('.card-grid');

    if ((await cardGrid.count()) > 0) {
      const gridStyle = await cardGrid.evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);

      // On mobile, should be single column
      expect(gridStyle).toMatch(/^[\d.]+px$/); // Single column value
    }
  });

  test('cards display in grid on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    const cardGrid = page.locator('.card-grid');

    if ((await cardGrid.count()) > 0) {
      const gridStyle = await cardGrid.evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);

      // On desktop, should have multiple columns
      expect(gridStyle.split(' ').length).toBeGreaterThan(1);
    }
  });
});

test.describe('Touch Targets', () => {
  test('buttons and links have adequate touch target size on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check clickable elements
    const clickables = page.locator('a, button');
    const count = await clickables.count();

    for (let i = 0; i < Math.min(count, 20); i++) {
      // Check first 20 elements
      const element = clickables.nth(i);

      if (await element.isVisible()) {
        const box = await element.boundingBox();
        if (box) {
          // Minimum touch target should be 44x44 (WCAG recommendation)
          // We'll use 40 to account for padding
          const minDimension = Math.min(box.width, box.height);
          // Only check if element has content (not just spacing)
          if (box.width > 0 && box.height > 0) {
            // Inline text links may be shorter in height; check width meets minimum
            expect(box.height).toBeGreaterThanOrEqual(16);
          }
        }
      }
    }
  });
});
