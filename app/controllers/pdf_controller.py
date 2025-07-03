import base64
import tempfile
import logging
import aiofiles
import aiohttp
import motor.motor_asyncio
import redis.asyncio as aioredis
from bson import ObjectId
from fastapi import APIRouter, UploadFile, File
from app.utils.logging_utils import setup_logger
from app.services.kg_services import run_kg_population_pipeline
from app.configs.settings import settings
from fastapi.responses import JSONResponse
from typing import Dict, Any

logger = setup_logger(__name__)

router = APIRouter()

# Async MongoDB client
mongo_client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URI)
db = mongo_client[settings.MONGODB_DATABASE]
pdf_text_collection = db["pdf_texts"]

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)) -> Dict[str, Any]:
    logger.info(f"[Upload] Received file: {file.filename}")
    try:
        file_content = await file.read()
        encoded_pdf = base64.b64encode(file_content).decode("utf-8")

        pdf_doc = {
            "filename": file.filename,
            "content": encoded_pdf
        }
        result = await pdf_text_collection.insert_one(pdf_doc)
        pdf_id = result.inserted_id
        logger.info(f"[Upload] Stored PDF in MongoDB with ID: {pdf_id}")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp_path = tmp.name

        async with aiofiles.open(tmp_path, "wb") as out_file:
            await out_file.write(base64.b64decode(encoded_pdf))
        logger.info(f"[Upload] Temporary file written: {tmp_path}")

        await run_kg_population_pipeline(tmp_path, str(pdf_id), file.filename)
        logger.info(f"[Upload] KG pipeline completed for file: {file.filename}")

        return {
            "status": "success",
            "detail": f"KG populated. PDF stored with id: {pdf_id}"
        }
    except Exception as e:
        logger.error(f"[Upload] Failed to process file: {e}")
        return {
            "status": "error",
            "detail": f"Failed to process file: {str(e)}"
        }

@router.get("/pdf-health")
async def db_health() -> Dict[str, Any]:
    status = {}
    logger.info("[HealthCheck] Starting service checks...")

    # MongoDB check
    try:
        await mongo_client.server_info()
        status["mongodb"] = "🟢 running"
        logger.info("[HealthCheck] MongoDB is reachable.")
    except Exception as e:
        status["mongodb"] = "🔴 not reachable"
        logger.error(f"[HealthCheck] MongoDB error: {e}")

    # Neo4j check
    try:
        URI = f"{settings.NEO4J_URL}/db/{settings.NEO4J_DATABASE}/tx/commit"
        auth_str = f"{settings.NEO4J_USERNAME}:{settings.NEO4J_PASSWORD}"
        encoded_auth = base64.b64encode(auth_str.encode()).decode()
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {encoded_auth}"
        }
        payload = {
            "statements": [{"statement": "RETURN 1"}]
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(URI, headers=headers, json=payload) as resp:
                if resp.status == 200:
                    json_resp = await resp.json()
                    if json_resp.get("results"):
                        status["neo4j"] = "🟢 running"
                        logger.info("[HealthCheck] Neo4j is reachable.")
                    else:
                        status["neo4j"] = "🟠 no results"
                        logger.warning("[HealthCheck] Neo4j responded but returned no results.")
                else:
                    status["neo4j"] = f"🔴 HTTP {resp.status}"
                    logger.error(f"[HealthCheck] Neo4j HTTP error: {resp.status}")
    except Exception as e:
        status["neo4j"] = f"🔴 error: {str(e)}"
        logger.error(f"[HealthCheck] Neo4j error: {e}")

    logger.info("[HealthCheck] Completed.")
    return {
        "message": "KG Population API Running",
        "services": status
    }
