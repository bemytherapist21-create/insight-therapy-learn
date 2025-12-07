/**
 * Voice AI Service - ElevenLabs & D-ID Integration
 * Real-time voice synthesis and avatar interaction
 */

export interface VoiceConfig {
  voiceId: string;
  model: 'eleven_monolingual_v1' | 'eleven_multilingual_v2';
  stability: number;
  similarityBoost: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface StreamingOptions {
  optimizeLatency: boolean;
  chunkSize: number;
}

class VoiceService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
  }

  /**
   * Initialize Web Audio API context
   */
  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Text-to-speech with streaming
   */
  async speak(text: string, config: Partial<VoiceConfig> = {}): Promise<void> {
    const defaultConfig: VoiceConfig = {
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah voice (warm, empathetic)
      model: 'eleven_multilingual_v2',
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.3,
      useSpeakerBoost: true,
    };

    const voiceConfig = { ...defaultConfig, ...config };

    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceConfig.voiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: voiceConfig.model,
            voice_settings: {
              stability: voiceConfig.stability,
              similarity_boost: voiceConfig.similarityBoost,
              style: voiceConfig.style,
              use_speaker_boost: voiceConfig.useSpeakerBoost,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      await this.playAudio(audioBlob);
    } catch (error) {
      console.error('Voice synthesis failed:', error);
      throw error;
    }
  }

  /**
   * Play audio blob through Web Audio API
   */
  private async playAudio(blob: Blob): Promise<void> {
    const audioContext = this.getAudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Stop any currently playing audio
    this.stop();

    // Create and play new source
    this.currentSource = audioContext.createBufferSource();
    this.currentSource.buffer = audioBuffer;
    this.currentSource.connect(audioContext.destination);
    this.currentSource.start(0);

    return new Promise((resolve) => {
      if (this.currentSource) {
        this.currentSource.onended = () => resolve();
      }
    });
  }

  /**
   * Stop current audio playback
   */
  stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (error) {
        // Already stopped
      }
      this.currentSource = null;
    }
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getAvailableVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices;
    } catch (error) {
      console.error('Failed to get voices:', error);
      return [];
    }
  }

  /**
   * Clean up audio resources
   */
  dispose(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const voiceService = new VoiceService();
