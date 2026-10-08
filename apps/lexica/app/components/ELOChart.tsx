'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PeriodSelector from './PeriodSelector';

interface ELOChartProps {
    studyHistory: Record<string, { swipes: number; correct: number; wrong: number; eloChange: number }>;
    currentElo: number;
}

type Period = '7D' | '1M' | '3M';

export default function ELOChart({ studyHistory, currentElo }: ELOChartProps) {
    const [period, setPeriod] = useState<Period>('1M');

    // Generate data based on selected period
    const generateChartData = () => {
        const dates = Object.keys(studyHistory).sort();

        // Determine number of days based on period
        const numDays = period === '7D' ? 7 : period === '1M' ? 30 : 90;
        const lastDates = dates.slice(-numDays);

        if (lastDates.length === 0) {
            return [];
        }

        // Calculate cumulative ELO
        let currentCalculatedElo = currentElo;

        // Work backwards from current ELO to get historical values
        for (let i = lastDates.length - 1; i >= 0; i--) {
            const date = lastDates[i];
            if (i < lastDates.length - 1) {
                // Subtract eloChange to get previous ELO
                currentCalculatedElo -= studyHistory[date].eloChange;
            }
        }

        // Now build forward with cumulative sum
        const data = [];
        let elo = currentCalculatedElo;

        for (const date of lastDates) {
            elo += studyHistory[date].eloChange;
            const dateObj = new Date(date + 'T00:00:00');
            const shortDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

            data.push({
                date: shortDate,
                fullDate: date,
                elo: Math.round(elo),
            });
        }

        return data;
    };

    const data = generateChartData();

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center py-16 text-muted">
                <p className="text-sm">Chưa có dữ liệu ELO</p>
            </div>
        );
    }

    const minElo = Math.min(...data.map(d => d.elo));
    const maxElo = Math.max(...data.map(d => d.elo));
    const yAxisMin = Math.floor((minElo - 50) / 50) * 50;
    const yAxisMax = Math.ceil((maxElo + 50) / 50) * 50;

    const periodOptions = [
        { label: '7 ngày', value: '7D' },
        { label: '1 tháng', value: '1M' },
        { label: '3 tháng', value: '3M' },
    ];

    return (
        <div>
            <div className="mb-4 flex justify-end">
                <PeriodSelector id="elo" periods={periodOptions} selected={period} onChange={(value) => setPeriod(value as Period)} />
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="eloGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#C6F432" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#C6F432" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#26282D" opacity={0.3} />
                    <XAxis
                        dataKey="date"
                        stroke="#6B6E75"
                        tick={{ fill: '#6B6E75', fontSize: 11 }}
                        tickLine={{ stroke: '#34373D' }}
                    />
                    <YAxis
                        stroke="#6B6E75"
                        tick={{ fill: '#6B6E75', fontSize: 11 }}
                        tickLine={{ stroke: '#34373D' }}
                        domain={[yAxisMin, yAxisMax]}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#16171A',
                            border: '1px solid #26282D',
                            borderRadius: '8px',
                            fontSize: '12px',
                        }}
                        labelStyle={{ color: '#EDEEF0', fontWeight: 'bold' }}
                        itemStyle={{ color: '#C6F432' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="elo"
                        stroke="#C6F432"
                        strokeWidth={2}
                        dot={{ fill: '#C6F432', r: 3 }}
                        activeDot={{ r: 5, fill: '#C6F432' }}
                        fill="url(#eloGradient)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
