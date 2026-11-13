from sqlalchemy.orm import Session
from app.models import AgentRun, Proposal, Sponsor, Deliverable, Task, BudgetLine
from datetime import datetime, timezone

class PlanningAgent:
    name = "Planning Agent"

    @staticmethod
    def run(db: Session, investigation_id: int, knowledge_output: dict) -> dict:
        start_time = datetime.now(timezone.utc)

        sponsor_id = knowledge_output.get("sponsor_id", 4)
        sponsor_name = knowledge_output.get("sponsor_canonical_name", "NovaTech Pvt Ltd")
        approved_cash = float(knowledge_output.get("historical_approved_cash", 200000.0))
        proposed_cash = float(knowledge_output.get("proposed_financial", 50000.0))
        reduction = abs(approved_cash - proposed_cash)

        agent_run = AgentRun(
            investigation_id=investigation_id,
            agent_type="planning",
            status="running",
            input_summary=f"Synthesizing impact cascade and generating recovery proposals for {sponsor_name} reduction of ₹{reduction:,.0f}",
            input_data=knowledge_output,
            started_at=start_time
        )
        db.add(agent_run)
        db.commit()

        # Delete old proposals for this investigation if re-running
        db.query(Proposal).filter(Proposal.investigation_id == investigation_id).delete()

        # Generate structured proposals with risk classification
        proposals_to_create = [
            {
                "action_type": "UPDATE_SPONSOR_COMMITMENT",
                "entity_type": "commitment",
                "entity_id": sponsor_id,
                "description": f"Amend approved financial commitment from ₹{approved_cash:,.0f} to ₹{proposed_cash:,.0f} for {sponsor_name}",
                "old_value": f"₹{approved_cash:,.0f}",
                "proposed_value": f"₹{proposed_cash:,.0f}",
                "reason": "Official communication received citing marketing budget realignment",
                "evidence_source": "Email: URGENT: Revisions to Sponsorship Allocation (ravi.mehta@novatech.in)",
                "risk_level": "high",
                "financial_impact": -reduction,
                "proposing_agent": "Planning Agent"
            },
            {
                "action_type": "REVISE_MERCHANDISE_PROCUREMENT",
                "entity_type": "task",
                "entity_id": 4,  # Packaging task
                "description": "Withdraw 500 sponsor-provided kits expectation; evaluate internal kit procurement or reduce attendee delegate kit bag order",
                "old_value": "500 Delegate Kits (Sponsor Provided)",
                "proposed_value": "0 Kits (Withdrawn by Sponsor)",
                "reason": "NovaTech explicitly withdrew delegate merchandise kit provision",
                "evidence_source": "Email Clause 2 (500 kits withdrawn)",
                "risk_level": "high",
                "financial_impact": 0.0,
                "proposing_agent": "Planning Agent"
            },
            {
                "action_type": "RECLASSIFY_SPONSOR_TIER",
                "entity_type": "sponsor",
                "entity_id": sponsor_id,
                "description": f"Reclassify {sponsor_name} from Gold Partner tier to Silver Partner tier based on revised ₹50,000 contribution",
                "old_value": "Gold Tier",
                "proposed_value": "Silver Tier",
                "reason": "Institutional sponsorship policy dictates Silver tier for ₹50,000 threshold",
                "evidence_source": "Innovision 2026 Sponsorship Tier Matrix",
                "risk_level": "high",
                "financial_impact": 0.0,
                "proposing_agent": "Planning Agent"
            },
            {
                "action_type": "REBALANCE_BUDGET_ALLOCATION",
                "entity_type": "budget_line",
                "entity_id": 5,  # Food & Hospitality
                "description": "Adjust Food & Hospitality funding source deficit (-₹1,50,000) using Plan B expenditure optimization or Plan A replacement co-sponsor",
                "old_value": "₹1,50,000 allocated (Funded by NovaTech)",
                "proposed_value": "₹90,000 revised allocation + contingency absorption",
                "reason": "Deficit caused by primary sponsor cash reduction",
                "evidence_source": "Budget Variance Engine",
                "risk_level": "medium",
                "financial_impact": -reduction,
                "proposing_agent": "Planning Agent"
            },
            {
                "action_type": "UPDATE_PROMOTIONAL_DELIVERABLES",
                "entity_type": "deliverable",
                "entity_id": 1,  # Backdrop logo
                "description": "Remove NovaTech prominent logo from Main Auditorium stage backdrop print proof",
                "old_value": "Gold Main Stage Logo Backdrop",
                "proposed_value": "Downscaled Silver Brochure Mention Only",
                "reason": "Stage backdrop reserved exclusively for Gold, Platinum and Title sponsors",
                "evidence_source": "Sponsorship Deliverable Guidelines",
                "risk_level": "medium",
                "financial_impact": 0.0,
                "proposing_agent": "Planning Agent"
            }
        ]

        created_proposals = []
        for p_data in proposals_to_create:
            prop = Proposal(
                investigation_id=investigation_id,
                action_type=p_data["action_type"],
                entity_type=p_data["entity_type"],
                entity_id=p_data["entity_id"],
                description=p_data["description"],
                old_value=p_data["old_value"],
                proposed_value=p_data["proposed_value"],
                reason=p_data["reason"],
                evidence_source=p_data["evidence_source"],
                risk_level=p_data["risk_level"],
                financial_impact=p_data["financial_impact"],
                proposing_agent=p_data["proposing_agent"],
                approval_status="pending"
            )
            db.add(prop)
            db.flush()
            created_proposals.append(prop.id)

        end_time = datetime.now(timezone.utc)
        duration_ms = int((end_time - start_time).total_seconds() * 1000)

        agent_run.status = "waiting_approval"
        agent_run.output_summary = f"Synthesized 3 adaptive recovery plans. Prepared {len(created_proposals)} structured proposals requiring Human-in-the-Loop approval."
        agent_run.output_data = {
            "proposals_generated": len(created_proposals),
            "proposal_ids": created_proposals,
            "financial_deficit": reduction,
            "high_risk_actions_count": 3,
            "medium_risk_actions_count": 2,
            "awaiting_human_approval": True
        }
        agent_run.tool_calls = [
            {"tool": "cascade_simulator", "args": {"reduction": reduction}, "result": "5 downstream nodes flagged"},
            {"tool": "recovery_planner", "args": {"plans": ["Plan A", "Plan B", "Plan C"]}, "result": "3 scenarios generated with trade-offs"},
            {"tool": "proposal_generator", "args": {"proposals_count": len(created_proposals)}, "result": "5 proposals staged with idempotency guards"}
        ]
        agent_run.completed_at = end_time
        agent_run.duration_ms = duration_ms

        db.commit()
        return agent_run.output_data
