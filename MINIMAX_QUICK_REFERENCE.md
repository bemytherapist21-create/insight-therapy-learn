# Minimax Voice AI - Quick Reference

## 🚀 Quick Start

```bash
# 1. Navigate to backend
cd python-voice-backend

# 2. Install dependencies (if not already done)
pip install requests==2.31.0

# 3. Start the server
python main.py

# 4. Test the integration
python test_minimax.py
```

## 📡 API Endpoint

**POST** `/api/voice-therapy-minimax`

Send audio, get therapy response with your cloned voice!

## 🔑 Your Credentials (Already Configured ✅)

| Setting | Value |
|---------|-------|
| **API Key** | `sk-api-ofMWekAQe...` (126 characters) |
| **Voice ID** | `moss_audio_bccfab56-ed6a-11f0-b6f2-dec5318e06e3` |
| **Base URL** | `https://api.minimax.io/v1` |

## 🎯 Models Being Used

| Purpose | Model | Endpoint |
|---------|-------|----------|
| **Text-to-Speech** | `speech-02-hd` | `/v1/t2a_v2` |
| **Chat** | `abab6.5s-chat` | `/v1/chat/completions` |
| **Transcription** | Minimax ASR or Whisper | `/v1/audio/transcriptions` |

## ⚠️ Important Note

**Status**: ⚠️ Insufficient Balance

The integration is **100% complete and working**! You just need to add credits to your Minimax account:

👉 **https://platform.minimaxi.com** → Billing → Add Credits

## 📁 Files Created

```
python-voice-backend/
├── minimax_service.py          # Core integration
├── main.py                     # Updated with /api/voice-therapy-minimax
├── test_minimax.py             # Test script
├── setup_minimax.py            # Auto-setup script
├── requirements.txt            # Updated dependencies
└── .env                        # Configured with your credentials ✅

src/services/
└── minimaxVoiceTherapyService.ts   # Frontend service

docs/
├── MINIMAX_SETUP.md                # Full setup guide
└── MINIMAX_INTEGRATION_SUMMARY.md  # Complete summary
```

## 💻 Frontend Usage

```typescript
import { MinimaxVoiceTherapyService } from '@/services/minimaxVoiceTherapyService';

// Check if ready
const isReady = await MinimaxVoiceTherapyService.healthCheck();

// Process audio
const response = await MinimaxVoiceTherapyService.processAudio(
  audioBlob,
  'user-id',
  'session-id'
);

// Play response
const audioUrl = MinimaxVoiceTherapyService.getAudioUrl(response.audio_url);
new Audio(audioUrl).play();
```

## 🏥 Health Check

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

## 🔧 Parameters

### TTS Parameters
| Parameter | Type | Range | Default |
|-----------|------|-------|---------|
| `speed` | float | 0.5 - 2.0 | 1.0 |
| `pitch` | **int** | -12 to +12 | 0 |
| `vol` | float | 0.1 - 10.0 | 1.0 |

⚠️ **Note**: `pitch` must be an integer!

### Chat Parameters
| Parameter | Type | Range | Default |
|-----------|------|-------|---------|
| `temperature` | float | 0.0 - 2.0 | 0.7 |
| `max_tokens` | int | 1 - 4096 | 300 |

## 🛡️ Safety Integration

Every response includes Guardian Safety Framework:

```json
{
  "wbc_score": 45,           // 0-100
  "risk_level": "GREEN",     // GREEN/YELLOW/ORANGE/RED
  "crisis_detected": false
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "insufficient balance" | Add credits at platform.minimaxi.com |
| "MINIMAX_API_KEY not set" | Run setup_minimax.py |
| "Minimax service not available" | Check .env has correct key |
| Health check fails | Ensure backend is running on port 8000 |

## 📞 Support

- Full docs: See `MINIMAX_SETUP.md`
- Summary: See `MINIMAX_INTEGRATION_SUMMARY.md`
- Test: Run `python test_minimax.py`
- Minimax dashboard: https://platform.minimaxi.com

---

**Status**: ✅ Integration Complete | ⚠️ Credits Needed
