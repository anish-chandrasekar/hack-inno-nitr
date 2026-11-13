import React, { useState } from 'react';
import { 
  Bot, 
  MessageSquare, 
  Brain, 
  Compass, 
  Play, 
  CheckCircle2, 
  Network,
  Clock,
  Terminal,
  Activity,
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateTime } from '../lib/utils';
import { AgentRun } from '../types';

export const AgentControlPage: React.FC = () => {
  const { data: runs, loading, refetch } = useApi(() => api.getAgentRuns());
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null);

  const agentsMeta = [
    {
      type: 'communication',
      name: 'Communication Agent',
      icon: MessageSquare,
      role: 'Entity extraction, fact provenance, change classification, ambiguity flagging',
      color: 'text-sb-primary bg-sb-primary/10 border-sb-primary/30',
    },
    {
      type: 'knowledge',
      name: 'Knowledge Agent',
      icon: Brain,
      role: 'Context retrieval, sponsor matching, contract conflict detection, knowledge graph queries',
      color: 'text-sb-secondary bg-sb-secondary/10 border-sb-secondary/30',
    },
    {
      type: 'planning',
      name: 'Planning Agent',
      icon: Compass,
      role: 'Dependency traversal, deterministic arithmetic, adaptive recovery synthesis, proposal staging',
      color: 'text-sb-warning bg-sb-warning/10 border-sb-warning/30',
    },
    {
      type: 'execution',
      name: 'Execution Agent',
      icon: Play,
      role: 'Idempotent state mutation, tool failure resilience, before/after snapshots, audit logging',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      type: 'verification',
      name: 'Verification Agent',
      icon: CheckCircle2,
      role: 'Independent read-back verification, financial invariant checking, discrepancy detection',
      color: 'text-sb-success bg-sb-success/10 border-sb-success/30',
    },
    {
      type: 'coordinator',
      name: 'Coordinator Agent',
      icon: Network,
      role: 'End-to-end state machine, failure recovery, human-in-the-loop gating, retry orchestration',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-sb-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-sb-text">Agent Control Room</h1>
          <p className="text-sm text-sb-text-secondary mt-0.5">
            Real-time status, execution traces, and tool telemetry for the 6 specialised AI agents.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn-secondary text-xs flex items-center space-x-1.5 self-start"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* 6 Specialized Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentsMeta.map((agent) => {
          const Icon = agent.icon;
          // Find latest run for this agent
          const latestRun = runs?.find((r) => r.agent_type === agent.type);
          const status = latestRun ? latestRun.status : 'idle';

          return (
            <div
              key={agent.type}
              onClick={() => latestRun && setSelectedRun(latestRun)}
              className="card p-5 hover:border-sb-border/90 cursor-pointer transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg border ${agent.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={
                      status === 'completed'
                        ? 'badge-success'
                        : status === 'waiting_approval'
                        ? 'badge-warning'
                        : status === 'running'
                        ? 'badge-info'
                        : 'badge-neutral'
                    }
                  >
                    {status.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-sb-text">{agent.name}</h3>
                <p className="text-xs text-sb-text-secondary mt-1 leading-relaxed line-clamp-2">
                  {agent.role}
                </p>
              </div>

              <div className="pt-3 border-t border-sb-border/60 text-xs space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-sb-text-secondary text-[11px]">
                  <span>Last Operation:</span>
                  <span className="text-sb-text truncate max-w-[140px]">
                    {latestRun ? latestRun.output_summary.slice(0, 24) + '...' : 'Standby'}
                  </span>
                </div>
                {latestRun?.duration_ms && (
                  <div className="flex items-center justify-between text-sb-text-secondary text-[11px]">
                    <span>Execution Latency:</span>
                    <span className="text-sb-primary font-bold">{latestRun.duration_ms} ms</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Agent Execution Traces & Tool Calls */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-sb-primary" />
            <h3 className="text-sm font-semibold text-sb-text">Execution History & Tool Telemetry</h3>
          </div>
          <span className="text-xs text-sb-text-secondary font-mono">{runs?.length || 0} Traces Logged</span>
        </div>

        <div className="space-y-3">
          {runs?.map((run) => (
            <div
              key={run.id}
              onClick={() => setSelectedRun(run)}
              className="p-4 rounded-xl bg-sb-elevated/50 border border-sb-border hover:bg-sb-elevated cursor-pointer transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-sb-text capitalize">
                    {run.agent_type} Agent
                  </span>
                  <span className="text-xs text-sb-text-secondary">•</span>
                  <span className="text-[11px] text-sb-text-secondary font-mono">
                    {formatDateTime(run.started_at)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {run.duration_ms && (
                    <span className="text-[10px] font-mono text-sb-text-secondary">{run.duration_ms}ms</span>
                  )}
                  <span
                    className={
                      run.status === 'completed'
                        ? 'badge-success'
                        : run.status === 'waiting_approval'
                        ? 'badge-warning'
                        : 'badge-neutral'
                    }
                  >
                    {run.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-sb-text-secondary leading-relaxed">{run.output_summary}</p>

              {/* Tool calls badges */}
              {run.tool_calls && run.tool_calls.length > 0 && (
                <div className="flex items-center space-x-2 pt-1 overflow-x-auto text-[11px] font-mono">
                  <span className="text-sb-text-secondary">Tools:</span>
                  {run.tool_calls.map((tc: any, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-sb-bg border border-sb-border text-sb-primary">
                      {tc.tool}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl p-6 space-y-4 bg-sb-elevated border-sb-border shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sb-border pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-sb-primary">
                  {selectedRun.agent_type} AGENT TRACE
                </span>
                <h3 className="text-base font-bold text-sb-text">Run #{selectedRun.id} Telemetry</h3>
              </div>
              <button
                onClick={() => setSelectedRun(null)}
                className="text-xs text-sb-text-secondary hover:text-sb-text"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-sb-text-secondary uppercase text-[11px]">Input Summary</span>
                <div className="mt-1 p-3 rounded-lg bg-sb-bg border border-sb-border text-sb-text font-mono">
                  {selectedRun.input_summary}
                </div>
              </div>

              <div>
                <span className="font-semibold text-sb-text-secondary uppercase text-[11px]">Output Result</span>
                <div className="mt-1 p-3 rounded-lg bg-sb-bg border border-sb-border text-sb-text font-mono">
                  {selectedRun.output_summary}
                </div>
              </div>

              {selectedRun.output_data && (
                <div>
                  <span className="font-semibold text-sb-text-secondary uppercase text-[11px]">Structured Output JSON</span>
                  <pre className="mt-1 p-3 rounded-lg bg-sb-bg border border-sb-border text-sb-primary font-mono text-[11px] overflow-x-auto max-h-56">
                    {JSON.stringify(selectedRun.output_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
