import { 
  CoinData, 
  Period, 
  CoinInvestmentsReport,
  InvestmentResult 
} from '../types';
import config from '../../config';

export class InvestmentService {
  calculateInvestmentResults(coinData: CoinData, periods: Period[]): CoinInvestmentsReport {
    if (!coinData.currentPrice) {
      throw new Error(`Current price not available for ${coinData.coin}`);
    }

    const today = new Date(config.date);
    const validPeriods = periods.filter(period => period.end < today).slice(-1);
    
    const results = validPeriods.map(period => 
      this.calculatePeriodResult(period, coinData)
    );

    const totalCurrentValue = results.reduce(
      (sum, result) => sum + result.currentValue, 
      0
    );

    return { results, totalCurrentValue };
  }

  private calculatePeriodResult(
    period: Period, 
    coinData: CoinData
  ): InvestmentResult {
    const periodKey = `${period.start.toISOString()}_${period.end.toISOString()}`;
    const lowestPrice = coinData.lowestPrices[periodKey];
    const investmentAmount = 100;
    const coinsAcquired = investmentAmount / lowestPrice.price;
    const currentValue = coinsAcquired * (coinData.currentPrice as number);
    const profitLoss = currentValue - investmentAmount;
    const profitLossPercentage = (profitLoss / investmentAmount) * 100;

    return {
      period: `${period.start.toISOString().split('T')[0]} to ${period.end.toISOString().split('T')[0]}`,
      investmentAmount,
      coinsAcquired,
      currentValue,
      profitLoss,
      profitLossPercentage
    };
  }
} 