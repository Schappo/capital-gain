/**
 * End-to-End tests for Capital Gains Calculator
 * Tests all 9 cases from the specification
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

describe('Capital Gains E2E Tests', () => {
  const runCapitalGains = async (input: string): Promise<string> => {
    const tempFile = join(__dirname, `temp-input-${Date.now()}.txt`);

    try {
      await writeFile(tempFile, input);
      const { stdout } = await execAsync(`node dist/index.js < ${tempFile}`);
      return stdout.trim();
    } finally {
      try {
        await unlink(tempFile);
      } catch {
        // Ignore cleanup errors
      }
    }
  };

  beforeAll(async () => {
    // Build the project before running E2E tests
    await execAsync('npm run build');
  }, 30000);

  describe('Case #1: Tax-free operations (total <= 20000)', () => {
    it('should not charge tax on small operations', async () => {
      const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 100},{"operation":"sell", "unit-cost":15.00, "quantity": 50},{"operation":"sell", "unit-cost":15.00, "quantity": 50}]\n`;

      const output = await runCapitalGains(input);

      expect(output).toBe('[{"tax":0},{"tax":0},{"tax":0}]');
    });
  });

  describe('Case #2: Profit and loss', () => {
    it('should charge tax on profit and handle loss', async () => {
      const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":20.00, "quantity": 5000},{"operation":"sell", "unit-cost":5.00, "quantity": 5000}]\n`;

      const output = await runCapitalGains(input);

      expect(output).toBe('[{"tax":0},{"tax":10000},{"tax":0}]');
    });
  });

  describe('Case #1 + Case #2: Multiple simulations', () => {
    it('should handle multiple independent simulations', async () => {
      const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 100},{"operation":"sell", "unit-cost":15.00, "quantity": 50},{"operation":"sell", "unit-cost":15.00, "quantity": 50}]
[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":20.00, "quantity": 5000},{"operation":"sell", "unit-cost":5.00, "quantity": 5000}]\n`;

      const output = await runCapitalGains(input);
      const lines = output.split('\n');

      expect(lines[0]).toBe('[{"tax":0},{"tax":0},{"tax":0}]');
      expect(lines[1]).toBe('[{"tax":0},{"tax":10000},{"tax":0}]');
    });
  });

  describe('Case #3: Loss deduction', () => {
    it('should deduct accumulated loss from future profit', async () => {
      const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":5.00, "quantity": 5000},{"operation":"sell", "unit-cost":20.00, "quantity": 3000}]\n`;

      const output = await runCapitalGains(input);

      expect(output).toBe('[{"tax":0},{"tax":0},{"tax":1000}]');
    });
  });

  describe('Case #4: Weighted average - no profit', () => {
    it('should calculate weighted average correctly', async () => {
      const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"buy", "unit-cost":25.00, "quantity": 5000},{"operation":"sell", "unit-cost":15.00, "quantity": 10000}]\n`;

      const output = await runCapitalGains(input);

      expect(output).toBe('[{"tax":0},{"tax":0},{"tax":0}]');
    });
  });

  describe('Case #5: Weighted average with profit', () => {
    it('should charge tax after weighted average calculation', async () => {
      const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"buy", "unit-cost":25.00, "quantity": 5000},{"operation":"sell", "unit-cost":15.00, "quantity": 10000},{"operation":"sell", "unit-cost":25.00, "quantity": 5000}]\n`;

      const output = await runCapitalGains(input);

      expect(output).toBe('[{"tax":0},{"tax":0},{"tax":0},{"tax":10000}]');
    });
  });

  describe('Case #6: Complex loss deduction', () => {
    it('should handle multiple losses and profits correctly', async () => {
      const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":2.00, "quantity": 5000},{"operation":"sell", "unit-cost":20.00, "quantity": 2000},{"operation":"sell", "unit-cost":20.00, "quantity": 2000},{"operation":"sell", "unit-cost":25.00, "quantity": 1000}]\n`;

      const output = await runCapitalGains(input);

      expect(output).toBe('[{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":3000}]');
    });
  });

  describe('Case #7: Multiple cycles with new purchases', () => {
    it('should handle selling all and buying again', async () => {
      const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":2.00, "quantity": 5000},{"operation":"sell", "unit-cost":20.00, "quantity": 2000},{"operation":"sell", "unit-cost":20.00, "quantity": 2000},{"operation":"sell", "unit-cost":25.00, "quantity": 1000},{"operation":"buy", "unit-cost":20.00, "quantity": 10000},{"operation":"sell", "unit-cost":15.00, "quantity": 5000},{"operation":"sell", "unit-cost":30.00, "quantity": 4350},{"operation":"sell", "unit-cost":30.00, "quantity": 650}]\n`;

      const output = await runCapitalGains(input);

      expect(output).toBe(
        '[{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":3000},{"tax":0},{"tax":0},{"tax":3700},{"tax":0}]'
      );
    });
  });

  describe('Case #8: Complete sell and rebuy', () => {
    it('should reset weighted average after selling all shares', async () => {
      const input = `[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":50.00, "quantity": 10000},{"operation":"buy", "unit-cost":20.00, "quantity": 10000},{"operation":"sell", "unit-cost":50.00, "quantity": 10000}]\n`;

      const output = await runCapitalGains(input);

      expect(output).toBe('[{"tax":0},{"tax":80000},{"tax":0},{"tax":60000}]');
    });
  });

  describe('Case #9: Tax-free limit with accumulated losses', () => {
    it('should handle tax-free operations with loss deduction', async () => {
      const input = `[{"operation": "buy", "unit-cost": 5000.00, "quantity": 10},{"operation": "sell", "unit-cost": 4000.00, "quantity": 5},{"operation": "buy", "unit-cost": 15000.00, "quantity": 5},{"operation": "buy", "unit-cost": 4000.00, "quantity": 2},{"operation": "buy", "unit-cost": 23000.00, "quantity": 2},{"operation": "sell", "unit-cost": 20000.00, "quantity": 1},{"operation": "sell", "unit-cost": 12000.00, "quantity": 10},{"operation": "sell", "unit-cost": 15000.00, "quantity": 3}]\n`;

      const output = await runCapitalGains(input);

      expect(output).toBe(
        '[{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":0},{"tax":1000},{"tax":2400}]'
      );
    });
  });
});
