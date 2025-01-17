import axios from 'axios';
import fs from 'fs/promises';
import { stringify } from 'csv-stringify/sync';
import { COIN_LIST_FILE, DATE, periods } from './config';
import { PriceDataRecord, Period, LowestPriceWithDate, CoinData, InvestmentResult, CoinInvestmentsReport, CoinInvestmentsSummary } from './types';
import { ensureDirectoryExists, findLowestPrice } from './helper';
import { writePriceDataRecords, readCoinsFromFile, readPriceDataRecords } from './services/files';
import { fetchHistoricalPricesWithRetry, fetchCurrentPriceWithRetry } from './services/coingecko';


async function fetchLowestPriceAndSave(coin: string, period: Period, csvData: PriceDataRecord[]): Promise<LowestPriceWithDate> {
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
  const historicalPrices = await fetchHistoricalPricesWithRetry(coin, period);
  const lowestPrice = findLowestPrice(historicalPrices);

  const newRecord: PriceDataRecord = {
    coin,
    periodStart: period.start.toISOString(),
    periodEnd: period.end.toISOString(),
    lowestPrice: lowestPrice.price,
    lowestPriceDate: lowestPrice.date.toISOString()
  };

  csvData.push(newRecord);
  await writePriceDataRecords(csvData);

  return lowestPrice;
}

async function fetchLowestPrices(coins: string[], periods: Period[], csvData: PriceDataRecord[]): Promise<CoinData[]> {
  const coinDataList: CoinData[] = [];

  for (const coin of coins) {
    const lowestPrices: { [period: string]: LowestPriceWithDate } = {};
    for (const period of periods) {
      const lowestPrice = await fetchLowestPriceAndSave(coin, period, csvData);
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
      console.log(`Fetched current_date price (${DATE}) for ${coinData.coin}: $${coinData.currentPrice}`);
    } catch (error) {
      console.error(`Failed to fetch current_date (${DATE}) price for ${coinData.coin}:`, error);
    }
  }
}

function calculateInvestmentResults(coinData: CoinData, periods: Period[]): CoinInvestmentsReport {
  const results: InvestmentResult[] = [];
  let totalCurrentValue = 0;

  if (!coinData.currentPrice) {
    coinData.currentPrice = 0;
    // throw new Error("Current price is not available");
  }

  const today = new Date(DATE);
  // get the most recent period before today, and make it an array (for compatibility with the legavy code)
  const mostRecentPeriods = periods.filter(period => period.end < today).slice(-1);
  for (const period of mostRecentPeriods) {
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
  const coins = await readCoinsFromFile(COIN_LIST_FILE);
  if (coins.length === 0) {
    console.error('No cryptocurrencies found in the file. Please add some to coin_list.txt');
    return;
  }

  let priceDataRecords = await readPriceDataRecords();

  // Fetch lowest prices for all coins and periods
  const coinDataList = await fetchLowestPrices(coins, periods, priceDataRecords);

  // Fetch current prices for all coins
  await fetchCurrentPrices(coinDataList);

  // Calculate investment results
  const coinInvestmentsSummaries: CoinInvestmentsSummary[] = [];
  for (const coinData of coinDataList) {
    console.log(`Investment results for ${coinData.coin}:`);
    try {
      const { results: investmentResults, totalCurrentValue } = calculateInvestmentResults(coinData, periods);
      investmentResults.forEach(result => {
        console.log(`Period: ${result.period}`);
        console.log(`Current Value: $${result.currentValue.toFixed(2)}`);
      });
      console.log(`Total Current Value for all periods: $${totalCurrentValue.toFixed(2)}`);
      coinInvestmentsSummaries.push({ coin: coinData.coin, totalCurrentValue });
    } catch (error) {
      console.error(`Failed to calculate investment results for ${coinData.coin}:`, error instanceof Error ? error.message : String(error));
    }
    console.log("----------------------------------------");
  }

  // Sort coinSummaries by totalCurrentValue in descending order
  coinInvestmentsSummaries.sort((a, b) => b.totalCurrentValue - a.totalCurrentValue);

  console.log("\nSaving sorted results");
  const currentDate = DATE;
  const [currentYear, currentMonth] = currentDate.split('-');
  const todayResultPath = `results/${currentYear}/${currentMonth}`;
  await ensureDirectoryExists(todayResultPath);  
  const todayResultFilename = `${todayResultPath}/${currentDate}.csv`;
  const csvContent = stringify(coinInvestmentsSummaries, { header: true });
  await fs.writeFile(todayResultFilename, csvContent, 'utf-8');
  console.log(`Results saved to ${todayResultFilename}`);
}

main();
