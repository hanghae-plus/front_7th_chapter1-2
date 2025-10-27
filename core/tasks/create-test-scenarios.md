<!-- Powered by BMAD™ Core -->

# Create Test Scenarios Task

## Purpose

To design detailed test scenarios in Given-When-Then format that translate test strategy into specific, executable test cases.

## Process

### 1. Source Analysis

Load and analyze:
- Test strategy document (`docs/test-strategy.md`)
- Source component code
- User stories or acceptance criteria
- Requirements documentation

### 2. Scenario Identification

For each component/feature, identify:

**Primary Scenarios** (Happy Path):
- Normal user workflows
- Standard data inputs
- Expected behaviors

**Secondary Scenarios** (Edge Cases):
- Boundary values (min, max, empty, null)
- Invalid inputs
- Error conditions
- State transitions

**Integration Scenarios**:
- Component interactions
- Data flow between components
- External system interactions

### 3. Write Scenarios in Given-When-Then Format

For each scenario, use:

```gherkin
Feature: Component Name
  Scenario: Brief description of what is being tested
  
    Given [initial context/preconditions]
    When [action/event occurs]
    Then [expected outcome/result]
```

**Example**:

```gherkin
Feature: User Authentication

  Scenario: User successfully logs in with valid credentials
    Given a user with username "testuser" and password "securepass"
    When the user submits login form
    Then user should be authenticated
    And redirect to dashboard
    And session token should be generated

  Scenario: Login fails with invalid credentials
    Given a user with username "testuser" and password "wrongpass"
    When the user submits login form
    Then login should fail
    And error message "Invalid credentials" should be displayed
    And user should remain on login page

  Scenario: Login fails with empty credentials
    Given no credentials provided
    When the user submits login form
    Then validation error should appear
    And form should not be submitted
```

### 4. Categorize Scenarios

For each scenario, categorize:

- **Priority**: P0 (Critical), P1 (Important), P2 (Nice-to-have)
- **Type**: Functional, Non-functional, Security, Performance
- **Level**: Unit, Integration, E2E
- **Status**: To implement, Implemented, Needs update

### 5. Design Test Data

For each scenario, specify test data:

```markdown
### Test Data

**Valid Data**:
- Username: "testuser123"
- Password: "SecurePass123!"
- Email: "test@example.com"

**Invalid Data**:
- Empty fields
- SQL injection: "'; DROP TABLE users; --"
- XSS: "<script>alert('xss')</script>"
- Long strings: 1000+ characters
- Special characters: !@#$%^&*()

**Boundary Values**:
- Min length: 3 characters
- Max length: 50 characters
- Edge: 0, 1, 2, 49, 50, 51 characters
```

### 6. Create Scenario Document

Output: `docs/test-scenarios/{component-name}.md`

**Document Structure**:

```markdown
# Test Scenarios: Component Name

## Overview
Brief description of what this component does and testing approach.

## Reference Documents
- Test Strategy: [link to test-strategy.md]
- Source Code: [path]
- Requirements: [link]

## Priority Legend
- P0: Critical - Must test
- P1: Important - Should test
- P2: Nice-to-have - Test if time allows

## Scenarios

### Feature: Feature Name
#### Scenario 1: Happy Path
Priority: P0 | Type: Functional | Level: Unit

```gherkin
Given [context]
When [action]
Then [expected result]
```

**Test Data**: [specify data]

---

#### Scenario 2: Error Case
Priority: P0 | Type: Functional | Level: Unit

```gherkin
Given [context]
When [action with invalid input]
Then [expected error]
```

**Test Data**: [specify error data]

---

[... more scenarios]

## Edge Cases

1. **Null/Undefined Input**
2. **Empty Strings**
3. **Maximum/Minimum Values**
4. **Unicode/Special Characters**
5. **Concurrent Operations**

## Integration Points

- Interacts with: Component X
- Depends on: Service Y
- Provides data to: Component Z

## Test Implementation Status

| Scenario | Status | Test File | Last Updated |
|----------|--------|-----------|--------------|
| Happy Path | ✅ Implemented | component.test.js | 2025-01-XX |
| Error Case | ⏳ Pending | - | - |
```

## Verification

- [ ] All scenarios use Given-When-Then format
- [ ] Happy paths are covered
- [ ] Edge cases are identified
- [ ] Error conditions are covered
- [ ] Test data is specified
- [ ] Scenarios are independent
- [ ] Priority is assigned to each scenario
- [ ] Scenarios are categorized by level (unit/integration/E2E)

