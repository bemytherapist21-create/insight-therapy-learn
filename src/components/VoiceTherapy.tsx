import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useVoiceTherapy } from '@/hooks/useVoiceTherapy';
import { VoiceStatus } from './voice/VoiceStatus';
import { AvatarDisplay } from './voice/AvatarDisplay';

interface VoiceTherapyProps {
  onBack: () => void;
}

export const VoiceTherapy = ({ onBack }: VoiceTherapyProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const {
    status,
    isSpeaking,
    isListening,
    transcript,
    currentEmotion,
    avatarUrl,
    isAvatarGenerating,
    startSession,
    endSession
  } = useVoiceTherapy();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[600px]">
      <div className="grid md:grid-cols-2 gap-6 h-full">
        <VoiceStatus
          status={status}
          isSpeaking={isSpeaking}
          isListening={isListening}
          currentEmotion={currentEmotion}
          onStartSession={startSession}
          onEndSession={endSession}
        />

        <AvatarDisplay
          avatarUrl={avatarUrl}
          isGenerating={isAvatarGenerating}
          transcript={transcript}
        />
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
