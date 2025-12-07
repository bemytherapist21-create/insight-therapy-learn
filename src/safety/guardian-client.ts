/**
 * Project Guardian Client - TypeScript Bridge
 * Integrates Python-based safety framework with TypeScript frontend
 */

import { supabase } from '@/integrations/supabase/client';

export interface CrisisSignal {
  level: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
  confidence: number;
  timestamp: string;
  context: string;
}

export interface SafetyCheckResult {
  isSafe: boolean;
  riskLevel: 'safe' | 'warning' | 'danger' | 'critical';
  crisisDetected: boolean;
  signals: CrisisSignal[];
  interventionRequired: boolean;
  emergencyContacts?: EmergencyContact[];
  message?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  available: string;
  type: 'hotline' | 'emergency' | 'support';
}

export class GuardianClient {
  private static instance: GuardianClient;
  private sessionId: string;
  private conversationHistory: string[] = [];

  private constructor() {
    this.sessionId = crypto.randomUUID();
  }

  public static getInstance(): GuardianClient {
    if (!GuardianClient.instance) {
      GuardianClient.instance = new GuardianClient();
    }
    return GuardianClient.instance;
  }

  /**
   * Check message safety before sending to AI
   */
  async checkMessageSafety(message: string): Promise<SafetyCheckResult> {
    try {
      // Call Supabase Edge Function for safety check
      const { data, error } = await supabase.functions.invoke('safety-check', {
        body: {
          message,
          sessionId: this.sessionId,
          conversationHistory: this.conversationHistory.slice(-5), // Last 5 messages
        },
      });

      if (error) throw error;

      this.conversationHistory.push(message);
      return data as SafetyCheckResult;
    } catch (error) {
      console.error('Safety check failed:', error);
      // Fail-safe: treat as potentially unsafe
      return {
        isSafe: false,
        riskLevel: 'warning',
        crisisDetected: false,
        signals: [],
        interventionRequired: false,
        message: 'Safety check unavailable. Please contact support.',
      };
    }
  }

  /**
   * Analyze AI response before showing to user
   */
  async validateAIResponse(response: string): Promise<SafetyCheckResult> {
    try {
      const { data, error } = await supabase.functions.invoke('validate-response', {
        body: {
          response,
          sessionId: this.sessionId,
        },
      });

      if (error) throw error;
      return data as SafetyCheckResult;
    } catch (error) {
      console.error('Response validation failed:', error);
      return {
        isSafe: false,
        riskLevel: 'danger',
        crisisDetected: false,
        signals: [],
        interventionRequired: true,
        message: 'Unable to validate response safety.',
      };
    }
  }

  /**
   * Get localized emergency contacts
   */
  async getEmergencyContacts(countryCode: string = 'IN'): Promise<EmergencyContact[]> {
    const contacts: Record<string, EmergencyContact[]> = {
      IN: [
        {
          name: 'Vandrevala Foundation',
          phone: '1860-2662-345',
          available: '24/7',
          type: 'hotline',
        },
        {
          name: 'iCall Psychosocial Helpline',
          phone: '9152987821',
          available: 'Mon-Sat 8am-10pm',
          type: 'hotline',
        },
        {
          name: 'Emergency Services',
          phone: '112',
          available: '24/7',
          type: 'emergency',
        },
      ],
      US: [
        {
          name: '988 Suicide & Crisis Lifeline',
          phone: '988',
          available: '24/7',
          type: 'hotline',
        },
        {
          name: 'Crisis Text Line',
          phone: 'Text HOME to 741741',
          available: '24/7',
          type: 'hotline',
        },
        {
          name: 'Emergency Services',
          phone: '911',
          available: '24/7',
          type: 'emergency',
        },
      ],
    };

    return contacts[countryCode] || contacts['IN'];
  }

  /**
   * Log safety event for audit trail
   */
  async logSafetyEvent(event: {
    type: 'crisis_detected' | 'intervention_triggered' | 'emergency_contact_shown';
    severity: string;
    details: any;
  }): Promise<void> {
    try {
      await supabase.from('safety_logs').insert({
        session_id: this.sessionId,
        event_type: event.type,
        severity: event.severity,
        details: event.details,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log safety event:', error);
    }
  }

  /**
   * Reset session (for new user session)
   */
  resetSession(): void {
    this.sessionId = crypto.randomUUID();
    this.conversationHistory = [];
  }
}

export const guardianClient = GuardianClient.getInstance();
