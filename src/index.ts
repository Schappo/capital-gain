import { CapitalGainsApplication } from './application/capital-gains.application.js';
import { CliIoHandler } from './adapters/cli/cli-io.adapter.js';

/**
 * Entry point for the Capital Gains Tax Calculator CLI application
 * Reads from stdin and writes to stdout as per specification
 */
async function main(): Promise<void> {
  const ioHandler = new CliIoHandler();
  const app = new CapitalGainsApplication(ioHandler);

  await app.run();
}

// Run the application
main().catch((error) => {
  console.error('Application error:', error.message);
  process.exit(1);
});
