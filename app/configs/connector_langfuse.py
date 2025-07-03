from app.utils.logging_utils import setup_logger
from langfuse import Langfuse
from .settings import settings

logger = setup_logger(__name__)
class LangFuseClient:
    _client = None

    def __new__(cls):
        if cls._client is None:
            logger.info("Initializing Langfuse client...")
            try:
                cls._client = Langfuse(
                    secret_key=settings.LANGFUSE_SECRET_KEY,
                    public_key=settings.LANGFUSE_PUBLIC_KEY,
                    host=settings.LANGFUSE_HOST
                )
                logger.info("Langfuse client initialized successfully.")
            except Exception as e:
                logger.exception(f"Failed to initialize Langfuse client: {e}")
                raise
        return cls._client

def get_langfuse_client():
    return LangFuseClient()
