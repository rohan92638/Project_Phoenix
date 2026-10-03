import requests
import json
import logging
from decouple import config

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = config("OLLAMA_BASE_URL", default="http://localhost:11434")
OLLAMA_MODEL = config("OLLAMA_MODEL", default="qwen2.5:3b")
OLLAMA_EMBEDDING_MODEL = config("OLLAMA_EMBEDDING_MODEL", default="nomic-embed-text")
TIMEOUT = int(config("OLLAMA_TIMEOUT", default=60))

def generate_ollama_response(messages: list, tools: list = None) -> dict:
    """
    Send messages and tools to Ollama.
    """
    payload = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.3
        }
    }
    
    if tools:
        payload["tools"] = tools

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json=payload,
            timeout=TIMEOUT
        )
        if response.status_code == 404:
            return {"error": "Model not found."}
            
        response.raise_for_status()
        data = response.json()
        
        return data.get("message", {})

    except Exception as e:
        logger.error(f"Ollama connection error: {e}")
        return {"error": str(e)}

def get_ollama_embedding(text: str) -> list[float]:
    """
    Generate a vector embedding using Ollama.
    """
    payload = {
        "model": OLLAMA_EMBEDDING_MODEL,
        "prompt": text
    }
    
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/embeddings",
            json=payload,
            timeout=TIMEOUT
        )
        response.raise_for_status()
        data = response.json()
        return data.get("embedding")
    except Exception as e:
        logger.error(f"Failed to generate Ollama embedding: {e}")
        return None
