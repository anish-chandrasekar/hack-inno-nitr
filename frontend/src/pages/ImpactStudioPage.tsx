import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  AlertTriangle, 
  ArrowRight, 
  TrendingDown, 
  CheckCircle2, 
  Package, 
  Layers, 
  FileText, 
  DollarSign,
  ShieldAlert,
  Zap,
  Info
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatCurrency } from '../lib/utils';
import { ImpactAnalysis, GraphNode } from '../types';

// Custom Node for React Flow
const CustomNode = ({ data }: { data: any }) => {
  const borderColors: Record<string, string> = {
    direct: 'border-sb-critical bg-sb-critical/10 text-sb-critical',
    indirect: 'border-sb-warning bg-sb-warning/10 text-sb-warning',
    unaffected: 'border-sb-border bg-sb-card text-sb-text',
    uncertain: 'border-sb-secondary bg-sb-secondary/10 text-sb-secondary border-dashed',
  };

  const levelColor = borderColors[data.impact_level] || borderColors.unaffected;

  return (
    <div className={`px-4 py-3 rounded-xl border-2 shadow-lg min-w-[200px] ${levelColor} bg-sb-elevated/95 backdrop-blur-md`}>
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-sb-primary" />
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase font-mono font-bold tracking-wider opacity-80">
          {data.entity_type}
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase bg-sb-bg/80">
          {data.impact_level}
        </span>
      </div>
      <div className="text-xs font-bold text-sb-text truncate">{data.label}</div>
      {data.subtext && (
        <div className="text-[10px] text-sb-text-secondary mt-1 font-mono truncate">{data.subtext}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-sb-primary" />
    </div>
  );
};

const nodeTypes = {
  sponsorNode: CustomNode,
  commitmentNode: CustomNode,
  deliverableNode: CustomNode,
  taskNode: CustomNode,
  budgetNode: CustomNode,
};

export const ImpactStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlInvId = searchParams.get('investigation_id');
  const { data: investigations } = useApi(() => api.getInvestigations());
  const [selectedInvId, setSelectedInvId] = useState<number>(urlInvId ? Number(urlInvId) : 1);
  const [impactData, setImpactData] = useState<ImpactAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlanTab, setSelectedPlanTab] = useState<'plan_a' | 'plan_b' | 'plan_c'>('plan_a');
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);

  useEffect(() => {
    if (urlInvId) {
      setSelectedInvId(Number(urlInvId));
    } else if (investigations && investigations.length > 0) {
      setSelectedInvId(investigations[0].id);
    }
  }, [urlInvId, investigations]);

  const handleSelectInvestigation = (id: number) => {
    setSelectedInvId(id);
    setSearchParams({ investigation_id: String(id) });
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchImpact() {
      try {
        setLoading(true);
        const data = await api.getImpact(selectedInvId || 1);
        if (isMounted) setImpactData(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchImpact();
    return () => { isMounted = false; };
  }, [selectedInvId]);

  // Compute positions for React Flow nodes
  const flowNodes: Node[] = useMemo(() => {
    if (!impactData?.dependency_graph?.nodes) return [];
    
    // Group by entity type for clean hierarchical layout
    const layers: Record<string, GraphNode[]> = {
      sponsor: [],
      commitment: [],
      budget_line: [],
      deliverable: [],
      task: []
    };

    impactData.dependency_graph.nodes.forEach(n => {
      if (layers[n.entity_type]) {
        layers[n.entity_type].push(n);
      } else {
        layers['task'].push(n);
      }
    });

    const positions: Node[] = [];
    let currentY = 40;

    const layerKeys = ['sponsor', 'commitment', 'budget_line', 'deliverable', 'task'];
    layerKeys.forEach((key) => {
      const items = layers[key];
      const count = items.length;
      const spacingX = 260;
      const startX = Math.max(50, 500 - ((count - 1) * spacingX) / 2);

      items.forEach((item, index) => {
        positions.push({
          id: item.id,
          type: item.type || 'sponsorNode',
          position: { x: startX + index * spacingX, y: currentY },
          width: 220,
          height: 75,
          initialWidth: 220,
          initialHeight: 75,
          style: { width: 220, height: 75 },
          data: {
            ...item.data,
            label: item.label,
            entity_type: item.entity_type,
            impact_level: item.impact_level,
            subtext: item.data?.reduction ? `-₹${Number(item.data.reduction).toLocaleString('en-IN')}` : item.data?.deadline
          }
        });
      });
      currentY += 140;
    });

    return positions;
  }, [impactData]);

  const flowEdges: Edge[] = useMemo(() => {
    if (!impactData?.dependency_graph?.edges) return [];
    return impactData.dependency_graph.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: true,
      style: { stroke: '#38BDF8', strokeWidth: 2 },
      labelStyle: { fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' },
      labelBgStyle: { fill: '#17243A', stroke: '#243249' }
    }));
  }, [impactData]);

  if (loading && !impactData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-sb-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const changeSummary = impactData?.change_summary;
  const report = impactData?.impact_report;
  const plans = impactData?.recovery_plans || [];
  const activePlan = plans.find((p) => p.id === selectedPlanTab) || plans[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-sb-primary/20 text-sb-primary">
              FLAGSHIP ENGINE
            </span>
            <span className="text-xs text-sb-text-secondary font-mono">
              Investigation #{selectedInvId}
            </span>
            {investigations && investigations.length > 1 && (
              <select
                value={selectedInvId}
                onChange={(e) => handleSelectInvestigation(Number(e.target.value))}
                className="bg-sb-elevated border border-sb-border rounded px-2 py-0.5 text-xs text-sb-text font-mono focus:outline-none focus:border-sb-primary ml-2"
              >
                {investigations.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    Investigation #{inv.id}: {inv.summary ? inv.summary.slice(0, 35) + '...' : `Case #${inv.id}`}
                  </option>
                ))}
              </select>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-sb-text mt-1">
            Impact Studio & Dependency Intelligence
          </h1>
          <p className="text-sm text-sb-text-secondary">
            Cascading change propagation, structural dependency traversal, and adaptive replanning.
          </p>
        </div>

        <button
          onClick={() => navigate('/approvals')}
          className="btn-primary text-xs flex items-center space-x-1.5 shadow-lg shadow-sb-primary/20 self-start md:self-auto"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Proceed to Human Approvals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* TOP SECTION: Change Summary (Before vs After) */}
      <div className="card p-5 bg-sb-card border-sb-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-sb-text uppercase tracking-wider flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-sb-warning" />
            <span>Root Trigger: {changeSummary?.sponsor_name} Commitment Amendment</span>
          </h3>
          <span className="badge-warning text-xs font-mono">UNAUTHORIZED PROPOSAL</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {changeSummary?.changes.map((ch, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-sb-elevated/70 border border-sb-border space-y-2">
              <div className="font-semibold text-sb-text-secondary text-[11px] uppercase tracking-wider">
                {ch.field}
              </div>
              <div className="flex items-center space-x-2">
                <span className="line-through text-sb-text-secondary font-mono">{ch.old_value}</span>
                <span className="text-sb-border font-bold">→</span>
                <span className="font-bold text-sb-warning font-mono">{ch.new_value}</span>
              </div>
              <div className="text-[10px] font-mono text-sb-critical font-medium">
                {ch.change_type}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MIDDLE SECTION: Interactive Dependency Graph (React Flow) */}
      <div className="card overflow-hidden border-sb-border flex flex-col h-[520px] relative">
        <div className="p-3 border-b border-sb-border bg-sb-sidebar/70 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-sb-text uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-sb-primary" />
              <span>Multi-Tier Dependency Graph</span>
            </span>
            <div className="flex items-center space-x-2 text-[10px]">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-sb-critical" /><span>Direct Impact</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-sb-warning" /><span>Indirect Impact</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-sb-border" /><span>Unaffected</span></span>
            </div>
          </div>
          <span className="text-xs text-sb-text-secondary font-mono">
            {flowNodes.length} Nodes • {flowEdges.length} Typed Relations
          </span>
        </div>

        <div className="flex-1 w-full h-full bg-[#080E1A]">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedNodeData(node.data)}
            fitView
          >
            <Background color="#17243A" gap={16} />
            <Controls className="bg-sb-elevated border border-sb-border fill-sb-text text-sb-text" />
            <MiniMap 
              style={{
                width: 220,
                height: 140,
                backgroundColor: '#0F172A',
              }}
              nodeColor={(node: any) => {
                const impact = node.data?.impact_level;
                if (impact === 'direct' || impact === 'critical' || impact === 'high') return '#EF4444';
                if (impact === 'indirect' || impact === 'medium') return '#F59E0B';
                if (impact === 'uncertain') return '#818CF8';
                const type = node.data?.entity_type;
                if (type === 'sponsor') return '#38BDF8';
                if (type === 'commitment') return '#60A5FA';
                if (type === 'budget_line' || type === 'budget') return '#A855F7';
                if (type === 'deliverable') return '#22C55E';
                if (type === 'task') return '#EC4899';
                return '#38BDF8';
              }}
              nodeStrokeColor="#FFFFFF"
              nodeStrokeWidth={2}
              nodeBorderRadius={4}
              maskColor="rgba(56, 189, 248, 0.18)"
              maskStrokeColor="#38BDF8"
              maskStrokeWidth={2}
              zoomable
              pannable
              className="!border-2 !border-sb-primary/60 !rounded-xl !shadow-2xl overflow-hidden !m-3"
            />
          </ReactFlow>
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNodeData && (
          <div className="absolute left-4 bottom-4 w-80 card p-4 bg-sb-elevated/95 border-sb-primary/40 shadow-2xl z-20 space-y-2 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-sb-primary uppercase font-bold">
                {selectedNodeData.entity_type}
              </span>
              <button
                onClick={() => setSelectedNodeData(null)}
                className="text-xs text-sb-text-secondary hover:text-sb-text"
              >
                ✕
              </button>
            </div>
            <div className="text-xs font-bold text-sb-text">{selectedNodeData.label}</div>
            <div className="text-xs text-sb-text-secondary space-y-1 pt-1 font-mono text-[11px]">
              <div>Impact Level: <span className="text-sb-warning">{selectedNodeData.impact_level}</span></div>
              {selectedNodeData.deadline && <div>Deadline: {selectedNodeData.deadline}</div>}
              {selectedNodeData.owner && <div>Assigned: {selectedNodeData.owner}</div>}
              {selectedNodeData.reduction && <div>Variance: -₹{Number(selectedNodeData.reduction).toLocaleString('en-IN')}</div>}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: Impact Report + Adaptive Recovery Planning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Impact Report Summary */}
        <div className="lg:col-span-5 card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-sb-border pb-3">
            <h3 className="text-xs font-semibold text-sb-text uppercase tracking-wider flex items-center space-x-1.5">
              <TrendingDown className="w-4 h-4 text-sb-critical" />
              <span>Cascading Impact Report</span>
            </h3>
            <span className="text-[11px] font-mono text-sb-success font-semibold">98% Confidence</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-sb-elevated border border-sb-border">
              <span className="text-[11px] text-sb-text-secondary">Cash Funding Deficit</span>
              <div className="text-lg font-bold font-mono text-sb-critical mt-1">
                -₹{Math.abs(report?.financial_impact || 150000).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-sb-elevated border border-sb-border">
              <span className="text-[11px] text-sb-text-secondary">In-Kind Deficit</span>
              <div className="text-lg font-bold font-mono text-sb-warning mt-1">
                500 Delegate Kits
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-sb-text font-medium">Deliverables Directly At Risk (4):</div>
            <ul className="space-y-1 text-sb-text-secondary pl-2">
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sb-critical" />
                <span>Main Stage Backdrop NovaTech Logo Placement</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sb-critical" />
                <span>3 Dedicated Social Media Promotional Posts</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sb-warning" />
                <span>Hall A Booth 12 Stall Demarcation</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sb-warning" />
                <span>Event Handbook Full-Page Feature</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-sb-bg border border-sb-border text-xs text-sb-text-secondary space-y-1 font-mono">
            <div className="font-semibold text-sb-text">Critical Deadlines Impending:</div>
            <div>• March 05: Delegate kit vendor packaging contract sign-off</div>
            <div>• March 09: Main Stage backdrop flex printing final proof</div>
          </div>
        </div>

        {/* Adaptive Recovery Planning (Differentiator C) */}
        <div className="lg:col-span-7 card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-sb-border pb-3">
            <div>
              <h3 className="text-xs font-semibold text-sb-text uppercase tracking-wider flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-sb-primary" />
                <span>Adaptive Recovery Strategies (Planning Agent)</span>
              </h3>
              <p className="text-xs text-sb-text-secondary mt-0.5">
                Deterministic trade-off evaluations based on live budget figures
              </p>
            </div>
          </div>

          {/* Plan Selector Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {plans.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlanTab(p.id as any)}
                className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                  selectedPlanTab === p.id
                    ? 'border-sb-primary bg-sb-primary/10 text-sb-text shadow-sm'
                    : 'border-sb-border bg-sb-elevated/60 text-sb-text-secondary hover:text-sb-text'
                }`}
              >
                <div className="font-bold truncate">{p.name.split(':')[0]}</div>
                <div className="text-[10px] text-sb-primary truncate font-mono">
                  {p.name.split(':')[1]}
                </div>
              </button>
            ))}
          </div>

          {/* Active Plan Detail Card */}
          {activePlan && (
            <div className="p-4 rounded-xl bg-sb-elevated border border-sb-border space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-sb-text text-sm">{activePlan.name}</h4>
                <p className="text-sb-text-secondary mt-1 leading-relaxed">{activePlan.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[11px] font-semibold text-sb-success uppercase tracking-wider">
                    Key Advantages
                  </span>
                  <ul className="mt-1 space-y-1 text-sb-text-secondary">
                    {activePlan.advantages.map((adv, i) => (
                      <li key={i} className="flex items-start space-x-1">
                        <span className="text-sb-success shrink-0">✓</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-sb-critical uppercase tracking-wider">
                    Operational Risks
                  </span>
                  <ul className="mt-1 space-y-1 text-sb-text-secondary">
                    {activePlan.risks.map((r, i) => (
                      <li key={i} className="flex items-start space-x-1">
                        <span className="text-sb-critical shrink-0">⚠</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-sb-border flex items-center justify-between">
                <span className="text-xs text-sb-text-secondary">
                  Ready to execute changes based on this recovery strategy?
                </span>
                <button
                  onClick={() => navigate('/approvals')}
                  className="btn-primary text-xs flex items-center space-x-1"
                >
                  <span>Review Associated Proposals</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
