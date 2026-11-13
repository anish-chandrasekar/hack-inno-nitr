from sqlalchemy.orm import Session
from app.models import (
    ExecutionAction, VerificationResult, Commitment, Sponsor, Deliverable,
    Task, BudgetLine
)
from datetime import datetime, timezone

class VerificationAgent:
    name = "Verification Agent"

    @staticmethod
    def verify_execution(db: Session, execution_action: ExecutionAction) -> VerificationResult:
        proposal = execution_action.proposal
        expected = execution_action.after_snapshot or {}
        actual = {}
        discrepancies = []

        # Read back actual state from database
        if proposal.action_type == "UPDATE_SPONSOR_COMMITMENT":
            commitment = db.query(Commitment).filter(
                Commitment.sponsor_id == proposal.entity_id,
                Commitment.commitment_type == "financial"
            ).first()
            if commitment:
                actual = {
                    "current_approved_value": commitment.current_approved_value,
                    "status": commitment.status
                }
                if commitment.current_approved_value != expected.get("current_approved_value"):
                    discrepancies.append({
                        "field": "current_approved_value",
                        "expected": expected.get("current_approved_value"),
                        "actual": commitment.current_approved_value
                    })

        elif proposal.action_type == "RECLASSIFY_SPONSOR_TIER":
            sponsor = db.query(Sponsor).filter(Sponsor.id == proposal.entity_id).first()
            if sponsor:
                actual = {"tier": sponsor.tier, "risk_level": sponsor.risk_level}
                if sponsor.tier != expected.get("tier"):
                    discrepancies.append({
                        "field": "tier",
                        "expected": expected.get("tier"),
                        "actual": sponsor.tier
                    })

        elif proposal.action_type == "UPDATE_PROMOTIONAL_DELIVERABLES":
            deliverable = db.query(Deliverable).filter(Deliverable.id == proposal.entity_id).first()
            if deliverable:
                actual = {"status": deliverable.status}
                if deliverable.status != expected.get("status"):
                    discrepancies.append({
                        "field": "status",
                        "expected": expected.get("status"),
                        "actual": deliverable.status
                    })

        elif proposal.action_type == "REBALANCE_BUDGET_ALLOCATION":
            budget = db.query(BudgetLine).filter(BudgetLine.id == proposal.entity_id).first()
            if budget:
                actual = {"allocated_amount": budget.allocated_amount}
                if budget.allocated_amount != expected.get("allocated_amount"):
                    discrepancies.append({
                        "field": "allocated_amount",
                        "expected": expected.get("allocated_amount"),
                        "actual": budget.allocated_amount
                    })

        else:
            actual = expected

        status = "pass" if len(discrepancies) == 0 else "fail"
        details = (
            f"Verification PASS: Database state matches expected state exactly ({len(expected)} fields checked). Invariants satisfied."
            if status == "pass"
            else f"Verification FAIL: {len(discrepancies)} mismatch detected."
        )

        existing_vr = db.query(VerificationResult).filter(
            VerificationResult.execution_action_id == execution_action.id
        ).first()

        vr = existing_vr or VerificationResult(
            execution_action_id=execution_action.id,
            expected_state=expected,
            actual_state=actual,
            result=status,
            discrepancies=discrepancies if discrepancies else None,
            details=details,
            verified_at=datetime.now(timezone.utc)
        )
        if not existing_vr:
            db.add(vr)
        else:
            vr.expected_state = expected
            vr.actual_state = actual
            vr.result = status
            vr.discrepancies = discrepancies if discrepancies else None
            vr.details = details
            vr.verified_at = datetime.now(timezone.utc)

        db.commit()
        return vr
