interface CoingeckoMarketChartResp {
  // array of [timestamp, price]
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

interface InvestmentReport {
  results: InvestmentResult[];
  totalCurrentValue: number;
}

interface CoinInvestmentSummary {
  coin: string;
  totalCurrentValue: number;
}

interface CoinData {
  coin: string;
  lowestPrices: { [period: string]: LowestPriceWithDate };
  currentPrice?: number;
}

export {
    PriceDataRecord,
    Period,
    CoingeckoMarketChartResp,
    LowestPriceWithDate,
    CoinData,
    InvestmentResult,
    InvestmentReport,
    CoinInvestmentSummary
};
