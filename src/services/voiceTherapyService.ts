/**
 * Voice Therapy Service - Python Backend Integration
 * Replaces OpenAI Realtime API with cd-irvan pipeline approach
 */

import { logger } from './loggingService';

const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';

export interface VoiceSafetyData {
    wbc_score: number;
    risk_level: string;
    color_code: string;
    requires_intervention: boolean;
}

export interface VoiceTherapyResponse {
    transcript: string;
    response: string;
    audio_url: string;
    safety: VoiceSafetyData;
    wbc_score: number;
    risk_level: string;
    crisis_detected: boolean;
}

export class VoiceTherapyService {
    /**
     * Send audio to Python backend for processing
     * @param audioBlob - Recorded audio blob
     * @param userId - Current user ID
     * @param sessionId - Current session ID
     * @returns Complete therapy response with transcript, AI response, and safety data
     */
    static async processAudio(
        audioBlob: Blob,
        userId: string,
        sessionId: string
    ): Promise<VoiceTherapyResponse> {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.webm');
            formData.append('user_id', userId);
            formData.append('session_id', sessionId);

            const response = await fetch(`${PYTHON_API_URL}/api/voice-therapy`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data: VoiceTherapyResponse = await response.json();

            logger.info('Voice therapy response received', {
                wbc_score: data.wbc_score,
                risk_level: data.risk_level,
                crisis_detected: data.crisis_detected,
            });

            return data;
        } catch (error) {
            logger.error('Error processing voice therapy audio', error instanceof Error ? error : undefined);
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
     * Health check for Python backend
     */
    static async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${PYTHON_API_URL}/health`);
            const data = await response.json();
            return data.status === 'healthy';
        } catch (error) {
            logger.error('Python backend health check failed', error instanceof Error ? error : undefined);
            return false;
        }
    }
}
