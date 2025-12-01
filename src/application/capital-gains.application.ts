import { Operation } from '../domain/models/operation.js';
import { TaxCalculatorService } from '../domain/services/tax-calculator.service.js';
import type { ICapitalGainsIO } from './interfaces/capital-gains-io.interface.js';
import type { OperationInput, TaxOutput } from './types/index.js';

export class CapitalGainsApplication {
  constructor(private readonly ioHandler: ICapitalGainsIO) {}

  async run(): Promise<void> {
    try {
      const simulations = await this.ioHandler.readInput();

      for (const operationsInput of simulations) {
        const results = this.processSimulation(operationsInput);
        this.ioHandler.writeOutput(results);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
      throw error;
    }
  }

  private processSimulation(operationsInput: OperationInput[]): TaxOutput[] {
    const calculator = new TaxCalculatorService();
    const operations = this.mapInputToOperations(operationsInput);
    const taxResults = calculator.processOperations(operations);

    return taxResults.map((result) => result.toJSON());
  }

  private mapInputToOperations(inputs: OperationInput[]): Operation[] {
    return inputs.map(
      (input) => new Operation(input.operation, input['unit-cost'], input.quantity)
    );
  }
}
