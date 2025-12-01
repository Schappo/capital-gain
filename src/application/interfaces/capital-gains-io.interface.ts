import type { OperationInput, TaxOutput } from '../types/index.js';

export interface ICapitalGainsIO {
  readInput(): Promise<OperationInput[][]>;
  writeOutput(results: TaxOutput[]): void;
}
