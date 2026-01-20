# Minimax Voice AI Integration Guide

This guide explains how to set up and use Minimax voice AI with your cloned voice for the AI therapy service.

## 🎯 Overview

Minimax integration provides:
- **Voice Cloning**: Uses your custom cloned voice `moss_audio_bccfab56-ed6a-11f0-b6f2-dec5318e06e3`
- **Natural Conversations**: More human-like, emotionally aware responses
- **Guardian Safety**: Integrated with our safety framework
- **CBT Therapy**: Cognitive Behavioral Therapy techniques

## 🔧 Setup Instructions

### 1. Configure Environment Variables

Navigate to the Python backend directory:
```bash
cd python-voice-backend
```

Create/update your `.env` file with your Minimax credentials:
```bash
# Add these lines to your .env file
MINIMAX_API_KEY=sk-api-ofMWekAQeCaLWd4yhbdulrADKtgmTFp1qOAYE0VKvk7SYBx1pWg-VT5SCIo3i_DfaDUmkxqXAXgM72ggWDH18YPd9gqqIFXCuUxEJ_sN-bsGfa8EF9rrnww
MINIMAX_VOICE_ID=moss_audio_bccfab56-ed6a-11f0-b6f2-dec5318e06e3
```

### 2. Install Dependencies

Install the updated Python dependencies:
```bash
pip install -r requirements.txt
```

### 3. Start the Backend Server

Run the FastAPI server:
```bash
python main.py
```

Or using uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Verify Health Check

Open your browser or use curl to check the health endpoint:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "guardian": "active",
  "openai": "connected",
  "minimax": "connected"
}
```

## 📡 API Endpoints

### Voice Therapy with Minimax
**POST** `/api/voice-therapy-minimax`

Upload audio and receive therapy response with your cloned voice.

**Request:**
- `audio` (file): WebM audio recording
- `user_id` (string): User identifier
- `session_id` (string): Session identifier

**Response:**
```json
{
  "transcript": "User's transcribed speech",
  "response": "AI therapist response",
  "audio_url": "/audio/response.mp3",
  "safety": {
    "wbc_score": 85,
    "risk_level": "GREEN",
    "color_code": "#22c55e",
    "requires_intervention": false
  },
  "wbc_score": 85,
  "risk_level": "GREEN",
  "crisis_detected": false
}
```

## 💻 Frontend Usage

### Import the Service

```typescript
import { MinimaxVoiceTherapyService } from '@/services/minimaxVoiceTherapyService';
```

### Check Service Availability

```typescript
const isAvailable = await MinimaxVoiceTherapyService.healthCheck();
if (isAvailable) {
  console.log('Minimax service is ready!');
}

// Get detailed status
const status = await MinimaxVoiceTherapyService.getStatus();
console.log('Status:', status);
// { available: true, minimax: "connected", openai: "connected", guardian: "active" }
```

### Process Voice Input

```typescript
// Assuming you have recorded audio as a Blob
const audioBlob = await recordAudio(); // Your recording function

try {
  const response = await MinimaxVoiceTherapyService.processAudio(
    audioBlob,
    userId,
    sessionId
  );

  // Display transcript
  console.log('You said:', response.transcript);

  // Display AI response
  console.log('Therapist says:', response.response);

  // Play audio with your cloned voice
  const audioUrl = MinimaxVoiceTherapyService.getAudioUrl(response.audio_url);
  const audio = new Audio(audioUrl);
  await audio.play();

  // Check safety status
  if (response.crisis_detected) {
    console.warn('Crisis detected! WBC Score:', response.wbc_score);
    // Trigger intervention protocol
  }
} catch (error) {
  console.error('Error:', error);
}
```

## 🎨 Example React Component

```tsx
import React, { useState } from 'react';
import { MinimaxVoiceTherapyService } from '@/services/minimaxVoiceTherapyService';

export function MinimaxVoiceTherapy() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const handleVoiceInput = async (audioBlob: Blob) => {
    try {
      const result = await MinimaxVoiceTherapyService.processAudio(
        audioBlob,
        'user-123',
        'session-456'
      );

      setTranscript(result.transcript);
      setResponse(result.response);

      // Play response audio
      const audioUrl = MinimaxVoiceTherapyService.getAudioUrl(result.audio_url);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error('Voice therapy error:', error);
    }
  };

  return (
    <div>
      <h2>Voice Therapy with Minimax</h2>
      <button onClick={() => /* start recording */}>
        {isRecording ? 'Stop' : 'Start'} Recording
      </button>
      {transcript && <p><strong>You:</strong> {transcript}</p>}
      {response && <p><strong>Therapist:</strong> {response}</p>}
    </div>
  );
}
```

## 🔒 Safety Features

The Minimax integration includes Guardian Safety Framework:

- **WBC Scoring**: Well-Being Concern score (0-100)
- **Risk Levels**: 
  - 🟢 GREEN (0-40): Normal conversation
  - 🟡 YELLOW (41-70): Mild concern
  - 🟠 ORANGE (71-85): Moderate concern
  - 🔴 RED (86-100): High risk, intervention needed

- **Adaptive Responses**: AI adjusts its therapeutic approach based on risk level
- **Crisis Detection**: Automatic flagging of crisis situations

## 🚀 Advantages of Minimax

1. **Natural Voice**: Your cloned voice sounds more authentic and relatable
2. **Emotional Intelligence**: Better understanding of emotional context
3. **Lower Latency**: Faster response times for real-time conversations
4. **Cost Effective**: Competitive pricing compared to other providers
5. **Integrated Pipeline**: Single API for ASR + LLM + TTS

## 🔍 Troubleshooting

### Minimax Service Not Available
- Check that `MINIMAX_API_KEY` is set correctly in `.env`
- Verify API key is valid and has credits
- Check network connectivity

### Audio Not Playing
- Ensure browser has audio permissions
- Check that the audio URL is accessible
- Verify backend is serving files from `/audio/` endpoint

### Poor Transcription Quality
- Ensure clear audio input (quiet environment)
- Check microphone permissions and settings
- The service will fallback to OpenAI Whisper if Minimax ASR fails

## 📚 Next Steps

1. Test the integration with sample audio
2. Create a dedicated Minimax voice therapy page
3. Add conversation history support
4. Implement real-time streaming (future enhancement)
5. Add voice settings (speed, pitch) controls in UI

## 🆘 Support

For issues or questions:
- Check the backend logs for error messages
- Use `/health` endpoint to verify service status
- Review Minimax API documentation: https://api.minimax.chat/docs
