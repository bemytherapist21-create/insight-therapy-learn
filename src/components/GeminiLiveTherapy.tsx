import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGeminiLive } from "@/hooks/useGeminiLive";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";

interface GeminiLiveTherapyProps {
  onBack?: () => void;
}

export const GeminiLiveTherapy = ({ onBack }: GeminiLiveTherapyProps) => {
  const {
    isConnected,
    isSpeaking,
    isListening,
    error,
    startSession,
    stopSession,
  } = useGeminiLive();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Experimental Warning Banner */}
      <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500/50 rounded-lg">
        <p className="text-orange-400 text-sm text-center font-medium">
          ⚡ EXPERIMENTAL FEATURE - Gemini Live API (Preview)
        </p>
        <p className="text-orange-300/70 text-xs text-center mt-1">
          Real-time AI voice conversation - May have performance impacts
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column: Controls */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Live Voice Therapy
            </h2>

            <div className="space-y-4">
              {/* Connection Status */}
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Status</span>
                  <span
                    className={`text-sm font-medium ${
                      isConnected ? "text-green-400" : "text-gray-500"
                    }`}
                  >
                    {isConnected ? "● Connected" : "○ Disconnected"}
                  </span>
                </div>

                {isListening && (
                  <div className="flex items-center gap-2 text-sm text-blue-400">
                    <Mic className="w-4 h-4 animate-pulse" />
                    <span>Listening...</span>
                  </div>
                )}

                {isSpeaking && (
                  <div className="flex items-center gap-2 text-sm text-purple-400">
                    <Phone className="w-4 h-4 animate-pulse" />
                    <span>AI Speaking...</span>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">Error: {error}</p>
                </div>
              )}

              {/* Start/Stop Button */}
              {!isConnected ? (
                <Button
                  onClick={startSession}
                  className="w-full bg-gradient-primary hover:shadow-glow"
                  size="lg"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Start Live Session
                </Button>
              ) : (
                <Button
                  onClick={stopSession}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  End Session
                </Button>
              )}

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-400 mb-2">
                  How it works:
                </h3>
                <ul className="text-xs text-blue-300/80 space-y-1">
                  <li>• Click "Start Live Session"</li>
                  <li>• Allow microphone access</li>
                  <li>• Speak naturally to the AI</li>
                  <li>• AI responds in real-time</li>
                  <li>• Click "End Session" when done</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Avatar/Visualization */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="relative">
              {/* AI Avatar */}
              <div
                className={`w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center transition-all duration-300 ${
                  isSpeaking
                    ? "scale-110 shadow-glow"
                    : isListening
                      ? "scale-105"
                      : "scale-100"
                }`}
              >
                <Phone className="w-16 h-16 text-white" />
              </div>

              {/* Pulse Animation */}
              {(isListening || isSpeaking) && (
                <div className="absolute -inset-4">
                  <div
                    className={`absolute inset-0 rounded-full ${
                      isSpeaking ? "bg-purple-500/30" : "bg-blue-500/30"
                    } animate-ping`}
                  />
                </div>
              )}
            </div>

            {/* Status Text */}
            <div className="mt-8 text-center">
              <p className="text-lg font-medium text-gray-300">
                {!isConnected && "Ready to start"}
                {isConnected && !isSpeaking && !isListening && "Connected"}
                {isListening && "Listening to you..."}
                {isSpeaking && "AI is speaking..."}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {isConnected
                  ? "Speak naturally, just like talking to a friend"
                  : "Click the button to begin your therapy session"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tech Info (Debug) */}
      <div className="mt-6 p-3 bg-gray-900/50 rounded-lg text-xs text-gray-500">
        <p>
          Model: gemini-2.0-flash-exp | Mode: Live Audio | API: Google Gemini
          Multimodal
        </p>
      </div>
    </div>
  );
};
