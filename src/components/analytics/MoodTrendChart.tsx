/**
 * Mood Trend Chart
 * Shows mood changes over time
 */

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SentimentResult } from '@/analytics/sentiment-analyzer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MoodTrendChartProps {
  history: SentimentResult[];
  days?: number;
}

export function MoodTrendChart({ history, days = 7 }: MoodTrendChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    if (history.length === 0) return;

    // Format data for chart
    const data = history.map((h) => ({
      date: new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: ((h.score + 1) / 2) * 10, // Convert -1 to 1 scale to 0-10
      timestamp: h.timestamp,
    }));

    setChartData(data);

    // Calculate trend
    if (data.length >= 2) {
      const firstHalf = data.slice(0, Math.floor(data.length / 2));
      const secondHalf = data.slice(Math.floor(data.length / 2));

      const firstAvg = firstHalf.reduce((sum, d) => sum + d.mood, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, d) => sum + d.mood, 0) / secondHalf.length;

      if (secondAvg > firstAvg + 0.5) setTrend('up');
      else if (secondAvg < firstAvg - 0.5) setTrend('down');
      else setTrend('stable');
    }
  }, [history]);

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getTrendText = () => {
    if (trend === 'up') return 'Mood improving';
    if (trend === 'down') return 'Mood declining';
    return 'Mood stable';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Mood Trend (Last {days} Days)</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            {getTrendIcon()}
            <span className="font-medium">{getTrendText()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 shadow-lg rounded border">
                        <p className="text-sm font-medium">{payload[0].payload.date}</p>
                        <p className="text-sm text-gray-600">
                          Mood: {payload[0].value?.toFixed(1)}/10
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-gray-500">
            <p>No mood data available yet. Start a session to begin tracking!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
