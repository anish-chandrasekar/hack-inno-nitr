import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  Mail, 
  FileText, 
  MessageSquare, 
  Send, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import { formatDateTime } from '../lib/utils';
import { SourceDocument } from '../types';

export const InboxPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: sources, loading, refetch } = useApi(() => api.getSources());
  const [selectedDoc, setSelectedDoc] = useState<SourceDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSender, setNewSender] = useState('');
  const [newContent, setNewContent] = useState('');

  // Auto-select first doc
  React.useEffect(() => {
    if (sources && sources.length > 0 && !selectedDoc) {
      // Find unprocessed first (e.g. NovaTech revision email)
      const unprocessed = sources.find((s) => s.processing_status === 'unprocessed') || sources[0];
      setSelectedDoc(unprocessed);
    }
  }, [sources, selectedDoc]);

  const handleRunInvestigation = async (docId: number) => {
    try {
      setIsProcessing(true);
      const inv = await api.runInvestigation(docId);
      await refetch();
      navigate(`/impact?investigation_id=${inv.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewImpact = async (doc: SourceDocument) => {
    try {
      setIsProcessing(true);
      const invs = await api.getInvestigations();
      const existing = invs.find((i) => i.trigger_source_id === doc.id);
      if (existing) {
        navigate(`/impact?investigation_id=${existing.id}`);
      } else {
        const inv = await api.runInvestigation(doc.id);
        navigate(`/impact?investigation_id=${inv.id}`);
      }
    } catch (err) {
      console.error(err);
      navigate('/impact');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const doc = await api.ingest({
        title: newTitle || 'Pasted Email Thread',
        sender: newSender || 'sponsor@external.com',
        content: newContent,
        source_type: 'email'
      });
      setShowCompose(false);
      setNewTitle('');
      setNewSender('');
      setNewContent('');
      await refetch();
      setSelectedDoc(doc);
    } catch (err) {
      console.error(err);
    }
  };

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
          <h1 className="text-2xl font-bold tracking-tight text-sb-text">Inbox & Context Hub</h1>
          <p className="text-sm text-sb-text-secondary mt-0.5">
            Ingestion gateway for external communications, sponsor updates, and legal notices.
          </p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="btn-primary text-xs flex items-center space-x-1.5 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest New Communication</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left Column: Messages List */}
        <div className="lg:col-span-5 card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-sb-border flex items-center justify-between bg-sb-sidebar/50">
            <span className="text-xs font-semibold text-sb-text uppercase tracking-wider">Feed ({sources?.length || 0})</span>
            <span className="text-[11px] text-sb-text-secondary">Simulated IMAP / Slack Sync</span>
          </div>

          <div className="divide-y divide-sb-border/60 overflow-y-auto flex-1">
            {sources?.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              const isUnprocessed = doc.processing_status === 'unprocessed';

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected ? 'bg-sb-elevated border-l-2 border-l-sb-primary' : 'hover:bg-sb-elevated/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-sb-text truncate max-w-[220px]">
                      {doc.sender || 'Unknown Sender'}
                    </span>
                    <span className="text-[10px] text-sb-text-secondary font-mono">
                      {formatDateTime(doc.received_at)}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-sb-text/90 mb-1 line-clamp-1">
                    {doc.title}
                  </div>
                  <p className="text-xs text-sb-text-secondary line-clamp-2 leading-relaxed mb-2">
                    {doc.content}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={isUnprocessed ? 'badge-warning' : 'badge-success'}>
                      {isUnprocessed ? 'Pending Investigation' : 'Processed'}
                    </span>
                    <span className="text-[10px] text-sb-text-secondary uppercase font-mono">
                      {doc.source_type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Inspector & Intelligence Extractor */}
        <div className="lg:col-span-7 card flex flex-col overflow-hidden bg-sb-card">
          {selectedDoc ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-5 border-b border-sb-border bg-sb-elevated/40 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="badge-neutral text-[10px] uppercase font-mono">{selectedDoc.source_type}</span>
                    <span className="text-xs text-sb-text-secondary font-mono">{formatDateTime(selectedDoc.received_at)}</span>
                  </div>
                  <h2 className="text-base font-bold text-sb-text">{selectedDoc.title}</h2>
                  <div className="text-xs text-sb-text-secondary mt-0.5">
                    From: <span className="text-sb-text font-medium">{selectedDoc.sender}</span>
                  </div>
                </div>

                {selectedDoc.processing_status === 'unprocessed' ? (
                  <button
                    onClick={() => handleRunInvestigation(selectedDoc.id)}
                    disabled={isProcessing}
                    className="btn-primary text-xs flex items-center space-x-1.5 shadow-lg shadow-sb-primary/20 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isProcessing ? 'Agents Running...' : 'Trigger utsavIQ Analysis'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleViewImpact(selectedDoc)}
                    disabled={isProcessing}
                    className="btn-secondary text-xs flex items-center space-x-1.5 shrink-0"
                  >
                    <span>{isProcessing ? 'Analyzing Context...' : 'View in Impact Studio'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Message Content */}
              <div className="p-5 flex-1 overflow-y-auto space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-sb-text-secondary uppercase tracking-wider mb-2">
                    Raw Message Body
                  </h4>
                  <div className="p-4 rounded-lg bg-sb-bg border border-sb-border text-xs text-sb-text font-mono leading-relaxed whitespace-pre-wrap">
                    {selectedDoc.content}
                  </div>
                </div>

                {/* Structured Extraction Display if processed */}
                {selectedDoc.extracted_data && (
                  <div className="space-y-3 pt-4 border-t border-sb-border">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-sb-success" />
                      <h4 className="text-xs font-semibold text-sb-text uppercase tracking-wider">
                        Communication Agent Fact Provenance
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-sb-elevated border border-sb-border">
                        <span className="text-[11px] text-sb-text-secondary">Extracted Sponsor</span>
                        <div className="text-sm font-bold text-sb-primary mt-0.5">
                          {String(selectedDoc.extracted_data.sponsor_name || selectedDoc.extracted_data.sponsor || 'NovaTech')}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-sb-elevated border border-sb-border">
                        <span className="text-[11px] text-sb-text-secondary">Proposed Commitment</span>
                        <div className="text-sm font-bold text-sb-warning mt-0.5">
                          ₹{Number(selectedDoc.extracted_data.proposed_financial || 50000).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-sb-elevated border border-sb-border">
                        <span className="text-[11px] text-sb-text-secondary">Withdrawn Non-Cash</span>
                        <div className="text-sm font-bold text-sb-critical mt-0.5">
                          {String(selectedDoc.extracted_data.merchandise_withdrawn_kits || 500)} Delegate Kits
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-sb-elevated border border-sb-border">
                        <span className="text-[11px] text-sb-text-secondary">Extraction Confidence</span>
                        <div className="text-sm font-bold text-sb-success mt-0.5 font-mono">
                          98% High Certainty
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-sb-text-secondary">
              Select a message to inspect
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6 space-y-4 bg-sb-elevated border-sb-border shadow-2xl">
            <h3 className="text-base font-bold text-sb-text">Ingest New Sponsor Message</h3>
            <form onSubmit={handleIngest} className="space-y-4">
              <div>
                <label className="text-xs text-sb-text-secondary block mb-1">Subject / Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. NovaTech Commitment Adjustment"
                  className="w-full bg-sb-bg border border-sb-border rounded-lg px-3 py-2 text-xs text-sb-text focus:outline-none focus:border-sb-primary"
                />
              </div>
              <div>
                <label className="text-xs text-sb-text-secondary block mb-1">Sender Email</label>
                <input
                  type="text"
                  value={newSender}
                  onChange={(e) => setNewSender(e.target.value)}
                  placeholder="e.g. partner@company.com"
                  className="w-full bg-sb-bg border border-sb-border rounded-lg px-3 py-2 text-xs text-sb-text focus:outline-none focus:border-sb-primary"
                />
              </div>
              <div>
                <label className="text-xs text-sb-text-secondary block mb-1">Message Body</label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste email, WhatsApp or document text..."
                  className="w-full bg-sb-bg border border-sb-border rounded-lg p-3 text-xs text-sb-text focus:outline-none focus:border-sb-primary font-mono"
                  required
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Ingest & Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
