import json
from finance_tracker.ai_agent.memory.vector_store import search_vector_db

def search_financial_memory(user_id: int, query: str) -> str:
    """
    Search previous meaningful user context using FAISS.
    """
    try:
        results = search_vector_db(user_id, text=query, k=3)
        if not results:
            return json.dumps({"result": "No relevant memory found."})
        return json.dumps({"memories": results})
    except Exception as e:
        return json.dumps({"error": str(e)})

search_financial_memory_schema = {
    "type": "function",
    "function": {
        "name": "search_financial_memory",
        "description": "Search previous meaningful user context using semantic search.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "The search query (e.g. 'what is my savings goal?')"}
            },
            "required": ["query"]
        }
    }
}
