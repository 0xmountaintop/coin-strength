import axios from 'axios';
import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { existsSync } from 'fs';

interface PriceData {
  prices: [number, number][];
}

interface LowestPrice {
  date: Date;
  price: number;
}

interface Period {
  start: Date;
  end: Date;
}

interface CsvRecord {
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

// Add this new interface
interface CoinData {
  coin: string;
  lowestPrices: { [period: string]: LowestPrice };
  currentPrice?: number;
}

const CSV_FILE = 'results/price_data.csv';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function readCsvData(): Promise<CsvRecord[]> {
  try {
    const csvContent = await fs.readFile(CSV_FILE, 'utf-8');
    return parse(csvContent, { columns: true, cast: true }) as CsvRecord[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeCsvData(records: CsvRecord[]): Promise<void> {
  const csvContent = stringify(records, { header: true });
  await fs.writeFile(CSV_FILE, csvContent, 'utf-8');
}

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

function findLowestPrice(priceData: [number, number][]): LowestPrice {
  let lowestPrice = Infinity;
  let lowestPriceDate = new Date();

  priceData.forEach(([timestamp, price]) => {
    if (price < lowestPrice) {
      lowestPrice = price;
      lowestPriceDate = new Date(timestamp);
    }
  });

  return { date: lowestPriceDate, price: lowestPrice };
}

async function readCoinsFromFile(filename: string): Promise<string[]> {
  try {
    const data = await fs.readFile(filename, 'utf-8');
    return data
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'));
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

async function getLowestPriceData(coin: string, period: Period, csvData: CsvRecord[]): Promise<LowestPrice> {
  const existingRecord = csvData.find(
    record => record.coin === coin &&
              record.periodStart === period.start.toISOString() &&
              record.periodEnd === period.end.toISOString()
  );

  if (existingRecord) {
    console.log(`Using cached data for ${coin} in period ${period.start.toISOString()} to ${period.end.toISOString()}`);
    return {
      date: new Date(existingRecord.lowestPriceDate),
      price: existingRecord.lowestPrice
    };
  }

  console.log(`Fetching new data for ${coin} in period ${period.start.toISOString()} to ${period.end.toISOString()}`);
  const newData = await fetchCryptoPricesWithRetry(coin, period);
  const lowestPrice = findLowestPrice(newData.prices);

  const newRecord: CsvRecord = {
    coin,
    periodStart: period.start.toISOString(),
    periodEnd: period.end.toISOString(),
    lowestPrice: lowestPrice.price,
    lowestPriceDate: lowestPrice.date.toISOString()
  };

  csvData.push(newRecord);
  await writeCsvData(csvData);

  return lowestPrice;
}

async function fetchLowestPrices(coins: string[], periods: Period[], csvData: CsvRecord[]): Promise<CoinData[]> {
  const coinDataList: CoinData[] = [];

  for (const coin of coins) {
    const lowestPrices: { [period: string]: LowestPrice } = {};
    for (const period of periods) {
      const lowestPrice = await getLowestPriceData(coin, period, csvData);
      const periodKey = `${period.start.toISOString()}_${period.end.toISOString()}`;
      lowestPrices[periodKey] = lowestPrice;
    }
    coinDataList.push({ coin, lowestPrices });
  }

  return coinDataList;
}

async function fetchCurrentPrices(coinDataList: CoinData[]): Promise<void> {
  for (const coinData of coinDataList) {
    try {
      coinData.currentPrice = await fetchCurrentPriceWithRetry(coinData.coin);
      console.log(`Fetched current price for ${coinData.coin}: $${coinData.currentPrice}`);
    } catch (error) {
      console.error(`Failed to fetch current price for ${coinData.coin}:`, error);
    }
  }
}

function calculateInvestmentResults(coinData: CoinData, periods: Period[]): InvestmentSummary {
  const results: InvestmentResult[] = [];
  let totalCurrentValue = 0;

  if (!coinData.currentPrice) {
    throw new Error("Current price is not available");
  }

  for (const period of periods) {
    const periodKey = `${period.start.toISOString()}_${period.end.toISOString()}`;
    const lowestPrice = coinData.lowestPrices[periodKey];
    const investmentAmount = 100;
    const coinsAcquired = investmentAmount / lowestPrice.price;
    const currentValue = coinsAcquired * coinData.currentPrice;
    const profitLoss = currentValue - investmentAmount;
    const profitLossPercentage = (profitLoss / investmentAmount) * 100;

    totalCurrentValue += currentValue;

    results.push({
      period: `${period.start.toISOString().split('T')[0]} to ${period.end.toISOString().split('T')[0]}`,
      investmentAmount,
      coinsAcquired,
      currentValue,
      profitLoss,
      profitLossPercentage
    });
  }

  return { results, totalCurrentValue };
}

async function main() {
  const coins = await readCoinsFromFile('coin_list.txt');
  if (coins.length === 0) {
    console.error('No cryptocurrencies found in the file. Please add some to coin_list.txt');
    return;
  }

  const periods: Period[] = [
    { start: new Date('2024-08-04'), end: new Date('2024-08-06') },
    { start: new Date('2024-09-06'), end: new Date('2024-09-08') },
  ];

  let csvData = await readCsvData();
  const coinSummaries: CoinSummary[] = [];

  // Fetch lowest prices for all coins and periods
  const coinDataList = await fetchLowestPrices(coins, periods, csvData);

  // Fetch current prices for all coins
  await fetchCurrentPrices(coinDataList);

  // Calculate investment results
  for (const coinData of coinDataList) {
    console.log(`Investment results for ${coinData.coin}:`);
    try {
      const { results: investmentResults, totalCurrentValue } = calculateInvestmentResults(coinData, periods);
      investmentResults.forEach(result => {
        console.log(`Period: ${result.period}`);
        console.log(`Current Value: $${result.currentValue.toFixed(2)}`);
      });
      console.log(`Total Current Value for all periods: $${totalCurrentValue.toFixed(2)}`);
      coinSummaries.push({ coin: coinData.coin, totalCurrentValue });
    } catch (error) {
      console.error(`Failed to calculate investment results for ${coinData.coin}:`, error instanceof Error ? error.message : String(error));
    }
    console.log("----------------------------------------");
  }

  // Sort coinSummaries by totalCurrentValue in descending order
  coinSummaries.sort((a, b) => b.totalCurrentValue - a.totalCurrentValue);

  console.log("\nSaving sorted results");
  const currentDate = new Date().toISOString().split('T')[0];
  const [currentYear, currentMonth] = currentDate.split('-');
  const todayResultPath = `results/${currentYear}/${currentMonth}`;
  await ensureDirectoryExists(todayResultPath);  
  const todayResultFilename = `${todayResultPath}/${currentDate}.csv`;
  const csvContent = stringify(coinSummaries, { header: true });
  await fs.writeFile(todayResultFilename, csvContent, 'utf-8');
  console.log(`Results saved to ${todayResultFilename}`);
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}


main();
