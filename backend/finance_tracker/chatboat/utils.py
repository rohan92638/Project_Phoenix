import google.generativeai as genai
from django.conf import settings

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


def generate_embedding(text):
    try:
        response = genai.embed_content(
            model="models/embedding-001",
            content=text
        )

        return response["embedding"]

    except Exception as e:
        print("Embedding Error:", e)
        return None