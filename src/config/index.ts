import { Period } from "../domain/types";
import path from 'path';

export interface AppConfig {
  files: {
    priceData: string;
    coinList: string;
    resultsDir: string;
  };
  date: string;
  periods: Period[];
}

export const config: AppConfig = {
  files: {
    priceData: path.join('results', 'price_data.csv'),
    coinList: 'coin_list.txt',
    resultsDir: 'results'
  },
  date: process.env.DATE || new Date().toISOString().split('T')[0],
  periods: [
    { start: new Date('2024-08-04'), end: new Date('2024-08-06') }, // BTC dip
    { start: new Date('2024-09-06'), end: new Date('2024-09-08') }, // BTC dip
    { start: new Date('2024-11-05'), end: new Date('2024-11-07') }, // trump win
  ]
};

export default config; 