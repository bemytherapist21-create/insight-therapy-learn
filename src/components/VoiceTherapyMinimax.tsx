import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Loader2, Phone, MicOff, Video, Square, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGeminiLiveVoice, VoicePersona } from "@/hooks/useGeminiLiveVoice";
import { toast } from "sonner";
import { useCountryDetection } from "@/hooks/useCountryDetection";

interface VoiceTherapyProps {
  onBack?: () => void;
}

export const VoiceTherapyMinimax = ({ onBack }: VoiceTherapyProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { resources } = useCountryDetection();
  
  const {
    isActive,
    status,
    messages,
    error,
    selectedVoice,
    setSelectedVoice,
    startSession,
    stopSession,
    safety,
  } = useGeminiLiveVoice();

  useEffect(() => {
    if (!authLoading && !user) {
      const currentPath = window.location.pathname;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, authLoading, navigate]);

  // Show crisis toast if detected
  useEffect(() => {
    if (safety?.crisisDetected) {
      const crisisLine = resources.find((r) => r.type === "crisis");
      toast.error("Crisis Detected", {
        description: `Please call ${crisisLine?.number || "988"} (${crisisLine?.name || "Crisis Lifeline"}) immediately for help.`,
        duration: 10000,
      });
    }
  }, [safety?.crisisDetected, resources]);

  const getStatusText = () => {
    switch (status) {
      case 'connecting': return 'Connecting...';
      case 'listening': return 'Listening...';
      case 'thinking': return 'Thinking...';
      case 'speaking': return 'AI Speaking...';
      default: return 'Ready to connect';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening': return 'bg-green-500';
      case 'speaking': return 'bg-blue-500';
      case 'thinking': return 'bg-yellow-500';
      case 'connecting': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (level?: string) => {
    if (!level) return "text-green-500";
    switch (level) {
      case "clear": return "text-green-500";
      case "clouded": return "text-yellow-500";
      case "critical": return "text-red-500";
      default: return "text-green-500";
    }
  };

  const getRiskBgColor = (level?: string) => {
    if (!level) return "bg-green-500/10 border-green-500/20";
    switch (level) {
      case "clear": return "bg-green-500/10 border-green-500/20";
      case "clouded": return "bg-yellow-500/10 border-yellow-500/20";
      case "critical": return "bg-red-500/10 border-red-500/20";
      default: return "bg-green-500/10 border-green-500/20";
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const voiceOptions: VoicePersona[] = ['Kore', 'Puck', 'Zephyr'];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Safety Status Display - like chat */}
      {safety && (
        <Card className={`p-4 border mb-4 ${getRiskBgColor(safety.riskLevel)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={`w-5 h-5 ${getRiskColor(safety.riskLevel)}`} />
              <div>
                <p className="text-sm font-medium">
                  Well-Being Coefficient: {safety.wbcScore}/100
                </p>
                <p className="text-xs text-muted-foreground">
                  {safety.colorCode}
                </p>
              </div>
            </div>
            {safety.requiresIntervention && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Intervention Required
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Two Column Grid */}
      <div className="grid md:grid-cols-2 gap-6 h-[600px]">
        {/* Left Panel - Voice Controls */}
        <Card className="glass-card overflow-hidden h-full">
          <div className="p-8 flex flex-col items-center justify-between h-full">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                AI Voice Therapist
              </h2>
              <div className="flex items-center justify-center gap-2">
                <Badge className={`${getStatusColor()} transition-colors duration-500`}>
                  <span className={`w-2 h-2 rounded-full bg-white mr-2 ${isActive ? 'animate-pulse' : ''}`} />
                  {status}
                </Badge>
                {!isActive && (
                  <Badge variant="outline" className="text-xs">
                    🎙️ Gemini Live
                  </Badge>
                )}
              </div>
            </div>

            {/* Voice Selection - Only when not active */}
            {!isActive && status === 'idle' && (
              <div className="mb-6">
                <p className="text-white/60 text-sm mb-2 text-center">Select Voice</p>
                <div className="flex gap-2">
                  {voiceOptions.map((voice) => (
                    <button
                      key={voice}
                      onClick={() => setSelectedVoice(voice)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedVoice === voice
                          ? 'bg-primary text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {voice}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Heartbeat Icon with Ripples */}
            <div className="flex justify-center mb-6 py-8">
              <div className="relative flex items-center justify-center">
                {/* Ripple rings - only when listening */}
                {status === 'listening' && (
                  <>
                    <div
                      className="absolute w-48 h-48 rounded-full border-2 border-cyan-500/30 animate-ping"
                      style={{ animationDuration: "2s" }}
                    />
                    <div
                      className="absolute w-40 h-40 rounded-full border-2 border-cyan-500/40 animate-ping"
                      style={{ animationDuration: "1.5s" }}
                    />
                  </>
                )}

                {/* Speaking glow effect */}
                {status === 'speaking' && (
                  <div className="absolute w-40 h-40 rounded-full bg-blue-500/20 animate-pulse" />
                )}

                {/* Main circle */}
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl relative z-10 transition-all duration-500 ${
                    isActive
                      ? status === 'speaking'
                        ? "bg-gradient-to-br from-blue-400 to-indigo-500"
                        : "bg-gradient-to-br from-blue-400 to-cyan-500"
                      : "bg-white/5 border-2 border-white/20"
                  }`}
                >
                  {status === 'connecting' ? (
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  ) : isActive ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={status === 'speaking' ? 'animate-pulse' : ''}
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  ) : (
                    <MicOff className="w-12 h-12 text-white/40" />
                  )}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="w-full mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Status and Button */}
            <div className="w-full text-center">
              <div className="h-8 mb-8">
                <p className="text-lg font-medium text-white/50">
                  {getStatusText()}
                </p>
              </div>

              {!isActive ? (
                <Button
                  onClick={startSession}
                  disabled={status === 'connecting'}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-glow px-8 min-w-[200px]"
                >
                  {status === 'connecting' ? (
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
                  onClick={stopSession}
                  variant="outline"
                  className="w-full max-w-xs bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                >
                  <Square className="w-4 h-4 mr-2" />
                  End Session
                </Button>
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
                      className={`w-24 h-24 rounded-full mx-auto mb-3 transition-all duration-500 ${
                        isActive ? 'opacity-100 grayscale-0' : 'opacity-50 grayscale'
                      }`}
                    />
                    <p className="text-xs font-medium opacity-70">
                      {isActive ? 'Session active' : 'Visual presence ready'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Section */}
            <div className="flex-1 min-h-0 flex flex-col">
              <h3 className="text-sm font-medium text-white/70 mb-2 shrink-0">
                Conversation
              </h3>

              <div className="flex-1 bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                <ScrollArea className="h-full w-full p-3">
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center py-8">
                        <p className="text-white/30 text-sm text-center italic">
                          {isActive ? 'Say anything, I\'m listening...' : 'Transcript will appear here...'}
                        </p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg animate-in slide-in-from-bottom-2 duration-300 ${
                            msg.role === "user"
                              ? "bg-blue-500/20 ml-4"
                              : "bg-green-500/20 mr-4"
                          }`}
                        >
                          <div className="text-xs text-white/60 mb-1">
                            {msg.role === "user" ? "🎤 You" : "🔊 AI Therapist"}
                          </div>
                          <div className="text-sm text-white">
                            {msg.text}
                          </div>
                        </div>
                      ))
                    )}
                    
                    {/* Live transcription indicator */}
                    {status === 'speaking' && (
                      <div className="flex justify-start">
                        <div className="bg-green-500/10 px-4 py-2 rounded-full flex gap-1.5">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
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
          🛡️ <strong>Project Guardian Protected</strong> - Powered by Gemini Live
          for real-time voice therapy. If you're experiencing a crisis, please
          contact the 988 Suicide &amp; Crisis Lifeline.
        </p>
      </div>
    </div>
  );
};
