import { readFile } from 'fs/promises';
import type { ICapitalGainsIO } from '../../application/interfaces/capital-gains-io.interface.js';
import type { OperationInput, TaxOutput } from '../../application/types/index.js';

export class FileIoHandler implements ICapitalGainsIO {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async readInput(): Promise<OperationInput[][]> {
    const content = await readFile(this.filePath, 'utf8');
    return content
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((line) => JSON.parse(line) as OperationInput[]);
  }

  writeOutput(results: TaxOutput[]): void {
    console.log(JSON.stringify(results));
  }
}
