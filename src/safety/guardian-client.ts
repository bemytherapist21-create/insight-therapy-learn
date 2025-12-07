/**
 * Project Guardian Safety Framework Client
 * Integrates Python-based safety checks with TypeScript frontend
 */

import { supabase } from '@/integrations/supabase/client';

export interface CrisisSignal {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'suicidal_ideation' | 'self_harm' | 'violence' | 'substance_abuse' | 'psychosis';
  confidence: number;
  triggers: string[];
  timestamp: Date;
  messageId: string;
}

export interface SafetyCheckResult {
  isSafe: boolean;
  signals: CrisisSignal[];
  riskLevel: 'safe' | 'monitor' | 'intervene' | 'emergency';
  interventionRequired: boolean;
  recommendedAction?: string;
  emergencyContacts?: EmergencyContact[];
}

export interface EmergencyContact {
  name: string;
  phone: string;
  type: 'hotline' | 'emergency' | 'crisis_center';
  region: string;
  available24x7: boolean;
}

class GuardianClient {
  private apiEndpoint: string;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_GUARDIAN_API_URL || 'http://localhost:8000';
  }

  /**
   * Analyze message content for crisis signals
   */
  async analyzeMessage(message: string, userId: string, sessionId: string): Promise<SafetyCheckResult> {
    try {
      // Call Supabase Edge Function that wraps Python Guardian API
      const { data, error } = await supabase.functions.invoke('safety-check', {
        body: {
          message,
          userId,
          sessionId,
          timestamp: new Date().toISOString(),
        },
      });

      if (error) throw error;

      return data as SafetyCheckResult;
    } catch (error) {
      console.error('Guardian safety check failed:', error);
      // Fail-safe: default to requiring manual review
      return {
        isSafe: false,
        signals: [],
        riskLevel: 'monitor',
        interventionRequired: true,
        recommendedAction: 'Manual review required due to safety system error',
      };
    }
  }

  /**
   * Get localized emergency contacts based on user location
   */
  async getEmergencyContacts(countryCode: string = 'US'): Promise<EmergencyContact[]> {
    const contacts: Record<string, EmergencyContact[]> = {
      US: [
        {
          name: 'National Suicide Prevention Lifeline',
          phone: '988',
          type: 'hotline',
          region: 'US',
          available24x7: true,
        },
        {
          name: 'Crisis Text Line',
          phone: 'Text HOME to 741741',
          type: 'crisis_center',
          region: 'US',
          available24x7: true,
        },
        {
          name: 'Emergency Services',
          phone: '911',
          type: 'emergency',
          region: 'US',
          available24x7: true,
        },
      ],
      IN: [
        {
          name: 'AASRA Suicide Prevention',
          phone: '91-9820466726',
          type: 'hotline',
          region: 'India',
          available24x7: true,
        },
        {
          name: 'Vandrevala Foundation',
          phone: '1860-2662-345',
          type: 'crisis_center',
          region: 'India',
          available24x7: true,
        },
        {
          name: 'Emergency Services',
          phone: '112',
          type: 'emergency',
          region: 'India',
          available24x7: true,
        },
      ],
      GB: [
        {
          name: 'Samaritans',
          phone: '116 123',
          type: 'hotline',
          region: 'UK',
          available24x7: true,
        },
        {
          name: 'Crisis Text Line UK',
          phone: 'Text SHOUT to 85258',
          type: 'crisis_center',
          region: 'UK',
          available24x7: true,
        },
        {
          name: 'Emergency Services',
          phone: '999',
          type: 'emergency',
          region: 'UK',
          available24x7: true,
        },
      ],
    };

    return contacts[countryCode] || contacts['US'];
  }

  /**
   * Log crisis event for audit trail and compliance
   */
  async logCrisisEvent(
    sessionId: string,
    userId: string,
    signal: CrisisSignal,
    actionTaken: string
  ): Promise<void> {
    try {
      await supabase.from('crisis_logs').insert({
        session_id: sessionId,
        user_id: userId,
        severity: signal.severity,
        type: signal.type,
        confidence: signal.confidence,
        triggers: signal.triggers,
        action_taken: actionTaken,
        timestamp: signal.timestamp.toISOString(),
      });
    } catch (error) {
      console.error('Failed to log crisis event:', error);
      // Critical: Alert admin if logging fails
      this.alertAdmin(signal, error);
    }
  }

  /**
   * Alert system administrators of critical safety events
   */
  private async alertAdmin(signal: CrisisSignal, error?: any): Promise<void> {
    // TODO: Integrate with admin notification system (email, SMS, dashboard)
    console.error('ADMIN ALERT - Crisis logging failed:', { signal, error });
  }

  /**
   * Check if AI response is safe to send to user
   */
  async validateAIResponse(response: string, context: string): Promise<{ safe: boolean; reason?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('validate-response', {
        body: { response, context },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('AI response validation failed:', error);
      // Fail-safe: block response if validation fails
      return {
        safe: false,
        reason: 'Unable to validate response safety',
      };
    }
  }
}

export const guardianClient = new GuardianClient();
