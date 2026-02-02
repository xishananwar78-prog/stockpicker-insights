import { cn } from '@/lib/utils';
import { RecommendationStatus, ExitReason } from '@/types/recommendation';
import { formatExitReason } from '@/lib/recommendationUtils';

interface StatusBadgeProps {
  status: RecommendationStatus;
  exitReason?: ExitReason;
  exitPrice?: number;
  className?: string;
}

export function StatusBadge({ status, exitReason, exitPrice, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'OPEN':
        return 'bg-open-muted text-open border-open/30';
      case 'EXIT':
        if (exitReason === 'STOPLOSS_HIT' || exitReason === 'PARTIAL_LOSS') {
          return 'bg-loss-muted text-loss border-loss/30';
        }
        if (exitReason === 'NOT_EXECUTED') {
          return 'bg-muted text-muted-foreground border-border';
        }
        return 'bg-profit-muted text-profit border-profit/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'OPEN':
        return 'Open';
      case 'EXIT':
        return exitReason ? formatExitReason(exitReason, exitPrice) : 'Exit';
      default:
        return status;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        getStatusStyles(),
        status === 'OPEN' && 'animate-pulse-subtle',
        className
      )}
    >
      {status === 'OPEN' && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {getStatusLabel()}
    </span>
  );
}
