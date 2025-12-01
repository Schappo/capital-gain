import { CapitalGainsApplication } from './application/capital-gains.application';
import { CliIoHandler } from './adapters/cli/cli-io.adapter';

describe('Capital Gains Application Integration', () => {
  it('should create application instance', () => {
    const ioHandler = new CliIoHandler();
    const app = new CapitalGainsApplication(ioHandler);

    expect(app).toBeDefined();
  });
});
