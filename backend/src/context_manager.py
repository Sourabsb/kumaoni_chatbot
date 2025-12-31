from dataclasses import dataclass
from utils.gemini_client import gemini_client
from src.config import MAX_HISTORY_TURNS

@dataclass
class Message:
    role: str  # "user" or "assistant"
    content: str

class ContextManager:
    def __init__(self):
        self.history: list[Message] = []
    
    def add_message(self, role: str, content: str):
        """Add a message to conversation history."""
        self.history.append(Message(role=role, content=content))
        
        # Trim old messages if limit exceeded
        if len(self.history) > MAX_HISTORY_TURNS * 2:
            self.history = self.history[-MAX_HISTORY_TURNS * 2:]
    
    def get_history(self) -> list[Message]:
        """Return current conversation history."""
        return self.history
    
    def get_summary(self) -> str:
        """Generate short English summary of conversation."""
        if len(self.history) < 2:
            return ""
        
        history_text = "\n".join(
            f"{m.role}: {m.content}" for m in self.history[-6:]
        )
        
        prompt = f"""Summarize this conversation in 2-3 sentences in English:
{history_text}

Summary:"""
        
        return gemini_client.generate(prompt)
    
    def clear(self):
        """Clear conversation history."""
        self.history = []
