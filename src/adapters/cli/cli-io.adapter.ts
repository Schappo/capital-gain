import type { ICapitalGainsIO } from '../../application/interfaces/capital-gains-io.interface.js';
import type { OperationInput, TaxOutput } from '../../application/types/index.js';

export class CliIoHandler implements ICapitalGainsIO {
  async readInput(): Promise<OperationInput[][]> {
    const chunks: string[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(String(chunk));
    }

    const fullInput = chunks.join('').trim();

    if (!fullInput) {
      throw new Error('Invalid input format: empty stdin');
    }

    // Try to parse as a single JSON payload first
    try {
      const parsed = JSON.parse(fullInput);
      if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
        return parsed as OperationInput[][];
      }
      // If parsed is a flat array, wrap as single simulation
      if (Array.isArray(parsed) && (parsed.length === 0 || !Array.isArray(parsed[0]))) {
        return [parsed as OperationInput[]];
      }
    } catch {
      // If parsing the whole input fails, fall back to per-line JSON arrays
      // (do not throw here; we try the multi-line strategy below)
    }

    // Fallback: treat input as multiple lines with one JSON array per line
    const lines = fullInput
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length === 0) {
      throw new Error('Invalid input format: no valid lines');
    }

    const allOperations: OperationInput[][] = [];
    for (const line of lines) {
      try {
        const operations: OperationInput[] = JSON.parse(line);
        if (!Array.isArray(operations)) {
          throw new Error('Line is not a JSON array');
        }
        allOperations.push(operations);
      } catch (e) {
        throw new Error(`Invalid input format: ${line} - ${(e as Error).message}`);
      }
    }

    return allOperations;
  }

  writeOutput(results: TaxOutput[]): void {
    console.log(JSON.stringify(results));
  }
}
