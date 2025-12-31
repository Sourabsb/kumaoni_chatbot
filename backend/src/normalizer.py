from utils.gemini_client import gemini_client

NORMALIZE_PROMPT = """You are a language translator. Your job is to convert the user's message into simple, unambiguous English.
The input might be in Kumaoni (Roman/Devanagari), Hindi, English, or a mix (Hinglish).

User Message: "{message}"

Instructions:
1. Understand the core intent and meaning of the message.
2. Output ONLY the English translation/meaning.
3. Do not add explanations, notes, or punctuation like quotes.
4. If the message is already English, output it as is.

English Meaning:"""

class Normalizer:
    def normalize(self, message: str) -> str:
        """Convert any language input to plain English."""
        prompt = NORMALIZE_PROMPT.format(message=message)
        return gemini_client.generate(prompt)

normalizer = Normalizer()
