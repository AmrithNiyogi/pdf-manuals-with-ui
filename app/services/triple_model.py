import litellm
from langfuse import Langfuse
from ..configs.settings import settings
# from llama_index.llms.azure_openai import AzureOpenAI
from langchain_openai import AzureChatOpenAI
import json

def extract_triples(text):
    langfuse = Langfuse(
        host=settings.LANGFUSE_HOST,
        secret_key=settings.LANGFUSE_SECRET_KEY,
        public_key=settings.LANGFUSE_PUBLIC_KEY
    )

    result = langfuse.get_prompt("PDFIngestionPrompt")

    obj = {
        "text": text
    }

    prompt = result.compile(**obj)

    llm = AzureChatOpenAI(
    azure_deployment=settings.AZURE_DEPLOYMENT_NAME,
    api_version="2025-01-01-preview",
    temperature=0.7,
    azure_endpoint=settings.AZURE_OPENAI_API_BASE,
    api_key=settings.AZURE_OPENAI_API_KEY,
    )

    response = llm.invoke(prompt)
    
    # print(f"[extract_triples] {prompt}")
    # print(f"[extract_triples] {response}")
    # print("[extract_triples] Response object type:", type(response))
    # print("[extract_triples] Response dir():", dir(response))
    try:
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:].strip("` \n")  # Remove markdown wrapping if present
        triples = json.loads(content)
    except Exception as e:
        # print("[extract_triples] Error parsing triples:", e)
        # print("[extract_triples] Raw response:", response.content)
        return []

    return triples
