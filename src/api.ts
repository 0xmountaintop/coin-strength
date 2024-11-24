import axios from "axios";
import { Period, PriceData } from "./types";
import { delay } from "./helper";

async function fetchCryptoPricesWithRetry(coinId: string, period: Period, maxRetries: number = 3): Promise<PriceData> {
  const baseUrl = 'https://api.coingecko.com/api/v3';
  const startTimestamp = Math.floor(period.start.getTime() / 1000);
  const endTimestamp = Math.floor(period.end.getTime() / 1000);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get<PriceData>(`${baseUrl}/coins/${coinId}/market_chart/range`, {
        params: {
          vs_currency: 'usd',
          from: startTimestamp,
          to: endTimestamp,
        },
      });

      await delay(1000);

      return response.data;
    } catch (error) {
      console.error(`Attempt ${attempt} failed for ${coinId}:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`Retrying in 60 seconds...`);
      await delay(60000);
    }
  }

  throw new Error(`Failed to fetch data for ${coinId} after ${maxRetries} attempts`);
}

async function fetchCurrentPriceWithRetry(coinId: string, maxRetries: number = 3): Promise<number> {
  const baseUrl = 'https://api.coingecko.com/api/v3';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(`${baseUrl}/simple/price`, {
        params: {
          ids: coinId,
          vs_currencies: 'usd',
        },
      });
      await delay(1000);
      return response.data[coinId].usd;
    } catch (error) {
      // console.error(`Attempt ${attempt} failed to fetch current price for ${coinId}:`, error);
      console.error(`Attempt ${attempt} failed to fetch current price for ${coinId}:`);
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`Retrying in 60 seconds...`);
      await delay(60000);
    }
  }

  throw new Error(`Failed to fetch current price for ${coinId} after ${maxRetries} attempts`);
}

export { fetchCryptoPricesWithRetry, fetchCurrentPriceWithRetry };
