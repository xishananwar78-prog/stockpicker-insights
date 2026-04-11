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

  // Determine current price color
  const priceAboveEntry = currentPrice >= recommendedPrice;
  const atEntry = Math.abs(currentPrice - recommendedPrice) / recommendedPrice < 0.002;

  // Build gradient fill
  let fillLeft: number, fillRight: number, fillColor: string;
  if (isNotExecuted) {
    fillLeft = 0;
    fillRight = 0;
    fillColor = 'transparent';
  } else if (atEntry) {
    fillLeft = entryPos - 0.5;
    fillRight = entryPos + 0.5;
    fillColor = 'hsl(var(--primary))';
  } else if (priceAboveEntry) {
    fillLeft = entryPos;
    fillRight = curPos;
    fillColor = 'hsl(var(--profit))';
  } else {
    fillLeft = curPos;
    fillRight = entryPos;
    fillColor = 'hsl(var(--loss))';
  }

  const markers = [
    { pos: slPos, label: 'SL', color: 'bg-loss', textColor: 'text-loss', dotSize: 'w-2 h-2' },
    { pos: entryPos, label: 'Entry', color: 'bg-primary', textColor: 'text-primary', dotSize: 'w-2.5 h-2.5' },
    { pos: t1Pos, label: 'T1', color: 'bg-profit', textColor: 'text-profit', dotSize: 'w-2 h-2' },
    ...(t2Pos !== null ? [{ pos: t2Pos, label: 'T2', color: 'bg-profit', textColor: 'text-profit', dotSize: 'w-2 h-2' }] : []),
  ];

  return (
    <div className="px-4 py-3">
      {/* Labels row */}
      <div className="relative h-4 mb-1.5">
        {markers.map((m, i) => (
          <span
            key={i}
            className={cn('absolute text-[9px] font-semibold -translate-x-1/2 leading-none', m.textColor)}
            style={{ left: `${m.pos}%` }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Track */}
      <div className="relative h-3 rounded-full bg-muted/40 overflow-hidden shadow-inner">
        {/* Background track segments for depth */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-loss/5 via-muted/10 to-profit/5" />

        {/* Active fill */}
        {!isNotExecuted && (
          <div
            className="absolute top-0 bottom-0 rounded-full transition-all duration-500"
            style={{
              left: `${fillLeft}%`,
              width: `${Math.max(0, fillRight - fillLeft)}%`,
              background: `linear-gradient(90deg, ${fillColor}66, ${fillColor})`,
              boxShadow: `0 0 8px ${fillColor}40`,
            }}
          />
        )}

        {/* Marker dots on track */}
        {markers.map((m, i) => (
          <div
            key={i}
            className={cn('absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full ring-1 ring-background/50', m.color, m.dotSize)}
            style={{ left: `${m.pos}%` }}
          />
        ))}

        {/* Current price indicator */}
        {!isNotExecuted && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500"
            style={{ left: `${curPos}%` }}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 rounded-full blur-sm opacity-60"
              style={{
                width: 16,
                height: 16,
                marginTop: -8,
                marginLeft: -8,
                backgroundColor: atEntry
                  ? 'hsl(var(--primary))'
                  : priceAboveEntry
                    ? 'hsl(var(--profit))'
                    : 'hsl(var(--loss))',
              }}
            />
            {/* Dot */}
            <div
              className="relative w-3.5 h-3.5 rounded-full border-2 border-background shadow-lg"
              style={{
                marginTop: -7,
                marginLeft: -7,
                backgroundColor: atEntry
                  ? 'hsl(var(--primary))'
                  : priceAboveEntry
                    ? 'hsl(var(--profit))'
                    : 'hsl(var(--loss))',
              }}
            />
          </div>
        )}
      </div>

      {/* Not executed label */}
      {isNotExecuted && (
        <p className="text-center text-[10px] text-muted-foreground mt-1.5 font-medium tracking-wide">
          NOT EXECUTED
        </p>
      )}
    </div>
  );
}
