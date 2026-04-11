import { cn } from '@/lib/utils';

interface SwingPriceBarProps {
  currentPrice: number;
  recommendedPrice: number;
  stoploss: number;
  target1: number;
  target2?: number;
  isNotExecuted?: boolean;
}

export function SwingPriceBar({
  currentPrice,
  recommendedPrice,
  stoploss,
  target1,
  target2,
  isNotExecuted = false,
}: SwingPriceBarProps) {
  const highest = target2 && target2 > target1 ? target2 : target1;
  const min = Math.min(stoploss, currentPrice) * 0.995;
  const max = Math.max(highest, currentPrice) * 1.005;
  const range = max - min || 1;

  const toPercent = (v: number) => Math.min(100, Math.max(0, ((v - min) / range) * 100));

  const slPos = toPercent(stoploss);
  const entryPos = toPercent(recommendedPrice);
  const t1Pos = toPercent(target1);
  const t2Pos = target2 ? toPercent(target2) : null;
  const curPos = toPercent(currentPrice);

  const atEntry = Math.abs(currentPrice - recommendedPrice) / recommendedPrice < 0.002;
  const priceAboveEntry = currentPrice >= recommendedPrice;

  // Fill: strictly from entry to current price only
  const fillLeft = Math.min(entryPos, curPos);
  const fillRight = Math.max(entryPos, curPos);
  const fillColor = atEntry ? 'primary' : priceAboveEntry ? 'profit' : 'loss';

  const markers = [
    { pos: slPos, label: 'SL', color: 'loss' },
    { pos: entryPos, label: 'Entry', color: 'primary' },
    { pos: t1Pos, label: 'T1', color: 'profit' },
    ...(t2Pos !== null ? [{ pos: t2Pos, label: 'T2', color: 'profit' }] : []),
  ];

  return (
    <div className="px-4 py-3">
      {/* Labels */}
      <div className="relative h-4 mb-1">
        {markers.map((m, i) => (
          <span
            key={i}
            className={cn('absolute text-[9px] font-bold -translate-x-1/2 leading-none', `text-${m.color}`)}
            style={{ left: `${m.pos}%` }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Track */}
      <div className="relative h-[10px] rounded-full overflow-hidden bg-muted/30">
        {/* Colored fill: entry → current only */}
        {!isNotExecuted && !atEntry && (
          <div
            className="absolute top-0 bottom-0 transition-all duration-500"
            style={{
              left: `${fillLeft}%`,
              width: `${fillRight - fillLeft}%`,
              background: priceAboveEntry
                ? `linear-gradient(90deg, hsl(var(--${fillColor}) / 0.2) 0%, hsl(var(--${fillColor})) 100%)`
                : `linear-gradient(90deg, hsl(var(--${fillColor})) 0%, hsl(var(--${fillColor}) / 0.2) 100%)`,
              boxShadow: `0 0 10px hsl(var(--${fillColor}) / 0.3)`,
            }}
          />
        )}

        {/* Blue glow at entry when at entry */}
        {!isNotExecuted && atEntry && (
          <div
            className="absolute top-0 bottom-0 w-3 -translate-x-1/2 rounded-full"
            style={{
              left: `${entryPos}%`,
              background: `radial-gradient(circle, hsl(var(--primary)) 30%, hsl(var(--primary) / 0) 100%)`,
            }}
          />
        )}

        {/* Marker ticks */}
        {markers.map((m, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-[2px] -translate-x-1/2"
            style={{
              left: `${m.pos}%`,
              backgroundColor: `hsl(var(--${m.color}) / 0.6)`,
            }}
          />
        ))}

        {/* Current price pointer */}
        {!isNotExecuted && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-all duration-500"
            style={{ left: `${curPos}%` }}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-background"
              style={{
                backgroundColor: `hsl(var(--${fillColor}))`,
                boxShadow: `0 0 6px hsl(var(--${fillColor}) / 0.5)`,
              }}
            />
          </div>
        )}
      </div>

      {isNotExecuted && (
        <p className="text-center text-[10px] text-muted-foreground mt-1.5 font-medium tracking-widest uppercase">
          Not Executed
        </p>
      )}
    </div>
  );
}
