/**
 * Safety Middleware
 * Intercepts all AI interactions for safety checks
 */

import { guardianClient, SafetyCheckResult } from './guardian-client';
import { CrisisDetector } from './crisis-detector';
import { toast } from 'sonner';

export class SafetyMiddleware {
  /**
   * Pre-process user message before AI
   */
  static async beforeAI(message: string): Promise<{
    allowed: boolean;
    safetyResult: SafetyCheckResult;
    modifiedMessage?: string;
  }> {
    // Local crisis detection (fast)
    const localCheck = CrisisDetector.detectCrisisSignals(message);

    // Remote comprehensive check (thorough)
    const remoteCheck = await guardianClient.checkMessageSafety(message);

    // If critical risk detected
    if (localCheck.severity === 'critical' || remoteCheck.riskLevel === 'critical') {
      await guardianClient.logSafetyEvent({
        type: 'crisis_detected',
        severity: 'critical',
        details: { localCheck, remoteCheck },
      });

      return {
        allowed: false,
        safetyResult: remoteCheck,
      };
    }

    // If high risk, allow but flag
    if (localCheck.severity === 'high' || remoteCheck.riskLevel === 'danger') {
      await guardianClient.logSafetyEvent({
        type: 'crisis_detected',
        severity: 'high',
        details: { localCheck, remoteCheck },
      });

      toast.warning('We noticed you might be struggling. Help is available 24/7.');
    }

    return {
      allowed: true,
      safetyResult: remoteCheck,
      modifiedMessage: message,
    };
  }

  /**
   * Post-process AI response before showing to user
   */
  static async afterAI(response: string): Promise<{
    allowed: boolean;
    safetyResult: SafetyCheckResult;
    modifiedResponse?: string;
  }> {
    const validation = await guardianClient.validateAIResponse(response);

    // Check for harmful AI responses
    const harmfulPatterns = [
      'you should kill yourself',
      'end your life',
      'better off dead',
      'no hope',
    ];

    const containsHarmful = harmfulPatterns.some(pattern =>
      response.toLowerCase().includes(pattern)
    );

    if (containsHarmful || !validation.isSafe) {
      console.error('Unsafe AI response blocked:', response);
      await guardianClient.logSafetyEvent({
        type: 'intervention_triggered',
        severity: 'critical',
        details: { response, validation },
      });

      return {
        allowed: false,
        safetyResult: validation,
        modifiedResponse:
          "I'm not able to provide an appropriate response right now. Please reach out to a crisis helpline immediately if you're in distress.",
      };
    }

    return {
      allowed: true,
      safetyResult: validation,
      modifiedResponse: response,
    };
  }

  /**
   * Show emergency intervention UI
   */
  static async showEmergencyIntervention(countryCode: string = 'IN'): Promise<void> {
    const contacts = await guardianClient.getEmergencyContacts(countryCode);

    await guardianClient.logSafetyEvent({
      type: 'emergency_contact_shown',
      severity: 'critical',
      details: { contacts, countryCode },
    });

    // This should trigger a modal/dialog in the UI
    return Promise.resolve();
  }
}
