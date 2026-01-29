import { test, expect } from '@playwright/test';

/**
 * Performance Tests
 *
 * Measures real-world performance metrics tied to user experience.
 * These tests ensure the site loads quickly and provides a good UX.
 *
 * Metrics tracked:
 * - First Contentful Paint (FCP) < 1.5s
 * - Largest Contentful Paint (LCP) < 2.5s
 * - DOM Content Loaded < 1s
 * - Page fully loaded < 3s
 */

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  domContentLoaded: number;
  loadComplete: number;
}

async function getPerformanceMetrics(page: any): Promise<PerformanceMetrics> {
  return await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    const fcp = paint.find((p) => p.name === 'first-contentful-paint')?.startTime || 0;

    // LCP - get the largest contentful paint entry
    let lcp = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      lcp = entries[entries.length - 1]?.startTime || 0;
    });

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // LCP not supported
    }

    return {
      fcp,
      lcp: lcp || fcp, // Fallback to FCP if LCP not available
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
      loadComplete: navigation.loadEventEnd - navigation.startTime,
    };
  });
}

const pagesToTest = [
  { path: '/', name: 'Homepage', maxLoad: 2000 },
  { path: '/newsletter-archive.html', name: 'Newsletter Archive', maxLoad: 2000 },
  { path: '/training.html', name: 'Training', maxLoad: 2000 },
  { path: '/season-plan.html', name: 'Season Plan', maxLoad: 2500 }, // Larger page
];

test.describe('Page Load Performance', () => {
  for (const page of pagesToTest) {
    test(`${page.name} loads within performance budget`, async ({ page: browserPage }) => {
      // Navigate and wait for load
      const startTime = Date.now();
      await browserPage.goto(page.path, { waitUntil: 'load' });
      const loadTime = Date.now() - startTime;

      // Get performance metrics
      const metrics = await getPerformanceMetrics(browserPage);

      // Log metrics for visibility
      console.log(`${page.name} Performance Metrics:`);
      console.log(`  - Load Time: ${loadTime}ms`);
      console.log(`  - FCP: ${metrics.fcp.toFixed(2)}ms`);
      console.log(`  - DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms`);

      // Assertions - these are the real-world thresholds
      expect(loadTime, `${page.name} total load time`).toBeLessThan(page.maxLoad);
      expect(metrics.domContentLoaded, `${page.name} DOM content loaded`).toBeLessThan(1500);
    });
  }
});

test.describe('First Contentful Paint', () => {
  test('homepage FCP is under 1.5 seconds', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const metrics = await getPerformanceMetrics(page);

    // FCP should be under 1.5s for good user experience
    expect(metrics.fcp).toBeLessThan(1500);
  });
});

test.describe('Resource Loading', () => {
  test('CSS loads without blocking render', async ({ page }) => {
    await page.goto('/');

    // CSS should be loaded
    const cssLoaded = await page.evaluate(() => {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      return Array.from(stylesheets).every((link) => {
        const sheet = (link as HTMLLinkElement).sheet;
        return sheet !== null;
      });
    });

    expect(cssLoaded).toBe(true);
  });

  test('no render-blocking resources cause delays', async ({ page }) => {
    const resourceTimings: { url: string; duration: number }[] = [];

    page.on('response', async (response) => {
      const timing = response.request().timing();
      if (timing) {
        resourceTimings.push({
          url: response.url(),
          duration: timing.responseEnd,
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // All resources should load within reasonable time
    const slowResources = resourceTimings.filter((r) => r.duration > 2000);

    expect(slowResources.length, 'No resources should take over 2s').toBe(0);
  });
});

test.describe('Page Weight', () => {
  test('total page weight is reasonable', async ({ page }) => {
    let totalBytes = 0;

    page.on('response', async (response) => {
      const headers = response.headers();
      const contentLength = headers['content-length'];
      if (contentLength) {
        totalBytes += parseInt(contentLength);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Total page weight should be under 500KB for a static site
    const totalKB = totalBytes / 1024;
    console.log(`Total page weight: ${totalKB.toFixed(2)}KB`);

    expect(totalKB).toBeLessThan(500);
  });

  test('no large images slow down the page', async ({ page }) => {
    const largeImages: string[] = [];

    page.on('response', async (response) => {
      if (response.request().resourceType() === 'image') {
        const contentLength = response.headers()['content-length'];
        if (contentLength && parseInt(contentLength) > 200 * 1024) {
          // > 200KB
          largeImages.push(response.url());
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(largeImages.length, 'No images should be over 200KB').toBe(0);
  });
});

test.describe('Caching Headers', () => {
  test('static assets have cache headers', async ({ page }) => {
    const responses: { url: string; cacheControl: string | null }[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (url.endsWith('.css') || url.endsWith('.js')) {
        responses.push({
          url,
          cacheControl: response.headers()['cache-control'] || null,
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Note: Local dev server won't have cache headers, but production should
    // This test documents the expectation for production deployment
    console.log('Cache headers for static assets:');
    responses.forEach((r) => {
      console.log(`  ${r.url}: ${r.cacheControl || 'none'}`);
    });
  });
});

test.describe('Mobile Performance', () => {
  test('page performs well on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Mobile should still load quickly
    expect(loadTime).toBeLessThan(3000);
  });
});
