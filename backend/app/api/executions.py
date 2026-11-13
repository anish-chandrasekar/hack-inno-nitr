from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ExecutionAction, Proposal
from app.agents.execution_agent import ExecutionAgent
from app.agents.verification_agent import VerificationAgent

router = APIRouter(tags=["executions"])

@router.post("/executions/{execution_id}/retry")
def retry_execution(execution_id: int, db: Session = Depends(get_db)):
    action = db.query(ExecutionAction).filter(ExecutionAction.id == execution_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Execution action not found")

    proposal = action.proposal
    # Retry safely without duplicating
    retried_action = ExecutionAgent.execute_proposal(db, proposal, simulate_tool_failure=False)
    VerificationAgent.verify_execution(db, retried_action)

    return {
        "status": retried_action.status,
        "attempts": retried_action.attempt_count,
        "idempotency_key": retried_action.idempotency_key
    }
