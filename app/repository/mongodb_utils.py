from typing import List, Optional, Dict, Any
from app.configs.connector_mongodb import MongoDBClient
from app.configs.settings import settings
from app.models.pdfPopulatorModel import Document
from bson import ObjectId

# Helper: Convert ObjectId to str
def _fix_id(document: Dict[str, Any]) -> Dict[str, Any]:
    if "_id" in document:
        document["_id"] = str(document["_id"])
    return document

# Create
async def insert_document(collection, document) -> str:
    doc_dict = document.dict()
    result = await collection.insert_one(doc_dict)
    return str(result.inserted_id)

# Read
async def get_document_by_id(collection, doc_id: str) -> Optional[Dict[str, Any]]:
    doc = await collection.find_one({"_id": ObjectId(doc_id)})
    return _fix_id(doc) if doc else None

# List
async def list_documents(collection, filter: dict = {}) -> List[Dict[str, Any]]:
    cursor = collection.find(filter)
    return [_fix_id(doc) async for doc in cursor]

# Update
async def update_document(collection, doc_id: str, update_data: dict) -> bool:
    result = await collection.update_one({"_id": ObjectId(doc_id)}, {"$set": update_data})
    return result.modified_count > 0

# Delete
async def delete_document(collection, doc_id: str) -> bool:
    result = await collection.delete_one({"_id": ObjectId(doc_id)})
    return result.deleted_count > 0
