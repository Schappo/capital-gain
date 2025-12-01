import { CapitalGainsApplication } from './capital-gains.application';
import type { ICapitalGainsIO } from './interfaces/capital-gains-io.interface';
import type { OperationInput, TaxOutput } from './types';

class FakeIO implements ICapitalGainsIO {
  private readonly simulations: OperationInput[][];
  public readonly outputs: TaxOutput[][] = [];

  constructor(simulations: OperationInput[][]) {
    this.simulations = simulations;
  }

  async readInput(): Promise<OperationInput[][]> {
    return this.simulations;
  }

  writeOutput(results: TaxOutput[]): void {
    this.outputs.push(results);
  }
}

describe('CapitalGainsApplication (integration)', () => {
  it('processes a single simulation end-to-end (Case #2)', async () => {
    const sim: OperationInput[] = [
      { operation: 'buy', 'unit-cost': 10.0, quantity: 10000 },
      { operation: 'sell', 'unit-cost': 20.0, quantity: 5000 },
      { operation: 'sell', 'unit-cost': 5.0, quantity: 5000 },
    ];

    const io = new FakeIO([sim]);
    const app = new CapitalGainsApplication(io);

    await app.run();

    expect(io.outputs).toHaveLength(1);
    expect(io.outputs[0]).toEqual([{ tax: 0 }, { tax: 10000 }, { tax: 0 }]);
  });

  it('handles multiple simulations independently (Case #1 + Case #2)', async () => {
    const sim1: OperationInput[] = [
      { operation: 'buy', 'unit-cost': 10.0, quantity: 100 },
      { operation: 'sell', 'unit-cost': 15.0, quantity: 50 },
      { operation: 'sell', 'unit-cost': 15.0, quantity: 50 },
    ];

    const sim2: OperationInput[] = [
      { operation: 'buy', 'unit-cost': 10.0, quantity: 10000 },
      { operation: 'sell', 'unit-cost': 20.0, quantity: 5000 },
      { operation: 'sell', 'unit-cost': 5.0, quantity: 5000 },
    ];

    const io = new FakeIO([sim1, sim2]);
    const app = new CapitalGainsApplication(io);

    await app.run();

    expect(io.outputs).toHaveLength(2);
    expect(io.outputs[0]).toEqual([{ tax: 0 }, { tax: 0 }, { tax: 0 }]);
    expect(io.outputs[1]).toEqual([{ tax: 0 }, { tax: 10000 }, { tax: 0 }]);
  });

  it('rounds tax to two decimals end-to-end when needed', async () => {
    // Build a scenario with taxable profit that yields fractional tax
    // Buy 2001 @ 10.00, Sell 2001 @ 10.03 =>
    // total sell = 20030.03 (> 20000), profit = 2001 * 0.03 = 60.03,
    // tax = 60.03 * 0.2 = 12.006 => rounds to 12.01
    const sim: OperationInput[] = [
      { operation: 'buy', 'unit-cost': 10.0, quantity: 2001 },
      { operation: 'sell', 'unit-cost': 10.03, quantity: 2001 },
    ];

    const io = new FakeIO([sim]);
    const app = new CapitalGainsApplication(io);

    await app.run();

    expect(io.outputs).toHaveLength(1);
    expect(io.outputs[0]).toEqual([{ tax: 0 }, { tax: 12.01 }]);
  });
});
