import { CliIoHandler } from './cli-io.adapter';
import { TaxOutput } from '../../application/types';

describe('CliIoHandler', () => {
  let handler: CliIoHandler;

  beforeEach(() => {
    handler = new CliIoHandler();
  });

  describe('writeOutput', () => {
    it('should output results as single JSON array', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const results: TaxOutput[] = [{ tax: 0 }, { tax: 10000 }, { tax: 0 }];

      handler.writeOutput(results);

      expect(consoleSpy).toHaveBeenCalledWith('[{"tax":0},{"tax":10000},{"tax":0}]');
      expect(consoleSpy).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });

    it('should handle decimal values', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const results: TaxOutput[] = [{ tax: 0 }, { tax: 1000.5 }];

      handler.writeOutput(results);

      expect(consoleSpy).toHaveBeenCalledWith('[{"tax":0},{"tax":1000.5}]');

      consoleSpy.mockRestore();
    });

    it('should handle empty results', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const results: TaxOutput[] = [];

      handler.writeOutput(results);

      expect(consoleSpy).toHaveBeenCalledWith('[]');

      consoleSpy.mockRestore();
    });
  });

  describe('readInput integration', () => {
    it('should be defined', () => {
      expect(handler.readInput).toBeDefined();
    });
  });
});
