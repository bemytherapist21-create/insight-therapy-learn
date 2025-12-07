/**
 * Centralized logging service
 * Replaces console.log/console.error with structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: Record<string, unknown>;
    error?: Error;
}

class LoggingService {
    private isDevelopment: boolean;
    private logs: LogEntry[] = [];
    private maxLogs = 100; // Keep last 100 logs in memory

    constructor() {
        this.isDevelopment = import.meta.env.DEV;
    }

    private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date(),
            context,
            error,
        };

        // Store in memory
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console output in development
        if (this.isDevelopment) {
            const formattedMessage = `[${level.toUpperCase()}] ${message}`;

            switch (level) {
                case 'debug':
                case 'info':
                    console.log(formattedMessage, context || '');
                    break;
                case 'warn':
                    console.warn(formattedMessage, context || '');
                    break;
                case 'error':
                    console.error(formattedMessage, context || '', error || '');
                    break;
            }
        }

        // In production, you could send to a logging service here
        // Example: send to custom endpoint, or use free tier of LogRocket, etc.
    }

    debug(message: string, context?: Record<string, unknown>): void {
        this.log('debug', message, context);
    }

    info(message: string, context?: Record<string, unknown>): void {
        this.log('info', message, context);
    }

    warn(message: string, context?: Record<string, unknown>): void {
        this.log('warn', message, context);
    }

    error(message: string, error?: Error, context?: Record<string, unknown>): void {
        this.log('error', message, context, error);
    }

    // Get recent logs (for debugging)
    getRecentLogs(count: number = 50): LogEntry[] {
        return this.logs.slice(-count);
    }

    // Clear logs
    clear(): void {
        this.logs = [];
    }
}

// Export singleton instance
export const logger = new LoggingService();

// Export type for use in other files
export type { LogEntry, LogLevel };
