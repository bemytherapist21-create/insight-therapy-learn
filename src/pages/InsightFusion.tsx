import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  BarChart3,
  Target,
  Lightbulb,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  Loader2,
  Sparkles,
  Mic,
  MicOff,
} from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { InlineWidget } from "react-calendly";
import { supabase } from "@/integrations/supabase/safeClient";

const CALENDLY_URL = "https://calendly.com/bhupeshpandey62/30min";

const InsightFusion = () => {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    // Convert blob to base64 efficiently using FileReader
    const base64Audio: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read audio file"));
      reader.readAsDataURL(audioBlob);
    });

    const { data, error } = await supabase.functions.invoke(
      "transcribe-audio",
      {
        body: {
          audio: base64Audio,
          mimeType: audioBlob.type,
        },
      },
    );

    if (error) {
      // Bubble up clearer auth-related errors for UI messaging
      if (
        typeof error.message === "string" &&
        (error.message.includes("Authentication required") ||
          error.message.includes("Invalid or expired token"))
      ) {
        throw new Error("AUTH_REQUIRED");
      }
      throw new Error(error.message || "Transcription failed");
    }

    return (data as { transcript?: string })?.transcript || "";
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      // Stop recording
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
        setIsListening(false);
      }
      return;
    }

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

        // Stop microphone stream tracks immediately to release hardware
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        setIsProcessing(true);
        try {
          const transcript = await transcribeAudio(audioBlob);
          if (transcript.trim()) {
            setQuery(transcript);
            toast.success("Voice input captured!");
          } else {
            toast.info("No speech detected. Please try again.");
          }
        } catch (error) {
          console.error("Transcription error:", error);
          toast.error("Failed to transcribe audio. Please try again.");
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      toast.info("Recording... Click again to stop");
    } catch (error) {
      console.error("Microphone error:", error);
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        toast.error(
          "Microphone access denied. Please allow microphone permissions.",
        );
      } else {
        toast.error("Could not access microphone.");
      }
    }
  };

  const handleBooking = () => {
    window.open(CALENDLY_URL, "_blank");
  };

  const handleResearch = () => {
    if (!query.trim()) {
      toast.error("Please enter a research question");
      return;
    }

    // Navigate to dedicated research page
    navigate(
      `/insight-fusion/Generate/StrategicInsight?q=${encodeURIComponent(query)}`,
    );
  };

  const services = [
    {
      title: "Business Strategy Sessions",
      description:
        "Comprehensive analysis of your business model with AI-driven insights",
      duration: "60 minutes",
      price: "$299",
      features: [
        "Market Analysis",
        "Competitor Research",
        "Growth Strategy",
        "ROI Optimization",
      ],
    },
    {
      title: "Data Analytics Consultation",
      description:
        "Deep dive into your business data to uncover hidden patterns and opportunities",
      duration: "90 minutes",
      price: "$399",
      features: [
        "Data Visualization",
        "KPI Development",
        "Predictive Modeling",
        "Action Plan",
      ],
    },
    {
      title: "AI Implementation Strategy",
      description:
        "Roadmap for integrating AI solutions into your business operations",
      duration: "75 minutes",
      price: "$349",
      features: [
        "AI Assessment",
        "Technology Stack",
        "Implementation Timeline",
        "Cost Analysis",
      ],
    },
  ];

  const benefits = [
    {
      icon: Target,
      title: "Precision Insights",
      description:
        "AI-powered analysis delivers laser-focused business intelligence",
    },
    {
      icon: TrendingUp,
      title: "Growth Acceleration",
      description:
        "Identify opportunities to scale your business faster than ever",
    },
    {
      icon: Lightbulb,
      title: "Innovation Strategy",
      description:
        "Stay ahead of the curve with cutting-edge strategic recommendations",
    },
    {
      icon: Users,
      title: "Expert Guidance",
      description: "Connect with seasoned strategists and AI specialists",
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              InsightFusion
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              Transform your business with AI-driven analytics and strategic
              insights.
            </p>

            {/* Live Research Demo */}
            <div className="glass-card max-w-2xl mx-auto p-6 mb-12 border border-purple-500/30">
              <div className="flex items-center justify-center gap-2 mb-4 text-purple-300">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold tracking-wider uppercase text-sm">
                  Live Demo: Instant Market Research
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <div className="relative">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a strategic question (e.g., 'What are the emerging trends in mental health tech for 2025?') or use voice input"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-4 pr-14 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                  />
                  <Button
                    onClick={handleVoiceInput}
                    disabled={isProcessing}
                    className={`absolute right-2 top-2 p-2 h-10 w-10 rounded-full ${isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : isProcessing ? "bg-gray-500" : "bg-purple-500 hover:bg-purple-600"}`}
                    title={
                      isListening
                        ? "Stop Recording"
                        : isProcessing
                          ? "Processing..."
                          : "Voice Input"
                    }
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={handleResearch}
                  disabled={!query.trim()}
                  className="bg-gradient-primary hover:shadow-glow w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Strategic Insight
                </Button>
              </div>
            </div>

            {/* Booking Call to Action */}
            <div className="glass-card max-w-lg mx-auto p-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <BarChart3 className="w-8 h-8 text-primary" />
                <Calendar className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Need Deeper Analysis?
              </h3>
              <p className="text-white/70 mb-4">
                Book a rigorous 1-on-1 strategy session
              </p>

              <Button
                size="lg"
                onClick={handleBooking}
                className="bg-white/10 hover:bg-white/20 w-full"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Consultation
              </Button>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {benefits.map((benefit, index) => (
              <Card
                key={benefit.title}
                className="glass-card text-center hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="pt-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-white/70 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card
                key={service.title}
                className="glass-card hover-lift animate-scale-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-white/70">{service.duration}</span>
                    </div>
                    <div className="text-2xl font-bold text-secondary">
                      {service.price}
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-white group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CardDescription className="text-white/70">
                    {service.description}
                  </CardDescription>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">
                      What's Included:
                    </h4>
                    {service.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-white/80"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleBooking}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-glow transition-all duration-300"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book This Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Calendar Integration / Booking Section as Inline Embed */}
          <div className="mt-20 text-center">
            <Card className="glass-card max-w-5xl mx-auto animate-fade-in overflow-hidden border-none bg-transparent shadow-none">
              <CardContent className="p-0">
                <div className="flex justify-center mb-8">
                  <div className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-bold">
                      Book Your Strategy Session
                    </h3>
                  </div>
                </div>
                <div className="h-[750px] w-full rounded-xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm">
                  <InlineWidget
                    url={CALENDLY_URL}
                    styles={{ height: "100%", width: "100%" }}
                    pageSettings={{
                      backgroundColor: "1a1a1a",
                      hideEventTypeDetails: true,
                      hideLandingPageDetails: true,
                      primaryColor: "3b82f6",
                      textColor: "ffffff",
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
export default InsightFusion;
