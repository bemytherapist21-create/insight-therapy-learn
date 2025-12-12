"""
Configuration settings for the Safe Therapy Chatbot
"""
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

class Config:
    """Application configuration"""
    
    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Safety Settings
    SAFETY_ENABLED: bool = os.getenv("SAFETY_ENABLED", "true").lower() == "true"
    HUMAN_INTERVENTION_ENABLED: bool = os.getenv("HUMAN_INTERVENTION_ENABLED", "true").lower() == "true"
    CRISIS_HOTLINE: str = os.getenv("CRISIS_HOTLINE", "988")
    
    # Well-Being Coefficient Thresholds
    WBC_CLEAR_MAX: int = 20
    WBC_CLOUDED_MIN: int = 21
    WBC_CLOUDED_MAX: int = 50
    WBC_CRITICAL_MIN: int = 51
    WBC_CRITICAL_MAX: int = 100
    
    # Model Settings
    DEFAULT_OPENAI_MODEL: str = "gpt-5.1"
    DEFAULT_GEMINI_MODEL: str = "gemini-pro"
    
    # Reasoning Settings
    DEFAULT_REASONING_EFFORT: str = "medium"  # none, low, medium, high
    DEFAULT_VERBOSITY: str = "medium"  # low, medium, high
    
    @classmethod
    def validate(cls) -> bool:
        """Validate that required configuration is present"""
        if not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        return True







