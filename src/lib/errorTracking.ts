import { supabase } from '@/integrations/supabase/safeClient';

export interface ErrorLogEntry {
    message: string;
    stack?: string;
    componentStack?: string;
    context?: Record<string, any>;
    level?: 'error' | 'warning' | 'info';
}

/**
 * Service for tracking and reporting application errors.
 * In a production environment, this would integrate with Sentry, LogRocket, or similar.
 * For this budget-constrained implementation, we log to console and optionally Supabase.
 */
export class ErrorTrackingService {
    private static isDev = import.meta.env.DEV;

    static async captureException(error: Error | any, context?: Record<string, any>) {
        const entry: ErrorLogEntry = {
            message: error?.message || String(error),
            stack: error?.stack,
            context,
            level: 'error',
        };

        // Always log to console in development
        if (this.isDev) {
            console.group('[ErrorTracking]');
            console.error(entry.message);
            if (entry.stack) console.error(entry.stack);
            if (entry.context) console.info('Context:', entry.context);
            console.groupEnd();
        }

        // specific handling for different environments could go here
        // e.g. sending to a dedicated error logging endpoint
        try {
            // Optional: Log critical errors to Supabase if configured
            // await supabase.from('error_logs').insert({...});
        } catch (e) {
            console.error('Failed to log error to remote service', e);
        }
    }

    static captureMessage(message: string, level: ErrorLogEntry['level'] = 'info', context?: Record<string, any>) {
        if (this.isDev) {
            console.log(`[${level.toUpperCase()}] ${message}`, context);
        }
    }
}
