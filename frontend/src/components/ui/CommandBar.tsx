import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';
import { api } from '../../services/api';

export const CommandBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ answer: string; sources: string[]; confidence: number } | null>(null);

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const res = await api.query(query);
      setResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleAsk} className="relative flex items-center">
        <div className="absolute left-4 text-sb-primary">
          <Sparkles className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask utsavIQ about your event... (e.g. 'How much did NovaTech originally promise?')"
          className="w-full bg-sb-elevated border border-sb-border rounded-xl pl-11 pr-24 py-3.5 text-sm text-sb-text placeholder-sb-text-secondary focus:outline-none focus:border-sb-primary/60 transition-all shadow-inner"
        />
        <div className="absolute right-3 flex items-center space-x-1.5">
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-sb-primary text-sb-bg font-semibold text-xs hover:bg-sb-primary/90 disabled:opacity-50 transition-all"
          >
            <span>Ask</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>
      </form>

      {response && (
        <div className="card p-4 border-sb-primary/30 bg-sb-elevated/70 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sb-primary" />
              <span className="text-xs font-semibold text-sb-primary uppercase tracking-wider">utsavIQ Intelligence</span>
            </div>
            <span className="text-[11px] font-mono text-sb-text-secondary">
              Confidence: {(response.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-sm text-sb-text leading-relaxed mb-3">{response.answer}</p>
          {response.sources && response.sources.length > 0 && (
            <div className="border-t border-sb-border/60 pt-2 flex items-center space-x-2 overflow-x-auto text-xs text-sb-text-secondary">
              <span className="font-medium shrink-0">Sources:</span>
              {response.sources.map((src, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-sb-bg border border-sb-border text-[11px] font-mono whitespace-nowrap">
                  {src}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
