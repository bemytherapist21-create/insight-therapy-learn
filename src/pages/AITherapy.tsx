import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TherapyChat } from '@/components/TherapyChat';
import { VoiceTherapy } from '@/components/VoiceTherapy';
import { 
  Bot, 
  User, 
  Mic, 
  MessageCircle, 
  UserPlus,
  TrendingUp,
  Heart,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const AITherapy = () => {
  const [showChat, setShowChat] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  
  // Simulated live tracking data (in real app, this would come from your backend)
  const [therapistStats, setTherapistStats] = useState({
    ai: 68,
    human: 32,
    totalSessions: 2847
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTherapistStats(prev => {
        const variation = Math.random() * 4 - 2; // -2 to +2 variation
        const newAI = Math.max(10, Math.min(90, prev.ai + variation));
        return {
          ai: Math.round(newAI),
          human: Math.round(100 - newAI),
          totalSessions: prev.totalSessions + Math.floor(Math.random() * 3)
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const therapyOptions = [
    {
      type: 'AI Chatbot Therapist',
      icon: Bot,
      description: 'Instant support with our advanced AI counselor. Available 24/7 with personalized responses.',
      features: ['24/7 Availability', 'Instant Responses', 'Privacy Guaranteed', 'Multi-language Support'],
      gradient: 'from-purple-500 to-blue-500',
      action: 'Start Chat Session',
      onClick: () => setShowChat(true)
    },
    {
      type: 'AI Voice Therapist',
      icon: Mic,
      description: 'Experience therapy through natural voice conversation with our AI voice technology.',
      features: ['Natural Voice', 'Emotional Recognition', 'Real-time Response', 'Voice Memory'],
      gradient: 'from-blue-500 to-cyan-500',
      action: 'Start Voice Session',
      onClick: () => setShowVoice(true)
    },
    {
      type: 'Human Therapist',
      icon: User,
      description: 'Connect with licensed professional therapists for comprehensive mental health support.',
      features: ['Licensed Professionals', 'Specialized Expertise', 'Long-term Care', 'Insurance Options'],
      gradient: 'from-orange-500 to-pink-500',
      action: 'Register & Book',
      requiresRegistration: true,
      onClick: () => toast.info('Human Therapist registration coming soon!')
    }
  ];

  const handleBack = () => {
    setShowChat(false);
    setShowVoice(false);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              AI-Powered Therapy
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              Protected by Project Guardian safety framework with real-time risk assessment
            </p>
            
            {/* Live Statistics */}
            <div className="glass-card max-w-2xl mx-auto p-6 mb-8">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Live Usage Statistics
              </h3>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{therapistStats.ai}%</div>
                  <div className="text-white/70">Choose AI Therapy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">{therapistStats.human}%</div>
                  <div className="text-white/70">Choose Human Therapy</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-white/70">
                  <span>AI Preference</span>
                  <span>Human Preference</span>
                </div>
                <Progress value={therapistStats.ai} className="h-2" />
                <div className="text-center text-sm text-white/60">
                  Total Sessions Today: {therapistStats.totalSessions.toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {showChat ? (
              /* AI Chatbot Interface */
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mb-16"
              >
                <Button 
                  variant="ghost" 
                  className="mb-4 text-white hover:text-primary"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Options
                </Button>
                <TherapyChat />
              </motion.div>
            ) : showVoice ? (
              /* AI Voice Interface */
              <motion.div
                key="voice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mb-16"
              >
                <Button 
                  variant="ghost" 
                  className="mb-4 text-white hover:text-primary"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Options
                </Button>
                <VoiceTherapy onBack={handleBack} />
              </motion.div>
            ) : (
              /* Therapy Options Cards */
              <motion.div
                key="options"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-3xl font-bold text-center mb-8 text-white">Choose Your Therapy Option</h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {therapyOptions.map((option, index) => (
                    <motion.div
                      key={option.type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="glass-card hover-lift group h-full cursor-pointer" onClick={option.onClick}>
                        <CardHeader className="text-center">
                          <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${option.gradient} p-5 mb-4 group-hover:shadow-glow transition-all duration-300`}>
                            <option.icon className="w-10 h-10 text-white" />
                          </div>
                          <CardTitle className="text-2xl text-white group-hover:text-primary transition-colors">
                            {option.type}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <CardDescription className="text-white/70 text-center">
                            {option.description}
                          </CardDescription>
                          
                          <div className="space-y-2">
                            {option.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-white/80">
                                <div className="w-2 h-2 rounded-full bg-gradient-primary" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <Button 
                            className={`w-full bg-gradient-to-r ${option.gradient} hover:shadow-glow transition-all duration-300`}
                            onClick={(e) => {
                              e.stopPropagation();
                              option.onClick();
                            }}
                          >
                            {option.requiresRegistration ? (
                              <UserPlus className="w-4 h-4 mr-2" />
                            ) : option.type.includes('Voice') ? (
                              <Mic className="w-4 h-4 mr-2" />
                            ) : (
                              <MessageCircle className="w-4 h-4 mr-2" />
                            )}
                            {option.action}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Project Guardian Protected</h3>
              <p className="text-white/70">Multi-layered safety framework with crisis detection</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Clinically Informed</h3>
              <p className="text-white/70">Based on evidence-based therapy practices</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-time Monitoring</h3>
              <p className="text-white/70">Continuous well-being coefficient tracking</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AITherapy;
