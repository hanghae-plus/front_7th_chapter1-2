<!-- Powered by BMAD™ Core -->

# Design Test Data Task

## Purpose

To create comprehensive test data sets that cover valid, invalid, and edge case scenarios for testing components.

## Test Data Categories

### 1. Valid Test Data

**Purpose**: Test happy path and normal operations

**Characteristics**:
- Realistic values
- Within normal ranges
- Properly formatted
- Representative of production data

**Examples**:
- Username: "john.doe123"
- Email: "john@example.com"
- Age: 25
- Price: 19.99
- Date: "2025-01-15"

### 2. Invalid Test Data

**Purpose**: Test error handling and validation

**Characteristics**:
- Out of bounds
- Wrong format
- Missing required fields
- Type mismatches

**Examples**:
- Username: "" (empty)
- Email: "not.an.email"
- Age: -5 (negative)
- Price: "not a number"
- Date: "2025-13-45" (invalid)

### 3. Edge Case Test Data

**Purpose**: Test boundaries and limits

**Characteristics**:
- Minimum values
- Maximum values
- Just outside boundaries
- Special characters

**Examples**:
- String length: 1, 0, MAX_LENGTH, MAX_LENGTH+1
- Age: 0, 17, 18, 120, 121
- Price: 0, 0.01, 999999.99, -0.01
- Unicode: "日本語🚀"
- SQL injection attempts

### 4. State-Based Test Data

**Purpose**: Test different system states

**Types**:
- Initial state: First run, no data
- Partial state: Some data loaded
- Error state: Previous operation failed
- Final state: All operations complete

### 5. Combination Test Data

**Purpose**: Test multiple conditions together

**Approach**:
- Pairwise testing (small number of combinations)
- Matrix of common combinations
- Specific known problematic combinations

## Test Data Design Process

### Step 1: Identify Data Requirements

For each input/output, identify:
- Type (string, number, object, etc.)
- Format (email, date, regex pattern)
- Constraints (min/max, required, optional)
- Relationships (FK, dependencies)

### Step 2: Generate Test Data Sets

**Technique 1: Boundary Value Testing**
```
Range: 0 - 100
Test values: -1, 0, 1, 50, 99, 100, 101
```

**Technique 2: Equivalence Classes**
```
Age groups: < 13 (child), 13-17 (teen), 18+ (adult)
Test from each class: 8, 15, 25
```

**Technique 3: Special Values**
```
Null, undefined, empty, whitespace, extreme large values
```

### Step 3: Organize Test Data

Create data sets with structure:

```javascript
// Valid Data Set
const validUsers = [
  {
    username: "alice123",
    email: "alice@example.com",
    age: 28,
    profile: {
      name: "Alice Smith",
      bio: "Software developer"
    }
  },
  {
    username: "bob.doe",
    email: "bob@example.com", 
    age: 35,
    profile: {
      name: "Bob Doe",
      bio: "Designer"
    }
  }
];

// Invalid Data Set
const invalidUsers = [
  { username: "", email: "not-email", age: -5 },  // All invalid
  { username: "valid", email: "invalid", age: 120 }, // Mixed
  { username: "<script>", email: "test", age: 30 }  // Security risk
];

// Edge Case Data Set
const edgeCaseUsers = [
  { username: "a", email: "a@b.co", age: 0 },  // Minimum
  { username: "x".repeat(100), email: "test", age: 120 },  // Maximum
  { username: "日本語", email: "test@test.co.jp", age: 18 },  // Unicode
  null,  // Null
  {},  // Empty object
];
```

## Test Data Templates

### Email Validation Test Data

```markdown
## Email Test Data

### Valid Emails
- "user@example.com"
- "user.name@example.com"
- "user+tag@example.co.uk"
- "firstname.lastname@company.com"

### Invalid Emails
- ""
- "not-an-email"
- "@example.com"
- "user@.com"
- "user@example"
- "user name@example.com" (space)
- "user@ex@ample.com" (multiple @)

### Edge Cases
- "a@b.co" (minimum valid)
- "x"*100 + "@example.com" (very long)
- "日本語@example.com" (unicode)
```

### Password Test Data

```markdown
## Password Test Data

### Valid Passwords
- "SecurePass123!"
- "MyStr0ng#Password"
- "Complex$2024"

### Invalid Passwords
- ""  (empty)
- "short"  (too short)
- "nouppercase123!"  (no uppercase)
- "NOLOWERCASE123!"  (no lowercase)
- "NoNumber!"  (no digit)
- "NoSpecialChar123"  (no special char)

### Edge Cases
- "a" * 1  (minimum)
- "a" * 255  (maximum)
- "<script>alert('xss')</script>"  (XSS attempt)
- "' OR '1'='1"  (SQL injection attempt)
```

## Document Test Data

Create file: `docs/test-data/{component}.md`

```markdown
# Test Data: Component Name

## Overview
Description of what this test data is for.

## Data Sets

### 1. Valid Data
[Table or array of valid data]

### 2. Invalid Data  
[Table or array of invalid data]

### 3. Edge Cases
[Table or array of edge case data]

## Usage

### In Unit Tests
```javascript
describe('Component', () => {
  test.each(validUsers)('should accept valid user: %s', (user) => {
    // test implementation
  });
  
  test.each(invalidUsers)('should reject invalid user: %s', (user) => {
    // test implementation
  });
});
```

### In E2E Tests
```javascript
it('should login with valid credentials', async () => {
  await loginWith(validCredentials);
  expect(await isLoggedIn()).toBe(true);
});
```

## Maintenance

**Last Updated**: 2025-01-XX
**Last Reviewed**: 2025-01-XX
**Owner**: [Team]
```

## Verification

- [ ] Valid data covers normal use cases
- [ ] Invalid data covers all validation rules
- [ ] Edge cases include boundaries and extremes
- [ ] Security test data (XSS, SQL injection) included
- [ ] Unicode and special characters included
- [ ] Test data is realistic and representative
- [ ] Data sets are organized and documented

