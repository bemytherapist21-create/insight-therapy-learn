import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Loader2, Phone, MicOff, Video, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

// Voice Therapy - Minimax Integration with Cloned Voice

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceTherapyProps {
  onBack?: () => void;
}

export const VoiceTherapyMinimax = ({ onBack }: VoiceTherapyProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [riskLevel, setRiskLevel] = useState<string>("GREEN");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      const currentPath = window.location.pathname;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, authLoading, navigate]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await processAudioWithMinimax(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      toast.success("Recording... Speak now!");

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          stopListening();
        }
      }, 10000);
    } catch (error: any) {
      toast.error(
        "Microphone access denied. Please allow microphone permissions.",
      );
      console.error("Media error:", error);
    }
  };

  const stopListening = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      toast.info("Processing your message...");
    }
  };

  const processAudioWithMinimax = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("user_id", user?.id || "anonymous");
      formData.append("session_id", `session_${Date.now()}`);

      const response = await fetch(
        "http://localhost:8000/api/voice-therapy-minimax",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();

      // Add user message (transcript)
      const userMsg: Message = { role: "user", content: data.transcript };
      setMessages((prev) => [...prev, userMsg]);

      // Add AI message (response)
      const assistantMsg: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Update risk level
      setRiskLevel(data.risk_level || "GREEN");

      // Play audio response with cloned voice
      if (data.audio_url) {
        await playAudioResponse(`http://localhost:8000${data.audio_url}`);
      }

      // Show safety info if needed
      if (data.crisis_detected) {
        toast.error("Crisis detected! Please contact 988 for immediate help.", {
          duration: 10000,
        });
      } else if (data.wbc_score > 70) {
        toast.warning(
          `Well-being concern detected (Score: ${data.wbc_score})`,
          {
            duration: 5000,
          },
        );
      }
    } catch (error: any) {
      const errorMsg = "I apologize, there was an error. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMsg },
      ]);
      toast.error(error.message || "Failed to process audio");
      console.error("Minimax processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudioResponse = async (audioUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        setIsSpeaking(true);

        // Stop any currently playing audio
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current = null;
        }

        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          currentAudioRef.current = null;
          resolve();
        };

        audio.onerror = (error) => {
          setIsSpeaking(false);
          currentAudioRef.current = null;
          toast.error("Failed to play audio response");
          reject(error);
        };

        audio.play().catch((error) => {
          setIsSpeaking(false);
          currentAudioRef.current = null;
          reject(error);
        });
      } catch (error) {
        setIsSpeaking(false);
        reject(error);
      }
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? "Microphone unmuted" : "Microphone muted");
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case "RED":
        return "bg-red-500";
      case "ORANGE":
        return "bg-orange-500";
      case "YELLOW":
        return "bg-yellow-500";
      case "GREEN":
      default:
        return "bg-green-500";
    }
  };

  const getStatusText = () => {
    if (isProcessing) return "Processing with Minimax AI...";
    if (isSpeaking) return "AI Speaking (Your Cloned Voice)...";
    if (isListening) return "Listening...";
    return "Ready to connect";
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="max$ w-4xl mx-auto h-[600px]">
      {/* Two Column Grid */}
      <div className="grid md:grid-cols-2 gap-6 h-full">
        {/* Left Panel - Voice Controls */}
        <Card className="glass-card overflow-hidden h-full">
          <div className="p-8 flex flex-col items-center justify-between h-full">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                AI Voice Therapist
              </h2>
              <div className="flex items-center justify-center gap-2">
                <Badge
                  className={`${getRiskColor()} transition-colors duration-500`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  {riskLevel.toLowerCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  🎙️ Minimax Cloned Voice
                </Badge>
              </div>
            </div>

            {/* Heartbeat Icon with Ripples */}
            <div className="flex justify-center mb-6 py-8">
              <div className="relative flex items-center justify-center">
                {/* Ripple rings - only when listening */}
                {isListening && (
                  <>
                    <div
                      className="absolute w-48 h-48 rounded-full border-2 border-cyan-500/30 animate-ping"
                      style={{ animationDuration: "2s" }}
                    ></div>
                    <div
                      className="absolute w-40 h-40 rounded-full border-2 border-cyan-500/40 animate-ping"
                      style={{ animationDuration: "1.5s" }}
                    ></div>
                  </>
                )}

                {/* Main circle */}
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl relative z-10 transition-all duration-500 ${
                    isListening
                      ? "bg-gradient-to-br from-blue-400 to-cyan-500"
                      : "bg-white/5 border-2 border-white/20"
                  }`}
                >
                  {isListening ? (
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
                      className="animate-pulse"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                  ) : isProcessing ? (
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  ) : (
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

              {!isListening && !isProcessing ? (
                <Button
                  onClick={startListening}
                  disabled={isSpeaking}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-glow px-8 min-w-[200px]"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Start Session
                </Button>
              ) : isListening ? (
                <Button
                  onClick={stopListening}
                  variant="outline"
                  className="w-full max-w-xs bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              ) : null}
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
                    <p className="text-xs font-medium opacity-70">
                      Visual presence active
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
                          Transcript will appear here...
                        </p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-blue-500/20 ml-4"
                              : "bg-green-500/20 mr-4"
                          }`}
                        >
                          <div className="text-xs text-white/60 mb-1">
                            {msg.role === "user" ? "🎤 You" : "🔊 AI Therapist"}
                          </div>
                          <div className="text-sm text-white">
                            {msg.content}
                          </div>
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
          🛡️ <strong>Project Guardian Protected</strong> - Powered by Minimax AI
          with your cloned voice. If you're experiencing a crisis, please
          contact the 988 Suicide &amp; Crisis Lifeline.
        </p>
      </div>
    </div>
  );
};
