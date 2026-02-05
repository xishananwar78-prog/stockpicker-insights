import { MoreVertical, Pencil, Trash2, LogOut, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { CalculatedSwingRecommendation, SwingExitReason } from '@/types/recommendation';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/recommendationUtils';
import { formatSwingExitReason } from '@/lib/swingUtils';
import { StatusBadge } from './StatusBadge';
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

interface SwingRecommendationCardProps {
  recommendation: CalculatedSwingRecommendation;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onExit?: (id: string) => void;
  onUpdatePrice?: (id: string) => void;
}

export function SwingRecommendationCard({
  recommendation,
  onEdit,
  onDelete,
  onExit,
  onUpdatePrice,
}: SwingRecommendationCardProps) {
  const { isAdmin } = useAuthContext();
  const {
    id,
    stockName,
    currentPrice,
    imageUrl,
    target1,
    target2,
    stoploss,
    allocation,
    notes,
    status,
    exitReason,
    exitPrice,
    riskReward,
    profitLossPercent,
    createdAt,
  } = recommendation;

  const isProfit = profitLossPercent > 0;

  return (
    <Card className="card-entrance bg-gradient-card border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-foreground">{stockName}</h3>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
              SWING
            </span>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={status} exitReason={exitReason as any} exitPrice={exitPrice} />
            <span className="text-xs text-muted-foreground">
              {new Date(createdAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
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
              {status === 'OPEN' ? (
                <>
                  <DropdownMenuItem onClick={() => onExit?.(id)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Exit Trade
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdatePrice?.(id)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Price
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => onExit?.(id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Exit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => onEdit?.(id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
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

      {/* Image Section (if available) */}
      {imageUrl && (
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={`${stockName} chart`}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

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
            <p className="text-xs text-muted-foreground mb-1">Allocation</p>
            <p className="text-lg font-semibold text-primary">
              {allocation}
            </p>
          </div>
        </div>
      </div>

      {/* Targets Grid - 3 cols */}
      <div className="p-4 grid grid-cols-3 gap-2">
        <PriceBox 
          label="Target 1" 
          price={target1} 
          isHit={exitReason === 'TARGET_1_HIT' || exitReason === 'TARGET_2_HIT'}
        />
        <PriceBox 
          label="Target 2" 
          price={target2} 
          isHit={exitReason === 'TARGET_2_HIT'}
        />
        <PriceBox 
          label="Stoploss" 
          price={stoploss} 
          isLoss 
          isHit={exitReason === 'STOPLOSS_HIT'}
        />
      </div>

      {/* Notes Section */}
      {notes && (
        <div className="px-4 pb-4">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm text-foreground">{notes}</p>
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">R:R</p>
            <p className="font-mono-price text-sm font-semibold text-primary">
              1:{riskReward}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
            <p className={cn(
              "font-mono-price text-sm font-semibold",
              status === 'OPEN' ? 'text-open' : 'text-muted-foreground'
            )}>
              {status}
            </p>
          </div>
        </div>

        {/* P&L if exited */}
        {status === 'EXIT' && exitReason !== 'NOT_EXECUTED' && (
          <div className={cn(
            'mt-3 p-3 rounded-lg text-center',
            isProfit ? 'bg-profit-muted' : 'bg-loss-muted'
          )}>
            <p className={cn(
              'text-lg font-bold font-mono-price',
              isProfit ? 'text-profit' : 'text-loss'
            )}>
              {isProfit ? '+' : ''}{profitLossPercent}%
            </p>
            <p className={cn(
              'text-xs',
              isProfit ? 'text-profit/80' : 'text-loss/80'
            )}>
              {formatSwingExitReason(exitReason, exitPrice)}
            </p>
          </div>
        )}

        {/* Not Executed message */}
        {status === 'EXIT' && exitReason === 'NOT_EXECUTED' && (
          <div className="mt-3 p-3 rounded-lg text-center bg-muted">
            <p className="text-sm font-medium text-muted-foreground">Not Executed</p>
          </div>
        )}
      </div>
    </Card>
  );
}
