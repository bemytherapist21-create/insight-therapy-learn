import { z } from 'zod';

/**
 * Centralized validation schemas using Zod
 * These schemas enforce strong validation rules for user inputs
 */

// Email validation
export const emailSchema = z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email is too long');

// Strong password validation (12+ chars, complexity requirements)
export const passwordSchema = z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Phone number validation (international format)
export const phoneSchema = z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number with country code (e.g., +1234567890)');

// Name validation
export const nameSchema = z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Country code validation
export const countryCodeSchema = z
    .string()
    .length(2, 'Country code must be 2 characters')
    .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters');

// Registration form schema
export const registrationSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: nameSchema.optional().or(z.literal('')),
    phone: phoneSchema,
    country: countryCodeSchema,
    ageConfirmed: z.boolean().refine(val => val === true, {
        message: 'You must be 18 or older to register'
    }),
    termsAccepted: z.boolean().refine(val => val === true, {
        message: 'You must accept the terms and conditions'
    })
}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
});

// Login form schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required')
});

// Auth schema (for Auth.tsx page)
export const authSchema = z.object({
    email: emailSchema,
    password: passwordSchema
});

/**
 * Input sanitization utilities
 */

// Remove potentially dangerous characters from strings
export const sanitizeString = (input: string): string => {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove inline event handlers
};

// Sanitize email
export const sanitizeEmail = (email: string): string => {
    return email.toLowerCase().trim();
};

// Sanitize phone number (remove all non-digit characters except +)
export const sanitizePhone = (phone: string): string => {
    return phone.replace(/[^\d+]/g, '');
};

/**
 * Password strength calculator
 * Returns a score from 0-4
 */
export const calculatePasswordStrength = (password: string): {
    score: number;
    label: string;
    color: string;
} => {
    let score = 0;

    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

    return {
        score: Math.min(score, 4),
        label: labels[Math.min(score, 4)],
        color: colors[Math.min(score, 4)]
    };
};

// Type exports for use in components
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type AuthFormData = z.infer<typeof authSchema>;
