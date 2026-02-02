import { 
  IntradayRecommendation, 
  CalculatedRecommendation, 
  RecommendationStatus, 
  ExitReason 
} from '@/types/recommendation';

// Investment amount per stock (₹1,00,000)
const INVESTMENT_AMOUNT = 100000;

export function calculateRecommendationStatus(
  rec: IntradayRecommendation
): CalculatedRecommendation {
  const { 
    tradeSide, 
    recommendedPrice, 
    target1, 
    target2, 
    target3, 
    stoploss,
    exitReason,
    exitPrice 
  } = rec;

  // Calculate quantity based on ₹1,00,000 investment
  const quantity = Math.floor(INVESTMENT_AMOUNT / recommendedPrice);

  // Calculate base metrics
  const riskAmount = Math.abs(recommendedPrice - stoploss);
  const rewardAmount = Math.abs(target3 - recommendedPrice);
  const riskReward = riskAmount > 0 ? rewardAmount / riskAmount : 0;

  // Calculate profit/loss for each target based on quantity
  const profitTarget1 = quantity * Math.abs(target1 - recommendedPrice);
  const profitTarget2 = quantity * Math.abs(target2 - recommendedPrice);
  const profitTarget3 = quantity * Math.abs(target3 - recommendedPrice);
  const maxLossAmount = quantity * Math.abs(recommendedPrice - stoploss);

  // Calculate percentages (based on investment amount)
  const minProfitPercent = (profitTarget1 / INVESTMENT_AMOUNT) * 100;
  const maxProfitPercent = (profitTarget3 / INVESTMENT_AMOUNT) * 100;
  const maxLossPercent = (maxLossAmount / INVESTMENT_AMOUNT) * 100;

  // Status is simply: OPEN until admin sets exit, then EXIT
  const status: RecommendationStatus = exitReason ? 'EXIT' : 'OPEN';

  // Calculate actual profit/loss based on exit reason
  let profitLoss = 0;
  if (exitReason && exitReason !== 'NOT_EXECUTED') {
    const multiplier = tradeSide === 'BUY' ? 1 : -1;
    
    switch (exitReason) {
      case 'TARGET_1_HIT':
        profitLoss = quantity * (target1 - recommendedPrice) * multiplier;
        break;
      case 'TARGET_2_HIT':
        profitLoss = quantity * (target2 - recommendedPrice) * multiplier;
        break;
      case 'TARGET_3_HIT':
        profitLoss = quantity * (target3 - recommendedPrice) * multiplier;
        break;
      case 'STOPLOSS_HIT':
        profitLoss = quantity * (stoploss - recommendedPrice) * multiplier;
        break;
      case 'PARTIAL_PROFIT':
      case 'PARTIAL_LOSS':
        if (exitPrice) {
          profitLoss = quantity * (exitPrice - recommendedPrice) * multiplier;
        }
        break;
    }
  }

  const profitLossPercent = (profitLoss / INVESTMENT_AMOUNT) * 100;

  return {
    ...rec,
    status,
    riskReward: Math.round(riskReward * 100) / 100,
    quantity,
    minProfit: Math.round(profitTarget1),
    maxProfit: Math.round(profitTarget3),
    minProfitPercent: Math.round(minProfitPercent * 100) / 100,
    maxProfitPercent: Math.round(maxProfitPercent * 100) / 100,
    maxLoss: Math.round(maxLossAmount),
    maxLossPercent: Math.round(maxLossPercent * 100) / 100,
    profitLoss: Math.round(profitLoss),
    profitLossPercent: Math.round(profitLossPercent * 100) / 100,
  };
}

export function isWithin48Hours(date: Date): boolean {
  const now = new Date();
  const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 48;
}

export function formatExitReason(reason: ExitReason, exitPrice?: number): string {
  switch (reason) {
    case 'TARGET_1_HIT':
      return 'Target 1 Hit';
    case 'TARGET_2_HIT':
      return 'Target 2 Hit';
    case 'TARGET_3_HIT':
      return 'Target 3 Hit';
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

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}
