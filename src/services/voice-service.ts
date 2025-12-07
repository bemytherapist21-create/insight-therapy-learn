/**
 * Voice AI Service
 * Integrates ElevenLabs for voice synthesis and real-time audio
 */

export interface VoiceConfig {
  voiceId: string;
  stability: number;
  similarityBoost: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export class VoiceService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Convert text to speech
   */
  async textToSpeech(
    text: string,
    voiceId: string = 'default',
    config?: Partial<VoiceConfig>
  ): Promise<ArrayBuffer> {
    const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: config?.stability ?? 0.5,
          similarity_boost: config?.similarityBoost ?? 0.75,
          style: config?.style ?? 0,
          use_speaker_boost: config?.useSpeakerBoost ?? true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Voice synthesis failed: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  }

  /**
   * Stream text to speech for real-time playback
   */
  async *streamTextToSpeech(
    text: string,
    voiceId: string = 'default'
  ): AsyncGenerator<Uint8Array> {
    const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1'
      })
    });

    if (!response.ok || !response.body) {
      throw new Error('Voice streaming failed');
    }

    const reader = response.body.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        'xi-api-key': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch voices');
    }

    const data = await response.json();
    return data.voices;
  }

  /**
   * Play audio from array buffer
   */
  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    const audioContext = new AudioContext();
    const audioBufferNode = await audioContext.decodeAudioData(audioBuffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBufferNode;
    source.connect(audioContext.destination);
    source.start(0);

    return new Promise((resolve) => {
      source.onended = () => resolve();
    });
  }
}

/**
 * Speech-to-Text Service
 */
export class SpeechToTextService {
  private recognition: any;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    }
  }

  /**
   * Start listening for speech
   */
  startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: any) => void
  ): void {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      onResult(transcript, result.isFinal);
    };

    if (onError) {
      this.recognition.onerror = onError;
    }

    this.recognition.start();
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    return !!this.recognition;
  }
}
