import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Loader2, MicOff, Video, Mic, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/safeClient";
import { toast } from "sonner";
import { CrisisResourcesBanner } from "@/components/safety/CrisisResourcesBanner";

// Voice Therapy - Gemini via Lovable AI (NO OpenAI, NO Browser Speech API)

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceTherapyProps {
  onBack?: () => void;
}

export const VoiceTherapy = ({ onBack }: VoiceTherapyProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to use voice therapy");
      navigate("/login?redirect=/ai-therapy/voice");
    }
  }, [user, authLoading, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Transcribe audio using Gemini via Lovable AI
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        "",
      ),
    );

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          audio: base64Audio,
          mimeType: audioBlob.type,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Transcription failed");
    }

    const data = await response.json();
    return data.transcript || "";
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        await processRecording(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording... Click Stop when done");
    } catch (error) {
      console.error("Microphone error:", error);
      toast.error(
        "Microphone access denied. Please allow microphone access in your browser settings.",
      );
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop microphone stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }, [isRecording]);

  const processRecording = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Transcribe audio using Gemini
      const transcript = await transcribeAudio(audioBlob);

      if (!transcript.trim()) {
        toast.info("No speech detected. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Process the transcribed message
      await processUserMessage(transcript);
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Failed to process audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const processUserMessage = async (transcript: string) => {
    // Add user message
    const userMsg: Message = { role: "user", content: transcript };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Get user session for authenticated call
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/therapy-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            message: transcript,
            conversationId: null,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const aiMessage =
        data.reply ||
        data.message ||
        "I apologize, I couldn't generate a response.";

      // Add AI message
      const assistantMsg: Message = { role: "assistant", content: aiMessage };
      setMessages((prev) => [...prev, assistantMsg]);

      // Speak the response
      speak(aiMessage);
    } catch (error) {
      const errorMsg = "I apologize, there was an error. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMsg },
      ]);
      speak(errorMsg);
    }
  };

  const speak = async (text: string) => {
    try {
      setIsSpeaking(true);

      // Use MiniMax TTS via Edge Function for natural voice
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/minimax-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ text }),
        },
      );

      if (!response.ok) {
        throw new Error("TTS API failed");
      }

      // The function returns raw audio bytes
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("MiniMax TTS error, falling back to browser voice:", error);

      // Fallback to browser speech synthesis if TTS fails
      if ("speechSynthesis" in window) {
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

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const getStatusText = () => {
    if (isSpeaking) return "AI Speaking...";
    if (isProcessing) return "Processing...";
    if (isRecording) return "Recording...";
    return "Ready to connect";
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
              <h2 className="text-2xl font-bold text-white mb-2">
                AI Voice Therapist
              </h2>
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-green-500 transition-colors duration-500">
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
                  calm
                </Badge>
              </div>
            </div>

            {/* Heartbeat Icon with Ripples */}
            <div className="flex justify-center mb-6 py-8">
              <div className="relative flex items-center justify-center">
                {/* Ripple rings - only when recording */}
                {isRecording && (
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
                    isRecording || isProcessing
                      ? "bg-gradient-to-br from-blue-400 to-cyan-500"
                      : "bg-white/5 border-2 border-white/20"
                  }`}
                >
                  {isRecording ? (
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

              {!isRecording ? (
                <div className="space-y-3">
                  <Button
                    onClick={startRecording}
                    disabled={isSpeaking || isProcessing}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-glow px-8 min-w-[200px]"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Start Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 w-full max-w-xs mx-auto">
                  <Button
                    onClick={() => {
                      // Toggle mute - stop/start recording
                      if (mediaRecorderRef.current?.state === "recording") {
                        mediaRecorderRef.current.pause();
                        toast.info("Microphone muted");
                      } else if (mediaRecorderRef.current?.state === "paused") {
                        mediaRecorderRef.current.resume();
                        toast.info("Microphone unmuted");
                      }
                    }}
                    variant="outline"
                    className="w-full bg-black/40 border-gray-500/50 text-gray-300 hover:bg-gray-500/10"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Mute
                  </Button>

                  <Button
                    onClick={stopRecording}
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
                    <p className="text-xs font-medium opacity-70">
                      Visual presence active
                    </p>
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
        <CrisisResourcesBanner variant="minimal" />
      </div>
    </div>
  );
};
