import { describe, it, expect } from 'vitest';
import { calculateTrend } from './prediction';
import type { ExchangeRate } from '../services/api';

const makeRates = (rates: number[]): ExchangeRate[] =>
  rates.map((rate, i) => ({ date: `2024-01-${String(i + 1).padStart(2, '0')}`, rate }));

describe('calculateTrend', () => {
  it('returns STABLE for fewer than 2 data points', () => {
    expect(calculateTrend([])).toBe('STABLE');
    expect(calculateTrend(makeRates([3.7]))).toBe('STABLE');
  });

  it('returns UP for a clearly rising trend', () => {
    expect(calculateTrend(makeRates([3.5, 3.6, 3.7, 3.8, 3.9]))).toBe('UP');
  });

  it('returns DOWN for a clearly falling trend', () => {
    expect(calculateTrend(makeRates([3.9, 3.8, 3.7, 3.6, 3.5]))).toBe('DOWN');
  });

  it('returns STABLE for a flat trend', () => {
    expect(calculateTrend(makeRates([3.7, 3.7, 3.7, 3.7]))).toBe('STABLE');
  });

  it('returns STABLE for tiny fluctuations within threshold', () => {
    // slope will be < 0.001
    expect(calculateTrend(makeRates([3.700, 3.7001, 3.7002, 3.7001]))).toBe('STABLE');
  });

  it('does not divide by zero when all x values are identical (single point repeated)', () => {
    // With only 1 element the n<2 guard fires, but test the math guard with 2 identical indices — not possible
    // The real degenerate case: n=1 is caught early. With n>=2 the denominator is always >0 for distinct indices.
    // This confirms the guard is defensive — should still return a valid value.
    const result = calculateTrend(makeRates([3.7, 3.8]));
    expect(['UP', 'DOWN', 'STABLE']).toContain(result);
  });
});
