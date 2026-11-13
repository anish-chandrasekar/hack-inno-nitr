const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: () => request<import('../types').DashboardData>('/dashboard'),

  // Sponsors
  getSponsors: () => request<import('../types').Sponsor[]>('/sponsors'),
  getSponsor: (id: number) => request<import('../types').Sponsor>(`/sponsors/${id}`),

  // Sources / Inbox
  getSources: () => request<import('../types').SourceDocument[]>('/sources'),
  ingest: (data: { content: string; source_type: string; title: string; sender?: string }) =>
    request<import('../types').SourceDocument>('/ingest', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Tasks
  getTasks: () => request<import('../types').Task[]>('/tasks'),

  // Budgets
  getBudgets: () => request<import('../types').BudgetLine[]>('/budgets'),

  // Investigations
  runInvestigation: (sourceId: number) =>
    request<import('../types').Investigation>('/investigations/run', {
      method: 'POST',
      body: JSON.stringify({ source_document_id: sourceId }),
    }),
  getInvestigations: () => request<import('../types').Investigation[]>('/investigations'),
  getInvestigation: (id: number) => request<import('../types').Investigation>(`/investigations/${id}`),
  getImpact: (id: number) => request<import('../types').ImpactAnalysis>(`/investigations/${id}/impact`),

  // Agents
  getAgentRuns: (investigationId?: number) =>
    request<import('../types').AgentRun[]>(
      investigationId ? `/agents/runs?investigation_id=${investigationId}` : '/agents/runs'
    ),

  // Approvals
  getApprovals: () => request<import('../types').Proposal[]>('/approvals'),
  approveProposal: (id: number, notes?: string) =>
    request<import('../types').Approval>(`/approvals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  rejectProposal: (id: number, notes?: string) =>
    request<import('../types').Approval>(`/approvals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  // Execution
  retryExecution: (id: number) =>
    request<import('../types').ExecutionAction>(`/executions/${id}/retry`, {
      method: 'POST',
    }),

  // Audit
  getAuditLogs: () => request<import('../types').AuditLog[]>('/audit'),

  // Dependencies
  getDependencies: (entityType: string, entityId: number) =>
    request<import('../types').Dependency[]>(`/entities/${entityType}/${entityId}/dependencies`),

  // Demo
  resetDemo: () => request<{ status: string }>('/demo/reset', { method: 'POST' }),
  loadScenario: (scenario: string) =>
    request<{ status: string }>(`/demo/scenario/${scenario}`, { method: 'POST' }),

  // AI Query
  query: (question: string, investigationId?: number) =>
    request<{ answer: string; sources: string[]; confidence: number }>('/query', {
      method: 'POST',
      body: JSON.stringify({ question, investigation_id: investigationId }),
    }),
};
