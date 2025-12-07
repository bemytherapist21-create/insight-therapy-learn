import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS, SUCCESS_MESSAGES } from '@/config/constants';
import { registrationSchema, RegistrationFormData } from '@/lib/validation';
import { z } from 'zod';

export interface Country {
    code: string;
    name: string;
}

const DEFAULT_COUNTRIES: Country[] = [
    { code: 'US', name: 'United States' },
    { code: 'IN', name: 'India' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' }
];

export const useRegister = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [autoDetectedCountry, setAutoDetectedCountry] = useState<string | null>(null);

    const [formData, setFormData] = useState<RegistrationFormData>({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        phone: '',
        country: '',
        ageConfirmed: false,
        termsAccepted: false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        detectCountry();
        loadCountries();
    }, []);

    const detectCountry = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.IPAPI);
            const data = await response.json();
            if (data.country_code) {
                setFormData(prev => ({ ...prev, country: data.country_code }));
                setAutoDetectedCountry(data.country_code);
            }
        } catch (error) {
            console.log('Could not auto-detect country');
        }
    };

    const loadCountries = () => {
        setCountries(DEFAULT_COUNTRIES);
    };

    const updateField = (field: keyof RegistrationFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user types
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
            // Zod Validation
            registrationSchema.parse(formData);

            // Supabase Signup
            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.firstName,
                        phone: formData.phone,
                        country: formData.country,
                    },
                },
            });

            if (error) throw error;

            toast({
                title: "Success",
                description: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
            });

            navigate('/login');
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                error.errors.forEach(err => {
                    if (err.path) {
                        fieldErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(fieldErrors);
            } else if (error instanceof Error) {
                toast({
                    title: "Registration Failed",
                    description: error.message,
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
        countries,
        errors,
        autoDetectedCountry,
        updateField,
        handleSubmit
    };
};
