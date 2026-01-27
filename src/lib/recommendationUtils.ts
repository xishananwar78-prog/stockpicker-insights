import { 
  IntradayRecommendation, 
  CalculatedRecommendation, 
  RecommendationStatus, 
  ExitReason 
} from '@/types/recommendation';

export function calculateRecommendationStatus(
  rec: IntradayRecommendation
): CalculatedRecommendation {
  const { 
    currentPrice, 
    tradeSide, 
    recommendedPrice, 
    target1, 
    target2, 
    target3, 
    stoploss,
    isManuallyExited,
    manualExitReason 
  } = rec;

  // Calculate base metrics
  const investmentAmount = recommendedPrice; // Per share basis
  const riskAmount = Math.abs(recommendedPrice - stoploss);
  const rewardAmount = Math.abs(target3 - recommendedPrice);
  const riskReward = riskAmount > 0 ? rewardAmount / riskAmount : 0;

  // Calculate profit/loss for each target
  const profitTarget1 = Math.abs(target1 - recommendedPrice);
  const profitTarget2 = Math.abs(target2 - recommendedPrice);
  const profitTarget3 = Math.abs(target3 - recommendedPrice);
  const maxLossAmount = Math.abs(recommendedPrice - stoploss);

  // Calculate percentages
  const minProfitPercent = (profitTarget1 / recommendedPrice) * 100;
  const maxProfitPercent = (profitTarget3 / recommendedPrice) * 100;
  const maxLossPercent = (maxLossAmount / recommendedPrice) * 100;

  // Determine which targets are hit and status
  let status: RecommendationStatus = 'OPEN';
  let exitReason: ExitReason = null;
  let targetsHit = {
    target1: false,
    target2: false,
    target3: false,
    stoploss: false,
  };

  // Handle manual exit
  if (isManuallyExited) {
    status = 'EXIT';
    exitReason = manualExitReason || 'MANUAL_EXIT';
    return {
      ...rec,
      status: 'NOT_EXECUTED',
      exitReason: 'MANUAL_EXIT',
      riskReward: Math.round(riskReward * 100) / 100,
      minProfit: profitTarget1,
      maxProfit: profitTarget3,
      minProfitPercent: Math.round(minProfitPercent * 100) / 100,
      maxProfitPercent: Math.round(maxProfitPercent * 100) / 100,
      maxLoss: maxLossAmount,
      maxLossPercent: Math.round(maxLossPercent * 100) / 100,
      targetsHit,
      profitLoss: 0,
      profitLossPercent: 0,
    };
  }

  if (tradeSide === 'BUY') {
    // BUY Logic
    if (currentPrice < recommendedPrice) {
      status = 'OPEN';
    } else if (currentPrice >= recommendedPrice && currentPrice < target1) {
      status = 'EXECUTED';
    } else if (currentPrice >= target1 && currentPrice < target2) {
      status = 'EXIT';
      exitReason = 'TARGET_1_HIT';
      targetsHit.target1 = true;
    } else if (currentPrice >= target2 && currentPrice < target3) {
      status = 'EXIT';
      exitReason = 'TARGET_2_HIT';
      targetsHit.target1 = true;
      targetsHit.target2 = true;
    } else if (currentPrice >= target3) {
      status = 'EXIT';
      exitReason = 'TARGET_3_HIT';
      targetsHit.target1 = true;
      targetsHit.target2 = true;
      targetsHit.target3 = true;
    }

    // Check stoploss
    if (currentPrice <= stoploss) {
      status = 'EXIT';
      exitReason = 'STOPLOSS_HIT';
      targetsHit.stoploss = true;
      targetsHit.target1 = false;
      targetsHit.target2 = false;
      targetsHit.target3 = false;
    }
  } else {
    // SELL Logic (reversed)
    if (currentPrice > recommendedPrice) {
      status = 'OPEN';
    } else if (currentPrice <= recommendedPrice && currentPrice > target1) {
      status = 'EXECUTED';
    } else if (currentPrice <= target1 && currentPrice > target2) {
      status = 'EXIT';
      exitReason = 'TARGET_1_HIT';
      targetsHit.target1 = true;
    } else if (currentPrice <= target2 && currentPrice > target3) {
      status = 'EXIT';
      exitReason = 'TARGET_2_HIT';
      targetsHit.target1 = true;
      targetsHit.target2 = true;
    } else if (currentPrice <= target3) {
      status = 'EXIT';
      exitReason = 'TARGET_3_HIT';
      targetsHit.target1 = true;
      targetsHit.target2 = true;
      targetsHit.target3 = true;
    }

    // Check stoploss
    if (currentPrice >= stoploss) {
      status = 'EXIT';
      exitReason = 'STOPLOSS_HIT';
      targetsHit.stoploss = true;
      targetsHit.target1 = false;
      targetsHit.target2 = false;
      targetsHit.target3 = false;
    }
  }

  // Calculate actual profit/loss based on exit
  let profitLoss = 0;
  if (status === 'EXIT') {
    if (exitReason === 'TARGET_1_HIT') {
      profitLoss = profitTarget1;
    } else if (exitReason === 'TARGET_2_HIT') {
      profitLoss = profitTarget2;
    } else if (exitReason === 'TARGET_3_HIT') {
      profitLoss = profitTarget3;
    } else if (exitReason === 'STOPLOSS_HIT') {
      profitLoss = -maxLossAmount;
    }
  }

  const profitLossPercent = (profitLoss / recommendedPrice) * 100;

  return {
    ...rec,
    status,
    exitReason,
    riskReward: Math.round(riskReward * 100) / 100,
    minProfit: profitTarget1,
    maxProfit: profitTarget3,
    minProfitPercent: Math.round(minProfitPercent * 100) / 100,
    maxProfitPercent: Math.round(maxProfitPercent * 100) / 100,
    maxLoss: maxLossAmount,
    maxLossPercent: Math.round(maxLossPercent * 100) / 100,
    targetsHit,
    profitLoss: Math.round(profitLoss * 100) / 100,
    profitLossPercent: Math.round(profitLossPercent * 100) / 100,
  };
}

export function isWithin48Hours(date: Date): boolean {
  const now = new Date();
  const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return hoursDiff <= 48;
}

export function formatExitReason(reason: ExitReason): string {
  switch (reason) {
    case 'TARGET_1_HIT':
      return 'Target 1 Hit';
    case 'TARGET_2_HIT':
      return 'Target 1 & 2 Hit';
    case 'TARGET_3_HIT':
      return 'All Targets Hit';
    case 'STOPLOSS_HIT':
      return 'Stoploss Hit';
    case 'MANUAL_EXIT':
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
