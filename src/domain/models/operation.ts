export class Operation {
  private readonly _operation: 'buy' | 'sell';
  private readonly _unitCost: number;
  private readonly _quantity: number;

  constructor(operation: 'buy' | 'sell', unitCost: number, quantity: number) {
    this._operation = operation;
    this._unitCost = unitCost;
    this._quantity = quantity;
  }

  get operation(): 'buy' | 'sell' {
    return this._operation;
  }

  get unitCost(): number {
    return this._unitCost;
  }

  get quantity(): number {
    return this._quantity;
  }

  isBuy(): boolean {
    return this._operation === 'buy';
  }

  isSell(): boolean {
    return this._operation === 'sell';
  }

  getTotalValue(): number {
    return this._unitCost * this._quantity;
  }
}
