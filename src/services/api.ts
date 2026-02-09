import axios from 'axios';
import { subDays, format } from 'date-fns';

export interface ExchangeRate {
    date: string;
    rate: number;
}

export const fetchExchangeRates = async (days: number = 60, baseCurrency: string = 'EUR'): Promise<ExchangeRate[]> => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');

    try {
        const response = await axios.get(
            `https://api.frankfurter.app/${startStr}..${endStr}?from=${baseCurrency}&to=ILS`
        );

        const rates = response.data.rates;
        const formattedData: ExchangeRate[] = Object.keys(rates).map((date) => ({
            date,
            rate: rates[date].ILS,
        }));

        return formattedData;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return [];
    }
};

export const fetchLatestRate = async (baseCurrency: string = 'EUR'): Promise<ExchangeRate | null> => {
    try {
        const response = await axios.get(`https://open.er-api.com/v6/latest/${baseCurrency}`);
        const data = response.data;

        if (data && data.rates && data.rates.ILS) {
            // open.er-api.com returns date in YYYY-MM-DD
            // It also provides time_last_update_utc, but let's stick to the date for compatibility
            // We might want to use the current date if the API date is yesterday but it's actually today's rate 
            // (APIs sometimes have different day cutoffs). 
            // For simplicity/safety, let's use the date the API claims the data is for, or today's date if it's "latest".

            // Let's use the time_last_update_utc to derive the date if possible, or just new Date().
            // Actually, let's look at the response format from my previous curl.
            // "time_last_update_utc":"Mon, 09 Feb 2026 00:02:31 +0000"

            const dateStr = new Date(data.time_last_update_utc).toISOString().split('T')[0];

            return {
                date: dateStr,
                rate: data.rates.ILS
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching latest rate:', error);
        return null;
    }
};
