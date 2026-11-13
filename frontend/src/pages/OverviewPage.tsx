import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Bot, 
  ArrowUpRight,
  ShieldAlert,
  Zap,
  Clock,
  X,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { KPICard } from '../components/ui/KPICard';
import { CommandBar } from '../components/ui/CommandBar';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div 
        style={{
          backgroundColor: 'var(--sb-elevated, #17243A)',
          opacity: 1,
        }}
        className="px-3.5 py-2.5 rounded-xl border border-sb-primary/70 shadow-2xl text-xs space-y-1 z-[9999] pointer-events-none bg-sb-elevated"
      >
        <div className="font-bold text-sb-text flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.payload?.fill || '#38BDF8' }} />
          <span>{item.name}</span>
        </div>
        <div className="font-mono text-sb-primary font-bold text-sm">
          {formatCurrency(item.value)}
        </div>
        <div className="text-[10px] text-sb-text-secondary">
          {((item.value / 1000000) * 100).toFixed(1)}% of ₹10L budget
        </div>
      </div>
    );
  }
  return null;
};

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useApi(() => api.getDashboard());
  const [showAtRiskModal, setShowAtRiskModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-sb-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card p-6 border-sb-critical/30 text-sb-critical">
        Failed to load dashboard: {error}
      </div>
    );
  }

  const { kpis, sponsor_summary, budget_lines, recent_alerts, pending_approvals, recent_activity } = data;

  const chartData = budget_lines.map((b) => ({
    name: b.category,
    value: b.allocated_amount,
  }));

  const COLORS = ['#38BDF8', '#6366F1', '#22C55E', '#F59E0B', '#EC4899', '#A855F7', '#14B8A6', '#F97316'];

  const atRiskDeliverablesList = [
    {
      id: 1,
      title: 'Logo Placement on Main Stage',
      sponsor: 'NovaTech Pvt Ltd',
      tier: 'Gold Sponsor',
      deadline: '2026-03-10',
      owner: 'Kavita S. (Design Lead)',
      department: 'Creative & Stage Production',
      risk: 'CRITICAL',
      impact: 'Backdrop proof print deadline locked; logo inclusion on hold pending approval of commitment amendment.'
    },
    {
      id: 2,
      title: 'Three Social Media Promotional Posts',
      sponsor: 'NovaTech Pvt Ltd',
      tier: 'Gold Sponsor',
      deadline: '2026-03-12',
      owner: 'Aman Verma (Socials)',
      department: 'Marketing & Outreach',
      risk: 'HIGH',
      impact: 'Marketing calendar slot blocked; promotional copy drafted but release withheld.'
    },
    {
      id: 3,
      title: 'Sponsor Exhibition Booth (Hall A, Stall 12)',
      sponsor: 'NovaTech Pvt Ltd',
      tier: 'Gold Sponsor',
      deadline: '2026-03-18',
      owner: 'Rohan P. (Stall Manager)',
      department: 'Logistics & Infrastructure',
      risk: 'HIGH',
      impact: 'Stall reservation in prime tech pavilion; waitlist sponsors ready to reoccupy if downgraded.'
    },
    {
      id: 4,
      title: 'Brochure & Event Handbook Full-Page Feature',
      sponsor: 'NovaTech Pvt Ltd',
      tier: 'Gold Sponsor',
      deadline: '2026-03-08',
      owner: 'Print Coordinator',
      department: 'Editorial & Print Media',
      risk: 'MEDIUM',
      impact: 'Handbook press run scheduled; sponsor profile may need replacement or scaling to half-page.'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-sb-text">Command Centre</h1>
          <p className="text-sm text-sb-text-secondary mt-0.5">
            Real-time event health, sponsor commitments, and operational dependencies.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => navigate('/inbox')}
            className="btn-secondary text-xs flex items-center space-x-1.5"
          >
            <span>Process Ingestion</span>
          </button>
          <button
            onClick={() => navigate('/impact')}
            className="btn-primary text-xs flex items-center space-x-1.5 shadow-md shadow-sb-primary/20"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Open Impact Studio</span>
          </button>
        </div>
      </div>

      {/* Global AI Command Bar */}
      <CommandBar />

      {/* 6 Key Performance Indicator Cards (All Clickable) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          title="Committed Sponsorship"
          value={formatCurrency(kpis.total_sponsorship_committed)}
          subtitle="8 Active Partners"
          icon={DollarSign}
          status="normal"
          onClick={() => navigate('/sponsors')}
        />
        <KPICard
          title="Received Funds"
          value={formatCurrency(kpis.actual_sponsorship_received)}
          subtitle="Collected so far"
          icon={CheckCircle2}
          status="success"
          onClick={() => navigate('/sponsors')}
        />
        <KPICard
          title="Budget Remaining"
          value={formatCurrency(kpis.budget_remaining)}
          subtitle="Of ₹10,00,000"
          icon={TrendingDown}
          status="normal"
          onClick={() => setShowBudgetModal(true)}
        />
        <KPICard
          title="At-Risk Deliverables"
          value={kpis.at_risk_deliverables}
          subtitle="Click to view all"
          icon={AlertTriangle}
          status={kpis.at_risk_deliverables > 0 ? 'critical' : 'normal'}
          onClick={() => setShowAtRiskModal(true)}
        />
        <KPICard
          title="Pending Approvals"
          value={kpis.pending_approvals}
          subtitle="Click to review"
          icon={ShieldAlert}
          status={kpis.pending_approvals > 0 ? 'warning' : 'normal'}
          onClick={() => navigate('/approvals')}
        />
        <KPICard
          title="Active Workflows"
          value={kpis.active_workflows}
          subtitle="Multi-agent teams"
          icon={Bot}
          status="normal"
          onClick={() => navigate('/agents')}
        />
      </div>

      {/* Main Grid: Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Allocation Chart */}
        <div 
          onClick={() => setShowBudgetModal(true)}
          className="card p-5 lg:col-span-1 flex flex-col justify-between cursor-pointer hover:border-sb-primary/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-sb-text group-hover:text-sb-primary transition-colors flex items-center space-x-1.5">
              <span>Budget Allocation</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <span className="text-xs text-sb-text-secondary">₹10,00,000 Target</span>
          </div>
          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomPieTooltip />} 
                  wrapperStyle={{ zIndex: 9999, outline: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <span className="text-xs text-sb-text-secondary">Allocated</span>
              <div className="text-sm font-bold text-sb-text">100%</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-sb-text-secondary mt-2">
            {budget_lines.slice(0, 4).map((b, i) => (
              <div key={b.id} className="flex items-center space-x-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                <span className="truncate">{b.category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Alerts & Highlights */}
        <div className="card p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-sb-text flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-sb-warning" />
              <span>Operational Warnings & Discrepancies</span>
            </h3>
            <span className="text-xs text-sb-text-secondary">{recent_alerts.length} Active Alerts</span>
          </div>

          <div className="space-y-2.5">
            {recent_alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => {
                  if (alert.entity_type === 'deliverable') {
                    setShowAtRiskModal(true);
                  } else {
                    navigate('/impact');
                  }
                }}
                className="p-3.5 rounded-lg border border-sb-border bg-sb-elevated/50 hover:bg-sb-elevated cursor-pointer transition-all flex items-start justify-between group"
              >
                <div className="flex items-start space-x-3">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alert.severity === 'critical' ? 'bg-sb-critical' : 'bg-sb-warning'}`} />
                  <div>
                    <div className="text-xs font-semibold text-sb-text group-hover:text-sb-primary transition-colors">
                      {alert.type.replace(/_/g, ' ')}
                    </div>
                    <p className="text-xs text-sb-text-secondary mt-0.5 leading-relaxed">{alert.message}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-sb-text-secondary group-hover:text-sb-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            ))}
          </div>

          {pending_approvals.length > 0 && (
            <div className="pt-2 border-t border-sb-border flex items-center justify-between">
              <span className="text-xs text-sb-text-secondary">
                {pending_approvals.length} proposed changes awaiting human authorization.
              </span>
              <button
                onClick={() => navigate('/approvals')}
                className="text-xs font-medium text-sb-primary hover:underline flex items-center space-x-1"
              >
                <span>Review Approvals</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sponsor Status Overview Table */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-sb-text">Sponsorship Matrix</h3>
            <p className="text-xs text-sb-text-secondary">Confirmed commitments and current standing</p>
          </div>
          <button
            onClick={() => navigate('/sponsors')}
            className="text-xs text-sb-primary font-medium hover:underline"
          >
            Manage Sponsors in Hub →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sb-border text-sb-text-secondary uppercase tracking-wider">
                <th className="pb-2.5 font-medium">Sponsor</th>
                <th className="pb-2.5 font-medium">Tier</th>
                <th className="pb-2.5 font-medium">Committed</th>
                <th className="pb-2.5 font-medium">Received</th>
                <th className="pb-2.5 font-medium">Status</th>
                <th className="pb-2.5 font-medium">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sb-border/60">
              {sponsor_summary.map((sp) => (
                <tr
                  key={sp.id}
                  onClick={() => navigate(`/sponsors/${sp.id}`)}
                  className="hover:bg-sb-elevated/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 font-medium text-sb-text">{sp.name}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-sb-elevated border border-sb-border text-sb-text">
                      {sp.tier}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-sb-text">{formatCurrency(sp.committed)}</td>
                  <td className="py-2.5 font-mono text-sb-text-secondary">{formatCurrency(sp.received)}</td>
                  <td className="py-2.5">
                    <span className="badge-success">{sp.status}</span>
                  </td>
                  <td className="py-2.5">
                    <span className={sp.risk_level === 'high' ? 'badge-critical' : sp.risk_level === 'medium' ? 'badge-warning' : 'badge-neutral'}>
                      {sp.risk_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* At-Risk Deliverables Inspection Modal */}
      {showAtRiskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-3xl p-6 space-y-4 bg-sb-elevated border-sb-border shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sb-border pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-sb-critical" />
                <div>
                  <h3 className="text-base font-bold text-sb-text">At-Risk Promotional Deliverables</h3>
                  <p className="text-xs text-sb-text-secondary">
                    Deliverables directly endangered by sponsor revisions and vendor deadlines
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAtRiskModal(false)}
                className="text-sb-text-secondary hover:text-sb-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {atRiskDeliverablesList.map((deliv) => (
                <div
                  key={deliv.id}
                  className="p-4 rounded-xl bg-sb-card border border-sb-border hover:border-sb-border/90 space-y-2 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sb-text text-sm">{deliv.title}</span>
                      <span className="badge-critical text-[10px]">{deliv.risk} RISK</span>
                    </div>
                    <span className="font-mono text-sb-warning text-xs font-semibold">
                      Due: {deliv.deadline}
                    </span>
                  </div>

                  <p className="text-sb-text-secondary leading-relaxed bg-sb-elevated p-2.5 rounded-lg border border-sb-border/60">
                    {deliv.impact}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-mono text-sb-text-secondary">
                    <div>Sponsor: <span className="text-sb-text font-medium">{deliv.sponsor}</span></div>
                    <div>Department: <span className="text-sb-text font-medium">{deliv.department}</span></div>
                    <div>Lead: <span className="text-sb-text font-medium">{deliv.owner}</span></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-sb-border flex items-center justify-between">
              <span className="text-xs text-sb-text-secondary">
                View cascading dependency tree in Impact Studio
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAtRiskModal(false)}
                  className="btn-secondary text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowAtRiskModal(false);
                    navigate('/impact');
                  }}
                  className="btn-primary text-xs flex items-center space-x-1"
                >
                  <span>Open Impact Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Details Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl p-6 space-y-4 bg-sb-elevated border-sb-border shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sb-border pb-3">
              <div>
                <h3 className="text-base font-bold text-sb-text">INNOVISION 2026 Budget Ledger</h3>
                <p className="text-xs text-sb-text-secondary">Total Target: ₹10,00,000 INR</p>
              </div>
              <button
                onClick={() => setShowBudgetModal(false)}
                className="text-sb-text-secondary hover:text-sb-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {budget_lines.map((b) => (
                <div key={b.id} className="p-3 rounded-lg bg-sb-card border border-sb-border flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sb-text">{b.category}</div>
                    <div className="text-[11px] text-sb-text-secondary mt-0.5">{b.subcategory}</div>
                    <div className="text-[10px] text-sb-primary font-mono mt-0.5">Funded by: {b.funding_source}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-sb-text font-bold">{formatCurrency(b.allocated_amount)}</div>
                    <div className="text-[11px] text-sb-text-secondary">Spent: {formatCurrency(b.spent_amount)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-sb-border">
              <button onClick={() => setShowBudgetModal(false)} className="btn-secondary text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
