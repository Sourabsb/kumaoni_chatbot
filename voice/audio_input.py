"""
Audio Input Module with Voice Activity Detection (VAD)

Uses silero-vad to detect when the user starts and stops speaking.
Captures audio from microphone and returns complete utterances.
"""

import numpy as np
import sounddevice as sd
import torch
import threading
import queue
from collections import deque

from config import (
    SAMPLE_RATE, CHUNK_SAMPLES, CHANNELS,
    VAD_THRESHOLD, SILENCE_DURATION_MS, MIN_SPEECH_DURATION_MS
)


class AudioInput:
    def __init__(self):
        # Load silero-vad model
        self.vad_model, self.vad_utils = torch.hub.load(
            repo_or_dir='snakers4/silero-vad',
            model='silero_vad',
            force_reload=False,
            trust_repo=True
        )
        (self.get_speech_timestamps, _, self.read_audio, _, _) = self.vad_utils
        
        # Audio settings - use exact 512 samples as required by silero-vad
        self.chunk_samples = CHUNK_SAMPLES
        chunk_ms = (CHUNK_SAMPLES / SAMPLE_RATE) * 1000  # ~32ms per chunk
        self.silence_chunks = int(SILENCE_DURATION_MS / chunk_ms)
        self.min_speech_chunks = int(MIN_SPEECH_DURATION_MS / chunk_ms)
        
        # State
        self.is_listening = False
        self.is_user_speaking = False
        self._audio_queue = queue.Queue()
        self._stream = None
        self._lock = threading.Lock()
        
    def _audio_callback(self, indata, frames, time, status):
        """Callback for audio stream - runs in separate thread."""
        if status:
            print(f"Audio status: {status}")
        # Put audio chunk in queue for processing
        self._audio_queue.put(indata.copy())
    
    def _get_speech_prob(self, audio_chunk: np.ndarray) -> float:
        """Get speech probability for an audio chunk using silero-vad."""
        # Convert to torch tensor
        audio_tensor = torch.from_numpy(audio_chunk.flatten()).float()
        
        # Normalize if needed
        if audio_tensor.abs().max() > 1.0:
            audio_tensor = audio_tensor / audio_tensor.abs().max()
        
        # Get speech probability
        with torch.no_grad():
            speech_prob = self.vad_model(audio_tensor, SAMPLE_RATE).item()
        
        return speech_prob
    
    def start_listening(self):
        """Start the audio input stream."""
        if self._stream is not None:
            return
            
        self.is_listening = True
        self._stream = sd.InputStream(
            samplerate=SAMPLE_RATE,
            channels=CHANNELS,
            dtype=np.float32,
            blocksize=self.chunk_samples,
            callback=self._audio_callback
        )
        self._stream.start()
        print("🎤 Microphone active. Speak now...")
    
    def stop_listening(self):
        """Stop the audio input stream."""
        self.is_listening = False
        if self._stream is not None:
            self._stream.stop()
            self._stream.close()
            self._stream = None
        # Clear queue
        while not self._audio_queue.empty():
            try:
                self._audio_queue.get_nowait()
            except queue.Empty:
                break
    
    def wait_for_utterance(self) -> np.ndarray | None:
        """
        Wait for user to speak and return the complete utterance.
        
        Returns audio as numpy array once user stops speaking,
        or None if listening was stopped.
        """
        audio_buffer = []
        silence_count = 0
        speech_count = 0
        is_speaking = False
        
        # Reset VAD state
        self.vad_model.reset_states()
        
        print("⏳ Waiting for speech...")
        
        while self.is_listening:
            try:
                # Get audio chunk (with timeout to allow checking is_listening)
                chunk = self._audio_queue.get(timeout=0.1)
            except queue.Empty:
                continue
            
            # Get speech probability
            speech_prob = self._get_speech_prob(chunk)
            is_speech = speech_prob > VAD_THRESHOLD
            
            if is_speech:
                if not is_speaking:
                    is_speaking = True
                    with self._lock:
                        self.is_user_speaking = True
                    print("🗣️ Speech detected...")
                
                silence_count = 0
                speech_count += 1
                audio_buffer.append(chunk)
                
            elif is_speaking:
                # User was speaking, now detecting silence
                silence_count += 1
                audio_buffer.append(chunk)  # Keep some trailing silence
                
                if silence_count >= self.silence_chunks:
                    # User has stopped speaking
                    with self._lock:
                        self.is_user_speaking = False
                    
                    # Check if we got enough speech
                    if speech_count >= self.min_speech_chunks:
                        print("✅ Speech complete.")
                        # Concatenate all audio chunks
                        full_audio = np.concatenate(audio_buffer, axis=0)
                        return full_audio.flatten()
                    else:
                        # Too short, probably noise - reset and continue
                        print("⚠️ Too short, ignoring...")
                        audio_buffer = []
                        silence_count = 0
                        speech_count = 0
                        is_speaking = False
        
        return None
    
    def check_if_user_speaking(self) -> bool:
        """Check if user is currently speaking (for interruption detection)."""
        with self._lock:
            return self.is_user_speaking
    
    def check_for_interruption(self) -> bool:
        """
        Quick check if there's any speech happening right now.
        Used during TTS playback to detect interruption.
        """
        try:
            # Check if there's audio in queue
            chunk = self._audio_queue.get_nowait()
            speech_prob = self._get_speech_prob(chunk)
            
            if speech_prob > VAD_THRESHOLD:
                with self._lock:
                    self.is_user_speaking = True
                return True
            return False
        except queue.Empty:
            return False


# Singleton instance
audio_input = AudioInput()
