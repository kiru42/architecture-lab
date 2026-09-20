import { defineConfig, devices } from '@playwright/test';

// The suite does not boot anything: a script or a CI job starts a backend and a
// frontend, then points these two variables at them. Same split as the shared
// BDD suite, which only wants BACKEND_URL.
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5001';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  // One worker: the specs share a backend and its database. Each test uses fresh
  // emails, but serial execution keeps failures readable and the logs honest.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: FRONTEND_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
