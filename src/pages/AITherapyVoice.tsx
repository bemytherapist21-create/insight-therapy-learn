import { Button } from '@/components/ui/button';
import { VoiceTherapyMinimax } from '@/components/VoiceTherapyMinimax';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AITherapyVoice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="ghost"
              className="mb-4 text-white hover:text-primary"
              onClick={() => navigate('/ai-therapy')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Options
            </Button>
            <VoiceTherapyMinimax onBack={() => navigate('/ai-therapy')} />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AITherapyVoice;
