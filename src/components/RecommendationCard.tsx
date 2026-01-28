import { Link } from 'react-router-dom';
import { MoreVertical, Pencil, Trash2, XCircle, RefreshCw } from 'lucide-react';
import { CalculatedRecommendation } from '@/types/recommendation';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercent } from '@/lib/recommendationUtils';
import { StatusBadge } from './StatusBadge';
import { TradeSideBadge } from './TradeSideBadge';
import { PriceBox } from './PriceBox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { useAuthContext } from '@/components/AuthContext';

interface RecommendationCardProps {
  recommendation: CalculatedRecommendation;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkNotExecuted?: (id: string) => void;
  onUpdatePrice?: (id: string) => void;
}

export function RecommendationCard({
  recommendation,
  onEdit,
  onDelete,
  onMarkNotExecuted,
  onUpdatePrice,
}: RecommendationCardProps) {
  const { isAdmin } = useAuthContext();
  const {
    id,
    stockName,
    currentPrice,
    tradeSide,
    recommendedPrice,
    target1,
    target2,
    target3,
    stoploss,
    status,
    exitReason,
    riskReward,
    quantity,
    minProfitPercent,
    maxProfitPercent,
    maxLossPercent,
    targetsHit,
    profitLoss,
    profitLossPercent,
    createdAt,
  } = recommendation;

  const isProfit = profitLoss > 0;
  const isLoss = profitLoss < 0;

  return (
    <Card className="card-entrance bg-gradient-card border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-foreground">{stockName}</h3>
            <TradeSideBadge side={tradeSide} />
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={status} exitReason={exitReason} />
            <span className="text-xs text-muted-foreground">
              {new Date(createdAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onUpdatePrice?.(id)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Update Price
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {status !== 'NOT_EXECUTED' && status !== 'EXIT' && (
                <DropdownMenuItem onClick={() => onMarkNotExecuted?.(id)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Mark Not Executed
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(id)}
                className="text-loss focus:text-loss"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Current Price Section */}
      <div className="p-4 bg-secondary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current Price</p>
            <p className="font-mono-price text-2xl font-bold text-foreground">
              {formatCurrency(currentPrice)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Recommended</p>
            <p className="font-mono-price text-lg font-semibold text-muted-foreground">
              {formatCurrency(recommendedPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Targets Grid */}
      <div className="p-4 grid grid-cols-4 gap-2">
        <PriceBox label="Target 1" price={target1} isHit={targetsHit.target1} />
        <PriceBox label="Target 2" price={target2} isHit={targetsHit.target2} />
        <PriceBox label="Target 3" price={target3} isHit={targetsHit.target3} />
        <PriceBox label="Stoploss" price={stoploss} isHit={targetsHit.stoploss} isLoss />
      </div>

      <div className="px-4 pb-4">
        <div className="grid grid-cols-4 gap-4 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">R:R</p>
            <p className="font-mono-price text-sm font-semibold text-primary">
              1:{riskReward}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Qty</p>
            <p className="font-mono-price text-sm font-semibold text-foreground">
              {quantity}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Profit</p>
            <p className="font-mono-price text-sm font-semibold text-profit">
              {minProfitPercent}%-{maxProfitPercent}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Max Loss</p>
            <p className="font-mono-price text-sm font-semibold text-loss">
              {maxLossPercent}%
            </p>
          </div>
        </div>

        {/* P&L if exited */}
        {status === 'EXIT' && (
          <div className={cn(
            'mt-3 p-3 rounded-lg text-center',
            isProfit ? 'bg-profit-muted' : 'bg-loss-muted'
          )}>
            <p className={cn(
              'text-lg font-bold font-mono-price',
              isProfit ? 'text-profit' : 'text-loss'
            )}>
              {isProfit ? '+' : ''}{formatCurrency(profitLoss)} ({formatPercent(profitLossPercent)})
            </p>
            <p className={cn(
              'text-xs',
              isProfit ? 'text-profit/80' : 'text-loss/80'
            )}>
              {isProfit ? 'Profit Booked' : 'Loss Booked'}
            </p>
          </div>
        )}
      </div>

      {/* Daily Report Link */}
      <div className="px-4 pb-4">
        <Link
          to="/intraday-report"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          📊 Daily Intraday Report
        </Link>
      </div>
    </Card>
  );
}
