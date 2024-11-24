interface PriceData {
  prices: [number, number][];
}

interface LowestPriceWithDate {
  date: Date;
  price: number;
}

interface Period {
  start: Date;
  end: Date;
}

interface PriceDataRecord {
  coin: string;
  periodStart: string;
  periodEnd: string;
  lowestPrice: number;
  lowestPriceDate: string;
}

interface InvestmentResult {
  period: string;
  investmentAmount: number;
  coinsAcquired: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

interface InvestmentSummary {
  results: InvestmentResult[];
  totalCurrentValue: number;
}

interface CoinSummary {
  coin: string;
  totalCurrentValue: number;
}

interface CoinData {
  coin: string;
  lowestPrices: { [period: string]: LowestPriceWithDate };
  currentPrice?: number;
}

export { PriceDataRecord, Period, PriceData, LowestPriceWithDate, CoinData, InvestmentResult, InvestmentSummary, CoinSummary };
