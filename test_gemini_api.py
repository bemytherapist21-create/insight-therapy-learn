"""
Test Gemini API Direct Integration
Tests the Gemini API call format that the Edge Function will use
"""

import requests
import json
import sys

# Fix Windows console encoding for emoji
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Your Gemini API Key (replace with your actual key)
GEMINI_API_KEY = "AIzaSyBZCjus2GLDIECuwen7f3U_CfH4yTC7dkU"

def test_gemini_api():
    print("="*50)
    print("TEST: Gemini API Direct Integration")
    print("="*50)
    print("Testing the same API format the Edge Function will use\n")
    
    # Simulate the message format the Edge Function creates
    contents = [
        {
            "role": "user",
            "parts": [{"text": "You are a compassionate AI therapy assistant. Respond with empathy and follow safety guidelines."}]
        },
        {
            "role": "model",
            "parts": [{"text": "I understand. I will provide supportive, empathetic responses while prioritizing user safety."}]
        },
        {
            "role": "user",
            "parts": [{"text": "Hello, I'm feeling a bit anxious today."}]
        }
    ]
    
    try:
        print("Sending request to Gemini API...")
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}",
            headers={
                'Content-Type': 'application/json',
            },
            json={
                "contents": contents,
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 1000,
                },
                "safetySettings": [
                    {
                        "category": "HARM_CATEGORY_HARASSMENT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            },
            timeout=30
        )
        
        print(f"Response Status: HTTP {response.status_code}\n")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check response structure
            if not data.get('candidates') or not data['candidates'][0]:
                print("❌ Invalid response structure - no candidates found")
                print(f"Response: {json.dumps(data, indent=2)}")
                return False
            
            candidate = data['candidates'][0]
            
            # Check if blocked by safety
            if candidate.get('finishReason') == 'SAFETY':
                print("⚠️ Response blocked by safety filters")
                print(f"Safety ratings: {candidate.get('safetyRatings', 'N/A')}")
                return False
            
            # Extract response text
            if not candidate.get('content') or not candidate['content'].get('parts'):
                print("❌ Invalid response structure - no content/parts found")
                print(f"Response: {json.dumps(data, indent=2)}")
                return False
            
            response_text = candidate['content']['parts'][0].get('text', '')
            
            print("✅ Gemini API working correctly!")
            print(f"\nResponse preview (first 200 chars):")
            print(f"{response_text[:200]}...")
            print(f"\nFull response length: {len(response_text)} characters")
            print(f"Finish reason: {candidate.get('finishReason', 'N/A')}")
            
            return True
            
        elif response.status_code == 400:
            error_data = response.json()
            print(f"❌ Bad Request: {error_data.get('error', {}).get('message', 'Unknown error')}")
            print(f"Full error: {json.dumps(error_data, indent=2)}")
            return False
            
        elif response.status_code == 401:
            print("❌ Authentication failed - check your API key")
            print("Response:", response.text[:200])
            return False
            
        elif response.status_code == 403:
            print("❌ Forbidden - API key may be invalid or quota exceeded")
            print("Response:", response.text[:200])
            return False
            
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timeout - Gemini API may be slow")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection error: {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON response: {e}")
        print(f"Response text: {response.text[:500]}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("="*50)
    print("GEMINI API TEST")
    print("="*50)
    print(f"API Key: {GEMINI_API_KEY[:20]}...{GEMINI_API_KEY[-10:]}")
    print("Model: gemini-2.5-flash")
    print("="*50)
    print()
    
    success = test_gemini_api()
    
    print("\n" + "="*50)
    if success:
        print("✅ TEST PASSED - Gemini API integration is working!")
        print("   The Edge Function code should work correctly.")
        print("\n   Next steps:")
        print("   1. Set GOOGLE_GEMINI_API_KEY in Supabase Edge Functions")
        print("   2. Deploy the updated Edge Function")
        print("   3. Test the chat and voice therapy features")
    else:
        print("❌ TEST FAILED - Check the errors above")
        print("   Common issues:")
        print("   - Invalid API key")
        print("   - API key quota exceeded")
        print("   - Network/firewall issues")
    print("="*50)

