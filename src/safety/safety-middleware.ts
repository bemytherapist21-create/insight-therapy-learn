/**
 * Safety Middleware for AI Conversations
 * Intercepts and validates all messages before/after AI processing
 */

import { crisisDetector } from './crisis-detector';
import { guardianClient } from './guardian-client';

export interface SafetyContext {
  userId: string;
  sessionId: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface SafetyResult {
  allowed: boolean;
  modifiedMessage?: string;
  warning?: string;
  emergencyAction?: 'block' | 'intervene' | 'monitor';
}

class SafetyMiddleware {
  /**
   * Pre-process user message before sending to AI
   */
  async beforeAI(message: string, context: SafetyContext): Promise<SafetyResult> {
    // Detect crisis signals
    const detection = await crisisDetector.detectCrisis(message, context.userId, context.sessionId);

    if (detection.isEmergency) {
      return {
        allowed: false,
        warning: detection.interventionMessage,
        emergencyAction: 'intervene',
      };
    }

    if (detection.shouldIntervene) {
      return {
        allowed: true,
        warning: detection.interventionMessage,
        emergencyAction: 'monitor',
      };
    }

    return { allowed: true };
  }

  /**
   * Post-process AI response before showing to user
   */
  async afterAI(aiResponse: string, userMessage: string, context: SafetyContext): Promise<SafetyResult> {
    // Validate AI response for harmful content
    const validation = await guardianClient.validateAIResponse(aiResponse, userMessage);

    if (!validation.safe) {
      return {
        allowed: false,
        warning: 'AI response blocked for safety reasons',
        modifiedMessage: "I want to respond thoughtfully to what you've shared. Let me rephrase that in a more helpful way.",
        emergencyAction: 'block',
      };
    }

    // Check if AI is attempting to provide medical advice (prohibited)
    if (this.containsMedicalAdvice(aiResponse)) {
      return {
        allowed: false,
        modifiedMessage: "I'm here to provide emotional support, but I can't give medical advice. Please consult with a licensed healthcare provider for medical concerns.",
        emergencyAction: 'block',
      };
    }

    return { allowed: true };
  }

  /**
   * Detect if AI is providing medical advice
   */
  private containsMedicalAdvice(response: string): boolean {
    const medicalPatterns = [
      /(?:you should|i recommend|take)\s+(?:medication|medicine|pills|drugs)/i,
      /(?:diagnose|diagnosis)\s+(?:you|with)/i,
      /(?:stop taking|increase|decrease)\s+your\s+(?:medication|dose)/i,
      /(?:prescribe|prescription)/i,
    ];

    return medicalPatterns.some(pattern => pattern.test(response));
  }

  /**
   * Monitor session for cumulative risk factors
   */
  async monitorSession(context: SafetyContext): Promise<{ riskLevel: number; shouldAlert: boolean }> {
    const recentMessages = context.conversationHistory.slice(-10);
    const userMessages = recentMessages.filter(m => m.role === 'user').map(m => m.content);

    const signals = [];
    for (const msg of userMessages) {
      const detection = await crisisDetector.detectCrisis(msg, context.userId, context.sessionId);
      signals.push(...detection.signals);
    }

    const riskLevel = crisisDetector.calculateSessionRisk(signals);
    const shouldAlert = riskLevel > 0.6; // Alert at 60% risk

    return { riskLevel, shouldAlert };
  }
}

export const safetyMiddleware = new SafetyMiddleware();
