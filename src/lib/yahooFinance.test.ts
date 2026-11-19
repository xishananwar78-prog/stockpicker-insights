import { describe, expect, it } from 'vitest';
import { applyYahooPrices } from './yahooFinance';

describe('applyYahooPrices', () => {
  it('uses a fetched Yahoo price for an open stock with a linked ticker', () => {
    const recommendations = [
      { currentPrice: 120, yahooSymbol: 'RELIANCE.NS', exitReason: null },
    ];

    expect(applyYahooPrices(recommendations, { 'RELIANCE.NS': 125.5 })[0]?.currentPrice).toBe(125.5);
  });

  it('keeps the saved price for exited stocks', () => {
    const recommendations = [
      { currentPrice: 120, yahooSymbol: 'RELIANCE.NS', exitReason: 'TARGET_1_HIT' },
    ];

    expect(applyYahooPrices(recommendations, { 'RELIANCE.NS': 125.5 })[0]?.currentPrice).toBe(120);
  });
});