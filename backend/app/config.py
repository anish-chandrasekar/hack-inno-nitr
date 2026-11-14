from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    gemini_api_key: str = ""
    database_url: str = "sqlite:///./utsaviq.db"
    environment: str = "demo"
    
    model_config = {"env_file": ".env", "extra": "ignore"}

@lru_cache()
def get_settings() -> Settings:
    return Settings()
