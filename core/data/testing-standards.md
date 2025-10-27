# Testing Standards

## Test Quality Standards

### Coverage Requirements
- **Unit Tests**: Minimum 80% coverage for critical paths
- **Integration Tests**: Cover all integration points
- **E2E Tests**: Cover critical user journeys

### Performance Standards
- Unit tests: < 10ms per test
- Integration tests: < 1 second per test
- E2E tests: < 30 seconds per test

### Code Quality
- Tests must be deterministic
- No flaky tests allowed
- No dependencies between tests
- Clear and descriptive naming
- Mock external dependencies

## Test Organization

### Directory Structure
```
src/
├── components/
│   └── UserCard.tsx
└── __tests__/
    └── UserCard.test.tsx

tests/
├── unit/
├── integration/
└── e2e/
```

### File Naming
- `component.test.js`
- `component.spec.js`
- Mirror source structure

## Best Practices

1. **Test Independence**: Each test should run independently
2. **Repeatability**: Tests should produce same results every time
3. **Speed**: Tests should run as fast as possible
4. **Clear Failures**: Test failures should clearly indicate what went wrong
5. **Single Concept**: Each test should verify one thing
6. **DRY**: Don't repeat test setup, use fixtures
7. **Meaningful Names**: Test names should describe what is tested
8. **Mock Strategy**: Mock expensive operations, external APIs, databases

## Anti-Patterns to Avoid

- ❌ Testing implementation details
- ❌ Test interdependencies
- ❌ Slow tests (timers, sleep)
- ❌ Flaky tests (race conditions)
- ❌ Overspecification
- ❌ Under-specification

