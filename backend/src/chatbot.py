from src.normalizer import normalizer
from src.retriever import retriever
from src.context_manager import ContextManager
from src.generator import generator

class Chatbot:
    def __init__(self):
        self.context_manager = ContextManager()
    
    def chat(self, user_message: str) -> dict:
        """Process user message and return Kumaoni response."""
        
        # Build conversation history for context awareness
        history_text = ""
        if self.context_manager.history:
            history_text = "\n".join(
                f"{m.role.capitalize()}: {m.content}" 
                for m in self.context_manager.history[-6:]  # Last 3 turns
            )
        
        # Step 1: Generate context-aware English conversational response (Stage 1)
        english_meaning = normalizer.normalize(user_message, context=history_text)
        
        # Step 2: Retrieve Kumaoni examples using combined semantic query
        # Combines original input + conversational intent for better pattern matching
        combined_query = f"{user_message} | {english_meaning}"
        examples = retriever.retrieve(combined_query)
        
        # Step 3: Get conversation summary for generation
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
