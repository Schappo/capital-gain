import { Operation } from '../../domain/models/operation';

describe('Operation', () => {
  describe('constructor', () => {
    it('should create a buy operation', () => {
      const operation = new Operation('buy', 10.0, 100);

      expect(operation.operation).toBe('buy');
      expect(operation.unitCost).toBe(10.0);
      expect(operation.quantity).toBe(100);
    });

    it('should create a sell operation', () => {
      const operation = new Operation('sell', 20.0, 50);

      expect(operation.operation).toBe('sell');
      expect(operation.unitCost).toBe(20.0);
      expect(operation.quantity).toBe(50);
    });
  });

  describe('isBuy', () => {
    it('should return true for buy operations', () => {
      const operation = new Operation('buy', 10.0, 100);
      expect(operation.isBuy()).toBe(true);
    });

    it('should return false for sell operations', () => {
      const operation = new Operation('sell', 10.0, 100);
      expect(operation.isBuy()).toBe(false);
    });
  });

  describe('isSell', () => {
    it('should return true for sell operations', () => {
      const operation = new Operation('sell', 10.0, 100);
      expect(operation.isSell()).toBe(true);
    });

    it('should return false for buy operations', () => {
      const operation = new Operation('buy', 10.0, 100);
      expect(operation.isSell()).toBe(false);
    });
  });

  describe('getTotalValue', () => {
    it('should calculate total value correctly', () => {
      const operation = new Operation('buy', 10.5, 100);
      expect(operation.getTotalValue()).toBe(1050);
    });

    it('should handle decimal values', () => {
      const operation = new Operation('sell', 15.75, 200);
      expect(operation.getTotalValue()).toBe(3150);
    });
  });
});
