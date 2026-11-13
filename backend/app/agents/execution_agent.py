from sqlalchemy.orm import Session
from app.models import (
    Proposal, ExecutionAction, AuditLog, Commitment, Sponsor, Deliverable,
    Task, BudgetLine, AgentRun
)
from datetime import datetime, timezone
import uuid

class ExecutionAgent:
    name = "Execution Agent"

    @staticmethod
    def execute_proposal(db: Session, proposal: Proposal, simulate_tool_failure: bool = False) -> ExecutionAction:
        now = datetime.now(timezone.utc)
        
        # Idempotency check: see if execution action already exists
        existing_action = db.query(ExecutionAction).filter(ExecutionAction.proposal_id == proposal.id).first()
        if existing_action and existing_action.status == "completed":
            return existing_action

        idempotency_key = f"IDEM_{proposal.id}_{proposal.action_type}"
        action = existing_action or ExecutionAction(
            proposal_id=proposal.id,
            idempotency_key=idempotency_key,
            action_type=proposal.action_type,
            status="executing",
            attempt_count=0
        )
        if not existing_action:
            db.add(action)
            db.flush()

        action.attempt_count += 1

        # Simulate transient tool failure on attempt 1 if requested (Reliability Demo)
        if simulate_tool_failure and action.attempt_count == 1:
            action.status = "failed"
            action.error = "SIMULATED_TOOL_ERROR: HTTP 503 Service Unavailable on Google Sheets Sync Connector (Temporary timeout)."
            db.commit()
            return action

        # Execute actual state modification
        before_state = {}
        after_state = {}

        if proposal.action_type == "UPDATE_SPONSOR_COMMITMENT":
            commitment = db.query(Commitment).filter(
                Commitment.sponsor_id == proposal.entity_id,
                Commitment.commitment_type == "financial"
            ).first()
            if commitment:
                before_state = {
                    "current_approved_value": commitment.current_approved_value,
                    "status": commitment.status
                }
                commitment.current_approved_value = 50000.0
                commitment.proposed_value = 50000.0
                commitment.status = "confirmed_amended"
                after_state = {
                    "current_approved_value": 50000.0,
                    "status": "confirmed_amended"
                }

        elif proposal.action_type == "RECLASSIFY_SPONSOR_TIER":
            sponsor = db.query(Sponsor).filter(Sponsor.id == proposal.entity_id).first()
            if sponsor:
                before_state = {"tier": sponsor.tier, "risk_level": sponsor.risk_level}
                sponsor.tier = "Silver"
                sponsor.risk_level = "medium"
                after_state = {"tier": "Silver", "risk_level": "medium"}

        elif proposal.action_type == "REVISE_MERCHANDISE_PROCUREMENT":
            task = db.query(Task).filter(Task.id == proposal.entity_id).first()
            if task:
                before_state = {"status": task.status, "description": task.description}
                task.status = "in_progress"
                task.description = "Procure delegate bags independently using contingency/concession quotes."
                after_state = {"status": "in_progress", "description": task.description}

        elif proposal.action_type == "UPDATE_PROMOTIONAL_DELIVERABLES":
            deliverable = db.query(Deliverable).filter(Deliverable.id == proposal.entity_id).first()
            if deliverable:
                before_state = {"status": deliverable.status}
                deliverable.status = "cancelled"
                after_state = {"status": "cancelled"}

        elif proposal.action_type == "REBALANCE_BUDGET_ALLOCATION":
            budget = db.query(BudgetLine).filter(BudgetLine.id == proposal.entity_id).first()
            if budget:
                before_state = {"allocated_amount": budget.allocated_amount}
                budget.allocated_amount = 90000.0
                after_state = {"allocated_amount": 90000.0}

        action.status = "completed"
        action.completed_at = datetime.now(timezone.utc)
        action.before_snapshot = before_state
        action.after_snapshot = after_state
        action.result = {"executed": True, "idempotency_validated": True, "applied_at": str(action.completed_at)}
        action.error = None

        # Add Audit Log
        audit = AuditLog(
            actor="Execution Agent",
            action=proposal.action_type,
            entity_type=proposal.entity_type,
            entity_id=proposal.entity_id,
            description=f"Applied approved change: {proposal.description}",
            before_value=before_state,
            after_value=after_state,
            source=f"Proposal #{proposal.id} (Idempotency: {idempotency_key})",
            investigation_id=proposal.investigation_id
        )
        db.add(audit)
        db.commit()

        return action
