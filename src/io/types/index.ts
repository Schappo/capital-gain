export type TradeOperation = {
  operation: 'buy' | 'sell';
  'unit-cost': number;
  quantity: number;
};

export type TradeResult = {
  tax: number;
  profit: number;
  details?: any;
};
