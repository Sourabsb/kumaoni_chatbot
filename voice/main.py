"""
Kumaoni Voice Chatbot - Main Entry Point

This is a voice interaction layer that works on top of the existing
text-based chatbot API. It handles:
- Microphone input with voice activity detection
- Speech-to-text conversion
- Calling the existing /api/chat endpoint
- Text-to-speech with interruption support

Prerequisites:
1. Start the backend server first:
   cd backend && python -m uvicorn api:app --reload

2. Then run this voice client:
   cd voice && python main.py

First run will download:
- Whisper model (~150MB for 'base')
- Silero VAD model (~100MB)
"""

from voice_loop import voice_loop


def main():
    """Start the voice chatbot."""
    try:
        voice_loop.start()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Is the backend server running? (cd backend && python -m uvicorn api:app --reload)")
        print("2. Is your microphone working and accessible?")
        print("3. Check if all dependencies are installed (pip install -r requirements.txt)")
        raise


if __name__ == "__main__":
    main()
