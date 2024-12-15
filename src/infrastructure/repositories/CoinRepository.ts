import fs from 'fs/promises';
import config from '../../config';

export class CoinRepository {
  private readonly filePath: string;

  constructor() {
    this.filePath = config.files.coinList;
  }

  async getCoins(): Promise<string[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return data
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'));
    } catch (error) {
      console.error(`Error reading ${this.filePath}:`, error);
      return [];
    }
  }
} 