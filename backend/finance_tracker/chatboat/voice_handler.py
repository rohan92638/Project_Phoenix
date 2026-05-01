"""
voice_handler.py
================
Handles voice INPUT and voice OUTPUT for the AI chatbot.

Voice Input  → Accepts raw audio bytes (WebM/WAV) → transcribes to text via
               Google Speech Recognition (SpeechRecognition library).

Voice Output → Accepts AI reply text → converts to MP3 audio via gTTS →
               returns as base64-encoded string ready for the browser to play.

Usage:
    from .voice_handler import transcribe_audio, text_to_speech_base64
"""

import io
import base64
import speech_recognition as sr
from gtts import gTTS


# ─────────────────────────────────────────────────────────
# VOICE INPUT — Audio bytes → Text transcript
# ─────────────────────────────────────────────────────────

def transcribe_audio(audio_bytes: bytes, content_type: str = "audio/webm") -> str:
    """
    Convert raw audio bytes (from the browser's MediaRecorder API) into text.

    Args:
        audio_bytes  : raw audio file content (WebM, WAV, etc.)
        content_type : MIME type of the uploaded audio (default: audio/webm)

    Returns:
        str: Transcribed text string, or empty string on failure.
    """
    recognizer = sr.Recognizer()

    try:
        # Wrap bytes in a file-like object
        audio_file = io.BytesIO(audio_bytes)

        with sr.AudioFile(audio_file) as source:
            # Adjust for ambient noise for better accuracy
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio_data = recognizer.record(source)

        # Use Google's free Speech Recognition API (no API key needed)
        transcript = recognizer.recognize_google(audio_data, language="en-IN")
        return transcript.strip()

    except sr.UnknownValueError:
        # Audio was too unclear to understand
        return ""
    except sr.RequestError as e:
        print(f"[VoiceHandler] Speech recognition request failed: {e}")
        return ""
    except Exception as e:
        print(f"[VoiceHandler] Transcription error: {e}")
        return ""


# ─────────────────────────────────────────────────────────
# VOICE OUTPUT — AI text reply → Base64 MP3 audio
# ─────────────────────────────────────────────────────────

def text_to_speech_base64(text: str, lang: str = "en", slow: bool = False) -> str:
    """
    Convert an AI text reply into a base64-encoded MP3 audio string.
    The frontend can use this to play audio directly in the browser:
        new Audio("data:audio/mp3;base64," + base64_string).play()

    Args:
        text  : The AI reply text to speak
        lang  : Language code (default: "en")
        slow  : Whether to speak slowly (default: False)

    Returns:
        str: Base64-encoded MP3 string, or empty string on failure.
    """
    try:
        # Sanitize: remove markdown formatting before speaking
        clean_text = _strip_markdown(text)

        if not clean_text.strip():
            return ""

        # Generate speech using gTTS
        tts = gTTS(text=clean_text, lang=lang, slow=slow)

        # Write to an in-memory buffer (no disk I/O needed)
        mp3_buffer = io.BytesIO()
        tts.write_to_fp(mp3_buffer)
        mp3_buffer.seek(0)

        # Encode the MP3 bytes to base64
        mp3_base64 = base64.b64encode(mp3_buffer.read()).decode("utf-8")
        return mp3_base64

    except Exception as e:
        print(f"[VoiceHandler] TTS error: {e}")
        return ""


# ─────────────────────────────────────────────────────────
# HELPER — Strip Markdown formatting for cleaner TTS
# ─────────────────────────────────────────────────────────

def _strip_markdown(text: str) -> str:
    """
    Remove common markdown symbols so they are not spoken aloud.
    e.g. "**Total:** ₹5,000" → "Total: ₹5,000"
    """
    import re
    # Remove bold/italic markers
    text = re.sub(r'\*{1,3}', '', text)
    # Remove headers (#, ##, ###)
    text = re.sub(r'#+\s?', '', text)
    # Remove inline code backticks
    text = re.sub(r'`+', '', text)
    # Remove bullet points (-, *, •)
    text = re.sub(r'^\s*[-•*]\s+', '', text, flags=re.MULTILINE)
    # Remove excess whitespace
    text = re.sub(r'\n{2,}', '. ', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()
