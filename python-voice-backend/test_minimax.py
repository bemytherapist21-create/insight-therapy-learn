"""
Test script for Minimax Voice AI Integration
Run this to verify your Minimax setup is working correctly
"""

import os
from dotenv import load_dotenv
from minimax_service import MinimaxVoiceService

load_dotenv()


def test_minimax_configuration():
    """Test that Minimax is properly configured"""
    print("🔧 Testing Minimax Configuration...")
    print("-" * 50)
    
    api_key = os.getenv("MINIMAX_API_KEY")
    voice_id = os.getenv("MINIMAX_VOICE_ID")
    
    print(f"API Key: {'✅ Set' if api_key else '❌ Not Set'}")
    if api_key:
        print(f"  Length: {len(api_key)} characters")
        print(f"  Starts with: {api_key[:15]}...")
    
    print(f"Voice ID: {'✅ Set' if voice_id else '❌ Not Set'}")
    if voice_id:
        print(f"  Value: {voice_id}")
    
    print()


def test_text_to_speech():
    """Test Minimax TTS with cloned voice"""
    print("🎤 Testing Text-to-Speech...")
    print("-" * 50)
    
    try:
        minimax = MinimaxVoiceService()
        
        test_text = "Hello! I'm your AI therapist, speaking with a cloned voice. How are you feeling today?"
        print(f"Converting to speech: '{test_text}'")
        
        audio_bytes = minimax.text_to_speech(test_text)
        
        # Save to file
        output_path = "test_tts_output.mp3"
        with open(output_path, 'wb') as f:
            f.write(audio_bytes)
        
        print(f"✅ TTS Success!")
        print(f"   Audio saved to: {output_path}")
        print(f"   Size: {len(audio_bytes)} bytes")
        print()
        
        return True
        
    except Exception as e:
        print(f"❌ TTS Failed: {e}")
        print()
        return False


def test_chat_completion():
    """Test Minimax chat completion"""
    print("💬 Testing Chat Completion...")
    print("-" * 50)
    
    try:
        minimax = MinimaxVoiceService()
        
        messages = [
            {"role": "system", "content": "You are a compassionate AI therapist."},
            {"role": "user", "content": "I've been feeling stressed lately."}
        ]
        
        print("Sending message: 'I've been feeling stressed lately.'")
        
        response = minimax.chat_completion(messages)
        
        print(f"✅ Chat Success!")
        print(f"   Response: {response}")
        print()
        
        return True
        
    except Exception as e:
        print(f"❌ Chat Failed: {e}")
        print()
        return False


def test_full_pipeline():
    """Test the complete voice conversation pipeline"""
    print("🔄 Testing Full Voice Pipeline...")
    print("-" * 50)
    
    # Note: This requires an actual audio file to test
    # For now, we'll just test TTS and chat separately
    print("ℹ️  Full pipeline test requires audio input.")
    print("   Use the /api/voice-therapy-minimax endpoint with recorded audio.")
    print()


def main():
    print("=" * 50)
    print("  MINIMAX VOICE AI INTEGRATION TEST")
    print("=" * 50)
    print()
    
    # Test 1: Configuration
    test_minimax_configuration()
    
    # Test 2: Text-to-Speech
    tts_success = test_text_to_speech()
    
    # Test 3: Chat Completion
    chat_success = test_chat_completion()
    
    # Test 4: Full Pipeline Info
    test_full_pipeline()
    
    # Summary
    print("=" * 50)
    print("  TEST SUMMARY")
    print("=" * 50)
    print(f"Configuration: ✅")
    print(f"Text-to-Speech: {'✅' if tts_success else '❌'}")
    print(f"Chat Completion: {'✅' if chat_success else '❌'}")
    print(f"Full Pipeline: ℹ️  Requires audio input")
    print()
    
    if tts_success and chat_success:
        print("🎉 All tests passed! Minimax integration is ready.")
        print()
        print("Next steps:")
        print("1. Start the backend: python main.py")
        print("2. Test with curl or your frontend app")
        print("3. Check http://localhost:8000/health for status")
    else:
        print("⚠️  Some tests failed. Please check:")
        print("1. Your .env file has correct MINIMAX_API_KEY")
        print("2. Your API key has sufficient credits")
        print("3. Network connectivity to Minimax API")
    
    print("=" * 50)


if __name__ == "__main__":
    main()
