from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Investigation, AgentRun, Proposal, SourceDocument
from app.schemas.requests import RunInvestigationRequest
from app.orchestration.workflow import run_investigation
from app.services.impact_engine import generate_impact_analysis

router = APIRouter(tags=["investigations"])

@router.post("/investigations/run")
def start_investigation(payload: RunInvestigationRequest, db: Session = Depends(get_db)):
    doc = db.query(SourceDocument).filter(SourceDocument.id == payload.source_document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Source document not found")
    
    inv = run_investigation(db, payload.source_document_id)
    return {
        "id": inv.id,
        "trigger_source_id": inv.trigger_source_id,
        "workflow_state": inv.workflow_state,
        "status": inv.status,
        "summary": inv.summary,
        "created_at": str(inv.created_at)
    }

@router.get("/investigations")
def list_investigations(db: Session = Depends(get_db)):
    invs = db.query(Investigation).order_by(Investigation.id.desc()).all()
    results = []
    for inv in invs:
        agent_runs = db.query(AgentRun).filter(AgentRun.investigation_id == inv.id).all()
        proposals = db.query(Proposal).filter(Proposal.investigation_id == inv.id).all()
        results.append({
            "id": inv.id,
            "trigger_source_id": inv.trigger_source_id,
            "workflow_state": inv.workflow_state,
            "status": inv.status,
            "summary": inv.summary,
            "context": inv.context,
            "created_at": str(inv.created_at),
            "updated_at": str(inv.updated_at),
            "agent_runs": [
                {
                    "id": ar.id,
                    "agent_type": ar.agent_type,
                    "status": ar.status,
                    "input_summary": ar.input_summary,
                    "output_summary": ar.output_summary,
                    "tool_calls": ar.tool_calls,
                    "started_at": str(ar.started_at),
                    "completed_at": str(ar.completed_at) if ar.completed_at else None,
                    "duration_ms": ar.duration_ms
                } for ar in agent_runs
            ],
            "proposals": [
                {
                    "id": p.id,
                    "action_type": p.action_type,
                    "description": p.description,
                    "risk_level": p.risk_level,
                    "approval_status": p.approval_status
                } for p in proposals
            ]
        })
    return results

@router.get("/investigations/{investigation_id}")
def get_investigation(investigation_id: int, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    agent_runs = db.query(AgentRun).filter(AgentRun.investigation_id == inv.id).all()
    proposals = db.query(Proposal).filter(Proposal.investigation_id == inv.id).all()

    return {
        "id": inv.id,
        "trigger_source_id": inv.trigger_source_id,
        "workflow_state": inv.workflow_state,
        "status": inv.status,
        "summary": inv.summary,
        "context": inv.context,
        "created_at": str(inv.created_at),
        "updated_at": str(inv.updated_at),
        "agent_runs": [
            {
                "id": ar.id,
                "agent_type": ar.agent_type,
                "status": ar.status,
                "input_summary": ar.input_summary,
                "output_summary": ar.output_summary,
                "output_data": ar.output_data,
                "error": ar.error,
                "tool_calls": ar.tool_calls,
                "started_at": str(ar.started_at),
                "completed_at": str(ar.completed_at) if ar.completed_at else None,
                "duration_ms": ar.duration_ms
            } for ar in agent_runs
        ],
        "proposals": [
            {
                "id": p.id,
                "investigation_id": p.investigation_id,
                "action_type": p.action_type,
                "entity_type": p.entity_type,
                "entity_id": p.entity_id,
                "description": p.description,
                "old_value": p.old_value,
                "proposed_value": p.proposed_value,
                "reason": p.reason,
                "evidence_source": p.evidence_source,
                "risk_level": p.risk_level,
                "financial_impact": p.financial_impact,
                "proposing_agent": p.proposing_agent,
                "approval_status": p.approval_status,
                "created_at": str(p.created_at)
            } for p in proposals
        ]
    }

@router.get("/investigations/{investigation_id}/impact")
def get_investigation_impact(investigation_id: int, db: Session = Depends(get_db)):
    return generate_impact_analysis(db, investigation_id)
