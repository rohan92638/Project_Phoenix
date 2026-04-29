"""
vector_store.py
===============
Stub file — FAISS vector store is NOT used in the current pipeline.
Kept for future upgrade (when you want semantic memory search).
Do NOT import faiss here — it is not installed.
"""


def add_to_vector_db(user_id, text, embedding):
    """Placeholder — no-op until FAISS is installed."""
    pass


def search_vector_db(user_id, embedding, k=3):
    """Placeholder — returns empty list until FAISS is installed."""
    return []