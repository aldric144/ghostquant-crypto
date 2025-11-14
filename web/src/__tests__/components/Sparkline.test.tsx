import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sparkline from '@/components/Sparkline';

describe('Sparkline', () => {
  const sampleData = [100, 105, 103, 108, 110, 107, 112];

  it('renders SVG element', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with correct dimensions', () => {
    const { container } = render(
      <Sparkline data={sampleData} width={200} height={50} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '50');
  });

  it('uses default dimensions when not specified', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '100');
    expect(svg).toHaveAttribute('height', '30');
  });

  it('renders path element for data', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('uses green color for upward trend', () => {
    const upwardData = [100, 105, 110, 115, 120];
    const { container } = render(<Sparkline data={upwardData} />);
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('stroke', '#10b981');
  });

  it('uses red color for downward trend', () => {
    const downwardData = [120, 115, 110, 105, 100];
    const { container } = render(<Sparkline data={downwardData} />);
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('stroke', '#ef4444');
  });

  it('handles empty data gracefully', () => {
    const { container } = render(<Sparkline data={[]} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('handles single data point', () => {
    const { container } = render(<Sparkline data={[100]} />);
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('handles two data points', () => {
    const { container } = render(<Sparkline data={[100, 110]} />);
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Sparkline data={sampleData} className="custom-sparkline" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-sparkline');
  });

  it('handles negative values', () => {
    const negativeData = [-10, -5, 0, 5, 10];
    const { container } = render(<Sparkline data={negativeData} />);
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('handles all same values', () => {
    const flatData = [100, 100, 100, 100, 100];
    const { container } = render(<Sparkline data={flatData} />);
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('scales data correctly to fit dimensions', () => {
    const { container } = render(
      <Sparkline data={sampleData} width={100} height={30} />
    );
    const path = container.querySelector('path');
    const d = path?.getAttribute('d');
    
    expect(d).toBeTruthy();
    expect(d).toContain('M');
    expect(d).toContain('L');
  });

  it('preserves aspect ratio with preserveAspectRatio attribute', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('preserveAspectRatio', 'none');
  });

  it('uses non-scaling stroke', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('vector-effect', 'non-scaling-stroke');
  });

  it('has correct stroke width', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('stroke-width', '1.5');
  });

  it('has rounded line caps and joins', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('stroke-linecap', 'round');
    expect(path).toHaveAttribute('stroke-linejoin', 'round');
  });

  it('has no fill', () => {
    const { container } = render(<Sparkline data={sampleData} />);
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('fill', 'none');
  });

  it('handles very large numbers', () => {
    const largeData = [1000000, 1100000, 1050000, 1200000];
    const { container } = render(<Sparkline data={largeData} />);
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('handles very small numbers', () => {
    const smallData = [0.0001, 0.0002, 0.00015, 0.00025];
    const { container } = render(<Sparkline data={smallData} />);
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('renders correctly with many data points', () => {
    const manyPoints = Array.from({ length: 100 }, (_, i) => 100 + Math.sin(i / 10) * 10);
    const { container } = render(<Sparkline data={manyPoints} />);
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
  });
});
