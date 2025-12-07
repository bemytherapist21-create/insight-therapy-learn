/**
 * Speech-to-Text Service
 * Converts user voice input to text using Web Speech API
 */

export interface TranscriptionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export interface STTOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

class SpeechToTextService {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback: ((result: TranscriptionResult) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  constructor() {
    this.initializeRecognition();
  }

  /**
   * Initialize Web Speech API
   */
  private initializeRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech Recognition API not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for speech recognition
   */
  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      if (this.onResultCallback) {
        this.onResultCallback({ text: transcript, confidence, isFinal });
      }
    };

    this.recognition.onerror = (event: any) => {
      const error = new Error(`Speech recognition error: ${event.error}`);
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  /**
   * Start listening for speech input
   */
  start(
    options: STTOptions = {},
    onResult: (result: TranscriptionResult) => void,
    onError?: (error: Error) => void
  ): void {
    if (!this.recognition) {
      const error = new Error('Speech Recognition not available');
      if (onError) onError(error);
      return;
    }

    if (this.isListening) {
      this.stop();
    }

    // Configure recognition
    this.recognition.lang = options.language || 'en-US';
    this.recognition.continuous = options.continuous ?? true;
    this.recognition.interimResults = options.interimResults ?? true;
    this.recognition.maxAlternatives = options.maxAlternatives ?? 1;

    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      if (onError) onError(error as Error);
    }
  }

  /**
   * Stop listening
   */
  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Check if currently listening
   */
  get listening(): boolean {
    return this.isListening;
  }

  /**
   * Check if speech recognition is supported
   */
  static isSupported(): boolean {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  }
}

export const speechToText = new SpeechToTextService();
