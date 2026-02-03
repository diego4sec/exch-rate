import React from 'react';

interface StatsOverviewProps {
    days: number;
    dataPoints: number;
    label?: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ days, dataPoints, label }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">{label ? `${label} Stats` : 'Stats Overview'}</h3>
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
                    <span className="font-mono">{dataPoints}</span>
                </div>
                <div className="flex justify-between font-medium text-white pt-1">
                    <span>Status</span>
                    <span className="text-green-400">Live</span>
                </div>
            </div>
        </div>
    );
};
