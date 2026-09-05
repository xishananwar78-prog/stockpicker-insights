import {
  MoreVertical,
  Pencil,
  Trash2,
  LogOut,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Wallet,
  Scale,
  Activity,
  Sparkles,
  CalendarDays,
  StickyNote,
  Trophy,
  Flame,
} from 'lucide-react';
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
import { SwingPriceBar } from './SwingPriceBar';

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
    recommendedPrice,
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
  const isOpen = status === 'OPEN';
  const priceUp = currentPrice >= recommendedPrice;

  return (
    <Card className="card-entrance bg-gradient-card border-border overflow-hidden relative">
      {/* Ambient glow */}
      <div
        className={cn(
          'pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full blur-3xl opacity-20',
          isOpen ? 'bg-primary' : isProfit ? 'bg-profit' : 'bg-loss'
        )}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between p-4 border-b border-border">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xl leading-none">{isOpen ? '🚀' : isProfit ? '🏆' : '📕'}</span>
            <h3 className="text-xl font-extrabold text-foreground tracking-tight">{stockName}</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Swing
            </span>
            <span className="md:hidden px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/30 flex items-center gap-1">
              <Wallet className="h-3 w-3" /> {allocation}
            </span>
            {isOpen && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-open/15 text-open border border-open/30">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-open opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-open" />
                </span>
                Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={status} exitReason={exitReason as any} exitPrice={exitPrice} />
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
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
        <div className="relative group">
          <img 
            src={imageUrl} 
            alt={`${stockName} chart`}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}

      {/* Price Section */}
      <div className="relative p-4 bg-secondary/20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="rounded-xl p-3 bg-background/40 border border-border/60 hover:border-primary/40 transition-colors min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              {priceUp ? (
                <TrendingUp className="h-3 w-3 text-profit" />
              ) : (
                <TrendingDown className="h-3 w-3 text-loss" />
              )}
              Current
            </p>
            <p
              className={cn(
                'font-mono-price text-base md:text-lg font-bold truncate',
                priceUp ? 'text-profit' : 'text-loss'
              )}
            >
              {formatCurrency(currentPrice)}
            </p>
          </div>
          <div className="rounded-xl p-3 bg-background/40 border border-border/60 hover:border-primary/40 transition-colors min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <Flame className="h-3 w-3 text-primary" /> Entry
            </p>
            <p className="font-mono-price text-base md:text-lg font-bold text-primary truncate">
              {formatCurrency(recommendedPrice)}
            </p>
          </div>
          <div className="hidden md:block rounded-xl p-3 bg-background/40 border border-border/60 hover:border-primary/40 transition-colors min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <Wallet className="h-3 w-3 text-primary" /> Alloc
            </p>
            <p className="text-lg font-bold text-foreground truncate">{allocation}</p>
          </div>
        </div>
      </div>

      {/* Targets Grid */}
      <div className="px-4 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-primary" /> Targets &amp; Risk
        </p>
        <div className="hidden md:grid md:grid-cols-3 gap-2">
          <div className="hover-scale">
            <PriceBox
              label="🎯 Target 1"
              price={target1}
              isHit={exitReason === 'TARGET_1_HIT' || exitReason === 'TARGET_2_HIT'}
            />
          </div>
          <div className="hover-scale">
            <PriceBox
              label="🎯 Target 2"
              price={target2}
              isHit={exitReason === 'TARGET_2_HIT'}
            />
          </div>
          <div className="hover-scale">
            <PriceBox
              label="🛡️ Stoploss"
              price={stoploss}
              isLoss
              isHit={exitReason === 'STOPLOSS_HIT'}
            />
          </div>
        </div>
        <div className="md:hidden space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="hover-scale">
              <PriceBox
                label="🎯 Target 1"
                price={target1}
                isHit={exitReason === 'TARGET_1_HIT' || exitReason === 'TARGET_2_HIT'}
              />
            </div>
            <div className="hover-scale">
              <PriceBox
                label="🎯 Target 2"
                price={target2}
                isHit={exitReason === 'TARGET_2_HIT'}
              />
            </div>
          </div>
          <div className="hover-scale">
            <PriceBox
              label="🛡️ Stoploss"
              price={stoploss}
              isLoss
              isHit={exitReason === 'STOPLOSS_HIT'}
            />
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {notes && (
        <div className="px-4 pt-4">
          <div className="p-3 bg-muted/30 rounded-lg border-l-4 border-primary/60">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5 text-primary" /> Analyst Notes
            </p>
            <p className="text-sm text-foreground">{notes}</p>
          </div>
        </div>
      )}

      {/* Price Range Bar */}
      <SwingPriceBar
        currentPrice={currentPrice}
        recommendedPrice={recommendedPrice}
        stoploss={stoploss}
        target1={target1}
        target2={target2}
        isNotExecuted={status === 'EXIT' && exitReason === 'NOT_EXECUTED'}
      />

      <div className="px-4 pb-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/60">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1">
              <Scale className="h-3 w-3 text-primary" /> Risk : Reward
            </p>
            <p className="font-mono-price text-base font-bold text-primary mt-0.5">
              1:{riskReward}
            </p>
          </div>
          <div
            className={cn(
              'text-center p-3 rounded-xl border',
              isOpen ? 'bg-open/10 border-open/30' : 'bg-muted/30 border-border/60'
            )}
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1">
              <Activity className={cn('h-3 w-3', isOpen ? 'text-open animate-pulse' : 'text-muted-foreground')} />
              Status
            </p>
            <p
              className={cn(
                'font-mono-price text-base font-bold mt-0.5',
                isOpen ? 'text-open' : 'text-muted-foreground'
              )}
            >
              {isOpen ? 'OPEN 🔥' : 'CLOSED'}
            </p>
          </div>
        </div>

        {/* P&L if exited */}
        {status === 'EXIT' && exitReason !== 'NOT_EXECUTED' && (
          <div className={cn(
            'mt-3 p-4 rounded-xl text-center animate-scale-in border',
            isProfit ? 'bg-profit-muted border-profit/30' : 'bg-loss-muted border-loss/30'
          )}>
            <div className="flex items-center justify-center gap-2 mb-1">
              {isProfit ? (
                <Trophy className="h-5 w-5 text-profit" />
              ) : (
                <Shield className="h-5 w-5 text-loss" />
              )}
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {isProfit ? 'Profit Booked' : 'Loss Cut'}
              </span>
            </div>
            <p className={cn(
              'text-3xl font-extrabold font-mono-price',
              isProfit ? 'text-profit' : 'text-loss'
            )}>
              {isProfit ? '+' : ''}{profitLossPercent}% {isProfit ? '🎉' : '⚠️'}
            </p>
            <p className={cn(
              'text-xs mt-1',
              isProfit ? 'text-profit/80' : 'text-loss/80'
            )}>
              {formatSwingExitReason(exitReason, exitPrice)}
            </p>
          </div>
        )}

        {/* Not Executed message */}
        {status === 'EXIT' && exitReason === 'NOT_EXECUTED' && (
          <div className="mt-3 p-3 rounded-xl text-center bg-muted border border-border">
            <p className="text-sm font-medium text-muted-foreground">😴 Not Executed</p>
          </div>
        )}
      </div>
    </Card>
  );
}
