import { defineConfig, devices } from '@playwright/test';

// Browser regression baseline for the existing prototype journeys.
// Runs against the production build served by `vite preview` (run `npm run build` first).
// KUBICU_PREVIEW_DIR serves another build instead, e.g. the real-sign-in build switched off in its
// /config.json (`npm run test:e2e:flag-flip`), which must pass the same journeys unchanged (M2.6).
const previewDir = process.env.KUBICU_PREVIEW_DIR;
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // no retries: a flaky journey must be fixed, not hidden
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1280, height: 860 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 860 } } }],
  webServer: {
    command: `npx vite preview --port 4173 --strictPort${previewDir ? ` --outDir ${previewDir}` : ''}`,
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
