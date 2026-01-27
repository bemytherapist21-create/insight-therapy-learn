/**
 * Audio Utilities for Gemini Live Voice Therapy
 * Handles PCM encoding/decoding for real-time audio streaming
 */

/**
 * Decode base64 string to Uint8Array
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encode Uint8Array to base64 string
 */
export function encode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decode raw audio data to AudioBuffer
 * @param audioData - Raw PCM audio data as Uint8Array
 * @param audioContext - AudioContext to use for decoding
 * @param sampleRate - Sample rate of the audio (default 24000 for Gemini output)
 * @param numChannels - Number of audio channels (default 1 for mono)
 */
export async function decodeAudioData(
  audioData: Uint8Array,
  audioContext: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  // Convert raw PCM to Float32Array
  const int16Array = new Int16Array(audioData.buffer, audioData.byteOffset, audioData.byteLength / 2);
  const float32Array = new Float32Array(int16Array.length);
  
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  
  // Create AudioBuffer
  const audioBuffer = audioContext.createBuffer(numChannels, float32Array.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32Array);
  
  return audioBuffer;
}

/**
 * Create a PCM blob from Float32Array audio data for sending to Gemini
 * @param float32Array - Audio samples as Float32Array
 * @returns Base64 encoded PCM data object for Gemini
 */
export function createBlob(float32Array: Float32Array): { data: string; mimeType: string } {
  // Convert Float32 to Int16 PCM
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  
  // Convert to Uint8Array and base64 encode
  const uint8Array = new Uint8Array(int16Array.buffer);
  const base64 = encode(uint8Array);
  
  return {
    data: base64,
    mimeType: 'audio/pcm;rate=16000'
  };
}

/**
 * Create audio context with specified sample rate
 */
export function createAudioContext(sampleRate: number): AudioContext {
  return new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
}
