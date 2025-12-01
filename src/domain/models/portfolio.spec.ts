import { Portfolio } from '../../domain/models/portfolio';

describe('Portfolio', () => {
  let portfolio: Portfolio;

  beforeEach(() => {
    portfolio = new Portfolio();
  });

  describe('initial state', () => {
    it('should start with zero quantity and price', () => {
      expect(portfolio.quantity).toBe(0);
      expect(portfolio.weightedAveragePrice).toBe(0);
    });
  });

  describe('buy', () => {
    it('should update portfolio on first buy', () => {
      portfolio.buy(100, 10.0);

      expect(portfolio.quantity).toBe(100);
      expect(portfolio.weightedAveragePrice).toBe(10.0);
    });

    it('should calculate weighted average on second buy', () => {
      portfolio.buy(100, 10.0);
      portfolio.buy(50, 20.0);

      expect(portfolio.quantity).toBe(150);
      // (100 * 10.0 + 50 * 20.0) / 150 = 13.33...
      expect(portfolio.weightedAveragePrice).toBeCloseTo(13.33, 2);
    });

    it('should handle weighted average as per specification example', () => {
      // Example from spec: buy 10 at 20, sell 5, buy 5 at 10
      portfolio.buy(10, 20.0);
      portfolio.sell(5);
      portfolio.buy(5, 10.0);

      // ((5 * 20.0) + (5 * 10.0)) / 10 = 15.0
      expect(portfolio.quantity).toBe(10);
      expect(portfolio.weightedAveragePrice).toBe(15.0);
    });

    it('should handle case #4 weighted average calculation', () => {
      // buy 10000 at 10.00, buy 5000 at 25.00
      portfolio.buy(10000, 10.0);
      portfolio.buy(5000, 25.0);

      // ((10000 * 10.0) + (5000 * 25.0)) / 15000 = 15.0
      expect(portfolio.quantity).toBe(15000);
      expect(portfolio.weightedAveragePrice).toBe(15.0);
    });
  });

  describe('sell', () => {
    it('should reduce quantity', () => {
      portfolio.buy(100, 10.0);
      portfolio.sell(50);

      expect(portfolio.quantity).toBe(50);
      expect(portfolio.weightedAveragePrice).toBe(10.0);
    });

    it('should reset weighted average when all shares are sold', () => {
      portfolio.buy(100, 10.0);
      portfolio.sell(100);

      expect(portfolio.quantity).toBe(0);
      expect(portfolio.weightedAveragePrice).toBe(0);
    });
  });

  describe('calculateProfitOrLoss', () => {
    beforeEach(() => {
      portfolio.buy(100, 10.0);
    });

    it('should calculate profit correctly', () => {
      const profitOrLoss = portfolio.calculateProfitOrLoss(50, 20.0);
      // (20.0 - 10.0) * 50 = 500
      expect(profitOrLoss).toBe(500);
    });

    it('should calculate loss correctly', () => {
      const profitOrLoss = portfolio.calculateProfitOrLoss(50, 5.0);
      // (5.0 - 10.0) * 50 = -250
      expect(profitOrLoss).toBe(-250);
    });

    it('should return zero for break-even', () => {
      const profitOrLoss = portfolio.calculateProfitOrLoss(50, 10.0);
      expect(profitOrLoss).toBe(0);
    });
  });
});
