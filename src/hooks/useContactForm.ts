import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, SUCCESS_MESSAGES } from '@/config/constants';
import { z } from 'zod';

// Validation schema for contact form
const contactFormSchema = z.object({
    name: z.string()
        .trim()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters'),
    email: z.string()
        .trim()
        .min(1, 'Email is required')
        .max(255, 'Email must be less than 255 characters')
        .email('Please enter a valid email address'),
    message: z.string()
        .trim()
        .min(1, 'Message is required')
        .max(5000, 'Message must be less than 5000 characters')
});

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
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            // Validate form data with zod
            const validatedData = contactFormSchema.parse(formData);

            await fetch(API_ENDPOINTS.GOOGLE_SHEETS, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(validatedData)
            });

            toast({
                title: "Message received!",
                description: SUCCESS_MESSAGES.MESSAGE_SENT,
            });
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Handle validation errors
                const fieldErrors: Record<string, string> = {};
                error.errors.forEach(err => {
                    if (err.path) {
                        fieldErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(fieldErrors);
                toast({
                    title: "Validation Error",
                    description: "Please check the form for errors.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Please try again or email us directly at founder@theeverythingai.com",
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: keyof ContactFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return {
        formData,
        loading,
        errors,
        handleSubmit,
        updateField
    };
};
