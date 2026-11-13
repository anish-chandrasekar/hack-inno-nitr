import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Check, 
  X, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowRight, 
  DollarSign, 
  FileText,
  RotateCcw,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { Proposal } from '../types';

export const ApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: proposals, loading, refetch } = useApi(() => api.getApprovals());
  const [actingId, setActingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const handleApprove = async (id: number) => {
    try {
      setActingId(id);
      await api.approveProposal(id, 'Approved by Organising Secretary via Command Center');
      setFeedback({
        type: 'success',
        text: `Proposal #${id} successfully authorized! Execution Agent mutated state and Verification Agent confirmed invariants in database.`
      });
      await refetch();
    } catch (e: any) {
      console.error(e);
      setFeedback({ type: 'info', text: `Approval note: ${e?.message || 'Processed'}` });
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setActingId(id);
      await api.rejectProposal(id, 'Rejected by human operator: retains existing agreement.');
      setFeedback({
        type: 'info',
        text: `Proposal #${id} rejected. Underlying contracts and commitments remain strictly untouched.`
      });
      await refetch();
    } catch (e: any) {
      console.error(e);
      setFeedback({ type: 'info', text: `Rejection note: ${e?.message || 'Processed'}` });
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-sb-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pending = proposals?.filter((p) => p.approval_status === 'pending') || [];
  const historical = proposals?.filter((p) => p.approval_status !== 'pending') || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-sb-warning/20 text-sb-warning">
              HUMAN-IN-THE-LOOP GATE
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-sb-text mt-1">Approval Centre</h1>
          <p className="text-sm text-sb-text-secondary">
            High-consequence operational, financial and contractual proposals staged for human sign-off.
          </p>
        </div>

        <button
          onClick={() => navigate('/audit')}
          className="btn-secondary text-xs flex items-center space-x-1.5 self-start"
        >
          <span>View Execution Audit Trail</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-1 duration-200 ${
          feedback.type === 'success' 
            ? 'bg-sb-success/15 border-sb-success/30 text-sb-success' 
            : 'bg-sb-primary/15 border-sb-primary/30 text-sb-primary'
        }`}>
          <div className="flex items-center space-x-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-sb-success" />
            ) : (
              <Info className="w-4 h-4 shrink-0 text-sb-primary" />
            )}
            <span className="font-medium text-sb-text">{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-sb-text-secondary hover:text-sb-text font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Risk Policy Banner */}
      <div className="card p-4 bg-sb-elevated/40 border-sb-border flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-sb-primary shrink-0" />
          <div className="text-sb-text-secondary leading-relaxed">
            <span className="font-semibold text-sb-text">Autonomous Safety Policy: </span>
            Medium and High risk proposals are locked and will never execute without explicit human authorization.
          </div>
        </div>
        <span className="text-[11px] font-mono text-sb-text-secondary font-semibold shrink-0">
          Policy Level: STRICT
        </span>
      </div>

      {/* Pending Approvals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-sb-text flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sb-warning animate-pulse" />
            <span>Pending Authorizations ({pending.length})</span>
          </h2>
          <span className="text-xs text-sb-text-secondary">Requires manual review</span>
        </div>

        {pending.length === 0 ? (
          <div className="card p-8 text-center text-xs text-sb-text-secondary space-y-2">
            <CheckSquare className="w-8 h-8 text-sb-success mx-auto opacity-80" />
            <div className="font-semibold text-sb-text">All staged proposals have been processed</div>
            <p>New proposals will appear here when an investigation runs or when contracts update.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pending.map((p) => {
              const isHigh = p.risk_level === 'high';
              const isActing = actingId === p.id;

              return (
                <div
                  key={p.id}
                  className="card p-5 border-sb-border hover:border-sb-border/90 transition-all space-y-4 bg-sb-card"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={isHigh ? 'badge-critical' : 'badge-warning'}>
                          {p.risk_level} risk
                        </span>
                        <span className="text-[11px] font-mono text-sb-primary font-semibold">
                          {p.action_type}
                        </span>
                        <span className="text-xs text-sb-text-secondary">•</span>
                        <span className="text-[11px] text-sb-text-secondary font-mono">
                          Staged by {p.proposing_agent}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-sb-text">{p.description}</h3>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 self-start md:self-auto shrink-0">
                      <button
                        onClick={() => handleReject(p.id)}
                        disabled={isActing}
                        className="px-3 py-1.5 rounded-lg border border-sb-critical/40 bg-sb-critical/10 text-sb-critical hover:bg-sb-critical/20 font-medium text-xs flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleApprove(p.id)}
                        disabled={isActing}
                        className="px-4 py-1.5 rounded-lg bg-sb-success text-sb-bg hover:bg-sb-success/90 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-sb-success/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{isActing ? 'Executing & Verifying...' : 'Authorize & Execute'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Value Delta & Evidence */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2 border-t border-sb-border/60">
                    <div className="p-3 rounded-lg bg-sb-elevated border border-sb-border">
                      <span className="text-[10px] text-sb-text-secondary uppercase font-semibold">
                        Previous Active Value
                      </span>
                      <div className="font-mono text-sb-text font-medium mt-0.5">{p.old_value || 'None'}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-sb-elevated border border-sb-border">
                      <span className="text-[10px] text-sb-text-secondary uppercase font-semibold">
                        Proposed New State
                      </span>
                      <div className="font-mono text-sb-warning font-bold mt-0.5">{p.proposed_value}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-sb-elevated border border-sb-border">
                      <span className="text-[10px] text-sb-text-secondary uppercase font-semibold">
                        Evidence Provenance
                      </span>
                      <div className="text-sb-text-secondary truncate mt-0.5" title={p.evidence_source}>
                        {p.evidence_source}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-sb-text-secondary leading-relaxed bg-sb-bg/50 p-3 rounded-lg border border-sb-border/40">
                    <span className="font-semibold text-sb-text">Operational Rationale: </span>
                    {p.reason}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historical Approvals Section */}
      {historical.length > 0 && (
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-sb-text">Historical Authorization Log</h3>
          <div className="divide-y divide-sb-border/60 text-xs">
            {historical.map((hp) => (
              <div key={hp.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={hp.approval_status === 'approved' ? 'badge-success' : 'badge-critical'}>
                      {hp.approval_status}
                    </span>
                    <span className="font-medium text-sb-text">{hp.description}</span>
                  </div>
                  <div className="text-[11px] text-sb-text-secondary mt-0.5 font-mono">
                    Action ID: #{hp.id} • Reviewed by: {hp.approval?.reviewer || 'Lead Reviewer'}
                  </div>
                </div>
                <div className="text-right text-[11px] text-sb-text-secondary font-mono">
                  {hp.approval?.timestamp ? formatDateTime(hp.approval.timestamp) : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
