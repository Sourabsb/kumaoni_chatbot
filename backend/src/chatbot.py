from src.normalizer import normalizer
from src.retriever import retriever
from src.context_manager import ContextManager
from src.generator import generator

class Chatbot:
    def __init__(self):
        self.context_manager = ContextManager()
    
    def chat(self, user_message: str) -> dict:
        """Process user message and return Kumaoni response."""
        
        # Step 1: Normalize to English
        english_meaning = normalizer.normalize(user_message)
        
        # Step 2: Retrieve similar examples
        examples = retriever.retrieve(english_meaning)
        
        # Step 3: Get conversation context
        context = self.context_manager.get_summary() if len(self.context_manager.history) > 2 else ""
        
        # Step 4: Generate Kumaoni reply
        kumaoni_reply = generator.generate(
            original_message=user_message,
            english_meaning=english_meaning,
            examples=examples,
            context=context
        )
        
        # Step 5: Update history
        self.context_manager.add_message("user", user_message)
        self.context_manager.add_message("assistant", kumaoni_reply)
        
        return {
            "reply": kumaoni_reply,
            "english_meaning": english_meaning,
            "retrieved_examples": examples
        }
    
    def reset(self):
        """Clear conversation history."""
        self.context_manager.clear()
    
    def get_history(self) -> list[dict]:
        """Get conversation history."""
        return [
            {"role": m.role, "content": m.content}
            for m in self.context_manager.get_history()
        ]
