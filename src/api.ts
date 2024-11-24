import axios from "axios";
import { Period, PriceData } from "./types";
import { delay } from "./helper";

const API_CONFIG = {
  baseUrl: 'https://api.coingecko.com/api/v3',
  rateLimitDelay: 1000,  // 1 second
  retryDelay: 60000,     // 1 minute
};

async function withRetry<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      await delay(API_CONFIG.rateLimitDelay);
      return result;
    } catch (error) {
      console.error(`Attempt ${attempt} ${errorMessage}:`, error);
      if (attempt === maxRetries) throw error;
      
      console.log(`Retrying in ${API_CONFIG.retryDelay / 1000} seconds...`);
      await delay(API_CONFIG.retryDelay);
    }
  }
  throw new Error(`Failed after ${maxRetries} attempts: ${errorMessage}`);
}

async function fetchCryptoPricesWithRetry(
  coinId: string, 
  period: Period, 
  maxRetries: number = 3
): Promise<PriceData> {
  const startTimestamp = Math.floor(period.start.getTime() / 1000);
  const endTimestamp = Math.floor(period.end.getTime() / 1000);

  return withRetry(
    () => axios.get<PriceData>(`${API_CONFIG.baseUrl}/coins/${coinId}/market_chart/range`, {
      params: {
        vs_currency: 'usd',
        from: startTimestamp,
        to: endTimestamp,
      },
    }).then(response => response.data),
    `Failed to fetch historical data for ${coinId}`,
    maxRetries
  );
}

async function fetchCurrentPriceWithRetry(
  coinId: string, 
  maxRetries: number = 3
): Promise<number> {
  return withRetry(
    () => axios.get(`${API_CONFIG.baseUrl}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: 'usd',
      },
    }).then(response => response.data[coinId].usd),
    `Failed to fetch current price for ${coinId}`,
    maxRetries
  );
}

export { fetchCryptoPricesWithRetry, fetchCurrentPriceWithRetry };
