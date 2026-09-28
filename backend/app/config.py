import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root or backend folder
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    EXECUTION_TIMEOUT: int = int(os.getenv("EXECUTION_TIMEOUT", "5"))
    MAX_OUTPUT_SIZE: int = int(os.getenv("MAX_OUTPUT_SIZE", "65536"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./history.db")

settings = Settings()
