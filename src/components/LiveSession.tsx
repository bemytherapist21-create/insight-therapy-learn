import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { decode, decodeAudioData, createBlob } from '../services/audio';

interface LiveSessionProps {
    onBack: () => void;
}

type VoicePersona = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

const LiveSession: React.FC<LiveSessionProps> = ({ onBack }) => {
    const [isActive, setIsActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
    const [selectedVoice, setSelectedVoice] = useState<VoicePersona>('Kore');
    const [transcriptions, setTranscriptions] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [error, setError] = useState<string | null>(null);

    const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
    const sessionRef = useRef<any>(null);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef(0);
    const transcriptionRef = useRef({ user: '', ai: '' });
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [transcriptions, status]);

    const startSession = async () => {
        setIsConnecting(true);
        setError(null);
        setStatus('thinking');

        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || process.env.API_KEY });

            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = { input: inputAudioContext, output: outputAudioContext };

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.0-flash-exp', // Updated model name as per Journal component or assume latest
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
                    },
                    systemInstruction: `You are Insight, a compassionate and expert AI therapist. 
          Respond exclusively via voice. Be natural, supportive, and succinct.
          Help the user explore their feelings through empathetic listening.`,
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        setIsConnecting(false);
                        setIsActive(true);
                        setStatus('listening');
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);

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
                        if (message.serverContent?.outputTranscription) {
                            transcriptionRef.current.ai += message.serverContent.outputTranscription.text;
                            setStatus('speaking');
                        } else if (message.serverContent?.inputTranscription) {
                            transcriptionRef.current.user += message.serverContent.inputTranscription.text;
                            setStatus('listening');
                        }

                        if (message.serverContent?.turnComplete) {
                            const userT = transcriptionRef.current.user;
                            const aiT = transcriptionRef.current.ai;
                            if (userT || aiT) {
                                setTranscriptions(prev => [
                                    ...prev,
                                    ...(userT ? [{ role: 'user' as const, text: userT }] : []),
                                    ...(aiT ? [{ role: 'ai' as const, text: aiT }] : [])
                                ]);
                            }
                            transcriptionRef.current = { user: '', ai: '' };
                            setStatus('listening');
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            setStatus('speaking');
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContext.destination);
                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                                if (sourcesRef.current.size === 0) setStatus('listening');
                            });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(s => s.stop());
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                            setStatus('listening');
                        }
                    },
                    onerror: (e) => {
                        setError("The connection was lost. Please check your internet and try again.");
                        stopSession();
                    },
                    onclose: () => {
                        setIsActive(false);
                        setStatus('idle');
                    }
                }
            });

            sessionRef.current = await sessionPromise;
        } catch (err: any) {
            setError("We need access to your microphone to start a voice session.");
            setIsConnecting(false);
            setStatus('idle');
        }
    };

    const stopSession = () => {
        if (sessionRef.current) sessionRef.current.close();
        if (audioContextRef.current) {
            audioContextRef.current.input.close();
            audioContextRef.current.output.close();
        }
        setIsActive(false);
        setStatus('idle');
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-slate-900">Voice Space</h1>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status}</p>
                        </div>
                    </div>
                </div>
                {!isActive && !isConnecting && (
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {(['Kore', 'Puck', 'Zephyr'] as VoicePersona[]).map(voice => (
                            <button
                                key={voice}
                                onClick={() => setSelectedVoice(voice)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-tighter ${selectedVoice === voice ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {voice}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 bg-white rounded-[40px] shadow-2xl shadow-indigo-100/30 border border-slate-100 overflow-hidden flex flex-col relative">
                {/* Glow Aura when AI speaks */}
                <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${status === 'speaking' ? 'opacity-25' : 'opacity-0'}`}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-600 blur-[120px] rounded-full animate-pulse" />
                </div>

                {!isActive && !isConnecting ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="relative group mb-10">
                            <div className="absolute inset-0 bg-indigo-600 blur-3xl opacity-20 animate-pulse" />
                            <div className="relative w-28 h-28 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl cursor-pointer hover:scale-110 transition-transform" onClick={startSession}>
                                <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Start a Voice Session</h2>
                        <p className="text-slate-500 mb-10 max-w-sm leading-relaxed">Insight hears the nuance in your voice. Speak naturally about your day, your feelings, or your goals.</p>
                        <button onClick={startSession} className="px-10 py-4 bg-indigo-600 text-white rounded-[24px] font-bold shadow-xl hover:bg-indigo-700 transition-all hover:-translate-y-1">Connect Now</button>
                        {error && <p className="mt-8 text-red-500 text-sm font-semibold bg-red-50 px-4 py-2 rounded-full border border-red-100">{error}</p>}
                    </div>
                ) : isConnecting ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="flex gap-2 mb-6">
                            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" />
                        </div>
                        <p className="font-serif italic text-xl text-slate-600 tracking-tight">Securing voice link...</p>
                    </div>
                ) : (
                    <>
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth">
                            {transcriptions.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-40">
                                    <p className="font-serif italic text-xl text-slate-400">Say anything, I'm listening...</p>
                                </div>
                            )}
                            {transcriptions.map((t, i) => (
                                <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
                                    <div className={`
                      max-w-[85%] px-8 py-5 rounded-[35px] shadow-sm
                      ${t.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-lg'
                                            : 'bg-slate-100 text-slate-800 rounded-bl-lg font-serif italic text-xl'}
                    `}>
                                        {t.text}
                                    </div>
                                </div>
                            ))}
                            {status === 'thinking' && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-50 px-6 py-4 rounded-full flex gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse" />
                                        <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-10 bg-slate-50/50 border-t border-slate-100 backdrop-blur-sm">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center gap-2 h-16 mb-8">
                                    {[...Array(24)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-1.5 rounded-full bg-indigo-500 transition-all duration-200 ${status === 'speaking' ? 'animate-pulse' : 'h-1 opacity-20'}`}
                                            style={{
                                                height: status === 'speaking' ? `${Math.random() * 50 + 10}px` : '4px',
                                                animationDelay: `${i * 0.05}s`
                                            }}
                                        />
                                    ))}
                                </div>
                                <button onClick={stopSession} className="group relative">
                                    <div className="absolute inset-0 bg-red-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
                                    <div className="relative p-6 bg-white text-red-500 rounded-full border border-red-100 shadow-xl hover:bg-red-50 transition-all hover:scale-105 active:scale-95">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LiveSession;
