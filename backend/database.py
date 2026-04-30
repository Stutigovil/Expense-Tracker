"""
Database configuration and session management.
"""
import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load local .env when present for local development.
# In production on Railway, DATABASE_URL should already be set by the environment.
env_path = Path(__file__).resolve().parent / ".env"
try:
    from dotenv import load_dotenv

    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required and must point to a PostgreSQL database")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
sslmode = os.environ.get("DB_SSLMODE")
if sslmode:
    connect_args["sslmode"] = sslmode

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    connect_args=connect_args if connect_args else {},
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    """Dependency for FastAPI to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
