import { TaxResult } from './tax-result';

describe('TaxResult', () => {
  it('should keep values already at 2 decimals', () => {
    const result = new TaxResult(10.12);
    expect(result.tax).toBe(10.12);
  });

  it('should round to 2 decimals as per specification', () => {
    const cases: Array<[number, number]> = [
      [10, 10.0],
      [10.1, 10.1],
      [10.123, 10.12],
      [10.125, 10.13], // .5 should round up
      [10.1249, 10.12],
      [-5.554, -5.55],
      [-5.555, -5.55], // JS Math.round(-x.5) rounds toward zero
    ];

    for (const [input, expected] of cases) {
      const result = new TaxResult(input);
      expect(result.tax).toBe(expected);
    }
  });

  it('should expose the rounded value via getter', () => {
    const result = new TaxResult(0.333333);
    expect(result.tax).toBe(0.33);
  });

  it('should serialize to expected JSON shape', () => {
    const result = new TaxResult(7.899);
    expect(result.toJSON()).toEqual({ tax: 7.9 });
  });
});
