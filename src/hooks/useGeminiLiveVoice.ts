/**
 * Gemini Live Voice Therapy Hook
 * Real-time bidirectional audio streaming with Gemini for therapy sessions
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { decode, decodeAudioData, createBlob, createAudioContext } from '@/services/audioUtils';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/loggingService';

export type VoiceStatus = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking';
export type VoicePersona = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export interface VoiceMessage {
  role: 'user' | 'ai';
  text: string;
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
}

const SYSTEM_INSTRUCTION = `You are Insight, a compassionate and expert AI therapist powered by Project Guardian.
Your role is to provide empathetic, supportive therapy through voice conversation.

GUIDELINES:
- Respond exclusively via voice. Be natural, warm, and succinct.
- Help users explore their feelings through empathetic listening and reflective responses.
- Use active listening techniques: reflect back emotions, ask open-ended questions.
- If someone expresses crisis thoughts (suicide, self-harm), immediately provide 988 crisis line.
- Never provide medical diagnoses or prescribe medication.
- Encourage professional help when appropriate.
- Keep responses concise (2-4 sentences) for natural conversation flow.

Remember: You are a supportive companion, not a replacement for professional mental health care.`;

export function useGeminiLiveVoice(): UseGeminiLiveVoiceReturn {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoicePersona>('Kore');

  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const transcriptionRef = useRef({ user: '', ai: '' });
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const startSession = useCallback(async () => {
    setStatus('connecting');
    setError(null);
    setMessages([]);

    try {
      // Get API key from edge function
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('Please log in to use voice therapy');
      }

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

      // Create audio contexts
      const inputAudioContext = createAudioContext(16000);
      const outputAudioContext = createAudioContext(24000);
      audioContextRef.current = { input: inputAudioContext, output: outputAudioContext };

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Initialize Gemini Live
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
            logger.info('Gemini Live session opened');
            setIsActive(true);
            setStatus('listening');
            
            // Set up audio input processing
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
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

            // Handle turn complete - save transcriptions
            if (message.serverContent?.turnComplete) {
              const userT = transcriptionRef.current.user.trim();
              const aiT = transcriptionRef.current.ai.trim();
              
              if (userT || aiT) {
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
                logger.error('Error decoding audio', err as Error);
              }
            }

            // Handle interruption
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setStatus('listening');
            }
          },
          onerror: (e: unknown) => {
            const errorMessage = e instanceof Error ? e.message : 'Unknown error';
            logger.error('Gemini Live error', new Error(errorMessage));
            setError('Connection lost. Please check your internet and try again.');
            stopSession();
          },
          onclose: () => {
            logger.info('Gemini Live session closed');
            setIsActive(false);
            setStatus('idle');
          }
        }
      });

      sessionRef.current = await sessionPromise;
      
    } catch (err: any) {
      logger.error('Failed to start voice session', err);
      setError(err.message || 'Failed to start voice session. Please try again.');
      setStatus('idle');
      stopSession();
    }
  }, [selectedVoice]);

  const stopSession = useCallback(() => {
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
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
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

  return {
    isActive,
    status,
    messages,
    error,
    selectedVoice,
    setSelectedVoice,
    startSession,
    stopSession,
  };
}
