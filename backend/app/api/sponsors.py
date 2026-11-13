from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Sponsor, Commitment, Deliverable, Agreement

router = APIRouter(tags=["sponsors"])

@router.get("/sponsors")
def list_sponsors(db: Session = Depends(get_db)):
    sponsors = db.query(Sponsor).all()
    results = []
    for s in sponsors:
        commitments = db.query(Commitment).filter(Commitment.sponsor_id == s.id).all()
        deliverables = db.query(Deliverable).filter(Deliverable.sponsor_id == s.id).all()
        results.append({
            "id": s.id,
            "event_id": s.event_id,
            "name": s.name,
            "category": s.category,
            "tier": s.tier,
            "contact_name": s.contact_name,
            "contact_email": s.contact_email,
            "contact_phone": s.contact_phone,
            "status": s.status,
            "risk_level": s.risk_level,
            "notes": s.notes,
            "created_at": str(s.created_at),
            "commitments": [
                {
                    "id": c.id,
                    "sponsor_id": c.sponsor_id,
                    "commitment_type": c.commitment_type,
                    "description": c.description,
                    "original_value": c.original_value,
                    "current_approved_value": c.current_approved_value,
                    "proposed_value": c.proposed_value,
                    "unit": c.unit,
                    "status": c.status,
                    "source_document_id": c.source_document_id,
                    "created_at": str(c.created_at)
                } for c in commitments
            ],
            "deliverables": [
                {
                    "id": d.id,
                    "sponsor_id": d.sponsor_id,
                    "event_id": d.event_id,
                    "title": d.title,
                    "deliverable_type": d.deliverable_type,
                    "description": d.description,
                    "status": d.status,
                    "deadline": d.deadline,
                    "owner": d.owner,
                    "source_reference": d.source_reference
                } for d in deliverables
            ]
        })
    return results

@router.get("/sponsors/{sponsor_id}")
def get_sponsor(sponsor_id: int, db: Session = Depends(get_db)):
    s = db.query(Sponsor).filter(Sponsor.id == sponsor_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Sponsor not found")

    commitments = db.query(Commitment).filter(Commitment.sponsor_id == s.id).all()
    deliverables = db.query(Deliverable).filter(Deliverable.sponsor_id == s.id).all()
    agreements = db.query(Agreement).filter(Agreement.sponsor_id == s.id).all()

    return {
        "id": s.id,
        "event_id": s.event_id,
        "name": s.name,
        "category": s.category,
        "tier": s.tier,
        "contact_name": s.contact_name,
        "contact_email": s.contact_email,
        "contact_phone": s.contact_phone,
        "status": s.status,
        "risk_level": s.risk_level,
        "notes": s.notes,
        "created_at": str(s.created_at),
        "commitments": [
            {
                "id": c.id,
                "sponsor_id": c.sponsor_id,
                "commitment_type": c.commitment_type,
                "description": c.description,
                "original_value": c.original_value,
                "current_approved_value": c.current_approved_value,
                "proposed_value": c.proposed_value,
                "unit": c.unit,
                "status": c.status,
                "source_document_id": c.source_document_id,
                "created_at": str(c.created_at)
            } for c in commitments
        ],
        "deliverables": [
            {
                "id": d.id,
                "sponsor_id": d.sponsor_id,
                "event_id": d.event_id,
                "title": d.title,
                "deliverable_type": d.deliverable_type,
                "description": d.description,
                "status": d.status,
                "deadline": d.deadline,
                "owner": d.owner,
                "source_reference": d.source_reference
            } for d in deliverables
        ],
        "agreements": [
            {
                "id": a.id,
                "sponsor_id": a.sponsor_id,
                "title": a.title,
                "content": a.content,
                "agreed_date": a.agreed_date,
                "status": a.status,
                "version": a.version,
                "source_document_id": a.source_document_id,
                "created_at": str(a.created_at)
            } for a in agreements
        ]
    }
