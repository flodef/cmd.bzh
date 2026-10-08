import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retried tests get a fresh browser+page — helpful when the software
  // rasterizer runs out of memory rendering the heavy glass surfaces
  retries: process.env.CI ? 2 : 1,
  // Serial execution: parallel Chromium instances exhaust memory in headless
  // software rendering and crash the renderer mid-test
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // Instant scrolling: headless SwiftShader crashes repainting large
    // backdrop-filter surfaces during animated smooth scrolls
    reducedMotion: 'reduce',
    launchOptions: {
      args: ['--disable-gpu', '--disable-dev-shm-usage'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'bun dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
