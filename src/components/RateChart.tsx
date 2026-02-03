import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface LineConfig {
    key: string;
    color: string;
    name?: string;
}

interface RateChartProps {
    data: any[];
    lines?: LineConfig[];
}

export const RateChart: React.FC<RateChartProps> = ({ data, lines }) => {
    // Backwards compatibility or default if no lines provided
    const activeLines = lines || [{ key: 'rate', color: '#8884d8' }];

    return (
        <div className="w-full h-[400px] p-4 bg-gray-800 rounded-lg shadow-lg">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(str) => format(parseISO(str), 'MMM d')}
                        stroke="#888"
                    />
                    <YAxis domain={['auto', 'auto']} stroke="#888" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#333', borderColor: '#444' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#ccc' }}
                        labelFormatter={(label) => format(parseISO(label), 'MMM d, yyyy')}
                    />
                    {activeLines.map((line) => (
                        <Line
                            key={line.key}
                            type="monotone"
                            dataKey={line.key}
                            stroke={line.color}
                            name={line.name || line.key}
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
