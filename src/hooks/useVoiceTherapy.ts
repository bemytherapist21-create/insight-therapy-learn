import { useState, useRef, useEffect, useCallback } from 'react';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { therapyService } from '@/services/therapyService';
import { useAuth } from './useAuth';
import { useAvatar } from './useAvatar';
import { logger } from '@/services/loggingService';
import { toast } from 'sonner';
import { voiceSafety, RiskLevel, SafetyAnalysis } from '@/utils/VoiceSafetyFramework';

export interface TranscriptEntry {
    role: 'user' | 'assistant';
    text: string;
    emotion?: string;
    wbcScore?: number;
    riskLevel?: RiskLevel;
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

    // Guardian Safety State
    const [wbcScore, setWbcScore] = useState(0);
    const [riskLevel, setRiskLevel] = useState<RiskLevel>(RiskLevel.CLEAR);
    const [showCrisisModal, setShowCrisisModal] = useState(false);

    const chatRef = useRef<RealtimeChat | null>(null);
    const currentWbcRef = useRef(0); // Track current WBC for Edge Function

    const handleMessage = useCallback(async (event: any) => {
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
                    setTranscript(prev => [...prev, {
                        role: 'assistant',
                        text,
                        wbcScore: currentWbcRef.current,
                        riskLevel
                    }]);

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

                    // GUARDIAN SAFETY ANALYSIS
                    const safety: SafetyAnalysis = voiceSafety.analyzeSafety(text);
                    setWbcScore(safety.wbcScore);
                    setRiskLevel(safety.riskLevel);
                    currentWbcRef.current = safety.wbcScore;

                    // Trigger crisis intervention if critical
                    if (safety.crisisDetected || safety.riskLevel === RiskLevel.CRITICAL) {
                        setShowCrisisModal(true);
                        toast.error("Crisis Detected", {
                            description: "Please call 988 (Suicide & Crisis Lifeline) immediately for help.",
                            duration: 10000,
                        });

                        logger.error('CRITICAL: Crisis detected in voice therapy');
                        console.error('Crisis detection details:', {
                            wbcScore: safety.wbcScore,
                            riskLevel: safety.riskLevel,
                            userId: user?.id
                        });
                    }

                    // Analyze emotion
                    const emotion = await therapyService.analyzeEmotion(text);
                    setCurrentEmotion(emotion);

                    setTranscript(prev => [...prev, {
                        role: 'user',
                        text,
                        emotion,
                        wbcScore: safety.wbcScore,
                        riskLevel: safety.riskLevel
                    }]);

                    if (sessionId) {
                        await therapyService.saveMessage(sessionId, 'user', text, emotion);
                        await therapyService.updateSessionEmotion(sessionId, emotion);

                        // Save safety metrics
                        await therapyService.updateSessionSafety(
                            sessionId,
                            safety.wbcScore,
                            safety.riskLevel
                        );
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
    }, [sessionId, currentEmotion, generateAvatar, riskLevel, user]);

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

            // Initialize RealtimeChat with current WBC score
            chatRef.current = new RealtimeChat(handleMessage);
            await chatRef.current.init(currentWbcRef.current);

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
        endSession,
        // Guardian Safety State
        wbcScore,
        riskLevel,
        showCrisisModal,
        setShowCrisisModal
    };
};
