from sqlalchemy.orm import Session
from app.models import Investigation, SourceDocument, AgentRun
from app.agents.communication_agent import CommunicationAgent
from app.agents.knowledge_agent import KnowledgeAgent
from app.agents.planning_agent import PlanningAgent
from app.agents.execution_agent import ExecutionAgent
from app.agents.verification_agent import VerificationAgent
from datetime import datetime, timezone

class CoordinatorAgent:
    name = "Coordinator Agent"

    @staticmethod
    def start_investigation(db: Session, source_document_id: int) -> Investigation:
        doc = db.query(SourceDocument).filter(SourceDocument.id == source_document_id).first()
        if not doc:
            raise ValueError(f"SourceDocument #{source_document_id} not found.")

        # Create or update Investigation
        inv = Investigation(
            trigger_source_id=doc.id,
            workflow_state="EXTRACTING",
            status="active",
            summary=f"Investigation triggered by incoming communication: '{doc.title}'",
            context={"source_id": doc.id, "sender": doc.sender}
        )
        db.add(inv)
        db.commit()

        # Step 1: Communication Agent
        comm_output = CommunicationAgent.run(db, inv.id, doc)
        inv.workflow_state = "RETRIEVING_CONTEXT"
        inv.context = {**inv.context, **comm_output}
        db.commit()

        # Step 2: Knowledge Agent
        knowledge_output = KnowledgeAgent.run(db, inv.id, comm_output)
        inv.workflow_state = "PLANNING"
        inv.context = {**inv.context, **knowledge_output}
        db.commit()

        # Step 3: Planning Agent
        planning_output = PlanningAgent.run(db, inv.id, knowledge_output)
        inv.workflow_state = "AWAITING_APPROVAL"
        inv.context = {**inv.context, **planning_output}
        reduction_amt = abs(knowledge_output.get('historical_approved_cash', 0) - knowledge_output.get('proposed_financial', 0))
        inv.summary = f"Impact analyzed for {knowledge_output.get('sponsor_canonical_name')}: ₹{reduction_amt:,.0f} variance. {len(planning_output.get('proposal_ids', []))} proposals staged."
        
        # Mark source document as processed
        doc.processing_status = "processed"
        doc.extracted_data = comm_output
        db.commit()

        return inv
