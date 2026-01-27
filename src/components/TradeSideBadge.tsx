import { cn } from '@/lib/utils';
import { TradeSide } from '@/types/recommendation';

interface TradeSideBadgeProps {
  side: TradeSide;
  className?: string;
}

export function TradeSideBadge({ side, className }: TradeSideBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider',
        side === 'BUY'
          ? 'bg-profit text-profit-foreground'
          : 'bg-loss text-loss-foreground',
        className
      )}
    >
      {side}
    </span>
  );
}
