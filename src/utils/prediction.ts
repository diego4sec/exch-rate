import type { ExchangeRate } from '../services/api';

export const calculateTrend = (data: ExchangeRate[]): 'UP' | 'DOWN' | 'STABLE' => {
    if (data.length < 2) return 'STABLE';

    // Simple linear regression
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    data.forEach((point, index) => {
        sumX += index;
        sumY += point.rate;
        sumXY += index * point.rate;
        sumXX += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    if (slope > 0.001) return 'UP';
    if (slope < -0.001) return 'DOWN';
    return 'STABLE';
};
