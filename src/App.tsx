import { useEffect, useState } from 'react';
import { fetchExchangeRates, fetchLatestRate } from './services/api';
import { calculateTrend } from './utils/prediction';
import { RateChart } from './components/RateChart';
import { MarketPrediction } from './components/MarketPrediction';
import { StatsOverview } from './components/StatsOverview';

interface CombinedDataPoint {
  date: string;
  EUR: number;
  USD: number;
  [key: string]: string | number;
}

function App() {
  const [days, setDays] = useState(60);
  const [retryKey, setRetryKey] = useState(0);
  const [data, setData] = useState<CombinedDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // EUR State
  const [eurTrend, setEurTrend] = useState<'UP' | 'DOWN' | 'STABLE'>('STABLE');
  const [eurCurrent, setEurCurrent] = useState<number | null>(null);

  // USD State
  const [usdTrend, setUsdTrend] = useState<'UP' | 'DOWN' | 'STABLE'>('STABLE');
  const [usdCurrent, setUsdCurrent] = useState<number | null>(null);

  const periodOptions = [7, 14, 21, 28, 30, 60, 90, 180, 365];

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch both currencies in parallel
        const [eurData, usdData, latestEur, latestUsd] = await Promise.all([
          fetchExchangeRates(days, 'EUR'),
          fetchExchangeRates(days, 'USD'),
          fetchLatestRate('EUR'),
          fetchLatestRate('USD')
        ]);

        if (!isMounted) return;

        // Helper to append latest rate if it's newer
        const mergeLatest = (history: typeof eurData, latest: typeof latestEur) => {
          if (!latest || history.length === 0) return history;
          const lastDate = history[history.length - 1].date;
          if (latest.date > lastDate) {
            return [...history, latest];
          }
          return history;
        };

        const finalEurData = mergeLatest(eurData, latestEur);
        const finalUsdData = mergeLatest(usdData, latestUsd);

        // Calculate stats for EUR
        if (finalEurData.length > 0) {
          setEurTrend(calculateTrend(finalEurData));
          setEurCurrent(finalEurData[finalEurData.length - 1].rate);
        }

        // Calculate stats for USD
        if (finalUsdData.length > 0) {
          setUsdTrend(calculateTrend(finalUsdData));
          setUsdCurrent(finalUsdData[finalUsdData.length - 1].rate);
        }

        // Merge data — use EUR dates as the source of truth
        const merged: CombinedDataPoint[] = [];
        const usdMap = new Map(finalUsdData.map(d => [d.date, d.rate]));

        finalEurData.forEach(eurPoint => {
          const usdRate = usdMap.get(eurPoint.date);
          if (usdRate !== undefined) {
            merged.push({
              date: eurPoint.date,
              EUR: eurPoint.rate,
              USD: usdRate
            });
          }
        });

        // Filter for 2-day interval, ensuring the latest data point is included
        const filteredData = merged.filter((_, index) => (merged.length - 1 - index) % 2 === 0);

        setData(filteredData);
      } catch {
        if (isMounted) setError('Failed to load exchange rate data. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => { isMounted = false; };
  }, [days, retryKey]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Exchange Rate Compare
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-gray-400">Analysis Period:</span>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                {periodOptions.map((option) => (
                  <option key={option} value={option}>
                    Last {option} Days
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-gray-800 p-3 px-5 rounded-xl border border-gray-700 shadow-lg">
              <p className="text-xs text-gray-400 uppercase tracking-wider">EUR / ILS</p>
              <p className="text-xl font-bold text-blue-400">
                {loading ? '...' : `₪${eurCurrent?.toFixed(4)}`}
              </p>
            </div>
            <div className="bg-gray-800 p-3 px-5 rounded-xl border border-gray-700 shadow-lg">
              <p className="text-xs text-gray-400 uppercase tracking-wider">USD / ILS</p>
              <p className="text-xl font-bold text-green-400">
                {loading ? '...' : `₪${usdCurrent?.toFixed(4)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Combined Chart Section */}
        <div className="bg-gray-800 rounded-2xl p-1 border border-gray-700 shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-200">Combined Trend Analysis</h2>
            <div className="flex gap-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-gray-300">EUR</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-gray-300">USD</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                Loading data...
              </div>
            ) : error ? (
              <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-gray-400">
                <p>{error}</p>
                <button
                  onClick={() => setRetryKey(k => k + 1)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <RateChart
                data={data}
                lines={[
                  { key: 'EUR', color: '#60a5fa', name: 'EUR/ILS' },
                  { key: 'USD', color: '#4ade80', name: 'USD/ILS' }
                ]}
              />
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* EUR Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-blue-400 border-b border-gray-800 pb-2">Euro Analysis</h3>
            <MarketPrediction trend={eurTrend} days={days} label="EUR" />
            <StatsOverview days={days} dataPoints={data.length} label="EUR" />
          </div>

          {/* USD Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-green-400 border-b border-gray-800 pb-2">USD Analysis</h3>
            <MarketPrediction trend={usdTrend} days={days} label="USD" />
            <StatsOverview days={days} dataPoints={data.length} label="USD" />
          </div>

        </div>

      </div>
    </div>
  );
}

export default App;
