/**
 * Application-wide constants
 * Centralized location for magic strings and configuration values
 */

// API Endpoints
export const API_ENDPOINTS = {
    GOOGLE_SHEETS: 'https://script.google.com/macros/s/AKfycbxQ5FgsJfnT55m81KTXsgZGE5qByyFOap_Do6Nb4m_deA-9FR1mMQCLB4bY7xvVgPQk/exec',
    GOOGLE_SHEETS_THERAPIST: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE', // TODO: Replace with your therapist registration Google Sheets script URL
    IPAPI: 'https://ipapi.co/json/',
    D_ID_AVATAR_DEFAULT: 'https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg',
    D_ID_AVATAR: 'https://api.d-id.com/talks',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
    PASSWORD_MIN_LENGTH: 12,
    PASSWORD_MAX_LENGTH: 128,
    EMAIL_MAX_LENGTH: 255,
    NAME_MAX_LENGTH: 100,
    PHONE_PATTERN: /^\+?[1-9]\d{1,14}$/,
    COUNTRY_CODE_LENGTH: 2,
} as const;

// Therapy Session Configuration
export const THERAPY_CONFIG = {
    MAX_MESSAGE_LENGTH: 500,
    AVATAR_POLL_INTERVAL: 2000, // ms
    AVATAR_MAX_POLLS: 15,
    VOICE_SAMPLE_RATE: 24000,
    VOICE_CHANNEL_COUNT: 1,
} as const;

// UI Configuration
export const UI_CONFIG = {
    TOAST_DURATION: 5000,
    CRISIS_TOAST_DURATION: 10000,
    ANIMATION_DELAY_BASE: 100, // ms for staggered animations
} as const;

// External Service URLs
export const EXTERNAL_SERVICES = {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
    SUPABASE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
} as const;

// Feature Flags (for gradual rollout of new features)
export const FEATURE_FLAGS = {
    ENABLE_VOICE_THERAPY: true,
    ENABLE_CHAT_THERAPY: true,
    ENABLE_AI_LEARNING: true,
    ENABLE_INSIGHT_FUSION: true,
    ENABLE_D_ID_AVATARS: true,
} as const;

// Emotion colors for therapy visualization
export const EMOTION_COLORS: Record<string, string> = {
    calm: 'bg-green-500',
    happy: 'bg-yellow-500',
    sad: 'bg-blue-500',
    anxious: 'bg-purple-500',
    angry: 'bg-red-500',
    hopeless: 'bg-gray-500',
    stressed: 'bg-orange-500',
    mixed: 'bg-pink-500',
} as const;

// Routes
export const ROUTES = {
    HOME: '/',
    AUTH: '/auth',
    LOGIN: '/login',
    REGISTER: '/register',
    TERMS: '/terms',
    PRIVACY: '/privacy',
    AI_THERAPY: '/ai-therapy',
    AI_THERAPY_CHAT: '/ai-therapy/chat',
    AI_THERAPY_VOICE: '/ai-therapy/voice',
    INSIGHT_FUSION: '/insight-fusion',
    AI_LEARNING: '/ai-learning',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    AUTH_REQUIRED: 'Please sign in to continue',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_ALREADY_EXISTS: 'This email is already registered. Please sign in.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    REGISTRATION_SUCCESS: 'Registration successful. Please check your email to verify your account.',
    LOGIN_SUCCESS: 'Welcome back!',
    LOGOUT_SUCCESS: 'You have been signed out.',
    MESSAGE_SENT: "Thank you! We'll get back to you soon.",
    THERAPIST_REGISTRATION_SENT: "Thank you for your interest! We'll review your application and get back to you soon.",
} as const;
