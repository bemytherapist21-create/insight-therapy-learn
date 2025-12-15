/**
 * Gemini Voice Therapy Hook
 * Uses: Browser Speech API + Gemini (via Supabase Edge Function)
 * No OpenAI required!
 */

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/loggingService';
import { toast } from 'sonner';

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

                // Show user-friendly error message for permission issues
                if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                    toast.error('Microphone access denied. Please click the 🎤 icon in your browser address bar and allow microphone access.');
                } else if (event.error === 'network') {
                    toast.error('Network error. Please check your internet connection and microphone permissions.');
                } else {
                    toast.error(`Microphone error: ${event.error}`);
                }
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

    const startListening = async () => {
        if (!recognitionRef.current) {
            toast.error('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        // Check if we need to request microphone permission
        if (navigator.permissions && navigator.permissions.query) {
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });

                if (permissionStatus.state === 'denied') {
                    toast.error('Microphone access blocked. Please click the 🔒 icon in your browser address bar and allow microphone access, then reload the page.');
                    return;
                }
            } catch (err) {
                // Permission API not fully supported, continue anyway
                console.log('Permission API not supported, trying anyway');
            }
        }

        try {
            recognitionRef.current.start();
            setIsListening(true);
            logger.info('Started listening');
            toast.success('Listening... Please speak now');
        } catch (error) {
            logger.error('Failed to start listening', error as Error);
            toast.error('Failed to start microphone. Please check your browser permissions.');
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

            // Update Guardian safety (check both data.safety and direct properties)
            const safetyData = data.safety || data;
            const safety: VoiceSafetyData = {
                wbcScore: safetyData.wbcScore || data.wbcScore || 0,
                riskLevel: (safetyData.riskLevel || data.riskLevel || 'clear') as 'clear' | 'clouded' | 'critical',
                colorCode: safetyData.colorCode || data.colorCode || '#10b981',
                requiresIntervention: safetyData.requiresIntervention || data.requiresIntervention || false,
                crisisDetected: safetyData.crisisDetected || data.crisisDetected || false
            };

            setWbcScore(safety.wbcScore);
            setRiskLevel(safety.riskLevel);

            if (safety.crisisDetected) {
                setShowCrisisModal(true);
                logger.warn('Crisis detected in voice therapy', { wbc: safety.wbcScore });
            }

            // Add AI response (Edge Function returns 'message' in chat, may also have 'response')
            const aiResponse = data.message || data.response || "I'm here to help. Could you tell me more?";
            setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);

            // Speak the response using browser TTS
            speak(aiResponse);

            logger.info('Gemini voice therapy response received', {
                wbc: safety.wbcScore,
                risk: safety.riskLevel
            });

        } catch (error) {
            logger.error('Voice therapy processing failed', error as Error);

            // Provide more helpful error messages
            let errorMsg = "I'm having trouble processing that. Please try again.";
            if (error instanceof Error) {
                if (error.message.includes('Not authenticated') || error.message.includes('401') || error.message.includes('403')) {
                    errorMsg = "Please log in to use voice therapy. Redirecting to login...";
                    // Redirect to login after a short delay
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                } else if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
                    errorMsg = "Network error. Please check your internet connection.";
                } else if (error.message.includes('Edge Function') || error.message.includes('functions')) {
                    errorMsg = "Therapy service unavailable. Please try again in a moment.";
                } else {
                    errorMsg = `Error: ${error.message}`;
                }
            }

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
