import fs from 'fs/promises';
import { LowestPriceWithDate } from './types';

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
      await fs.access(dirPath);
  } catch {
      await fs.mkdir(dirPath, { recursive: true });
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function findLowestPrice(priceData: [number, number][]): LowestPriceWithDate {
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

export { ensureDirectoryExists, delay, findLowestPrice };
