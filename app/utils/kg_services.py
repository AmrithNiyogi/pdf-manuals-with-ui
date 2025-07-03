from ..utils.preprocessing import extract_text_from_pdf
from llama_index.vector_stores.redis import RedisVectorStore
from llama_index.core import VectorStoreIndex
from llama_index.core import Document
from langchain.graphs import Neo4jGraph
from pymongo import MongoClient
from ..models.triple_model import extract_triples
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document as LangChainDocument
from llama_index.core.settings import Settings
from llama_index.embeddings.azure_openai import AzureOpenAIEmbedding
from ..configs.settings import settings
from neo4j import GraphDatabase
import asyncio

client = MongoClient(settings.MONGODB_URI)
db = client[settings.MONGODB_DATABASE]
pdf_text_collection = db["pdf_texts"]


def store_vector_index(text, doc_id):
    Settings.embed_model = AzureOpenAIEmbedding(
        deployment_name=settings.AZURE_EMBEDDING_DEPLOYMENT_NAME,
        api_key=settings.LITE_LLM_KEY,
        azure_endpoint=settings.LITE_LLM_BASE_URL,
        api_version="2025-01-01"
    )

    # Step 1: Chunk the document
    raw_doc = LangChainDocument(page_content=text)
    splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=50)
    chunks = splitter.transform_documents([raw_doc])

    # Step 2: Convert to LlamaIndex Documents
    llama_docs = [Document(text=doc.page_content) for doc in chunks]

    # print(f"[store_vector_index] Total chunks = {len(llama_docs)}")
    # for i, doc in enumerate(llama_docs[:3]):
    #     print(f"Chunk {i}: {doc.text[:80]}...")

    # Step 3: Store chunks in Redis
    namespace = f"{settings.REDIS_NAMESPACE}:{doc_id}"
    vector_store = RedisVectorStore(redis_url=settings.REDIS_URL, namespace=f"{namespace}:doc")
    index = VectorStoreIndex.from_documents(llama_docs, vector_store=vector_store)

    return vector_store, llama_docs

async def get_all_chunks(redis_store, namespace: str):
    redis_client = redis_store.client
    results = []

    async for key, val in redis_client.hscan_iter(namespace):  # only `name` is required
        chunk = redis_store._deserialize_doc(val).text
        results.append(chunk)

    # print(f"[get_all_chunks] Found {len(results)} chunks.")
    return results

def push_triples(triples, label):
    import re
    safe_label = re.sub(r"[^a-zA-Z0-9_]", "_", label)

    driver = GraphDatabase.driver(
        settings.NEO4J_URL,
        auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD)
    )

    cypher_template = f"""
    MERGE (a:{safe_label}:Entity {{name: $subj}})
    MERGE (b:{safe_label}:Entity {{name: $obj}})
    MERGE (a)-[:{{predicate}}]->(b)
    """

    with driver.session() as session:
        for triple in triples:
            subj, pred, obj = triple['subject'], triple['predicate'], triple['object']
            clean_pred = pred.upper().replace(" ", "_")
            cypher = cypher_template.replace("{predicate}", clean_pred)
            session.run(cypher, parameters={"subj": subj, "obj": obj})
            # print(f"[push_triples] {subj} -[{clean_pred}]-> {obj}")

    driver.close()


async def run_kg_population_pipeline(pdf_path, doc_id, filename):
    text = extract_text_from_pdf(pdf_path)
    # print(f"[run_kg_population_pipeline] Extracted text length = {len(text)}")
    pdf_text_collection.insert_one({"document_id": doc_id, "text": text})

    # Store in Redis and get back the processed chunks
    redis_store, llama_chunks = store_vector_index(text, doc_id)

    if not llama_chunks:
        # print("[DEBUG] No chunks created — skipping triple extraction")
        return []

    # Join all chunk texts
    joined_text = " ".join(doc.text for doc in llama_chunks)

    if not joined_text.strip():
        # print("[DEBUG] Combined chunk text is empty — aborting triple extraction")
        return []

    # print(f"[extract_triples] Extracting from {len(joined_text)} characters")
    triples = extract_triples(joined_text)

    # print(f"[run_kg_population_pipeline] Triples extracted: {len(triples)}")
    push_triples(triples, filename)