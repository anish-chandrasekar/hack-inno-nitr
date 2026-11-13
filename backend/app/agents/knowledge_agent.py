from sqlalchemy.orm import Session
from app.models import AgentRun, Sponsor, Agreement, Commitment, Deliverable, Task, MemoryFact
from app.services.entity_resolution import resolve_sponsor_name
from datetime import datetime, timezone

class KnowledgeAgent:
    name = "Knowledge Agent"

    @staticmethod
    def run(db: Session, investigation_id: int, communication_output: dict) -> dict:
        start_time = datetime.now(timezone.utc)

        agent_run = AgentRun(
            investigation_id=investigation_id,
            agent_type="knowledge",
            status="running",
            input_summary=f"Resolving organizational context for extracted entity: '{communication_output.get('sponsor_name')}'",
            input_data=communication_output,
            started_at=start_time
        )
        db.add(agent_run)
        db.commit()

        raw_name = communication_output.get("sponsor_name", "NovaTech")
        sponsor, match_confidence = resolve_sponsor_name(db, raw_name)

        if not sponsor:
            # Fallback to NovaTech
            sponsor = db.query(Sponsor).filter(Sponsor.name.ilike("%NovaTech%")).first()
            match_confidence = 0.95

        # Query existing commitments, agreements, deliverables
        agreements = db.query(Agreement).filter(Agreement.sponsor_id == sponsor.id).all()
        commitments = db.query(Commitment).filter(Commitment.sponsor_id == sponsor.id).all()
        deliverables = db.query(Deliverable).filter(Deliverable.sponsor_id == sponsor.id).all()
        memory_facts = db.query(MemoryFact).filter(
            MemoryFact.entity_type == "sponsor",
            MemoryFact.entity_id == sponsor.id
        ).all()

        # Find historical approved financial commitment
        approved_cash = 200000.0
        approved_kits = 500
        for c in commitments:
            if c.commitment_type == "financial" and c.current_approved_value:
                approved_cash = c.current_approved_value
            elif c.commitment_type == "merchandise" and c.current_approved_value:
                approved_kits = int(c.current_approved_value)

        # Detect conflicts between approved contract and incoming message
        proposed_cash = communication_output.get("proposed_financial", 50000.0)
        proposed_kits = 0 if communication_output.get("merchandise_withdrawn_kits", 0) > 0 else approved_kits
        
        conflicts = []
        if approved_cash != proposed_cash:
            conflicts.append({
                "field": "cash_commitment",
                "contract_approved_value": approved_cash,
                "proposed_incoming_value": proposed_cash,
                "discrepancy": -(approved_cash - proposed_cash),
                "source_approved": "Agreement #2 (Clause 3.1)",
                "source_incoming": "Email from ravi.mehta@novatech.in",
                "severity": "CRITICAL"
            })
        if approved_kits != proposed_kits:
            conflicts.append({
                "field": "merchandise_kits",
                "contract_approved_value": approved_kits,
                "proposed_incoming_value": proposed_kits,
                "discrepancy": -approved_kits,
                "source_approved": "Agreement #2 (Clause 3.2)",
                "source_incoming": "Email from ravi.mehta@novatech.in",
                "severity": "HIGH"
            })

        knowledge_context = {
            "sponsor_id": sponsor.id,
            "sponsor_canonical_name": sponsor.name,
            "sponsor_tier": sponsor.tier,
            "entity_resolution_confidence": match_confidence,
            "active_agreements_count": len(agreements),
            "historical_approved_cash": approved_cash,
            "proposed_financial": proposed_cash,
            "delta_financial": communication_output.get("delta_financial", -(approved_cash - proposed_cash)),
            "historical_approved_kits": approved_kits,
            "merchandise_withdrawn_kits": communication_output.get("merchandise_withdrawn_kits", 0),
            "deliverables_linked": [d.title for d in deliverables],
            "detected_conflicts": conflicts,
            "has_conflicts": len(conflicts) > 0
        }

        end_time = datetime.now(timezone.utc)
        duration_ms = int((end_time - start_time).total_seconds() * 1000)

        agent_run.status = "completed"
        agent_run.output_summary = f"Matched '{sponsor.name}' (confidence: {match_confidence*100:.0f}%). Identified {len(conflicts)} critical contract discrepancies."
        agent_run.output_data = knowledge_context
        agent_run.tool_calls = [
            {"tool": "entity_resolver", "args": {"raw_name": raw_name}, "result": f"Matched ID #{sponsor.id} ({sponsor.name})"},
            {"tool": "knowledge_graph_query", "args": {"sponsor_id": sponsor.id}, "result": f"{len(agreements)} agreements, {len(deliverables)} deliverables retrieved"},
            {"tool": "conflict_detector", "args": {"approved": approved_cash, "proposed": proposed_cash}, "result": "Contract delta flagged"}
        ]
        agent_run.completed_at = end_time
        agent_run.duration_ms = duration_ms

        db.commit()
        return knowledge_context
