/**
 * Safety Banner Component
 * Always visible reminder of available help
 */

import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { EmergencyDialog } from './EmergencyDialog';

export function SafetyBanner() {
  const [showEmergency, setShowEmergency] = useState(false);

  return (
    <>
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-900">
              If you're in crisis or need immediate help, support is available 24/7
            </p>
          </div>
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowEmergency(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            Get Help Now
          </Button>
        </div>
      </div>

      <EmergencyDialog
        open={showEmergency}
        onClose={() => setShowEmergency(false)}
        severity="high"
      />
    </>
  );
}
