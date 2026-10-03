from finance_tracker.ai_agent.providers.ollama_client import generate_ollama_response

class ModelRouter:
    @staticmethod
    def generate_response(messages: list, tools: list = None) -> dict:
        return generate_ollama_response(messages, tools)
