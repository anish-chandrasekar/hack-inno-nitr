import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  status?: 'normal' | 'warning' | 'critical' | 'success';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  status = 'normal',
}) => {
  const statusColors = {
    normal: 'text-sb-primary bg-sb-primary/10 border-sb-primary/20',
    warning: 'text-sb-warning bg-sb-warning/10 border-sb-warning/20',
    critical: 'text-sb-critical bg-sb-critical/10 border-sb-critical/20',
    success: 'text-sb-success bg-sb-success/10 border-sb-success/20',
  };

  return (
    <div className="card p-5 flex flex-col justify-between hover:border-sb-border/80 transition-all shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-sb-text-secondary tracking-wide uppercase">{title}</span>
        <div className={cn('p-2 rounded-lg border', statusColors[status])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-sb-text">{value}</div>
        {(subtitle || trend) && (
          <div className="flex items-center space-x-2 mt-1.5 text-xs text-sb-text-secondary">
            {trend && <span className="font-medium text-sb-warning">{trend}</span>}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
