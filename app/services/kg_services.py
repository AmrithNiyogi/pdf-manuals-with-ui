import asyncio
import json
import re
from pymongo import MongoClient
from neo4j import AsyncGraphDatabase
from pydantic import ValidationError
from app.utils.pdf_utils import extract_text_from_pdf
from app.models.triple_model import Triple
from app.configs.settings import settings
from app.utils.langfuse_utils import get_prompt
from app.utils.llm_utils import get_response
import aiohttp
from app.utils.logging_utils import setup_logger
from app.models.pdfPopulatorModel import Document
from app.repository.mongodb_utils import insert_document
from app.utils.preprocessing_utils import to_camel_case
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Any, List, Dict

logger = setup_logger(__name__)


client = AsyncIOMotorClient(settings.MONGODB_URI)
pdf_text_collection = client["pdf_texts"]


async def create_vector_index_if_not_exists(
    node_label: str,
    index_name: str,
    dims: int = 1536
):
    url = f"{settings.NEO4J_URL}/db/{settings.NEO4J_DB}/tx/commit"
    headers = {"Content-Type": "application/json"}

    check_query = {
        "statements": [{
            "statement": "SHOW INDEXES YIELD name WHERE name = $index_name RETURN count(*) as count",
            "parameters": {"index_name": index_name}
        }]
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(
            url, json=check_query, headers=headers,
            auth=aiohttp.BasicAuth(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        ) as response:
            result = await response.json()
            count = result.get("results", [{}])[0].get("data", [{}])[0].get("row", [0])[0]
            if count == 0:
                logger.info(f"[Neo4j] Index '{index_name}' not found. Creating new index.")
                create_query = {
                    "statements": [{
                        "statement": f"""
                            CREATE VECTOR INDEX {index_name} FOR (n:{node_label})
                            ON (n.embedding)
                            OPTIONS {{indexConfig: {{
                                `vector.dimensions`: $dims,
                                `vector.similarity_function`: 'cosine'
                            }}}}
                        """,
                        "parameters": {"dims": dims}
                    }]
                }
                async with session.post(
                    url, json=create_query, headers=headers,
                    auth=aiohttp.BasicAuth(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
                ) as index_response:
                    if index_response.status == 200:
                        logger.info(f"[Neo4j] Created vector index: {index_name}")
                    else:
                        err = await index_response.text()
                        raise RuntimeError(f"Failed to create vector index: {err}")

def unwrap_data(obj: Any) -> Any:
    if hasattr(obj, "data"):
        return unwrap_data(obj.data)
    elif isinstance(obj, dict):
        return {k: unwrap_data(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [unwrap_data(v) for v in obj]
    else:
        return obj
    



async def push_triples(
    node_label: str,
    brand: str,
    product: str,
    model: str,
    chunk_id: str,
    text: str,
    embedding: list
):
    url = f"{settings.NEO4J_URL}/db/{settings.NEO4J_DB}/tx/commit"
    headers = {"Content-Type": "application/json"}

    cypher = f"""
        MERGE (b:Brand {{name: $brand}})
        MERGE (b)-[:HAS_PRODUCT]->(p:Product {{name: $product, model: $model, brand: $brand}})
        MERGE (p)-[:HAS_CHUNK]->(c:{node_label} {{id: $chunk_id}})
        SET c.text = $text, c.embedding = $embedding
        RETURN b, p, c
    """

    statements = [{
        "statement": cypher,
        "parameters": {
            "brand": brand,
            "product": product,
            "model": model,
            "chunk_id": chunk_id,
            "text": text,
            "embedding": embedding
        }
    }]

    async with aiohttp.ClientSession() as session:
        async with session.post(
            url, json={"statements": statements}, headers=headers,
            auth=aiohttp.BasicAuth(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        ) as response:
            if response.status != 200:
                err = await response.text()
                raise RuntimeError(f"Neo4j error {response.status}: {err}")
            logger.info(f"[Neo4j] Pushed chunk {chunk_id} for product '{product}' under brand '{brand}'")

async def extract_triples(text: str) -> list[Triple]:
    loop = asyncio.get_running_loop()

    def _run():
        logger.info("[LLM] Generating prompt...")
        prompt = get_prompt("PDFIngestionPrompt", variables={"text": text})
        logger.info("[LLM] Getting response from LLM...")
        response = get_response(prompt)
        return response

    response = await loop.run_in_executor(None, _run)

    try:
        content = response
        logger.info("[LLM] Raw content received from LLM.")

        if content.startswith("```json"):
            content = content[7:].strip("` \n")

        parsed = json.loads(content)
        if not isinstance(parsed, list):
            raise ValueError("Expected list of triples")

        triples = []
        for item in parsed:
            try:
                triple = Triple(**item)
                triples.append(triple)
            except ValidationError as e:
                logger.warning(f"[ParseError] Skipping invalid triple: {item} | Error: {e}")

        logger.info(f"[LLM] Extracted {len(triples)} valid triples.")
        return triples

    except Exception as e:
        logger.error(f"[LLM] Failed to parse LLM response: {e}")
        return []



async def build_embeddings(
    embeddings_input: List[Dict[str, Any]],
    node_label: str,
    index_name: str,
    vector_dim: int = 1536
) -> List[List[float]]:
    try:
        data = unwrap_data(embeddings_input)
        embedding_list = data.get("embeddings", []) if isinstance(data, dict) else data

        if not isinstance(embedding_list, list):
            raise ValueError("'embeddings' must be a list.")

        await create_vector_index_if_not_exists(
            node_label=node_label,
            index_name=index_name,
            dims=vector_dim
        )

        results = []
        for i, item in enumerate(embedding_list):
            text = item.get("text", "")
            embedding = item.get("embedding", [])
            chunk_id = f"embed_{i}"
            brand = node_label
            product = item.get("Name") or item.get("product_name") or item.get("Product") or "UnknownProduct"
            model = item.get("Model") or item.get("model_number", "")

            if not isinstance(text, str) or not isinstance(embedding, list):
                continue

            await push_triples(
                node_label=node_label,
                brand=brand,
                product=product,
                model=model,
                chunk_id=chunk_id,
                text=text,
                embedding=embedding
            )
            results.append(embedding)

        return results

    except Exception as e:
        logger.exception(f"[build_embeddings] Failed to build and push embeddings: {e}")
        raise


async def run_kg_population_pipeline(pdf_path, doc_id, filename) -> list[Triple]:
    loop = asyncio.get_running_loop()

    logger.info(f"[Pipeline] Extracting text from PDF: {pdf_path}")
    text = await loop.run_in_executor(None, extract_text_from_pdf, pdf_path)

    logger.info(f"[Pipeline] Storing extracted text in MongoDB for document ID: {doc_id}")
    model = Document(
        document_id=doc_id, 
        text=text
        )
    await insert_document(pdf_text_collection, model)


    if not text.strip():
        logger.warning("[Pipeline] No text extracted from PDF. Aborting.")
        return []

    logger.info("[Pipeline] Extracting triples from text...")
    triples = await extract_triples(text)

    if not triples:
        logger.warning("[Pipeline] No triples extracted. Aborting.")
        return []

    logger.info("[Pipeline] Pushing triples to Neo4j...")
    await push_triples(triples, filename)

    logger.info("[Pipeline] KG population completed successfully.")
    return triples