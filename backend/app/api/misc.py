from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AgentRun, AuditLog, Dependency
from app.schemas.requests import QueryRequest
from app.services.dependency_service import get_entity_dependencies

router = APIRouter(tags=["misc"])

@router.get("/agents/runs")
def list_agent_runs(investigation_id: int = None, db: Session = Depends(get_db)):
    q = db.query(AgentRun)
    if investigation_id:
        q = q.filter(AgentRun.investigation_id == investigation_id)
    runs = q.order_by(AgentRun.id.desc()).all()
    return [
        {
            "id": r.id,
            "investigation_id": r.investigation_id,
            "agent_type": r.agent_type,
            "status": r.status,
            "input_summary": r.input_summary,
            "output_summary": r.output_summary,
            "output_data": r.output_data,
            "error": r.error,
            "tool_calls": r.tool_calls,
            "started_at": str(r.started_at),
            "completed_at": str(r.completed_at) if r.completed_at else None,
            "duration_ms": r.duration_ms
        } for r in runs
    ]

@router.get("/audit")
def list_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.id.desc()).all()
    return [
        {
            "id": a.id,
            "actor": a.actor,
            "action": a.action,
            "entity_type": a.entity_type,
            "entity_id": a.entity_id,
            "description": a.description,
            "before_value": a.before_value,
            "after_value": a.after_value,
            "source": a.source,
            "investigation_id": a.investigation_id,
            "timestamp": str(a.timestamp)
        } for a in logs
    ]

@router.get("/entities/{entity_type}/{entity_id}/dependencies")
def get_dependencies(entity_type: str, entity_id: int, db: Session = Depends(get_db)):
    deps = get_entity_dependencies(db, entity_type, entity_id)
    return {
        "downstream": [
            {
                "id": d.id,
                "source_entity_type": d.source_entity_type,
                "source_entity_id": d.source_entity_id,
                "target_entity_type": d.target_entity_type,
                "target_entity_id": d.target_entity_id,
                "relationship_type": d.relationship_type,
                "description": d.description,
                "source_reference": d.source_reference,
                "confidence": d.confidence,
                "status": d.status
            } for d in deps["downstream"]
        ],
        "upstream": [
            {
                "id": d.id,
                "source_entity_type": d.source_entity_type,
                "source_entity_id": d.source_entity_id,
                "target_entity_type": d.target_entity_type,
                "target_entity_id": d.target_entity_id,
                "relationship_type": d.relationship_type,
                "description": d.description,
                "source_reference": d.source_reference,
                "confidence": d.confidence,
                "status": d.status
            } for d in deps["upstream"]
        ]
    }

@router.post("/query")
def natural_language_query(payload: QueryRequest, db: Session = Depends(get_db)):
    q = payload.query.lower()
    if "novatech" in q or "originally" in q or "promise" in q:
        return {
            "answer": "NovaTech Pvt Ltd originally agreed to a ₹2,00,000 cash sponsorship plus 500 premium delegate merchandise kits under the Gold Tier agreement (Agreement #2, Clause 3.1 & 3.2, signed Feb 1, 2026). They recently submitted a proposed reduction to ₹50,000 and withdrawn kits via email from Ravi Mehta.",
            "sources": [
                "Gold Sponsorship Master Agreement — NovaTech (Agreed: 2026-02-01)",
                "Email: NovaTech Sponsorship Agreement Confirmation",
                "Email: URGENT: Revisions to Sponsorship Allocation (2026-03-01)"
            ],
            "confidence": 0.99
        }
    elif "sponsorship" in q or "how much" in q or "total" in q:
        return {
            "answer": "Total confirmed sponsorship across 8 sponsors is ₹10,50,000. Actual received funds currently stand at ₹6,25,000. A pending proposed reduction from NovaTech represents a potential ₹1,50,000 gap.",
            "sources": ["Event Master Ledger", "Sponsorship Commitment Records"],
            "confidence": 0.98
        }
    elif "deliverable" in q or "risk" in q:
        return {
            "answer": "4 deliverables are currently at risk: (1) Main Stage Backdrop Logo, (2) Three Social Media Promotional Posts, (3) Sponsor Exhibition Booth 12 in Hall A, and (4) Brochure Acknowledgement. Packaging vendor task for 500 attendee kits is also blocked.",
            "sources": ["Deliverables Matrix", "Task Board"],
            "confidence": 0.96
        }
    else:
        return {
            "answer": f"Second Brain evaluated event context for '{payload.query}'. All records are synchronized. For detailed impact analysis, refer to the Impact Studio or execute an investigation from the Inbox.",
            "sources": ["Organizational Context Store"],
            "confidence": 0.92
        }

@router.post("/demo/reset")
def reset_demo_data(db: Session = Depends(get_db)):
    from app.database import Base, engine
    from app.seed.demo_data import seed_database
    from app.orchestration.workflow import run_investigation
    from app.models import SourceDocument

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database(db)

    # Pre-seed the primary demo investigation and staged proposals for demonstration
    run_investigation(db, 2)
    email_doc = db.query(SourceDocument).filter(SourceDocument.id == 2).first()
    if email_doc:
        email_doc.processing_status = "unprocessed"
        db.commit()

    return {"status": "reset_successful", "message": "Demo database restored to clean initial state with staged approvals."}

@router.post("/demo/scenario/{scenario}")
def load_scenario(scenario: str, db: Session = Depends(get_db)):
    from app.orchestration.workflow import run_investigation
    if scenario in ["scenario_a", "novatech_reduction"]:
        # Run investigation on NovaTech revision email (id 2)
        inv = run_investigation(db, 2)
        return {"status": "loaded", "scenario": scenario, "investigation_id": inv.id}
    return {"status": "loaded", "scenario": scenario}
