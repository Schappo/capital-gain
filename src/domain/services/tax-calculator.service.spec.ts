import { TaxCalculatorService } from '../../domain/services/tax-calculator.service';
import { Operation } from '../../domain/models/operation';

describe('TaxCalculatorService', () => {
  let calculator: TaxCalculatorService;

  beforeEach(() => {
    calculator = new TaxCalculatorService();
  });

  describe('Case #1: Small operations (tax-free limit)', () => {
    it('should not charge tax on operations <= 20000', () => {
      const operations = [
        new Operation('buy', 10.0, 100),
        new Operation('sell', 15.0, 50),
        new Operation('sell', 15.0, 50),
      ];

      const results = calculator.processOperations(operations);

      expect(results[0].tax).toBe(0);
      expect(results[1].tax).toBe(0);
      expect(results[2].tax).toBe(0);
    });
  });

  describe('Case #2: Profit and loss', () => {
    it('should charge tax on profit and accumulate loss', () => {
      const operations = [
        new Operation('buy', 10.0, 10000),
        new Operation('sell', 20.0, 5000),
        new Operation('sell', 5.0, 5000),
      ];

      const results = calculator.processOperations(operations);

      expect(results[0].tax).toBe(0); // buy
      expect(results[1].tax).toBe(10000); // profit 50000, tax 20%
      expect(results[2].tax).toBe(0); // loss 25000
    });
  });

  describe('Case #3: Loss deduction from future profit', () => {
    it('should deduct accumulated loss from profit', () => {
      const operations = [
        new Operation('buy', 10.0, 10000),
        new Operation('sell', 5.0, 5000),
        new Operation('sell', 20.0, 3000),
      ];

      const results = calculator.processOperations(operations);

      expect(results[0].tax).toBe(0); // buy
      expect(results[1].tax).toBe(0); // loss 25000
      expect(results[2].tax).toBe(1000); // profit 30000 - loss 25000 = 5000, tax = 1000
    });
  });

  describe('Case #4: Weighted average - no profit/loss', () => {
    it('should calculate weighted average correctly', () => {
      const operations = [
        new Operation('buy', 10.0, 10000),
        new Operation('buy', 25.0, 5000),
        new Operation('sell', 15.0, 10000),
      ];

      const results = calculator.processOperations(operations);

      expect(results[0].tax).toBe(0);
      expect(results[1].tax).toBe(0);
      expect(results[2].tax).toBe(0); // weighted avg = 15, no profit
    });
  });

  describe('Case #5: Weighted average with profit', () => {
    it('should charge tax after weighted average calculation', () => {
      const operations = [
        new Operation('buy', 10.0, 10000),
        new Operation('buy', 25.0, 5000),
        new Operation('sell', 15.0, 10000),
        new Operation('sell', 25.0, 5000),
      ];

      const results = calculator.processOperations(operations);

      expect(results[0].tax).toBe(0);
      expect(results[1].tax).toBe(0);
      expect(results[2].tax).toBe(0); // no profit
      expect(results[3].tax).toBe(10000); // profit 50000, tax 20%
    });
  });

  describe('Case #6: Multiple losses and profits', () => {
    it('should handle complex loss deduction scenario', () => {
      const operations = [
        new Operation('buy', 10.0, 10000),
        new Operation('sell', 2.0, 5000), // loss 40000, but total <= 20000
        new Operation('sell', 20.0, 2000), // profit 20000 - loss 20000 = 0
        new Operation('sell', 20.0, 2000), // profit 20000 - loss 20000 = 0
        new Operation('sell', 25.0, 1000), // profit 15000, tax 3000
      ];

      const results = calculator.processOperations(operations);

      expect(results[0].tax).toBe(0);
      expect(results[1].tax).toBe(0); // loss accumulated
      expect(results[2].tax).toBe(0); // profit absorbed by loss
      expect(results[3].tax).toBe(0); // profit absorbed by loss
      expect(results[4].tax).toBe(3000); // profit 15000, tax 20%
    });
  });

  describe('Case #8: Multiple independent cycles', () => {
    it('should handle selling all shares and buying again', () => {
      const operations = [
        new Operation('buy', 10.0, 10000),
        new Operation('sell', 50.0, 10000),
        new Operation('buy', 20.0, 10000),
        new Operation('sell', 50.0, 10000),
      ];

      const results = calculator.processOperations(operations);

      expect(results[0].tax).toBe(0);
      expect(results[1].tax).toBe(80000); // profit 400000, tax 80000
      expect(results[2].tax).toBe(0);
      expect(results[3].tax).toBe(60000); // profit 300000, tax 60000
    });
  });

  describe('buy operations', () => {
    it('should never charge tax on buy operations', () => {
      const operations = [
        new Operation('buy', 10.0, 1000),
        new Operation('buy', 100.0, 1000),
        new Operation('buy', 1000.0, 1000),
      ];

      const results = calculator.processOperations(operations);

      expect(results[0].tax).toBe(0);
      expect(results[1].tax).toBe(0);
      expect(results[2].tax).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset portfolio and accumulated losses', () => {
      const operations1 = [new Operation('buy', 10.0, 10000), new Operation('sell', 5.0, 5000)];

      calculator.processOperations(operations1);
      calculator.reset();

      const operations2 = [new Operation('buy', 20.0, 10000), new Operation('sell', 30.0, 5000)];

      const results = calculator.processOperations(operations2);

      // Should start fresh, no loss from previous simulation
      expect(results[1].tax).toBe(10000); // profit 50000, tax 10000
    });
  });
});
