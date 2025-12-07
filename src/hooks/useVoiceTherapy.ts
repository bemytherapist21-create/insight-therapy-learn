import { useState, useRef, useEffect, useCallback } from 'react';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { therapyService } from '@/services/therapyService';
import { useAuth } from './useAuth';
import { useAvatar } from './useAvatar';
import { logger } from '@/services/loggingService';
import { toast } from 'sonner';

export interface TranscriptEntry {
    role: 'user' | 'assistant';
    text: string;
    emotion?: string;
}

export const useVoiceTherapy = () => {
    const { user } = useAuth();
    const { generateAvatar, avatarUrl, isGenerating: isAvatarGenerating } = useAvatar();

    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [currentEmotion, setCurrentEmotion] = useState<string>('calm');
    const [sessionId, setSessionId] = useState<string | null>(null);

    const chatRef = useRef<RealtimeChat | null>(null);

    const handleMessage = useCallback(async (event: any) => {
        // logger.debug('Voice event', { type: event.type }); // Too noisy for normal logs

        switch (event.type) {
            case 'response.audio.delta':
                setIsSpeaking(true);
                setIsListening(false);
                break;

            case 'response.audio.done':
                setIsSpeaking(false);
                setIsListening(true);
                break;

            case 'response.audio_transcript.done':
                if (event.transcript) {
                    const text = event.transcript;
                    setTranscript(prev => [...prev, { role: 'assistant', text }]);

                    if (sessionId) {
                        therapyService.saveMessage(sessionId, 'assistant', text, currentEmotion);
                    }

                    // Generate avatar for longer responses
                    if (text.length > 30) {
                        generateAvatar(text);
                    }
                }
                break;

            case 'conversation.item.input_audio_transcription.completed':
                if (event.transcript) {
                    const text = event.transcript;
                    const emotion = await therapyService.analyzeEmotion(text);

                    setCurrentEmotion(emotion);
                    setTranscript(prev => [...prev, { role: 'user', text, emotion }]);

                    if (sessionId) {
                        await therapyService.saveMessage(sessionId, 'user', text, emotion);
                        await therapyService.updateSessionEmotion(sessionId, emotion);
                    }
                }
                break;

            case 'input_audio_buffer.speech_started':
                setIsListening(false);
                break;

            case 'input_audio_buffer.speech_stopped':
                setIsListening(true);
                break;

            case 'error':
                logger.error('Realtime error', event);
                toast.error('Connection error. Please try again.');
                break;
        }
    }, [sessionId, currentEmotion, generateAvatar]);

    const startSession = async () => {
        if (!user) return;

        setStatus('connecting');
        try {
            // Request microphone permission first
            await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create database session
            const newSessionId = await therapyService.createSession(user.id);
            if (newSessionId) {
                setSessionId(newSessionId);
            }

            chatRef.current = new RealtimeChat(handleMessage);
            await chatRef.current.init();

            setStatus('connected');
            setIsListening(true);
            setTranscript([]);

            logger.info('Voice session started');
            toast.success("Connected! Start speaking when you're ready.");
        } catch (error) {
            logger.error('Error starting session', error instanceof Error ? error : undefined);
            setStatus('idle');
            // Toast already handled by service or specific catch if needed, but here mostly generic
            toast.error('Failed to start voice session. Please check microphone permissions.');
        }
    };

    const endSession = async () => {
        chatRef.current?.disconnect();
        chatRef.current = null;

        if (sessionId) {
            await therapyService.endSession(sessionId);
        }

        setStatus('idle');
        setIsSpeaking(false);
        setIsListening(false);
        setSessionId(null);
        logger.info('Voice session ended');
        toast.info('Session ended');
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            chatRef.current?.disconnect();
        };
    }, []);

    return {
        status,
        isSpeaking,
        isListening,
        transcript,
        currentEmotion,
        avatarUrl,
        isAvatarGenerating,
        startSession,
        endSession
    };
};
