import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssetCard from '@/components/AssetCard';
import { Asset } from '@/lib/api';

const mockAsset: Asset = {
  coin_id: 'bitcoin',
  symbol: 'BTC',
  name: 'Bitcoin',
  image: 'https://example.com/btc.png',
  price: 45000,
  market_cap: 900000000000,
  market_cap_rank: 1,
  total_volume: 50000000000,
  momentum_score: 75.5,
  trend_score: 75.5,
  pretrend: 0.8,
  whale_confidence: 0.7,
  signal: 'BUY',
  price_change_percentage_1h: 1.2,
  price_change_percentage_24h: 5.5,
  price_change_percentage_7d: 10.2,
  sparkline_7d: [40000, 41000, 42000, 43000, 44000, 45000],
  last_updated: '2024-01-01T00:00:00Z',
};

describe('AssetCard', () => {
  const mockOnBuyClick = jest.fn();
  const mockOnWatchToggle = jest.fn();
  const mockOnWhaleClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders asset information correctly', () => {
    render(
      <AssetCard
        asset={mockAsset}
        onBuyClick={mockOnBuyClick}
        onWatchToggle={mockOnWatchToggle}
        onWhaleClick={mockOnWhaleClick}
        isWatched={false}
        compact={true}
      />
    );

    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('$45,000.00')).toBeInTheDocument();
    expect(screen.getByText('+5.50%')).toBeInTheDocument();
  });

  it('displays whale badge when confidence >= 0.6', () => {
    render(
      <AssetCard
        asset={mockAsset}
        onBuyClick={mockOnBuyClick}
        onWatchToggle={mockOnWatchToggle}
        onWhaleClick={mockOnWhaleClick}
        isWatched={false}
        compact={true}
      />
    );

    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('does not display whale badge when confidence < 0.6', () => {
    const lowWhaleAsset = { ...mockAsset, whale_confidence: 0.5 };
    
    render(
      <AssetCard
        asset={lowWhaleAsset}
        onBuyClick={mockOnBuyClick}
        onWatchToggle={mockOnWatchToggle}
        onWhaleClick={mockOnWhaleClick}
        isWatched={false}
        compact={true}
      />
    );

    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('calls onWhaleClick when whale badge is clicked', () => {
    render(
      <AssetCard
        asset={mockAsset}
        onBuyClick={mockOnBuyClick}
        onWatchToggle={mockOnWatchToggle}
        onWhaleClick={mockOnWhaleClick}
        isWatched={false}
        compact={true}
      />
    );

    const whaleBadge = screen.getByText('70%').closest('button');
    if (whaleBadge) {
      fireEvent.click(whaleBadge);
      expect(mockOnWhaleClick).toHaveBeenCalledWith('BTC');
    }
  });

  it('calls onBuyClick when Buy button is clicked', () => {
    render(
      <AssetCard
        asset={mockAsset}
        onBuyClick={mockOnBuyClick}
        onWatchToggle={mockOnWatchToggle}
        onWhaleClick={mockOnWhaleClick}
        isWatched={false}
        compact={true}
      />
    );

    const buyButton = screen.getByText('Buy');
    fireEvent.click(buyButton);
    expect(mockOnBuyClick).toHaveBeenCalledWith(mockAsset);
  });

  it('calls onWatchToggle when Watch button is clicked', () => {
    render(
      <AssetCard
        asset={mockAsset}
        onBuyClick={mockOnBuyClick}
        onWatchToggle={mockOnWatchToggle}
        onWhaleClick={mockOnWhaleClick}
        isWatched={false}
        compact={true}
      />
    );

    const watchButtons = screen.getAllByRole('button');
    const watchButton = watchButtons.find(btn => 
      btn.querySelector('svg') && !btn.textContent?.includes('Buy')
    );
    
    if (watchButton) {
      fireEvent.click(watchButton);
      expect(mockOnWatchToggle).toHaveBeenCalledWith(mockAsset, true);
    }
  });

  it('shows watched state correctly', () => {
    const { container } = render(
      <AssetCard
        asset={mockAsset}
        onBuyClick={mockOnBuyClick}
        onWatchToggle={mockOnWatchToggle}
        onWhaleClick={mockOnWhaleClick}
        isWatched={true}
        compact={true}
      />
    );

    const watchButtons = container.querySelectorAll('button');
    const watchButton = Array.from(watchButtons).find(btn => 
      btn.className.includes('yellow')
    );
    
    expect(watchButton).toBeInTheDocument();
  });

  it('displays signal badge with correct styling', () => {
    render(
      <AssetCard
        asset={mockAsset}
        onBuyClick={mockOnBuyClick}
        onWatchToggle={mockOnWatchToggle}
        onWhaleClick={mockOnWhaleClick}
        isWatched={false}
        compact={true}
      />
    );

    expect(screen.getByText('BUY')).toBeInTheDocument();
  });

  it('formats price correctly for different ranges', () => {
    const smallPriceAsset = { ...mockAsset, price: 0.00123 };
    
    const { rerender } = render(
      <AssetCard
        asset={smallPriceAsset}
        onBuyClick={mockOnBuyClick}
        onWatchToggle={mockOnWatchToggle}
        onWhaleClick={mockOnWhaleClick}
        isWatched={false}
        compact={true}
      />
    );

    expect(screen.getByText('$0.001230')).toBeInTheDocument();

    const mediumPriceAsset = { ...mockAsset, price: 0.5 };
    rerender(
      <AssetCard
        asset={mediumPriceAsset}
        onBuyClick={mockOnBuyClick}
        onWatchToggle={mockOnWatchToggle}
        onWhaleClick={mockOnWhaleClick}
        isWatched={false}
        compact={true}
      />
    );

    expect(screen.getByText('$0.5000')).toBeInTheDocument();
  });

  it('displays negative price change correctly', () => {
    const negativeChangeAsset = { ...mockAsset, price_change_percentage_24h: -3.5 };
    
    render(
      <AssetCard
        asset={negativeChangeAsset}
        onBuyClick={mockOnBuyClick}
        onWatchToggle={mockOnWatchToggle}
        onWhaleClick={mockOnWhaleClick}
        isWatched={false}
        compact={true}
      />
    );

    expect(screen.getByText('-3.50%')).toBeInTheDocument();
  });

  it('renders sparkline when data is available', () => {
    const { container } = render(
      <AssetCard
        asset={mockAsset}
        onBuyClick={mockOnBuyClick}
        onWatchToggle={mockOnWatchToggle}
        onWhaleClick={mockOnWhaleClick}
        isWatched={false}
        compact={true}
      />
    );

    const sparkline = container.querySelector('svg');
    expect(sparkline).toBeInTheDocument();
  });

  it('handles missing sparkline data gracefully', () => {
    const noSparklineAsset = { ...mockAsset, sparkline_7d: undefined };
    
    const { container } = render(
      <AssetCard
        asset={noSparklineAsset}
        onBuyClick={mockOnBuyClick}
        onWatchToggle={mockOnWatchToggle}
        onWhaleClick={mockOnWhaleClick}
        isWatched={false}
        compact={true}
      />
    );

    const sparklines = container.querySelectorAll('svg');
    expect(sparklines.length).toBeLessThanOrEqual(2);
  });

  it('meets accessibility requirements for touch targets', () => {
    const { container } = render(
      <AssetCard
        asset={mockAsset}
        onBuyClick={mockOnBuyClick}
        onWatchToggle={mockOnWatchToggle}
        onWhaleClick={mockOnWhaleClick}
        isWatched={false}
        compact={true}
      />
    );

    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      const style = window.getComputedStyle(button);
      const minWidth = parseInt(style.minWidth);
      const minHeight = parseInt(style.minHeight);
      
      expect(minWidth).toBeGreaterThanOrEqual(44);
      expect(minHeight).toBeGreaterThanOrEqual(44);
    });
  });
});
