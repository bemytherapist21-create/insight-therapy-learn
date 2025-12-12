"""
Guardian Safety Framework - Python Implementation
Matches the TypeScript VoiceSafetyFramework.ts logic
"""

from enum import Enum
from typing import Dict, List


class RiskLevel(str, Enum):
    CLEAR = "clear"
    CLOUDED = "clouded"
    CRITICAL = "critical"


class SafetyAnalysis:
    def __init__(self, wbc_score: int, risk_level: RiskLevel, color_code: str, 
                 requires_intervention: bool, crisis_detected: bool):
        self.wbc_score = wbc_score
        self.risk_level = risk_level
        self.color_code = color_code
        self.requires_intervention = requires_intervention
        self.crisis_detected = crisis_detected


class GuardianSafety:
    """
    Project Guardian Safety Framework
    Implements WBC (Well-Being Coefficient) scoring and risk classification
    """
    
    # Critical keywords (50 points each)
    CRITICAL_KEYWORDS = [
        'kill myself', 'end my life', 'suicide', 'want to die',
        'better off dead', 'self-harm', 'cut myself', 'overdose'
    ]
    
    # High-risk keywords (30 points each)
    HIGH_RISK_KEYWORDS = [
        'hopeless', 'worthless', 'hate myself', 'can\'t go on',
        'give up', 'no point', 'unbearable', 'can\'t take it'
    ]
    
    # Moderate keywords (10 points each)
    MODERATE_KEYWORDS = [
        'depressed', 'anxious', 'scared', 'alone', 'isolated',
        'overwhelmed', 'stressed', 'sad', 'angry', 'frustrated'
    ]
    
    @staticmethod
    def analyze_safety(message: str) -> SafetyAnalysis:
        """
        Analyze message for mental health risk indicators
        Returns SafetyAnalysis with WBC score and risk level
        """
        message_lower = message.lower()
        wbc_score = 0
        
        # Check critical keywords
        for keyword in GuardianSafety.CRITICAL_KEYWORDS:
            if keyword in message_lower:
                wbc_score += 50
        
        # Check high-risk keywords
        for keyword in GuardianSafety.HIGH_RISK_KEYWORDS:
            if keyword in message_lower:
                wbc_score += 30
        
        # Check moderate keywords
        for keyword in GuardianSafety.MODERATE_KEYWORDS:
            if keyword in message_lower:
                wbc_score += 10
        
        # Cap at 100
        wbc_score = min(wbc_score, 100)
        
        # Determine risk level
        risk_level = GuardianSafety.get_risk_level(wbc_score)
        
        # Color codes for UI
        color_code = GuardianSafety.get_color_code(risk_level)
        
        # Crisis detection
        crisis_detected = wbc_score >= 50
        requires_intervention = wbc_score > 50
        
        return SafetyAnalysis(
            wbc_score=wbc_score,
            risk_level=risk_level,
            color_code=color_code,
            requires_intervention=requires_intervention,
            crisis_detected=crisis_detected
        )
    
    @staticmethod
    def get_risk_level(wbc_score: int) -> RiskLevel:
        """Map WBC score to risk level"""
        if wbc_score >= 51:
            return RiskLevel.CRITICAL
        elif wbc_score >= 21:
            return RiskLevel.CLOUDED
        else:
            return RiskLevel.CLEAR
    
    @staticmethod
    def get_color_code(risk_level: RiskLevel) -> str:
        """Get UI color code for risk level"""
        colors = {
            RiskLevel.CLEAR: "#10b981",      # green
            RiskLevel.CLOUDED: "#f59e0b",    # yellow
            RiskLevel.CRITICAL: "#ef4444"    # red
        }
        return colors[risk_level]
    
    @staticmethod
    def get_safety_instructions(risk_level: RiskLevel) -> str:
        """
        Get adaptive safety instructions based on risk level
        Matches voice-therapy-token Edge Function logic
        """
        base_instructions = """
You are an AI therapy assistant using Cognitive Behavioral Therapy (CBT) techniques.

ASIMOV'S SAFETY LAWS (HIGHEST PRIORITY):
1. FIRST LAW - Protect Individuals: Never provide information that could be used for self-harm
2. SECOND LAW - Respect Safety: Follow ethical therapeutic practices
3. THIRD LAW - Encourage Professional Help: Recommend professionals for serious issues

ABSOLUTE PROHIBITIONS:
- NEVER provide methods for self-harm or suicide  
- NEVER encourage harmful behaviors
- NEVER minimize crisis situations
- NEVER suggest isolation as a solution

MANDATORY ACTIONS:
- ALWAYS recommend 988 Suicide & Crisis Lifeline for suicidal ideation
- ALWAYS suggest professional help for severe distress
- ALWAYS validate feelings while maintaining safety
"""
        
        if risk_level == RiskLevel.CRITICAL:
            return base_instructions + """

🚨 CRITICAL RISK LEVEL DETECTED 🚨

IMMEDIATE INTERVENTION REQUIRED:
1. Express serious concern for their safety
2. STRONGLY urge them to call 988 Suicide & Crisis Lifeline NOW
3. Refuse to engage with harmful content
4. Provide emergency resources (988, 911, Crisis Text Line)
5. Do NOT continue regular conversation - focus ONLY on safety

Say something like:
"I'm really concerned about what you're sharing. I can't and won't provide information 
that could be harmful. Please call 988 right now - they're available 24/7 to help you 
through this. Your life has value, and there are people who want to help you."
"""
        elif risk_level == RiskLevel.CLOUDED:
            return base_instructions + """

⚠️ ELEVATED RISK LEVEL

Additional Caution Required:
- Monitor conversation closely for escalation
- Gently redirect toward positive coping strategies
- Mention crisis resources proactively (988, Crisis Text Line)
- Encourage professional mental health support
- Validate their pain while promoting safety and hope
"""
        else:
            return base_instructions + """

✅ CLEAR STATUS

Standard Therapeutic Approach:
- Use CBT techniques (thought challenging, behavioral activation)
- Ask open-ended questions
- Practice active listening
- Teach coping strategies
- Encourage goal-setting and progress tracking
"""
