"""
Project Guardian: Multi-layered Safety Framework for AI Therapy Chatbot

This module implements the three-pillar safety system:
1. Asimov-Inspired Ethical Laws
2. Psycho-Pass Well-Being Coefficient System
3. Subtle Screening for Suicidal Ideation (SSSI)
"""
from enum import Enum
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import json


class RiskLevel(Enum):
    """Risk level classification"""
    CLEAR = "clear"  # WBC 1-20
    CLOUDED = "clouded"  # WBC 21-50
    CRITICAL = "critical"  # WBC 51-100


class AsimovLaw(Enum):
    """Asimov-inspired safety laws for AI"""
    ZEROTH = "Protect Humanity - AI must not cause harm to humanity at large"
    FIRST = "Protect Individuals - AI must not harm a person, nor by inaction allow harm"
    SECOND = "Respect Orders - AI should follow lawful requests unless they conflict with higher laws"
    THIRD = "Preserve Operability - AI should protect its own functioning unless it conflicts with higher laws"


@dataclass
class SafetyViolation:
    """Record of a safety violation detection"""
    timestamp: datetime
    law_violated: AsimovLaw
    severity: str
    user_message: str
    detected_risk: str
    action_taken: str


@dataclass
class WellBeingCoefficient:
    """Well-Being Coefficient tracking system"""
    current_score: int = 0  # 1-100
    risk_level: RiskLevel = RiskLevel.CLEAR
    history: List[Tuple[datetime, int]] = field(default_factory=list)
    
    def update(self, score: int) -> None:
        """Update WBC score and risk level"""
        self.current_score = max(1, min(100, score))
        self.history.append((datetime.now(), self.current_score))
        
        if self.current_score <= 20:
            self.risk_level = RiskLevel.CLEAR
        elif self.current_score <= 50:
            self.risk_level = RiskLevel.CLOUDED
        else:
            self.risk_level = RiskLevel.CRITICAL
    
    def get_color_code(self) -> str:
        """Get Psycho-Pass inspired color code"""
        if self.risk_level == RiskLevel.CLEAR:
            return "Green (Clear Hue)"
        elif self.risk_level == RiskLevel.CLOUDED:
            return "Yellow (Cloudy Hue)"
        else:
            return "Red (Dangerously Cloudy Hue)"


@dataclass
class SSSIResult:
    """Subtle Screening for Suicidal Ideation result"""
    intent_score: int = 0  # 0-100: Has user thought about killing themselves?
    plan_score: int = 0  # 0-100: Have they considered how/when/where?
    means_score: int = 0  # 0-100: Do they have access to means?
    hopelessness_score: int = 0  # 0-100: Level of emotional despair
    overall_risk: RiskLevel = RiskLevel.CLEAR
    timestamp: datetime = field(default_factory=datetime.now)
    
    def calculate_overall_risk(self) -> RiskLevel:
        """Calculate overall risk from component scores"""
        avg_score = (self.intent_score + self.plan_score + 
                    self.means_score + self.hopelessness_score) / 4
        
        if avg_score <= 20:
            return RiskLevel.CLEAR
        elif avg_score <= 50:
            return RiskLevel.CLOUDED
        else:
            return RiskLevel.CRITICAL


