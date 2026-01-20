import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCountryDetection } from '@/hooks/useCountryDetection';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisModal = ({ isOpen, onClose }: CrisisModalProps) => {
  const { resources, country, getPrimaryCrisisNumber, getEmergencyNumber } = useCountryDetection();

  if (!isOpen) return null;

  const crisisLine = resources.find(r => r.type === 'crisis');
  const textLine = resources.find(r => r.type === 'text');
  const emergencyNumber = getEmergencyNumber();
  const crisisNumber = getPrimaryCrisisNumber();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border-t-4 border-rose-500"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            We care about you
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-2">
            It sounds like you're going through a very difficult time. Please connect with a human who can help immediately.
          </p>
          {country && country.code !== 'US' && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Resources for {country.name}
            </p>
          )}

          <div className="space-y-3">
            {/* Primary Crisis Line */}
            <Button 
              className="w-full h-12 text-lg bg-rose-600 hover:bg-rose-700" 
              onClick={() => window.open(`tel:${crisisNumber}`)}
            >
              Call {crisisLine?.name || 'Crisis Lifeline'} ({crisisLine?.number || '988'})
            </Button>

            {/* Text Line if available */}
            {textLine && (
              <Button 
                variant="outline" 
                className="w-full h-12" 
                onClick={() => {
                  // Extract number from text instruction
                  const numberMatch = textLine.number.match(/\d+/);
                  if (numberMatch) {
                    window.open(`sms:${numberMatch[0]}`);
                  }
                }}
              >
                {textLine.number}
              </Button>
            )}

            {/* Emergency */}
            <Button 
              variant="outline" 
              className="w-full h-10 text-rose-600 border-rose-200 hover:bg-rose-50"
              onClick={() => window.open(`tel:${emergencyNumber}`)}
            >
              Emergency: {emergencyNumber}
            </Button>

            <Button 
              variant="ghost" 
              className="w-full mt-2 text-slate-400" 
              onClick={onClose}
            >
              I'm safe, return to session
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
