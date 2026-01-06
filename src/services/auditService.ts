import { supabase } from '@/integrations/supabase/safeClient';

export type AuditAction =
    | 'LOGIN'
    | 'LOGOUT'
    | 'REGISTER'
    | 'VOICE_SESSION_START'
    | 'VOICE_SESSION_END'
    | 'CRISIS_RESOURCE_VIEW'
    | 'DATA_DELETION_REQUEST'
    | 'PROFILE_UPDATE';

interface AuditLogEntry {
    action: AuditAction;
    details?: Record<string, any>;
    userId?: string;
}

/**
 * Service to handle compliance audit logging
 * Logs sensitive user actions for security and compliance monitoring
 */
export class AuditService {
    static async log(entry: AuditLogEntry) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const userId = entry.userId || session?.user?.id;

            if (!userId) {
                console.warn('[Audit] No user ID available for log:', entry.action);
                return;
            }

            const logData = {
                user_id: userId,
                action: entry.action,
                details: entry.details || {},
                ip_address: 'CLIENT_SIDE',
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString()
            };

            if (import.meta.env.DEV) {
                console.log('[Audit Service] Logging:', logData);
            }

            try {
                // @ts-ignore - audit_logs table exists in DB but not in generated types yet
                await supabase.from('audit_logs').insert(logData);
            } catch (dbError) {
                console.warn('[Audit Service] Failed to persist log to DB', dbError);
            }

        } catch (error) {
            console.error('[Audit Service] Error logging action:', error);
        }
    }
}
