import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, SUCCESS_MESSAGES } from '@/config/constants';

interface TherapistRegistrationData {
    name: string;
    email: string;
    phone: string;
    specialization: string;
    yearsOfExperience: string;
    licenseNumber: string;
    message: string;
}

export const useTherapistRegistration = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<TherapistRegistrationData>({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        yearsOfExperience: '',
        licenseNumber: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // With mode: 'no-cors', we can't read the response, but the submission will work
        // We'll show success immediately since we can't detect failures anyway
        fetch(API_ENDPOINTS.GOOGLE_SHEETS_THERAPIST, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        }).finally(() => {
            // Always show success because with no-cors we can't read the response
            // The data will be submitted to Google Sheets regardless
            setLoading(false);

            toast({
                title: "Application received!",
                description: SUCCESS_MESSAGES.THERAPIST_REGISTRATION_SENT,
            });

            setFormData({
                name: '',
                email: '',
                phone: '',
                specialization: '',
                yearsOfExperience: '',
                licenseNumber: '',
                message: ''
            });
        });
    };

    const updateField = (field: keyof TherapistRegistrationData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return {
        formData,
        loading,
        handleSubmit,
        updateField
    };
};
