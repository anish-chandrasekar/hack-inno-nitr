from sqlalchemy.orm import Session
from app.models import BudgetLine, Commitment, Sponsor

def calculate_budget_summary(db: Session, event_id: int = 1):
    budget_lines = db.query(BudgetLine).filter(BudgetLine.event_id == event_id).all()
    total_allocated = sum(b.allocated_amount for b in budget_lines)
    total_committed = sum(b.committed_amount for b in budget_lines)
    total_spent = sum(b.spent_amount for b in budget_lines)
    remaining = total_allocated - total_spent

    # Calculate actual sponsorship committed
    commitments = db.query(Commitment).filter(Commitment.commitment_type == "financial").all()
    total_sponsorship_committed = sum(c.original_value or 0 for c in commitments)
    
    # Calculate approved vs proposed delta
    current_approved_sponsorship = sum(c.current_approved_value or 0 for c in commitments)
    proposed_sponsorship = sum(c.proposed_value if c.proposed_value is not None else (c.current_approved_value or 0) for c in commitments)
    potential_gap = current_approved_sponsorship - proposed_sponsorship

    return {
        "total_allocated": total_allocated,
        "total_committed": total_committed,
        "total_spent": total_spent,
        "budget_remaining": remaining,
        "total_sponsorship_committed": total_sponsorship_committed,
        "current_approved_sponsorship": current_approved_sponsorship,
        "proposed_sponsorship": proposed_sponsorship,
        "potential_gap": potential_gap
    }

def calculate_sponsor_gap(db: Session, sponsor_id: int):
    commitments = db.query(Commitment).filter(Commitment.sponsor_id == sponsor_id).all()
    cash_reduction = 0.0
    merchandise_withdrawn = 0
    for c in commitments:
        if c.commitment_type == "financial" and c.current_approved_value and c.proposed_value is not None:
            cash_reduction += (c.current_approved_value - c.proposed_value)
        elif c.commitment_type == "merchandise" and c.current_approved_value and c.proposed_value is not None:
            merchandise_withdrawn += int(c.current_approved_value - c.proposed_value)
    return {
        "cash_reduction": cash_reduction,
        "merchandise_withdrawn": merchandise_withdrawn
    }
