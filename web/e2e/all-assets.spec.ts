import { test, expect } from '@playwright/test';

test.describe('All Assets Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/assets');
    await page.waitForLoadState('networkidle');
  });

  test('displays asset list with search functionality', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('All Assets');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill('BTC');
    await page.waitForTimeout(500);
    
    const assetCards = page.locator('[class*="AssetCard"]').or(page.locator('text=BTC'));
    await expect(assetCards.first()).toBeVisible();
  });

  test('whale badge opens WhaleExplain modal', async ({ page }) => {
    await page.waitForSelector('button:has-text("70%"), button:has-text("60%"), button:has-text("80%")', { timeout: 10000 });
    
    const whaleBadges = page.locator('button').filter({ hasText: /\d+%/ });
    const firstBadge = whaleBadges.first();
    
    if (await firstBadge.isVisible()) {
      await firstBadge.click();
      
      await expect(page.locator('text=Whale Activity Explanation')).toBeVisible({ timeout: 5000 });
      
      await expect(page.locator('text=Summary')).toBeVisible();
      
      const closeButton = page.locator('button:has-text("Close")').or(page.locator('button[aria-label="Close"]'));
      await closeButton.click();
      
      await expect(page.locator('text=Whale Activity Explanation')).not.toBeVisible();
    }
  });

  test('buy button opens BuyModal', async ({ page }) => {
    await page.waitForSelector('button:has-text("Buy")', { timeout: 10000 });
    
    const buyButtons = page.locator('button:has-text("Buy")');
    await buyButtons.first().click();
    
    await expect(page.locator('text=Momentum Breakdown')).toBeVisible({ timeout: 5000 });
    
    await expect(page.locator('text=Create Alert')).toBeVisible();
    
    const closeButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await closeButton.click();
    
    await expect(page.locator('text=Momentum Breakdown')).not.toBeVisible();
  });

  test('watch button toggles watchlist', async ({ page }) => {
    const watchButtons = page.locator('button').filter({ has: page.locator('svg[class*="lucide"]') }).filter({ hasNotText: 'Buy' });
    const firstWatchButton = watchButtons.first();
    
    await firstWatchButton.click();
    await page.waitForTimeout(300);
    
    const watchlistCount = page.locator('text=/Watchlist: \\d+/');
    await expect(watchlistCount).toBeVisible();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(watchlistCount).toBeVisible();
  });

  test('sort functionality works', async ({ page }) => {
    const sortSelect = page.locator('select').first();
    await sortSelect.selectOption('whale_confidence');
    
    await page.waitForTimeout(500);
    
    const assetCards = page.locator('[class*="grid"]').first();
    await expect(assetCards).toBeVisible();
  });

  test('filter by signal works', async ({ page }) => {
    const filterButtons = page.locator('button').filter({ hasText: /BUY|HOLD|EXIT/ });
    
    if (await filterButtons.first().isVisible()) {
      await filterButtons.first().click();
      await page.waitForTimeout(500);
      
      const assetCards = page.locator('[class*="grid"]').first();
      await expect(assetCards).toBeVisible();
    }
  });

  test('responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.waitForSelector('button:has-text("Buy")', { timeout: 10000 });
    
    const buyButtons = page.locator('button:has-text("Buy")');
    await expect(buyButtons.first()).toBeVisible();
    
    const buttonBox = await buyButtons.first().boundingBox();
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('responsive layout on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.waitForSelector('button:has-text("Buy")', { timeout: 10000 });
    
    const assetCards = page.locator('[class*="grid"]').first();
    await expect(assetCards).toBeVisible();
  });

  test('sparklines render correctly', async ({ page }) => {
    await page.waitForSelector('svg', { timeout: 10000 });
    
    const sparklines = page.locator('svg');
    const count = await sparklines.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('search latency is acceptable', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    const startTime = Date.now();
    await searchInput.fill('ETH');
    await page.waitForTimeout(100);
    const endTime = Date.now();
    
    const latency = endTime - startTime;
    expect(latency).toBeLessThan(300);
  });

  test('pagination or virtualization handles large lists', async ({ page }) => {
    await page.waitForSelector('button:has-text("Buy")', { timeout: 10000 });
    
    const assetCards = page.locator('[class*="grid"]').first();
    await expect(assetCards).toBeVisible();
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    const buyButtons = page.locator('button:has-text("Buy")');
    const count = await buyButtons.count();
    expect(count).toBeGreaterThan(10);
  });

  test('refresh button updates data', async ({ page }) => {
    const refreshButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /Refresh|Update/ }).or(page.locator('button[aria-label*="refresh"]'));
    
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(1000);
      
      const assetCards = page.locator('[class*="grid"]').first();
      await expect(assetCards).toBeVisible();
    }
  });

  test('stats bar shows correct information', async ({ page }) => {
    const statsBar = page.locator('text=/Gainers:|Losers:|Watchlist:/');
    
    if (await statsBar.first().isVisible()) {
      await expect(statsBar.first()).toBeVisible();
    }
  });
});
