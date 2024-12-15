import { createCryptoInvestmentService } from './application/factory';

async function main() {
  try {
    const service = createCryptoInvestmentService();
    await service.analyzeInvestments();
  } catch (error) {
    console.error('Application failed:', error);
    process.exit(1);
  }
}

main();
