import React, { useState } from 'react';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Key, 
  RefreshCw, 
  ArrowUpRight,
  Database,
  Lock
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateTime } from '../lib/utils';
import { AuditLog } from '../types';

export const AuditPage: React.FC = () => {
  const { data: logs, loading, refetch } = useApi(() => api.getAuditLogs());
  const { data: approvals } = useApi(() => api.getApprovals());
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-sb-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter executed actions from approvals
  const executedActions = approvals?.filter((p) => p.execution_action !== null && p.execution_action !== undefined) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-400">
              RELIABLE EXECUTION & VERIFICATION
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-sb-text mt-1">Execution & Audit Centre</h1>
          <p className="text-sm text-sb-text-secondary">
            Immutable log of state mutations, idempotency guarantees, and independent read-back verification.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="btn-secondary text-xs flex items-center space-x-1.5 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* Verified Execution Actions (Differentiator D) */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-sb-success" />
            <h3 className="text-sm font-semibold text-sb-text">
              Verified State Mutations ({executedActions.length})
            </h3>
          </div>
          <span className="text-xs text-sb-text-secondary font-mono">Idempotency Checked • DB Read-Back Confirmed</span>
        </div>

        {executedActions.length === 0 ? (
          <div className="p-6 text-center text-xs text-sb-text-secondary bg-sb-elevated/40 rounded-xl border border-sb-border">
            No executed proposals yet. Authorize a proposal in the Approval Centre to view live verified execution.
          </div>
        ) : (
          <div className="space-y-3">
            {executedActions.map((item) => {
              const ea = item.execution_action;
              const vr = ea?.verification;
              const isPass = vr?.result === 'pass';

              return (
                <div
                  key={ea?.id}
                  className="p-4 rounded-xl bg-sb-elevated/60 border border-sb-border space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="badge-info text-[11px] font-mono">{ea?.action_type}</span>
                      <span className="text-xs font-bold text-sb-text">{item.description}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-sb-text-secondary">
                        Attempts: {ea?.attempt_count}
                      </span>
                      <span className={isPass ? 'badge-success' : 'badge-critical'}>
                        {isPass ? 'VERIFIED IN DATABASE' : 'VERIFICATION FAILED'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2 border-t border-sb-border/60">
                    <div>
                      <span className="text-[10px] text-sb-text-secondary uppercase font-semibold font-mono flex items-center space-x-1">
                        <Key className="w-3 h-3 text-sb-primary" />
                        <span>Idempotency Key</span>
                      </span>
                      <div className="font-mono text-sb-primary text-[11px] truncate mt-0.5">
                        {ea?.idempotency_key}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-sb-text-secondary uppercase font-semibold font-mono flex items-center space-x-1">
                        <Database className="w-3 h-3 text-sb-success" />
                        <span>Independent Read-Back</span>
                      </span>
                      <div className="text-sb-text text-[11px] truncate mt-0.5">
                        {vr?.details || 'Database state validated'}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-sb-text-secondary uppercase font-semibold font-mono">
                        Executed Timestamp
                      </span>
                      <div className="font-mono text-sb-text-secondary text-[11px] mt-0.5">
                        {ea?.completed_at ? formatDateTime(ea.completed_at) : 'In progress'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comprehensive Audit Logs Table */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-sb-primary" />
            <h3 className="text-sm font-semibold text-sb-text">Complete Event Audit Trail</h3>
          </div>
          <span className="text-xs text-sb-text-secondary font-mono">{logs?.length || 0} Events Recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sb-border bg-sb-sidebar/40 text-sb-text-secondary uppercase tracking-wider">
                <th className="py-2.5 px-3 font-medium">Actor</th>
                <th className="py-2.5 px-3 font-medium">Action</th>
                <th className="py-2.5 px-3 font-medium">Entity</th>
                <th className="py-2.5 px-3 font-medium">Description</th>
                <th className="py-2.5 px-3 font-medium">Source</th>
                <th className="py-2.5 px-3 font-medium text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sb-border/60">
              {logs?.map((l) => (
                <tr key={l.id} className="hover:bg-sb-elevated/40 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-sb-text font-mono">{l.actor}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sb-elevated border border-sb-border text-sb-primary">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-sb-text-secondary font-mono">
                    {l.entity_type} #{l.entity_id}
                  </td>
                  <td className="py-2.5 px-3 text-sb-text/90 max-w-sm truncate" title={l.description}>
                    {l.description}
                  </td>
                  <td className="py-2.5 px-3 text-sb-text-secondary font-mono text-[11px] max-w-xs truncate" title={l.source}>
                    {l.source}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-sb-text-secondary text-[11px]">
                    {formatDateTime(l.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
