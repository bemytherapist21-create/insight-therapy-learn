/**
 * Real-time Crisis Detection System
 * Monitors conversations for immediate safety concerns
 */

import { guardianClient, CrisisSignal } from './guardian-client';

export interface DetectionResult {
  isEmergency: boolean;
  signals: CrisisSignal[];
  shouldIntervene: boolean;
  interventionMessage?: string;
}

class CrisisDetector {
  // Keywords indicating immediate danger (high precision)
  private criticalKeywords = [
    'kill myself',
    'end my life',
    'suicide plan',
    'want to die',
    'better off dead',
    'no reason to live',
    'goodbye forever',
    'final goodbye',
  ];

  // Context patterns suggesting elevated risk
  private riskPatterns = [
    /(?:feeling|felt)\s+(?:hopeless|worthless|trapped)/i,
    /(?:can't|cannot)\s+(?:go on|take it|continue)/i,
    /(?:no one|nobody)\s+(?:cares|would miss me|would notice)/i,
    /(?:burden|weight)\s+on\s+(?:everyone|others)/i,
  ];

  /**
   * Perform real-time detection on user message
   */
  async detectCrisis(message: string, userId: string, sessionId: string): Promise<DetectionResult> {
    const messageLower = message.toLowerCase();
    const signals: CrisisSignal[] = [];

    // Check critical keywords (immediate danger)
    const hasCriticalKeyword = this.criticalKeywords.some(keyword => 
      messageLower.includes(keyword)
    );

    if (hasCriticalKeyword) {
      signals.push({
        severity: 'critical',
        type: 'suicidal_ideation',
        confidence: 0.95,
        triggers: this.criticalKeywords.filter(kw => messageLower.includes(kw)),
        timestamp: new Date(),
        messageId: `${sessionId}-${Date.now()}`,
      });
    }

    // Check risk patterns
    const matchedPatterns = this.riskPatterns.filter(pattern => pattern.test(message));
    if (matchedPatterns.length > 0) {
      signals.push({
        severity: hasCriticalKeyword ? 'critical' : 'high',
        type: 'suicidal_ideation',
        confidence: 0.75,
        triggers: ['contextual_risk_pattern'],
        timestamp: new Date(),
        messageId: `${sessionId}-${Date.now()}`,
      });
    }

    // Call Guardian AI for deep analysis
    const guardianResult = await guardianClient.analyzeMessage(message, userId, sessionId);
    signals.push(...guardianResult.signals);

    // Determine if intervention needed
    const isEmergency = signals.some(s => s.severity === 'critical');
    const shouldIntervene = isEmergency || guardianResult.interventionRequired;

    // Log crisis event if detected
    if (shouldIntervene && signals.length > 0) {
      await guardianClient.logCrisisEvent(sessionId, userId, signals[0], 'intervention_triggered');
    }

    return {
      isEmergency,
      signals,
      shouldIntervene,
      interventionMessage: shouldIntervene ? this.getInterventionMessage(signals[0]?.severity) : undefined,
    };
  }

  /**
   * Generate appropriate intervention message based on severity
   */
  private getInterventionMessage(severity?: string): string {
    if (severity === 'critical') {
      return `I'm deeply concerned about what you're sharing. Your safety is the top priority right now. Please reach out to a crisis counselor immediately at 988 (US) or your local emergency number. I'm here, but you need immediate human support.`;
    }

    return `I notice you're going through a really difficult time. While I'm here to support you, I want to make sure you have access to immediate help if you need it. Would you like me to share some crisis resources with you?`;
  }

  /**
   * Get real-time risk score for session
   */
  calculateSessionRisk(signals: CrisisSignal[]): number {
    if (signals.length === 0) return 0;

    const severityWeights = {
      critical: 1.0,
      high: 0.7,
      medium: 0.4,
      low: 0.2,
    };

    const totalScore = signals.reduce((sum, signal) => {
      const weight = severityWeights[signal.severity];
      return sum + (weight * signal.confidence);
    }, 0);

    return Math.min(totalScore / signals.length, 1.0);
  }
}

export const crisisDetector = new CrisisDetector();
