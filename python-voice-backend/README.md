# Python Voice Therapy Backend

FastAPI backend implementing voice therapy pipeline with Guardian Safety Framework.

## Architecture

```
Audio Input
    ↓
Whisper API (Speech-to-Text)
    ↓
Guardian Safety Analysis (WBC calculation)
    ↓
GPT-4 API (with adaptive safety instructions)
    ↓
TTS API (Text-to-Speech)
    ↓
Audio Response
```

## Setup

1. **Install dependencies**:
```bash
cd python-voice-backend
pip install -r requirements.txt
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Run locally**:
```bash
python main.py
# or
uvicorn main:app --reload
```

Server runs on `http://localhost:8000`

## API Endpoints

### `POST /api/voice-therapy`
Main voice therapy endpoint

**Parameters**:
- `audio`: Audio file (multipart/form-data)
- `user_id`: User ID
- `session_id`: Session ID

**Response**:
```json
{
  "transcript": "User's transcribed speech",
  "response": "AI therapist's response",
  "audio_url": "/audio/response.mp3",
  "safety": {
    "wbc_score": 15,
    "risk_level": "clear",
    "color_code": "#10b981",
    "requires_intervention": false
  },
  "wbc_score": 15,
  "risk_level": "clear",
  "crisis_detected": false
}
```

### `GET /audio/{filename}`
Retrieve generated TTS audio

### `GET /health`
Health check endpoint

## Guardian Safety Features

- ✅ WBC (Well-Being Coefficient) scoring
- ✅ Risk classification (clear/clouded/critical)
- ✅ Adaptive AI instructions based on risk level
- ✅ Crisis detection
- ✅ Asimov's Safety Laws enforcement

## Deployment

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render

1. Connect GitHub repository
2. Select Python environment
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Heroku

```bash
# Create Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
heroku create voice-therapy-backend
git push heroku main
```

## Environment Variables

- `OPENAI_API_KEY`: OpenAI API key
- `SUPABASE_URL`: Supabase project URL (optional)
- `SUPABASE_SERVICE_KEY`: Supabase service key (optional)
