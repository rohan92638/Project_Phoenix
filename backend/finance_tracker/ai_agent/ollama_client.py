import requests
import json
import logging
from decouple import config

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = config("OLLAMA_BASE_URL", default="http://localhost:11434")
OLLAMA_MODEL = config("OLLAMA_MODEL", default="qwen2.5:3b")
OLLAMA_EMBEDDING_MODEL = config("OLLAMA_EMBEDDING_MODEL", default="nomic-embed-text")
TIMEOUT = int(config("OLLAMA_TIMEOUT", default=30))

def generate_ollama_response(prompt: str, history: list = None) -> str:
    """
    Send a prompt to local Ollama and return the response text.
    Handles connection errors, missing models, etc.
    """
    messages = []
    
    # Optional: Reconstruct history if provided in Gemini format
    if history:
        for msg in history[-10:]:
            role = "user" if msg.get("role") == "user" else "assistant"
            parts = msg.get("parts", [])
            text = parts[0].get("text", "") if hasattr(parts[0], "get") else parts[0]
            if not isinstance(text, str):
                text = str(text)
            messages.append({"role": role, "content": text})
            
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False
    }
    
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json=payload,
            timeout=TIMEOUT
        )
        
        # Handle 404 (model not found)
        if response.status_code == 404:
            return "The configured Ollama model is not available."
            
        response.raise_for_status()
        data = response.json()
        
        reply = data.get("message", {}).get("content", "").strip()
        if not reply:
            return "The AI assistant returned an empty response."
            
        return reply

    except requests.exceptions.ConnectionError:
        logger.error("Ollama connection error. Is it running?")
        return "AI Assistant is currently unavailable. Please start Ollama."
    except requests.exceptions.Timeout:
        logger.error("Ollama request timed out.")
        return "The AI request timed out. Please try again."
    except Exception as e:
        logger.error(f"Ollama unexpected error: {e}")
        return "Something went wrong while generating the response."


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
