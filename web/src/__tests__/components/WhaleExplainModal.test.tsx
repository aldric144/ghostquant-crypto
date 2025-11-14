/**
 * Unit tests for WhaleExplainModal component
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WhaleExplainModal from '@/components/WhaleExplainModal';

global.fetch = jest.fn();

(global as any).window = {
  analytics: {
    track: jest.fn(),
  },
};

const mockWhaleData = {
  symbol: 'BTC',
  summary: 'Large transfer of 12,300 BTC to Binance + 4.2× exchange volume in the last hour → Whale activity likely. Confidence 78%',
  confidence: 78,
  drivers: [
    {
      type: 'onchain_transfer',
      desc: 'Large transfer of 12,300 BTC to Binance',
      value: '12300',
      unit: 'BTC',
      time: '2025-11-14T04:00:00Z',
    },
    {
      type: 'volume_spike',
      desc: 'Exchange volume 4.2x above normal (1h)',
      value: 4.2,
      unit: 'x',
      time: '2025-11-14T04:05:00Z',
    },
    {
      type: 'orderbook_imbalance',
      desc: 'Buy-side pressure detected (6.5% momentum)',
      value: 6.5,
      unit: '%',
      time: '2025-11-14T04:10:00Z',
    },
  ],
  source: ['ecoscan', 'alphabrain'],
  raw: {
    signals_count: 5,
    factors_count: 10,
  },
};

describe('WhaleExplainModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockWhaleData,
    });
  });

  it('renders modal with correct title', async () => {
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    expect(screen.getByText(/Whale Activity: BTC/i)).toBeInTheDocument();
  });

  it('tracks analytics event on mount', async () => {
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect((window as any).analytics.track).toHaveBeenCalledWith(
        'whale_explain_opened',
        { symbol: 'BTC' }
      );
    });
  });

  it('fetches whale explanation data', async () => {
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/insights/whale-explain?symbol=BTC')
      );
    });
  });

  it('displays loading state initially', () => {
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays summary after data loads', async () => {
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Large transfer of 12,300 BTC/i)).toBeInTheDocument();
    });
  });

  it('displays confidence score with correct color', async () => {
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    await waitFor(() => {
      const confidence = screen.getByText('78%');
      expect(confidence).toBeInTheDocument();
      expect(confidence.className).toContain('text-amber-400');
    });
  });

  it('displays all drivers', async () => {
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Large transfer of 12,300 BTC to Binance/i)).toBeInTheDocument();
      expect(screen.getByText(/Exchange volume 4.2x above normal/i)).toBeInTheDocument();
      expect(screen.getByText(/Buy-side pressure detected/i)).toBeInTheDocument();
    });
  });

  it('displays source badges', async () => {
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('ecoscan')).toBeInTheDocument();
      expect(screen.getByText('alphabrain')).toBeInTheDocument();
    });
  });

  it('closes modal when close button clicked', async () => {
    const onClose = jest.fn();
    render(<WhaleExplainModal symbol="BTC" onClose={onClose} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Large transfer/i)).toBeInTheDocument();
    });
    
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('closes modal when backdrop clicked', async () => {
    const onClose = jest.fn();
    render(<WhaleExplainModal symbol="BTC" onClose={onClose} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Large transfer/i)).toBeInTheDocument();
    });
    
    const backdrop = document.querySelector('.bg-black\\/60');
    fireEvent.click(backdrop!);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('toggles raw data view', async () => {
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Large transfer/i)).toBeInTheDocument();
    });
    
    const toggleButton = screen.getByText(/Show Raw Data/i);
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Hide Raw Data/i)).toBeInTheDocument();
      expect(screen.getByText(/"signals_count"/i)).toBeInTheDocument();
    });
  });

  it('displays error state on fetch failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Unable to fetch explanation/i)).toBeInTheDocument();
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  it('displays retry button on error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    await waitFor(() => {
      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();
    });
  });

  it('has correct ARIA attributes', async () => {
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'whale-explain-title');
  });

  it('displays CTA links', async () => {
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('View on Ecoscan')).toBeInTheDocument();
      expect(screen.getByText('View on AlphaBrain')).toBeInTheDocument();
    });
  });

  it('formats time correctly', async () => {
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    await waitFor(() => {
      const timeElements = screen.getAllByText(/ago$/i);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  it('uses correct confidence color for high confidence (>80)', async () => {
    const highConfidenceData = { ...mockWhaleData, confidence: 85 };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => highConfidenceData,
    });
    
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    await waitFor(() => {
      const confidence = screen.getByText('85%');
      expect(confidence.className).toContain('text-green-400');
    });
  });

  it('uses correct confidence color for low confidence (<60)', async () => {
    const lowConfidenceData = { ...mockWhaleData, confidence: 45 };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => lowConfidenceData,
    });
    
    render(<WhaleExplainModal symbol="BTC" onClose={jest.fn()} />);
    
    await waitFor(() => {
      const confidence = screen.getByText('45%');
      expect(confidence.className).toContain('text-red-400');
    });
  });
});
