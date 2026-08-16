import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-change-me")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-only-change-me-too")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/fake_news_detection")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "fake_news_detection")
    CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if origin.strip()]
    MAX_ARTICLE_CHARS = int(os.getenv("MAX_ARTICLE_CHARS", "20000"))
    MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(5 * 1024 * 1024)))
    AI_PROVIDER = os.getenv("AI_PROVIDER", "stub")
    AI_API_URL = os.getenv("AI_API_URL", "")
    AI_API_KEY = os.getenv("AI_API_KEY", "")


class TestConfig(Config):
    TESTING = True
    JWT_SECRET_KEY = "test-jwt-secret"
    MONGO_URI = "mongodb://localhost:27017/fake_news_detection_test"
    AI_PROVIDER = "stub"
