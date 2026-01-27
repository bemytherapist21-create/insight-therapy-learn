import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/safeClient";
import { Send, AlertCircle, Heart, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { CrisisResourcesBanner } from "@/components/safety/CrisisResourcesBanner";
import { useCountryDetection } from "@/hooks/useCountryDetection";
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SafetyStatus {
  wbcScore: number;
  riskLevel: "clear" | "clouded" | "critical";
  colorCode: string;
  requiresIntervention: boolean;
  crisisDetected: boolean;
}

export const TherapyChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [safety, setSafety] = useState<SafetyStatus | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { resources, country } = useCountryDetection();

  useEffect(() => {
    if (!authLoading && !user) {
      const currentPath = window.location.pathname;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, authLoading, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !user) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("therapy-chat", {
        body: {
          message: userMessage,
          conversationId,
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
      setConversationId(data.conversationId);
      setSafety(data.safety);

      // Show crisis alert if detected
      if (data.safety.crisisDetected) {
        const crisisLine = resources.find((r) => r.type === "crisis");
        toast.error("Crisis Detected", {
          description: `Please call ${crisisLine?.number || "988"} (${crisisLine?.name || "Crisis Lifeline"}) immediately for help.${country && country.code !== "US" ? ` (${country.name})` : ""}`,
          duration: 10000,
        });
      }
    } catch (error: unknown) {
      console.error("Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("Authentication required")) {
        toast.error("Please sign in to continue");
        const currentPath = window.location.pathname;
        navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      } else {
        toast.error("Failed to send message. Please try again.");
      }
      setMessages((prev) => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level?: string) => {
    if (!level) return "text-green-500";
    switch (level) {
      case "clear":
        return "text-green-500";
      case "clouded":
        return "text-yellow-500";
      case "critical":
        return "text-red-500";
      default:
        return "text-green-500";
    }
  };

  const getRiskBgColor = (level?: string) => {
    if (!level) return "bg-green-500/10 border-green-500/20";
    switch (level) {
      case "clear":
        return "bg-green-500/10 border-green-500/20";
      case "clouded":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "critical":
        return "bg-red-500/10 border-red-500/20";
      default:
        return "bg-green-500/10 border-green-500/20";
    }
  };

  if (authLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Safety Status Display */}
      {safety && (
        <Card className={`p-4 border ${getRiskBgColor(safety.riskLevel)}`}>
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

      {/* Chat Messages */}
      <Card className="p-4 h-[500px] overflow-y-auto bg-background/95 backdrop-blur">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
            <Heart className="w-12 h-12 text-primary/50" />
            <div>
              <p className="font-medium text-foreground">
                Welcome to Safe Therapy AI
              </p>
              <p className="text-sm">
                I'm here to provide supportive mental health guidance.
              </p>
              <p className="text-xs mt-2">
                Protected by Project Guardian safety framework
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                      : "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </Card>

      {/* Crisis Resources */}
      <CrisisResourcesBanner />

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Share what's on your mind..."
          disabled={loading}
          className="flex-1"
        />
        <Button onClick={sendMessage} disabled={loading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        This AI provides supportive guidance but is not a replacement for
        professional therapy. Always consult a licensed mental health
        professional for serious concerns.
      </p>
    </div>
  );
};
