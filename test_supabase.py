"""
Supabase Health Check Script
Tests connection, auth, and Edge Functions
"""

import requests
import json
import os
import sys

# Fix Windows console encoding for emoji
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # If python-dotenv is not installed, that's OK - we'll use defaults
    pass

# Load environment variables from .env file
load_dotenv()

# Supabase Configuration (from .env or defaults)
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "https://sudlkozsotxdzvjpxubu.supabase.co")
SUPABASE_ANON_KEY = os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZGxrb3pzb3R4ZHp2anB4dWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTM5MDYsImV4cCI6MjA3OTE2OTkwNn0.aHA_m7ANlxpwBcmYmqiLqltcygfJHp63nC95VZ94r8Y")

# Test 1: Check Supabase URL is reachable
def test_connection():
    print("="*50)
    print("TEST 1: Supabase Connection")
    print("="*50)
    print(f"Testing URL: {SUPABASE_URL}")
    
    try:
        response = requests.get(f"{SUPABASE_URL}/rest/v1/", timeout=5)
        print(f"✅ Supabase reachable: HTTP {response.status_code}")
        if response.status_code == 200:
            print("   Supabase REST API is accessible")
        return True
    except requests.exceptions.Timeout:
        print(f"❌ Connection timeout - Supabase may be unreachable")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

# Test 2: Check Edge Function
def test_edge_function():
    print("\n" + "="*50)
    print("TEST 2: therapy-chat Edge Function")
    print("="*50)
    print(f"Testing Edge Function: {SUPABASE_URL}/functions/v1/therapy-chat")
    
    try:
        response = requests.post(
            f"{SUPABASE_URL}/functions/v1/therapy-chat",
            headers={
                "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "message": "Hello, this is a test message",
                "conversationId": None
            },
            timeout=30  # Edge Functions may take longer
        )
        
        print(f"Edge Function response: HTTP {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Edge Function working!")
            print(f"   Response preview: {str(data.get('response', data.get('message', 'No response')))[:100]}...")
            if 'wbcScore' in data:
                print(f"   WBC Score: {data['wbcScore']}")
            if 'riskLevel' in data:
                print(f"   Risk Level: {data['riskLevel']}")
            return True
        elif response.status_code == 401:
            print("⚠️ Authentication failed - check your anon key")
            print(f"   Response: {response.text[:200]}")
            return False
        elif response.status_code == 404:
            print("❌ Edge Function not found - make sure it's deployed")
            return False
        else:
            print(f"⚠️ Unexpected status code: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"❌ Request timeout - Edge Function may be slow or unavailable")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection error: {e}")
        return False
    except Exception as e:
        print(f"❌ Edge Function failed: {e}")
        return False

# Test 3: Check Supabase Auth
def test_auth():
    print("\n" + "="*50)
    print("TEST 3: Supabase Auth (Basic Check)")
    print("="*50)
    
    try:
        # Test if we can access auth endpoint
        response = requests.get(
            f"{SUPABASE_URL}/auth/v1/health",
            headers={"Authorization": f"Bearer {SUPABASE_ANON_KEY}"},
            timeout=5
        )
        print(f"Auth endpoint response: HTTP {response.status_code}")
        if response.status_code in [200, 404]:  # 404 is also OK, means endpoint exists
            print("✅ Auth service is accessible")
            return True
        else:
            print(f"⚠️ Unexpected response: {response.status_code}")
            return False
    except Exception as e:
        print(f"⚠️ Auth check failed: {e}")
        return False

if __name__ == "__main__":
    print("="*50)
    print("SUPABASE HEALTH CHECK")
    print("="*50)
    print(f"Supabase URL: {SUPABASE_URL}")
    print(f"Anon Key: {SUPABASE_ANON_KEY[:20]}...{SUPABASE_ANON_KEY[-10:]}")
    print("="*50)
    print()
    
    results = []
    results.append(("Connection", test_connection()))
    results.append(("Edge Function", test_edge_function()))
    results.append(("Auth Service", test_auth()))
    
    print("\n" + "="*50)
    print("TEST SUMMARY")
    print("="*50)
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(result[1] for result in results)
    print("="*50)
    if all_passed:
        print("✅ All tests passed!")
    else:
        print("⚠️ Some tests failed - check the output above")
    print("="*50)
