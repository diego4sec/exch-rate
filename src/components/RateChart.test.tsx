import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RateChart } from './RateChart';

// Recharts uses ResizeObserver which isn't available in jsdom
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const sampleData = [
  { date: '2024-01-01', EUR: 3.9, USD: 3.7 },
  { date: '2024-01-03', EUR: 3.95, USD: 3.72 },
];

const lines = [
  { key: 'EUR', color: '#60a5fa', name: 'EUR/ILS' },
  { key: 'USD', color: '#4ade80', name: 'USD/ILS' },
];

describe('RateChart', () => {
  it('renders without crashing', () => {
    const { container } = render(<RateChart data={sampleData} lines={lines} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders with empty data without crashing', () => {
    const { container } = render(<RateChart data={[]} lines={lines} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('uses default line when no lines prop is provided', () => {
    const { container } = render(<RateChart data={sampleData} />);
    expect(container.firstChild).not.toBeNull();
  });
});
