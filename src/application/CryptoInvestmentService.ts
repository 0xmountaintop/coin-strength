import { CoinGeckoAPI } from '../infrastructure/coingecko';
import { CoinRepository } from '../infrastructure/repositories/CoinRepository';
import { PriceRepository } from '../infrastructure/repositories/PriceRepository';
import { InvestmentService } from '../domain/investment/InvestmentService';
import { PriceService } from '../domain/price/PriceService';
import { CoinData, CoinInvestmentsSummary } from '../domain/types';
import { config } from '../config';
import fs from 'fs/promises';
import path from 'path';
import { stringify } from 'csv-stringify/sync';

export class CryptoInvestmentService {
  private readonly priceService: PriceService;
  private readonly investmentService: InvestmentService;

  constructor(
    private readonly coinRepository: CoinRepository,
    private readonly priceRepository: PriceRepository,
    private readonly coinGeckoAPI: CoinGeckoAPI
  ) {
    this.priceService = new PriceService(coinGeckoAPI, priceRepository);
    this.investmentService = new InvestmentService();
  }

  async analyzeInvestments(): Promise<void> {
    const coins = await this.coinRepository.getCoins();
    if (coins.length === 0) {
      throw new Error('No cryptocurrencies found in the file. Please add some to coin_list.txt');
    }

    const coinDataList = await this.processCoins(coins);
    const summaries = await this.calculateInvestments(coinDataList);
    await this.saveResults(summaries);
  }

  private async processCoins(coins: string[]): Promise<CoinData[]> {
    const coinDataList: CoinData[] = [];

    for (const coin of coins) {
      try {
        const lowestPrices: { [period: string]: any } = {};
        
        // Get lowest prices for each period
        for (const period of config.periods) {
          const lowestPrice = await this.priceService.getLowestPrice(coin, period);
          const periodKey = `${period.start.toISOString()}_${period.end.toISOString()}`;
          lowestPrices[periodKey] = lowestPrice;
        }

        // Get current price
        const currentPrice = await this.priceService.getCurrentPrice(coin);
        
        coinDataList.push({ 
          coin, 
          lowestPrices, 
          currentPrice 
        });

        console.log(`Processed ${coin} successfully`);
      } catch (error) {
        console.error(`Failed to process ${coin}:`, error);
      }
    }

    return coinDataList;
  }

  private async calculateInvestments(coinDataList: CoinData[]): Promise<CoinInvestmentsSummary[]> {
    const summaries: CoinInvestmentsSummary[] = [];

    for (const coinData of coinDataList) {
      try {
        console.log(`Calculating investment results for ${coinData.coin}:`);
        const { results, totalCurrentValue } = this.investmentService.calculateInvestmentResults(
          coinData, 
          config.periods
        );

        results.forEach(result => {
          console.log(`Period: ${result.period}`);
          console.log(`Current Value: $${result.currentValue.toFixed(2)}`);
        });

        console.log(`Total Current Value: $${totalCurrentValue.toFixed(2)}`);
        summaries.push({ coin: coinData.coin, totalCurrentValue });
      } catch (error) {
        console.error(`Failed to calculate investment results for ${coinData.coin}:`, error);
      }
    }

    // Sort by total value descending
    return summaries.sort((a, b) => b.totalCurrentValue - a.totalCurrentValue);
  }

  private async saveResults(summaries: CoinInvestmentsSummary[]): Promise<void> {
    const [year, month] = config.date.split('-');
    const resultPath = path.join(config.files.resultsDir, year, month);
    
    await this.ensureDirectoryExists(resultPath);
    
    const resultFile = path.join(resultPath, `${config.date}.csv`);
    const csvContent = stringify(summaries, { header: true });
    
    await fs.writeFile(resultFile, csvContent, 'utf-8');
    console.log(`Results saved to ${resultFile}`);
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
} 