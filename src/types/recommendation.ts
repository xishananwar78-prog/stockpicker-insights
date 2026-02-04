export type TradeSide = 'BUY' | 'SELL';

export type RecommendationStatus = 'OPEN' | 'EXIT';

export type ExitReason = 
  | 'TARGET_1_HIT'
  | 'TARGET_2_HIT'
  | 'TARGET_3_HIT'
  | 'PARTIAL_PROFIT'
  | 'PARTIAL_LOSS'
  | 'STOPLOSS_HIT'
  | 'NOT_EXECUTED'
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
  // Exit fields - set when admin closes the recommendation
  exitReason?: ExitReason;
  exitPrice?: number; // Used for partial profit/loss exits
  exitedAt?: Date;
}

export interface SwingRecommendation {
  id: string;
  stockName: string;
  currentPrice: number;
  imageUrl?: string; // Optional chart/analysis image
  target1: number;
  target2: number;
  stoploss: number;
  allocation: string; // e.g., "10%", "₹50,000"
  notes?: string; // Optional notes/analysis
  createdAt: Date;
  updatedAt: Date;
  // Exit fields - set when admin closes the recommendation
  exitReason?: SwingExitReason;
  exitPrice?: number; // Used for partial profit/loss exits
  exitedAt?: Date;
}

export type SwingExitReason = 
  | 'TARGET_1_HIT'
  | 'TARGET_2_HIT'
  | 'PARTIAL_PROFIT'
  | 'PARTIAL_LOSS'
  | 'STOPLOSS_HIT'
  | 'NOT_EXECUTED'
  | null;

export interface CalculatedRecommendation extends IntradayRecommendation {
  status: RecommendationStatus;
  riskReward: number;
  quantity: number; // Calculated based on ₹1,00,000 investment
  minProfit: number;
  maxProfit: number;
  minProfitPercent: number;
  maxProfitPercent: number;
  maxLoss: number;
  maxLossPercent: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface CalculatedSwingRecommendation extends SwingRecommendation {
  status: RecommendationStatus;
  riskReward: number;
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
