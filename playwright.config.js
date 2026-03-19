// playwright.config.js

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 60000,

  expect: { timeout: 10000 },

  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'reports/results.json' }],
  ],

  use: {
    headless: false,
    // Launch browser maximized / full screen
    launchOptions: {
      args: ['--start-maximized'],
    },
    viewport: null,           // null = use the actual maximized window size
    actionTimeout: 15000,
    navigationTimeout: 30000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  outputDir: 'screenshots/',
});