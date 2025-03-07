import { Period } from "./types";

const PRICE_DATA_FILE = 'results/price_data.csv';
const COIN_LIST_FILE = 'coin_list.txt';

const DATE = process.env.DATE || new Date().toISOString().split('T')[0];

const periods: Period[] = [
  { start: new Date('2024-08-04'), end: new Date('2024-08-06') }, // BTC dip
  { start: new Date('2024-09-06'), end: new Date('2024-09-08') }, // BTC dip
  { start: new Date('2024-11-05'), end: new Date('2024-11-07') }, // trump win
  { start: new Date('2024-12-05'), end: new Date('2024-12-07') }, // BTC dip
  { start: new Date('2024-12-19'), end: new Date('2024-12-21') }, // alt crash
  { start: new Date('2025-01-12'), end: new Date('2025-01-14') }, // BTC dip
  { start: new Date('2025-02-02'), end: new Date('2025-02-04') }, // BTC dip
  { start: new Date('2025-02-27'), end: new Date('2025-03-01') }, // BTC dip
];

export { PRICE_DATA_FILE, COIN_LIST_FILE, periods, DATE };
