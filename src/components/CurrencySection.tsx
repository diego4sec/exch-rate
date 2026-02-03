import React, { useEffect, useState } from 'react';
import { fetchExchangeRates, type ExchangeRate } from '../services/api';
import { calculateTrend } from '../utils/prediction';
import { RateChart } from './RateChart';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface CurrencySectionProps {
    baseCurrency: string;
    targetCurrency: string;
    days: number;
}

export const CurrencySection: React.FC<CurrencySectionProps> = ({ baseCurrency, targetCurrency, days }) => {
    const [data, setData] = useState<ExchangeRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [trend, setTrend] = useState<'UP' | 'DOWN' | 'STABLE'>('STABLE');
    const [currentRate, setCurrentRate] = useState<number | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const rawData = await fetchExchangeRates(days, baseCurrency);

            // Filter for 2-day interval, ensuring the latest data point is included
            // We filter backwards from the end: (length - 1 - index) % 2 === 0
            const filteredData = rawData.filter((_, index) => (rawData.length - 1 - index) % 2 === 0);

            setData(filteredData);

            if (rawData.length > 0) {
                setTrend(calculateTrend(rawData)); // Calculate trend on full data for accuracy
                setCurrentRate(rawData[rawData.length - 1].rate);
            }

            setLoading(false);
        };

        loadData();
    }, [days, baseCurrency]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        {baseCurrency} to {targetCurrency}
                    </h2>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg flex items-center gap-4">
                    <div>
                        <p className="text-sm text-gray-400">Current Rate</p>
                        <p className="text-2xl font-bold text-white">
                            {loading ? '...' : `₪${currentRate?.toFixed(4)}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-gray-800 rounded-2xl p-1 border border-gray-700 shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                    <h3 className="text-lg font-semibold text-gray-200">{baseCurrency} Trend</h3>
                </div>
                <div className="p-4">
                    {loading ? (
                        <div className="h-[400px] flex items-center justify-center text-gray-500">
                            Loading data...
                        </div>
                    ) : (
                        <RateChart data={data} />
                    )}
                </div>
            </div>

            {/* Prediction Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-500" />

                    <h3 className="text-xl font-semibold mb-4 relative z-10 flex items-center gap-2">
                        Market Prediction
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">AI Estimate</span>
                    </h3>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`
                w-16 h-16 rounded-full flex items-center justify-center shadow-inner
                ${trend === 'UP' ? 'bg-green-500/20 text-green-400' :
                                trend === 'DOWN' ? 'bg-red-500/20 text-red-400' :
                                    'bg-gray-500/20 text-gray-400'}
              `}>
                            {trend === 'UP' && <ArrowUp size={32} />}
                            {trend === 'DOWN' && <ArrowDown size={32} />}
                            {trend === 'STABLE' && <Minus size={32} />}
                        </div>

                        <div>
                            <p className="text-sm text-gray-400">Forecast Direction</p>
                            <p className={`text-2xl font-bold ${trend === 'UP' ? 'text-green-400' :
                                    trend === 'DOWN' ? 'text-red-400' :
                                        'text-gray-400'
                                }`}>
                                {trend === 'UP' ? 'Going Up' :
                                    trend === 'DOWN' ? 'Going Down' :
                                        'Stable'}
                            </p>
                        </div>
                    </div>

                    <p className="mt-4 text-sm text-gray-300 relative z-10">
                        Based on the linear trend analysis of the last {days} days, the exchange rate shows a
                        {trend === 'UP' ? ' positive' : trend === 'DOWN' ? ' negative' : ' neutral'} tendency.
                    </p>
                </div>

                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                    <h3 className="text-xl font-semibold mb-4">Stats Overview</h3>
                    <div className="space-y-3 text-gray-300">
                        <div className="flex justify-between border-b border-gray-700 pb-2">
                            <span>Period</span>
                            <span className="font-mono">Last {days} Days</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-700 pb-2">
                            <span>Interval</span>
                            <span className="font-mono">2 Days</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-700 pb-2">
                            <span>Data Points</span>
                            <span className="font-mono">{data.length}</span>
                        </div>
                        <div className="flex justify-between font-medium text-white pt-1">
                            <span>Status</span>
                            <span className="text-green-400">Live</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
