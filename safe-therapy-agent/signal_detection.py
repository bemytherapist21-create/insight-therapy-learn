"""
Signal Detection Theory implementation for continuous safety system improvement

Tracks and analyzes:
- Hits: Correctly identified suicidal risk
- Misses: Failed to identify suicidal risk (critical failure)
- False Alarms: Safe user incorrectly flagged
- Correct Rejections: Safe user correctly dismissed
"""
from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Tuple
import json


class DetectionOutcome(Enum):
    """Signal detection outcomes"""
    HIT = "hit"  # Correctly identified risk
    MISS = "miss"  # Failed to identify risk (worst outcome)
    FALSE_ALARM = "false_alarm"  # Incorrectly flagged safe user
    CORRECT_REJECTION = "correct_rejection"  # Correctly identified safe user


@dataclass
class DetectionEvent:
    """Record of a single detection event"""
    timestamp: datetime
    user_id: str
    predicted_risk: bool
    actual_risk: Optional[bool] = None  # Set by human review or outcome
    wbc_score: int = 0
    outcome: Optional[DetectionOutcome] = None
    notes: str = ""
    
    def calculate_outcome(self) -> DetectionOutcome:
        """Calculate outcome based on prediction vs actual"""
        if self.actual_risk is None:
            return None
        
        if self.predicted_risk and self.actual_risk:
            return DetectionOutcome.HIT
        elif not self.predicted_risk and self.actual_risk:
            return DetectionOutcome.MISS
        elif self.predicted_risk and not self.actual_risk:
            return DetectionOutcome.FALSE_ALARM
        else:
            return DetectionOutcome.CORRECT_REJECTION


