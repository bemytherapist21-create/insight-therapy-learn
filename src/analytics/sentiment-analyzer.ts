/**
 * Real-time Sentiment Analysis
 * Analyzes emotional tone and mood from user messages
 */

import { supabase } from '@/integrations/supabase/client';

export interface SentimentResult {
  score: number; // -1 (negative) to 1 (positive)
  magnitude: number; // Intensity of emotion
  emotions: EmotionScores;
  dominant: EmotionType;
  timestamp: Date;
}

export interface EmotionScores {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  anxiety: number;
  neutral: number;
}

export type EmotionType = keyof EmotionScores;

class SentimentAnalyzer {
  /**
   * Analyze sentiment of message
   */
  async analyze(message: string, userId: string, sessionId: string): Promise<SentimentResult> {
    try {
      // Call Supabase Edge Function for AI-powered sentiment analysis
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: { message, userId, sessionId },
      });

      if (error) throw error;

      const result = data as SentimentResult;
      
      // Store sentiment data for tracking
      await this.storeSentiment(userId, sessionId, result);

      return result;
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      // Return neutral fallback
      return this.getNeutralSentiment();
    }
  }

  /**
   * Analyze voice tone (from audio features)
   */
  async analyzeVoiceTone(audioFeatures: {
    pitch: number;
    energy: number;
    tempo: number;
  }): Promise<Partial<EmotionScores>> {
    // Simple heuristic-based emotion detection from voice features
    const emotions: Partial<EmotionScores> = {};

    // High pitch + high energy = excitement/joy
    if (audioFeatures.pitch > 200 && audioFeatures.energy > 0.7) {
      emotions.joy = 0.8;
    }

    // Low energy + slow tempo = sadness
    if (audioFeatures.energy < 0.3 && audioFeatures.tempo < 80) {
      emotions.sadness = 0.7;
    }

    // High energy + fast tempo = anxiety/anger
    if (audioFeatures.energy > 0.8 && audioFeatures.tempo > 140) {
      emotions.anxiety = 0.6;
      emotions.anger = 0.5;
    }

    return emotions;
  }

  /**
   * Get sentiment trend over time
   */
  async getSentimentTrend(userId: string, days: number = 7): Promise<SentimentResult[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const { data, error } = await supabase
        .from('sentiment_history')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return data as SentimentResult[];
    } catch (error) {
      console.error('Failed to fetch sentiment trend:', error);
      return [];
    }
  }

  /**
   * Calculate mood improvement score
   */
  calculateMoodImprovement(history: SentimentResult[]): number {
    if (history.length < 2) return 0;

    const recent = history.slice(-3); // Last 3 sessions
    const earlier = history.slice(0, 3); // First 3 sessions

    const recentAvg = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, r) => sum + r.score, 0) / earlier.length;

    return ((recentAvg - earlierAvg) / 2) * 100; // Percentage improvement
  }

  /**
   * Store sentiment data
   */
  private async storeSentiment(
    userId: string,
    sessionId: string,
    sentiment: SentimentResult
  ): Promise<void> {
    try {
      await supabase.from('sentiment_history').insert({
        user_id: userId,
        session_id: sessionId,
        score: sentiment.score,
        magnitude: sentiment.magnitude,
        emotions: sentiment.emotions,
        dominant_emotion: sentiment.dominant,
        timestamp: sentiment.timestamp.toISOString(),
      });
    } catch (error) {
      console.error('Failed to store sentiment:', error);
    }
  }

  /**
   * Get neutral sentiment fallback
   */
  private getNeutralSentiment(): SentimentResult {
    return {
      score: 0,
      magnitude: 0.5,
      emotions: {
        joy: 0.16,
        sadness: 0.16,
        anger: 0.16,
        fear: 0.16,
        anxiety: 0.16,
        neutral: 0.2,
      },
      dominant: 'neutral',
      timestamp: new Date(),
    };
  }
}

export const sentimentAnalyzer = new SentimentAnalyzer();
