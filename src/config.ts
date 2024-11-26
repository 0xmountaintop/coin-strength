import { Period } from "./types";

const PRICE_DATA_FILE = 'results/price_data.csv';
const COIN_LIST_FILE = 'coin_list.txt';

const DATE = process.env.DATE || new Date().toISOString().split('T')[0];

const periods: Period[] = [
  { start: new Date('2024-08-04'), end: new Date('2024-08-06') },
  { start: new Date('2024-09-06'), end: new Date('2024-09-08') },
];

export { PRICE_DATA_FILE, COIN_LIST_FILE, periods, DATE };
