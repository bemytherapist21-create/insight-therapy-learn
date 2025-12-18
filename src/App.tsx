
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import Navigation from "./components/Navigation";
import { Suspense, lazy } from "react";
import { LoadingFallback } from "./components/ui/LoadingFallback";

// Lazy load pages for performance optimization
const Home = lazy(() => import("./pages/Home"));
const AITherapy = lazy(() => import("./pages/AITherapy"));
const AITherapyChat = lazy(() => import("./pages/AITherapyChat"));
const AITherapyVoice = lazy(() => import("./pages/AITherapyVoice"));
const SimpleVoiceTherapy = lazy(() => import("./pages/SimpleVoiceTherapy"));
const GeminiVoiceTherapy = lazy(() => import("./pages/GeminiVoiceTherapy"));
const InsightFusion = lazy(() => import("./pages/InsightFusion"));
const StrategicInsight = lazy(() => import("./pages/StrategicInsight"));
const AILearning = lazy(() => import("./pages/AILearning"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Terms = lazy(() => import("./pages/Terms"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navigation />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/ai-therapy" element={<AITherapy />} />
                <Route path="/ai-therapy/chat" element={<AITherapyChat />} />
                <Route path="/ai-therapy/voice" element={<AITherapyVoice />} />
                <Route path="/ai-therapy/voice-simple" element={<SimpleVoiceTherapy />} />
                <Route path="/insight-fusion" element={<InsightFusion />} />
                <Route path="/insight-fusion/Generate/StrategicInsight" element={<StrategicInsight />} />
                <Route path="/ai-learning" element={<AILearning />} />
                <Route path="/about" element={<Home />} />
                <Route path="/services" element={<Home />} />
                <Route path="/contact" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
