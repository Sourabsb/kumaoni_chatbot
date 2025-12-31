# Voice Client Configuration

# API Settings
API_BASE_URL = "http://localhost:8000"
CHAT_ENDPOINT = f"{API_BASE_URL}/api/chat"

# Whisper STT Settings
WHISPER_MODEL_SIZE = "base"  # Options: tiny, base, small, medium, large-v3
WHISPER_DEVICE = "cpu"  # Use "cuda" if you have NVIDIA GPU
WHISPER_COMPUTE_TYPE = "int8"  # Use "float16" for GPU

# VAD Settings
VAD_THRESHOLD = 0.5  # Speech probability threshold (0.0 - 1.0)
SILENCE_DURATION_MS = 800  # Silence duration to detect end of speech
MIN_SPEECH_DURATION_MS = 250  # Minimum speech duration to consider valid

# Audio Settings
SAMPLE_RATE = 16000  # Required by Whisper and silero-vad
CHUNK_SAMPLES = 512  # Exact samples per chunk (silero-vad requires 512 for 16kHz)
CHANNELS = 1  # Mono audio

# TTS Settings
TTS_ENGINE = "edge-tts"  # Options: edge-tts, pyttsx3
EDGE_TTS_VOICE = "hi-IN-SwaraNeural"  # Hindi female voice (good for Kumaoni)
# Alternative voices: "hi-IN-MadhurNeural" (male)

# Interruption Settings
INTERRUPTION_CHECK_INTERVAL_MS = 100  # How often to check for interruption during TTS
