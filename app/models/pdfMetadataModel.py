from pydantic import BaseModel

class PDFMetadata(BaseModel):
    title: str
    category: str
    product_type: str
    brand: str
    file_size: str
    file_url: str # S3 bucket url
    date_added: str

