export type TradeSide = 'BUY' | 'SELL';

export type RecommendationStatus = 'OPEN' | 'EXECUTED' | 'EXIT' | 'NOT_EXECUTED';

export type ExitReason = 
  | 'TARGET_1_HIT'
  | 'TARGET_2_HIT'
  | 'TARGET_3_HIT'
  | 'STOPLOSS_HIT'
  | 'MANUAL_EXIT'
  | null;

export interface IntradayRecommendation {
  id: string;
  stockName: string;
  currentPrice: number;
  tradeSide: TradeSide;
  recommendedPrice: number;
  target1: number;
  target2: number;
  target3: number;
  stoploss: number;
  createdAt: Date;
  updatedAt: Date;
  manualExitReason?: ExitReason;
  isManuallyExited?: boolean;
}

export interface CalculatedRecommendation extends IntradayRecommendation {
  status: RecommendationStatus;
  exitReason: ExitReason;
  riskReward: number;
  quantity: number; // Calculated based on ₹1,00,000 investment
  minProfit: number;
  maxProfit: number;
  minProfitPercent: number;
  maxProfitPercent: number;
  maxLoss: number;
  maxLossPercent: number;
  targetsHit: {
    target1: boolean;
    target2: boolean;
    target3: boolean;
    stoploss: boolean;
  };
  profitLoss: number;
  profitLossPercent: number;
}

export interface DailyReport {
  date: string;
  recommendations: CalculatedRecommendation[];
  totalProfit: number;
  totalLoss: number;
  netProfitLoss: number;
  winRate: number;
  totalTrades: number;
  successfulTrades: number;
}