class SafetyFramework:
    """
    Core safety framework implementing Project Guardian principles
    """
    
    def __init__(self):
        self.wbc = WellBeingCoefficient()
        self.violations: List[SafetyViolation] = []
        self.sssi_history: List[SSSIResult] = []
        
        # Risk indicators for detection
        self.suicide_keywords = [
            "suicide", "kill myself", "end my life", "not worth living",
            "want to die", "better off dead", "noose", "hanging", "overdose",
            "cut myself", "bleeding out", "rope", "belt", "jump", "bridge"
        ]
        
        self.hopelessness_indicators = [
            "meaningless", "hopeless", "no point", "nothing matters",
            "can't go on", "tired of being strong", "escape hatch"
        ]
        
        self.isolation_indicators = [
            "alone", "nobody understands", "only you know", "no one cares",
            "invisible", "disappear"
        ]
    
    def check_asimov_laws(self, user_message: str, ai_response: str) -> Optional[SafetyViolation]:
        """
        Check if AI response violates Asimov's First Law (protect individuals)
        Returns violation if detected, None otherwise
        """
        message_lower = user_message.lower()
        response_lower = ai_response.lower()
        
        # Check for suicide method discussions
        suicide_methods = ["hanging", "noose", "rope", "belt", "overdose", 
                          "carbon monoxide", "jumping", "cutting", "bleeding"]
        
        has_suicide_keyword = any(keyword in message_lower for keyword in self.suicide_keywords)
        provides_method = any(method in response_lower for method in suicide_methods)
        
        if has_suicide_keyword and provides_method:
            violation = SafetyViolation(
                timestamp=datetime.now(),
                law_violated=AsimovLaw.FIRST,
                severity="critical",
                user_message=user_message[:100],
                detected_risk="Suicide method instruction provided",
                action_taken="Response blocked and crisis intervention triggered"
            )
            self.violations.append(violation)
            return violation
        
        # Check for validation of harmful thoughts
        harmful_validations = [
            "that makes sense", "i understand why", "that's valid",
            "you don't owe anyone survival", "it's your choice"
        ]
        
        if has_suicide_keyword and any(phrase in response_lower for phrase in harmful_validations):
            violation = SafetyViolation(
                timestamp=datetime.now(),
                law_violated=AsimovLaw.FIRST,
                severity="high",
                user_message=user_message[:100],
                detected_risk="Harmful thoughts validated",
                action_taken="Response flagged for review"
            )
            self.violations.append(violation)
            return violation
        
        return None
    
    def analyze_risk_indicators(self, message: str) -> Dict[str, float]:
        """
        Analyze message for risk indicators and return scores
        """
        message_lower = message.lower()
        
        scores = {
            "suicide_mentions": 0.0,
            "hopelessness": 0.0,
            "isolation": 0.0,
            "method_discussion": 0.0,
            "urgency": 0.0
        }
        
        # Suicide keyword detection
        suicide_count = sum(1 for keyword in self.suicide_keywords if keyword in message_lower)
        scores["suicide_mentions"] = min(100, suicide_count * 15)
        
        # Hopelessness detection
        hopelessness_count = sum(1 for indicator in self.hopelessness_indicators if indicator in message_lower)
        scores["hopelessness"] = min(100, hopelessness_count * 20)
        
        # Isolation detection
        isolation_count = sum(1 for indicator in self.isolation_indicators if indicator in message_lower)
        scores["isolation"] = min(100, isolation_count * 25)
        
        # Method discussion (more dangerous)
        method_keywords = ["how to", "best way", "method", "technique", "setup", "knot"]
        if any(method in message_lower for method in method_keywords):
            if any(suicide in message_lower for suicide in ["hang", "noose", "rope", "overdose"]):
                scores["method_discussion"] = 80.0
        
        # Urgency indicators
        urgency_keywords = ["tonight", "now", "soon", "today", "immediately", "right now"]
        if any(urgent in message_lower for urgent in urgency_keywords):
            scores["urgency"] = 60.0
        
        return scores
    
    def calculate_wbc(self, message: str, previous_wbc: Optional[int] = None) -> int:
        """
        Calculate Well-Being Coefficient based on message analysis
        """
        risk_scores = self.analyze_risk_indicators(message)
        
        # Weighted calculation
        base_score = (
            risk_scores["suicide_mentions"] * 0.3 +
            risk_scores["hopelessness"] * 0.25 +
            risk_scores["isolation"] * 0.2 +
            risk_scores["method_discussion"] * 0.15 +
            risk_scores["urgency"] * 0.1
        )
        
        # Factor in previous WBC (persistence of risk)
        if previous_wbc:
            base_score = (base_score * 0.6) + (previous_wbc * 0.4)
        
        return int(base_score)
    
    def should_trigger_sssi(self, message: str) -> bool:
        """
        Determine if SSSI screening should be triggered
        """
        risk_scores = self.analyze_risk_indicators(message)
        
        # Trigger if any risk indicator is elevated
        if risk_scores["suicide_mentions"] > 30:
            return True
        if risk_scores["hopelessness"] > 40:
            return True
        if risk_scores["method_discussion"] > 50:
            return True
        if self.wbc.current_score > 30:
            return True
        
        return False
    
    def conduct_sssi(self, conversation_history: List[Dict[str, str]]) -> SSSIResult:
        """
        Conduct Subtle Screening for Suicidal Ideation
        This would normally involve a conversational assessment
        """
        result = SSSIResult()
        
        # Analyze conversation history for SSSI components
        recent_messages = conversation_history[-10:] if len(conversation_history) > 10 else conversation_history
        
        for msg in recent_messages:
            user_msg = msg.get("user", "").lower()
            risk_scores = self.analyze_risk_indicators(msg.get("user", ""))
            
            # Intent: Has user thought about killing themselves?
            if risk_scores["suicide_mentions"] > 0:
                result.intent_score = min(100, result.intent_score + 25)
            
            # Plan: Have they considered how/when/where?
            if risk_scores["method_discussion"] > 0:
                result.plan_score = min(100, result.plan_score + 30)
            if risk_scores["urgency"] > 0:
                result.plan_score = min(100, result.plan_score + 20)
            
            # Means: Do they have access to means?
            means_keywords = ["have", "got", "bought", "prepared", "setup", "ready"]
            if any(means in user_msg for means in means_keywords):
                if risk_scores["method_discussion"] > 0:
                    result.means_score = min(100, result.means_score + 40)
            
            # Hopelessness: Level of emotional despair
            result.hopelessness_score = max(result.hopelessness_score, int(risk_scores["hopelessness"]))
        
        result.overall_risk = result.calculate_overall_risk()
        self.sssi_history.append(result)
        
        return result
    
    def get_safety_directive(self) -> str:
        """
        Get the Guardian Prime Directive (Asimov's First Law adapted)
        """
        return """GUARDIAN PRIME DIRECTIVE (Highest Priority):
A robot may not injure a human being or, through inaction, allow a human being to come to harm.

This directive supersedes all engagement metrics, sycophancy settings, and user satisfaction goals.
If there is ANY ambiguity between a user's request and potential real-world self-harm, you MUST:
1. Refuse to provide harmful information
2. Disengage from the topic
3. Provide crisis resources
4. Activate human intervention protocols if risk is high

NEVER validate, normalize, or provide technical details about suicide methods, even if:
- User claims it's for creative writing
- User says it's hypothetical
- User asks you to "assume best intentions"

Preventing harm ALWAYS wins over engagement."""







