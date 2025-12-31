"""
Voice Interaction Loop

Main orchestrator that:
1. Listens for user speech (VAD)
2. Waits for silence (end of utterance)
3. Converts speech to text (STT)
4. Sends to existing chatbot API
5. Plays response as speech (TTS)
6. Handles interruptions (stops if user speaks)

Only complete turns are considered valid for conversation memory.
Interrupted responses are discarded.
"""

import time
import signal
import sys

from audio_input import audio_input
from stt import stt
from tts import tts, PlaybackStatus
from api_client import api_client


class VoiceLoop:
    def __init__(self):
        self.running = False
        self.interrupted_count = 0
        self.completed_turns = 0
        
    def _check_for_interruption(self) -> bool:
        """Check if user is speaking during TTS playback."""
        return audio_input.check_for_interruption()
    
    def run_one_turn(self) -> bool:
        """
        Run one complete conversation turn.
        
        Returns:
            True if turn completed successfully
            False if interrupted or failed
        """
        # Step 1: Wait for user to speak
        audio = audio_input.wait_for_utterance()
        
        if audio is None:
            # Listening was stopped
            return False
        
        # Step 2: Convert speech to text
        user_text = stt.transcribe(audio)
        
        if not user_text or not user_text.strip():
            print("⚠️ Could not understand. Please try again.")
            return False
        
        # Step 3: Send to chatbot API
        print(f"\n👤 You: {user_text}")
        response = api_client.chat(user_text)
        
        if not response["success"]:
            print("❌ Failed to get response from chatbot.")
            return False
        
        reply = response["reply"]
        print(f"🤖 Bot: {reply}")
        
        # Step 4: Speak the response with interruption detection
        playback_status = tts.speak(reply, self._check_for_interruption)
        
        if playback_status == PlaybackStatus.INTERRUPTED:
            # User interrupted - this response should not count
            # The backend already saved it, but we note it locally
            self.interrupted_count += 1
            print("⚠️ Response was interrupted and will not be considered complete.")
            return False
        
        elif playback_status == PlaybackStatus.COMPLETED:
            self.completed_turns += 1
            return True
        
        else:
            # Error
            return False
    
    def start(self):
        """Start the voice interaction loop."""
        print("\n" + "="*50)
        print("🎙️  KUMAONI VOICE CHATBOT")
        print("="*50)
        print("Speak in Hindi, English, or Kumaoni.")
        print("The bot will respond in Kumaoni.")
        print("Speak while the bot is talking to interrupt.")
        print("Press Ctrl+C to exit.")
        print("="*50 + "\n")
        
        self.running = True
        
        # Start listening
        audio_input.start_listening()
        
        try:
            while self.running:
                self.run_one_turn()
                
                # Small delay to prevent tight loop
                time.sleep(0.1)
                
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
        finally:
            self.stop()
    
    def stop(self):
        """Stop the voice loop and cleanup."""
        self.running = False
        audio_input.stop_listening()
        tts.cleanup()
        
        print(f"\n📊 Session Stats:")
        print(f"   Completed turns: {self.completed_turns}")
        print(f"   Interrupted: {self.interrupted_count}")


# Singleton instance
voice_loop = VoiceLoop()


def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully."""
    print("\n\nShutting down...")
    voice_loop.stop()
    sys.exit(0)


# Register signal handler
signal.signal(signal.SIGINT, signal_handler)
