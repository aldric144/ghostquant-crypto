/**
 * E2E tests for Whale Explain Modal functionality
 * 
 * Tests the complete user flow:
 * 1. Dashboard loads with Latest Signals above Top Movers
 * 2. User clicks whale badge on a Top Mover
 * 3. Modal opens with whale explanation
 * 4. User can close modal via button or backdrop
 */

import { test, expect } from '@playwright/test';

test.describe('Whale Explain Modal E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    await page.waitForLoadState('networkidle');
  });

  test('Dashboard shows Latest Signals above Top Movers', async ({ page }) => {
    const latestSignalsHeading = page.getByRole('heading', { name: /Latest Signals/i });
    await expect(latestSignalsHeading).toBeVisible();
    
    const topMoversHeading = page.getByRole('heading', { name: /Top Movers/i });
    await expect(topMoversHeading).toBeVisible();
    
    const latestSignalsBox = await latestSignalsHeading.boundingBox();
    const topMoversBox = await topMoversHeading.boundingBox();
    
    expect(latestSignalsBox).not.toBeNull();
    expect(topMoversBox).not.toBeNull();
    expect(latestSignalsBox!.y).toBeLessThan(topMoversBox!.y);
  });

  test('Whale badge is clickable and opens modal', async ({ page }) => {
    await page.waitForSelector('[title*="whale activity"]', { timeout: 10000 });
    
    const whaleBadge = page.locator('[title*="whale activity"]').first();
    await expect(whaleBadge).toBeVisible();
    
    await whaleBadge.click();
    
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    
    await expect(page.getByText(/Whale Activity:/i)).toBeVisible();
  });

  test('Modal displays whale explanation data', async ({ page }) => {
    await page.waitForSelector('[title*="whale activity"]', { timeout: 10000 });
    await page.locator('[title*="whale activity"]').first().click();
    
    await page.waitForSelector('[role="dialog"]');
    
    await expect(page.locator('text=/Large transfer|volume spike|activity/i').first()).toBeVisible({ timeout: 5000 });
    
    await expect(page.locator('text=/Confidence:/i')).toBeVisible();
    
    await expect(page.getByText(/Top Drivers/i)).toBeVisible();
    
    await expect(page.locator('text=/ecoscan|alphabrain|signals/i').first()).toBeVisible();
  });

  test('Modal closes when close button clicked', async ({ page }) => {
    await page.waitForSelector('[title*="whale activity"]', { timeout: 10000 });
    await page.locator('[title*="whale activity"]').first().click();
    
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    
    const closeButton = page.getByLabel('Close modal');
    await closeButton.click();
    
    await expect(modal).not.toBeVisible();
  });

  test('Modal closes when backdrop clicked', async ({ page }) => {
    await page.waitForSelector('[title*="whale activity"]', { timeout: 10000 });
    await page.locator('[title*="whale activity"]').first().click();
    
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    
    await page.locator('.bg-black\\/60').click({ position: { x: 10, y: 10 } });
    
    await expect(modal).not.toBeVisible();
  });

  test('Modal displays loading state initially', async ({ page }) => {
    await page.route('**/insights/whale-explain*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    await page.waitForSelector('[title*="whale activity"]', { timeout: 10000 });
    await page.locator('[title*="whale activity"]').first().click();
    
    const spinner = page.locator('.animate-spin');
    await expect(spinner).toBeVisible();
  });

  test('Modal displays error state on API failure', async ({ page }) => {
    await page.route('**/insights/whale-explain*', route => {
      route.abort('failed');
    });
    
    await page.waitForSelector('[title*="whale activity"]', { timeout: 10000 });
    await page.locator('[title*="whale activity"]').first().click();
    
    await expect(page.getByText(/Unable to fetch explanation/i)).toBeVisible({ timeout: 5000 });
    
    await expect(page.getByText('Retry')).toBeVisible();
  });

  test('Raw data toggle works', async ({ page }) => {
    await page.waitForSelector('[title*="whale activity"]', { timeout: 10000 });
    await page.locator('[title*="whale activity"]').first().click();
    
    await page.waitForSelector('[role="dialog"]');
    await page.waitForTimeout(1000);
    
    const toggleButton = page.getByText(/Show Raw Data/i);
    await toggleButton.click();
    
    await expect(page.getByText(/Hide Raw Data/i)).toBeVisible();
    
    await expect(page.locator('pre').first()).toBeVisible();
  });

  test('CTA links are present', async ({ page }) => {
    await page.waitForSelector('[title*="whale activity"]', { timeout: 10000 });
    await page.locator('[title*="whale activity"]').first().click();
    
    await page.waitForSelector('[role="dialog"]');
    
    await expect(page.getByText('View on Ecoscan')).toBeVisible();
    await expect(page.getByText('View on AlphaBrain')).toBeVisible();
  });

  test('Modal is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.waitForSelector('[title*="whale activity"]', { timeout: 10000 });
    await page.locator('[title*="whale activity"]').first().click();
    
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    
    const modalElement = await modal.elementHandle();
    const className = await modalElement?.getAttribute('class');
    expect(className).toContain('rounded-t-2xl');
  });

  test('Modal is responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.waitForSelector('[title*="whale activity"]', { timeout: 10000 });
    await page.locator('[title*="whale activity"]').first().click();
    
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    
    const modalElement = await modal.elementHandle();
    const className = await modalElement?.getAttribute('class');
    expect(className).toContain('md:rounded-2xl');
  });

  test('Modal is responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    await page.waitForSelector('[title*="whale activity"]', { timeout: 10000 });
    await page.locator('[title*="whale activity"]').first().click();
    
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    
    const modalBox = await modal.boundingBox();
    expect(modalBox).not.toBeNull();
    expect(modalBox!.x).toBeGreaterThan(100); // Not at edge of screen
  });

  test('Multiple whale badges can be clicked sequentially', async ({ page }) => {
    await page.waitForSelector('[title*="whale activity"]', { timeout: 10000 });
    
    const whaleBadges = page.locator('[title*="whale activity"]');
    const count = await whaleBadges.count();
    
    if (count > 1) {
      await whaleBadges.nth(0).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      
      await page.getByLabel('Close modal').click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
      
      await whaleBadges.nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      
      await page.getByLabel('Close modal').click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  });

  test('Analytics event is tracked when modal opens', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).analytics = {
        track: (event: string, data: any) => {
          console.log('ANALYTICS_TRACK:', event, data);
        }
      };
    });
    
    const analyticsEvents: string[] = [];
    page.on('console', msg => {
      if (msg.text().startsWith('ANALYTICS_TRACK:')) {
        analyticsEvents.push(msg.text());
      }
    });
    
    await page.waitForSelector('[title*="whale activity"]', { timeout: 10000 });
    await page.locator('[title*="whale activity"]').first().click();
    
    await page.waitForTimeout(500);
    
    expect(analyticsEvents.some(e => e.includes('whale_explain_opened'))).toBeTruthy();
  });
});
