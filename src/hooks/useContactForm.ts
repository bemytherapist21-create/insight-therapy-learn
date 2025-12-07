import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, SUCCESS_MESSAGES } from '@/config/constants';

interface ContactFormData {
    name: string;
    email: string;
    message: string;
}

export const useContactForm = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await fetch(API_ENDPOINTS.GOOGLE_SHEETS, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            toast({
                title: "Message received!",
                description: SUCCESS_MESSAGES.MESSAGE_SENT,
            });
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Contact form error:', error);
            toast({
                title: "Error",
                description: "Please try again or email us directly at founder@theeverythingai.com",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: keyof ContactFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return {
        formData,
        loading,
        handleSubmit,
        updateField
    };
};
