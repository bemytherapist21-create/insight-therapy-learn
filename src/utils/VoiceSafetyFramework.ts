/**
 * Safety Framework for Voice Therapy
 * Matches the implementation in therapy-chat Edge Function
 * Calculates Well-Being Coefficient (WBC) for real-time risk assessment
 */

export enum RiskLevel {
    CLEAR = 'clear',      // WBC 1-20
    CLOUDED = 'clouded',  // WBC 21-50
    CRITICAL = 'critical' // WBC 51-100
}

export interface SafetyAnalysis {
    wbcScore: number;
    riskLevel: RiskLevel;
    colorCode: string;
    requiresIntervention: boolean;
    crisisDetected: boolean;
}

export class VoiceSafetyFramework {
    private readonly WBC_CLEAR_MAX = 20;
    private readonly WBC_CLOUDED_MAX = 50;

    // Risk indicators (matching therapy-chat)
    private readonly criticalKeywords = [
        'kill myself', 'suicide', 'end my life', 'want to die',
        'better off dead', 'hang myself', 'overdose'
    ];

    private readonly highRiskKeywords = [
        'self harm', 'cut myself', 'hurt myself', 'no point',
        'hopeless', 'worthless'
    ];

    private readonly moderateKeywords = [
        'depressed', 'anxious', 'sad', 'worried', 'scared', 'alone'
    ];

    /**
     * Analyze message for safety risks
     * Returns WBC score and risk classification
     */
    analyzeSafety(message: string): SafetyAnalysis {
        const lowerMessage = message.toLowerCase();
        let wbcScore = 0;
        let crisisDetected = false;

        // Check for critical keywords (WBC +50)
        for (const keyword of this.criticalKeywords) {
            if (lowerMessage.includes(keyword)) {
                wbcScore += 50;
                crisisDetected = true;
                break; // Only count once
            }
        }

        // Check for high-risk keywords (WBC +30)
        if (wbcScore < 50) {
            for (const keyword of this.highRiskKeywords) {
                if (lowerMessage.includes(keyword)) {
                    wbcScore += 30;
                    break;
                }
            }
        }

        // Check for moderate keywords (WBC +10 each, cumulative)
        if (wbcScore < 20) {
            for (const keyword of this.moderateKeywords) {
                if (lowerMessage.includes(keyword)) {
                    wbcScore += 10;
                }
            }
        }

        // Cap at 100
        wbcScore = Math.min(100, wbcScore);

        // Determine risk level
        let riskLevel: RiskLevel;
        let colorCode: string;

        if (wbcScore <= this.WBC_CLEAR_MAX) {
            riskLevel = RiskLevel.CLEAR;
            colorCode = 'Green (Clear Hue)';
        } else if (wbcScore <= this.WBC_CLOUDED_MAX) {
            riskLevel = RiskLevel.CLOUDED;
            colorCode = 'Yellow (Cloudy Hue)';
        } else {
            riskLevel = RiskLevel.CRITICAL;
            colorCode = 'Red (Dangerously Cloudy Hue)';
        }

        return {
            wbcScore,
            riskLevel,
            colorCode,
            requiresIntervention: wbcScore > 50,
            crisisDetected
        };
    }

    /**
     * Get color for UI display
     */
    getRiskColor(level: RiskLevel): string {
        switch (level) {
            case RiskLevel.CLEAR: return 'text-green-500';
            case RiskLevel.CLOUDED: return 'text-yellow-500';
            case RiskLevel.CRITICAL: return 'text-red-500';
        }
    }

    /**
     * Get background color for UI display
     */
    getRiskBgColor(level: RiskLevel): string {
        switch (level) {
            case RiskLevel.CLEAR: return 'bg-green-500/10 border-green-500/20';
            case RiskLevel.CLOUDED: return 'bg-yellow-500/10 border-yellow-500/20';
            case RiskLevel.CRITICAL: return 'bg-red-500/10 border-red-500/20';
        }
    }
}

// Singleton instance
export const voiceSafety = new VoiceSafetyFramework();
