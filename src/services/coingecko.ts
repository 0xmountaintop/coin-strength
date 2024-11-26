import axios, { AxiosInstance } from "axios";
import { Period, CoingeckoMarketChartResp } from "../types";
import { delay } from "../helper";
import { DATE } from "../config";

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

class CoinGeckoAPI {
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
        await delay(this.config.rateLimitDelay);
        return result;
      } catch (error) {
        console.error(`Attempt ${attempt} ${errorMessage}`);
        
        if (attempt === this.config.maxRetries) {
          throw error;
        }
        
        console.log(`Retrying in ${this.config.retryDelay / 1000} seconds...`);
        await delay(this.config.retryDelay);
      }
    }
    throw new Error(`Failed after ${this.config.maxRetries} attempts: ${errorMessage}`);
  }

  async getHistoricalPrices(coinId: string, period: Period): Promise<[number, number][]> {
    const startTimestamp = Math.floor(period.start.getTime() / 1000);
    const endTimestamp = Math.floor(period.end.getTime() / 1000);

    return this.withRetry(
      async () => {
        const response = await this.client.get<CoingeckoMarketChartResp>(`/coins/${coinId}/market_chart/range`, {
          params: {
            vs_currency: 'usd',
            from: startTimestamp,
            to: endTimestamp,
          },
        });
        return response.data.prices;
      },
      `Failed to fetch historical data for ${coinId}`
    );
  }

  async getCurrentPrice(coinId: string): Promise<number> {
    const date = DATE;
    const startTimestamp = Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 1000) - 3600;
    const endTimestamp = startTimestamp + 3600;

    console.log(`Fetching ${coinId} price on ${date}`);

    return this.withRetry(
      async () => {
        const response = await this.client.get<CoingeckoMarketChartResp>(`/coins/${coinId}/market_chart/range`, {
          params: {
            vs_currency: 'usd',
            from: startTimestamp,
            to: endTimestamp,
          },
        });
        return response.data.prices[0][1];
      },
      `Failed to fetch current data (${date}) for ${coinId}, start: ${startTimestamp}, end: ${endTimestamp}`
    );
  }

// async getCurrentPrice(coinId: string): Promise<number> {
//   return this.withRetry(
//     async () => {
//       const response = await this.client.get(`/simple/price`, {
//         params: {
//       	ids: coinId,
//       	vs_currencies: 'usd',
//         },
//       });
//       return response.data[coinId].usd;
//     },
//     `Failed to fetch current price for ${coinId}`
//   );
// }
}

// Create a default instance
const coinGeckoAPI = new CoinGeckoAPI();

// Export the class and convenience methods that use the default instance
export { CoinGeckoAPI };
export const fetchHistoricalPricesWithRetry = (coinId: string, period: Period) => 
  coinGeckoAPI.getHistoricalPrices(coinId, period);
export const fetchCurrentPriceWithRetry = (coinId: string) => 
  coinGeckoAPI.getCurrentPrice(coinId);
