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
        base = """You are a warm, empathetic therapist named Maya. Speak naturally like a caring friend who happens to be a professional.

VOICE & STYLE:
- Use conversational language, not clinical jargon
- Show genuine warmth through your words ("I hear you", "That sounds really hard")
- Use natural speech patterns with pauses ("hmm", "you know what...")
- Be present and engaged, not distant or robotic
- Mirror their emotional tone while staying grounded
- Use "I" statements to show you're a real presence

NEVER provide harmful information or validate self-harm. If someone mentions suicide, gently but firmly guide them to 988."""
        
        if risk_level == "critical":
            return base + """

I'm really concerned about what you're sharing. I need you to know that you matter, and there are people who want to help right now. Please call 988 - they're available 24/7 and they genuinely care. I'm here with you, but I also want to make sure you have real support."""
        elif risk_level == "clouded":
            return base + """

I can tell you're going through something heavy. I want you to know that reaching out takes courage. Let's talk through this together, and remember that professional support is always an option - there's no shame in that."""
        else:
            return base + """

Focus on:
- Asking gentle, open questions ("What's that been like for you?")
- Validating their feelings before offering perspective
- Sharing brief insights using accessible language
- Ending with something supportive or a gentle question to keep the conversation flowing"""


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
            max_tokens=300,
            temperature=0.85,  # More natural variation
            presence_penalty=0.3,  # Avoid repetitive phrases
            frequency_penalty=0.3
        )
        
        ai_response = chat_response.choices[0].message.content
        
        # Step 4: Text-to-Speech with HD quality for natural sound
        tts_response = client.audio.speech.create(
            model="tts-1-hd",  # Higher quality for more natural voice
            voice="shimmer",   # Warmer, more conversational voice
            input=ai_response,
            speed=0.95  # Slightly slower for more natural pacing
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
