import { TradeOperation, TradeResult } from '../types';

export interface CliIoHandler {
  readInput(): Promise<TradeOperation[][]>;
  writeOutput(results: TradeResult[]): void;
}
