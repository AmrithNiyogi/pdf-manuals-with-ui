from dotenv import load_dotenv

import os

load_dotenv()

class Settings():

    # Common Variables
    NEO4J_DB=os.getenv("NEO4J_DATABASE")
    NEO4J_URL=os.getenv("NEO4J_URI")
    NEO4J_USERNAME=os.getenv("NEO4J_USERNAME")
    NEO4J_PASSWORD=os.getenv("NEO4J_PASSWORD")

    AZURE_OPENAI_API_KEY=os.getenv('AZURE_OPENAI_API_KEY')
    AZURE_OPENAI_API_BASE=os.getenv('AZURE_OPENAI_API_BASE')
    AZURE_DEPLOYMENT_NAME=os.getenv("AZURE_DEPLOYMENT_NAME")
    
    LITE_LLM_KEY=os.getenv('AZURE_OPENAI_API_KEY')
    LITE_LLM_BASE_URL=os.getenv('AZURE_OPENAI_API_BASE')
    AZURE_EMBEDDING_DEPLOYMENT_NAME=os.getenv("AZURE_EMBEDDING_DEPLOYMENT_NAME")
    
    # LangFuse
    LANGFUSE_PUBLIC_KEY=os.getenv("LANGFUSE_PUBLIC_KEY")
    LANGFUSE_SECRET_KEY=os.getenv("LANGFUSE_SECRET_KEY")
    LANGFUSE_HOST=os.getenv("LANGFUSE_HOST")

    REDIS_URL=os.getenv("REDIS_URL")
    REDIS_NAMESPACE=os.getenv("REDIS_NAMESPACE")

    MONGODB_DATABASE=os.getenv("MONGODB_DATABASE")
    MONGODB_URI=os.getenv("MONGODB_URI")


# Initialize settings
settings = Settings()