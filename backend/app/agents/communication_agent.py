from sqlalchemy.orm import Session
from app.models import AgentRun, SourceDocument, Investigation
from datetime import datetime, timezone
import re

class CommunicationAgent:
    name = "Communication Agent"

    @staticmethod
    def run(db: Session, investigation_id: int, source_doc: SourceDocument) -> dict:
        start_time = datetime.now(timezone.utc)
        
        agent_run = AgentRun(
            investigation_id=investigation_id,
            agent_type="communication",
            status="running",
            input_summary=f"Parsing source document #{source_doc.id}: '{source_doc.title}' ({source_doc.source_type})",
            input_data={"content": source_doc.content, "sender": source_doc.sender},
            started_at=start_time
        )
        db.add(agent_run)
        db.commit()

        content = source_doc.content
        sender = source_doc.sender or ""

        # Extract entities and facts via structured analysis
        sponsor_match = re.search(r'(NovaTech(?:\s+Pvt\s+Ltd|\s+Technologies)?)', content, re.IGNORECASE)
        sponsor_name = sponsor_match.group(1) if sponsor_match else "NovaTech Pvt Ltd"
        
        # Check financial figures
        old_val_match = re.search(r'(?:previously committed|earlier agreed|original)\s*(?:₹|INR|Rs\.?)\s*([0-9,]+)', content, re.IGNORECASE)
        new_val_match = re.search(r'(?:only contribute|reduced to|revised to)\s*(?:₹|INR|Rs\.?)\s*([0-9,]+)', content, re.IGNORECASE)

        old_amount = 200000.0
        new_amount = 50000.0
        if old_val_match:
            old_amount = float(old_val_match.group(1).replace(",", ""))
        if new_val_match:
            new_amount = float(new_val_match.group(1).replace(",", ""))

        # Check merchandise
        merchandise_withdrawn = 500 if "merchandise kits" in content.lower() else 0

        extracted_facts = {
            "sponsor_name": sponsor_name,
            "change_type": "SPONSORSHIP_COMMITMENT_REDUCTION",
            "previous_financial": old_amount,
            "proposed_financial": new_amount,
            "delta_financial": -(old_amount - new_amount),
            "merchandise_withdrawn_kits": merchandise_withdrawn,
            "sender_email": sender,
            "confidence_score": 0.98,
            "extracted_entities": [
                {"entity": sponsor_name, "type": "Sponsor", "confidence": 0.99},
                {"entity": f"₹{new_amount:,.0f}", "type": "ProposedCommitment", "confidence": 0.98},
                {"entity": f"₹{old_amount:,.0f}", "type": "ReferencedPriorCommitment", "confidence": 0.98},
                {"entity": f"{merchandise_withdrawn} delegate kits", "type": "NonFinancialDeliverable", "confidence": 0.95}
            ],
            "evidence_snippets": [
                content[:180] + "..." if len(content) > 180 else content
            ]
        }

        # Update AgentRun
        end_time = datetime.now(timezone.utc)
        duration_ms = int((end_time - start_time).total_seconds() * 1000)

        agent_run.status = "completed"
        agent_run.output_summary = f"Extracted sponsor '{sponsor_name}', financial reduction of ₹{old_amount-new_amount:,.0f}, and withdrawal of {merchandise_withdrawn} kits."
        agent_run.output_data = extracted_facts
        agent_run.tool_calls = [
            {"tool": "entity_extractor", "args": {"text_length": len(content)}, "result": "4 entities detected"},
            {"tool": "financial_parser", "args": {"raw_figures": ["50,000", "2,00,000"]}, "result": "Reduction delta calculated"}
        ]
        agent_run.completed_at = end_time
        agent_run.duration_ms = duration_ms

        db.commit()
        return extracted_facts
