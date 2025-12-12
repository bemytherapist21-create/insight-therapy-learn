/**
 * Gemini Voice Therapy Hook
 * Uses: Browser Speech API + Gemini (via Supabase Edge Function)
 * No OpenAI required!
 */

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { logger } from '@/services/loggingService';

interface VoiceSafetyData {
    wbcScore: number;
    riskLevel: 'clear' | 'clouded' | 'critical';
    colorCode: string;
    requiresIntervention: boolean;
    crisisDetected: boolean;
}

interface VoiceMessage {
    role: 'user' | 'assistant';
    text: string;
}

export function useGeminiVoiceTherapy() {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState<VoiceMessage[]>([]);
    const [wbcScore, setWbcScore] = useState(0);
    const [riskLevel, setRiskLevel] = useState<'clear' | 'clouded' | 'critical'>('clear');
    const [showCrisisModal, setShowCrisisModal] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        // Initialize Web Speech API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = async (event: any) => {
                const transcript = event.results[0][0].transcript;
                await processUserMessage(transcript);
            };

            recognitionRef.current.onerror = (event: any) => {
                logger.error('Speech recognition error', new Error(event.error));
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            window.speechSynthesis.cancel();
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                logger.info('Started listening');
            } catch (error) {
                logger.error('Failed to start listening', error as Error);
            }
        } else {
            alert('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const processUserMessage = async (transcript: string) => {
        try {
            // Add user message
            setMessages(prev => [...prev, { role: 'user', text: transcript }]);

            // Get user session
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Call therapy-chat Edge Function (uses Gemini!)
            const { data, error } = await supabase.functions.invoke('therapy-chat', {
                body: {
                    message: transcript,
                    conversationId: conversationId
                }
            });

            if (error) throw error;

            // Update conversation ID
            if (data.conversationId && !conversationId) {
                setConversationId(data.conversationId);
            }

            // Update Guardian safety
            const safety: VoiceSafetyData = {
                wbcScore: data.wbcScore || 0,
                riskLevel: data.riskLevel || 'clear',
                colorCode: data.colorCode || '#10b981',
                requiresIntervention: data.requiresIntervention || false,
                crisisDetected: data.crisisDetected || false
            };

            setWbcScore(safety.wbcScore);
            setRiskLevel(safety.riskLevel);

            if (safety.crisisDetected) {
                setShowCrisisModal(true);
                logger.warn('Crisis detected in voice therapy', { wbc: safety.wbcScore });
            }

            // Add AI response
            const aiResponse = data.response;
            setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);

            // Speak the response using browser TTS
            speak(aiResponse);

            logger.info('Gemini voice therapy response received', {
                wbc: safety.wbcScore,
                risk: safety.riskLevel
            });

        } catch (error) {
            logger.error('Voice therapy processing failed', error as Error);
            const errorMsg = "I'm having trouble processing that. Please try again.";
            setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
            speak(errorMsg);
        }
    };

    const speak = (text: string) => {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = 'en-US';

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {
            logger.error('Speech synthesis error', new Error(event.error));
            setIsSpeaking(false);
        };

        synthesisRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const closeCrisisModal = () => setShowCrisisModal(false);

    return {
        isListening,
        isSpeaking,
        messages,
        wbcScore,
        riskLevel,
        showCrisisModal,
        startListening,
        stopListening,
        stopSpeaking,
        closeCrisisModal
    };
}
