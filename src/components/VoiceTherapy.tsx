import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Phone, PhoneOff, Volume2, Loader2, Video, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceTherapyProps {
  onBack: () => void;
}

interface TranscriptEntry {
  role: 'user' | 'assistant';
  text: string;
  emotion?: string;
}

const emotionColors: Record<string, string> = {
  calm: 'bg-green-500',
  happy: 'bg-yellow-500',
  sad: 'bg-blue-500',
  anxious: 'bg-purple-500',
  angry: 'bg-red-500',
  hopeless: 'bg-gray-500',
  stressed: 'bg-orange-500',
  mixed: 'bg-pink-500',
};

export const VoiceTherapy = ({ onBack }: VoiceTherapyProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<string>('calm');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const chatRef = useRef<RealtimeChat | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Analyze emotion for text
  const analyzeEmotion = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-emotion', {
        body: { text }
      });
      if (error) throw error;
      if (data?.emotion) {
        setCurrentEmotion(data.emotion);
        return data.emotion;
      }
    } catch (error) {
      console.error('Emotion analysis error:', error);
    }
    return 'mixed';
  };

  // Generate D-ID avatar video
  const generateAvatar = async (text: string) => {
    setIsGeneratingAvatar(true);
    try {
      // Create talk
      const { data: createData, error: createError } = await supabase.functions.invoke('did-avatar', {
        body: { action: 'create', text: text.substring(0, 500) }
      });
      
      if (createError || !createData?.id) {
        console.error('D-ID create error:', createError);
        return;
      }

      const talkId = createData.id;
      console.log('D-ID talk created:', talkId);

      // Poll for result (max 30 seconds)
      for (let i = 0; i < 15; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: pollData, error: pollError } = await supabase.functions.invoke('did-avatar', {
          body: { action: 'poll', talkId }
        });

        if (pollError) {
          console.error('D-ID poll error:', pollError);
          continue;
        }

        if (pollData?.status === 'done' && pollData?.result_url) {
          setAvatarUrl(pollData.result_url);
          console.log('Avatar video ready:', pollData.result_url);
          return pollData.result_url;
        }

        if (pollData?.status === 'error') {
          console.error('D-ID generation failed');
          break;
        }
      }
    } catch (error) {
      console.error('Avatar generation error:', error);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  // Save message to database
  const saveMessage = async (role: 'user' | 'assistant', text: string, emotion?: string, avatarUrl?: string) => {
    if (!sessionId) return;
    
    try {
      await supabase.from('voice_messages').insert({
        session_id: sessionId,
        role,
        text,
        emotion,
        avatar_url: avatarUrl
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  // Create new session
  const createSession = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase.from('voice_sessions').insert({
        user_id: user.id
      }).select().single();
      
      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  };

  // Update session emotion
  const updateSessionEmotion = async (emotion: string) => {
    if (!sessionId) return;
    
    try {
      await supabase.from('voice_sessions').update({
        last_emotion: emotion
      }).eq('id', sessionId);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleMessage = async (event: any) => {
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
          const entry: TranscriptEntry = { role: 'assistant', text: event.transcript };
          setTranscript(prev => [...prev, entry]);
          await saveMessage('assistant', event.transcript, currentEmotion);
          
          // Generate avatar for longer responses
          if (event.transcript.length > 30) {
            generateAvatar(event.transcript);
          }
        }
        break;
      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          const emotion = await analyzeEmotion(event.transcript);
          const entry: TranscriptEntry = { role: 'user', text: event.transcript, emotion };
          setTranscript(prev => [...prev, entry]);
          await saveMessage('user', event.transcript, emotion);
          await updateSessionEmotion(emotion);
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
    if (!user) {
      toast.error('Please sign in to use voice therapy');
      navigate('/auth');
      return;
    }
    
    setIsConnecting(true);
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create database session
      const newSessionId = await createSession();
      if (newSessionId) {
        setSessionId(newSessionId);
      }
      
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      
      setIsConnected(true);
      setIsListening(true);
      setTranscript([]);
      setAvatarUrl(null);
      
      toast.success("Connected! Start speaking when you're ready.");
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start voice session');
    } finally {
      setIsConnecting(false);
    }
  };

  const endSession = async () => {
    chatRef.current?.disconnect();
    chatRef.current = null;
    
    // Update session end time
    if (sessionId) {
      await supabase.from('voice_sessions').update({
        ended_at: new Date().toISOString()
      }).eq('id', sessionId);
    }
    
    setIsConnected(false);
    setIsSpeaking(false);
    setIsListening(false);
    setSessionId(null);
    toast.info('Session ended');
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Main Voice Interface */}
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-8">
            {/* Status Display */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">AI Voice Therapist</h2>
              <div className="flex items-center justify-center gap-2">
                <Badge className={`${emotionColors[currentEmotion] || 'bg-gray-500'}`}>
                  <Heart className="w-3 h-3 mr-1" />
                  {currentEmotion}
                </Badge>
              </div>
            </div>

            {/* Visual Feedback */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <AnimatePresence>
                  {(isSpeaking || isListening) && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: isSpeaking ? [1, 1.2, 1] : [1, 1.1, 1],
                        opacity: 1 
                      }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: isSpeaking ? 0.8 : 1.5 }}
                      className={`absolute inset-0 rounded-full ${
                        isSpeaking 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      } blur-xl opacity-50`}
                      style={{ width: 140, height: 140, margin: -15 }}
                    />
                  )}
                </AnimatePresence>
                
                <motion.div 
                  animate={{ scale: isConnecting ? [1, 1.05, 1] : 1 }}
                  transition={{ repeat: isConnecting ? Infinity : 0, duration: 1 }}
                  className={`w-28 h-28 rounded-full flex items-center justify-center ${
                    isConnected 
                      ? isSpeaking 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-white/10'
                  }`}
                >
                  {isConnecting ? (
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  ) : isConnected ? (
                    isSpeaking ? (
                      <Volume2 className="w-10 h-10 text-white" />
                    ) : (
                      <Mic className="w-10 h-10 text-white" />
                    )
                  ) : (
                    <MicOff className="w-10 h-10 text-white/50" />
                  )}
                </motion.div>
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center mb-6">
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
                      Start Session
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
          </CardContent>
        </Card>

        {/* Avatar & Transcript Panel */}
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-6">
            {/* D-ID Avatar */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Video className="w-4 h-4 text-white/70" />
                <h3 className="text-sm font-medium text-white/70">AI Avatar</h3>
                {isGeneratingAvatar && (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                )}
              </div>
              <div className="aspect-video bg-black/40 rounded-lg overflow-hidden">
                {avatarUrl ? (
                  <video 
                    src={avatarUrl} 
                    autoPlay 
                    className="w-full h-full object-cover"
                    onEnded={() => setAvatarUrl(null)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    <div className="text-center">
                      <img 
                        src="https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg"
                        alt="AI Therapist"
                        className="w-24 h-24 rounded-full mx-auto mb-2 opacity-50"
                      />
                      <p className="text-xs">Avatar will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transcript */}
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-2">Conversation</h3>
              <div className="h-48 overflow-y-auto bg-black/20 rounded-lg p-3 space-y-2">
                {transcript.length === 0 ? (
                  <p className="text-white/30 text-sm text-center">
                    Transcript will appear here...
                  </p>
                ) : (
                  transcript.slice(-10).map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      {entry.emotion && (
                        <Badge className={`${emotionColors[entry.emotion]} text-xs shrink-0`}>
                          {entry.emotion}
                        </Badge>
                      )}
                      <p className={`text-sm ${
                        entry.role === 'user' ? 'text-purple-300' : 'text-cyan-300'
                      }`}>
                        <span className="font-medium">
                          {entry.role === 'user' ? 'You: ' : 'Guardian: '}
                        </span>
                        {entry.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
