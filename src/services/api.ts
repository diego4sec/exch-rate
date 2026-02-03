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
