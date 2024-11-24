import { PRICE_DATA_FILE } from "../config";
import { PriceDataRecord } from "../types";
import { parse } from 'csv-parse/sync';
import fs from 'fs/promises';
import { stringify } from 'csv-stringify/sync';

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

async function readPriceData(): Promise<PriceDataRecord[]> {
  try {
    const csvContent = await fs.readFile(PRICE_DATA_FILE, 'utf-8');
    return parse(csvContent, { columns: true, cast: true }) as PriceDataRecord[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writePriceData(records: PriceDataRecord[]): Promise<void> {
  const csvContent = stringify(records, { header: true });
  await fs.writeFile(PRICE_DATA_FILE, csvContent, 'utf-8');
}

export { readPriceData, writePriceData, readCoinsFromFile };
