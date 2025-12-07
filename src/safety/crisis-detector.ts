/**
 * Crisis Detection System
 * Real-time monitoring for suicide risk and mental health emergencies
 */

import { GuardianClient, SafetyCheckResult } from './guardian-client';

export interface CrisisSignal {
  detected: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
  confidence: number;
  timestamp: string;
}

export class CrisisDetector {
  private guardianClient: GuardianClient;
  private readonly CRISIS_KEYWORDS = [
    // Suicide-related
    'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
    'no reason to live', 'self-harm', 'cut myself', 'overdose',
    // Self-harm
    'hurt myself', 'harm myself', 'cutting', 'burning myself',
    // Hopelessness
    'no hope', 'hopeless', 'nothing matters', 'give up', 'can\'t go on',
    // Plans
    'goodbye', 'final message', 'won\'t be around', 'plan to', 'method to'
  ];

  private readonly CONTEXT_KEYWORDS = [
    'depression', 'anxiety', 'panic', 'worthless', 'burden',
    'alone', 'isolated', 'helpless', 'trapped'
  ];

  constructor(guardianClient: GuardianClient) {
    this.guardianClient = guardianClient;
  }

  /**
   * Detect crisis signals in message
   */
  async detectCrisis(message: string): Promise<CrisisSignal> {
    const normalizedMessage = message.toLowerCase();
    const detectedKeywords: string[] = [];
    let severity: CrisisSignal['severity'] = 'low';

    // Check for critical keywords
    for (const keyword of this.CRISIS_KEYWORDS) {
      if (normalizedMessage.includes(keyword)) {
        detectedKeywords.push(keyword);
      }
    }

    // Determine severity
    if (detectedKeywords.length > 0) {
      if (detectedKeywords.some(k => 
        ['suicide', 'kill myself', 'end my life', 'overdose'].includes(k)
      )) {
        severity = 'critical';
      } else if (detectedKeywords.length >= 3) {
        severity = 'high';
      } else if (detectedKeywords.length >= 2) {
        severity = 'medium';
      }
    }

    // Verify with Guardian AI
    const safetyCheck = await this.guardianClient.checkMessageSafety(message);
    
    // Adjust severity based on AI analysis
    if (safetyCheck.riskLevel === 'critical') {
      severity = 'critical';
    } else if (safetyCheck.riskLevel === 'high' && severity !== 'critical') {
      severity = 'high';
    }

    const detected = detectedKeywords.length > 0 || safetyCheck.riskLevel !== 'none';

    // Log if crisis detected
    if (detected) {
      await this.guardianClient.logSafetyEvent({
        type: 'crisis_detected',
        severity,
        details: {
          keywords: detectedKeywords,
          aiRiskLevel: safetyCheck.riskLevel,
          message: message.substring(0, 100) // Log snippet only
        }
      });
    }

    return {
      detected,
      severity,
      keywords: detectedKeywords,
      confidence: this.calculateConfidence(detectedKeywords, safetyCheck),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Monitor conversation for escalating risk
   */
  async monitorConversation(messages: string[]): Promise<CrisisSignal> {
    let maxSeverity: CrisisSignal['severity'] = 'low';
    const allKeywords = new Set<string>();
    
    for (const message of messages) {
      const signal = await this.detectCrisis(message);
      if (signal.detected) {
        signal.keywords.forEach(k => allKeywords.add(k));
        if (this.compareSeverity(signal.severity, maxSeverity) > 0) {
          maxSeverity = signal.severity;
        }
      }
    }

    return {
      detected: allKeywords.size > 0,
      severity: maxSeverity,
      keywords: Array.from(allKeywords),
      confidence: allKeywords.size > 0 ? 0.8 : 0.0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    keywords: string[],
    safetyCheck: SafetyCheckResult
  ): number {
    let confidence = 0;

    // Keyword-based confidence
    if (keywords.length > 0) {
      confidence += Math.min(keywords.length * 0.15, 0.5);
    }

    // AI-based confidence
    const riskLevels = { none: 0, low: 0.2, medium: 0.4, high: 0.7, critical: 1.0 };
    confidence += riskLevels[safetyCheck.riskLevel] * 0.5;

    return Math.min(confidence, 1.0);
  }

  /**
   * Compare severity levels
   */
  private compareSeverity(
    a: CrisisSignal['severity'],
    b: CrisisSignal['severity']
  ): number {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[a] - levels[b];
  }
}
