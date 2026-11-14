import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Inbox, 
  Users, 
  Network, 
  Bot, 
  CheckSquare, 
  History,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/inbox', label: 'Inbox & Context', icon: Inbox },
  { to: '/sponsors', label: 'Sponsor Hub', icon: Users },
  { to: '/impact', label: 'Impact Studio', icon: Network, highlight: true },
  { to: '/agents', label: 'Agent Control', icon: Bot },
  { to: '/approvals', label: 'Approval Centre', icon: CheckSquare },
  { to: '/audit', label: 'Execution & Audit', icon: History },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-sb-sidebar border-r border-sb-border flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-sb-border flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sb-primary to-sb-secondary flex items-center justify-center shadow-lg shadow-sb-primary/20">
            <Zap className="w-5 h-5 text-sb-bg font-bold" />
          </div>
          <div>
            <div className="font-bold text-sb-text tracking-tight flex items-center space-x-1.5 text-base">
              <span>utsavIQ</span>
            </div>
            <p className="text-[10px] text-sb-primary font-mono font-medium tracking-wider uppercase">Event Operations IQ</p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-sb-text-secondary uppercase tracking-wider">
          Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-sb-elevated text-sb-primary border border-sb-border shadow-sm'
                    : 'text-sb-text-secondary hover:text-sb-text hover:bg-sb-elevated/50'
                )
              }
            >
              <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>{item.label}</span>
              {item.highlight && (
                <span className="ml-auto text-[10px] bg-sb-primary/20 text-sb-primary px-1.5 py-0.5 rounded font-mono font-semibold">
                  CORE
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-sb-border bg-sb-bg/40">
        <div className="bg-sb-card p-3 rounded-lg border border-sb-border">
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-sb-success animate-pulse" />
            <span className="text-xs font-medium text-sb-text">Autonomous Active</span>
          </div>
          <p className="text-[11px] text-sb-text-secondary leading-relaxed">
            Multi-agent orchestrator monitoring INNOVISION 2026.
          </p>
        </div>
      </div>
    </aside>
  );
};
