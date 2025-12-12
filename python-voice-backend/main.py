"""
FastAPI Voice Therapy Backend
Implements cd-irvan pipeline with Guardian Safety Framework
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
import tempfile
from guardian_safety import GuardianSafety, RiskLevel
from typing import List, Dict

load_dotenv()

app = FastAPI(title="Voice Therapy API", version="1.0.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Guardian safety instance
guardian = GuardianSafety()


class Message(BaseModel):
    role: str
    content: str


class ConversationRequest(BaseModel):
    messages: List[Message]
    user_id: str
    session_id: str


class VoiceResponse(BaseModel):
    transcript: str
    response: str
    audio_url: str
    safety: Dict
    wbc_score: int
    risk_level: str
    crisis_detected: bool


@app.get("/")
async def root():
    return {"message": "Voice Therapy API with Guardian Safety", "status": "active"}


@app.post("/api/voice-therapy", response_model=VoiceResponse)
async def voice_therapy(
    audio: UploadFile = File(...),
    user_id: str = "",
    session_id: str = "",
    message_history: str = "[]"  # JSON string of previous messages
):
    """
    Complete voice therapy pipeline:
    1. Transcribe audio (Whisper)
    2. Analyze safety (Guardian)
    3. Generate response (GPT with adaptive safety)
    4. Convert to speech (TTS)
    """
    
    try:
        # Step 1: Save uploaded audio temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            content = await audio.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name
        
        # Step 2: Transcribe with Whisper
        with open(temp_audio_path, "rb") as audio_file:
            transcript_response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
        transcript = transcript_response if isinstance(transcript_response, str) else transcript_response.text
        
        # Clean up temp audio file
        os.unlink(temp_audio_path)
        
        # Step 3: Guardian Safety Analysis
        safety_analysis = guardian.analyze_safety(transcript)
        
        # Step 4: Get adaptive safety instructions
        safety_instructions = guardian.get_safety_instructions(safety_analysis.risk_level)
        
        # Step 5: Generate response with GPT
        messages = [
            {"role": "system", "content": safety_instructions},
            {"role": "user", "content": transcript}
        ]
        
        # Add CBT therapeutic context
        cbt_context = """
        Use Cognitive Behavioral Therapy (CBT) techniques:
        - Ask open-ended questions
        - Help identify thought patterns
        - Challenge negative thoughts gently
        - Encourage behavioral activation
        - Teach coping strategies
        - Validate feelings while promoting realistic thinking
        """
        messages.insert(1, {"role": "system", "content": cbt_context})
        
        chat_response = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            temperature=0.7,
            max_tokens=300
        )
        
        response_text = chat_response.choices[0].message.content
        
        # Step 6: Convert response to speech
        tts_response = client.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=response_text
        )
        
        # Save TTS audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_tts:
            tts_response.stream_to_file(temp_tts.name)
            tts_audio_path = temp_tts.name
        
        # Return response with safety data
        return VoiceResponse(
            transcript=transcript,
            response=response_text,
            audio_url=f"/audio/{os.path.basename(tts_audio_path)}",
            safety={
                "wbc_score": safety_analysis.wbc_score,
                "risk_level": safety_analysis.risk_level,
                "color_code": safety_analysis.color_code,
                "requires_intervention": safety_analysis.requires_intervention
            },
            wbc_score=safety_analysis.wbc_score,
            risk_level=safety_analysis.risk_level,
            crisis_detected=safety_analysis.crisis_detected
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/audio/{filename}")
async def get_audio(filename: str):
    """Serve generated TTS audio files"""
    audio_path = os.path.join(tempfile.gettempdir(), filename)
    if os.path.exists(audio_path):
        return FileResponse(audio_path, media_type="audio/mpeg")
    raise HTTPException(status_code=404, detail="Audio file not found")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "guardian": "active",
        "openai": "connected" if os.getenv("OPENAI_API_KEY") else "not configured"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
