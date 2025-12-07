/**
 * Safety Monitoring Component
 * Continuously monitors conversation and shows safety status
 */

import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { CrisisSignal } from '@/safety/crisis-detector';
import { EmergencyModal } from './EmergencyModal';
import { EmergencyContact } from '@/safety/guardian-client';

interface SafetyMonitorProps {
  sessionId: string;
  userId: string;
}

export const SafetyMonitor: React.FC<SafetyMonitorProps> = ({
  sessionId,
  userId
}) => {
  const [safetyStatus, setSafetyStatus] = useState<'safe' | 'warning' | 'crisis'>('safe');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [crisisData, setCrisisData] = useState<{
    severity: CrisisSignal['severity'];
    contacts: EmergencyContact[];
  } | null>(null);

  useEffect(() => {
    // Listen for crisis intervention events
    const handleCrisisIntervention = (event: CustomEvent) => {
      const { severity, contacts } = event.detail;
      setCrisisData({ severity, contacts });
      setShowEmergencyModal(true);
      
      if (severity === 'critical' || severity === 'high') {
        setSafetyStatus('crisis');
      } else {
        setSafetyStatus('warning');
      }
    };

    const handleShowEmergencyModal = () => {
      setShowEmergencyModal(true);
    };

    window.addEventListener('crisis-intervention', handleCrisisIntervention as EventListener);
    window.addEventListener('show-emergency-modal', handleShowEmergencyModal);

    return () => {
      window.removeEventListener('crisis-intervention', handleCrisisIntervention as EventListener);
      window.removeEventListener('show-emergency-modal', handleShowEmergencyModal);
    };
  }, []);

  const getStatusIcon = () => {
    switch (safetyStatus) {
      case 'crisis':
        return <AlertTriangle className="text-red-500" size={16} />;
      case 'warning':
        return <Shield className="text-yellow-500" size={16} />;
      default:
        return <CheckCircle className="text-green-500" size={16} />;
    }
  };

  const getStatusText = () => {
    switch (safetyStatus) {
      case 'crisis':
        return 'Crisis Support Available';
      case 'warning':
        return 'Safety Monitoring Active';
      default:
        return 'Protected Conversation';
    }
  };

  return (
    <>
      {/* Safety Status Indicator */}
      <div className="flex items-center gap-2 text-sm">
        {getStatusIcon()}
        <span className="text-gray-600">{getStatusText()}</span>
        {safetyStatus !== 'safe' && (
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="text-blue-600 hover:underline text-xs"
          >
            Get Help
          </button>
        )}
      </div>

      {/* Emergency Modal */}
      {crisisData && (
        <EmergencyModal
          open={showEmergencyModal}
          onOpenChange={setShowEmergencyModal}
          severity={crisisData.severity}
          contacts={crisisData.contacts}
        />
      )}
    </>
  );
};
