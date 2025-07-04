from openai import OpenAI
from fastapi import HTTPException
import openai
import json
from app.utils.logging_utils import setup_logger
from ..configs.connector_llm import get_llm_client
from typing import List

logger = setup_logger(__name__)

client = None

def get_response(prompts: list[dict], model_name: str = 'sangria_reasoning', tags: list[str] = None) -> str:
    global client
    if client is None:
        logger.info("[LLM] Initializing OpenAI client...")
        client = get_llm_client()

    try:
        metadata = {"tags": tags if tags else ["ai-studio"]}

        if isinstance(prompts, str):
            prompts = [{"role": "user", "content": prompts}]
        elif isinstance(prompts, list):
            prompts = prompts

        logger.info(f"[LLM] Sending prompt to model: {model_name}")
        logger.debug(f"[LLM] Prompt content: {json.dumps(prompts, indent=2)[:500]}...")

        resp = client.chat.completions.create(
            model=model_name,
            messages=prompts,
            metadata=metadata
        )

        if not resp.choices or not resp.choices[0].message:
            logger.error("[LLM] No valid message returned from the model.")
            raise ValueError("Invalid response from LLM")

        content = resp.choices[0].message.content
        logger.info("[LLM] Received response from model.")
        logger.debug(f"[LLM] Response content: {content[:500]}...")

        return content

    except Exception as e:
        logger.exception(f"[LLM] Error while calling model '{model_name}': {e}")
        raise HTTPException(status_code=500, detail=f"LLM API Error: {str(e)}")


async def get_embedding(text, model_name: str = "sangria_embedding") -> List[float]:
    global client
    if client is None:
        logger.info("[Embedding] Initializing OpenAI client...")
        client = get_llm_client()

    try:
        logger.info(f"[Embedding] Generating embedding for input text (length: {len(text)}) with model '{model_name}'")
        embedding = client.embeddings.create(
            model=model_name,
            input=text,
            encoding_format="float",
        )
        logger.info("[Embedding] Successfully received embedding.")
        return embedding.data[0].embedding

    except Exception as e:
        logger.exception(f"[Embedding] Error while generating embedding: {e}")
        raise HTTPException(status_code=500, detail=f"Embedding API Error: {str(e)}")
