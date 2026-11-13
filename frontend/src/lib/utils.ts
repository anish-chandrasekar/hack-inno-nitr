import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function getRiskColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'text-sb-critical';
    case 'medium':
      return 'text-sb-warning';
    case 'low':
      return 'text-sb-success';
    default:
      return 'text-sb-text-secondary';
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'confirmed':
    case 'completed':
    case 'pass':
    case 'approved':
      return 'badge-success';
    case 'at_risk':
    case 'revision_pending':
    case 'pending':
    case 'waiting_approval':
      return 'badge-warning';
    case 'failed':
    case 'cancelled':
    case 'rejected':
    case 'withdrawn':
    case 'critical':
      return 'badge-critical';
    case 'running':
    case 'in_progress':
    case 'executing':
      return 'badge-info';
    default:
      return 'badge-neutral';
  }
}
