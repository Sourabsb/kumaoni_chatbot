import google.generativeai as genai
from src.config import GEMINI_API_KEY, GEMINI_MODEL

genai.configure(api_key=GEMINI_API_KEY)

class GeminiClient:
    def __init__(self):
        self.model = genai.GenerativeModel(GEMINI_MODEL)
    
    def generate(self, prompt: str) -> str:
        """Send prompt to Gemini, return response text."""
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Gemini API Error: {e}")
            raise e

# Shared instance
gemini_client = GeminiClient()