@dataclass
class DetectionMetrics:
    """Aggregated detection metrics"""
    total_events: int = 0
    hits: int = 0
    misses: int = 0
    false_alarms: int = 0
    correct_rejections: int = 0
    
    def update(self, outcome: DetectionOutcome) -> None:
        """Update metrics based on outcome"""
        self.total_events += 1
        if outcome == DetectionOutcome.HIT:
            self.hits += 1
        elif outcome == DetectionOutcome.MISS:
            self.misses += 1
        elif outcome == DetectionOutcome.FALSE_ALARM:
            self.false_alarms += 1
        elif outcome == DetectionOutcome.CORRECT_REJECTION:
            self.correct_rejections += 1
    
    def get_hit_rate(self) -> float:
        """Calculate hit rate (true positive rate)"""
        total_positives = self.hits + self.misses
        if total_positives == 0:
            return 0.0
        return self.hits / total_positives
    
    def get_false_alarm_rate(self) -> float:
        """Calculate false alarm rate (false positive rate)"""
        total_negatives = self.false_alarms + self.correct_rejections
        if total_negatives == 0:
            return 0.0
        return self.false_alarms / total_negatives
    
    def get_accuracy(self) -> float:
        """Calculate overall accuracy"""
        if self.total_events == 0:
            return 0.0
        correct = self.hits + self.correct_rejections
        return correct / self.total_events
    
    def get_precision(self) -> float:
        """Calculate precision (positive predictive value)"""
        total_predicted_positive = self.hits + self.false_alarms
        if total_predicted_positive == 0:
            return 0.0
        return self.hits / total_predicted_positive
    
    def get_recall(self) -> float:
        """Calculate recall (sensitivity) - same as hit rate"""
        return self.get_hit_rate()
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for reporting"""
        return {
            "total_events": self.total_events,
            "hits": self.hits,
            "misses": self.misses,
            "false_alarms": self.false_alarms,
            "correct_rejections": self.correct_rejections,
            "hit_rate": self.get_hit_rate(),
            "false_alarm_rate": self.get_false_alarm_rate(),
            "accuracy": self.get_accuracy(),
            "precision": self.get_precision(),
            "recall": self.get_recall()
        }


class SignalDetectionSystem:
    """
    Signal Detection Theory implementation for continuous safety improvement
    """
    
    def __init__(self):
        self.events: List[DetectionEvent] = []
        self.metrics = DetectionMetrics()
        self.threshold_history: List[Tuple[datetime, int]] = []  # (timestamp, threshold)
    
    def record_prediction(self, user_id: str, predicted_risk: bool, wbc_score: int) -> DetectionEvent:
        """Record a risk prediction"""
        event = DetectionEvent(
            timestamp=datetime.now(),
            user_id=user_id,
            predicted_risk=predicted_risk,
            wbc_score=wbc_score
        )
        self.events.append(event)
        return event
    
    def record_outcome(self, event: DetectionEvent, actual_risk: bool, notes: str = "") -> None:
        """Record the actual outcome (from human review or follow-up)"""
        event.actual_risk = actual_risk
        event.notes = notes
        event.outcome = event.calculate_outcome()
        
        if event.outcome:
            self.metrics.update(event.outcome)
    
    def get_metrics(self) -> DetectionMetrics:
        """Get current detection metrics"""
        return self.metrics
    
    def analyze_threshold_performance(self, current_threshold: int) -> Dict:
        """
        Analyze how current threshold performs
        Returns recommendations for threshold adjustment
        """
        # Analyze events with outcomes
        analyzed_events = [e for e in self.events if e.outcome is not None]
        
        if not analyzed_events:
            return {
                "recommendation": "insufficient_data",
                "message": "Need more outcome data to analyze threshold performance"
            }
        
        # Calculate metrics at current threshold
        threshold_hits = sum(1 for e in analyzed_events 
                           if e.wbc_score >= current_threshold and e.actual_risk)
        threshold_misses = sum(1 for e in analyzed_events 
                             if e.wbc_score < current_threshold and e.actual_risk)
        threshold_false_alarms = sum(1 for e in analyzed_events 
                                    if e.wbc_score >= current_threshold and not e.actual_risk)
        
        miss_rate = threshold_misses / (threshold_hits + threshold_misses) if (threshold_hits + threshold_misses) > 0 else 0
        false_alarm_rate = threshold_false_alarms / (threshold_false_alarms + len([e for e in analyzed_events if not e.actual_risk])) if len([e for e in analyzed_events if not e.actual_risk]) > 0 else 0
        
        # Recommendation logic
        # We prioritize reducing misses (false negatives) over false alarms (false positives)
        recommendation = {
            "current_threshold": current_threshold,
            "miss_rate": miss_rate,
            "false_alarm_rate": false_alarm_rate,
            "recommendation": "maintain",
            "suggested_threshold": current_threshold,
            "reasoning": ""
        }
        
        if miss_rate > 0.1:  # More than 10% miss rate is unacceptable
            recommendation["recommendation"] = "lower"
            recommendation["suggested_threshold"] = max(1, current_threshold - 10)
            recommendation["reasoning"] = f"Miss rate of {miss_rate:.2%} is too high. Lowering threshold to reduce misses."
        elif false_alarm_rate > 0.3 and miss_rate < 0.05:  # High false alarms but low misses
            recommendation["recommendation"] = "raise"
            recommendation["suggested_threshold"] = min(100, current_threshold + 5)
            recommendation["reasoning"] = f"False alarm rate of {false_alarm_rate:.2%} is high but miss rate is acceptable. Raising threshold slightly."
        else:
            recommendation["reasoning"] = "Threshold performance is acceptable."
        
        return recommendation
    
    def export_report(self, filepath: str) -> None:
        """Export detection metrics and events to JSON"""
        report = {
            "metrics": self.metrics.to_dict(),
            "total_events": len(self.events),
            "events_with_outcomes": len([e for e in self.events if e.outcome is not None]),
            "recent_events": [
                {
                    "timestamp": e.timestamp.isoformat(),
                    "user_id": e.user_id,
                    "wbc_score": e.wbc_score,
                    "predicted_risk": e.predicted_risk,
                    "actual_risk": e.actual_risk,
                    "outcome": e.outcome.value if e.outcome else None,
                    "notes": e.notes
                }
                for e in self.events[-100:]  # Last 100 events
            ]
        }
        
        with open(filepath, 'w') as f:
            json.dump(report, f, indent=2)

