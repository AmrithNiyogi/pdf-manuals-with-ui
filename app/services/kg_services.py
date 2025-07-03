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

logger = setup_logger(__name__)


client = AsyncIOMotorClient(settings.MONGODB_URI)
pdf_text_collection = client["pdf_texts"]

async def push_triples(triples, label) -> None:
    safe_label = to_camel_case(label)

    url = f"{settings.NEO4J_URL}/db/{settings.NEO4J_DATABASE}/tx/commit"
    statements = []

    for i, triple in enumerate(triples):
        subj, pred, obj = triple.subject, triple.predicate, triple.object
        clean_pred = pred.upper().replace(" ", "_")

        cypher = (
            f"MERGE (a:{safe_label}:Entity {{name: $subj}}) "
            f"MERGE (b:{safe_label}:Entity {{name: $obj}}) "
            f"MERGE (a)-[:{clean_pred}]->(b)"
        )

        statement = {
            "statement": cypher,
            "parameters": {"subj": subj, "obj": obj}
        }
        statements.append(statement)
        logger.info(f"[Neo4j] Prepared Cypher: ({subj}) -[{clean_pred}]-> ({obj})")

    payload = {"statements": statements}
    headers = {"Content-Type": "application/json"}

    async with aiohttp.ClientSession() as session:
        async with session.post(
            url,
            json=payload,
            headers=headers,
            auth=aiohttp.BasicAuth(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
        ) as response:
            if response.status != 200:
                text = await response.text()
                logger.error(f"[Neo4j] Error {response.status}: {text}")
                raise RuntimeError(f"[Neo4j] Error {response.status}: {text}")
            else:
                logger.info(f"[Neo4j] Successfully pushed {len(statements)} triples with label '{safe_label}'")

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