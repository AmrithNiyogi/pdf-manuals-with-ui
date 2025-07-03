import re
import nltk
from app.utils.logging_utils import setup_logger
import asyncio
import string
from urllib.parse import urlparse
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from langchain_community.document_loaders.pdf import PyPDFLoader
from app.models.triple_model import Triple

# Setup logger
logger = setup_logger(__name__)

# Ensure necessary downloads
nltk.download("punkt")
nltk.download("stopwords")

stop_words = set(stopwords.words("english"))


COMMON_TLDS_AND_SUBDOMAINS = {
    "www", "com", "org", "net", "in", "co", "io", "gov", "edu", "ac", "us",
    "uk", "de", "jp", "fr", "it", "ru", "nl", "br", "au", "ca", "cn", "info",
    "biz", "xyz", "me", "online", "site", "top", "tech", "app", "dev", "store",
    "ai", "digital", "services", "cloud", "global"
}


def preprocess_text(text) -> str:
    logger.info("[Preprocessing] Starting sentence and word tokenization")
    text = re.sub(r"\s+", " ", text)
    sentences = sent_tokenize(text)
    cleaned = []

    for sent in sentences:
        tokens = word_tokenize(sent)
        filtered = [w for w in tokens if w.isalnum()]
        cleaned.append(" ".join(filtered))

    result = "\n".join(cleaned)
    logger.info("[Preprocessing] Completed with %d cleaned sentences", len(cleaned))
    return result

async def clean_text(text: str) -> str:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _clean_text_sync, text)

def _clean_text_sync(text: str) -> str:
    logger.info("[Text Cleaner] Lowercasing and removing stopwords/punctuation")
    text = text.lower()
    tokens = word_tokenize(text)
    cleaned_tokens = [
        word for word in tokens
        if word not in stop_words and word not in string.punctuation
    ]
    result = " ".join(cleaned_tokens)
    logger.info("[Text Cleaner] Cleaned %d tokens", len(cleaned_tokens))
    return result

async def create_triple(triple: Triple, url: str, url_label: str) -> tuple[str, dict]:
    relation = _sanitize_label(triple.predicate)
    logger.info(f"[Neo4j] Creating triple: ({triple.subject})-[{relation}]->({triple.object}) [{url_label}]")

    query = f"""
    MERGE (s:Entity:`{url_label}` {{name: $subject}})
      ON CREATE SET s.source_url = $url
    MERGE (o:Entity:`{url_label}` {{name: $object}})
      ON CREATE SET o.source_url = $url
    MERGE (s)-[r:`{relation}`]->(o)
    """

    parameters = {
        "subject": triple.subject,
        "object": triple.object,
        "url": url
    }

    return query, parameters

def _sanitize_label(label: str) -> str:
    result = ''.join(c.upper() if c.isalnum() else '_' for c in label)
    logger.debug(f"[Sanitize Label] Input: {label}, Sanitized: {result}")
    return result

def sanitize_label_url(url: str) -> str:
    parsed = urlparse(url)

    domain_parts = parsed.hostname.split(".")
    domain_core = [part for part in domain_parts if part not in COMMON_TLDS_AND_SUBDOMAINS]
    domain_label = "_".join(domain_core).upper()

    path_parts = parsed.path.strip("/").split("/")
    path_label = "_".join(part.replace("-", "_").replace(".", "_") for part in path_parts if part)

    full_label = f"{domain_label}_{path_label}" if path_label else domain_label
    label = ''.join(c for c in full_label if c.isalnum() or c == '_')

    camel_label = to_camel_case(label)

    logger.info(f"[Sanitize URL] Parsed label: {camel_label} from URL: {url}")
    return camel_label

def to_camel_case(s) -> str:
    parts = re.sub(r"[^a-zA-Z0-9_]", "_", s).split("_")
    return parts[0].lower() + ''.join(word.capitalize() for word in parts[1:] if word)
