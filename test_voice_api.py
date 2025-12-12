"""
Test script for Vercel voice therapy function
Tests locally before deployment
"""

import requests
import base64
import json

# For local testing, we'd need the audio file
# For now, let's just verify the structure

API_ENDPOINT = "http://localhost:3000/api/voice-therapy"  # Local Vercel dev
# API_ENDPOINT = "https://your-app.vercel.app/api/voice-therapy"  # Production

def test_voice_therapy():
    # Create a simple test with mock audio
    # In production, this would be actual audio bytes
    mock_audio = b"test audio data"
    audio_base64 = base64.b64encode(mock_audio).decode('utf-8')
    
    payload = {
        "audio": audio_base64
    }
    
    try:
        response = requests.post(API_ENDPOINT, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Testing Voice Therapy API...")
    print("Note: This requires the Vercel function to be running")
    print("Run 'vercel dev' to test locally")
    test_voice_therapy()
