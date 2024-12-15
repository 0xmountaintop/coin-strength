// Common types
export interface Period {
  start: Date;
  end: Date;
}

// Price domain
export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface LowestPriceWithDate {
  date: Date;
  price: number;
}

export interface PriceDataRecord {
  coin: string;
  periodStart: string;
  periodEnd: string;
  lowestPrice: number;
  lowestPriceDate: string;
}

// Investment domain
export interface InvestmentResult {
  period: string;
  investmentAmount: number;
  coinsAcquired: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

export interface CoinInvestmentsReport {
  results: InvestmentResult[];
  totalCurrentValue: number;
}

export interface CoinInvestmentsSummary {
  coin: string;
  totalCurrentValue: number;
}

export interface CoinData {
  coin: string;
  lowestPrices: { [period: string]: LowestPriceWithDate };
  currentPrice?: number;
} 