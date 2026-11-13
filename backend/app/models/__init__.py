from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    tagline = Column(String(512))
    date = Column(String(64))
    venue = Column(String(256))
    status = Column(String(32), default="planning")
    total_budget = Column(Float, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    sponsors = relationship("Sponsor", back_populates="event")
    budget_lines = relationship("BudgetLine", back_populates="event")
    deliverables = relationship("Deliverable", back_populates="event")
    tasks = relationship("Task", back_populates="event")


class Sponsor(Base):
    __tablename__ = "sponsors"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    name = Column(String(256), nullable=False)
    category = Column(String(64))
    tier = Column(String(32))
    contact_name = Column(String(256))
    contact_email = Column(String(256))
    contact_phone = Column(String(64))
    status = Column(String(32), default="active")
    risk_level = Column(String(16), default="low")
    notes = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    event = relationship("Event", back_populates="sponsors")
    commitments = relationship("Commitment", back_populates="sponsor")
    deliverables = relationship("Deliverable", back_populates="sponsor")
    agreements = relationship("Agreement", back_populates="sponsor")


class Agreement(Base):
    __tablename__ = "agreements"
    id = Column(Integer, primary_key=True, index=True)
    sponsor_id = Column(Integer, ForeignKey("sponsors.id"), nullable=False)
    title = Column(String(256))
    content = Column(Text)
    agreed_date = Column(String(64))
    status = Column(String(32), default="active")
    version = Column(Integer, default=1)
    source_document_id = Column(Integer, ForeignKey("source_documents.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    sponsor = relationship("Sponsor", back_populates="agreements")
    source_document = relationship("SourceDocument")


class Commitment(Base):
    __tablename__ = "commitments"
    id = Column(Integer, primary_key=True, index=True)
    sponsor_id = Column(Integer, ForeignKey("sponsors.id"), nullable=False)
    commitment_type = Column(String(32))  # financial, merchandise, service
    description = Column(Text)
    original_value = Column(Float, nullable=True)
    current_approved_value = Column(Float, nullable=True)
    proposed_value = Column(Float, nullable=True)
    unit = Column(String(32), default="INR")
    status = Column(String(32), default="confirmed")  # confirmed, proposed, revision_pending, withdrawn
    source_document_id = Column(Integer, ForeignKey("source_documents.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    sponsor = relationship("Sponsor", back_populates="commitments")
    source_document = relationship("SourceDocument")


class SourceDocument(Base):
    __tablename__ = "source_documents"
    id = Column(Integer, primary_key=True, index=True)
    source_type = Column(String(32))  # email, message, document, spreadsheet, calendar
    title = Column(String(256))
    sender = Column(String(256))
    content = Column(Text)
    raw_content = Column(Text)
    received_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    processing_status = Column(String(32), default="unprocessed")
    extracted_data = Column(JSON, nullable=True)
    is_demo = Column(Boolean, default=True)


class Deliverable(Base):
    __tablename__ = "deliverables"
    id = Column(Integer, primary_key=True, index=True)
    sponsor_id = Column(Integer, ForeignKey("sponsors.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    title = Column(String(256), nullable=False)
    deliverable_type = Column(String(64))  # logo_placement, social_media, booth, merchandise, acknowledgement
    description = Column(Text)
    status = Column(String(32), default="pending")  # pending, in_progress, completed, at_risk, cancelled
    deadline = Column(String(64))
    owner = Column(String(128))
    source_reference = Column(String(256))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    sponsor = relationship("Sponsor", back_populates="deliverables")
    event = relationship("Event", back_populates="deliverables")


class BudgetLine(Base):
    __tablename__ = "budget_lines"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    category = Column(String(128), nullable=False)
    subcategory = Column(String(128))
    allocated_amount = Column(Float, default=0)
    committed_amount = Column(Float, default=0)
    spent_amount = Column(Float, default=0)
    funding_source = Column(String(128))
    status = Column(String(32), default="active")
    notes = Column(Text)
    event = relationship("Event", back_populates="budget_lines")


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    title = Column(String(256), nullable=False)
    description = Column(Text)
    owner = Column(String(128))
    department = Column(String(128))
    deadline = Column(String(64))
    status = Column(String(32), default="pending")  # pending, in_progress, completed, blocked, at_risk
    priority = Column(String(16), default="medium")
    related_entity_type = Column(String(64))
    related_entity_id = Column(Integer)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    event = relationship("Event", back_populates="tasks")


class Dependency(Base):
    __tablename__ = "dependencies"
    id = Column(Integer, primary_key=True, index=True)
    source_entity_type = Column(String(64), nullable=False)
    source_entity_id = Column(Integer, nullable=False)
    target_entity_type = Column(String(64), nullable=False)
    target_entity_id = Column(Integer, nullable=False)
    relationship_type = Column(String(64), nullable=False)
    description = Column(Text)
    source_reference = Column(String(256))
    confidence = Column(Float, default=1.0)
    status = Column(String(32), default="active")


class MemoryFact(Base):
    __tablename__ = "memory_facts"
    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(64))
    entity_id = Column(Integer)
    fact_type = Column(String(64))
    key = Column(String(128))
    value = Column(Text)
    source_document_id = Column(Integer, ForeignKey("source_documents.id"), nullable=True)
    source_reference = Column(String(256))
    confidence = Column(Float, default=1.0)
    status = Column(String(32), default="confirmed")  # confirmed, proposed, conflicting, superseded, rejected, needs_review
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    source_document = relationship("SourceDocument")


class Investigation(Base):
    __tablename__ = "investigations"
    id = Column(Integer, primary_key=True, index=True)
    trigger_source_id = Column(Integer, ForeignKey("source_documents.id"), nullable=True)
    workflow_state = Column(String(32), default="RECEIVED")
    status = Column(String(32), default="active")
    summary = Column(Text)
    context = Column(JSON, nullable=True)  # short-term workflow memory
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    trigger_source = relationship("SourceDocument")
    agent_runs = relationship("AgentRun", back_populates="investigation")
    proposals = relationship("Proposal", back_populates="investigation")


class AgentRun(Base):
    __tablename__ = "agent_runs"
    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id"), nullable=False)
    agent_type = Column(String(32), nullable=False)
    status = Column(String(32), default="pending")  # pending, running, completed, failed, retrying, waiting_approval
    input_summary = Column(Text)
    input_data = Column(JSON, nullable=True)
    output_summary = Column(Text)
    output_data = Column(JSON, nullable=True)
    error = Column(Text)
    tool_calls = Column(JSON, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    investigation = relationship("Investigation", back_populates="agent_runs")


class Proposal(Base):
    __tablename__ = "proposals"
    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id"), nullable=False)
    action_type = Column(String(64), nullable=False)
    entity_type = Column(String(64))
    entity_id = Column(Integer)
    description = Column(Text)
    old_value = Column(Text)
    proposed_value = Column(Text)
    reason = Column(Text)
    evidence_source = Column(String(256))
    risk_level = Column(String(16), default="medium")
    financial_impact = Column(Float, nullable=True)
    affected_dependencies = Column(JSON, nullable=True)
    proposing_agent = Column(String(32))
    approval_status = Column(String(32), default="pending")  # pending, approved, rejected, edited
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    investigation = relationship("Investigation", back_populates="proposals")
    approval = relationship("Approval", back_populates="proposal", uselist=False)
    execution_action = relationship("ExecutionAction", back_populates="proposal", uselist=False)


class Approval(Base):
    __tablename__ = "approvals"
    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id"), nullable=False, unique=True)
    reviewer = Column(String(128), default="organiser")
    decision = Column(String(16))  # approved, rejected
    notes = Column(Text)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    proposal = relationship("Proposal", back_populates="approval")


class ExecutionAction(Base):
    __tablename__ = "execution_actions"
    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id"), nullable=False, unique=True)
    idempotency_key = Column(String(128), unique=True, nullable=False)
    action_type = Column(String(64), nullable=False)
    status = Column(String(32), default="pending")  # pending, executing, completed, failed, retrying
    attempt_count = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    result = Column(JSON, nullable=True)
    error = Column(Text)
    before_snapshot = Column(JSON, nullable=True)
    after_snapshot = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    proposal = relationship("Proposal", back_populates="execution_action")
    verification = relationship("VerificationResult", back_populates="execution_action", uselist=False)


class VerificationResult(Base):
    __tablename__ = "verification_results"
    id = Column(Integer, primary_key=True, index=True)
    execution_action_id = Column(Integer, ForeignKey("execution_actions.id"), nullable=False, unique=True)
    expected_state = Column(JSON)
    actual_state = Column(JSON)
    result = Column(String(16))  # pass, fail, partial
    discrepancies = Column(JSON, nullable=True)
    details = Column(Text)
    verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    execution_action = relationship("ExecutionAction", back_populates="verification")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    actor = Column(String(128), nullable=False)
    action = Column(String(64), nullable=False)
    entity_type = Column(String(64))
    entity_id = Column(Integer)
    description = Column(Text)
    before_value = Column(JSON, nullable=True)
    after_value = Column(JSON, nullable=True)
    source = Column(String(128))
    investigation_id = Column(Integer, ForeignKey("investigations.id"), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# Export all models for init_db
all_models = [
    Event, Sponsor, Agreement, Commitment, SourceDocument, Deliverable,
    BudgetLine, Task, Dependency, MemoryFact, Investigation, AgentRun,
    Proposal, Approval, ExecutionAction, VerificationResult, AuditLog,
]
