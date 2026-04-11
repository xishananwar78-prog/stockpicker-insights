import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/recommendationUtils';

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
  const min = Math.min(stoploss, currentPrice) * 0.998;
  const max = Math.max(highest, currentPrice) * 1.002;
  const range = max - min || 1;

  const toPercent = (v: number) => ((v - min) / range) * 100;

  const slPos = toPercent(stoploss);
  const entryPos = toPercent(recommendedPrice);
  const t1Pos = toPercent(target1);
  const t2Pos = target2 ? toPercent(target2) : null;
  const curPos = toPercent(currentPrice);

  // Build colored segments
  const segments: { left: number; width: number; color: string }[] = [];

  if (isNotExecuted) {
    segments.push({ left: 0, width: 100, color: 'bg-muted-foreground/20' });
  } else {
    const entryP = entryPos;
    const curP = curPos;

    if (Math.abs(currentPrice - recommendedPrice) / recommendedPrice < 0.002) {
      // Current ≈ entry → full blue
      segments.push({ left: 0, width: 100, color: 'bg-primary/30' });
    } else if (currentPrice > recommendedPrice) {
      // Grey from start to entry, green from entry to current, grey rest
      segments.push({ left: 0, width: entryP, color: 'bg-muted-foreground/15' });
      segments.push({ left: entryP, width: curP - entryP, color: 'bg-profit' });
      segments.push({ left: curP, width: 100 - curP, color: 'bg-muted-foreground/15' });
    } else {
      // Grey from start to current, red from current to entry, grey rest
      segments.push({ left: 0, width: curP, color: 'bg-muted-foreground/15' });
      segments.push({ left: curP, width: entryP - curP, color: 'bg-loss' });
      segments.push({ left: entryP, width: 100 - entryP, color: 'bg-muted-foreground/15' });
    }
  }

  return (
    <div className="px-4 py-2.5">
      {/* Bar */}
      <div className="relative h-2 rounded-full overflow-hidden bg-muted-foreground/10">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={cn('absolute top-0 bottom-0 transition-all', seg.color)}
            style={{ left: `${seg.left}%`, width: `${seg.width}%` }}
          />
        ))}

        {/* Marker: Stoploss */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-loss/70 rounded-full"
          style={{ left: `${slPos}%` }}
        />

        {/* Marker: Entry */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-primary rounded-full"
          style={{ left: `${entryPos}%` }}
        />

        {/* Marker: Target 1 */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-profit/70 rounded-full"
          style={{ left: `${t1Pos}%` }}
        />

        {/* Marker: Target 2 */}
        {t2Pos !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-profit/70 rounded-full"
            style={{ left: `${t2Pos}%` }}
          />
        )}

        {/* Current price pointer */}
        {!isNotExecuted && (
          <div
            className="absolute -top-1 w-3 h-3 rounded-full border-2 border-background shadow-md transition-all"
            style={{
              left: `${curPos}%`,
              transform: 'translateX(-50%)',
              backgroundColor: currentPrice >= recommendedPrice
                ? 'hsl(var(--profit))'
                : currentPrice <= stoploss
                  ? 'hsl(var(--loss))'
                  : Math.abs(currentPrice - recommendedPrice) / recommendedPrice < 0.002
                    ? 'hsl(var(--primary))'
                    : 'hsl(var(--loss))',
            }}
          />
        )}
      </div>

      {/* Labels */}
      <div className="relative mt-1 h-3.5">
        <span
          className="absolute text-[8px] font-medium text-loss/70 -translate-x-1/2"
          style={{ left: `${slPos}%` }}
        >
          SL
        </span>
        <span
          className="absolute text-[8px] font-medium text-primary -translate-x-1/2"
          style={{ left: `${entryPos}%` }}
        >
          Entry
        </span>
        <span
          className="absolute text-[8px] font-medium text-profit/70 -translate-x-1/2"
          style={{ left: `${t1Pos}%` }}
        >
          T1
        </span>
        {t2Pos !== null && (
          <span
            className="absolute text-[8px] font-medium text-profit/70 -translate-x-1/2"
            style={{ left: `${t2Pos}%` }}
          >
            T2
          </span>
        )}
      </div>
    </div>
  );
}
