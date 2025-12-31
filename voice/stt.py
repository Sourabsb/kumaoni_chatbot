"""
Speech-to-Text Module using faster-whisper

Converts audio numpy arrays to text using the Whisper model.
"""

from faster_whisper import WhisperModel
import numpy as np

from config import WHISPER_MODEL_SIZE, WHISPER_DEVICE, WHISPER_COMPUTE_TYPE, SAMPLE_RATE


class SpeechToText:
    def __init__(self):
        print(f"Loading Whisper model ({WHISPER_MODEL_SIZE})...")
        self.model = WhisperModel(
            WHISPER_MODEL_SIZE,
            device=WHISPER_DEVICE,
            compute_type=WHISPER_COMPUTE_TYPE
        )
        print("✅ Whisper model loaded.")
    
    def transcribe(self, audio: np.ndarray) -> str:
        """
        Transcribe audio to text.
        
        Args:
            audio: numpy array of audio samples (float32, mono, 16kHz)
        
        Returns:
            Transcribed text string
        """
        # Ensure audio is float32
        if audio.dtype != np.float32:
            audio = audio.astype(np.float32)
        
        # Normalize audio
        if np.abs(audio).max() > 1.0:
            audio = audio / np.abs(audio).max()
        
        # Transcribe with language detection
        # Whisper works well with Hindi, English, and mixed language
        segments, info = self.model.transcribe(
            audio,
            beam_size=5,
            language=None,  # Auto-detect language
            vad_filter=True,  # Filter out non-speech
            vad_parameters=dict(
                min_silence_duration_ms=500,
                speech_pad_ms=200
            )
        )
        
        # Combine all segments
        text_parts = []
        for segment in segments:
            text_parts.append(segment.text.strip())
        
        full_text = " ".join(text_parts).strip()
        
        if full_text:
            print(f"📝 Transcribed: {full_text}")
            detected_lang = info.language if info.language else "unknown"
            print(f"   (Detected language: {detected_lang})")
        
        return full_text


# Singleton instance
stt = SpeechToText()
