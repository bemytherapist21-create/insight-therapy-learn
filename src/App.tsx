
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import AITherapy from "./pages/AITherapy";
import AITherapyChat from "./pages/AITherapyChat";
import AITherapyVoice from "./pages/AITherapyVoice";
import InsightFusion from "./pages/InsightFusion";
import AILearning from "./pages/AILearning";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ai-therapy" element={<AITherapy />} />
            <Route path="/ai-therapy/chat" element={<AITherapyChat />} />
            <Route path="/ai-therapy/voice" element={<AITherapyVoice />} />
            <Route path="/insight-fusion" element={<InsightFusion />} />
            <Route path="/ai-learning" element={<AILearning />} />
            <Route path="/about" element={<Home />} />
            <Route path="/services" element={<Home />} />
            <Route path="/contact" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/terms" element={<Terms />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
