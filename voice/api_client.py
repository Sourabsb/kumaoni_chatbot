"""
API Client for Kumaoni Chatbot

Sends text to the existing /api/chat endpoint and returns the response.
Does NOT modify any backend logic - purely a client.
"""

import requests
from typing import Optional

from config import CHAT_ENDPOINT


class APIClient:
    def __init__(self):
        self.session_id: Optional[str] = None
        self._session = requests.Session()
    
    def chat(self, message: str) -> dict:
        """
        Send a message to the chatbot API.
        
        Args:
            message: User's text message
        
        Returns:
            Dict with keys: reply, english_meaning, session_id, success
        """
        try:
            payload = {
                "message": message,
                "session_id": self.session_id
            }
            
            response = self._session.post(
                CHAT_ENDPOINT,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                # Update session ID for continuity
                self.session_id = data.get("session_id")
                
                return {
                    "success": True,
                    "reply": data.get("reply", ""),
                    "english_meaning": data.get("english_meaning", ""),
                    "session_id": self.session_id
                }
            else:
                print(f"❌ API error: {response.status_code}")
                return {
                    "success": False,
                    "reply": "",
                    "english_meaning": "",
                    "error": f"HTTP {response.status_code}"
                }
                
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to API. Is the backend running?")
            return {
                "success": False,
                "reply": "",
                "english_meaning": "",
                "error": "Connection failed"
            }
        except Exception as e:
            print(f"❌ API error: {e}")
            return {
                "success": False,
                "reply": "",
                "english_meaning": "",
                "error": str(e)
            }
    
    def reset_session(self):
        """Start a new conversation session."""
        self.session_id = None
        print("🔄 Session reset. Starting new conversation.")


# Singleton instance
api_client = APIClient()
