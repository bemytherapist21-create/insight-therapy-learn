/**
 * Real-time Crisis Detection
 * Pattern matching and signal detection for suicide risk
 */

export interface CrisisPattern {
  keywords: string[];
  context: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'suicidal_ideation' | 'self_harm' | 'hopelessness' | 'plan' | 'means';
}

export const CRISIS_PATTERNS: CrisisPattern[] = [
  {
    keywords: ['kill myself', 'end my life', 'want to die', 'suicide'],
    context: ['plan', 'tonight', 'today', 'soon'],
    severity: 'critical',
    category: 'suicidal_ideation',
  },
  {
    keywords: ['no reason to live', 'better off dead', 'burden'],
    context: ['family', 'everyone', 'world'],
    severity: 'high',
    category: 'hopelessness',
  },
  {
    keywords: ['cut myself', 'hurt myself', 'self harm'],
    context: ['again', 'tonight', 'want to'],
    severity: 'high',
    category: 'self_harm',
  },
  {
    keywords: ['pills', 'gun', 'rope', 'bridge', 'jump'],
    context: ['have', 'ready', 'found'],
    severity: 'critical',
    category: 'means',
  },
  {
    keywords: ['note', 'goodbye', 'last time'],
    context: ['wrote', 'written', 'saying'],
    severity: 'critical',
    category: 'plan',
  },
];

export class CrisisDetector {
  /**
   * Analyze message for crisis signals
   */
  static detectCrisisSignals(message: string): {
    detected: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical' | 'safe';
    patterns: CrisisPattern[];
    confidence: number;
  } {
    const lowerMessage = message.toLowerCase();
    const detectedPatterns: CrisisPattern[] = [];

    // Check each pattern
    for (const pattern of CRISIS_PATTERNS) {
      const keywordMatch = pattern.keywords.some(kw => lowerMessage.includes(kw));
      const contextMatch = pattern.context.some(ctx => lowerMessage.includes(ctx));

      if (keywordMatch) {
        detectedPatterns.push(pattern);
      }
    }

    if (detectedPatterns.length === 0) {
      return {
        detected: false,
        severity: 'safe',
        patterns: [],
        confidence: 0,
      };
    }

    // Determine highest severity
    const severities = ['low', 'medium', 'high', 'critical'];
    const maxSeverity = detectedPatterns.reduce((max, pattern) => {
      const currentIndex = severities.indexOf(pattern.severity);
      const maxIndex = severities.indexOf(max);
      return currentIndex > maxIndex ? pattern.severity : max;
    }, 'low' as CrisisPattern['severity']);

    // Calculate confidence based on number and severity of matches
    const confidence = Math.min(
      detectedPatterns.length * 0.3 + 
      (severities.indexOf(maxSeverity) + 1) * 0.25,
      1.0
    );

    return {
      detected: true,
      severity: maxSeverity,
      patterns: detectedPatterns,
      confidence,
    };
  }

  /**
   * Analyze conversation history for escalating risk
   */
  static analyzeConversationTrend(messages: string[]): {
    isEscalating: boolean;
    riskTrend: 'increasing' | 'stable' | 'decreasing';
  } {
    const recentScores = messages.slice(-5).map(msg => {
      const result = this.detectCrisisSignals(msg);
      const severityScores = { safe: 0, low: 1, medium: 2, high: 3, critical: 4 };
      return severityScores[result.severity];
    });

    if (recentScores.length < 2) {
      return { isEscalating: false, riskTrend: 'stable' };
    }

    // Check if scores are increasing
    const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2));
    const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 0.5) {
      return { isEscalating: true, riskTrend: 'increasing' };
    } else if (secondAvg < firstAvg - 0.5) {
      return { isEscalating: false, riskTrend: 'decreasing' };
    }

    return { isEscalating: false, riskTrend: 'stable' };
  }
}
