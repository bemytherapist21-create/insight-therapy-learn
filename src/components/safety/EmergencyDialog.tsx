/**
 * Emergency Intervention Dialog
 * Shown when crisis is detected
 */

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, Heart } from 'lucide-react';
import { guardianClient, EmergencyContact } from '@/safety/guardian-client';

interface EmergencyDialogProps {
  open: boolean;
  onClose: () => void;
  severity: 'high' | 'critical';
  countryCode?: string;
}

export function EmergencyDialog({
  open,
  onClose,
  severity,
  countryCode = 'IN',
}: EmergencyDialogProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadContacts();
    }
  }, [open, countryCode]);

  const loadContacts = async () => {
    setLoading(true);
    const emergencyContacts = await guardianClient.getEmergencyContacts(countryCode);
    setContacts(emergencyContacts);
    setLoading(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-2xl">
            <Heart className="h-6 w-6 text-red-500" />
            You're Not Alone - Help is Available
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base space-y-4">
            {severity === 'critical' ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="font-semibold text-red-900">
                  We've detected that you may be in immediate distress. Please reach out for
                  help right now.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="font-semibold text-yellow-900">
                  We care about your wellbeing. Professional support is available.
                </p>
              </div>
            )}

            <div className="space-y-3 mt-4">
              <h3 className="font-semibold text-lg text-gray-900">24/7 Crisis Support:</h3>
              {loading ? (
                <p>Loading emergency contacts...</p>
              ) : (
                contacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-white border rounded-lg hover:shadow-md transition-shadow"
                  >
                    {contact.type === 'hotline' ? (
                      <Phone className="h-5 w-5 text-blue-600 mt-1" />
                    ) : contact.type === 'emergency' ? (
                      <Phone className="h-5 w-5 text-red-600 mt-1" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-green-600 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{contact.name}</p>
                      <p className="text-2xl font-bold text-blue-600">{contact.phone}</p>
                      <p className="text-sm text-gray-600">Available: {contact.available}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                    >
                      Call Now
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <h4 className="font-semibold text-blue-900 mb-2">Remember:</h4>
              <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                <li>This is temporary - feelings can and do change</li>
                <li>You deserve support and there are people who want to help</li>
                <li>Professional help can make a real difference</li>
                <li>You don't have to face this alone</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose}>
            I'll reach out for help
          </Button>
          <AlertDialogAction onClick={() => window.open(`tel:${contacts[0]?.phone}`, '_self')}>
            Call Crisis Helpline Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
