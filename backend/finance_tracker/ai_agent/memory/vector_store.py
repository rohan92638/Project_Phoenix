"""
vector_store.py (Improved)
=========================
FAISS vector store for semantic memory (RAG-ready).
Supports:
- Add memory
- Search memory
- Context formatting for LLM
"""

import faiss
import numpy as np
import os
import json
from django.conf import settings
from decouple import config

AI_PROVIDER = config("AI_PROVIDER", default="ollama")

if AI_PROVIDER == "gemini":
    from finance_tracker.ai_agent.gemini_client import get_embedding
else:
    from finance_tracker.ai_agent.providers.ollama_client import get_ollama_embedding as get_embedding

BASE_DIR = settings.BASE_DIR
INDEX_FILE = os.path.join(BASE_DIR, "faiss_index.bin")
META_FILE = os.path.join(BASE_DIR, "faiss_meta.json")

_index = None
_metadata = []


# ─────────────────────────────────────────────────────────
# INIT DB
# ─────────────────────────────────────────────────────────
def _init_db(dim=None):
    global _index, _metadata

    if _index is None:
        if os.path.exists(INDEX_FILE):
            _index = faiss.read_index(INDEX_FILE)
            
            # Dimension mismatch, reset DB
            if dim and _index.d != dim:
                print(f"[FAISS] Dimension mismatch! Expected {dim}, found {_index.d}. Recreating FAISS index...")
                _index = faiss.IndexFlatL2(dim)
                _metadata = []
                _save_db()
            else:
                if os.path.exists(META_FILE):
                    with open(META_FILE, "r") as f:
                        _metadata = json.load(f)
                else:
                    _metadata = []
        else:
            if dim is None:
                dim = 3072 # fallback
            # L2 distance index
            _index = faiss.IndexFlatL2(dim)
            _metadata = []


# ─────────────────────────────────────────────────────────
# SAVE DB
# ─────────────────────────────────────────────────────────
def _save_db():
    faiss.write_index(_index, INDEX_FILE)

    with open(META_FILE, "w") as f:
        json.dump(_metadata, f)


# ─────────────────────────────────────────────────────────
# ADD MEMORY
# ─────────────────────────────────────────────────────────
def add_to_vector_db(user_id, text, embedding=None):
    """
    Store conversation into vector DB
    """

    if embedding is None:
        embedding = get_embedding(text)

    if embedding is None:
        return  # fail silently

    dim = len(embedding)
    _init_db(dim)

    vec = np.array([embedding], dtype=np.float32)

    _index.add(vec)

    _metadata.append({
        "user_id": str(user_id),
        "text": text
    })

    _save_db()


# ─────────────────────────────────────────────────────────
# SEARCH MEMORY (CORE RAG FUNCTION)
# ─────────────────────────────────────────────────────────
def search_vector_db(user_id, text=None, embedding=None, k=3):
    """
    Retrieve similar past conversations
    """

    if embedding is None and text:
        embedding = get_embedding(text)

    if embedding is None:
        return []

    dim = len(embedding)
    _init_db(dim)

    if _index.ntotal == 0:
        return []

    vec = np.array([embedding], dtype=np.float32)

    search_k = min(k * 5, _index.ntotal)

    distances, indices = _index.search(vec, search_k)

    results = []

    for i, idx in enumerate(indices[0]):
        if idx == -1:
            continue

        meta = _metadata[idx]

        # 🔐 User isolation
        if meta["user_id"] != str(user_id):
            continue

        results.append({
            "text": meta["text"],
            "distance": float(distances[0][i])
        })

        if len(results) >= k:
            break

    return results


# ─────────────────────────────────────────────────────────
# FORMAT MEMORY FOR PROMPT (NEW)
# ─────────────────────────────────────────────────────────
def get_memory_context(user_id, query, k=3):
    """
    Convert retrieved memory into readable prompt format
    """

    results = search_vector_db(user_id, text=query, k=k)

    if not results:
        return "No relevant past memory."

    lines = ["[RELEVANT PAST MEMORY]"]

    for item in results:
        lines.append(f"- {item['text']}")

    return "\n".join(lines)