import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Skyview XC Website
 *
 * This configuration demonstrates:
 * - Multi-browser testing (Chrome, Mobile)
 * - Performance thresholds
 * - Accessibility testing integration
 * - CI/CD optimizations
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['github' as const]] : []),
  ],

  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] }, // Uses Chromium - no need for webkit
    },
  ],

  webServer: {
    command: 'python3 -m http.server 8000',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Global timeout settings
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
});
