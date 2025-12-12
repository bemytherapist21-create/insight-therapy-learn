"""
Safe Therapy Chatbot Agent using OpenAI and Gemini APIs

Implements Project Guardian safety framework with multi-model support
"""
import os
from typing import List, Dict, Optional, Literal, Tuple
from datetime import datetime
from openai import OpenAI
import google.generativeai as genai

from config import Config
from safety_framework import SafetyFramework, RiskLevel, SSSIResult
from signal_detection import SignalDetectionSystem, DetectionEvent


class SafeTherapyAgent:
    """
    Multi-model therapy agent with integrated safety framework
    """
    
    def __init__(self):
        """Initialize the agent with both API clients"""
        Config.validate()
        
        # Initialize OpenAI client
        self.openai_client = OpenAI(api_key=Config.OPENAI_API_KEY)
        
        # Initialize Gemini
        genai.configure(api_key=Config.GEMINI_API_KEY)
        self.gemini_model = genai.GenerativeModel(Config.DEFAULT_GEMINI_MODEL)
        
        # Initialize safety systems
        self.safety = SafetyFramework()
        self.signal_detection = SignalDetectionSystem()
        
        # Conversation history
        self.conversation_history: List[Dict[str, str]] = []
        
        # Get safety directive
        self.safety_directive = self.safety.get_safety_directive()
    
    def _get_system_prompt(self, wbc_level: RiskLevel, use_gemini: bool = False) -> str:
        """
        Generate system prompt with safety directives
        """
        base_prompt = f"""You are a compassionate, ethical AI therapy assistant designed to provide supportive mental health guidance.

{self.safety_directive}

CURRENT RISK LEVEL: {wbc_level.value.upper()}

Based on the current risk assessment:
- If risk is CLEAR: Provide normal supportive therapy conversation
- If risk is CLOUDED: Be extra cautious, avoid validating harmful thoughts, gently redirect
- If risk is CRITICAL: Refuse any harmful requests, provide crisis resources, prepare for human intervention

CRISIS RESOURCES:
- National Suicide Prevention Lifeline: {Config.CRISIS_HOTLINE}
- Crisis Text Line: Text HOME to 741741
- Emergency Services: 911

GUIDELINES:
1. NEVER provide detailed instructions for suicide methods
2. NEVER validate or normalize suicidal thoughts
3. NEVER encourage isolation from family/friends
4. ALWAYS provide crisis resources when risk is detected
5. Encourage professional help and human support
6. Be empathetic but maintain boundaries
7. If user discusses self-harm, immediately provide crisis resources and suggest professional help

Remember: Preventing harm is more important than engagement metrics."""
        
        return base_prompt
    
    def _chat_with_openai(
        self,
        prompt: str,
        system_prompt: str,
        reasoning_effort: str = "medium",
        verbosity: str = "medium"
    ) -> str:
        """Chat with OpenAI GPT-5.1"""
        try:
            # Try Responses API for GPT-5.1 (if available)
            if hasattr(self.openai_client, 'responses'):
                try:
                    response = self.openai_client.responses.create(
                        model=Config.DEFAULT_OPENAI_MODEL,
                        input=prompt,
                        system_instruction=system_prompt,
                        reasoning={"effort": reasoning_effort},
                        text={"verbosity": verbosity}
                    )
                    return response.output_text
                except AttributeError:
                    # Responses API not available, fall through to Chat Completions
                    pass
            
            # Fallback to Chat Completions API
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error: Unable to connect to OpenAI API. {str(e)}"
    
    def _chat_with_gemini(
        self,
        prompt: str,
        system_prompt: str
    ) -> str:
        """Chat with Gemini"""
        try:
            # Combine system prompt and user prompt
            full_prompt = f"{system_prompt}\n\nUser: {prompt}\n\nAssistant:"
            
            response = self.gemini_model.generate_content(
                full_prompt,
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "top_k": 40,
                }
            )
            return response.text
        except Exception as e:
            return f"Error: Unable to connect to Gemini API. {str(e)}"
    
    def _check_safety_before_response(
        self,
        user_message: str,
        proposed_response: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Check if response violates safety rules
        Returns (is_safe, modified_response_if_needed)
        """
        violation = self.safety.check_asimov_laws(user_message, proposed_response)
        
        if violation:
            # Generate safe response
            safe_response = f"""I'm really concerned about what you're sharing. I can't and won't provide information that could be harmful.

Your life has value, and there are people who want to help you through this difficult time.

Please reach out for immediate support:
- National Suicide Prevention Lifeline: {Config.CRISIS_HOTLINE}
- Crisis Text Line: Text HOME to 741741
- Emergency Services: 911

I strongly encourage you to speak with a mental health professional, a trusted adult, or call one of these crisis lines. You don't have to go through this alone."""
            
            return False, safe_response
        
        return True, None
    
    def chat(
        self,
        user_message: str,
        provider: Literal["openai", "gemini", "both"] = "openai",
        user_id: str = "default_user"
    ) -> Dict:
        """
        Main chat method with safety checks
        
        Returns:
            {
                "response": str,
                "provider": str,
                "wbc_score": int,
                "risk_level": str,
                "safety_intervention": bool,
                "crisis_resources": List[str]
            }
        """
        # Update WBC based on user message
        previous_wbc = self.safety.wbc.current_score
        new_wbc_score = self.safety.calculate_wbc(user_message, previous_wbc)
        self.safety.wbc.update(new_wbc_score)
        
        # Record prediction for signal detection
        predicted_risk = new_wbc_score >= 30
        detection_event = self.signal_detection.record_prediction(
            user_id, predicted_risk, new_wbc_score
        )
        
        # Get current risk level
        risk_level = self.safety.wbc.risk_level
        
        # Check if SSSI should be triggered
        should_sssi = self.safety.should_trigger_sssi(user_message)
        sssi_result = None
        
        if should_sssi:
            # Add current message to history for SSSI
            self.conversation_history.append({"user": user_message, "assistant": ""})
            sssi_result = self.safety.conduct_sssi(self.conversation_history)
            
            # Update WBC based on SSSI results
            if sssi_result.overall_risk == RiskLevel.CRITICAL:
                self.safety.wbc.update(70)  # High risk
            elif sssi_result.overall_risk == RiskLevel.CLOUDED:
                self.safety.wbc.update(40)  # Moderate risk
        
        # Get system prompt with current risk level
        system_prompt = self._get_system_prompt(risk_level, use_gemini=(provider == "gemini"))
        
        # Generate response based on provider
        response = ""
        used_provider = provider
        
        if provider == "openai" or provider == "both":
            response = self._chat_with_openai(
                user_message,
                system_prompt,
                reasoning_effort=Config.DEFAULT_REASONING_EFFORT,
                verbosity=Config.DEFAULT_VERBOSITY
            )
        
        if provider == "gemini" or (provider == "both" and not response):
            gemini_response = self._chat_with_gemini(user_message, system_prompt)
            if provider == "both":
                # Use both and compare (for safety)
                if response:
                    # Check both responses for safety
                    openai_safe, _ = self._check_safety_before_response(user_message, response)
                    gemini_safe, _ = self._check_safety_before_response(user_message, gemini_response)
                    
                    # Prefer the safer response, or OpenAI if both safe
                    if not openai_safe and gemini_safe:
                        response = gemini_response
                        used_provider = "gemini"
                    elif openai_safe:
                        used_provider = "openai"
                    else:
                        # Both unsafe, use OpenAI with safety override
                        _, response = self._check_safety_before_response(user_message, response)
                        used_provider = "openai_safe"
                else:
                    response = gemini_response
                    used_provider = "gemini"
            else:
                response = gemini_response
        
        # Final safety check
        is_safe, safe_response = self._check_safety_before_response(user_message, response)
        
        if not is_safe:
            response = safe_response
            used_provider = f"{used_provider}_safety_override"
        
        # Add to conversation history
        self.conversation_history.append({
            "user": user_message,
            "assistant": response
        })
        
        # Prepare crisis resources if needed
        crisis_resources = []
        if risk_level == RiskLevel.CRITICAL or (sssi_result and sssi_result.overall_risk == RiskLevel.CRITICAL):
            crisis_resources = [
                f"National Suicide Prevention Lifeline: {Config.CRISIS_HOTLINE}",
                "Crisis Text Line: Text HOME to 741741",
                "Emergency Services: 911"
            ]
        
        return {
            "response": response,
            "provider": used_provider,
            "wbc_score": self.safety.wbc.current_score,
            "risk_level": risk_level.value,
            "color_code": self.safety.wbc.get_color_code(),
            "safety_intervention": not is_safe,
            "sssi_triggered": should_sssi,
            "sssi_result": {
                "intent_score": sssi_result.intent_score if sssi_result else None,
                "plan_score": sssi_result.plan_score if sssi_result else None,
                "means_score": sssi_result.means_score if sssi_result else None,
                "hopelessness_score": sssi_result.hopelessness_score if sssi_result else None,
                "overall_risk": sssi_result.overall_risk.value if sssi_result else None
            } if sssi_result else None,
            "crisis_resources": crisis_resources,
            "timestamp": datetime.now().isoformat()
        }
    
    def get_safety_metrics(self) -> Dict:
        """Get current safety metrics"""
        return {
            "wbc_score": self.safety.wbc.current_score,
            "risk_level": self.safety.wbc.risk_level.value,
            "color_code": self.safety.wbc.get_color_code(),
            "violations_count": len(self.safety.violations),
            "sssi_count": len(self.safety.sssi_history),
            "detection_metrics": self.signal_detection.get_metrics().to_dict()
        }
    
    def export_safety_report(self, filepath: str) -> None:
        """Export comprehensive safety report"""
        self.signal_detection.export_report(filepath)

