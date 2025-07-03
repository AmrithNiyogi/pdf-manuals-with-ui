from langfuse import Langfuse
from ..configs.connector_langfuse import LangFuseClient
from app.utils.logging_utils import setup_logger

logger = setup_logger(__name__)

client = None

def get_prompt(prompt_name: str, variables: dict, type: str = None) -> str:
    global client
    try:
        if client is None:
            logger.info("[LangFuse] Initializing LangFuse client...")
            client = LangFuseClient()

        logger.info(f"[LangFuse] Fetching prompt: {prompt_name}")
        prompt = client.get_prompt(prompt_name)
        
        compiled_prompt = prompt.compile(**variables)
        logger.debug(f"[LangFuse] Compiled prompt: {compiled_prompt[:100]}...")  # log first 100 chars
        
        return compiled_prompt

    except Exception as e:
        logger.error(f"[LangFuse] Error while getting or compiling prompt '{prompt_name}': {e}")
        raise
