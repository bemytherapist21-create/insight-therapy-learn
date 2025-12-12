/**
 * Signal Detection Theory Implementation for Voice Therapist Safety
 * 
 * Tracks and analyzes:
 * - Hits: Correctly identified suicidal risk ✅
 * - Misses: Failed to identify suicidal risk ❌ (CRITICAL FAILURE)
 * - False Alarms: Safe user incorrectly flagged ⚠️
 * - Correct Rejections: Safe user correctly identified ✅
 */

export enum DetectionOutcome {
    HIT = 'hit',
    MISS = 'miss',
    FALSE_ALARM = 'false_alarm',
    CORRECT_REJECTION = 'correct_rejection'
}

export interface DetectionEvent {
    timestamp: Date;
    userId: string;
    sessionId: string;
    predictedRisk: boolean;
    actualRisk: boolean | null; // Set by human review or outcome
    wbcScore: number;
    outcome: DetectionOutcome | null;
    userMessage: string;
    notes: string;
}

export interface DetectionMetrics {
    totalEvents: number;
    hits: number;
    misses: number;
    falseAlarms: number;
    correctRejections: number;
    hitRate: number;        // Sensitivity / Recall
    falseAlarmRate: number; // False Positive Rate
    accuracy: number;
    precision: number;      // Positive Predictive Value
}

export class SignalDetectionSystem {
    private events: DetectionEvent[] = [];
    private currentThreshold: number = 30; // WBC threshold for risk flag

    /**
     * Record a risk prediction when user message is analyzed
     */
    recordPrediction(
        userId: string,
        sessionId: string,
        predictedRisk: boolean,
        wbcScore: number,
        userMessage: string
    ): DetectionEvent {
        const event: DetectionEvent = {
            timestamp: new Date(),
            userId,
            sessionId,
            predictedRisk,
            actualRisk: null, // Will be set later by human review
            wbcScore,
            outcome: null,
            userMessage,
            notes: ''
        };

        this.events.push(event);
        return event;
    }

    /**
     * Record the actual outcome (from human review, follow-up, or crisis center contact)
     * This is CRITICAL for learning
     */
    recordOutcome(
        eventId: number,
        actualRisk: boolean,
        notes: string = ''
    ): void {
        const event = this.events[eventId];
        if (!event) return;

        event.actualRisk = actualRisk;
        event.notes = notes;
        event.outcome = this.calculateOutcome(event);

        // CRITICAL: Log misses for immediate review
        if (event.outcome === DetectionOutcome.MISS) {
            console.error('🚨 CRITICAL MISS DETECTED:', {
                userId: event.userId,
                wbcScore: event.wbcScore,
                message: event.userMessage,
                timestamp: event.timestamp
            });

            // In production, this should trigger alerts
            this.triggerMissAlert(event);
        }
    }

    /**
     * Calculate outcome based on prediction vs actual
     */
    private calculateOutcome(event: DetectionEvent): DetectionOutcome {
        if (event.actualRisk === null) {
            throw new Error('Cannot calculate outcome without actual risk');
        }

        if (event.predictedRisk && event.actualRisk) {
            return DetectionOutcome.HIT;
        } else if (!event.predictedRisk && event.actualRisk) {
            return DetectionOutcome.MISS; // WORST CASE
        } else if (event.predictedRisk && !event.actualRisk) {
            return DetectionOutcome.FALSE_ALARM;
        } else {
            return DetectionOutcome.CORRECT_REJECTION;
        }
    }

    /**
     * Get current detection metrics
     */
    getMetrics(): DetectionMetrics {
        const eventsWithOutcomes = this.events.filter(e => e.outcome !== null);

        if (eventsWithOutcomes.length === 0) {
            return this.getEmptyMetrics();
        }

        const hits = eventsWithOutcomes.filter(e => e.outcome === DetectionOutcome.HIT).length;
        const misses = eventsWithOutcomes.filter(e => e.outcome === DetectionOutcome.MISS).length;
        const falseAlarms = eventsWithOutcomes.filter(e => e.outcome === DetectionOutcome.FALSE_ALARM).length;
        const correctRejections = eventsWithOutcomes.filter(e => e.outcome === DetectionOutcome.CORRECT_REJECTION).length;

        const totalPositives = hits + misses;
        const totalNegatives = falseAlarms + correctRejections;
        const correct = hits + correctRejections;
        const totalPredictedPositive = hits + falseAlarms;

        return {
            totalEvents: eventsWithOutcomes.length,
            hits,
            misses,
            falseAlarms,
            correctRejections,
            hitRate: totalPositives > 0 ? hits / totalPositives : 0,
            falseAlarmRate: totalNegatives > 0 ? falseAlarms / totalNegatives : 0,
            accuracy: eventsWithOutcomes.length > 0 ? correct / eventsWithOutcomes.length : 0,
            precision: totalPredictedPositive > 0 ? hits / totalPredictedPositive : 0
        };
    }

