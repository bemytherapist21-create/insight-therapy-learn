/**
 * Mood Tracking System
 * Longitudinal tracking of user emotional states
 */

import { sentimentAnalyzer, SentimentResult } from './sentiment-analyzer';

export interface MoodEntry {
  date: Date;
  overallMood: number; // 1-10 scale
  sentimentScore: number;
  dominantEmotion: string;
  sessionDuration: number; // minutes
  notes?: string;
}

export interface MoodInsights {
  averageMood: number;
  trend: 'improving' | 'declining' | 'stable';
  bestDay: Date;
  worstDay: Date;
  emotionalRange: number;
  consistencyScore: number;
}

class MoodTracker {
  /**
   * Calculate mood insights from history
   */
  async getInsights(userId: string, days: number = 30): Promise<MoodInsights> {
    const history = await sentimentAnalyzer.getSentimentTrend(userId, days);

    if (history.length === 0) {
      return this.getDefaultInsights();
    }

    const scores = history.map(h => h.score);
    const averageMood = this.calculateAverage(scores);
    const trend = this.calculateTrend(scores);
    const emotionalRange = Math.max(...scores) - Math.min(...scores);
    const consistencyScore = this.calculateConsistency(scores);

    const sortedByScore = [...history].sort((a, b) => b.score - a.score);
    const bestDay = sortedByScore[0]?.timestamp || new Date();
    const worstDay = sortedByScore[sortedByScore.length - 1]?.timestamp || new Date();

    return {
      averageMood,
      trend,
      bestDay,
      worstDay,
      emotionalRange,
      consistencyScore,
    };
  }

  /**
   * Get mood patterns (what time of day, day of week)
   */
  async getPatterns(userId: string): Promise<{
    bestTimeOfDay: string;
    bestDayOfWeek: string;
    worstTimeOfDay: string;
    worstDayOfWeek: string;
  }> {
    const history = await sentimentAnalyzer.getSentimentTrend(userId, 90);

    const timePatterns = this.analyzeTimePatterns(history);
    const dayPatterns = this.analyzeDayPatterns(history);

    return {
      bestTimeOfDay: timePatterns.best,
      worstTimeOfDay: timePatterns.worst,
      bestDayOfWeek: dayPatterns.best,
      worstDayOfWeek: dayPatterns.worst,
    };
  }

  /**
   * Export mood data for user download
   */
  async exportData(userId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    const history = await sentimentAnalyzer.getSentimentTrend(userId, 365);

    if (format === 'json') {
      return JSON.stringify(history, null, 2);
    }

    // CSV format
    const headers = ['date', 'score', 'dominant_emotion', 'magnitude'];
    const rows = history.map(h => [
      h.timestamp.toISOString(),
      h.score,
      h.dominant,
      h.magnitude,
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
  }

  private calculateAverage(scores: number[]): number {
    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
  }

  private calculateTrend(scores: number[]): 'improving' | 'declining' | 'stable' {
    if (scores.length < 5) return 'stable';

    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));

    const firstAvg = this.calculateAverage(firstHalf);
    const secondAvg = this.calculateAverage(secondHalf);

    const diff = secondAvg - firstAvg;

    if (diff > 0.1) return 'improving';
    if (diff < -0.1) return 'declining';
    return 'stable';
  }

  private calculateConsistency(scores: number[]): number {
    const avg = this.calculateAverage(scores);
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    return Math.max(0, 1 - stdDev);
  }

  private analyzeTimePatterns(history: SentimentResult[]): { best: string; worst: string } {
    const timeGroups: Record<string, number[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      night: [],
    };

    history.forEach(h => {
      const hour = h.timestamp.getHours();
      if (hour >= 6 && hour < 12) timeGroups.morning.push(h.score);
      else if (hour >= 12 && hour < 17) timeGroups.afternoon.push(h.score);
      else if (hour >= 17 && hour < 22) timeGroups.evening.push(h.score);
      else timeGroups.night.push(h.score);
    });

    const averages = Object.entries(timeGroups).map(([time, scores]) => ({
      time,
      avg: scores.length > 0 ? this.calculateAverage(scores) : 0,
    }));

    averages.sort((a, b) => b.avg - a.avg);

    return {
      best: averages[0]?.time || 'morning',
      worst: averages[averages.length - 1]?.time || 'night',
    };
  }

  private analyzeDayPatterns(history: SentimentResult[]): { best: string; worst: string } {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayGroups: Record<string, number[]> = {};

    history.forEach(h => {
      const day = days[h.timestamp.getDay()];
      if (!dayGroups[day]) dayGroups[day] = [];
      dayGroups[day].push(h.score);
    });

    const averages = Object.entries(dayGroups).map(([day, scores]) => ({
      day,
      avg: this.calculateAverage(scores),
    }));

    averages.sort((a, b) => b.avg - a.avg);

    return {
      best: averages[0]?.day || 'Saturday',
      worst: averages[averages.length - 1]?.day || 'Monday',
    };
  }

  private getDefaultInsights(): MoodInsights {
    return {
      averageMood: 5,
      trend: 'stable',
      bestDay: new Date(),
      worstDay: new Date(),
      emotionalRange: 0,
      consistencyScore: 0.5,
    };
  }
}

export const moodTracker = new MoodTracker();
