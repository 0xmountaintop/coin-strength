import { CoinGeckoAPI } from '../infrastructure/coingecko';
import { CoinRepository } from '../infrastructure/repositories/CoinRepository';
import { CsvPriceRepository } from '../infrastructure/repositories/CsvPriceRepository';
import { CryptoInvestmentService } from './CryptoInvestmentService';

export function createCryptoInvestmentService(): CryptoInvestmentService {
  const coinGeckoAPI = new CoinGeckoAPI();
  const coinRepository = new CoinRepository();
  const priceRepository = new CsvPriceRepository();

  return new CryptoInvestmentService(
    coinRepository,
    priceRepository,
    coinGeckoAPI
  );
} 