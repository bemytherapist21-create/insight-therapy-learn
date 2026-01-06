import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2, Phone, MicOff, Video, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/safeClient';
import { toast } from 'sonner';

// Voice Therapy - Gemini via Supabase (NO OpenAI)

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface VoiceTherapyProps {
  onBack?: () => void;
}

export const VoiceTherapy = ({ onBack }: VoiceTherapyProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      const currentPath = window.location.pathname;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, authLoading, navigate]);

  // Initialize speech recognition - EXACTLY like standalone
  useEffect(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        await processUserMessage(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);

        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone in browser settings.');
        } else if (event.error === 'network') {
          toast.error('Speech recognition service unavailable. Please check your internet connection and try again.');
        } else if (event.error === 'no-speech') {
          toast.info('No speech detected. Please try speaking again.');
          // Auto-restart if just no speech detected
          if (isListening) {
            setTimeout(() => {
              try {
                recognitionRef.current?.start();
              } catch (e) {
                // Ignore if already started
              }
            }, 500);
          }
        } else {
          toast.error(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const processUserMessage = async (transcript: string) => {
    // Add user message
    const userMsg: Message = { role: 'user', content: transcript };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Get user session for authenticated call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/therapy-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({
          message: transcript,
          conversationId: null
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const aiMessage = data.reply || data.message || 'I apologize, I couldn\'t generate a response.';

      // Add AI message
      const assistantMsg: Message = { role: 'assistant', content: aiMessage };
      setMessages(prev => [...prev, assistantMsg]);

      // Speak the response
      speak(aiMessage);

    } catch (error) {
      const errorMsg = 'I apologize, there was an error. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      speak(errorMsg);
    }
  };

  const speak = async (text: string) => {
    try {
      setIsSpeaking(true);

      // Use Google Cloud Text-to-Speech for natural Indian English voice
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyCT0TF5qBkMXm_03EKuWvQ22EssPKYwwrA`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: 'en-IN',
              name: 'en-IN-Neural2-A', // Natural Indian English female voice
              ssmlGender: 'FEMALE'
            },
            audioConfig: {
              audioEncoding: 'MP3',
              pitch: 0,
              speakingRate: 0.95 // Slightly slower for clarity
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('TTS API failed');
      }

      const data = await response.json();
      const audio = new Audio('data:audio/mp3;base64,' + data.audioContent);

      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);

      await audio.play();
    } catch (error) {
      console.error('Google TTS error, falling back to browser voice:', error);

      // Fallback to browser speech synthesis if Google TTS fails
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      toast.success('Listening... Please speak now');
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      toast.error(`Failed to start: ${errorMessage}`);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.info('Stopped listening');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      toast.info('Microphone muted');
    } else {
      toast.info('Microphone unmuted');
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const getStatusText = () => {
    if (isSpeaking) return 'AI Speaking...';
    if (isListening) return 'Listening...';
    return 'Ready to connect';
  };

  return (
    <div className="max-w-4xl mx-auto h-[600px]">
      {/* Two Column Grid */}
      <div className="grid md:grid-cols-2 gap-6 h-full">
        {/* Left Panel - Voice Controls */}
        <Card className="glass-card overflow-hidden h-full">
          <div className="p-8 flex flex-col items-center justify-between h-full">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">AI Voice Therapist</h2>
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-green-500 transition-colors duration-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  calm
                </Badge>
              </div>
            </div>

            {/* Heartbeat Icon with Ripples */}
            <div className="flex justify-center mb-6 py-8">
              <div className="relative flex items-center justify-center">
                {/* Ripple rings - only when listening */}
                {isListening && (
                  <>
                    <div className="absolute w-48 h-48 rounded-full border-2 border-cyan-500/30 animate-ping" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute w-40 h-40 rounded-full border-2 border-cyan-500/40 animate-ping" style={{ animationDuration: '1.5s' }}></div>
                  </>
                )}

                {/* Main circle */}
                <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl relative z-10 transition-all duration-500 ${isListening
                  ? 'bg-gradient-to-br from-blue-400 to-cyan-500'
                  : 'bg-white/5 border-2 border-white/20'
                  }`}>
                  {isListening ? (
                    /* Heartbeat icon when session active */
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                  ) : (
                    /* Muted mic icon when idle */
                    <MicOff className="w-12 h-12 text-white/40" />
                  )}
                </div>
              </div>
            </div>

            {/* Status and Button */}
            <div className="w-full text-center">
              <div className="h-8 mb-8">
                <p className="text-lg font-medium text-white/50">
                  {getStatusText()}
                </p>
              </div>

              {!isListening ? (
                <Button
                  onClick={startListening}
                  disabled={isSpeaking}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-glow px-8 min-w-[200px]"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Start Session
                </Button>
              ) : (
                <div className="space-y-3 w-full max-w-xs mx-auto">
                  <Button
                    onClick={toggleMute}
                    variant="outline"
                    className={`w-full ${isMuted ? 'bg-black/40 border-red-500/50 text-red-400' : 'bg-black/40 border-gray-500/50 text-gray-300'} hover:bg-red-500/10 hover:text-red-300 hover:border-red-400`}
                  >
                    <MicOff className="w-4 h-4 mr-2" />
                    {isMuted ? 'Unmute' : 'Mute'} Microphone
                  </Button>

                  <Button
                    onClick={stopListening}
                    variant="outline"
                    className="w-full bg-black/40 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-400"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    End Session
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Right Panel - Avatar and Conversation */}
        <Card className="glass-card overflow-hidden h-full">
          <div className="p-6 flex flex-col h-full">
            {/* AI Avatar Section */}
            <div className="mb-4 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-4 h-4 text-white/70" />
                <h3 className="text-sm font-medium text-white/70">AI Avatar</h3>
              </div>

              <div className="aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/10 relative group">
                <div className="w-full h-full flex items-center justify-center text-white/30 bg-gradient-to-b from-black/0 to-black/20">
                  <div className="text-center">
                    <img
                      src="https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg"
                      alt="AI Therapist"
                      className="w-24 h-24 rounded-full mx-auto mb-3 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    <p className="text-xs font-medium opacity-70">Visual presence active</p>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] text-white/40 bg-black/60 px-2 py-1 rounded">
                    Avatar animates during long responses
                  </p>
                </div>
              </div>
            </div>

            {/* Conversation Section */}
            <div className="flex-1 min-h-0 flex flex-col">
              <h3 className="text-sm font-medium text-white/70 mb-2 shrink-0">Conversation</h3>

              <div className="flex-1 bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                <ScrollArea className="h-full w-full p-3">
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center py-8">
                        <p className="text-white/30 text-sm text-center italic">
                          Transcript will appear here...
                        </p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${msg.role === 'user'
                            ? 'bg-blue-500/20 ml-4'
                            : 'bg-green-500/20 mr-4'
                            }`}
                        >
                          <div className="text-xs text-white/60 mb-1">
                            {msg.role === 'user' ? '🎤 You' : '🔊 AI Therapist'}
                          </div>
                          <div className="text-sm text-white">{msg.content}</div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Guardian Notice */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-500/30">
        <p className="text-sm text-white/80 text-center">
          🛡️ <strong>Project Guardian Protected</strong> - If you're experiencing a crisis, please contact the 988 Suicide &amp; Crisis Lifeline.
        </p>
      </div>
    </div>
  );
};
