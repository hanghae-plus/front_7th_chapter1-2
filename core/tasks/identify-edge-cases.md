<!-- Powered by BMAD™ Core -->

# Identify Edge Cases Task

## Purpose

To systematically identify edge cases and boundary conditions for testing a component or feature.

## Edge Case Categories

### 1. Input Edge Cases

**Empty/Null Values**:
- Empty string: ""
- null
- undefined
- Empty array: []
- Empty object: {}

**Boundary Values**:
- Minimum value: 0, -1, 1
- Maximum value: MAX_INT, array.length
- Just below boundary: MAX - 1
- Just above boundary: MAX + 1

**Special Characters**:
- Unicode: 日本語, 中文, 🎉, €
- SQL injection: `'; DROP TABLE --`
- XSS: `<script>alert('xss')</script>`
- Path traversal: `../../../etc/passwd`

**Data Types**:
- String instead of number: "123" vs 123
- Array instead of object
- Function instead of expected type

### 2. State Edge Cases

**Initial State**:
- First run
- No previous data
- Cold start

**Transition States**:
- Loading/Processing state
- Error recovery state
- Retry after failure

**Final States**:
- Completion
- Timeout
- Cancellation

### 3. Concurrency Edge Cases

**Race Conditions**:
- Multiple simultaneous requests
- Concurrent updates to same resource
- Order of operations matters

**Timing Issues**:
- Request before initialization complete
- Request during cleanup
- Timeout scenarios

### 4. Integration Edge Cases

**External Dependencies**:
- API is down
- API returns unexpected data
- Network timeout
- Rate limiting

**Data Consistency**:
- Database constraint violations
- Transaction rollbacks
- Partial updates

### 5. Business Logic Edge Cases

**Boundary Conditions**:
- Age limits (0, 17, 18, 120, 121)
- Date ranges (leap year, timezone)
- Quantity limits (0, 1, max, max+1)

**Validation Rules**:
- Required fields missing
- Invalid formats
- Constraint violations

## Identification Process

### Step 1: Analyze Component

Analyze the component to identify:
- All inputs (parameters, props, user input)
- All outputs (return values, side effects)
- Dependencies (external services, databases)
- State changes (lifecycle, state machine)

### Step 2: Apply Techniques

For each input/output, apply:

**Boundary Value Analysis (BVA)**:
- Identify boundaries
- Test: boundary - 1, boundary, boundary + 1
- Example: age 17 (under 18) → 18 → 19

**Equivalence Partitioning**:
- Divide into groups with expected same behavior
- Test one value from each group
- Example: negative, zero, positive numbers

**Error Guessing**:
- Based on experience, guess likely errors
- Common mistakes, typical bugs
- Example: off-by-one errors, null dereference

### Step 3: Document Edge Cases

For each edge case, document:

```markdown
### Edge Case: [Name]

**Category**: Input/State/Concurrency/Integration/Business Logic

**Description**: Brief description of the edge case

**Input Conditions**:
- Input 1: [specific value]
- Input 2: [specific value]

**Expected Behavior**:
- Should handle gracefully
- Error message expected
- Validation should reject

**Priority**: P0 (Critical) / P1 (Important) / P2 (Nice-to-have)

**Test Approach**: Unit / Integration / E2E
```

## Example: User Authentication Edge Cases

```markdown
## Edge Cases: User Authentication

### EC-1: Empty Credentials
**Category**: Input Edge Case
**Description**: User submits login form with empty fields
**Expected**: Validation error, form not submitted
**Priority**: P0

### EC-2: SQL Injection in Password
**Category**: Input Edge Case (Security)
**Description**: Password contains SQL injection attempts
**Expected**: Sanitized, error logged, login fails
**Priority**: P0

### EC-3: Consecutive Failed Attempts
**Category**: State Edge Case
**Description**: User attempts login 6 times in row
**Expected**: Account locked after 5 attempts
**Priority**: P1

### EC-4: Token Expired During Use
**Category**: Timing Edge Case
**Description**: User performs action with expired session
**Expected**: Redirected to login, action cancelled
**Priority**: P1

### EC-5: Login When Already Logged In
**Category**: State Edge Case
**Description**: User tries to login while session active
**Expected**: Current session terminated, new session created
**Priority**: P2
```

## Verification

- [ ] All input boundaries identified
- [ ] Empty/null cases covered
- [ ] Invalid data types covered
- [ ] State transitions covered
- [ ] Concurrency issues considered
- [ ] Integration failure cases identified
- [ ] Priority assigned to each edge case

## Output

Create document: `docs/test-scenarios/{component}-edge-cases.md`

