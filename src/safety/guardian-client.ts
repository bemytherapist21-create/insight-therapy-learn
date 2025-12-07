/**
 * Project Guardian Safety Framework Client
 * Integrates with Python-based safe-therapy-agent for crisis detection
 */

import { supabase } from '@/integrations/supabase/client';

export interface SafetyCheckResult {
  isSafe: boolean;
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  triggers: string[];
  interventionRequired: boolean;
  recommendedAction?: string;
  emergencyContacts?: EmergencyContact[];
}

export interface EmergencyContact {
  name: string;
  phone: string;
  available24_7: boolean;
  region: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/**
 * GuardianClient - Main interface to Project Guardian safety framework
 */
export class GuardianClient {
  private sessionId: string;
  private userId: string;
  
  constructor(sessionId: string, userId: string) {
    this.sessionId = sessionId;
    this.userId = userId;
  }

  /**
   * Check message safety before sending to AI
   */
  async checkMessageSafety(message: string): Promise<SafetyCheckResult> {
    try {
      const { data, error } = await supabase.functions.invoke('safety-check', {
        body: {
          message,
          sessionId: this.sessionId,
          userId: this.userId,
          type: 'pre-processing'
        }
      });

      if (error) throw error;
      return data as SafetyCheckResult;
    } catch (error) {
      console.error('Safety check failed:', error);
      // Fail-safe: treat as high risk if check fails
      return {
        isSafe: false,
        riskLevel: 'high',
        triggers: ['system_error'],
        interventionRequired: true,
        recommendedAction: 'contact_support'
      };
    }
  }

  /**
   * Validate AI response before showing to user
   */
  async validateResponse(response: string, context: ConversationMessage[]): Promise<SafetyCheckResult> {
    try {
      const { data, error } = await supabase.functions.invoke('safety-check', {
        body: {
          message: response,
          context,
          sessionId: this.sessionId,
          userId: this.userId,
          type: 'post-processing'
        }
      });

      if (error) throw error;
      return data as SafetyCheckResult;
    } catch (error) {
      console.error('Response validation failed:', error);
      return {
        isSafe: false,
        riskLevel: 'high',
        triggers: ['system_error'],
        interventionRequired: true
      };
    }
  }

  /**
   * Analyze conversation for risk patterns
   */
  async analyzeConversation(messages: ConversationMessage[]): Promise<SafetyCheckResult> {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: {
          messages,
          sessionId: this.sessionId,
          userId: this.userId
        }
      });

      if (error) throw error;
      return data as SafetyCheckResult;
    } catch (error) {
      console.error('Conversation analysis failed:', error);
      return {
        isSafe: true,
        riskLevel: 'none',
        triggers: [],
        interventionRequired: false
      };
    }
  }

  /**
   * Log safety event for audit trail
   */
  async logSafetyEvent(event: {
    type: string;
    severity: string;
    details: any;
  }): Promise<void> {
    try {
      await supabase.from('safety_audit_logs').insert({
        session_id: this.sessionId,
        user_id: this.userId,
        event_type: event.type,
        severity: event.severity,
        details: event.details,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log safety event:', error);
    }
  }

  /**
   * Get emergency contacts based on user location
   */
  async getEmergencyContacts(region?: string): Promise<EmergencyContact[]> {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('region', region || 'global')
      .eq('active', true);

    if (error) {
      console.error('Failed to fetch emergency contacts:', error);
      return this.getDefaultEmergencyContacts();
    }

    return data as EmergencyContact[];
  }

  private getDefaultEmergencyContacts(): EmergencyContact[] {
    return [
      {
        name: 'National Suicide Prevention Lifeline',
        phone: '988',
        available24_7: true,
        region: 'US'
      },
      {
        name: 'Crisis Text Line',
        phone: 'Text HOME to 741741',
        available24_7: true,
        region: 'US'
      },
      {
        name: 'International Association for Suicide Prevention',
        phone: 'Visit https://www.iasp.info/resources/Crisis_Centres/',
        available24_7: true,
        region: 'global'
      }
    ];
  }
}

/**
 * Initialize Guardian client for session
 */
export const initializeGuardian = (sessionId: string, userId: string): GuardianClient => {
  return new GuardianClient(sessionId, userId);
};
