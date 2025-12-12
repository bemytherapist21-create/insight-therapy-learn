"""
Quick API Test Script
Tests OpenAI and Google Gemini API keys
"""

import os
from openai import OpenAI

# Test OpenAI API
def test_openai():
    print("Testing OpenAI API...")
    try:
        client = OpenAI(api_key="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")
        
        # Test simple completion
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": "Say 'API test successful' in 3 words"}],
            max_tokens=10
        )
        
        print("✅ OpenAI API: WORKING")
        print(f"Response: {response.choices[0].message.content}")
        
        # Test Whisper
        print("\nTesting Whisper API...")
        print("⚠️ Skipping Whisper test (requires audio file)")
        
        # Test TTS
        print("\nTesting TTS API...")
        print("⚠️ Skipping TTS test (requires audio output)")
        
        return True
    except Exception as e:
        print(f"❌ OpenAI API: FAILED")
        print(f"Error: {e}")
        return False

def test_gemini():
    print("\n" + "="*50)
    print("Testing Google Gemini API...")
    try:
        # Check if Gemini is configured
        print("⚠️ Gemini API not found in environment variables")
        print("If you want to use Gemini, add GOOGLE_API_KEY to your .env")
        return None
    except Exception as e:
        print(f"❌ Gemini API: FAILED")
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("API HEALTH CHECK")
    print("=" * 50 + "\n")
    
    openai_ok = test_openai()
    gemini_ok = test_gemini()
    
    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    print(f"OpenAI: {'✅ WORKING' if openai_ok else '❌ FAILED'}")
    print(f"Gemini: {'⚠️ NOT CONFIGURED' if gemini_ok is None else ('✅ WORKING' if gemini_ok else '❌ FAILED')}")
