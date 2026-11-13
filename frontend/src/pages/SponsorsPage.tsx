import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ShieldAlert, ArrowUpRight, UserCheck, Plus, Trash2, X } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatCurrency } from '../lib/utils';
import { Sponsor } from '../types';

export const SponsorsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: sponsors, loading, refetch } = useApi(() => api.getSponsors());
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // New Sponsor Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tier, setTier] = useState('Gold');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [commitmentAmount, setCommitmentAmount] = useState<number>(100000);
  const [notes, setNotes] = useState('');

  const handleCreateSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await api.createSponsor({
        name: name.trim(),
        category,
        tier,
        contact_name: contactName.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        commitment_amount: Number(commitmentAmount) || 0,
        notes: notes.trim()
      });
      setShowAddModal(false);
      setName('');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setCommitmentAmount(100000);
      setNotes('');
      await refetch();
    } catch (err) {
      console.error('Failed to create sponsor:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSponsor = async (e: React.MouseEvent, sponsorId: number, sponsorName: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove "${sponsorName}" and its associated commitments?`)) {
      return;
    }

    try {
      setDeletingId(sponsorId);
      await api.deleteSponsor(sponsorId);
      await refetch();
    } catch (err) {
      console.error('Failed to delete sponsor:', err);
    } finally {
      setDeletingId(null);
    }
  };

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
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs flex items-center space-x-1.5 self-start sm:self-auto shadow-md shadow-sb-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Sponsor</span>
        </button>
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
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sb-border/60">
            {filtered?.map((sp) => {
              const fin = sp.commitments?.find((c) => c.commitment_type === 'financial');
              const approvedVal = fin?.current_approved_value || fin?.original_value || 0;
              const isRevisionPending = fin?.status === 'revision_pending';
              const isDeleting = deletingId === sp.id;

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
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sponsors/${sp.id}`);
                        }}
                        className="text-xs text-sb-primary font-medium hover:underline flex items-center space-x-1"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSponsor(e, sp.id, sp.name)}
                        disabled={isDeleting}
                        title="Remove Sponsor"
                        className="p-1 rounded text-sb-text-secondary hover:text-sb-critical hover:bg-sb-critical/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Sponsor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6 space-y-4 bg-sb-elevated border-sb-border shadow-2xl">
            <div className="flex items-center justify-between border-b border-sb-border pb-3">
              <h3 className="text-base font-bold text-sb-text">Onboard New Sponsor</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-sb-text-secondary hover:text-sb-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSponsor} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-sb-text-secondary block mb-1 font-medium">Sponsor / Company Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Apex AI Systems"
                    className="w-full bg-sb-bg border border-sb-border rounded-lg px-3 py-2 text-sb-text focus:outline-none focus:border-sb-primary"
                  />
                </div>

                <div>
                  <label className="text-sb-text-secondary block mb-1 font-medium">Sponsorship Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full bg-sb-bg border border-sb-border rounded-lg px-3 py-2 text-sb-text focus:outline-none focus:border-sb-primary font-mono"
                  >
                    <option value="Title">Title (₹3,00,000+)</option>
                    <option value="Platinum">Platinum (₹1,50,000+)</option>
                    <option value="Gold">Gold (₹1,00,000+)</option>
                    <option value="Silver">Silver (₹25,000+)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sb-text-secondary block mb-1 font-medium">Industry Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. AI / Cloud / Robotics"
                    className="w-full bg-sb-bg border border-sb-border rounded-lg px-3 py-2 text-sb-text focus:outline-none focus:border-sb-primary"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sb-text-secondary block mb-1 font-medium">Initial Financial Commitment (INR)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={commitmentAmount}
                    onChange={(e) => setCommitmentAmount(Number(e.target.value))}
                    placeholder="e.g. 150000"
                    className="w-full bg-sb-bg border border-sb-border rounded-lg px-3 py-2 text-sb-text font-mono focus:outline-none focus:border-sb-primary"
                  />
                </div>

                <div>
                  <label className="text-sb-text-secondary block mb-1 font-medium">Contact Person</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-sb-bg border border-sb-border rounded-lg px-3 py-2 text-sb-text focus:outline-none focus:border-sb-primary"
                  />
                </div>

                <div>
                  <label className="text-sb-text-secondary block mb-1 font-medium">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="partner@company.com"
                    className="w-full bg-sb-bg border border-sb-border rounded-lg px-3 py-2 text-sb-text focus:outline-none focus:border-sb-primary"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sb-text-secondary block mb-1 font-medium">Notes / Deliverable Expectations</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special arrangements, booth reservations, or branding guidelines..."
                    className="w-full bg-sb-bg border border-sb-border rounded-lg p-2.5 text-sb-text focus:outline-none focus:border-sb-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-sb-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs flex items-center space-x-1"
                >
                  <span>{isSubmitting ? 'Onboarding...' : 'Save & Onboard Sponsor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
