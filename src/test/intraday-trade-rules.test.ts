import { describe, expect, it } from 'vitest';
import {
  hasIntradayEntryBeenReached,
  resolveAutomaticIntradayExit,
  type IntradayTradeRules,
} from '../../supabase/functions/sync-live-prices/intraday-trade-rules';
import { calculateRecommendationStatus } from '../lib/recommendationUtils';

const buyTrade: IntradayTradeRules = {
  tradeSide: 'BUY',
  recommendedPrice: 100,
  target1: 105,
  target2: 110,
  target3: 115,
  stoploss: 95,
  entryTriggered: true,
};

const sellTrade: IntradayTradeRules = {
  tradeSide: 'SELL',
  recommendedPrice: 100,
  target1: 95,
  target2: 90,
  target3: 85,
  stoploss: 105,
  entryTriggered: true,
};

const beforeSquareOff = new Date('2026-11-24T09:44:00.000Z');
const atSquareOff = new Date('2026-11-24T09:45:00.000Z');

describe('Intraday entry and automatic exits', () => {
  it('waits for BUY to reach or cross up to entry and SELL to reach or cross down to entry', () => {
    expect(hasIntradayEntryBeenReached('BUY', 99, 100)).toBe(false);
    expect(hasIntradayEntryBeenReached('BUY', 100, 100)).toBe(true);
    expect(hasIntradayEntryBeenReached('SELL', 101, 100)).toBe(false);
    expect(hasIntradayEntryBeenReached('SELL', 100, 100)).toBe(true);
  });

  it('does not stop out a BUY pick before its entry is activated', () => {
    const pendingBuy = { ...buyTrade, entryTriggered: false };
    expect(resolveAutomaticIntradayExit(pendingBuy, 94, beforeSquareOff)).toBeNull();
  });

  it('closes BUY trades at the highest target crossed, or at stop-loss', () => {
    expect(resolveAutomaticIntradayExit(buyTrade, 105, beforeSquareOff)?.reason).toBe('TARGET_1_HIT');
    expect(resolveAutomaticIntradayExit(buyTrade, 112, beforeSquareOff)?.reason).toBe('TARGET_2_HIT');
    expect(resolveAutomaticIntradayExit(buyTrade, 115, beforeSquareOff)?.reason).toBe('TARGET_3_HIT');
    expect(resolveAutomaticIntradayExit(buyTrade, 94, beforeSquareOff)?.reason).toBe('STOPLOSS_HIT');
  });

  it('closes SELL trades at the highest target crossed, or at stop-loss', () => {
    expect(resolveAutomaticIntradayExit(sellTrade, 95, beforeSquareOff)?.reason).toBe('TARGET_1_HIT');
    expect(resolveAutomaticIntradayExit(sellTrade, 88, beforeSquareOff)?.reason).toBe('TARGET_2_HIT');
    expect(resolveAutomaticIntradayExit(sellTrade, 85, beforeSquareOff)?.reason).toBe('TARGET_3_HIT');
    expect(resolveAutomaticIntradayExit(sellTrade, 106, beforeSquareOff)?.reason).toBe('STOPLOSS_HIT');
  });

  it('squares off at 3:15 PM India time and marks entries that never triggered as not executed', () => {
    expect(resolveAutomaticIntradayExit(buyTrade, 102, beforeSquareOff)).toBeNull();
    expect(resolveAutomaticIntradayExit(buyTrade, 102, atSquareOff)).toEqual({
      reason: 'TIME_EXIT',
      exitPrice: 102,
    });
    expect(resolveAutomaticIntradayExit({ ...buyTrade, entryTriggered: false }, 99, atSquareOff)).toEqual({
      reason: 'NOT_EXECUTED',
      exitPrice: null,
    });
  });

  it('calculates realized P&L from the actual automatic exit price', () => {
    const result = calculateRecommendationStatus({
      id: 'test-trade',
      stockName: 'TEST',
      currentPrice: 112,
      tradeSide: 'BUY',
      recommendedPrice: 100,
      target1: 105,
      target2: 110,
      target3: 115,
      stoploss: 95,
      entryTriggered: true,
      exitReason: 'TARGET_2_HIT',
      exitPrice: 112,
      createdAt: new Date('2026-11-24T09:00:00.000Z'),
      updatedAt: new Date('2026-11-24T09:45:00.000Z'),
    });

    expect(result.profitLoss).toBe(12_000);
  });
});