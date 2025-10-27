# Edge Case Identification Techniques

## Systematic Approaches

### 1. Boundary Value Analysis (BVA)

**Concept**: Test boundaries and values just inside/outside limits

**Example: Age Validation**
```
If age must be 18-65:
Test values: 17, 18, 19, 64, 65, 66
          ↓    ✅   ✅   ✅   ✅   ↓
       invalid valid boundary boundary invalid
```

**Steps**:
1. Identify all boundaries (min, max, limits)
2. Test: boundary - 1, boundary, boundary + 1
3. Test empty/zero/null cases
4. Test extreme large values

### 2. Equivalence Partitioning

**Concept**: Divide input space into equivalence classes with expected same behavior

**Example: Email Validation**
```
Valid emails:
- user@domain.com
- name.surname@company.co.uk
Test one from each valid class

Invalid emails:
- not-an-email
- @.com
- user@
Test one from each invalid class
```

**Steps**:
1. Group inputs that should behave the same
2. Test one representative from each group
3. Don't test every possible value

### 3. Decision Tables

**Concept**: Test combinations of conditions

**Example: Access Control**
```
Conditions: Admin? | Logged In? | Time
Decision: Grant/Deny Access

| Admin | Logged In | Time        | Decision |
|-------|-----------|-------------|----------|
| Yes   | Yes       | Business    | Grant    |
| Yes   | Yes       | After hours | Grant    |
| No    | Yes       | Business    | Grant    |
| No    | Yes       | After hours | Deny     |
| Yes   | No        | Any         | Deny     |
| No    | No        | Any         | Deny     |

Test each row
```

### 4. State Transition Testing

**Concept**: Test state changes and transitions

**Example: User Authentication States**
```
States: logged_out → logging_in → logged_in → logging_out → logged_out

Transitions to test:
1. logged_out → logging_in (valid)
2. logging_in → logged_in (success)
3. logging_in → logged_out (failure)
4. logged_in → logging_out
5. logged_out → logged_out (already logged out, no action)
```

**Steps**:
1. Map all possible states
2. Identify valid transitions
3. Test each transition
4. Test invalid transitions (should be prevented)

### 5. Error Guessing

**Concept**: Use experience and intuition to find likely errors

**Common Error Patterns**:
- Off-by-one errors
- Null pointer dereference
- Array index out of bounds
- Division by zero
- Missing null checks
- Timezone issues
- Date edge cases (leap year, year boundaries)
- String encoding issues

**Questions to Ask**:
- What happens when it's empty?
- What happens when it's null?
- What happens when it's too large?
- What happens when it's negative?
- What happens with special characters?
- What happens with concurrent access?

## Domain-Specific Edge Cases

### Web Applications

**Browser/Platform**:
- Safari, Chrome, Firefox differences
- Mobile vs Desktop
- iOS vs Android
- Different screen sizes

**Network**:
- Slow connection
- Connection timeout
- Intermittent connectivity
- HTTP 404, 500 errors

**Time/Dates**:
- Daylight saving time transitions
- Leap year (Feb 29)
- Year boundaries (Dec 31 → Jan 1)
- Timezone conversions
- Server time vs client time

### Data Validation

**Strings**:
- Empty: ""
- Whitespace: "   "
- Very long (buffer overflow)
- Unicode: 日本語, 🎉
- SQL injection: ' OR '1'='1
- XSS: <script>alert('xss')</script>

**Numbers**:
- Zero: 0
- Negative: -1
- Very large: 9999999999
- Decimal: 3.14159
- Scientific notation: 1e10
- String representation: "123"

**Arrays/Lists**:
- Empty: []
- Single element: [1]
- Maximum size
- Null element
- Duplicate elements

## How to Discover Edge Cases

### 1. Read the Code

```javascript
function calculatePrice(quantity, unitPrice) {
  return quantity * unitPrice;
}
```

Edge cases to consider:
- quantity = 0
- quantity = negative
- unitPrice = 0
- unitPrice = negative
- Very large numbers (overflow)
- Floating point precision issues

### 2. Ask Questions

For each input:
- What's the minimum? (0, 1, empty, null)
- What's the maximum? (MAX_INT, array.length)
- What's invalid? (wrong type, format, range)
- What's unexpected? (null, undefined, special chars)
- What breaks it? (divide by zero, array access, null deref)

### 3. Use Brainstorming

```
Component: User Profile
Input: Age field

Edge cases brainstorm:
- 0 (just born?)
- 1 (one year old?)
- 17 (minor)
- 18 (legal adult)
- 120 (very old)
- 121 (realistic?)
- -1 (negative?)
- 999999 (unrealistic)
- null/undefined
- "old" (string)
- decimal (25.5)
```

## Prioritizing Edge Cases

**P0 - Must Test**:
- Security vulnerabilities
- Data corruption risks
- Crash/failure scenarios
- Core functionality boundaries

**P1 - Should Test**:
- Common invalid inputs
- Business rule violations
- User experience issues

**P2 - Nice to Test**:
- Unlikely extreme cases
- Academic interest only
- Very rare conditions

## Documentation Template

```markdown
### Edge Case: [Name]

**Category**: Input/State/Concurrency/Integration/Security

**Description**: Brief explanation

**Input**: [Specific values or conditions]

**Expected Behavior**: [What should happen]

**Rationale**: [Why this matters]

**Priority**: P0/P1/P2

**Test Type**: Unit/Integration/E2E
```

