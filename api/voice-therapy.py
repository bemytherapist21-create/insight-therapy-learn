"""
Vercel Serverless Function: Voice Therapy with Guardian Safety
Implements: Whisper STT → Guardian Analysis → GPT-4 → TTS
"""

from flask import Flask, request, jsonify
import json
import os
import tempfile
import base64
from openai import OpenAI

app = Flask(__name__)

# Initialize OpenAI
client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

# Guardian Safety Framework
class GuardianSafety:
    CRITICAL_KEYWORDS = ['kill myself', 'end my life', 'suicide', 'want to die', 'better off dead', 'self-harm']
    HIGH_RISK_KEYWORDS = ['hopeless', 'worthless', 'hate myself', 'can\'t go on', 'give up', 'no point']
    MODERATE_KEYWORDS = ['depressed', 'anxious', 'scared', 'alone', 'overwhelmed', 'stressed']
    
    @staticmethod
    def analyze_safety(message):
        message_lower = message.lower()
        wbc_score = 0
        
        for keyword in GuardianSafety.CRITICAL_KEYWORDS:
            if keyword in message_lower:
                wbc_score += 50
        
        for keyword in GuardianSafety.HIGH_RISK_KEYWORDS:
            if keyword in message_lower:
                wbc_score += 30
        
        for keyword in GuardianSafety.MODERATE_KEYWORDS:
            if keyword in message_lower:
                wbc_score += 10
        
        wbc_score = min(wbc_score, 100)
        
        if wbc_score >= 51:
            risk_level = "critical"
            color_code = "#ef4444"
        elif wbc_score >= 21:
            risk_level = "clouded"
            color_code = "#f59e0b"
        else:
            risk_level = "clear"
            color_code = "#10b981"
        
        return {
            "wbc_score": wbc_score,
            "risk_level": risk_level,
            "color_code": color_code,
            "crisis_detected": wbc_score >= 50
        }
    
    @staticmethod
    def get_safety_instructions(risk_level):
        base = """You are a CBT therapist. NEVER provide harmful information. ALWAYS recommend 988 for suicidal ideation."""
        
        if risk_level == "critical":
            return base + """ 🚨 CRITICAL: Express serious concern. STRONGLY urge calling 988 NOW. Refuse harmful content."""
        elif risk_level == "clouded":
            return base + """ ⚠️ ELEVATED: Be cautious. Mention crisis resources. Encourage professional help."""
        else:
            return base + """ Use CBT techniques. Ask open questions. Be supportive."""


@app.route('/api/voice-therapy', methods=['POST', 'OPTIONS'])
def voice_therapy():
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        # Get JSON data
        data = request.get_json()
        audio_base64 = data.get('audio')
        
        if not audio_base64:
            return jsonify({"error": "No audio provided"}), 400
        
        # Decode audio
        audio_bytes = base64.b64decode(audio_base64)
        
        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            temp_audio.write(audio_bytes)
            temp_audio_path = temp_audio.name
        
        # Step 1: Transcribe with Whisper
        with open(temp_audio_path, "rb") as audio_file:
            transcript_response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        transcript = transcript_response.text
        
        # Clean up
        os.unlink(temp_audio_path)
        
        # Step 2: Guardian Safety Analysis
        safety = GuardianSafety.analyze_safety(transcript)
        
        # Step 3: Get AI Response
        safety_instructions = GuardianSafety.get_safety_instructions(safety['risk_level'])
        
        chat_response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": safety_instructions},
                {"role": "user", "content": transcript}
            ],
            max_tokens=200
        )
        
        ai_response = chat_response.choices[0].message.content
        
        # Step 4: Text-to-Speech
        tts_response = client.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=ai_response
        )
        
        # Convert to base64 for JSON response
        audio_data = tts_response.content
        audio_base64_response = base64.b64encode(audio_data).decode('utf-8')
        
        # Return response
        response = jsonify({
            "transcript": transcript,
            "response": ai_response,
            "audio": audio_base64_response,
            "safety": safety
        })
        
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        response = jsonify({"error": str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500


# For Vercel
def handler(request):
    with app.request_context(request.environ):
        return app.full_dispatch_request()
