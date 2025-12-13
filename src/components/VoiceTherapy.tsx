import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mic, Square, VolumeX, Shield } from 'lucide-react';
import { useGeminiVoiceTherapy } from '@/hooks/useGeminiVoiceTherapy';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CrisisIntervention } from './safety/CrisisIntervention';

export const VoiceTherapy = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const {
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
  } = useGeminiVoiceTherapy();

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

  const getRiskColor = () => {
    if (riskLevel === 'critical') return 'text-red-600';
    if (riskLevel === 'clouded') return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusText = () => {
    if (isSpeaking) return '🔊 AI Speaking...';
    if (isListening) return '🎤 Listening...';
    return 'Ready - Click to speak';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Guardian Badge */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
          <Shield className="w-4 h-4" />
          Guardian Protected
        </div>
        <p className="text-purple-100 text-sm">
          🎙️ Free browser speech recognition • 🧠 Powered by Gemini
        </p>
      </div>

      {/* Guardian Status Card */}
      <Card className="p-6 mb-6 bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Well-Being Score</div>
            <div className={`text-3xl font-bold ${getRiskColor()}`}>
              {wbcScore}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <div className={`font-semibold ${getRiskColor()}`}>
              {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
            </div>
          </div>
        </div>
      </Card>

      {/* Status Display */}
      <div className="text-center mb-6">
        <div className={`inline-block px-6 py-3 rounded-full ${isListening ? 'bg-blue-500 animate-pulse' :
          isSpeaking ? 'bg-green-500' :
            'bg-white/90'
          }`}>
          <span className={`font-semibold ${isListening || isSpeaking ? 'text-white' : 'text-gray-800'
            }`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6 justify-center flex-wrap">
        <Button
          onClick={startListening}
          disabled={isListening || isSpeaking}
          size="lg"
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg"
        >
          {isListening ? (
            <>
              <Mic className="mr-2 h-6 w-6 animate-pulse" />
              Listening...
            </>
          ) : (
            <>
              <Mic className="mr-2 h-6 w-6" />
              Start Therapy Session
            </>
          )}
        </Button>

        {isListening && (
          <Button
            onClick={stopListening}
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg border-2"
          >
            <Square className="mr-2 h-6 w-6" />
            Stop
          </Button>
        )}

        {isSpeaking && (
          <Button
            onClick={stopSpeaking}
            size="lg"
            variant="destructive"
            className="px-8 py-6 text-lg"
          >
            <VolumeX className="mr-2 h-6 w-6" />
            Mute AI
          </Button>
        )}
      </div>

      {/* Conversation Transcript */}
      <Card className="p-6 bg-white/95 backdrop-blur min-h-[300px] max-h-[500px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <Mic className="mx-auto h-12 w-12 mb-3 opacity-30" />
            <p className="text-lg mb-2">Click "Start Therapy Session" to begin</p>
            <p className="text-sm">Your voice will be analyzed with Guardian safety protection</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${msg.role === 'user'
                  ? 'bg-blue-50 ml-8'
                  : 'bg-green-50 mr-8'
                  }`}
              >
                <div className="text-xs font-semibold text-gray-600 mb-1">
                  {msg.role === 'user' ? 'You' : 'AI Therapist'}
                </div>
                <div className="text-gray-800">{msg.text}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Safety Notice */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-500/30">
        <p className="text-sm text-white/80 text-center">
          🛡️ <strong>Project Guardian Protected</strong> - If you're experiencing a crisis,
          please contact the 988 Suicide & Crisis Lifeline.
        </p>
      </div>

      {/* Crisis Modal */}
      {showCrisisModal && (
        <CrisisIntervention
          isOpen={showCrisisModal}
          onClose={closeCrisisModal}
        />
      )}
    </div>
  );
};
