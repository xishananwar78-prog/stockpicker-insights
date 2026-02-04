import { 
  SwingRecommendation, 
  CalculatedSwingRecommendation, 
  RecommendationStatus,
  SwingExitReason 
} from '@/types/recommendation';

export function calculateSwingStatus(
  rec: SwingRecommendation
): CalculatedSwingRecommendation {
  const { 
    currentPrice,
    target1, 
    target2, 
    stoploss,
    exitReason,
    exitPrice 
  } = rec;

  // Calculate risk/reward based on current price
  const riskAmount = Math.abs(currentPrice - stoploss);
  const rewardAmount = Math.abs(target2 - currentPrice);
  const riskReward = riskAmount > 0 ? rewardAmount / riskAmount : 0;

  // Status is simply: OPEN until admin sets exit, then EXIT
  const status: RecommendationStatus = exitReason ? 'EXIT' : 'OPEN';

  // Calculate actual profit/loss percentage based on exit reason
  let profitLoss = 0;
  let profitLossPercent = 0;
  
  if (exitReason && exitReason !== 'NOT_EXECUTED') {
    switch (exitReason) {
      case 'TARGET_1_HIT':
        profitLossPercent = ((target1 - currentPrice) / currentPrice) * 100;
        break;
      case 'TARGET_2_HIT':
        profitLossPercent = ((target2 - currentPrice) / currentPrice) * 100;
        break;
      case 'STOPLOSS_HIT':
        profitLossPercent = ((stoploss - currentPrice) / currentPrice) * 100;
        break;
      case 'PARTIAL_PROFIT':
      case 'PARTIAL_LOSS':
        if (exitPrice) {
          profitLossPercent = ((exitPrice - currentPrice) / currentPrice) * 100;
        }
        break;
    }
    profitLoss = profitLossPercent;
  }

  return {
    ...rec,
    status,
    riskReward: Math.round(riskReward * 100) / 100,
    profitLoss: Math.round(profitLoss * 100) / 100,
    profitLossPercent: Math.round(profitLossPercent * 100) / 100,
  };
}

export function formatSwingExitReason(reason: SwingExitReason, exitPrice?: number): string {
  switch (reason) {
    case 'TARGET_1_HIT':
      return 'Target 1 Hit';
    case 'TARGET_2_HIT':
      return 'Target 2 Hit';
    case 'STOPLOSS_HIT':
      return 'Stoploss Hit';
    case 'PARTIAL_PROFIT':
      return exitPrice ? `Partial Profit @ ₹${exitPrice}` : 'Partial Profit';
    case 'PARTIAL_LOSS':
      return exitPrice ? `Partial Loss @ ₹${exitPrice}` : 'Partial Loss';
    case 'NOT_EXECUTED':
      return 'Not Executed';
    default:
      return '';
  }
}
