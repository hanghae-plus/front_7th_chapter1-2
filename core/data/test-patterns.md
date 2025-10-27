# Test Patterns & Best Practices

## Test Structure Patterns

### Triple A Pattern
```javascript
// Arrange
const calculator = new Calculator();
const a = 5;
const b = 3;

// Act
const result = calculator.add(a, b);

// Assert
expect(result).toBe(8);
```

### Given-When-Then (BDD Style)
```javascript
describe('User Authentication', () => {
  it('should login successfully with valid credentials', () => {
    // Given: User has valid credentials
    const credentials = { username: 'test', password: 'valid' };
    
    // When: User attempts to login
    const result = authService.login(credentials);
    
    // Then: User should be authenticated
    expect(result.isAuthenticated).toBe(true);
    expect(result.token).toBeDefined();
  });
});
```

## Test Types

### Unit Tests
- Test individual functions/methods in isolation
- Mock external dependencies
- Fast execution
- High coverage target

### Integration Tests
- Test component interactions
- Use real databases, external services
- Slower but more realistic
- Focus on critical paths

### E2E Tests
- Test complete user workflows
- Use real environment
- Slowest but most realistic
- Minimal count, maximum value

## Common Test Patterns

### Testing Async Code
```javascript
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});
```

### Testing Error Cases
```javascript
it('should throw error for invalid input', () => {
  expect(() => processData(null)).toThrow('Invalid input');
});
```

### Testing Callbacks
```javascript
it('should call success callback', (done) => {
  asyncOperation((success) => {
    expect(success).toBe(true);
    done();
  });
});
```

### Using Mocks and Stubs
```javascript
// Mock external service
jest.mock('./apiService');
const apiService = require('./apiService');

it('should fetch user data', async () => {
  apiService.getUser.mockResolvedValue({ id: 1, name: 'Test' });
  const user = await fetchUser(1);
  expect(user.name).toBe('Test');
});
```

## Naming Conventions

### Test File Naming
- `component.test.js` - Jest
- `component.spec.js` - Jasmine
- `component.spec.ts` - TypeScript
- Mirror source structure

### Test Case Naming
- Use descriptive strings
- Follow pattern: "should [expected behavior]"
- Examples:
  - `should return error when input is null`
  - `should calculate sum correctly for positive numbers`
  - `should call callback with correct parameters`

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clean Setup**: Use beforeEach/afterEach for setup/teardown
3. **Avoid Test Interdependence**: Don't rely on test execution order
4. **Fast Feedback**: Keep tests fast for TDD workflow
5. **Clear Assertions**: One assertion per test when possible
6. **Edge Cases**: Test null, undefined, empty, max values
7. **Documentation**: Use descriptive test names as documentation

