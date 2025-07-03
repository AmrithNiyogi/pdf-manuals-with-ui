from motor.motor_asyncio import AsyncIOMotorClient
from app.configs.settings import settings

class MongoDBClient:
    _client: AsyncIOMotorClient = None

    @classmethod
    def get_client(cls) -> AsyncIOMotorClient:
        if cls._client is None:
            cls._client = AsyncIOMotorClient(settings.MONGODB_URI)
            print("[MongoDB] Connected")
        return cls._client
