import whisper
import numpy as np
import pyaudio
import threading
import time
import ssl
import urllib.request
from typing import Optional, Callable

# Fix SSL certificate issues
ssl._create_default_https_context = ssl._create_unverified_context

class SimpleSpeechToText:
    """
    Simplified real-time speech-to-text using local Whisper model.
    """
    
    def __init__(self, model_size: str = "tiny", callback: Optional[Callable] = None):
        """
        Initialize the speech-to-text system.
        
        Args:
            model_size: Whisper model size ('tiny', 'base', 'small')
            callback: Function to call with transcription results
        """
        self.model_size = model_size
        self.callback = callback
        self.model = None
        self.is_recording = False
        self.audio = pyaudio.PyAudio()
        
        print(f"Loading Whisper model: {model_size}")
        try:
            self.model = whisper.load_model(model_size)
            print("Model loaded successfully!")
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Trying to download model manually...")
            self._download_model_manually()
    
    def _download_model_manually(self):
        """Manually download the Whisper model if automatic download fails."""
        try:
            # Set up SSL context to ignore certificate verification
            import os
            os.environ['CURL_CA_BUNDLE'] = ''
            
            # Try loading again with SSL verification disabled
            self.model = whisper.load_model(self.model_size)
            print("Model loaded successfully with SSL fix!")
        except Exception as e:
            print(f"Failed to load model: {e}")
            raise
    
    def start_recording(self):
        """Start recording and transcribing audio."""
        if self.is_recording:
            print("Already recording!")
            return
        
        if not self.model:
            print("Model not loaded!")
            return
        
        self.is_recording = True
        
        # Audio settings
        sample_rate = 16000
        chunk_size = 1024
        duration = 3  # seconds per chunk
        
        # Open audio stream
        stream = self.audio.open(
            format=pyaudio.paFloat32,
            channels=1,
            rate=sample_rate,
            input=True,
            frames_per_buffer=chunk_size
        )
        
        print("🎤 Recording started! Speak now...")
        
        try:
            while self.is_recording:
                # Record audio chunk
                frames = []
                for _ in range(0, int(sample_rate / chunk_size * duration)):
                    if not self.is_recording:
                        break
                    data = stream.read(chunk_size)
                    frames.append(data)
                
                if not self.is_recording:
                    break
                
                # Combine frames and convert to numpy
                audio_data = b''.join(frames)
                audio_array = np.frombuffer(audio_data, dtype=np.float32)
                
                # Check if audio has sound
                if np.max(np.abs(audio_array)) > 0.01:
                    # Transcribe
                    result = self.model.transcribe(audio_array, language="en")
                    text = result["text"].strip()
                    
                    if text:
                        print(f"🎤 {text}")
                        if self.callback:
                            self.callback(text)
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping...")
        finally:
            stream.stop_stream()
            stream.close()
            self.is_recording = False
    
    def stop_recording(self):
        """Stop recording."""
        self.is_recording = False
        print("Recording stopped")
    
    def cleanup(self):
        """Clean up resources."""
        self.stop_recording()
        self.audio.terminate()


# Simple usage example
if __name__ == "__main__":
    def on_speech(text):
        print(f"💬 You said: {text}")
    
    stt = SimpleSpeechToText(model_size="tiny", callback=on_speech)
    
    try:
        stt.start_recording()
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    finally:
        stt.cleanup()
        