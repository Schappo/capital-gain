export class TaxResult {
  private readonly _tax: number;

  constructor(tax: number) {
    this._tax = Number(tax.toFixed(2));
  }

  get tax(): number {
    return this._tax;
  }

  toJSON(): { tax: number } {
    return { tax: this._tax };
  }
}
