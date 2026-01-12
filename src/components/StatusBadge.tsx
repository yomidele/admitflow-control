import { cn } from '@/lib/utils';
import { ApplicationStatus } from '@/types/admission';
import { Clock, FileSearch, Hourglass, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

const statusConfig: Record<ApplicationStatus, { label: string; icon: typeof Clock; className: string }> = {
  submitted: {
    label: 'Submitted',
    icon: Clock,
    className: 'bg-info/10 text-info border-info/20',
  },
  under_review: {
    label: 'Under Review',
    icon: FileSearch,
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  selection_pending: {
    label: 'Processing Results',
    icon: Hourglass,
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
  admitted: {
    label: 'Admitted',
    icon: CheckCircle,
    className: 'bg-success/10 text-success border-success/20',
  },
  waitlisted: {
    label: 'Waitlisted',
    icon: AlertCircle,
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  rejected: {
    label: 'Not Admitted',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium',
        config.className,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
