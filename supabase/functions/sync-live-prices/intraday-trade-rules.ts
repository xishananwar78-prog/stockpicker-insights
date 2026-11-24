export type IntradayTradeSide = 'BUY' | 'SELL';

export type AutomaticIntradayExitReason =
  | 'TARGET_1_HIT'
  | 'TARGET_2_HIT'
  | 'TARGET_3_HIT'
  | 'STOPLOSS_HIT'
  | 'NOT_EXECUTED'
  | 'TIME_EXIT';

export interface IntradayTradeRules {
  tradeSide: IntradayTradeSide;
  recommendedPrice: number;
  target1: number;
  target2: number;
  target3: number;
  stoploss: number;
  entryTriggered: boolean;
}

export interface AutomaticIntradayExit {
  reason: AutomaticIntradayExitReason;
  exitPrice: number | null;
}

export function hasIntradayEntryBeenReached(
  tradeSide: IntradayTradeSide,
  currentPrice: number,
  entryPrice: number,
): boolean {
  return tradeSide === 'BUY' ? currentPrice >= entryPrice : currentPrice <= entryPrice;
}

export function isIntradaySquareOffTime(now: Date): boolean {
  const ist = new Date(now.getTime() + 330 * 60_000);
  const weekday = ist.getUTCDay();
  const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return weekday >= 1 && weekday <= 5 && minutes >= 15 * 60 + 15;
}

export function resolveAutomaticIntradayExit(
  trade: IntradayTradeRules,
  currentPrice: number,
  now: Date,
): AutomaticIntradayExit | null {
  const entryReached = trade.entryTriggered || hasIntradayEntryBeenReached(
    trade.tradeSide,
    currentPrice,
    trade.recommendedPrice,
  );

  if (entryReached) {
    if (trade.tradeSide === 'BUY') {
      if (currentPrice >= trade.target3) return { reason: 'TARGET_3_HIT', exitPrice: currentPrice };
      if (currentPrice >= trade.target2) return { reason: 'TARGET_2_HIT', exitPrice: currentPrice };
      if (currentPrice >= trade.target1) return { reason: 'TARGET_1_HIT', exitPrice: currentPrice };
      if (currentPrice <= trade.stoploss) return { reason: 'STOPLOSS_HIT', exitPrice: currentPrice };
    } else {
      if (currentPrice <= trade.target3) return { reason: 'TARGET_3_HIT', exitPrice: currentPrice };
      if (currentPrice <= trade.target2) return { reason: 'TARGET_2_HIT', exitPrice: currentPrice };
      if (currentPrice <= trade.target1) return { reason: 'TARGET_1_HIT', exitPrice: currentPrice };
      if (currentPrice >= trade.stoploss) return { reason: 'STOPLOSS_HIT', exitPrice: currentPrice };
    }
  }

  if (isIntradaySquareOffTime(now)) {
    return entryReached
      ? { reason: 'TIME_EXIT', exitPrice: currentPrice }
      : { reason: 'NOT_EXECUTED', exitPrice: null };
  }

  return null;
}