import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ShieldAlert, ArrowUpRight, UserCheck } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatCurrency } from '../lib/utils';
import { Sponsor } from '../types';

export const SponsorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: sponsors, loading } = useApi(() => api.getSponsors());
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-sb-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = sponsors?.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.category.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || s.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-sb-text">Sponsor Hub</h1>
          <p className="text-sm text-sb-text-secondary mt-0.5">
            Directory of institutional partners, commitment tracking, and risk analysis.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 card p-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-sb-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sponsors by name or sector..."
            className="w-full bg-sb-bg border border-sb-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-sb-text focus:outline-none focus:border-sb-primary"
          />
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs text-sb-text-secondary">Tier:</span>
          {['ALL', 'Title', 'Platinum', 'Gold', 'Silver'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                tierFilter === tier
                  ? 'bg-sb-primary text-sb-bg'
                  : 'bg-sb-elevated text-sb-text-secondary hover:text-sb-text'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Sponsors Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-sb-border bg-sb-sidebar/40 text-sb-text-secondary uppercase tracking-wider">
              <th className="py-3 px-4 font-medium">Sponsor</th>
              <th className="py-3 px-4 font-medium">Category</th>
              <th className="py-3 px-4 font-medium">Tier</th>
              <th className="py-3 px-4 font-medium">Approved Commitment</th>
              <th className="py-3 px-4 font-medium">Deliverables</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Risk Level</th>
              <th className="py-3 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sb-border/60">
            {filtered?.map((sp) => {
              const fin = sp.commitments?.find((c) => c.commitment_type === 'financial');
              const approvedVal = fin?.current_approved_value || fin?.original_value || 0;
              const isRevisionPending = fin?.status === 'revision_pending';

              return (
                <tr
                  key={sp.id}
                  onClick={() => navigate(`/sponsors/${sp.id}`)}
                  className="hover:bg-sb-elevated/50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-sb-text group-hover:text-sb-primary transition-colors">
                      {sp.name}
                    </div>
                    <div className="text-[11px] text-sb-text-secondary">{sp.contact_name}</div>
                  </td>
                  <td className="py-3 px-4 text-sb-text-secondary">{sp.category}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-sb-elevated border border-sb-border text-sb-text">
                      {sp.tier}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <div className="text-sb-text font-medium">{formatCurrency(approvedVal)}</div>
                    {isRevisionPending && (
                      <div className="text-[10px] text-sb-warning font-sans">
                        Proposed: {formatCurrency(fin?.proposed_value || 0)} (Under Review)
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sb-text-secondary">
                    {sp.deliverables?.length || 0} active
                  </td>
                  <td className="py-3 px-4">
                    <span className={sp.status === 'active' ? 'badge-success' : 'badge-neutral'}>
                      {sp.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={sp.risk_level === 'high' ? 'badge-critical' : sp.risk_level === 'medium' ? 'badge-warning' : 'badge-neutral'}>
                      {sp.risk_level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-xs text-sb-primary font-medium group-hover:underline flex items-center space-x-1 ml-auto">
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
