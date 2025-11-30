import { TradeOperation, TradeResult } from './types';

export class CliIoHandler implements CliIoHandler {
  async readInput(): Promise<TradeOperation[][]> {
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    const allOperations: TradeOperation[][] = [];

    for await (const simulation of rl) {
      if (simulation.trim() === '') {
        rl.close();
        console.log('No more simulations to process.');
        break;
      }
      try {
        const operations: TradeOperation[] = JSON.parse(simulation);
        allOperations.push(operations);
      } catch {
        console.error(
          'Invalid input format. Please provide a valid JSON array of trade operations.'
        );
      }
    }
    return allOperations;
  }

  writeOutput(results: TradeResult[]): void {
    results.forEach((result) => {
      console.log(JSON.stringify(result));
    });
  }
}
