import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests/smoke',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  use: {
    baseURL: process.env.STORE_URL || 'https://prometheamosaic.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 10000,
  },
  projects: [
    // Desktop viewports
    {
      name: 'small-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'standard-laptop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
    },
    {
      name: 'full-hd',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'large-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 2560, height: 1440 } },
    },
    
    // iOS Mobile devices
    {
      name: 'iphone-12-safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'iphone-13-pro-safari',
      use: { ...devices['iPhone 13 Pro'] },
    },
    {
      name: 'ipad-pro-safari',
      use: { ...devices['iPad Pro'] },
    },
    
    // Android Mobile devices
    {
      name: 'pixel-5-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'pixel-7-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'galaxy-s21-chrome',
      use: { ...devices['Galaxy S21'] },
    },
  ],
});

