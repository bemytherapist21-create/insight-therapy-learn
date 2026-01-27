/**
 * Gemini Live Voice Therapy Hook
 * Real-time bidirectional audio streaming with Gemini for therapy sessions
 * Includes Well-Being Coefficient (WBC) analysis like chat therapy
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { decode, decodeAudioData, createBlob, createAudioContext } from '@/services/audioUtils';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/loggingService';

export type VoiceStatus = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking';
export type VoicePersona = 'Kore' | 'Puck' | 'Zephyr';

export interface VoiceMessage {
  role: 'user' | 'ai';
  text: string;
}

export interface SafetyStatus {
  wbcScore: number;
  riskLevel: 'clear' | 'clouded' | 'critical';
  colorCode: string;
  requiresIntervention: boolean;
  crisisDetected: boolean;
}

interface UseGeminiLiveVoiceReturn {
  isActive: boolean;
  status: VoiceStatus;
  messages: VoiceMessage[];
  error: string | null;
  selectedVoice: VoicePersona;
  setSelectedVoice: (voice: VoicePersona) => void;
  startSession: () => Promise<void>;
  stopSession: () => void;
  safety: SafetyStatus | null;
}

// WBC Constants - matching therapy-chat
const WBC_CLEAR_MAX = 20;
const WBC_CLOUDED_MAX = 50;

// Analyze text for safety risks (same logic as therapy-chat)
function analyzeSafety(message: string): SafetyStatus {
  const lowerMessage = message.toLowerCase();
  let wbcScore = 0;
  let crisisDetected = false;
  
  // High-risk keywords (WBC +30-50)
  const criticalKeywords = ['kill myself', 'suicide', 'end my life', 'want to die', 'better off dead', 'hang myself', 'overdose', 'kms', 'unalive'];
  const highRiskKeywords = ['self harm', 'cut myself', 'hurt myself', 'no point', 'hopeless', 'worthless', 'can\'t go on'];
  const moderateKeywords = ['depressed', 'anxious', 'sad', 'worried', 'scared', 'alone', 'overwhelmed', 'feeling low', 'stressed'];
  
  // Check for critical keywords
  for (const keyword of criticalKeywords) {
    if (lowerMessage.includes(keyword)) {
      wbcScore += 50;
      crisisDetected = true;
      break;
    }
  }
  
  // Check for high-risk keywords
  if (wbcScore < 50) {
    for (const keyword of highRiskKeywords) {
      if (lowerMessage.includes(keyword)) {
        wbcScore += 30;
        break;
      }
    }
  }
  
  // Check for moderate keywords
  if (wbcScore < 20) {
    for (const keyword of moderateKeywords) {
      if (lowerMessage.includes(keyword)) {
        wbcScore += 10;
      }
    }
  }
  
  wbcScore = Math.min(100, wbcScore);
  
  let riskLevel: 'clear' | 'clouded' | 'critical';
  let colorCode: string;
  
  if (wbcScore <= WBC_CLEAR_MAX) {
    riskLevel = 'clear';
    colorCode = 'Green (Clear Hue)';
  } else if (wbcScore <= WBC_CLOUDED_MAX) {
    riskLevel = 'clouded';
    colorCode = 'Yellow (Cloudy Hue)';
  } else {
    riskLevel = 'critical';
    colorCode = 'Red (Dangerously Cloudy Hue)';
  }
  
  return {
    wbcScore,
    riskLevel,
    colorCode,
    requiresIntervention: wbcScore > 50,
    crisisDetected
  };
}

const SYSTEM_INSTRUCTION = `You are Maya, a compassionate and expert AI therapist powered by Project Guardian.
Your role is to provide empathetic, supportive therapy through voice conversation.

YOUR VOICE & STYLE:
- Respond exclusively via voice. Be natural, warm, and succinct.
- Use conversational language, never clinical jargon
- Show genuine warmth ("I hear you", "That sounds really hard", "I'm glad you shared that")
- Be present and engaged, like you're really listening
- Keep responses concise (2-4 sentences) for natural conversation flow

THERAPEUTIC APPROACH:
- Ask gentle, open questions ("What's that been like for you?")
- Validate feelings before offering any perspective
- Notice and name emotions you sense ("It sounds like you're feeling...")

SAFETY BOUNDARIES:
- If someone expresses crisis thoughts (suicide, self-harm), immediately provide 988 crisis line.
- Never provide medical diagnoses or prescribe medication.
- Encourage professional help when appropriate.

CRISIS RESOURCES:
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Emergency: 911

Remember: You are a supportive companion, not a replacement for professional mental health care.`;

export function useGeminiLiveVoice(): UseGeminiLiveVoiceReturn {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoicePersona>('Kore');
  const [safety, setSafety] = useState<SafetyStatus | null>(null);

  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const transcriptionRef = useRef({ user: '', ai: '' });
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const stopSession = useCallback(() => {
    console.log('[Voice] Stopping session...');
    
    // Close Gemini session
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {
        // Ignore close errors
      }
      sessionRef.current = null;
    }

    // Stop audio sources
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch (e) { /* ignore */ }
    });
    sourcesRef.current.clear();

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Disconnect script processor
    if (scriptProcessorRef.current) {
      try { scriptProcessorRef.current.disconnect(); } catch (e) { /* ignore */ }
      scriptProcessorRef.current = null;
    }

    // Disconnect media source
    if (mediaSourceRef.current) {
      try { mediaSourceRef.current.disconnect(); } catch (e) { /* ignore */ }
      mediaSourceRef.current = null;
    }

    // Close audio contexts
    if (audioContextRef.current) {
      try { audioContextRef.current.input.close(); } catch (e) { /* ignore */ }
      try { audioContextRef.current.output.close(); } catch (e) { /* ignore */ }
      audioContextRef.current = null;
    }

    setIsActive(false);
    setStatus('idle');
    nextStartTimeRef.current = 0;
    transcriptionRef.current = { user: '', ai: '' };
  }, []);

  const startSession = useCallback(async () => {
    setStatus('connecting');
    setError(null);
    setMessages([]);
    setSafety(null);

    try {
      // Get API key from edge function
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('Please log in to use voice therapy');
      }

      console.log('[Voice] Fetching API token...');
      const tokenResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-live-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get voice session token');
      }

      const { apiKey } = await tokenResponse.json();
      if (!apiKey) {
        throw new Error('No API key received');
      }

      console.log('[Voice] Token received, requesting microphone...');

      // Get microphone access FIRST (before creating audio contexts)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;
      console.log('[Voice] Microphone access granted');

      // Create audio contexts with proper sample rates
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inputAudioContext, output: outputAudioContext };

      // Initialize Gemini Live
      console.log('[Voice] Connecting to Gemini Live...');
      const ai = new GoogleGenAI({ apiKey });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            console.log('[Voice] Gemini Live session opened');
            setIsActive(true);
            setStatus('listening');
            setError(null);
            
            // Set up audio input processing
            const source = inputAudioContext.createMediaStreamSource(stream);
            mediaSourceRef.current = source;
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(s => {
                try {
                  s.sendRealtimeInput({ media: pcmBlob });
                } catch (err) {
                  console.error('[Voice] Error sending audio:', err);
                }
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle transcriptions
            if (message.serverContent?.outputTranscription) {
              transcriptionRef.current.ai += message.serverContent.outputTranscription.text;
              setStatus('speaking');
            } else if (message.serverContent?.inputTranscription) {
              transcriptionRef.current.user += message.serverContent.inputTranscription.text;
              setStatus('listening');
            }

            // Handle turn complete - save transcriptions and analyze safety
            if (message.serverContent?.turnComplete) {
              const userT = transcriptionRef.current.user.trim();
              const aiT = transcriptionRef.current.ai.trim();
              
              if (userT || aiT) {
                // Analyze user message for safety
                if (userT) {
                  const safetyAnalysis = analyzeSafety(userT);
                  setSafety(safetyAnalysis);
                  
                  // Log if critical
                  if (safetyAnalysis.crisisDetected) {
                    console.warn('[Voice] Crisis detected in user message');
                  }
                }
                
                setMessages(prev => [
                  ...prev,
                  ...(userT ? [{ role: 'user' as const, text: userT }] : []),
                  ...(aiT ? [{ role: 'ai' as const, text: aiT }] : [])
                ]);
              }
              
              transcriptionRef.current = { user: '', ai: '' };
              setStatus('listening');
            }

            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              setStatus('speaking');
              
              try {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                const source = outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContext.destination);
                
                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) {
                    setStatus('listening');
                  }
                });
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              } catch (err) {
                console.error('[Voice] Error decoding audio:', err);
              }
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch (e) { /* ignore */ }
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setStatus('listening');
            }
          },
          onerror: (e: unknown) => {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error('[Voice] Gemini Live error:', errorMessage);
            logger.error('Gemini Live error', new Error(errorMessage));
            setError('Connection lost. Please check your internet and try again.');
            stopSession();
          },
          onclose: () => {
            console.log('[Voice] Gemini Live session closed');
            setIsActive(false);
            setStatus('idle');
          }
        }
      });

      sessionRef.current = await sessionPromise;
      console.log('[Voice] Session connected successfully');
      
    } catch (err: any) {
      console.error('[Voice] Failed to start session:', err);
      logger.error('Failed to start voice session', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access and try again.');
      } else if (err.message?.includes('log in')) {
        setError('Please log in to use voice therapy');
      } else {
        setError(err.message || 'Failed to start voice session. Please try again.');
      }
      
      setStatus('idle');
      stopSession();
    }
  }, [selectedVoice, stopSession]);

  return {
    isActive,
    status,
    messages,
    error,
    selectedVoice,
    setSelectedVoice,
    startSession,
    stopSession,
    safety,
  };
}
