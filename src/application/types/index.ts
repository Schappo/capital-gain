export type OperationInput = {
  operation: 'buy' | 'sell';
  'unit-cost': number;
  quantity: number;
};

export type TaxOutput = {
  tax: number;
};
