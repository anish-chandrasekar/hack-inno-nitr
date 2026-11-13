import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building, 
  Mail, 
  Phone, 
  FileCheck, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatCurrency, formatDateTime } from '../lib/utils';

export const SponsorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sponsorId = Number(id);
  const { data: sponsor, loading } = useApi(() => api.getSponsor(sponsorId), [sponsorId]);
  const [activeTab, setActiveTab] = useState<'overview' | 'commitments' | 'deliverables' | 'agreements'>('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-sb-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sponsor) {
    return <div className="text-sb-critical">Sponsor not found</div>;
  }

  const finCommitment = sponsor.commitments?.find((c) => c.commitment_type === 'financial');
  const merchCommitment = sponsor.commitments?.find((c) => c.commitment_type === 'merchandise');
  const hasPendingRevision = finCommitment?.status === 'revision_pending';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Back button & Header */}
      <div>
        <button
          onClick={() => navigate('/sponsors')}
          className="text-xs text-sb-text-secondary hover:text-sb-text flex items-center space-x-1 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sponsor Hub</span>
        </button>

        <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-sb-card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-sb-elevated border border-sb-border flex items-center justify-center text-sb-primary font-bold text-lg">
              {sponsor.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-sb-text">{sponsor.name}</h1>
                <span className="badge-info text-xs font-mono">{sponsor.tier} Partner</span>
                <span className={sponsor.risk_level === 'high' ? 'badge-critical' : 'badge-neutral'}>
                  {sponsor.risk_level} risk
                </span>
              </div>
              <p className="text-xs text-sb-text-secondary mt-1">{sponsor.notes}</p>
            </div>
          </div>

          {hasPendingRevision && (
            <button
              onClick={() => navigate('/impact')}
              className="btn-primary text-xs flex items-center space-x-1.5 shadow-md shadow-sb-primary/20 shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Cascading Impact</span>
            </button>
          )}
        </div>
      </div>

      {/* Discrepancy Alert Banner for NovaTech */}
      {hasPendingRevision && (
        <div className="p-4 rounded-xl border border-sb-warning/40 bg-sb-warning/10 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-sb-warning shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-semibold text-sb-text">
              Active Contract Revision Under Review — Historical Record Preserved
            </div>
            <p className="text-sb-text-secondary leading-relaxed">
              An incoming communication proposed reducing the financial commitment from{' '}
              <span className="font-mono text-sb-text font-bold">₹2,00,000</span> to{' '}
              <span className="font-mono text-sb-warning font-bold">₹50,000</span> and withdrawing{' '}
              <span className="font-mono text-sb-critical font-bold">500 merchandise kits</span>.
              The original agreement remains contractually active until a formal amendment is authorized in the Approval Centre.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-sb-border space-x-6 text-xs font-medium">
        {[
          { key: 'overview', label: 'Overview & Contacts' },
          { key: 'commitments', label: `Commitments (${sponsor.commitments?.length || 0})` },
          { key: 'deliverables', label: `Deliverables (${sponsor.deliverables?.length || 0})` },
          { key: 'agreements', label: `Agreements (${sponsor.agreements?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-sb-primary text-sb-primary'
                : 'border-transparent text-sb-text-secondary hover:text-sb-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-5 space-y-3">
            <h3 className="text-xs font-semibold text-sb-text uppercase tracking-wider">Contact Person</h3>
            <div className="space-y-2 text-xs">
              <div className="font-medium text-sb-text">{sponsor.contact_name}</div>
              <div className="flex items-center space-x-2 text-sb-text-secondary">
                <Mail className="w-3.5 h-3.5" />
                <span>{sponsor.contact_email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sb-text-secondary">
                <Phone className="w-3.5 h-3.5" />
                <span>{sponsor.contact_phone}</span>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="text-xs font-semibold text-sb-text uppercase tracking-wider">Approved Cash Commitment</h3>
            <div className="text-2xl font-bold font-mono text-sb-text">
              {formatCurrency(finCommitment?.current_approved_value || 0)}
            </div>
            {hasPendingRevision && (
              <div className="text-xs text-sb-warning flex items-center space-x-1">
                <span>Proposed: {formatCurrency(finCommitment?.proposed_value || 0)}</span>
                <span className="badge-warning text-[10px]">Unapproved Delta: -₹1,50,000</span>
              </div>
            )}
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="text-xs font-semibold text-sb-text uppercase tracking-wider">In-Kind Merchandise</h3>
            <div className="text-2xl font-bold font-mono text-sb-text">
              {merchCommitment ? `${merchCommitment.current_approved_value} Kits` : 'None'}
            </div>
            {hasPendingRevision && merchCommitment && (
              <div className="text-xs text-sb-critical">
                Withdrawal Proposed: 0 Kits remaining
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'commitments' && (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sb-border bg-sb-sidebar/40 text-sb-text-secondary uppercase tracking-wider">
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Description</th>
                <th className="py-3 px-4 font-medium">Original Contract</th>
                <th className="py-3 px-4 font-medium">Current Approved</th>
                <th className="py-3 px-4 font-medium">Proposed Value</th>
                <th className="py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sb-border/60">
              {sponsor.commitments?.map((c) => (
                <tr key={c.id} className="hover:bg-sb-elevated/40">
                  <td className="py-3 px-4 font-medium uppercase font-mono text-sb-primary">
                    {c.commitment_type}
                  </td>
                  <td className="py-3 px-4 text-sb-text">{c.description}</td>
                  <td className="py-3 px-4 font-mono text-sb-text-secondary">
                    {c.commitment_type === 'financial' ? formatCurrency(c.original_value || 0) : `${c.original_value} ${c.unit}`}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-sb-text">
                    {c.commitment_type === 'financial' ? formatCurrency(c.current_approved_value || 0) : `${c.current_approved_value} ${c.unit}`}
                  </td>
                  <td className="py-3 px-4 font-mono text-sb-warning font-semibold">
                    {c.proposed_value !== null ? (c.commitment_type === 'financial' ? formatCurrency(c.proposed_value) : `${c.proposed_value} ${c.unit}`) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={c.status === 'confirmed' ? 'badge-success' : 'badge-warning'}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'deliverables' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sponsor.deliverables?.map((d) => (
            <div key={d.id} className="card p-4 space-y-2 border-sb-border hover:border-sb-border/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-sb-text">{d.title}</span>
                <span className={d.status === 'at_risk' ? 'badge-critical' : 'badge-neutral'}>
                  {d.status}
                </span>
              </div>
              <p className="text-xs text-sb-text-secondary">{d.description}</p>
              <div className="pt-2 border-t border-sb-border flex items-center justify-between text-[11px] text-sb-text-secondary font-mono">
                <span>Owner: {d.owner}</span>
                <span>Deadline: {d.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'agreements' && (
        <div className="space-y-4">
          {sponsor.agreements?.map((ag) => (
            <div key={ag.id} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-sb-text">{ag.title}</h4>
                <span className="badge-success text-xs">Version {ag.version} (Active)</span>
              </div>
              <p className="text-xs text-sb-text-secondary leading-relaxed bg-sb-bg p-3 rounded-lg border border-sb-border font-mono">
                {ag.content}
              </p>
              <div className="text-[11px] text-sb-text-secondary font-mono">
                Executed on: {ag.agreed_date}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
