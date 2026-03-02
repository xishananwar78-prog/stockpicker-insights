import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
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
    recommendedPrice,
    tradeSide,
    target3,
    stoploss,
    status,
    exitReason,
    exitPrice,
    profitLoss,
    profitLossPercent,
  } = recommendation;

  const entryPrice = recommendedPrice || currentPrice;
  const potentialProfit = entryPrice > 0 ? Math.abs(((target3 - entryPrice) / entryPrice) * 100) : 0;
  const potentialRisk = entryPrice > 0 ? Math.abs(((stoploss - entryPrice) / entryPrice) * 100) : 0;

  const isExited = status === 'EXIT';
  const isProfit = profitLoss > 0;

  return (
    <Link to={`/intraday/${id}`}>
      <Card className="bg-gradient-card border-border overflow-hidden hover:border-primary/40 transition-colors cursor-pointer">
        <div className="p-3 sm:p-4 space-y-2">
          {/* Row 1: Stock name + badges */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-foreground truncate">{stockName}</h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <TradeSideBadge side={tradeSide} />
              <StatusBadge status={status} exitReason={exitReason} exitPrice={exitPrice} />
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Row 2: Price + Profit + Risk */}
          {isExited && exitReason !== 'NOT_EXECUTED' ? (
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Price</p>
                <p className="font-mono-price text-base font-bold text-foreground">{formatCurrency(currentPrice)}</p>
              </div>
              <div className={cn(
                'text-center px-3 py-1 rounded-lg',
                isProfit ? 'bg-profit-muted' : 'bg-loss-muted'
              )}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">P&L</p>
                <p className={cn(
                  'font-mono-price text-sm font-bold',
                  isProfit ? 'text-profit' : 'text-loss'
                )}>
                  {isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          ) : isExited && exitReason === 'NOT_EXECUTED' ? (
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Price</p>
                <p className="font-mono-price text-base font-bold text-foreground">{formatCurrency(currentPrice)}</p>
              </div>
              <div className="text-center px-3 py-1 rounded-lg bg-muted">
                <p className="text-xs font-medium text-muted-foreground">Not Executed</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Price</p>
                <p className="font-mono-price text-sm sm:text-base font-bold text-foreground">{formatCurrency(currentPrice)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Profit</p>
                <p className="font-mono-price text-sm sm:text-base font-bold text-profit">
                  {potentialProfit.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk</p>
                <p className="font-mono-price text-sm sm:text-base font-bold text-loss">
                  {potentialRisk.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
