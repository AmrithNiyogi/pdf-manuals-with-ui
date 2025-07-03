from fastapi import APIRouter, UploadFile, File
from ..services.kg_services import run_kg_population_pipeline
import tempfile
from pymongo import MongoClient
import base64
from neo4j import GraphDatabase
from redis import Redis
from ..configs.settings import settings

router = APIRouter()

client = MongoClient(settings.MONGODB_URI)
db = client[settings.MONGODB_DATABASE]
pdf_text_collection = db["pdf_texts"]

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # Save PDF content to MongoDB
    encoded_pdf = base64.b64encode(file.file.read()).decode("utf-8")
    pdf_doc = {
        "filename": file.filename,
        "content": encoded_pdf
    }
    pdf_id = pdf_text_collection.insert_one(pdf_doc).inserted_id

    # Write to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(base64.b64decode(encoded_pdf))
        tmp_path = tmp.name

    await run_kg_population_pipeline(tmp_path, str(pdf_id), file.filename)
    return {"status": "success", "detail": f"KG populated. PDF stored with id: {pdf_id}"}

@router.get("/")
def root():
    status = {}

    # Check MongoDB
    try:
        mongo_client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1000)
        mongo_client.server_info()
        status["mongodb"] = "🟢 running"
    except Exception:
        status["mongodb"] = "🔴 not reachable"

    # Check Redis
    try:
        r = Redis(
        host='localhost',
        port=6379,
        password='redis',  # 🔐 include the password from REDIS_URL
        socket_connect_timeout=1
        )
        r.ping()
        status["redis"] = "🟢 running"
    except Exception as e:
        status["redis"] = f"🔴 not reachable: {str(e)}"

    # Check Neo4j
    try:
        driver = GraphDatabase.driver(settings.NEO4J_URL, auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD))
        with driver.session() as session:
            session.run("RETURN 1")
        status["neo4j"] = "🟢 running"
    except Exception:
        status["neo4j"] = "🔴 not reachable"

    return {"message": "KG Population API Running", "services": status}