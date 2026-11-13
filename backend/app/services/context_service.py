from sqlalchemy.orm import Session
from app.models import MemoryFact, Agreement, Commitment, Deliverable, Task, Sponsor

def get_sponsor_context(db: Session, sponsor_id: int):
    sponsor = db.query(Sponsor).filter(Sponsor.id == sponsor_id).first()
    if not sponsor:
        return None

    agreements = db.query(Agreement).filter(Agreement.sponsor_id == sponsor_id).all()
    commitments = db.query(Commitment).filter(Commitment.sponsor_id == sponsor_id).all()
    deliverables = db.query(Deliverable).filter(Deliverable.sponsor_id == sponsor_id).all()
    facts = db.query(MemoryFact).filter(
        MemoryFact.entity_type == "sponsor",
        MemoryFact.entity_id == sponsor_id
    ).all()

    return {
        "sponsor": sponsor,
        "agreements": agreements,
        "commitments": commitments,
        "deliverables": deliverables,
        "facts": facts
    }
