"""
Text-to-Speech Module with Interruption Support

Supports edge-tts (online) and pyttsx3 (offline).
Plays audio in background with ability to stop mid-playback.
"""

import asyncio
import threading
import tempfile
import os
from enum import Enum

import edge_tts
import pygame

from config import TTS_ENGINE, EDGE_TTS_VOICE


class PlaybackStatus(Enum):
    COMPLETED = "completed"
    INTERRUPTED = "interrupted"
    ERROR = "error"


class TextToSpeech:
    def __init__(self):
        # Initialize pygame mixer for audio playback
        pygame.mixer.init()
        
        self._is_playing = False
        self._should_stop = False
        self._lock = threading.Lock()
        self._playback_thread = None
        self._temp_file = None
        
        print(f"✅ TTS initialized (engine: {TTS_ENGINE})")
    
    def _cleanup_temp_file(self):
        """Remove temporary audio file if it exists."""
        if self._temp_file and os.path.exists(self._temp_file):
            try:
                os.remove(self._temp_file)
            except:
                pass
            self._temp_file = None
    
    async def _generate_audio_edge_tts(self, text: str, output_path: str):
        """Generate audio using edge-tts."""
        communicate = edge_tts.Communicate(text, EDGE_TTS_VOICE)
        await communicate.save(output_path)
    
    def _generate_audio(self, text: str) -> str | None:
        """Generate audio file from text and return file path."""
        try:
            # Create temp file for audio
            fd, temp_path = tempfile.mkstemp(suffix=".mp3")
            os.close(fd)
            
            if TTS_ENGINE == "edge-tts":
                # Run async edge-tts in sync context
                asyncio.run(self._generate_audio_edge_tts(text, temp_path))
            else:
                # Fallback to pyttsx3
                import pyttsx3
                engine = pyttsx3.init()
                engine.save_to_file(text, temp_path)
                engine.runAndWait()
            
            return temp_path
            
        except Exception as e:
            print(f"❌ TTS generation error: {e}")
            return None
    
    def _play_audio_blocking(self, audio_path: str, check_interrupt_fn) -> PlaybackStatus:
        """Play audio file with interruption checking."""
        try:
            pygame.mixer.music.load(audio_path)
            pygame.mixer.music.play()
            
            with self._lock:
                self._is_playing = True
            
            # Poll for completion or interruption
            while pygame.mixer.music.get_busy():
                # Check if stop was requested
                with self._lock:
                    if self._should_stop:
                        pygame.mixer.music.stop()
                        return PlaybackStatus.INTERRUPTED
                
                # Check for user speech (interruption)
                if check_interrupt_fn and check_interrupt_fn():
                    print("🛑 User interrupted! Stopping playback...")
                    pygame.mixer.music.stop()
                    return PlaybackStatus.INTERRUPTED
                
                pygame.time.wait(50)  # Check every 50ms
            
            return PlaybackStatus.COMPLETED
            
        except Exception as e:
            print(f"❌ Playback error: {e}")
            return PlaybackStatus.ERROR
        finally:
            with self._lock:
                self._is_playing = False
    
    def speak(self, text: str, check_interrupt_fn=None) -> PlaybackStatus:
        """
        Convert text to speech and play it.
        
        Args:
            text: Text to speak
            check_interrupt_fn: Optional function that returns True if user is speaking
        
        Returns:
            PlaybackStatus indicating if playback completed or was interrupted
        """
        if not text or not text.strip():
            return PlaybackStatus.COMPLETED
        
        print(f"🔊 Speaking: {text[:50]}...")
        
        # Reset stop flag
        with self._lock:
            self._should_stop = False
        
        # Generate audio
        self._cleanup_temp_file()
        audio_path = self._generate_audio(text)
        
        if not audio_path:
            return PlaybackStatus.ERROR
        
        self._temp_file = audio_path
        
        # Play audio with interruption checking
        status = self._play_audio_blocking(audio_path, check_interrupt_fn)
        
        # Cleanup
        self._cleanup_temp_file()
        
        if status == PlaybackStatus.COMPLETED:
            print("✅ Finished speaking.")
        elif status == PlaybackStatus.INTERRUPTED:
            print("⏹️ Speech interrupted.")
        
        return status
    
    def stop(self):
        """Stop current playback immediately."""
        with self._lock:
            self._should_stop = True
        
        try:
            if pygame.mixer.get_init() and pygame.mixer.music.get_busy():
                pygame.mixer.music.stop()
        except:
            pass
    
    def is_playing(self) -> bool:
        """Check if currently playing audio."""
        with self._lock:
            return self._is_playing
    
    def cleanup(self):
        """Cleanup resources."""
        self.stop()
        self._cleanup_temp_file()
        try:
            if pygame.mixer.get_init():
                pygame.mixer.quit()
        except:
            pass


# Singleton instance
tts = TextToSpeech()
