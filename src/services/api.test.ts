import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchExchangeRates, fetchLatestRate } from './api';

vi.mock('axios');
const mockedGet = vi.mocked(axios.get);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchExchangeRates', () => {
  it('returns formatted exchange rate array on success', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        rates: {
          '2024-01-01': { ILS: 3.9 },
          '2024-01-02': { ILS: 3.95 },
        },
      },
    });

    const result = await fetchExchangeRates(7, 'EUR');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ date: '2024-01-01', rate: 3.9 });
    expect(result[1]).toEqual({ date: '2024-01-02', rate: 3.95 });
  });

  it('calls the correct API endpoint', async () => {
    mockedGet.mockResolvedValueOnce({ data: { rates: {} } });

    await fetchExchangeRates(7, 'USD');

    expect(mockedGet).toHaveBeenCalledWith(expect.stringContaining('from=USD&to=ILS'));
  });

  it('throws on network error', async () => {
    mockedGet.mockRejectedValueOnce(new Error('Network Error'));

    await expect(fetchExchangeRates(7, 'EUR')).rejects.toThrow('Network Error');
  });
});

describe('fetchLatestRate', () => {
  it('returns the latest rate when ILS is present', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        rates: { ILS: 3.72 },
        time_last_update_utc: 'Mon, 01 Jan 2024 00:00:00 +0000',
      },
    });

    const result = await fetchLatestRate('EUR');

    expect(result).toEqual({ date: '2024-01-01', rate: 3.72 });
  });

  it('returns null when ILS rate is missing from response', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { rates: { USD: 1 }, time_last_update_utc: 'Mon, 01 Jan 2024 00:00:00 +0000' },
    });

    const result = await fetchLatestRate('EUR');

    expect(result).toBeNull();
  });

  it('returns null when response data is malformed', async () => {
    mockedGet.mockResolvedValueOnce({ data: null });

    const result = await fetchLatestRate('EUR');

    expect(result).toBeNull();
  });

  it('throws on network error', async () => {
    mockedGet.mockRejectedValueOnce(new Error('Network Error'));

    await expect(fetchLatestRate('EUR')).rejects.toThrow('Network Error');
  });
});
