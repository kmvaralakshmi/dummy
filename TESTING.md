# A/B Testing Backend - Testing Guide

## Overview
This project uses Jest and Supertest for comprehensive testing of the A/B Testing API.

## Test Structure

```
tests/
├── experiment.test.ts    # Experiment CRUD operations
├── tracking.test.ts      # Variant assignment and event tracking
└── analytics.test.ts     # Analytics and winner detection
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run with coverage
```bash
npm test -- --coverage
```

### Run specific test file
```bash
npm test -- experiment.test
```

### Run integration tests
```bash
npm run test:integration
```

## Test Coverage

The test suite covers:
- ✅ Experiment creation with validation
- ✅ Experiment lifecycle (draft → running → completed)
- ✅ User-to-variant assignment (consistent hashing)
- ✅ Event tracking (impressions, clicks, conversions)
- ✅ Analytics calculations (conversion rates, CTR)
- ✅ Statistical significance testing (Z-test)
- ✅ Winner detection
- ✅ Data export

## Continuous Integration

GitHub Actions automatically runs:
1. **Backend Tests** - Unit and integration tests
2. **Linting** - ESLint checks
3. **Build** - TypeScript compilation
4. **Frontend Tests** - Component tests
5. **E2E Tests** - Full integration tests

## Test Database

Tests use an in-memory SQLite database that is:
- Created fresh before each test suite (`beforeAll`)
- Cleaned up after tests (`afterAll`)
- Isolated from development/production databases

## Writing New Tests

### Example Test Structure

```typescript
describe('Feature Name', () => {
  beforeAll(async () => {
    // Setup code
  });

  afterAll(async () => {
    // Cleanup code
  });

  describe('Specific Endpoint', () => {
    it('should handle expected case', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .send({ data })
        .expect(200);

      expect(response.body).toHaveProperty('field');
    });

    it('should handle error case', async () => {
      const response = await request(app)
        .post('/api/endpoint')
        .send({ invalid })
        .expect(400);

      expect(response.body.error).toContain('message');
    });
  });
});
```

## Code Coverage Goals

- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

## Debugging Tests

### Run single test with verbose output
```bash
npm test -- --verbose experiment.test
```

### Debug with Node inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Best Practices

1. **Isolation** - Each test should be independent
2. **Cleanup** - Always clean up resources (database, files)
3. **Descriptive Names** - Use clear `it()` descriptions
4. **Arrange-Act-Assert** - Structure tests clearly
5. **Mock External Services** - Don't depend on external APIs
6. **Test Edge Cases** - Include boundary conditions
7. **Fast Tests** - Keep tests quick (< 5s per suite)

## Troubleshooting

### Tests failing locally
```bash
# Clear Jest cache
npm test -- --clearCache

# Re-install dependencies
rm -rf node_modules
npm install
```

### Database connection issues
Ensure SQLite is installed:
```bash
npm install sqlite3 --save
```

### TypeScript errors
```bash
# Rebuild
npm run build
```

## CI/CD Pipeline

The `.github/workflows/ci-cd.yml` defines:
- **test-backend**: Runs all backend tests
- **test-frontend**: Runs frontend tests
- **integration-test**: Full E2E testing
- **deploy-staging**: Auto-deploy to staging (develop branch)
- **deploy-production**: Manual deploy to production (main branch)

## Contributing

Before submitting a PR:
1. Write tests for new features
2. Ensure all tests pass: `npm test`
3. Check coverage: `npm test -- --coverage`
4. Lint code: `npm run lint`
5. Fix any issues: `npm run lint:fix`
