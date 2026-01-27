import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  Volume2,
  VolumeX,
  AlertCircle,
  Phone,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/safeClient";
import { CrisisModal } from "@/components/safety/CrisisModal";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// Risk keywords for client-side Guardian
const CRITICAL_KEYWORDS = [
  "kill myself",
  "end my life",
  "suicide",
  "want to die",
  "better off dead",
];
const HIGH_RISK_KEYWORDS = [
  "hopeless",
  "worthless",
  "hate myself",
  "can't go on",
  "give up",
];

export default function VoiceTherapy() {
  const navigate = useNavigate();

  // State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [wbcScore, setWbcScore] = useState(100);
  const [riskLevel, setRiskLevel] = useState<"clear" | "clouded" | "critical">(
    "clear",
  );
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Initialization ---

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // We want to stop when user stops speaking to process
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setIsProcessing(false);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognition.onend = () => {
        setIsListening(false);
        // If we have a transcript, process it
        if (transcript.trim().length > 0) {
          handleUserMessage(transcript);
          setTranscript(""); // Clear buffer
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setError("Microphone access denied. Please allow permission.");
        }
      };

      recognitionRef.current = recognition;
    } else {
      setError("Speech recognition is not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      synthRef.current.cancel();
    };
  }, [transcript]); // Depend on transcript to capture latest value in onend closure

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Logic ---

  const calculateRisk = (text: string) => {
    const lower = text.toLowerCase();
    let score = wbcScore; // Start from current score context

    if (CRITICAL_KEYWORDS.some((k) => lower.includes(k))) {
      score = Math.max(0, score - 50);
      setRiskLevel("critical");
      setShowCrisisModal(true);
    } else if (HIGH_RISK_KEYWORDS.some((k) => lower.includes(k))) {
      score = Math.max(0, score - 20);
      if (riskLevel !== "critical") setRiskLevel("clouded");
    } else {
      // Slow recovery
      score = Math.min(100, score + 5);
      if (score > 60 && riskLevel !== "critical") setRiskLevel("clear");
    }
    setWbcScore(score);
  };

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Update UI
    const newUserMsg: Message = {
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsProcessing(true);

    // 2. Safety Check
    calculateRisk(text);

    try {
      // 3. Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("therapy-chat", {
        body: {
          message: text,
          conversationId: null, // or pass existing ID if maintaining session
        },
      });

      if (error) throw error;

      const aiResponse =
        data.response ||
        data.message ||
        data.reply ||
        "I'm listening. Please go on.";

      // 4. Process Response
      const newAiMsg: Message = {
        role: "assistant",
        content: aiResponse,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, newAiMsg]);

      // 5. Speak
      speak(aiResponse);
    } catch (err: any) {
      console.error("API Error:", err);
      toast.error(
        "Unable to connect to therapist. Please check your connection.",
      );
      setIsProcessing(false);
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;

    // Cancel existing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Therapeutic pace
    utterance.pitch = 1.0;

    // Attempt to pick a natural voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(
      (v) => v.name.includes("Google") || v.name.includes("Samantha"),
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsProcessing(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      // Auto-resume listening for natural flow (unless stopped manually)
      if (!error && riskLevel !== "critical") {
        setTimeout(() => startListening(), 500);
      }
    };

    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isSpeaking) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Ignore "already started" errors
        console.log("Recognition already active");
      }
    }
  };

  const stopSession = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    synthRef.current.cancel();
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col">
      {/* Header */}
      <header className="p-4 border-b bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Session
          </Button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium text-slate-500">
              Guardian Protected
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 max-w-4xl flex flex-col gap-6">
        {/* Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 flex items-center justify-between bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
            <div>
              <h2 className="text-2xl font-bold mb-1">AI Therapist</h2>
              <p className="text-indigo-100 flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${isListening || isSpeaking ? "bg-green-400 animate-pulse" : "bg-slate-400"}`}
                ></span>
                {isListening
                  ? "Listening..."
                  : isSpeaking
                    ? "Speaking..."
                    : isProcessing
                      ? "Thinking..."
                      : "Ready"}
              </p>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center">
              {(isListening || isSpeaking) && (
                <span className="absolute inset-0 bg-white opacity-20 rounded-full animate-ping"></span>
              )}
              {isSpeaking ? (
                <Volume2 className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-500 font-medium flex items-center gap-2">
                <HeartPulse className="w-4 h-4" /> Well-Being Score
              </span>
              <Badge
                variant={
                  riskLevel === "critical"
                    ? "destructive"
                    : riskLevel === "clouded"
                      ? "default"
                      : "default"
                }
                className={riskLevel === "clear" ? "bg-emerald-500" : ""}
              >
                {riskLevel.toUpperCase()}
              </Badge>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-out ${
                  wbcScore > 60
                    ? "bg-emerald-500"
                    : wbcScore > 30
                      ? "bg-amber-500"
                      : "bg-rose-500"
                }`}
                style={{ width: `${wbcScore}%` }}
              />
            </div>
            <p className="text-xs text-right mt-1 text-slate-400">
              {wbcScore}/100
            </p>
          </Card>
        </div>

        {/* Conversation Area */}
        <Card className="flex-1 min-h-[400px] max-h-[600px] overflow-hidden flex flex-col shadow-sm border-slate-200 dark:border-slate-800">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Mic className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-lg font-medium mb-2">
                  Start a Safe Space Session
                </p>
                <p className="text-sm max-w-md">
                  Click "Start Session" below. Your conversation is private,
                  secure, and monitored by our Guardian safety system.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </motion.div>
              ))
            )}

            {/* Live Transcript Bubble */}
            {isListening && transcript && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-end"
              >
                <div className="max-w-[80%] rounded-2xl p-4 bg-indigo-600/50 text-white/80 rounded-tr-none italic">
                  {transcript}...
                </div>
              </motion.div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 flex gap-2 items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span className="text-xs text-slate-500">
                    Therapist is thinking...
                  </span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Controls Footer */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t flex items-center justify-center gap-4">
            {!isListening && !isSpeaking ? (
              <Button
                size="lg"
                onClick={startListening}
                className="h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none transition-all hover:scale-105"
              >
                <Mic className="mr-2 w-5 h-5" /> Start Session
              </Button>
            ) : (
              <Button
                size="lg"
                variant="destructive"
                onClick={stopSession}
                className="h-14 px-8 text-lg rounded-full shadow-xl transition-all hover:scale-105"
              >
                <Square className="mr-2 w-5 h-5 fill-current" /> Stop Session
              </Button>
            )}
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm text-center border border-rose-100 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
      </main>

      {/* Crisis Intervention Modal */}
      <AnimatePresence>
        {showCrisisModal && (
          <CrisisModal
            isOpen={showCrisisModal}
            onClose={() => setShowCrisisModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
