import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface MarketPredictionProps {
    trend: 'UP' | 'DOWN' | 'STABLE';
    days: number;
    label?: string;
}

export const MarketPrediction: React.FC<MarketPredictionProps> = ({ trend, days, label }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-500" />

            <h3 className="text-xl font-semibold mb-4 relative z-10 flex items-center gap-2">
                {label ? `${label} Prediction` : 'Market Prediction'}
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
                Based on the linear trend analysis of the last {days} days, the {label || 'exchange'} rate shows a
                {trend === 'UP' ? ' positive' : trend === 'DOWN' ? ' negative' : ' neutral'} tendency.
            </p>
        </div>
    );
};
