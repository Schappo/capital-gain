import { CliIoHandler } from './cli-io-handler';

// Helper to capture console output
function captureConsole(method: 'log' | 'error') {
  const original = console[method];
  const calls: string[] = [];
  // @ts-ignore
  console[method] = (msg?: any, ...args: any[]) => {
    calls.push([msg, ...args].join(' '));
  };
  return {
    calls,
    restore: () => {
      console[method] = original;
    },
  };
}

// Mock factory for readline that yields given lines (simulations)
function mockReadlineWith(lines: string[]) {
  const iterator = {
    async *[Symbol.asyncIterator]() {
      for (const line of lines) {
        // simulate microtask gap between lines
        await Promise.resolve();
        yield line;
      }
    },
  } as AsyncIterable<string>;

  const close = jest.fn();

  jest.mock('readline', () => ({
    __esModule: true,
    default: undefined,
    createInterface: () => ({
      input: {},
      output: {},
      terminal: false,
      close,
      // Provide async iterator support for `for await (const simulation of rl)`
      [Symbol.asyncIterator]: iterator[Symbol.asyncIterator],
    }),
  }));

  return { close };
}

describe('CliIoHandler', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('readInput parses multiple valid simulations', async () => {
    const simulations = [
      JSON.stringify([{ operation: 'buy', unitCost: 10, quantity: 5 }]),
      JSON.stringify([
        { operation: 'buy', unitCost: 15, quantity: 2 },
        { operation: 'sell', unitCost: 20, quantity: 2 },
      ]),
    ];

    mockReadlineWith(simulations);

    const handlerModule = await import('./cli-io-handler');
    const handler = new handlerModule.CliIoHandler();

    const result = await handler.readInput();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual([{ operation: 'buy', unitCost: 10, quantity: 5 }]);
    expect(result[1]).toEqual([
      { operation: 'buy', unitCost: 15, quantity: 2 },
      { operation: 'sell', unitCost: 20, quantity: 2 },
    ]);
  });

  it('readInput logs error on invalid JSON and continues', async () => {
    const simulations = [
      'not a json',
      JSON.stringify([{ operation: 'buy', unitCost: 12, quantity: 1 }]),
      '',
    ];

    const { close } = mockReadlineWith(simulations);

    const errorCapture = captureConsole('error');
    const logCapture = captureConsole('log');

    const handlerModule = await import('./cli-io-handler');
    const handler = new handlerModule.CliIoHandler();

    const result = await handler.readInput();

    expect(close).toHaveBeenCalled();

    expect(
      errorCapture.calls.some((c) =>
        c.includes('Invalid input format. Please provide a valid JSON array of trade operations.')
      )
    ).toBe(true);

    expect(logCapture.calls.some((c) => c.includes('No more simulations to process.'))).toBe(true);

    expect(result).toEqual([[{ operation: 'buy', unitCost: 12, quantity: 1 }]]);

    errorCapture.restore();
    logCapture.restore();
  });

  it('writeOutput prints each result as JSON line', () => {
    const handler = new CliIoHandler();
    const capture = captureConsole('log');

    const results = [{ tax: 0 }, { tax: 100.5 }];

    handler.writeOutput(results as any);

    expect(capture.calls).toHaveLength(2);
    expect(capture.calls[0]).toBe(JSON.stringify({ tax: 0 }));
    expect(capture.calls[1]).toBe(JSON.stringify({ tax: 100.5 }));

    capture.restore();
  });
});
