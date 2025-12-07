/**
 * Emergency Contacts Modal
 * Displays localized crisis resources when user is at risk
 */

import { useState, useEffect } from 'react';
import { Phone, MessageSquare, AlertTriangle, ExternalLink } from 'lucide-react';
import { guardianClient, EmergencyContact } from '@/safety/guardian-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  severity: 'high' | 'critical';
  userMessage?: string;
}

export function EmergencyContactsModal({
  isOpen,
  onClose,
  severity,
  userMessage,
}: EmergencyContactsModalProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [userLocation, setUserLocation] = useState<string>('US');

  useEffect(() => {
    loadEmergencyContacts();
  }, [userLocation]);

  const loadEmergencyContacts = async () => {
    const countryCode = await detectUserLocation();
    setUserLocation(countryCode);
    const emergencyContacts = await guardianClient.getEmergencyContacts(countryCode);
    setContacts(emergencyContacts);
  };

  const detectUserLocation = async (): Promise<string> => {
    // TODO: Integrate IP geolocation or user profile
    // For now, default to user's stored location or US
    return 'US';
  };

  const getMessage = () => {
    if (severity === 'critical') {
      return {
        title: '🚨 Immediate Help Needed',
        description:
          "I'm deeply concerned about what you shared. Your safety is the absolute priority right now. Please reach out to one of these crisis resources immediately. They're available 24/7 and want to help.",
        color: 'bg-red-50 border-red-200',
      };
    }

    return {
      title: '🤝 Support Resources Available',
      description:
        "I notice you're going through a really difficult time. While I'm here to support you, these professional resources can provide immediate human help if you need it.",
      color: 'bg-orange-50 border-orange-200',
    };
  };

  const message = getMessage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <AlertTriangle className={severity === 'critical' ? 'text-red-600' : 'text-orange-600'} />
            {message.title}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {contacts.map((contact, index) => (
            <Card key={index} className={`p-4 ${message.color}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {contact.type === 'hotline' && <Phone className="w-5 h-5" />}
                    {contact.type === 'crisis_center' && <MessageSquare className="w-5 h-5" />}
                    {contact.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {contact.region} • {contact.available24x7 ? '24/7 Available' : 'Limited Hours'}
                  </p>
                  <p className="text-2xl font-bold mt-2 text-gray-900">
                    {contact.phone}
                  </p>
                </div>
                <a
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="ml-4"
                >
                  <Button
                    size="sm"
                    className={severity === 'critical' ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    Call Now
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            More Resources
          </h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <a
                href="https://www.iasp.info/resources/Crisis_Centres/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                International Crisis Centers Directory
              </a>
            </li>
            <li>
              <a
                href="https://findahelpline.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Find a Helpline (Global)
              </a>
            </li>
          </ul>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Continue Session
          </Button>
          <Button
            onClick={() => window.open('tel:988', '_self')}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            Call 988 Now
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          This is an automated response. For immediate danger, call local emergency services.
        </p>
      </DialogContent>
    </Dialog>
  );
}
