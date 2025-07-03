from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.utils.logging_utils import setup_logger

logger = setup_logger(__name__)

class Document(BaseModel):
    url: str
    raw_text: str
    clean_text: str
    vector_id: Optional[str] = None
    timestamp: datetime = datetime.utcnow()