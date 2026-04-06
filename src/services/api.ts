import axios from 'axios';
import { subDays, format } from 'date-fns';

export interface ExchangeRate {
    date: string;
    rate: number;
}

const FRANKFURTER_API = import.meta.env.VITE_FRANKFURTER_API ?? 'https://api.frankfurter.dev/v1';
const OPEN_ER_API = import.meta.env.VITE_OPEN_ER_API ?? 'https://open.er-api.com';

export const fetchExchangeRates = async (days: number = 60, baseCurrency: string = 'EUR'): Promise<ExchangeRate[]> => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');

    const response = await axios.get(
        `${FRANKFURTER_API}/${startStr}..${endStr}?from=${baseCurrency}&to=ILS`
    );

    const rates = response.data.rates;
    return Object.keys(rates).map((date) => ({
        date,
        rate: rates[date].ILS,
    }));
};

export const fetchLatestRate = async (baseCurrency: string = 'EUR'): Promise<ExchangeRate | null> => {
    const response = await axios.get(`${OPEN_ER_API}/v6/latest/${baseCurrency}`);
    const data = response.data;

    if (data && data.rates && data.rates.ILS) {
        const dateStr = new Date(data.time_last_update_utc).toISOString().split('T')[0];
        return { date: dateStr, rate: data.rates.ILS };
    }
    return null;
};
