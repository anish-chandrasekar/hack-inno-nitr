from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Proposal, Approval, ExecutionAction, VerificationResult
from app.schemas.requests import ApprovalRequest
from app.agents.execution_agent import ExecutionAgent
from app.agents.verification_agent import VerificationAgent
from datetime import datetime, timezone

router = APIRouter(tags=["approvals"])

@router.get("/approvals")
def list_approvals(db: Session = Depends(get_db)):
    proposals = db.query(Proposal).order_by(Proposal.id.desc()).all()
    results = []
    for p in proposals:
        approval = db.query(Approval).filter(Approval.proposal_id == p.id).first()
        exec_action = db.query(ExecutionAction).filter(ExecutionAction.proposal_id == p.id).first()
        vr = db.query(VerificationResult).filter(VerificationResult.execution_action_id == exec_action.id).first() if exec_action else None

        results.append({
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
            "created_at": str(p.created_at),
            "approval": {
                "id": approval.id,
                "reviewer": approval.reviewer,
                "decision": approval.decision,
                "notes": approval.notes,
                "timestamp": str(approval.timestamp)
            } if approval else None,
            "execution_action": {
                "id": exec_action.id,
                "idempotency_key": exec_action.idempotency_key,
                "status": exec_action.status,
                "attempt_count": exec_action.attempt_count,
                "error": exec_action.error,
                "completed_at": str(exec_action.completed_at) if exec_action.completed_at else None,
                "verification": {
                    "result": vr.result,
                    "details": vr.details,
                    "verified_at": str(vr.verified_at)
                } if vr else None
            } if exec_action else None
        })
    return results

@router.post("/approvals/{proposal_id}/approve")
def approve_proposal(proposal_id: int, payload: ApprovalRequest = None, db: Session = Depends(get_db)):
    p = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proposal not found")

    p.approval_status = "approved"

    # Create Approval record
    appr = Approval(
        proposal_id=p.id,
        reviewer="Organising Secretary (Lead Reviewer)",
        decision="approved",
        notes=payload.notes if payload else "Approved via utsavIQ Command Center",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(appr)
    db.commit()

    # Trigger reliable execution with verification
    # For action_type == 'UPDATE_SPONSOR_COMMITMENT', if it's the first time, simulate tool failure to demo self-healing
    simulate_failure = (p.action_type == "UPDATE_SPONSOR_COMMITMENT")
    exec_action = ExecutionAgent.execute_proposal(db, p, simulate_tool_failure=simulate_failure)
    
    # If it failed simulated failure, coordinator retries safely
    if exec_action.status == "failed":
        # Coordinator retry (attempt 2 succeeds)
        exec_action = ExecutionAgent.execute_proposal(db, p, simulate_tool_failure=False)

    # Verification Agent reads back and confirms invariants
    VerificationAgent.verify_execution(db, exec_action)

    return {
        "status": "approved_and_executed",
        "proposal_id": p.id,
        "execution_status": exec_action.status,
        "attempts": exec_action.attempt_count,
        "idempotency_key": exec_action.idempotency_key
    }

@router.post("/approvals/{proposal_id}/reject")
def reject_proposal(proposal_id: int, payload: ApprovalRequest = None, db: Session = Depends(get_db)):
    p = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Proposal not found")

    p.approval_status = "rejected"
    appr = Approval(
        proposal_id=p.id,
        reviewer="Organising Secretary",
        decision="rejected",
        notes=payload.notes if payload else "Rejected by human operator",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(appr)
    db.commit()
    return {"status": "rejected", "proposal_id": p.id}

@router.post("/approvals/reset")
def reset_approvals(db: Session = Depends(get_db)):
    """Reset all approvals and re-stage fresh demo proposals for live presentation."""
    from app.database import Base, engine
    from app.seed.demo_data import seed_database
    from app.orchestration.workflow import run_investigation
    from app.models import SourceDocument

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database(db)

    run_investigation(db, 2)
    email_doc = db.query(SourceDocument).filter(SourceDocument.id == 2).first()
    if email_doc:
        email_doc.processing_status = "unprocessed"
        db.commit()

    return {"status": "reset_successful", "message": "Demo proposals successfully reset to initial pending state."}
