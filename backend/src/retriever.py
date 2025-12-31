import json
import pickle
import numpy as np
from pathlib import Path
from src.config import DATA_DIR, EMBEDDINGS_DIR, TOP_K_RESULTS
from utils.embedding_service import embedding_service

class Retriever:
    def __init__(self):
        self.english_sentences = []
        self.kumaoni_sentences = []
        self.embeddings = None
        self._load_data()
    
    def _load_data(self):
        """Load dataset and embeddings from disk."""
        # Load parallel sentences
        dataset_path = DATA_DIR / "kumaoni_dataset_final.jsonl"
        if dataset_path.exists():
            with open(dataset_path, "r", encoding="utf-8") as f:
                for line in f:
                    item = json.loads(line)
                    self.english_sentences.append(item["english"])
                    self.kumaoni_sentences.append(item["kumaoni"])
        
        # Load embeddings
        embeddings_path = EMBEDDINGS_DIR / "dataset_embeddings.pkl"
        if embeddings_path.exists():
            with open(embeddings_path, "rb") as f:
                self.embeddings = pickle.load(f)
    
    def retrieve(self, query: str, top_k: int = TOP_K_RESULTS) -> list[dict]:
        """Find top-k similar English-Kumaoni pairs for a query."""
        if self.embeddings is None or len(self.english_sentences) == 0:
            return []
        
        # Embed query
        query_emb = embedding_service.embed(query)
        
        # Compute cosine similarity
        similarities = np.dot(self.embeddings, query_emb) / (
            np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(query_emb)
        )
        
        # Get top-k indices
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            results.append({
                "english": self.english_sentences[idx],
                "kumaoni": self.kumaoni_sentences[idx],
                "score": float(similarities[idx])
            })
        
        return results

retriever = Retriever()
