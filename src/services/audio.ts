export const playSpeech = async (text: string, voice: string = 'Kore') => {
    // This is a placeholder. Real implementation would likely call an API or use Web Speech API.
    // Given the context of using Google GenAI with voice configuration, this might be handled by the backend or the Gemini API directly in LiveSession.
    // However, Journal uses `playSpeech` with `handleListen`.
    // Since I don't have the audio service code, I will implement a basic TTS using SpeechSynthesis for now,
    // or a placeholder if a specific API was intended. 
    // The user script mentions "automatic speech upon submission" for Journal.

    // Implementation using browser's SpeechSynthesis as a fallback/default
    return new Promise<void>((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        // Try to find a voice that matches or just use default
        // Note: 'Kore' is likely a specific voice name in the user's previous setup or Gemini reference.
        // For browser TTS, we can't guarantee 'Kore'.

        utterance.onend = () => resolve();
        utterance.onerror = (e) => reject(e);

        window.speechSynthesis.speak(utterance);
    });
};

export const decode = (base64: string): ArrayBuffer => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

export const decodeAudioData = async (
    audioData: ArrayBuffer,
    audioContext: AudioContext,
    sampleRate: number = 24000,
    numberOfChannels: number = 1
): Promise<AudioBuffer> => {
    // Common browser implementation
    return await audioContext.decodeAudioData(audioData);
};

export const createBlob = (inputData: Float32Array): Blob => {
    // Convert Float32Array to Int16Array for PCM
    const buffer = new ArrayBuffer(inputData.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < inputData.length; i++) {
        let s = Math.max(-1, Math.min(1, inputData[i]));
        s = s < 0 ? s * 0x8000 : s * 0x7FFF;
        view.setInt16(i * 2, s, true);
    }
    return new Blob([view], { type: 'audio/pcm' });
};
