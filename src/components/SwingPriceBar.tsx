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

  // Full colored fill from SL to highest target, with contextual gradient
  let trackGradient: string;
  if (isNotExecuted) {
    trackGradient = 'linear-gradient(90deg, hsl(var(--muted-foreground) / 0.15) 0%, hsl(var(--muted-foreground) / 0.1) 100%)';
  } else if (atEntry) {
    trackGradient = `linear-gradient(90deg, 
      hsl(var(--loss) / 0.2) 0%, 
      hsl(var(--loss) / 0.3) ${slPos}%, 
      hsl(var(--primary) / 0.15) ${entryPos - 5}%, 
      hsl(var(--primary) / 0.4) ${entryPos}%, 
      hsl(var(--primary) / 0.15) ${entryPos + 5}%, 
      hsl(var(--profit) / 0.2) ${t1Pos}%, 
      hsl(var(--profit) / 0.15) 100%)`;
  } else if (priceAboveEntry) {
    // Green dominant — loss zone faded, profit zone bright
    trackGradient = `linear-gradient(90deg, 
      hsl(var(--loss) / 0.12) 0%, 
      hsl(var(--loss) / 0.18) ${slPos}%, 
      hsl(var(--muted-foreground) / 0.08) ${(slPos + entryPos) / 2}%,
      hsl(var(--profit) / 0.15) ${entryPos}%, 
      hsl(var(--profit) / 0.5) ${(entryPos + curPos) / 2}%, 
      hsl(var(--profit) / 0.7) ${curPos}%, 
      hsl(var(--profit) / 0.2) ${Math.min(curPos + 10, 100)}%, 
      hsl(var(--profit) / 0.1) 100%)`;
  } else {
    // Red dominant — loss zone bright, profit zone faded
    trackGradient = `linear-gradient(90deg, 
      hsl(var(--loss) / 0.15) 0%, 
      hsl(var(--loss) / 0.2) ${Math.max(curPos - 5, 0)}%, 
      hsl(var(--loss) / 0.7) ${curPos}%, 
      hsl(var(--loss) / 0.5) ${(curPos + entryPos) / 2}%, 
      hsl(var(--loss) / 0.15) ${entryPos}%, 
      hsl(var(--muted-foreground) / 0.08) ${(entryPos + t1Pos) / 2}%,
      hsl(var(--profit) / 0.1) ${t1Pos}%, 
      hsl(var(--profit) / 0.08) 100%)`;
  }

  const markers = [
    { pos: slPos, label: 'SL', color: 'loss' },
    { pos: entryPos, label: 'Entry', color: 'primary' },
    { pos: t1Pos, label: 'T1', color: 'profit' },
    ...(t2Pos !== null ? [{ pos: t2Pos, label: 'T2', color: 'profit' }] : []),
  ];

  const curColor = atEntry ? 'primary' : priceAboveEntry ? 'profit' : 'loss';

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
      <div
        className="relative h-[10px] rounded-full overflow-hidden"
        style={{ background: trackGradient }}
      >
        {/* Inner highlight line along entire track for depth */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/5 rounded-full" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-black/20 rounded-full" />

        {/* Bright accent segment: entry↔current */}
        {!isNotExecuted && !atEntry && (
          <div
            className="absolute top-0 bottom-0 transition-all duration-500"
            style={{
              left: `${Math.min(entryPos, curPos)}%`,
              width: `${Math.abs(curPos - entryPos)}%`,
              background: priceAboveEntry
                ? `linear-gradient(90deg, hsl(var(--profit) / 0.3), hsl(var(--profit) / 0.85))`
                : `linear-gradient(90deg, hsl(var(--loss) / 0.85), hsl(var(--loss) / 0.3))`,
              boxShadow: priceAboveEntry
                ? '0 0 12px hsl(var(--profit) / 0.3)'
                : '0 0 12px hsl(var(--loss) / 0.3)',
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
              backgroundColor: `hsl(var(--${m.color}) / 0.7)`,
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
                backgroundColor: `hsl(var(--${curColor}))`,
                boxShadow: `0 0 8px hsl(var(--${curColor}) / 0.6), 0 0 16px hsl(var(--${curColor}) / 0.25)`,
              }}
            />
          </div>
        )}
      </div>

      {/* Not executed */}
      {isNotExecuted && (
        <p className="text-center text-[10px] text-muted-foreground mt-1.5 font-medium tracking-widest uppercase">
          Not Executed
        </p>
      )}
    </div>
  );
}
