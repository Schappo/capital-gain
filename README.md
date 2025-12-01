# Capital Gains Tax Calculator

CLI application to calculate capital gains tax for stock market operations.

## Architecture

The project follows **Clean Architecture** and **Domain-Driven Design (DDD)** with clearly separated layers:

```text
src/
├── domain/               # Business rules
│   ├── models/           # Entities and value objects
│   │   ├── operation.ts
│   │   ├── portfolio.ts
│   │   └── tax-result.ts
│   └── services/         # Domain services
│       └── tax-calculator.service.ts
├── application/          # Use cases
│   ├── capital-gains.application.ts
│   ├── interfaces/
│   └── types/
├── adapters/cli/         # IO adapters (CLI + file)
│   ├── cli-io.adapter.ts
│   └── file-io.adapter.ts
└── index.ts              # Entry point
```

### State Management

Application state (portfolio and accumulated losses) is kept in memory by `TaxCalculatorService`. Each input line represents an independent simulation, so a new calculator instance is used per line.

## Tech Stack

- Node.js (>= 18)
- TypeScript

Dev tools:

- Jest + ts-jest
- ESLint + Prettier
- Husky + lint-staged

## Build and Run

### Install

```bash
npm install
```

### Build

```bash
npm run build
```

### Run (stdin)

```bash
node dist/index.js
```

Type one JSON array per line and press Enter. End with an empty line.

### Run (file input)

```bash
node dist/index.js < examples/input.txt
```

### Development Mode

```bash
# Live run using tsx
npm run start:dev

# Watch mode
npm run start:watch

# Inspect mode for attach debugging
npm run start:dev:inspect
```

### Debugging in VS Code

Debug configs are provided in `.vscode/launch.json`:

- `Debug App (tsx live)`: runs `src/index.ts` via `tsx` loader.
- `Debug App (built dist)`: runs compiled `dist/index.js` with preLaunch build.
- `Attach to Node`: attach to a running process (use with `npm run start:dev:inspect`).

To debug with file input, use the CLI and redirect from `examples/input.txt`:

```bash
node dist/index.js < examples/input.txt
```
Edit `examples/input.txt` to customize simulations (one JSON array per line).
Set breakpoints in `tax-calculator.service.ts`, `portfolio.ts`, etc.

To attach:
```bash
npm run start:dev:inspect
```
Then choose `Attach to Node` in VS Code.

## Testing

### Structure

1. Unit tests (`src/**/*.spec.ts`)
2. E2E tests (`test-e2e/**/*.spec.ts`) – validate the 9 challenge cases using the compiled binary

### Run Tests

```bash
# All tests with coverage
npm test

# Unit only
npm test -- --testPathPattern=unit

# E2E only
npm test -- --testPathPattern=e2e

# Watch
npm run test:watch
Coverage report: `coverage/lcov-report/index.html`.

## Example

Input:

```json
[{"operation":"buy", "unit-cost":10.00, "quantity": 100},{"operation":"sell", "unit-cost":15.00, "quantity": 50},{"operation":"sell", "unit-cost":15.00, "quantity": 50}]
[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":20.00, "quantity": 5000},{"operation":"sell", "unit-cost":5.00, "quantity": 5000}]
```

Output:

```json
[{"tax":0},{"tax":0},{"tax":0}]
[{"tax":0},{"tax":10000},{"tax":0}]
```

## Project Structure

```text
capital-gain/
├── src/
│   ├── application/
│   │   ├── capital-gains.application.ts
│   │   ├── interfaces/
│   │   └── types/
│   ├── domain/
│   │   ├── models/
│   │   └── services/
│   ├── adapters/
│   │   └── cli/
│   │       ├── cli-io.adapter.ts
│   │       └── file-io.adapter.ts
│   └── index.ts
├── test-e2e/
├── coverage/
├── dist/
├── Dockerfile
├── jest.config.cjs
├── tsconfig.json
├── package.json
└── README.md
```

## License

ISC

---

Built following software engineering best practices.