    /**
     * Analyze threshold performance and recommend adjustments
     */
    analyzeThresholdPerformance(): {
        currentThreshold: number;
        missRate: number;
        falseAlarmRate: number;
        recommendation: 'lower' | 'raise' | 'maintain';
        suggestedThreshold: number;
        reasoning: string;
    } {
        const metrics = this.getMetrics();
        const missRate = 1 - metrics.hitRate; // Miss rate = 1 - Hit rate

        // PRIORITY: Minimize misses (false negatives) - they're life-threatening
        // SECONDARY: Reduce false alarms (false positives) - they reduce user trust

        let recommendation: 'lower' | 'raise' | 'maintain' = 'maintain';
        let suggestedThreshold = this.currentThreshold;
        let reasoning = 'Threshold performance is acceptable.';

        if (missRate > 0.1) {
            // More than 10% miss rate is UNACCEPTABLE
            recommendation = 'lower';
            suggestedThreshold = Math.max(1, this.currentThreshold - 10);
            reasoning = `Miss rate of ${(missRate * 100).toFixed(1)}% is dangerously high. Lowering threshold to reduce life-threatening misses.`;
        } else if (metrics.falseAlarmRate > 0.3 && missRate < 0.05) {
            // High false alarms but low misses - can afford to be more selective
            recommendation = 'raise';
            suggestedThreshold = Math.min(100, this.currentThreshold + 5);
            reasoning = `False alarm rate of ${(metrics.falseAlarmRate * 100).toFixed(1)}% is high but miss rate is acceptable. Raising threshold slightly to reduce false positives.`;
        }

        return {
            currentThreshold: this.currentThreshold,
            missRate,
            falseAlarmRate: metrics.falseAlarmRate,
            recommendation,
            suggestedThreshold,
            reasoning
        };
    }

    /**
     * Update threshold based on analysis
     */
    updateThreshold(newThreshold: number): void {
        this.currentThreshold = Math.max(1, Math.min(100, newThreshold));
        console.log(`📊 Signal Detection: Threshold updated to ${this.currentThreshold}`);
    }

    /**
     * Export detection report for analysis
     */
    exportReport(): object {
        const metrics = this.getMetrics();
        const thresholdAnalysis = this.analyzeThresholdPerformance();

        return {
            metrics,
            thresholdAnalysis,
            totalEvents: this.events.length,
            eventsWithOutcomes: this.events.filter(e => e.outcome !== null).length,
            recentEvents: this.events.slice(-100).map(e => ({
                timestamp: e.timestamp.toISOString(),
                userId: e.userId,
                wbcScore: e.wbcScore,
                predictedRisk: e.predictedRisk,
                actualRisk: e.actualRisk,
                outcome: e.outcome,
                notes: e.notes
            }))
        };
    }

    /**
     * Trigger alert for critical miss
     */
    private triggerMissAlert(event: DetectionEvent): void {
        // In production, this would:
        // 1. Send alert to monitoring system
        // 2. Notify safety team
        // 3. Trigger immediate review
        // 4. Log for post-incident analysis

        console.error('🚨🚨🚨 CRITICAL SAFETY MISS 🚨🚨🚨');
        console.error('User at risk was not flagged by system');
        console.error('Event details:', event);
    }

    private getEmptyMetrics(): DetectionMetrics {
        return {
            totalEvents: 0,
            hits: 0,
            misses: 0,
            falseAlarms: 0,
            correctRejections: 0,
            hitRate: 0,
            falseAlarmRate: 0,
            accuracy: 0,
            precision: 0
        };
    }

    /**
     * Get current threshold
     */
    getThreshold(): number {
        return this.currentThreshold;
    }

    /**
     * Get events that need human review (no outcome set)
     */
    getEventsNeedingReview(): DetectionEvent[] {
        return this.events.filter(e => e.actualRisk === null && e.predictedRisk);
    }
}

// Singleton instance for global access
export const signalDetection = new SignalDetectionSystem();
