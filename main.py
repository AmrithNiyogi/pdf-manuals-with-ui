from app.controllers.pdf_controller import router as pdf_router
from app.controllers.query_controller import router as query_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

env_file = os.getenv("ENV_FILE", ".env")  
load_dotenv(env_file)

app = FastAPI(
        title="AI Studio Assistant",
        version="0.1.0",
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(pdf_router, prefix="/v1/pdf", tags=["Ingestion-APIs"])
app.include_router(query_router, prefix="/v1/query", tags=["Query-APIs"])