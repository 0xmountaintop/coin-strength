import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { LowestPriceWithDate, Period, PriceDataRecord } from "../../domain/types";
import { PriceRepository } from "./PriceRepository";
import config from "../../config";

export class CsvPriceRepository implements PriceRepository {
  private readonly filePath: string;

  constructor() {
    this.filePath = config.files.priceData;
  }

  async findLowestPrice(coin: string, period: Period): Promise<LowestPriceWithDate | null> {
    const records = await this.getAllPriceRecords();
    const record = records.find(
      r => r.coin === coin &&
           r.periodStart === period.start.toISOString() &&
           r.periodEnd === period.end.toISOString()
    );

    if (!record) {
      return null;
    }

    return {
      date: new Date(record.lowestPriceDate),
      price: record.lowestPrice
    };
  }

  async saveLowestPrice(coin: string, period: Period, price: LowestPriceWithDate): Promise<void> {
    const records = await this.getAllPriceRecords();
    
    const newRecord: PriceDataRecord = {
      coin,
      periodStart: period.start.toISOString(),
      periodEnd: period.end.toISOString(),
      lowestPrice: price.price,
      lowestPriceDate: price.date.toISOString()
    };

    const existingIndex = records.findIndex(
      r => r.coin === coin &&
           r.periodStart === period.start.toISOString() &&
           r.periodEnd === period.end.toISOString()
    );

    if (existingIndex >= 0) {
      records[existingIndex] = newRecord;
    } else {
      records.push(newRecord);
    }

    const csvContent = stringify(records, { header: true });
    await fs.writeFile(this.filePath, csvContent, 'utf-8');
  }

  async getAllPriceRecords(): Promise<PriceDataRecord[]> {
    try {
      const csvContent = await fs.readFile(this.filePath, 'utf-8');
      return parse(csvContent, { columns: true, cast: true }) as PriceDataRecord[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }
} 