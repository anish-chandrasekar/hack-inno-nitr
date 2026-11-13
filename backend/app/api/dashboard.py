from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Event, Sponsor, BudgetLine, Deliverable, Proposal, Investigation, AuditLog, Commitment
from app.services.budget_service import calculate_budget_summary

router = APIRouter(tags=["dashboard"])

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    event = db.query(Event).first()
    if not event:
        return {}

    b_summary = calculate_budget_summary(db, event.id)
    
    # Deliverables at risk
    at_risk_deliv = db.query(Deliverable).filter(Deliverable.status == "at_risk").count()
    
    # Pending approvals
    pending_appr = db.query(Proposal).filter(Proposal.approval_status == "pending").count()

    # Active investigations
    active_inv = db.query(Investigation).filter(Investigation.status == "active").count()

    # Sponsors summary
    sponsors = db.query(Sponsor).all()
    sp_list = []
    actual_received_total = 0.0
    for s in sponsors:
        # compute committed amount
        c_fin = db.query(Commitment).filter(
            Commitment.sponsor_id == s.id,
            Commitment.commitment_type == "financial"
        ).first()
        committed_val = c_fin.original_value if c_fin else 0.0
        # compute simulated received
        rec_val = committed_val * (1.0 if s.tier == "Title" else 0.5 if s.tier == "Platinum" else 0.25 if s.name == "CloudNine Systems" else 0.0)
        actual_received_total += rec_val

        sp_list.append({
            "id": s.id,
            "name": s.name,
            "tier": s.tier,
            "committed": committed_val,
            "received": rec_val,
            "status": s.status,
            "risk_level": s.risk_level
        })

    # Recent alerts
    alerts = [
        {
            "id": "alert_1",
            "type": "CRITICAL_SPONSOR_REDUCTION",
            "message": "NovaTech Pvt Ltd submitted ₹1,50,000 commitment reduction & withdrawn 500 merchandise kits.",
            "severity": "critical",
            "timestamp": "2026-03-01T10:30:00Z",
            "entity_type": "sponsor",
            "entity_id": 4
        },
        {
            "id": "alert_2",
            "type": "DELIVERABLE_AT_RISK",
            "message": "Main stage backdrop print proof requires sponsor logo freeze by March 9.",
            "severity": "warning",
            "timestamp": "2026-03-01T09:15:00Z",
            "entity_type": "deliverable",
            "entity_id": 1
        },
        {
            "id": "alert_3",
            "type": "BUDGET_DEFICIT_WARNING",
            "message": "Food & Hospitality budget line faces ₹1,50,000 funding deficit pending recovery plan.",
            "severity": "warning",
            "timestamp": "2026-03-01T08:45:00Z",
            "entity_type": "budget_line",
            "entity_id": 5
        }
    ]

    budget_lines = db.query(BudgetLine).all()
    recent_activity = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(10).all()
    pending_proposals = db.query(Proposal).filter(Proposal.approval_status == "pending").limit(5).all()

    return {
        "event": {
            "id": event.id,
            "name": event.name,
            "tagline": event.tagline,
            "date": event.date,
            "venue": event.venue,
            "status": event.status,
            "total_budget": event.total_budget
        },
        "kpis": {
            "total_sponsorship_committed": b_summary["total_sponsorship_committed"],
            "actual_sponsorship_received": actual_received_total,
            "budget_remaining": b_summary["budget_remaining"],
            "at_risk_deliverables": at_risk_deliv,
            "pending_approvals": pending_appr,
            "active_workflows": active_inv
        },
        "budget_lines": [
            {
                "id": b.id,
                "category": b.category,
                "subcategory": b.subcategory,
                "allocated_amount": b.allocated_amount,
                "committed_amount": b.committed_amount,
                "spent_amount": b.spent_amount,
                "funding_source": b.funding_source,
                "status": b.status,
                "notes": b.notes
            } for b in budget_lines
        ],
        "sponsor_summary": sp_list,
        "recent_alerts": alerts,
        "recent_activity": [
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
            } for a in recent_activity
        ],
        "pending_approvals": [
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
            } for p in pending_proposals
        ]
    }
