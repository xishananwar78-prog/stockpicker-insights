import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/recommendationUtils';
import { TradeSide } from '@/types/recommendation';

interface IntradayPriceBarProps {
  currentPrice: number;
  recommendedPrice: number;
  tradeSide: TradeSide;
  target1: number;
  target2: number;
  target3: number;
  stoploss: number;
  entryTriggered?: boolean;
  isNotExecuted?: boolean;
}

export function IntradayPriceBar({
  currentPrice,
  recommendedPrice,
  tradeSide,
  target1,
  target2,
  target3,
  stoploss,
  entryTriggered = false,
  isNotExecuted = false,
}: IntradayPriceBarProps) {
  const prices = [currentPrice, recommendedPrice, target1, target2, target3, stoploss];
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const span = highest - lowest;
  const padding = span > 0 ? span * 0.08 : Math.max(Math.abs(highest) * 0.01, 1);
  const min = lowest - padding;
  const max = highest + padding;
  const range = max - min || 1;
  const toPercent = (price: number) => Math.min(100, Math.max(0, ((price - min) / range) * 100));

  const markers = [
    { label: 'SL', price: stoploss, color: 'loss' },
    { label: 'Entry', price: recommendedPrice, color: 'primary' },
    { label: 'T1', price: target1, color: 'profit' },
    { label: 'T2', price: target2, color: 'profit' },
    { label: 'T3', price: target3, color: 'profit' },
  ].map((marker) => ({ ...marker, position: toPercent(marker.price) }));

  const currentPosition = toPercent(currentPrice);
  const entryPosition = toPercent(recommendedPrice);
  const isProfit = tradeSide === 'BUY'
    ? currentPrice > recommendedPrice
    : currentPrice < recommendedPrice;
  const isAtEntry = currentPrice === recommendedPrice;
  const fillColor = !entryTriggered
    ? 'muted-foreground'
    : isAtEntry
      ? 'primary'
      : isProfit
        ? 'profit'
        : 'loss';
  const fillLeft = Math.min(entryPosition, currentPosition);
  const fillWidth = Math.abs(currentPosition - entryPosition);

  return (
    <div className="pt-1">
      <div className="relative h-4 mb-1">
        {markers.map((marker) => (
          <span
            key={marker.label}
            className={cn(
              'absolute -translate-x-1/2 text-[9px] font-bold leading-none',
              marker.color === 'loss' && 'text-loss',
              marker.color === 'primary' && 'text-primary',
              marker.color === 'profit' && 'text-profit',
            )}
            style={{ left: `${marker.position}%` }}
          >
            {marker.label}
          </span>
        ))}
      </div>

      <div className="relative h-[10px] rounded-full overflow-hidden bg-muted/40">
        {!isNotExecuted && entryTriggered && fillWidth > 0 && (
          <div
            className="absolute top-0 bottom-0 transition-all duration-500"
            style={{
              left: `${fillLeft}%`,
              width: `${fillWidth}%`,
              backgroundColor: `hsl(var(--${fillColor}))`,
              boxShadow: `0 0 8px hsl(var(--${fillColor}) / 0.35)`,
            }}
          />
        )}

        {!isNotExecuted && isAtEntry && entryTriggered && (
          <div
            className="absolute top-0 bottom-0 w-3 -translate-x-1/2 rounded-full"
            style={{
              left: `${entryPosition}%`,
              backgroundColor: 'hsl(var(--primary))',
              boxShadow: '0 0 8px hsl(var(--primary) / 0.55)',
            }}
          />
        )}

        {markers.map((marker) => (
          <div
            key={`${marker.label}-tick`}
            className="absolute top-0 bottom-0 w-[2px] -translate-x-1/2"
            style={{
              left: `${marker.position}%`,
              backgroundColor: `hsl(var(--${marker.color}) / 0.7)`,
            }}
          />
        ))}

        {!isNotExecuted && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-all duration-500"
            style={{ left: `${currentPosition}%` }}
          >
            <div
              className="h-4 w-4 rounded-full border-2 border-background"
              style={{
                backgroundColor: `hsl(var(--${fillColor}))`,
                boxShadow: `0 0 6px hsl(var(--${fillColor}) / 0.5)`,
              }}
            />
          </div>
        )}
      </div>

      {isNotExecuted ? (
        <p className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Not Executed
        </p>
      ) : !entryTriggered ? (
        <p className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Awaiting Entry · {formatCurrency(recommendedPrice)}
        </p>
      ) : (
        <p className="mt-1.5 text-center text-[10px] font-medium text-muted-foreground">
          {isAtEntry ? 'Entry reached' : `CMP ${formatCurrency(currentPrice)}`}
        </p>
      )}
    </div>
  );
}