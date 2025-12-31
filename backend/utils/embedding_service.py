import numpy as np
from sentence_transformers import SentenceTransformer
from src.config import EMBEDDING_MODEL

class EmbeddingService:
    def __init__(self):
        self.model = SentenceTransformer(EMBEDDING_MODEL)
    
    def embed(self, text: str) -> np.ndarray:
        """Convert text to embedding vector."""
        return self.model.encode(text, convert_to_numpy=True)
    
    def embed_batch(self, texts: list[str]) -> np.ndarray:
        """Convert list of texts to embedding vectors."""
        return self.model.encode(texts, convert_to_numpy=True, show_progress_bar=True)

# Shared instance
embedding_service = EmbeddingService()
