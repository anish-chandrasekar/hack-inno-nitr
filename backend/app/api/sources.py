from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SourceDocument
from app.schemas.requests import IngestRequest
from datetime import datetime, timezone

router = APIRouter(tags=["sources"])

@router.get("/sources")
def list_sources(db: Session = Depends(get_db)):
    sources = db.query(SourceDocument).order_by(SourceDocument.id.desc()).all()
    return [
        {
            "id": s.id,
            "source_type": s.source_type,
            "title": s.title,
            "sender": s.sender,
            "content": s.content,
            "received_at": str(s.received_at),
            "processing_status": s.processing_status,
            "extracted_data": s.extracted_data,
            "is_demo": s.is_demo
        } for s in sources
    ]

@router.post("/ingest")
def ingest_source(payload: IngestRequest, db: Session = Depends(get_db)):
    doc = SourceDocument(
        source_type=payload.source_type,
        title=payload.title or f"Ingested {payload.source_type.capitalize()}",
        sender=payload.sender or "external",
        content=payload.content,
        raw_content=payload.raw_content or payload.content,
        received_at=datetime.now(timezone.utc),
        processing_status="unprocessed",
        is_demo=False
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return {
        "id": doc.id,
        "source_type": doc.source_type,
        "title": doc.title,
        "sender": doc.sender,
        "content": doc.content,
        "received_at": str(doc.received_at),
        "processing_status": doc.processing_status,
        "is_demo": doc.is_demo
    }
