import { Period } from "./types";

const PRICE_DATA_FILE = 'results/price_data.csv';
const COIN_LIST_FILE = 'coin_list.txt';

const DATE = process.env.DATE || new Date().toISOString().split('T')[0];

const periods: Period[] = [
  { start: new Date('2024-08-04'), end: new Date('2024-08-06') }, // BTC dip
  { start: new Date('2024-09-06'), end: new Date('2024-09-08') }, // BTC dip
  { start: new Date('2024-11-05'), end: new Date('2024-11-07') }, // trump win
];

// Add new constant for chart colors
const CHART_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FF6384', '#C9CBCF', '#7BC225', '#B56DFF'
];

export { PRICE_DATA_FILE, COIN_LIST_FILE, periods, DATE, CHART_COLORS };
