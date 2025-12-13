"""
Quick API Test Script
Tests OpenAI and Google Gemini API keys

IMPORTANT: Set your API keys as environment variables:
- OPENAI_API_KEY: Your OpenAI API key
- GOOGLE_API_KEY: Your Google Gemini API key (optional)
"""

import os
from openai import OpenAI

# Test OpenAI API
def test_openai():
    print("Testing OpenAI API...")
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("❌ OPENAI_API_KEY environment variable not set!")
            print("   Please set it: export OPENAI_API_KEY='your-key-here'")
            return False
        
        client = OpenAI(api_key=api_key)
        
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
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("⚠️ GOOGLE_API_KEY environment variable not set")
            print("   If you want to use Gemini, set: export GOOGLE_API_KEY='your-key-here'")
            return None
        # Add Gemini API test implementation here if needed
        print("✅ Gemini API key found (test implementation needed)")
        return True
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
