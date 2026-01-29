import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Tests
 *
 * Verifies WCAG 2.1 AA compliance using axe-core.
 * These tests ensure the site is accessible to users with disabilities.
 */

const pagesToTest = [
  { path: '/', name: 'Homepage' },
  { path: '/newsletter-archive.html', name: 'Newsletter Archive' },
  { path: '/training.html', name: 'Training' },
  { path: '/results.html', name: 'Results' },
  { path: '/training-level-guide.html', name: 'Training Level Guide' },
];

test.describe('Accessibility Audit', () => {
  for (const page of pagesToTest) {
    test(`${page.name} passes accessibility audit`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);

      const accessibilityScanResults = await new AxeBuilder({ page: browserPage })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Filter out minor issues
      const violations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical'
      );

      expect(violations, `Accessibility violations on ${page.name}`).toEqual([]);
    });
  }
});

test.describe('Keyboard Navigation', () => {
  test('can navigate entire page with keyboard', async ({ page }) => {
    await page.goto('/');

    // Start from beginning
    await page.keyboard.press('Tab');

    // Should be able to tab through all interactive elements
    let tabCount = 0;
    const maxTabs = 50;

    while (tabCount < maxTabs) {
      const focused = await page.evaluate(() => document.activeElement?.tagName);

      if (focused === 'BODY') break;

      await page.keyboard.press('Tab');
      tabCount++;
    }

    // Should have found multiple focusable elements
    expect(tabCount).toBeGreaterThan(5);
  });

  test('navigation links are keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // On mobile, open the menu first with click (keyboard will be tested separately)
    const mobileToggle = page.locator('.mobile-menu-toggle');
    if (await mobileToggle.isVisible()) {
      await mobileToggle.click();
      await page.waitForTimeout(100);
    }

    // Tab to first nav link
    let foundNav = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.closest('.nav-links') !== null;
      });
      if (focused) {
        foundNav = true;
        break;
      }
    }

    expect(foundNav).toBe(true);

    // Press Enter to navigate
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');

    // Should have navigated to a new page
    const url = page.url();
    expect(url).not.toBe('http://localhost:8000/');
  });
});

test.describe('ARIA and Semantic HTML', () => {
  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) =>
      elements.map((el) => ({
        level: parseInt(el.tagName.replace('H', '')),
        text: el.textContent?.trim(),
      }))
    );

    // Should have exactly one H1
    const h1Count = headings.filter((h) => h.level === 1).length;
    expect(h1Count).toBe(1);

    // Heading levels should not skip (e.g., H1 -> H3)
    let prevLevel = 0;
    for (const heading of headings) {
      if (prevLevel > 0) {
        expect(heading.level - prevLevel).toBeLessThanOrEqual(1);
      }
      prevLevel = heading.level;
    }
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');

    const imagesWithoutAlt = await page.$$eval('img', (images) =>
      images.filter((img) => !img.hasAttribute('alt')).map((img) => img.src)
    );

    expect(imagesWithoutAlt, 'All images should have alt attributes').toEqual([]);
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);

      // Button should have accessible name (text content or aria-label)
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      expect(text || ariaLabel, `Button ${i} should have accessible name`).toBeTruthy();
    }
  });

  test('links have descriptive text', async ({ page }) => {
    await page.goto('/');

    const vagueLinks = await page.$$eval('a', (links) =>
      links
        .filter((link) => {
          const text = link.textContent?.trim().toLowerCase() || '';
          const vagueTexts = ['click here', 'here', 'read more', 'more', 'link'];
          return vagueTexts.includes(text) && !link.hasAttribute('aria-label');
        })
        .map((link) => link.href)
    );

    expect(vagueLinks, 'Links should have descriptive text').toEqual([]);
  });
});

test.describe('Color Contrast', () => {
  test('text has sufficient contrast', async ({ page }) => {
    await page.goto('/');

    // Use axe-core specifically for color contrast
    const contrastResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    const contrastViolations = contrastResults.violations;

    // Allow some minor violations but flag any serious ones
    const seriousViolations = contrastViolations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );

    expect(seriousViolations).toEqual([]);
  });
});

test.describe('Dark Mode Accessibility', () => {
  test('dark mode maintains accessibility', async ({ page }) => {
    await page.goto('/');

    // Toggle dark mode
    await page.click('.theme-toggle');
    await page.waitForTimeout(300); // Wait for transition

    // Run accessibility scan in dark mode
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const violations = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );

    expect(violations, 'Dark mode should maintain accessibility').toEqual([]);
  });
});
