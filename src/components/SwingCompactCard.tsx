import { Link } from 'react-router-dom';
import { CalculatedSwingRecommendation } from '@/types/recommendation';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/recommendationUtils';
import { StatusBadge } from './StatusBadge';

interface SwingCompactCardProps {
  recommendation: CalculatedSwingRecommendation;
}

export function SwingCompactCard({ recommendation }: SwingCompactCardProps) {
  const {
    id,
    stockName,
    currentPrice,
    recommendedPrice,
    target2,
    stoploss,
    status,
    exitReason,
    exitPrice,
    profitLossPercent,
  } = recommendation;

  const entryPrice = recommendedPrice || currentPrice;
  const potentialProfit = entryPrice > 0 ? ((target2 - entryPrice) / entryPrice) * 100 : 0;
  const potentialRisk = entryPrice > 0 ? Math.abs(((stoploss - entryPrice) / entryPrice) * 100) : 0;

  const isExited = status === 'EXIT';
  const isProfit = profitLossPercent > 0;

  return (
    <Link to={`/swing/${id}`} className="block">
      <div className="relative bg-gradient-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 group">
        {/* Left accent bar */}
        <div className={cn(
          'absolute left-0 top-0 bottom-0 w-1 rounded-l-xl',
          isExited
            ? exitReason === 'NOT_EXECUTED'
              ? 'bg-muted-foreground/40'
              : isProfit ? 'bg-profit' : 'bg-loss'
            : 'bg-open'
        )} />

        <div className="pl-4 pr-3 py-3.5 sm:pl-5 sm:pr-4 sm:py-4 space-y-3">
          {/* Row 1: Stock name + badges */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight truncate">
              {stockName}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-open/15 text-open uppercase tracking-wider">
                Swing
              </span>
              <StatusBadge status={status} exitReason={exitReason as any} exitPrice={exitPrice} />
            </div>
          </div>

          {/* Row 2: Metrics */}
          {isExited && exitReason !== 'NOT_EXECUTED' ? (
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Price</p>
                <p className="font-mono-price text-base font-bold text-foreground">{formatCurrency(currentPrice)}</p>
              </div>
              <div className={cn(
                'px-4 py-1.5 rounded-lg',
                isProfit ? 'bg-profit/10 border border-profit/20' : 'bg-loss/10 border border-loss/20'
              )}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium text-center">P&L</p>
                <p className={cn(
                  'font-mono-price text-sm font-bold',
                  isProfit ? 'text-profit' : 'text-loss'
                )}>
                  {isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          ) : isExited && exitReason === 'NOT_EXECUTED' ? (
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Price</p>
                <p className="font-mono-price text-base font-bold text-foreground">{formatCurrency(currentPrice)}</p>
              </div>
              <div className="px-4 py-1.5 rounded-lg bg-muted border border-border">
                <p className="text-xs font-medium text-muted-foreground">Not Executed</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Price</p>
                <p className="font-mono-price text-sm sm:text-base font-bold text-foreground">{formatCurrency(currentPrice)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Potential</p>
                <p className="font-mono-price text-sm sm:text-base font-bold text-profit">
                  {potentialProfit.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Risk</p>
                <p className="font-mono-price text-sm sm:text-base font-bold text-loss">
                  {potentialRisk.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer: View Details */}
        <div className="border-t border-border/50 px-4 py-2 flex items-center justify-center gap-1.5 group-hover:bg-primary/5 transition-colors">
          <span className="text-xs font-semibold text-primary tracking-wide">View all details</span>
          <span className="text-primary text-xs">→</span>
        </div>
      </div>
    </Link>
  );
}
