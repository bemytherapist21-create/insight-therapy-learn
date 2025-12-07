/**
 * Sentiment & Emotion Analysis
 * Real-time emotion detection from text
 */

import { supabase } from '@/integrations/supabase/client';

export interface EmotionScore {
  emotion: string;
  score: number;
  intensity: 'low' | 'medium' | 'high';
}

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative';
  score: number; // -1 to 1
  emotions: EmotionScore[];
  dominantEmotion: string;
  timestamp: string;
}

// Emotion lexicon for basic analysis
const EMOTION_KEYWORDS = {
  joy: ['happy', 'excited', 'joyful', 'delighted', 'cheerful', 'glad'],
  sadness: ['sad', 'depressed', 'unhappy', 'miserable', 'sorrowful', 'gloomy'],
  anxiety: ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'uneasy'],
  anger: ['angry', 'furious', 'mad', 'irritated', 'frustrated', 'annoyed'],
  fear: ['afraid', 'scared', 'frightened', 'terrified', 'panicked'],
  hope: ['hopeful', 'optimistic', 'encouraged', 'positive', 'confident'],
  shame: ['ashamed', 'guilty', 'embarrassed', 'humiliated'],
  disgust: ['disgusted', 'repulsed', 'revolted'],
};

export class SentimentAnalyzer {
  /**
   * Analyze text for emotions and sentiment
   */
  static analyze(text: string): SentimentAnalysis {
    const lowerText = text.toLowerCase();
    const emotions: EmotionScore[] = [];

    // Calculate emotion scores
    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          score += 1;
        }
      }

      if (score > 0) {
        const normalizedScore = Math.min(score / 3, 1.0);
        emotions.push({
          emotion,
          score: normalizedScore,
          intensity: normalizedScore > 0.7 ? 'high' : normalizedScore > 0.4 ? 'medium' : 'low',
        });
      }
    }

    // Calculate overall sentiment
    const positiveScore =
      (emotions.find((e) => e.emotion === 'joy')?.score || 0) +
      (emotions.find((e) => e.emotion === 'hope')?.score || 0);
    const negativeScore =
      (emotions.find((e) => e.emotion === 'sadness')?.score || 0) +
      (emotions.find((e) => e.emotion === 'anxiety')?.score || 0) +
      (emotions.find((e) => e.emotion === 'anger')?.score || 0) +
      (emotions.find((e) => e.emotion === 'fear')?.score || 0);

    const overallScore = (positiveScore - negativeScore) / Math.max(positiveScore + negativeScore, 1);
    const overall: 'positive' | 'neutral' | 'negative' =
      overallScore > 0.2 ? 'positive' : overallScore < -0.2 ? 'negative' : 'neutral';

    // Find dominant emotion
    const dominantEmotion =
      emotions.length > 0
        ? emotions.reduce((prev, current) => (current.score > prev.score ? current : prev)).emotion
        : 'neutral';

    return {
      overall,
      score: overallScore,
      emotions,
      dominantEmotion,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Save analysis to database for tracking
   */
  static async saveAnalysis(sessionId: string, analysis: SentimentAnalysis): Promise<void> {
    try {
      await supabase.from('emotion_analytics').insert({
        session_id: sessionId,
        sentiment: analysis.overall,
        sentiment_score: analysis.score,
        emotions: analysis.emotions,
        dominant_emotion: analysis.dominantEmotion,
        timestamp: analysis.timestamp,
      });
    } catch (error) {
      console.error('Failed to save emotion analysis:', error);
    }
  }

  /**
   * Get emotion trend over time
   */
  static async getEmotionTrend(sessionId: string): Promise<SentimentAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from('emotion_analytics')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return data.map((row) => ({
        overall: row.sentiment,
        score: row.sentiment_score,
        emotions: row.emotions,
        dominantEmotion: row.dominant_emotion,
        timestamp: row.timestamp,
      }));
    } catch (error) {
      console.error('Failed to fetch emotion trend:', error);
      return [];
    }
  }
}
