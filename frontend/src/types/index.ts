// Core domain types matching backend schemas

export interface Event {
  id: number;
  name: string;
  tagline: string;
  date: string;
  venue: string;
  status: string;
  total_budget: number;
}

export interface Sponsor {
  id: number;
  event_id: number;
  name: string;
  category: string;
  tier: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  risk_level: string;
  notes: string;
  created_at: string;
  commitments?: Commitment[];
  deliverables?: Deliverable[];
  agreements?: Agreement[];
}

export interface Agreement {
  id: number;
  sponsor_id: number;
  title: string;
  content: string;
  agreed_date: string;
  status: string;
  version: number;
  source_document_id: number | null;
  created_at: string;
}

export interface Commitment {
  id: number;
  sponsor_id: number;
  commitment_type: string;
  description: string;
  original_value: number | null;
  current_approved_value: number | null;
  proposed_value: number | null;
  unit: string;
  status: string;
  source_document_id: number | null;
  created_at: string;
}

export interface SourceDocument {
  id: number;
  source_type: string;
  title: string;
  sender: string;
  content: string;
  received_at: string;
  processing_status: string;
  extracted_data: Record<string, unknown> | null;
  is_demo: boolean;
}

export interface Deliverable {
  id: number;
  sponsor_id: number;
  event_id: number;
  title: string;
  deliverable_type: string;
  description: string;
  status: string;
  deadline: string;
  owner: string;
  source_reference: string;
}

export interface BudgetLine {
  id: number;
  event_id: number;
  category: string;
  subcategory: string;
  allocated_amount: number;
  committed_amount: number;
  spent_amount: number;
  funding_source: string;
  status: string;
  notes: string;
}

export interface Task {
  id: number;
  event_id: number;
  title: string;
  description: string;
  owner: string;
  department: string;
  deadline: string;
  status: string;
  priority: string;
  related_entity_type: string;
  related_entity_id: number;
}

export interface Dependency {
  id: number;
  source_entity_type: string;
  source_entity_id: number;
  target_entity_type: string;
  target_entity_id: number;
  relationship_type: string;
  description: string;
  source_reference: string;
  confidence: number;
  status: string;
}

export interface MemoryFact {
  id: number;
  entity_type: string;
  entity_id: number;
  fact_type: string;
  key: string;
  value: string;
  source_reference: string;
  confidence: number;
  status: string;
  created_at: string;
}

export interface Investigation {
  id: number;
  trigger_source_id: number;
  workflow_state: string;
  status: string;
  summary: string;
  context: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  agent_runs?: AgentRun[];
  proposals?: Proposal[];
}

export interface AgentRun {
  id: number;
  investigation_id: number;
  agent_type: string;
  status: string;
  input_summary: string;
  output_summary: string;
  output_data: Record<string, unknown> | null;
  error: string | null;
  tool_calls: Record<string, unknown>[] | null;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
}

export interface Proposal {
  id: number;
  investigation_id: number;
  action_type: string;
  entity_type: string;
  entity_id: number;
  description: string;
  old_value: string;
  proposed_value: string;
  reason: string;
  evidence_source: string;
  risk_level: string;
  financial_impact: number | null;
  affected_dependencies: Record<string, unknown>[] | null;
  proposing_agent: string;
  approval_status: string;
  created_at: string;
  approval?: Approval;
  execution_action?: ExecutionAction;
}

export interface Approval {
  id: number;
  proposal_id: number;
  reviewer: string;
  decision: string;
  notes: string;
  timestamp: string;
}

export interface ExecutionAction {
  id: number;
  proposal_id: number;
  idempotency_key: string;
  action_type: string;
  status: string;
  attempt_count: number;
  max_attempts: number;
  result: Record<string, unknown> | null;
  error: string | null;
  before_snapshot: Record<string, unknown> | null;
  after_snapshot: Record<string, unknown> | null;
  timestamp: string;
  completed_at: string | null;
  verification?: VerificationResult;
}

export interface VerificationResult {
  id: number;
  execution_action_id: number;
  expected_state: Record<string, unknown>;
  actual_state: Record<string, unknown>;
  result: string;
  discrepancies: Record<string, unknown>[] | null;
  details: string;
  verified_at: string;
}

export interface AuditLog {
  id: number;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: number;
  description: string;
  before_value: Record<string, unknown> | null;
  after_value: Record<string, unknown> | null;
  source: string;
  investigation_id: number | null;
  timestamp: string;
}

export interface DashboardData {
  event: Event;
  kpis: {
    total_sponsorship_committed: number;
    actual_sponsorship_received: number;
    budget_remaining: number;
    at_risk_deliverables: number;
    pending_approvals: number;
    active_workflows: number;
  };
  budget_lines: BudgetLine[];
  sponsor_summary: {
    id: number;
    name: string;
    tier: string;
    committed: number;
    received: number;
    status: string;
    risk_level: string;
  }[];
  recent_alerts: {
    id: string;
    type: string;
    message: string;
    severity: string;
    timestamp: string;
    entity_type?: string;
    entity_id?: number;
  }[];
  recent_activity: AuditLog[];
  pending_approvals: Proposal[];
}

export interface ImpactAnalysis {
  investigation_id: number;
  change_summary: {
    sponsor_name: string;
    sponsor_id: number;
    changes: {
      field: string;
      old_value: string;
      new_value: string;
      change_type: string;
    }[];
  };
  dependency_graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  impact_report: {
    financial_impact: number;
    non_cash_withdrawn: string[];
    affected_deliverables: Deliverable[];
    affected_tasks: Task[];
    affected_deadlines: string[];
    budget_gap: number;
    unresolved_dependencies: number;
    confidence: number;
  };
  recovery_plans: RecoveryPlan[];
}

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  entity_type: string;
  entity_id: number;
  impact_level: 'direct' | 'indirect' | 'unaffected' | 'uncertain';
  status: string;
  data: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship_type: string;
  label: string;
  description: string;
  source_reference: string;
}

export interface RecoveryPlan {
  id: string;
  name: string;
  description: string;
  expected_financial_impact: number;
  affected_tasks: string[];
  advantages: string[];
  risks: string[];
  tradeoffs: string[];
  assumptions: string[];
}

export type AgentType = 'communication' | 'knowledge' | 'planning' | 'execution' | 'verification' | 'coordinator';

export type WorkflowState = 
  | 'RECEIVED' 
  | 'EXTRACTING' 
  | 'RETRIEVING_CONTEXT' 
  | 'CHECKING_CONFLICTS' 
  | 'ANALYSING_IMPACT' 
  | 'PLANNING' 
  | 'AWAITING_APPROVAL' 
  | 'EXECUTING' 
  | 'VERIFYING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'NEEDS_CLARIFICATION';
