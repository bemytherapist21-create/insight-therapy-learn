/**
 * Minimax Voice Therapy Service - Frontend Integration
 * Uses Minimax AI with cloned voice for natural therapy conversations
 */

import { logger } from './loggingService';

const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';

export interface MinimaxVoiceSafetyData {
    wbc_score: number;
    risk_level: string;
    color_code: string;
    requires_intervention: boolean;
}

export interface MinimaxVoiceTherapyResponse {
    transcript: string;
    response: string;
    audio_url: string;
    safety: MinimaxVoiceSafetyData;
    wbc_score: number;
    risk_level: string;
    crisis_detected: boolean;
}

export class MinimaxVoiceTherapyService {
    /**
     * Send audio to Minimax-powered Python backend for processing
     * Uses cloned voice for natural, personalized therapy sessions
     * @param audioBlob - Recorded audio blob
     * @param userId - Current user ID
     * @param sessionId - Current session ID
     * @returns Complete therapy response with transcript, AI response, and safety data
     */
    static async processAudio(
        audioBlob: Blob,
        userId: string,
        sessionId: string
    ): Promise<MinimaxVoiceTherapyResponse> {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.webm');
            formData.append('user_id', userId);
            formData.append('session_id', sessionId);

            const response = await fetch(`${PYTHON_API_URL}/api/voice-therapy-minimax`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `API error: ${response.status}`);
            }

            const data: MinimaxVoiceTherapyResponse = await response.json();

            logger.info('Minimax voice therapy response received', {
                wbc_score: data.wbc_score,
                risk_level: data.risk_level,
                crisis_detected: data.crisis_detected,
            });

            return data;
        } catch (error) {
            logger.error('Error processing Minimax voice therapy audio', error instanceof Error ? error : undefined);
            throw error;
        }
    }

    /**
     * Get full audio URL from backend
     */
    static getAudioUrl(audioPath: string): string {
        return `${PYTHON_API_URL}${audioPath}`;
    }

    /**
     * Health check for Minimax service availability
     */
    static async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${PYTHON_API_URL}/health`);
            const data = await response.json();
            return data.status === 'healthy' && data.minimax === 'connected';
        } catch (error) {
            logger.error('Minimax health check failed', error instanceof Error ? error : undefined);
            return false;
        }
    }

    /**
     * Get service status information
     */
    static async getStatus(): Promise<{
        available: boolean;
        openai: string;
        minimax: string;
        guardian: string;
    }> {
        try {
            const response = await fetch(`${PYTHON_API_URL}/health`);
            const data = await response.json();
            return {
                available: data.status === 'healthy',
                openai: data.openai || 'not configured',
                minimax: data.minimax || 'not configured',
                guardian: data.guardian || 'inactive'
            };
        } catch (error) {
            logger.error('Failed to get service status', error instanceof Error ? error : undefined);
            return {
                available: false,
                openai: 'error',
                minimax: 'error',
                guardian: 'error'
            };
        }
    }
}
