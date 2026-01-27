import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/recommendationUtils';

interface PriceBoxProps {
  label: string;
  price: number;
  isHit?: boolean;
  isLoss?: boolean;
  className?: string;
}

export function PriceBox({ label, price, isHit, isLoss, className }: PriceBoxProps) {
  return (
    <div
      className={cn(
        'rounded-lg px-3 py-2 border transition-all duration-300',
        isHit && !isLoss && 'target-hit bg-profit-muted border-profit',
        isHit && isLoss && 'sl-hit bg-loss-muted border-loss',
        !isHit && 'bg-secondary/50 border-border',
        className
      )}
    >
      <p className={cn(
        'text-[10px] uppercase tracking-wider mb-0.5',
        isHit && !isLoss && 'text-profit',
        isHit && isLoss && 'text-loss',
        !isHit && 'text-muted-foreground'
      )}>
        {label}
      </p>
      <p className={cn(
        'font-mono-price text-sm font-semibold',
        isHit && !isLoss && 'text-profit',
        isHit && isLoss && 'text-loss',
        !isHit && 'text-foreground'
      )}>
        {formatCurrency(price)}
      </p>
    </div>
  );
}
