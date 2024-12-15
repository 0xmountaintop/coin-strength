import { LowestPriceWithDate, Period, PriceDataRecord } from "../../domain/types";

export interface PriceRepository {
  findLowestPrice(coin: string, period: Period): Promise<LowestPriceWithDate | null>;
  saveLowestPrice(coin: string, period: Period, price: LowestPriceWithDate): Promise<void>;
  getAllPriceRecords(): Promise<PriceDataRecord[]>;
} 