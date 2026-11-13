import React, { useState } from 'react';
import { Search, Bell, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export const Header: React.FC = () => {
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    try {
      setResetting(true);
      await api.resetDemo();
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="h-16 bg-sb-sidebar/80 backdrop-blur-md border-b border-sb-border sticky top-0 z-20 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div>
          <span className="font-semibold text-sb-text text-sm tracking-wide">INNOVISION 2026</span>
          <span className="mx-2 text-sb-border">•</span>
          <span className="text-xs text-sb-text-secondary">College Tech & Cultural Fest</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-sb-primary/10 text-sb-primary border border-sb-primary/20">
          DEMO ENVIRONMENT
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={handleReset}
          disabled={resetting}
          title="Reset Demo Environment"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-sb-border bg-sb-elevated hover:bg-sb-card text-xs font-medium text-sb-text-secondary hover:text-sb-text transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          <span>Reset Demo</span>
        </button>

        <div className="h-5 w-px bg-sb-border" />

        <div className="flex items-center space-x-2.5 pl-2">
          <div className="w-8 h-8 rounded-full bg-sb-elevated border border-sb-border flex items-center justify-center font-bold text-xs text-sb-primary">
            OS
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-medium text-sb-text">Organising Sec.</div>
            <div className="text-[10px] text-sb-text-secondary">Lead Reviewer</div>
          </div>
        </div>
      </div>
    </header>
  );
};
