import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff, Phone, PhoneOff, Volume2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceTherapyProps {
  onBack: () => void;
}

export const VoiceTherapy = ({ onBack }: VoiceTherapyProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Voice event:', event.type);
    
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
          setTranscript(prev => [...prev, `Guardian: ${event.transcript}`]);
        }
        break;
      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          setTranscript(prev => [...prev, `You: ${event.transcript}`]);
        }
        break;
      case 'input_audio_buffer.speech_started':
        setIsListening(false);
        break;
      case 'input_audio_buffer.speech_stopped':
        setIsListening(true);
        break;
      case 'error':
        console.error('Realtime error:', event);
        toast.error('Connection error. Please try again.');
        break;
    }
  };

  const startSession = async () => {
    setIsConnecting(true);
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      
      setIsConnected(true);
      setIsListening(true);
      setTranscript([]);
      
      toast.success("Connected! Start speaking when you're ready.");
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start voice session');
    } finally {
      setIsConnecting(false);
    }
  };

  const endSession = () => {
    chatRef.current?.disconnect();
    chatRef.current = null;
    setIsConnected(false);
    setIsSpeaking(false);
    setIsListening(false);
    toast.info('Session ended');
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-8">
          {/* Status Display */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">AI Voice Therapist</h2>
            <p className="text-white/70">
              {isConnected 
                ? "Session active - speak naturally" 
                : "Start a voice session with Guardian"}
            </p>
          </div>

          {/* Visual Feedback */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Outer ring animation */}
              <AnimatePresence>
                {(isSpeaking || isListening) && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: isSpeaking ? [1, 1.2, 1] : [1, 1.1, 1],
                      opacity: 1 
                    }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: isSpeaking ? 0.8 : 1.5 
                    }}
                    className={`absolute inset-0 rounded-full ${
                      isSpeaking 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    } blur-xl opacity-50`}
                    style={{ width: 160, height: 160, margin: -20 }}
                  />
                )}
              </AnimatePresence>
              
              {/* Main circle */}
              <motion.div 
                animate={{ 
                  scale: isConnecting ? [1, 1.05, 1] : 1 
                }}
                transition={{ repeat: isConnecting ? Infinity : 0, duration: 1 }}
                className={`w-32 h-32 rounded-full flex items-center justify-center ${
                  isConnected 
                    ? isSpeaking 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-white/10'
                }`}
              >
                {isConnecting ? (
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                ) : isConnected ? (
                  isSpeaking ? (
                    <Volume2 className="w-12 h-12 text-white" />
                  ) : (
                    <Mic className="w-12 h-12 text-white" />
                  )
                ) : (
                  <MicOff className="w-12 h-12 text-white/50" />
                )}
              </motion.div>
            </div>
          </div>

          {/* Status Text */}
          <div className="text-center mb-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-medium"
              >
                {isConnecting ? (
                  <span className="text-yellow-400">Connecting...</span>
                ) : isConnected ? (
                  isSpeaking ? (
                    <span className="text-cyan-400">Guardian is speaking...</span>
                  ) : (
                    <span className="text-purple-400">Listening to you...</span>
                  )
                ) : (
                  <span className="text-white/50">Ready to connect</span>
                )}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Transcript */}
          {transcript.length > 0 && (
            <div className="mb-8 max-h-48 overflow-y-auto bg-black/20 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white/50 mb-2">Conversation</h3>
              {transcript.slice(-6).map((line, idx) => (
                <p 
                  key={idx} 
                  className={`text-sm mb-1 ${
                    line.startsWith('You:') ? 'text-purple-300' : 'text-cyan-300'
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            {!isConnected ? (
              <Button
                onClick={startSession}
                disabled={isConnecting}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-glow px-8"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5 mr-2" />
                    Start Voice Session
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={endSession}
                size="lg"
                variant="destructive"
                className="px-8"
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                End Session
              </Button>
            )}
          </div>

          {/* Instructions */}
          {!isConnected && (
            <div className="mt-8 text-center text-sm text-white/50">
              <p>Click "Start Voice Session" and allow microphone access.</p>
              <p>Speak naturally - Guardian will respond with voice.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safety Notice */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-500/30">
        <p className="text-sm text-white/80 text-center">
          🛡️ <strong>Project Guardian Protected</strong> - If you're experiencing a crisis, 
          please contact the 988 Suicide & Crisis Lifeline.
        </p>
      </div>
    </div>
  );
};
