<!-- Powered by BMAD™ Core -->

# Write Tests Task

## Purpose

To write comprehensive, maintainable test code for a given file or component following industry best practices.

## Process

### 1. Analyze Source Code
- Load the target file to be tested
- Identify:
  - Public methods/functions to test
  - Edge cases and error paths
  - Dependencies to mock
  - Existing test file (if any)

### 2. Test Planning
- Determine test types needed (unit/integration/E2E)
- Identify test scenarios:
  - Happy path
  - Edge cases (null, empty, boundary values)
  - Error conditions
  - Integration points
- Plan mock strategy for dependencies

### 3. Write Test Code

Follow these patterns:

**For Unit Tests:**
```javascript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should [expected behavior description]', () => {
      // Arrange
      const input = setupTestData();
      
      // Act
      const result = component.methodName(input);
      
      // Assert
      expect(result).toMatchExpectedBehavior();
    });
    
    it('should handle error case correctly', () => {
      expect(() => component.methodName(invalidInput))
        .toThrow('Expected error message');
    });
  });
});
```

**Key Principles:**
- One concept per test
- Descriptive test names
- Arrange-Act-Assert structure
- Mock external dependencies
- Test edge cases

### 4. Verification
- Ensure all public methods have test coverage
- Verify edge cases are covered
- Check that error paths are tested
- Confirm test file follows project conventions

### 5. Review Checklist
- [ ] All public methods have tests
- [ ] Edge cases are covered
- [ ] Error conditions are tested
- [ ] Mocks are used appropriately
- [ ] Test names are descriptive
- [ ] Tests are independent and runnable in any order
- [ ] Assertions are clear and specific
- [ ] No flaky tests (no timing dependencies)
- [ ] Setup/teardown is clean

## Output

Create or update test file following project structure:
- Location: Mirror source structure
- Naming: `component.test.js` or `component.spec.js`
- Structure: Organized by feature/method

