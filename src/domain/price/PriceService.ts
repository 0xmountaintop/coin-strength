import { LowestPriceWithDate, Period, PricePoint } from '../types';
import { CoinGeckoAPI } from '../../infrastructure/coingecko';
import { PriceRepository } from '../../infrastructure/repositories/PriceRepository';

export class PriceService {
  constructor(
    private readonly coinGeckoAPI: CoinGeckoAPI,
    private readonly priceRepository: PriceRepository
  ) {}

  async getLowestPrice(coin: string, period: Period): Promise<LowestPriceWithDate> {
    // Try to get from cache first
    const cached = await this.priceRepository.findLowestPrice(coin, period);
    if (cached) {
      return cached;
    }

    // Fetch new data if not cached
    const prices = await this.coinGeckoAPI.getHistoricalPrices(coin, period);
    const lowest = this.findLowestPrice(prices);
    
    // Cache the result
    await this.priceRepository.saveLowestPrice(coin, period, lowest);
    
    return lowest;
  }

  async getCurrentPrice(coin: string): Promise<number> {
    return this.coinGeckoAPI.getCurrentPrice(coin);
  }

  private findLowestPrice(prices: PricePoint[]): LowestPriceWithDate {
    return prices.reduce(
      (lowest, current) => {
        if (current.price < lowest.price) {
          return { date: new Date(current.timestamp), price: current.price };
        }
        return lowest;
      },
      { date: new Date(prices[0].timestamp), price: prices[0].price }
    );
  }
} 