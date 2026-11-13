from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Any


class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    tagline: str | None = None
    date: str | None = None
    venue: str | None = None
    status: str | None = None
    total_budget: float = 0
    created_at: datetime | None = None


class CommitmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    sponsor_id: int
    commitment_type: str | None = None
    description: str | None = None
    original_value: float | None = None
    current_approved_value: float | None = None
    proposed_value: float | None = None
    unit: str | None = "INR"
    status: str | None = "confirmed"
    source_document_id: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class AgreementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    sponsor_id: int
    title: str | None = None
    content: str | None = None
    agreed_date: str | None = None
    status: str | None = "active"
    version: int = 1
    source_document_id: int | None = None
    created_at: datetime | None = None


class DeliverableResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    sponsor_id: int
    event_id: int
    title: str
    deliverable_type: str | None = None
    description: str | None = None
    status: str | None = "pending"
    deadline: str | None = None
    owner: str | None = None
    source_reference: str | None = None
    created_at: datetime | None = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    event_id: int
    title: str
    description: str | None = None
    owner: str | None = None
    department: str | None = None
    deadline: str | None = None
    status: str | None = "pending"
    priority: str | None = "medium"
    related_entity_type: str | None = None
    related_entity_id: int | None = None
    created_at: datetime | None = None


class SponsorSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    event_id: int
    name: str
    category: str | None = None
    tier: str | None = None
    contact_name: str | None = None
    contact_email: str | None = None
    status: str | None = "active"
    risk_level: str | None = "low"
    total_committed: float = 0
    commitments: list[CommitmentResponse] = []


class SponsorDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    event_id: int
    name: str
    category: str | None = None
    tier: str | None = None
    contact_name: str | None = None
    contact_email: str | None = None
    contact_phone: str | None = None
    status: str | None = "active"
    risk_level: str | None = "low"
    notes: str | None = None
    created_at: datetime | None = None
    total_committed: float = 0
    commitments: list[CommitmentResponse] = []
    deliverables: list[DeliverableResponse] = []
    agreements: list[AgreementResponse] = []
    tasks: list[TaskResponse] = []


class BudgetLineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    event_id: int
    category: str
    subcategory: str | None = None
    allocated_amount: float = 0
    committed_amount: float = 0
    spent_amount: float = 0
    funding_source: str | None = None
    status: str | None = "active"
    notes: str | None = None


class BudgetSummary(BaseModel):
    total_budget: float = 0
    total_allocated: float = 0
    total_committed: float = 0
    total_spent: float = 0
    remaining: float = 0
    gap: float = 0
    lines: list[BudgetLineResponse] = []


class SourceDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    source_type: str | None = None
    title: str | None = None
    sender: str | None = None
    content: str | None = None
    raw_content: str | None = None
    received_at: datetime | None = None
    processing_status: str | None = "unprocessed"
    extracted_data: Any = None
    is_demo: bool = True


class MemoryFactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    entity_type: str | None = None
    entity_id: int | None = None
    fact_type: str | None = None
    key: str | None = None
    value: str | None = None
    source_reference: str | None = None
    confidence: float = 1.0
    status: str | None = "confirmed"
    created_at: datetime | None = None


class VerificationResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    execution_action_id: int
    expected_state: Any = None
    actual_state: Any = None
    result: str | None = None
    discrepancies: Any = None
    details: str | None = None
    verified_at: datetime | None = None


class ExecutionActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    proposal_id: int
    idempotency_key: str
    action_type: str
    status: str | None = "pending"
    attempt_count: int = 0
    max_attempts: int = 3
    result: Any = None
    error: str | None = None
    before_snapshot: Any = None
    after_snapshot: Any = None
    timestamp: datetime | None = None
    completed_at: datetime | None = None
    verification: VerificationResultResponse | None = None


class ApprovalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    proposal_id: int
    reviewer: str | None = "organiser"
    decision: str | None = None
    notes: str | None = None
    timestamp: datetime | None = None


class ProposalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    investigation_id: int
    action_type: str
    entity_type: str | None = None
    entity_id: int | None = None
    description: str | None = None
    old_value: str | None = None
    proposed_value: str | None = None
    reason: str | None = None
    evidence_source: str | None = None
    risk_level: str | None = "medium"
    financial_impact: float | None = None
    affected_dependencies: Any = None
    proposing_agent: str | None = None
    approval_status: str | None = "pending"
    created_at: datetime | None = None
    approval: ApprovalResponse | None = None
    execution_action: ExecutionActionResponse | None = None


class AgentRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    investigation_id: int
    agent_type: str
    status: str | None = "pending"
    input_summary: str | None = None
    input_data: Any = None
    output_summary: str | None = None
    output_data: Any = None
    error: str | None = None
    tool_calls: Any = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    duration_ms: int | None = None


class InvestigationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    trigger_source_id: int | None = None
    workflow_state: str | None = "RECEIVED"
    status: str | None = "active"
    summary: str | None = None
    context: Any = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class InvestigationDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    trigger_source_id: int | None = None
    workflow_state: str | None = "RECEIVED"
    status: str | None = "active"
    summary: str | None = None
    context: Any = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    agent_runs: list[AgentRunResponse] = []
    proposals: list[ProposalResponse] = []


class DependencyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    source_entity_type: str
    source_entity_id: int
    target_entity_type: str
    target_entity_id: int
    relationship_type: str
    description: str | None = None
    source_reference: str | None = None
    confidence: float = 1.0
    status: str | None = "active"


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    actor: str
    action: str
    entity_type: str | None = None
    entity_id: int | None = None
    description: str | None = None
    before_value: Any = None
    after_value: Any = None
    source: str | None = None
    investigation_id: int | None = None
    timestamp: datetime | None = None


class RecoveryPlan(BaseModel):
    id: str
    name: str
    description: str
    actions: list[dict[str, Any]] = []
    financial_impact: float = 0
    feasibility: str = "medium"
    risk_level: str = "medium"


class AffectedEntity(BaseModel):
    entity_type: str
    entity_id: int
    name: str = ""
    impact: str = ""
    current_value: Any = None
    proposed_value: Any = None


class ImpactAnalysis(BaseModel):
    financial_impact: float = 0
    original_value: float = 0
    proposed_value: float = 0
    revenue_gap: float = 0
    affected_entities: list[AffectedEntity] = []
    dependency_chain: list[DependencyResponse] = []
    recovery_plans: list[RecoveryPlan] = []
    risk_assessment: str = "medium"
    summary: str = ""


class AlertItem(BaseModel):
    type: str
    severity: str
    message: str
    entity_type: str | None = None
    entity_id: int | None = None


class ActivityItem(BaseModel):
    timestamp: datetime | None = None
    actor: str = ""
    action: str = ""
    description: str = ""


class DashboardResponse(BaseModel):
    event: EventResponse | None = None
    total_sponsors: int = 0
    total_budget: float = 0
    total_sponsorship: float = 0
    budget_utilization: float = 0
    sponsor_tiers: dict[str, int] = {}
    alerts: list[AlertItem] = []
    recent_activity: list[ActivityItem] = []
    sponsors: list[SponsorSummary] = []
    budget_summary: BudgetSummary | None = None
    active_investigations: int = 0
    pending_approvals: int = 0


class EntitySearchResult(BaseModel):
    entity_type: str
    entity_id: int
    name: str = ""
    description: str = ""
    relevance: float = 1.0


class QueryResponse(BaseModel):
    query: str
    results: list[EntitySearchResult] = []
    context: list[MemoryFactResponse] = []
    total: int = 0
