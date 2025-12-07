/**
 * Voice AI Service
 * Handles ElevenLabs voice synthesis and audio streaming
 */

import { supabase } from '@/integrations/supabase/client';

export interface VoiceConfig {
  voiceId: string;
  model: string;
  stability: number;
  similarityBoost: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export const THERAPIST_VOICES: Record<string, VoiceConfig> = {
  calm_female: {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah - calm and reassuring
    model: 'eleven_multilingual_v2',
    stability: 0.75,
    similarityBoost: 0.75,
    style: 0.5,
  },
  warm_male: {
    voiceId: 'TxGEqnHWrfWFTfGW9XjX', // Josh - warm and empathetic
    model: 'eleven_multilingual_v2',
    stability: 0.7,
    similarityBoost: 0.8,
    style: 0.4,
  },
  professional_female: {
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Rachel - professional
    model: 'eleven_multilingual_v2',
    stability: 0.8,
    similarityBoost: 0.7,
  },
};

export class VoiceService {
  private apiKey: string;
  private currentVoice: VoiceConfig;
  private audioContext: AudioContext | null = null;

  constructor(apiKey: string, voicePreset: keyof typeof THERAPIST_VOICES = 'calm_female') {
    this.apiKey = apiKey;
    this.currentVoice = THERAPIST_VOICES[voicePreset];
  }

  /**
   * Convert text to speech
   */
  async textToSpeech(text: string): Promise<Blob> {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.currentVoice.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: this.currentVoice.model,
            voice_settings: {
              stability: this.currentVoice.stability,
              similarity_boost: this.currentVoice.similarityBoost,
              style: this.currentVoice.style,
              use_speaker_boost: this.currentVoice.useSpeakerBoost ?? true,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw error;
    }
  }

  /**
   * Play audio blob
   */
  async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.onended = () => resolve();
      audio.onerror = (error) => reject(error);
      audio.play().catch(reject);
    });
  }

  /**
   * Stream text-to-speech (for real-time conversations)
   */
  async streamTextToSpeech(text: string, onChunk: (chunk: Uint8Array) => void): Promise<void> {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.currentVoice.voiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: this.currentVoice.model,
            voice_settings: {
              stability: this.currentVoice.stability,
              similarity_boost: this.currentVoice.similarityBoost,
            },
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed');
      }

      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        onChunk(value);
      }
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    }
  }

  /**
   * Change voice preset
   */
  setVoice(preset: keyof typeof THERAPIST_VOICES): void {
    this.currentVoice = THERAPIST_VOICES[preset];
  }
}

/**
 * Speech-to-Text Service
 * Handles audio transcription using OpenAI Whisper
 */
export class SpeechToTextService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Transcribe audio to text
   */
  async transcribe(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<MediaRecorder> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    return mediaRecorder;
  }
}
