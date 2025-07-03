import openai
import anthropic
import google.generativeai as genai
from app.utils.logging_utils import setup_logger
from .settings import settings

logger = setup_logger(__name__)

class LLMClient:
    _client = None

    def __new__(cls):
        if cls._client is None:
            logger.info("Initializing LiteLLM client...")
            try:
                cls._client = openai.OpenAI(
                    api_key=settings.LITELLM_API_KEY,
                    base_url=settings.LITELLM_API_BASE
                )
                logger.info("LLM client initialized successfully.")
            except Exception as e:
                logger.exception(f"Failed to initialize LLM client: {e}")
                raise
        return cls._client

class AnthropicLLMClient:
    _client = None

    def __new__(cls):
        if cls._client is None:
            logger.info("Initializing Anthropic LLM client...")
            try:
                cls._client = anthropic.Anthropic(
                    api_key=settings.LITELLM_API_KEY
                )
                logger.info("Anthropic LLM client initialized successfully.")
            except Exception as e:
                logger.exception(f"Failed to initialize Anthropic LLM client: {e}")
                raise
        return cls._client
    
class GeminiLLMClient:
    _client = None

    def __new__(cls):
        if cls._client is None:
            logger.info("Initializing Gemini (Google Generative AI) client...")
            try:
                genai.configure(api_key=settings.GOOGLE_API_KEY)
                cls._client = genai.GenerativeModel(model_name="gemini-pro")
                logger.info("Gemini client initialized successfully.")
            except Exception as e:
                logger.exception(f"Failed to initialize Gemini client: {e}")
                raise
        return cls._client
    
def get_llm_client():
    return LLMClient()

def get_anthropic_client():
    return AnthropicLLMClient()

def get_gemini_client():
    return GeminiLLMClient()