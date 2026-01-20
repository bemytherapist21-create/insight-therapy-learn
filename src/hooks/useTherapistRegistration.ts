import { useState } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/constants';

// Validation schema for therapist registration
const therapistRegistrationSchema = z.object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be less than 100 characters'),
    email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
    phone: z.string().trim().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number must be less than 20 characters'),
    licenseNumber: z.string().trim().max(50, 'License number must be less than 50 characters').optional().or(z.literal('')),
    licenseType: z.string().trim().min(1, 'Please select a license type'),
    specializations: z.string().trim().min(5, 'Please describe your specializations').max(500, 'Specializations must be less than 500 characters'),
    yearsOfExperience: z.string().trim().min(1, 'Years of experience is required'),
    country: z.string().trim().min(2, 'Please select your country'),
    state: z.string().trim().max(100, 'State must be less than 100 characters').optional(),
    bio: z.string().trim().min(50, 'Bio must be at least 50 characters').max(1000, 'Bio must be less than 1000 characters'),
    website: z.string().trim().url('Invalid website URL').optional().or(z.literal('')),
    linkedIn: z.string().trim().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
}).superRefine((data, ctx) => {
    // License number is required unless "practitioner" is selected
    if (data.licenseType !== 'practitioner') {
        if (!data.licenseNumber || data.licenseNumber.length < 3) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'License number is required',
                path: ['licenseNumber'],
            });
        }
    }
});

export interface TherapistFormData {
    fullName: string;
    email: string;
    phone: string;
    licenseNumber: string;
    licenseType: string;
    specializations: string;
    yearsOfExperience: string;
    country: string;
    state: string;
    bio: string;
    website: string;
    linkedIn: string;
    agreeToTerms: boolean;
}

const initialFormData: TherapistFormData = {
    fullName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseType: '',
    specializations: '',
    yearsOfExperience: '',
    country: '',
    state: '',
    bio: '',
    website: '',
    linkedIn: '',
    agreeToTerms: false,
};

export const useTherapistRegistration = () => {
    const [formData, setFormData] = useState<TherapistFormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { toast } = useToast();

    const updateField = <K extends keyof TherapistFormData>(field: K, value: TherapistFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            // Validate form data with zod
            const validatedData = therapistRegistrationSchema.parse(formData);

            await fetch(API_ENDPOINTS.THERAPIST_REGISTRATION, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...validatedData,
                    submittedAt: new Date().toISOString(),
                })
            });

            toast({
                title: "Registration Submitted!",
                description: "Thank you for registering. We'll review your application and get back to you within 48 hours.",
            });
            setFormData(initialFormData);
        } catch (error) {
            if (error instanceof z.ZodError) {
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

    return {
        formData,
        loading,
        errors,
        handleSubmit,
        updateField,
    };
};
