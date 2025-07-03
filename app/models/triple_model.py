from pydantic import BaseModel

class Triple(BaseModel):
    subject: str
    predicate: str
    object: str

