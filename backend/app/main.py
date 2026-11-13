from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db, SessionLocal
from app.seed.demo_data import seed_database

from app.api.dashboard import router as dashboard_router
from app.api.sponsors import router as sponsors_router
from app.api.sources import router as sources_router
from app.api.tasks import router as tasks_router
from app.api.investigations import router as investigations_router
from app.api.approvals import router as approvals_router
from app.api.executions import router as executions_router
from app.api.misc import router as misc_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB & demo seed data
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="SECOND BRAIN API",
    description="Context-Aware AI Event Operations and Decision Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routers under /api prefix
app.include_router(dashboard_router, prefix="/api")
app.include_router(sponsors_router, prefix="/api")
app.include_router(sources_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(investigations_router, prefix="/api")
app.include_router(approvals_router, prefix="/api")
app.include_router(executions_router, prefix="/api")
app.include_router(misc_router, prefix="/api")

@app.get("/")
def root():
    return {
        "project": "SECOND BRAIN",
        "tagline": "One change. Complete context. Intelligent execution.",
        "status": "online",
        "event": "INNOVISION 2026"
    }
