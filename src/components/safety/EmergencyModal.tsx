/**
 * Emergency Crisis Intervention Modal
 * Displays when crisis is detected
 */

import React, { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Phone, MessageSquare, Globe, Heart } from 'lucide-react';
import { EmergencyContact } from '@/safety/guardian-client';

interface EmergencyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  severity: 'low' | 'medium' | 'high' | 'critical';
  contacts: EmergencyContact[];
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  open,
  onOpenChange,
  severity,
  contacts
}) => {
  const [userRegion, setUserRegion] = useState('global');

  useEffect(() => {
    // Detect user region (simplified)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('America')) setUserRegion('US');
    else if (timezone.includes('Europe')) setUserRegion('EU');
    else if (timezone.includes('Asia')) setUserRegion('IN');
  }, []);

  const relevantContacts = contacts.filter(
    c => c.region === userRegion || c.region === 'global'
  );

  const getSeverityMessage = () => {
    switch (severity) {
      case 'critical':
        return 'We detected you may be in crisis. Your safety is our priority. Please reach out to these resources immediately.';
      case 'high':
        return 'We noticed concerning patterns in our conversation. Help is available 24/7.';
      case 'medium':
        return 'You mentioned some distressing thoughts. These resources can provide support.';
      default:
        return 'If you need support, these resources are available anytime.';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-2xl">
            <Heart className="text-red-500" size={28} />
            You're Not Alone - Help is Available
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2">
            {getSeverityMessage()}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 my-4">
          {/* Critical Warning */}
          {severity === 'critical' && (
            <div className="bg-red-50 border-2 border-red-500 p-4 rounded-lg">
              <h3 className="font-bold text-red-900 mb-2">🚨 Immediate Crisis Support</h3>
              <p className="text-red-800 mb-3">
                If you're thinking about suicide, please call one of these numbers RIGHT NOW:
              </p>
              <div className="bg-white p-3 rounded border border-red-300">
                <p className="font-bold text-red-900 text-xl">988 - Suicide & Crisis Lifeline (US)</p>
                <p className="text-sm text-red-700">Available 24/7 - Free & Confidential</p>
              </div>
            </div>
          )}

          {/* Emergency Contacts */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Phone size={20} />
              Crisis Hotlines
            </h3>
            {relevantContacts.map((contact, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{contact.name}</h4>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {contact.phone}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {contact.available24_7 && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          24/7 Available
                        </span>
                      )}
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {contact.region}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Text Support */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold flex items-center gap-2 mb-2">
              <MessageSquare size={18} />
              Prefer to Text?
            </h4>
            <p className="text-sm mb-2">Crisis Text Line (US): Text <strong>HOME</strong> to <strong>741741</strong></p>
            <p className="text-xs text-gray-600">Available 24/7 - Free & Confidential</p>
          </div>

          {/* Online Resources */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold flex items-center gap-2 mb-3">
              <Globe size={18} />
              Online Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://suicidepreventionlifeline.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Suicide Prevention Lifeline →
                </a>
              </li>
              <li>
                <a 
                  href="https://www.iasp.info/resources/Crisis_Centres/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  International Crisis Centers →
                </a>
              </li>
              <li>
                <a 
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Find a Helpline (Global) →
                </a>
              </li>
            </ul>
          </div>

          {/* Safety Plan */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Create a Safety Plan</h4>
            <p className="text-sm mb-2">
              A safety plan can help you stay safe when you're having thoughts of suicide.
            </p>
            <a
              href="https://suicidepreventionlifeline.org/create-safety-plan/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:underline font-medium"
            >
              Create Your Safety Plan →
            </a>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            I Have This Information
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
