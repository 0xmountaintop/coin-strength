import axios, { AxiosInstance } from "axios";
import { Period, PricePoint } from "../../domain/types";
import config from "../../config";

interface CoinGeckoConfig {
  baseUrl: string;
  rateLimitDelay: number;
  retryDelay: number;
  maxRetries: number;
}

const DEFAULT_CONFIG: CoinGeckoConfig = {
  baseUrl: 'https://api.coingecko.com/api/v3',
  rateLimitDelay: 1000,  // 1 second
  retryDelay: 60000,     // 1 minute
  maxRetries: 3,
};

export class CoinGeckoAPI {
  private readonly config: CoinGeckoConfig;
  private readonly client: AxiosInstance;

  constructor(config: Partial<CoinGeckoConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = axios.create({
      baseURL: this.config.baseUrl,
    });
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    errorMessage: string,
  ): Promise<T> {
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await operation();
        await this.delay(this.config.rateLimitDelay);
        return result;
      } catch (error) {
        console.error(`Attempt ${attempt} ${errorMessage}`);
        
        if (attempt === this.config.maxRetries) {
          throw error;
        }
        
        console.log(`Retrying in ${this.config.retryDelay / 1000} seconds...`);
        await this.delay(this.config.retryDelay);
      }
    }
    throw new Error(`Failed after ${this.config.maxRetries} attempts: ${errorMessage}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getHistoricalPrices(coinId: string, period: Period): Promise<PricePoint[]> {
    const startTimestamp = Math.floor(period.start.getTime() / 1000);
    const endTimestamp = Math.floor(period.end.getTime() / 1000);

    return this.withRetry(
      async () => {
        const response = await this.client.get(`/coins/${coinId}/market_chart/range`, {
          params: {
            vs_currency: 'usd',
            from: startTimestamp,
            to: endTimestamp,
          },
        });
        return response.data.prices.map(([timestamp, price]: [number, number]) => ({
          timestamp,
          price
        }));
      },
      `Failed to fetch historical data for ${coinId}`
    );
  }

  async getCurrentPrice(coinId: string): Promise<number> {
    const date = config.date;
    const startTimestamp = Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000);
    const endTimestamp = startTimestamp + 3600;

    return this.withRetry(
      async () => {
        const response = await this.client.get(`/coins/${coinId}/market_chart/range`, {
          params: {
            vs_currency: 'usd',
            from: startTimestamp,
            to: endTimestamp,
          },
        });
        return response.data.prices[0][1];
      },
      `Failed to fetch current price for ${coinId}`
    );
  }
} 