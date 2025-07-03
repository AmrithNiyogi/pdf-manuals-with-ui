from app.utils.logging_utils import setup_logger
from app.utils.preprocessing_utils import preprocess_text
from langchain_community.document_loaders.pdf import PyPDFLoader

logger = setup_logger(__name__)

def extract_text_from_pdf(path) -> str:
    try:
        loader = PyPDFLoader(path)
        docs = loader.load()
        logger.info(f"[PDF Extractor] Loaded {len(docs)} pages from: {path}")

        raw_text = " ".join([doc.page_content for doc in docs])
        processed_text = preprocess_text(raw_text)
        logger.info(f"[PDF Extractor] Extracted and preprocessed text from: {path}")
        return processed_text

    except Exception as e:
        logger.exception(f"[PDF Extractor] Failed to extract text from PDF: {path}. Error: {e}")
        return ""
