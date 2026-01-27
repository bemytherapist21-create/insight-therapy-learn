import { useEffect, useRef, useState, useCallback } from "react";

export interface GeminiLiveState {
  isConnected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  error: string | null;
}

export const useGeminiLive = () => {
  const [state, setState] = useState<GeminiLiveState>({
    isConnected: false,
    isSpeaking: false,
    isListening: false,
    error: null,
  });

  const clientRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startSession = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      console.log("[GeminiLive] Initializing...");

      // Use correct Gemini SDK package
      const { GoogleGenerativeAI } = await import("@google/generative-ai");

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not found");
      }

      console.log("[GeminiLive] Creating AI client...");
      const genAI = new GoogleGenerativeAI(apiKey);

      // Request microphone access
      console.log("[GeminiLive] Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      console.log("[GeminiLive] Microphone access granted");

      // Initialize audio context for playback
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });

      // Create Gemini Live client
      console.log("[GeminiLive] Connecting to Gemini Live API...");

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        systemInstruction: `You are a compassionate AI therapy assistant. 
        Provide empathetic, supportive responses. 
        Listen actively and respond naturally in a warm, conversational tone.
        Keep responses concise but meaningful.`,
      });

      // Start live session
      const session = model.startChat({
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
        },
      });

      clientRef.current = session;

      setState((prev) => ({
        ...prev,
        isConnected: true,
        isListening: true,
      }));

      console.log("[GeminiLive] ✅ Connected! Session started.");

      // Set up real-time audio streaming
      console.log("[GeminiLive] Setting up audio processing...");

      // Create MediaRecorder to capture audio chunks
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);

          // Convert to base64 for Gemini
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(",")[1];

            // Send audio to Gemini
            try {
              console.log("[GeminiLive] Sending audio chunk to AI...");

              const result = await session.sendMessage([
                {
                  inlineData: {
                    mimeType: "audio/webm",
                    data: base64Audio,
                  },
                },
              ]);

              const response = result.response;
              const text = response.text();

              if (text) {
                console.log("[GeminiLive] AI Response:", text);

                // Set speaking state
                setState((prev) => ({
                  ...prev,
                  isSpeaking: true,
                  isListening: false,
                }));

                // Use Google TTS to speak the response
                const googleTtsApiKey = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
                if (!googleTtsApiKey) {
                  console.warn("[GeminiLive] Google TTS API key not configured, skipping audio");
                  setState((prev) => ({
                    ...prev,
                    isSpeaking: false,
                    isListening: true,
                  }));
                  return;
                }

                const ttsResponse = await fetch(
                  `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleTtsApiKey}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      input: { text },
                      voice: {
                        languageCode: "en-IN",
                        name: "en-IN-Neural2-A",
                        ssmlGender: "FEMALE",
                      },
                      audioConfig: {
                        audioEncoding: "MP3",
                        speakingRate: 0.95,
                      },
                    }),
                  },
                );

                const ttsData = await ttsResponse.json();
                const audio = new Audio(
                  "data:audio/mp3;base64," + ttsData.audioContent,
                );

                audio.onended = () => {
                  setState((prev) => ({
                    ...prev,
                    isSpeaking: false,
                    isListening: true,
                  }));
                  // Restart recording for next input
                  if (mediaRecorder.state === "inactive") {
                    mediaRecorder.start(1000); // Record in 1-second chunks
                  }
                };

                await audio.play();
              }
            } catch (error) {
              console.error("[GeminiLive] Error processing audio:", error);
            }
          };
          reader.readAsDataURL(event.data);
        }
      };

      // Start recording in chunks (1 second intervals)
      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      console.log("[GeminiLive] Audio recording started");
    } catch (error: any) {
      console.error("[GeminiLive] ❌ Failed:", error);
      setState((prev) => ({
        ...prev,
        error: error.message,
        isConnected: false,
        isListening: false,
      }));

      // Clean up on error
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    }
  }, []);

  const stopSession = useCallback(() => {
    console.log("[GeminiLive] Stopping session...");

    try {
      // Stop media recorder
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      // Stop microphone
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // Reset client
      clientRef.current = null;

      setState({
        isConnected: false,
        isSpeaking: false,
        isListening: false,
        error: null,
      });

      console.log("[GeminiLive] ✅ Session stopped");
    } catch (error: any) {
      console.error("[GeminiLive] Error stopping:", error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return {
    ...state,
    startSession,
    stopSession,
  };
};
