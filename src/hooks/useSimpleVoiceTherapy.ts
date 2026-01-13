/**
 * Simplified Voice Therapy Hook - Uses Vercel API
 * Replaces broken OpenAI Realtime API with cd-irvan pipeline
 */

import { useState, useRef } from 'react';
import { logger } from '@/services/loggingService';

interface VoiceSafetyData {
    wbc_score: number;
    risk_level: string;
    color_code: string;
    crisis_detected: boolean;
}

interface VoiceMessage {
    role: 'user' | 'assistant';
    text: string;
}

export function useSimpleVoiceTherapy() {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState<VoiceMessage[]>([]);
    const [wbcScore, setWbcScore] = useState(0);
    const [riskLevel, setRiskLevel] = useState('clear');
    const [showCrisisModal, setShowCrisisModal] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await processAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            logger.info('Voice recording started');
        } catch (error) {
            logger.error('Failed to start recording', error as Error);
            throw new Error('Microphone access denied');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsProcessing(true);
            logger.info('Voice recording stopped');
        }
    };

    const processAudio = async (audioBlob: Blob) => {
        try {
            // Convert audio to base64
            const reader = new FileReader();
            const audioBase64 = await new Promise<string>((resolve) => {
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
                reader.readAsDataURL(audioBlob);
            });

            // Call Vercel API
            const response = await fetch('/api/voice-therapy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: audioBase64 })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            // Add user message
            setMessages(prev => [...prev, {
                role: 'user',
                text: data.transcript
            }]);

            // Update Guardian safety
            const safety: VoiceSafetyData = data.safety;
            setWbcScore(safety.wbc_score);
            setRiskLevel(safety.risk_level);

            if (safety.crisis_detected) {
                setShowCrisisModal(true);
                logger.warn('Crisis detected in voice therapy', { wbc: safety.wbc_score });
            }

            // Add AI response
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: data.response
            }]);

            // Generate natural audio using MiniMax TTS
            const { backendAnonKey, backendUrl } = await import('@/config/backend');

            const ttsResponse = await fetch(`${backendUrl}/functions/v1/minimax-tts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: backendAnonKey,
                    Authorization: `Bearer ${backendAnonKey}`,
                },
                body: JSON.stringify({ text: data.response }),
            });

            if (ttsResponse.ok) {
                const audioBlob2 = await ttsResponse.blob();
                const audioUrl = URL.createObjectURL(audioBlob2);
                const audio = new Audio(audioUrl);
                await audio.play();
            } else {
                logger.warn('MiniMax TTS failed, no audio playback');
            }

            logger.info('Voice therapy response received', {
                wbc: safety.wbc_score,
                risk: safety.risk_level
            });

        } catch (error) {
            logger.error('Voice therapy processing failed', error as Error);
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const closeCrisisModal = () => setShowCrisisModal(false);

    return {
        isRecording,
        isProcessing,
        messages,
        wbcScore,
        riskLevel,
        showCrisisModal,
        startRecording,
        stopRecording,
        closeCrisisModal
    };
}
