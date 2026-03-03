"""
Minimax Voice AI Integration
Provides voice cloning and natural conversation capabilities
"""

import os
import requests
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()


class MinimaxVoiceService:
    """Service for interacting with Minimax Voice AI API"""
    
    def __init__(self):
        self.api_key = os.getenv("MINIMAX_API_KEY")
        self.voice_id = os.getenv("MINIMAX_VOICE_ID", "moss_audio_bccfab56-ed6a-11f0-b6f2-dec5318e06e3")
        # Use international base URL
        self.base_url = "https://api.minimax.io/v1"
        
        if not self.api_key:
            raise ValueError("MINIMAX_API_KEY environment variable is required")
    
    def text_to_speech(
        self, 
        text: str,
        voice_id: Optional[str] = None,
        speed: float = 1.0,
        pitch: int = 0,  # Must be integer
        vol: float = 1.0
    ) -> bytes:
        """
        Convert text to speech using Minimax T2A API with cloned voice
        
        Args:
            text: The text to convert to speech
            voice_id: Optional specific voice ID (defaults to configured voice)
            speed: Speech speed (0.5 to 2.0) - default 1.0
            pitch: Voice pitch adjustment (-12 to 12 semitones, integer) - default 0
            vol: Volume (0.1 to 10.0) - default 1.0
            
        Returns:
            Audio data as bytes (MP3 format)
        """
        url = f"{self.base_url}/t2a_v2"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "speech-02-hd",  # High quality model with excellent rhythm
            "text": text,
            "voice_setting": {
                "voice_id": voice_id or self.voice_id,
                "speed": speed,
                "pitch": pitch,
                "vol": vol
            },
            "audio_setting": {
                "format": "mp3",  # MP3 format
                "sample_rate": 24000  # 24kHz sample rate
            }
        }
        
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code != 200:
            error_detail = response.text
            try:
                error_json = response.json()
                error_detail = error_json.get('message', error_detail)
            except:
                pass
            raise Exception(f"Minimax TTS API error ({response.status_code}): {error_detail}")
        
        # The response contains JSON with base64 encoded audio or audio URL
        response_data = response.json()
        
        # Check if response has audio data
        if 'data' in response_data and 'audio' in response_data['data']:
            # Audio is base64 encoded
            import base64
            audio_data = response_data['data']['audio']
            return base64.b64decode(audio_data)
        elif 'data' in response_data and 'audio_file' in response_data['data']:
            # Audio URL provided - download it
            audio_url = response_data['data']['audio_file']
            audio_response = requests.get(audio_url)
            return audio_response.content
        else:
            raise Exception(f"Unexpected response format: {response_data}")
    
    def speech_to_text(self, audio_file_path: str) -> str:
        """
        Transcribe audio to text using Minimax ASR
        
        Args:
            audio_file_path: Path to the audio file to transcribe
            
        Returns:
            Transcribed text
        """
        url = f"{self.base_url}/audio/transcriptions"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        with open(audio_file_path, 'rb') as audio_file:
            files = {
                'file': audio_file,
                'model': (None, 'whisper-1')
            }
            
            response = requests.post(url, headers=headers, files=files)
        
        if response.status_code != 200:
            raise Exception(f"Minimax ASR API error: {response.status_code} - {response.text}")
        
        return response.json().get('text', '')
    
    def chat_completion(
        self,
        messages: list,
        temperature: float = 0.7,
        max_tokens: int = 300
    ) -> str:
        """
        Generate chat completion using Minimax's LLM
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            temperature: Sampling temperature (0.0 to 2.0)
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated response text
        """
        url = f"{self.base_url}/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "abab6.5s-chat",  # Minimax's chat model optimized for long conversations
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code != 200:
            raise Exception(f"Minimax Chat API error: {response.status_code} - {response.text}")
        
        data = response.json()
        return data['choices'][0]['message']['content']
    
    def voice_conversation(
        self,
        audio_file_path: str,
        conversation_history: list = None,
        system_prompt: str = None
    ) -> Dict[str, Any]:
        """
        Complete voice-to-voice conversation pipeline
        
        Args:
            audio_file_path: Path to input audio file
            conversation_history: Previous conversation messages
            system_prompt: System/instruction prompt for the AI
            
        Returns:
            Dictionary containing transcript, response text, and audio bytes
        """
        # Step 1: Transcribe input audio
        transcript = self.speech_to_text(audio_file_path)
        
        # Step 2: Prepare messages for chat
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        if conversation_history:
            messages.extend(conversation_history)
        
        messages.append({"role": "user", "content": transcript})
        
        # Step 3: Generate text response
        response_text = self.chat_completion(messages)
        
        # Step 4: Convert response to speech
        audio_bytes = self.text_to_speech(response_text)
        
        return {
            "transcript": transcript,
            "response": response_text,
            "audio": audio_bytes
        }
