import { supabase } from '@/integrations/supabase/client';
import { logger } from './loggingService';
import { errorService } from './errorService';

export interface EmotionResponse {
    emotion: string;
}

export interface DidCreateResponse {
    id: string;
    status: string;
}

export interface DidPollResponse {
    status: 'created' | 'started' | 'done' | 'error';
    result_url?: string;
    id: string;
}

class TherapyService {
    /**
     * Analyze emotion from text using Edge Function
     */
    async analyzeEmotion(text: string): Promise<string> {
        try {
            const { data, error } = await supabase.functions.invoke('analyze-emotion', {
                body: { text }
            });

            if (error) throw error;

            if (data?.emotion) {
                return data.emotion;
            }

            return 'mixed'; // Default fallback
        } catch (error) {
            logger.warn('Emotion analysis failed, defaulting to mixed', { error });
            return 'mixed';
        }
    }

    /**
     * Create a D-ID talk (avatar video)
     */
    async createAvatarTalk(text: string): Promise<string | null> {
        try {
            const { data, error } = await supabase.functions.invoke('did-avatar', {
                body: { action: 'create', text: text.substring(0, 500) }
            });

            if (error) throw error;

            if (!data?.id) {
                throw new Error('No talk ID returned from D-ID');
            }

            logger.info('D-ID talk created', { talkId: data.id });
            return data.id;
        } catch (error) {
            errorService.handleError(error, 'Failed to create avatar video');
            return null;
        }
    }

    /**
     * Poll for D-ID talk result
     */
    async pollAvatarResult(talkId: string): Promise<string | null> {
        try {
            const { data, error } = await supabase.functions.invoke('did-avatar', {
                body: { action: 'poll', talkId }
            });

            if (error) throw error;

            if (data?.status === 'done' && data?.result_url) {
                return data.result_url;
            }

            if (data?.status === 'error') {
                throw new Error('D-ID generation failed status returned');
            }

            return null; // Still processing
        } catch (error) {
            logger.warn('D-ID poll error', { error, talkId });
            return null;
        }
    }

    /**
     * Save a message to the database
     */
    async saveMessage(
        sessionId: string,
        role: 'user' | 'assistant',
        text: string,
        emotion?: string,
        avatarUrl?: string
    ): Promise<void> {
        try {
            const { error } = await supabase.from('voice_messages').insert({
                session_id: sessionId,
                role,
                text,
                emotion,
                avatar_url: avatarUrl
            });

            if (error) throw error;
        } catch (error) {
            logger.error('Error saving message', error instanceof Error ? error : undefined);
        }
    }

    /**
     * Create a new therapy session
     */
    async createSession(userId: string): Promise<string | null> {
        try {
            const { data, error } = await supabase
                .from('voice_sessions')
                .insert({ user_id: userId })
                .select()
                .single();

            if (error) throw error;
            return data.id;
        } catch (error) {
            errorService.handleError(error, 'Failed to start voice session');
            return null;
        }
    }

    /**
     * Update session end time
     */
    async endSession(sessionId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('voice_sessions')
                .update({ ended_at: new Date().toISOString() })
                .eq('id', sessionId);

            if (error) throw error;
        } catch (error) {
            logger.error('Error ending session', error instanceof Error ? error : undefined);
        }
    }

    /**
     * Update session emotion context
     */
    async updateSessionEmotion(sessionId: string, emotion: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('voice_sessions')
                .update({ last_emotion: emotion })
                .eq('id', sessionId);

            if (error) throw error;
        } catch (error) {
            logger.warn('Failed to update session emotion', { error });
        }
    }

    /**
     * Update session safety metrics (Guardian Integration)
     */
    async updateSessionSafety(
        sessionId: string,
        wbcScore: number,
        riskLevel: string
    ): Promise<void> {
        try {
            const { error } = await supabase
                .from('voice_sessions')
                .update({
                    wbc_score: wbcScore,
                    risk_level: riskLevel
                })
                .eq('id', sessionId);

            if (error) throw error;
        } catch (error) {
            logger.warn('Failed to update session safety', { error });
        }
    }
}

export const therapyService = new TherapyService();
