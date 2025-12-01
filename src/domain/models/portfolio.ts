export class Portfolio {
  constructor(
    private _quantity: number = 0,
    private _weightedAveragePrice: number = 0,
    private _currentValue: number = 0,
    private _accumulatedGain: number = 0
  ) {}

  get quantity(): number {
    return this._quantity;
  }

  get currentValue(): number {
    return this._currentValue;
  }

  get weightedAveragePrice(): number {
    return this._weightedAveragePrice;
  }

  get accumulatedGain(): number {
    return this._accumulatedGain;
  }

  private updateCurrentValue(): void {
    this._currentValue = this._quantity * this._weightedAveragePrice;
  }

  buy(quantity: number, unitCost: number): void {
    this.updateCurrentValue();
    const newValue = quantity * unitCost;
    const totalQuantity = this._quantity + quantity;

    if (totalQuantity > 0) {
      this._weightedAveragePrice = (this._currentValue + newValue) / totalQuantity;
    } else {
      this._weightedAveragePrice = 0;
    }

    this._quantity = totalQuantity;
  }

  sell(quantity: number): void {
    this._quantity -= quantity;

    if (this._quantity === 0) {
      this._weightedAveragePrice = 0;
    }

    this._accumulatedGain = this.calculateProfitOrLoss(quantity, this._weightedAveragePrice);
  }

  calculateProfitOrLoss(quantity: number, sellPrice: number): number {
    return (sellPrice - this._weightedAveragePrice) * quantity;
  }
}
