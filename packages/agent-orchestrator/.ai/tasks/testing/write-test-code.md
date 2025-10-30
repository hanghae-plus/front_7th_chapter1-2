---
task: write-test-code
description: Write failing test code based on requirements (RED phase)
category: testing

contract:
  inputs:
    requirements:
      type: file
      description: Test plan or acceptance criteria defining expected behavior
      required: false
    existing_tests:
      type: file
      description: Existing test files to follow patterns and conventions
      required: false
      multiple: true
    implementation_context:
      type: text
      description: Testing constraints (framework, patterns, etc.)
      required: false
  outputs:
    test_code:
      type: file
      description: Test file with initially failing tests
      required: true

template: templates/testing/test-code.tmpl.md
---

# Task: Write Failing Test Code (RED)

## Objective

Create **test code that fails initially** because the implementation doesn't exist yet. This is the **RED** phase of TDD.

## Guidelines

### 1. Understand Requirements

From `requirements` input:
- Identify expected behaviors
- Extract test scenarios
- Note edge cases and error conditions

### 2. Follow Existing Patterns

If `existing_tests` is provided:
- Match naming conventions
- Use similar test structure
- Follow established mocking patterns
- Maintain consistency

### 3. Write Clear Test Cases

```typescript
describe('Feature Name', () => {
  it('should behave as expected in normal case', () => {
    // Arrange
    // Act
    // Assert
  });

  it('should handle edge case correctly', () => {
    // ...
  });

  it('should throw error for invalid input', () => {
    // ...
  });
});
```

### 4. Structure Tests

Organize by:
- **Unit tests**: Individual functions/methods
- **Integration tests**: Component interactions
- **E2E tests**: Full user workflows

### 5. Include TDD Markers

```typescript
// 🔴 RED: This test should FAIL initially
// 🟢 GREEN: Will pass after implementation
// 🔵 REFACTOR: May need adjustment during refactoring
```

## Test Framework Support

Adapt syntax for your framework:
- **Jest/Vitest**: `describe`, `it`, `expect`
- **React Testing Library**: `render`, `screen`, `userEvent`
- **Playwright**: `test`, `page`, `expect`

## Output Requirements

Your test file should:
- ✅ Be executable (valid syntax)
- ✅ Currently FAIL (no implementation exists)
- ✅ Clearly specify expected behavior
- ✅ Include setup/teardown if needed
- ✅ Have descriptive test names

## TDD Reminder

Remember: This is the **RED** phase.
- Goal: Define expected behavior through tests
- Tests should FAIL now
- Implementation comes next (GREEN phase)

Write tests first. Code second.
