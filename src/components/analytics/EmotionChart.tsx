/**
 * Emotion Visualization Chart
 * Real-time display of user's emotional state
 */

import { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { EmotionScores } from '@/analytics/sentiment-analyzer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmotionChartProps {
  emotions: EmotionScores;
  title?: string;
}

export function EmotionChart({ emotions, title = 'Current Emotional State' }: EmotionChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const data = [
      { emotion: 'Joy', value: emotions.joy * 100 },
      { emotion: 'Sadness', value: emotions.sadness * 100 },
      { emotion: 'Anger', value: emotions.anger * 100 },
      { emotion: 'Fear', value: emotions.fear * 100 },
      { emotion: 'Anxiety', value: emotions.anxiety * 100 },
      { emotion: 'Neutral', value: emotions.neutral * 100 },
    ];
    setChartData(data);
  }, [emotions]);

  const getDominantEmotion = (): string => {
    const entries = Object.entries(emotions) as [keyof EmotionScores, number][];
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return sorted[0][0].charAt(0).toUpperCase() + sorted[0][0].slice(1);
  };

  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      joy: '#10b981',
      sadness: '#3b82f6',
      anger: '#ef4444',
      fear: '#8b5cf6',
      anxiety: '#f59e0b',
      neutral: '#6b7280',
    };
    return colors[emotion.toLowerCase()] || '#6b7280';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-gray-600">
          Dominant: <span className="font-semibold">{getDominantEmotion()}</span>
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="emotion" />
            <Radar
              name="Intensity"
              dataKey="value"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {chartData.map((item) => (
            <div key={item.emotion} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getEmotionColor(item.emotion) }}
              />
              <span className="text-sm">
                {item.emotion}: {item.value.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
