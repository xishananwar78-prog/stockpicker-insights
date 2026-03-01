import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { CalculatedRecommendation } from '@/types/recommendation';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/recommendationUtils';
import { StatusBadge } from './StatusBadge';
import { TradeSideBadge } from './TradeSideBadge';
import { Card } from '@/components/ui/card';

interface IntradayCompactCardProps {
  recommendation: CalculatedRecommendation;
}

export function IntradayCompactCard({ recommendation }: IntradayCompactCardProps) {
  const {
    id,
    stockName,
    currentPrice,
    tradeSide,
    status,
    exitReason,
    exitPrice,
    minProfitPercent,
    maxProfitPercent,
    maxLossPercent,
    profitLoss,
    profitLossPercent,
  } = recommendation;

  const isExited = status === 'EXIT';
  const isProfit = profitLoss > 0;

  return (
    <Link to={`/intraday/${id}`}>
      <Card className="card-entrance bg-gradient-card border-border overflow-hidden hover:border-primary/40 transition-colors cursor-pointer">
        <div className="p-4 flex items-center justify-between gap-4">
          {/* Left: Stock info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-foreground truncate">{stockName}</h3>
              <TradeSideBadge side={tradeSide} />
              <StatusBadge status={status} exitReason={exitReason} exitPrice={exitPrice} />
            </div>
            <p className="font-mono-price text-lg font-bold text-foreground">
              {formatCurrency(currentPrice)}
            </p>
          </div>

          {/* Right: Metrics */}
          <div className="flex items-center gap-4 shrink-0">
            {isExited && exitReason !== 'NOT_EXECUTED' ? (
              <div className={cn(
                'text-center px-3 py-1.5 rounded-lg',
                isProfit ? 'bg-profit-muted' : 'bg-loss-muted'
              )}>
                <p className={cn(
                  'font-mono-price text-sm font-bold',
                  isProfit ? 'text-profit' : 'text-loss'
                )}>
                  {isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%
                </p>
                <p className="text-[10px] text-muted-foreground">P&L</p>
              </div>
            ) : isExited && exitReason === 'NOT_EXECUTED' ? (
              <div className="text-center px-3 py-1.5 rounded-lg bg-muted">
                <p className="text-xs font-medium text-muted-foreground">Not Executed</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-profit">
                    <TrendingUp className="h-3 w-3" />
                    <span className="font-mono-price text-sm font-bold">
                      {minProfitPercent.toFixed(1)}–{maxProfitPercent.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Profit</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-loss">
                    <TrendingDown className="h-3 w-3" />
                    <span className="font-mono-price text-sm font-bold">
                      {maxLossPercent.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Risk</p>
                </div>
              </>
            )}
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
