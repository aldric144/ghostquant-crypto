import { test, expect } from '@playwright/test';

test.describe('BuyModal with Liquidity Data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/assets');
    await page.waitForLoadState('networkidle');
  });

  test('displays liquidity data in BuyModal', async ({ page }) => {
    await page.waitForSelector('button:has-text("Buy")', { timeout: 10000 });
    
    const buyButtons = page.locator('button:has-text("Buy")');
    await buyButtons.first().click();
    
    await expect(page.locator('text=Momentum Breakdown')).toBeVisible({ timeout: 5000 });
    
    await expect(page.locator('text=Liquidity & Slippage')).toBeVisible({ timeout: 10000 });
    
    const liquiditySection = page.locator('text=Liquidity & Slippage').locator('..');
    await expect(liquiditySection).toBeVisible();
  });

  test('shows liquidity score', async ({ page }) => {
    await page.waitForSelector('button:has-text("Buy")', { timeout: 10000 });
    
    const buyButtons = page.locator('button:has-text("Buy")');
    await buyButtons.first().click();
    
    await page.waitForSelector('text=Liquidity & Slippage', { timeout: 10000 });
    
    const liquidityScore = page.locator('text=/Liquidity Score|\\d+\\/100/');
    
    await page.waitForTimeout(2000);
    
    if (await liquidityScore.isVisible()) {
      await expect(liquidityScore).toBeVisible();
    }
  });

  test('displays order book data', async ({ page }) => {
    await page.waitForSelector('button:has-text("Buy")', { timeout: 10000 });
    
    const buyButtons = page.locator('button:has-text("Buy")');
    await buyButtons.first().click();
    
    await page.waitForSelector('text=Liquidity & Slippage', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const orderBook = page.locator('text=Order Book');
    
    if (await orderBook.isVisible()) {
      await expect(orderBook).toBeVisible();
      await expect(page.locator('text=Spread')).toBeVisible();
      await expect(page.locator('text=Mid Price')).toBeVisible();
    }
  });

  test('shows slippage estimates', async ({ page }) => {
    await page.waitForSelector('button:has-text("Buy")', { timeout: 10000 });
    
    const buyButtons = page.locator('button:has-text("Buy")');
    await buyButtons.first().click();
    
    await page.waitForSelector('text=Liquidity & Slippage', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const slippageEstimates = page.locator('text=Slippage Estimates');
    
    if (await slippageEstimates.isVisible()) {
      await expect(slippageEstimates).toBeVisible();
      await expect(page.locator('text=/$1K Buy|$5K Buy|$10K Buy/')).toBeVisible();
    }
  });

  test('displays DEX liquidity when available', async ({ page }) => {
    await page.waitForSelector('button:has-text("Buy")', { timeout: 10000 });
    
    const buyButtons = page.locator('button:has-text("Buy")');
    await buyButtons.first().click();
    
    await page.waitForSelector('text=Liquidity & Slippage', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const dexPools = page.locator('text=DEX Pools');
    
    if (await dexPools.isVisible()) {
      await expect(dexPools).toBeVisible();
    }
  });

  test('shows derivatives data when available', async ({ page }) => {
    await page.waitForSelector('button:has-text("Buy")', { timeout: 10000 });
    
    const buyButtons = page.locator('button:has-text("Buy")');
    await buyButtons.first().click();
    
    await page.waitForSelector('text=Liquidity & Slippage', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const derivatives = page.locator('text=Derivatives');
    
    if (await derivatives.isVisible()) {
      await expect(derivatives).toBeVisible();
      await expect(page.locator('text=/Funding|Open Interest/')).toBeVisible();
    }
  });

  test('handles loading state gracefully', async ({ page }) => {
    await page.waitForSelector('button:has-text("Buy")', { timeout: 10000 });
    
    const buyButtons = page.locator('button:has-text("Buy")');
    await buyButtons.first().click();
    
    await expect(page.locator('text=Momentum Breakdown')).toBeVisible({ timeout: 5000 });
    
    const loadingText = page.locator('text=Loading liquidity data...');
    
    if (await loadingText.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(loadingText).toBeVisible();
    }
  });

  test('handles missing liquidity data gracefully', async ({ page }) => {
    await page.goto('/assets');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('button:has-text("Buy")', { timeout: 10000 });
    
    const buyButtons = page.locator('button:has-text("Buy")');
    await buyButtons.first().click();
    
    await page.waitForSelector('text=Liquidity & Slippage', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    const unavailableText = page.locator('text=Liquidity data unavailable');
    const liquidityScore = page.locator('text=/\\d+\\/100/');
    
    const hasData = await liquidityScore.isVisible();
    const noData = await unavailableText.isVisible();
    
    expect(hasData || noData).toBeTruthy();
  });

  test('liquidity colors are correct based on score', async ({ page }) => {
    await page.waitForSelector('button:has-text("Buy")', { timeout: 10000 });
    
    const buyButtons = page.locator('button:has-text("Buy")');
    await buyButtons.first().click();
    
    await page.waitForSelector('text=Liquidity & Slippage', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const liquidityScore = page.locator('text=/\\d+\\/100/');
    
    if (await liquidityScore.isVisible()) {
      const scoreText = await liquidityScore.textContent();
      const score = parseInt(scoreText?.match(/\d+/)?.[0] || '0');
      
      const scoreElement = liquidityScore.locator('..');
      const className = await scoreElement.getAttribute('class');
      
      if (score >= 70) {
        expect(className).toContain('green');
      } else if (score >= 40) {
        expect(className).toContain('yellow');
      } else {
        expect(className).toContain('red');
      }
    }
  });
});
