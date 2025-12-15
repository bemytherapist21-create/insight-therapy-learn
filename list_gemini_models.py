"""
List available Gemini models
"""

import requests
import json
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

GEMINI_API_KEY = "AIzaSyBZCjus2GLDIECuwen7f3U_CfH4yTC7dkU"

print("="*50)
print("LISTING AVAILABLE GEMINI MODELS")
print("="*50)

# Try v1beta
print("\nTrying v1beta API...")
try:
    response = requests.get(
        f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_API_KEY}",
        timeout=10
    )
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Found {len(data.get('models', []))} models in v1beta:")
        for model in data.get('models', [])[:10]:  # Show first 10
            name = model.get('name', '')
            display_name = model.get('displayName', '')
            supported_methods = model.get('supportedGenerationMethods', [])
            if 'generateContent' in supported_methods:
                print(f"  ✅ {name} - {display_name}")
    else:
        print(f"❌ v1beta failed: {response.status_code}")
        print(response.text[:200])
except Exception as e:
    print(f"❌ v1beta error: {e}")

# Try v1
print("\nTrying v1 API...")
try:
    response = requests.get(
        f"https://generativelanguage.googleapis.com/v1/models?key={GEMINI_API_KEY}",
        timeout=10
    )
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Found {len(data.get('models', []))} models in v1:")
        for model in data.get('models', [])[:10]:
            name = model.get('name', '')
            display_name = model.get('displayName', '')
            supported_methods = model.get('supportedGenerationMethods', [])
            if 'generateContent' in supported_methods:
                print(f"  ✅ {name} - {display_name}")
    else:
        print(f"❌ v1 failed: {response.status_code}")
        print(response.text[:200])
except Exception as e:
    print(f"❌ v1 error: {e}")

print("\n" + "="*50)

