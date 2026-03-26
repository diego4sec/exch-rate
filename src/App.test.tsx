import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as api from './services/api';

// Recharts uses ResizeObserver which isn't available in jsdom
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock('./services/api');

const mockHistoryEur = [
  { date: '2024-01-01', rate: 3.9 },
  { date: '2024-01-02', rate: 3.95 },
  { date: '2024-01-03', rate: 4.0 },
];

const mockHistoryUsd = [
  { date: '2024-01-01', rate: 3.7 },
  { date: '2024-01-02', rate: 3.72 },
  { date: '2024-01-03', rate: 3.75 },
];

const mockLatestEur = { date: '2024-01-04', rate: 4.05 };
const mockLatestUsd = { date: '2024-01-04', rate: 3.78 };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.fetchExchangeRates).mockImplementation((_, currency) =>
    Promise.resolve(currency === 'EUR' ? mockHistoryEur : mockHistoryUsd)
  );
  vi.mocked(api.fetchLatestRate).mockImplementation((currency) =>
    Promise.resolve(currency === 'EUR' ? mockLatestEur : mockLatestUsd)
  );
});

describe('App', () => {
  it('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders currency values after data loads', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/₪4\.0500/)).toBeInTheDocument();
      expect(screen.getByText(/₪3\.7800/)).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    vi.mocked(api.fetchExchangeRates).mockRejectedValue(new Error('Network Error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load exchange rate data/)).toBeInTheDocument();
    });
  });

  it('shows a retry button when in error state', async () => {
    vi.mocked(api.fetchExchangeRates).mockRejectedValue(new Error('Network Error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('retries fetch when retry button is clicked', async () => {
    vi.mocked(api.fetchExchangeRates)
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockImplementation((_, currency) =>
        Promise.resolve(currency === 'EUR' ? mockHistoryEur : mockHistoryUsd)
      );

    render(<App />);

    await waitFor(() => screen.getByRole('button', { name: /retry/i }));

    await userEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByText(/₪4\.0500/)).toBeInTheDocument();
    });
  });

  it('renders period selector with correct options', async () => {
    render(<App />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Last 60 Days' })).toBeInTheDocument();
  });

  it('fetches new data when period changes', async () => {
    render(<App />);
    await waitFor(() => screen.getByText(/₪4\.0500/));

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, '30');

    await waitFor(() => {
      expect(vi.mocked(api.fetchExchangeRates)).toHaveBeenCalledWith(30, 'EUR');
    });
  });
});
