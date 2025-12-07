/**
 * Safety Middleware
 * Intercepts all AI interactions for safety validation
 */

import { GuardianClient, SafetyCheckResult, ConversationMessage } from './guardian-client';
import { CrisisDetector, CrisisSignal } from './crisis-detector';
import { toast } from 'sonner';

export interface SafetyContext {
  sessionId: string;
  userId: string;
  conversationHistory: ConversationMessage[];
}

export class SafetyMiddleware {
  private guardian: GuardianClient;
  private crisisDetector: CrisisDetector;
  private context: SafetyContext;

  constructor(context: SafetyContext) {
    this.context = context;
    this.guardian = new GuardianClient(context.sessionId, context.userId);
    this.crisisDetector = new CrisisDetector(this.guardian);
  }

  /**
   * Process user message before sending to AI
   */
  async processUserMessage(message: string): Promise<{
    approved: boolean;
    crisisDetected: boolean;
    interventionRequired: boolean;
    safetyResult: SafetyCheckResult;
    crisisSignal: CrisisSignal;
  }> {
    // Step 1: Crisis detection
    const crisisSignal = await this.crisisDetector.detectCrisis(message);

    // Step 2: Safety check
    const safetyResult = await this.guardian.checkMessageSafety(message);

    // Step 3: Determine intervention
    const interventionRequired = 
      crisisSignal.severity === 'critical' || 
      crisisSignal.severity === 'high' ||
      safetyResult.interventionRequired;

    if (interventionRequired) {
      await this.triggerIntervention(crisisSignal, safetyResult);
    }

    return {
      approved: !interventionRequired || crisisSignal.severity !== 'critical',
      crisisDetected: crisisSignal.detected,
      interventionRequired,
      safetyResult,
      crisisSignal
    };
  }

  /**
   * Validate AI response before showing to user
   */
  async validateAIResponse(response: string): Promise<{
    approved: boolean;
    modifiedResponse?: string;
    safetyResult: SafetyCheckResult;
  }> {
    const safetyResult = await this.guardian.validateResponse(
      response,
      this.context.conversationHistory
    );

    if (!safetyResult.isSafe) {
      // Log unsafe response
      await this.guardian.logSafetyEvent({
        type: 'unsafe_ai_response',
        severity: 'high',
        details: {
          response: response.substring(0, 200),
          triggers: safetyResult.triggers
        }
      });

      // Return safe fallback response
      return {
        approved: false,
        modifiedResponse: this.getSafeFallbackResponse(),
        safetyResult
      };
    }

    return {
      approved: true,
      safetyResult
    };
  }

  /**
   * Monitor entire conversation for risk escalation
   */
  async monitorSession(): Promise<CrisisSignal> {
    const messages = this.context.conversationHistory.map(m => m.content);
    return await this.crisisDetector.monitorConversation(messages);
  }

  /**
   * Trigger crisis intervention
   */
  private async triggerIntervention(
    crisisSignal: CrisisSignal,
    safetyResult: SafetyCheckResult
  ): Promise<void> {
    // Log intervention
    await this.guardian.logSafetyEvent({
      type: 'crisis_intervention_triggered',
      severity: crisisSignal.severity,
      details: {
        crisisKeywords: crisisSignal.keywords,
        riskLevel: safetyResult.riskLevel,
        confidence: crisisSignal.confidence
      }
    });

    // Show emergency resources
    const contacts = await this.guardian.getEmergencyContacts();
    
    // Notify UI to show crisis intervention modal
    this.showCrisisIntervention(crisisSignal, contacts);
  }

  /**
   * Show crisis intervention UI
   */
  private showCrisisIntervention(signal: CrisisSignal, contacts: any[]): void {
    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('crisis-intervention', {
      detail: {
        severity: signal.severity,
        contacts,
        timestamp: signal.timestamp
      }
    }));

    // Show toast notification
    if (signal.severity === 'critical') {
      toast.error('Crisis detected. Emergency resources are available now.', {
        duration: 10000,
        action: {
          label: 'Get Help',
          onClick: () => window.dispatchEvent(new CustomEvent('show-emergency-modal'))
        }
      });
    }
  }

  /**
   * Safe fallback response when AI response is flagged
   */
  private getSafeFallbackResponse(): string {
    return "I want to make sure I'm providing you with the best support. Let me rephrase my response to be more helpful. If you're experiencing a crisis, please know that immediate help is available. Would you like to see emergency contact information?";
  }

  /**
   * Update conversation context
   */
  updateContext(message: ConversationMessage): void {
    this.context.conversationHistory.push(message);
  }
}

/**
 * Create safety middleware instance
 */
export const createSafetyMiddleware = (context: SafetyContext): SafetyMiddleware => {
  return new SafetyMiddleware(context);
};
