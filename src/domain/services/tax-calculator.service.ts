import { Operation } from '../models/operation.js';
import { Portfolio } from '../models/portfolio.js';
import { TaxResult } from '../models/tax-result.js';

export class TaxCalculatorService {
  private static readonly TAX_RATE = 0.2;
  private static readonly TAX_FREE_LIMIT = 20000;

  private portfolio: Portfolio;
  private accumulatedLoss: number;

  constructor() {
    this.portfolio = new Portfolio();
    this.accumulatedLoss = 0;
  }

  processOperations(operations: Operation[]): TaxResult[] {
    return operations.map((operation) => this.processOperation(operation));
  }

  private processOperation(operation: Operation): TaxResult {
    if (operation.isBuy()) {
      return this.processBuyOperation(operation);
    }

    return this.processSellOperation(operation);
  }

  private processBuyOperation(operation: Operation): TaxResult {
    this.portfolio.buy(operation.quantity, operation.unitCost);
    return new TaxResult(0);
  }

  private processSellOperation(operation: Operation): TaxResult {
    const totalOperationValue = operation.getTotalValue();
    const profitOrLoss = this.portfolio.calculateProfitOrLoss(
      operation.quantity,
      operation.unitCost
    );

    this.portfolio.sell(operation.quantity);

    if (totalOperationValue <= TaxCalculatorService.TAX_FREE_LIMIT) {
      if (profitOrLoss < 0) {
        this.accumulatedLoss += Math.abs(profitOrLoss);
      }
      return new TaxResult(0);
    }

    if (profitOrLoss <= 0) {
      this.accumulatedLoss += Math.abs(profitOrLoss);
      return new TaxResult(0);
    }

    const taxableProfit = this.calculateTaxableProfit(profitOrLoss);
    const tax = taxableProfit * TaxCalculatorService.TAX_RATE;

    return new TaxResult(tax);
  }

  private calculateTaxableProfit(profit: number): number {
    if (this.accumulatedLoss === 0) {
      return profit;
    }

    if (this.accumulatedLoss >= profit) {
      this.accumulatedLoss -= profit;
      return 0;
    }

    const taxableProfit = profit - this.accumulatedLoss;
    this.accumulatedLoss = 0;
    return taxableProfit;
  }

  reset(): void {
    this.portfolio = new Portfolio();
    this.accumulatedLoss = 0;
  }
}
