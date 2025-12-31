"""Build embeddings for the dataset. Run once before starting the chatbot."""

import sys
import json
import pickle
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.config import DATA_DIR, EMBEDDINGS_DIR
from utils.embedding_service import embedding_service

def main():
    # Load dataset
    dataset_path = DATA_DIR / "kumaoni_dataset_final.jsonl"
    
    print(f"Loading dataset from {dataset_path}")
    english_sentences = []
    
    with open(dataset_path, "r", encoding="utf-8") as f:
        for line in f:
            item = json.loads(line)
            english_sentences.append(item["english"])
    
    print(f"Loaded {len(english_sentences)} sentences")
    
    # Generate embeddings
    print("Generating embeddings (this may take a few minutes)...")
    embeddings = embedding_service.embed_batch(english_sentences)
    
    # Save embeddings
    EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)
    output_path = EMBEDDINGS_DIR / "dataset_embeddings.pkl"
    
    with open(output_path, "wb") as f:
        pickle.dump(embeddings, f)
    
    print(f"Saved embeddings to {output_path}")
    print(f"Shape: {embeddings.shape}")

if __name__ == "__main__":
    main()
