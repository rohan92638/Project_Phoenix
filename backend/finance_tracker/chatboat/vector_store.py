"""
vector_store.py
===============
FAISS vector store for semantic memory search.
Converts text into embeddings and stores them to disk.
"""

import faiss
import numpy as np
import os
import json
from django.conf import settings
from .gemini_client import get_embedding

# Use Gemini's text-embedding-004 dimension
EMBEDDING_DIM = 768

# Store the vector DB in the Django base directory
BASE_DIR = settings.BASE_DIR
INDEX_FILE = os.path.join(BASE_DIR, "faiss_index.bin")
META_FILE = os.path.join(BASE_DIR, "faiss_meta.json")

# Global variables to hold the in-memory index
_index = None
_metadata = []

def _init_db():
    global _index, _metadata
    if _index is None:
        if os.path.exists(INDEX_FILE):
            _index = faiss.read_index(INDEX_FILE)
            if os.path.exists(META_FILE):
                with open(META_FILE, 'r') as f:
                    _metadata = json.load(f)
            else:
                _metadata = []
        else:
            _index = faiss.IndexFlatL2(EMBEDDING_DIM)
            _metadata = []

def _save_db():
    global _index, _metadata
    faiss.write_index(_index, INDEX_FILE)
    with open(META_FILE, 'w') as f:
        json.dump(_metadata, f)

def add_to_vector_db(user_id, text, embedding=None):
    """
    Convert text to an embedding and add it to the FAISS index.
    Saves the text and user_id to disk so it survives restarts.
    """
    _init_db()
    
    if embedding is None:
        embedding = get_embedding(text)
        
    # FAISS expects a 2D numpy array of float32
    vec = np.array([embedding], dtype=np.float32)
    _index.add(vec)
    
    _metadata.append({
        "user_id": str(user_id),
        "text": text
    })
    
    _save_db()

def search_vector_db(user_id, text=None, embedding=None, k=3):
    """
    Search the FAISS index for the k nearest matches to the given text.
    Filters by user_id to ensure security.
    """
    _init_db()
    
    if _index.ntotal == 0:
        return []
        
    if embedding is None and text is not None:
        embedding = get_embedding(text)
        
    if embedding is None:
        return []

    vec = np.array([embedding], dtype=np.float32)
    
    # Search for more than k to account for filtering by user_id
    search_k = min(k * 5, _index.ntotal)
    distances, indices = _index.search(vec, search_k)
    
    results = []
    for i, idx in enumerate(indices[0]):
        if idx != -1:
            meta = _metadata[idx]
            # Ensure we only return data belonging to the requesting user
            if meta["user_id"] == str(user_id):
                results.append({
                    "text": meta["text"],
                    "distance": float(distances[0][i])
                })
                if len(results) == k:
                    break
                    
    return results