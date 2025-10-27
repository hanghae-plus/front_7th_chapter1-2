# Test Scenario Patterns

## Scenario Structure

### Standard Given-When-Then Format

```gherkin
Feature: Feature Name
  As a [user role]
  I want to [goal]
  So that [benefit]

  Scenario: Scenario name
    Given [precondition 1]
    And [precondition 2]
    When [action]
    Then [expected result]
    And [additional assertion]
```

### Alternative Formats

**Simple Descriptive:**
```markdown
Scenario: User logs in successfully
- User navigates to login page
- Enters valid credentials
- Clicks login button
- Should be redirected to dashboard
- Session should be established
```

**Step-by-Step with Expected Results:**
```markdown
Scenario: User updates profile

Steps:
1. User clicks "Edit Profile" button
   Expected: Edit form opens

2. User changes bio field
   Expected: Field value updates

3. User clicks "Save"
   Expected: Success message displays

4. Page refreshes
   Expected: Updated bio is displayed
```

## Common Scenario Patterns

### Pattern 1: Happy Path

**Purpose**: Test normal, expected behavior

```gherkin
Scenario: Successful operation with valid input
  Given the system is in normal state
  When user performs the primary action with valid input
  Then the operation should succeed
  And the expected result should be produced
  And no errors should occur
```

### Pattern 2: Negative Testing

**Purpose**: Test error handling and validation

```gherkin
Scenario: Operation fails with invalid input
  Given the system is ready
  When user performs the action with invalid input
  Then the operation should be rejected
  And an appropriate error message should be displayed
  And the system state should remain unchanged
```

### Pattern 3: State Changes

**Purpose**: Test transitions between states

```gherkin
Scenario: System state transitions correctly
  Given the system is in initial state
  When user triggers state change event
  Then the system should transition to target state
  And related actions should become available
  And invalid actions should be disabled
```

### Pattern 4: Data Variations

**Purpose**: Test with different data sets

```gherkin
Scenario Outline: Process different user types
  Given a user of type "<user_type>"
  When they perform action "<action>"
  Then they should get result "<expected_result>"

Examples:
  | user_type | action      | expected_result |
  | admin     | delete      | authorized      |
  | user      | delete      | unauthorized    |
  | guest     | view        | authorized      |
```

### Pattern 5: Concurrency

**Purpose**: Test simultaneous operations

```gherkin
Scenario: Handle concurrent requests
  Given two users are logged in
  And user A starts action X
  When user B performs conflicting action Y
  Then user A's action should complete successfully
  And user B should see appropriate feedback
  And no data corruption should occur
```

### Pattern 6: Integration

**Purpose**: Test component interactions

```gherkin
Scenario: Components interact correctly
  Given component A is initialized
  And component B depends on A
  When A changes state
  Then B should receive notification
  And B should update accordingly
```

## Scenario Coverage Patterns

### Coverage by Type

```
Happy Path Scenarios: 50%
- Normal user workflows
- Expected behaviors
- Success cases

Edge Case Scenarios: 30%
- Boundary values
- Special characters
- Extreme conditions

Error Scenarios: 20%
- Invalid inputs
- Error handling
- Failure recovery
```

### Coverage by Risk Level

```
P0 (Critical): 100% coverage
- Security
- Data integrity
- Core functionality

P1 (Important): 70% coverage
- Common workflows
- User-facing features

P2 (Nice-to-have): 30% coverage
- Rare paths
- Nice-to-have features
```

## Scenario Writing Checklist

- [ ] Scenario name is descriptive and unique
- [ ] Follows Given-When-Then structure
- [ ] Each scenario tests one thing
- [ ] Preconditions are clear and achievable
- [ ] Actions are specific and testable
- [ ] Expected results are verifiable
- [ ] Scenario is independent (no dependencies on other scenarios)
- [ ] Includes both positive and negative cases
- [ ] Edge cases are covered
- [ ] Test data requirements are specified

