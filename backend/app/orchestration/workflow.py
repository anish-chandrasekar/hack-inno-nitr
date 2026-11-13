from sqlalchemy.orm import Session
from app.models import Investigation
from app.agents.coordinator import CoordinatorAgent

def run_investigation(db: Session, source_document_id: int) -> Investigation:
    return CoordinatorAgent.start_investigation(db, source_document_id)
