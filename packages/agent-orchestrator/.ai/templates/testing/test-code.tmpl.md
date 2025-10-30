# QA Test Code – {{featureId}}

## Overview

This document provides **runnable test code skeletons** for all test cases defined in `13_qa-test-plan.md`.

**TDD Workflow**: RED (write failing test) → GREEN (minimal implementation) → REFACTOR (clean up)

---

## File Organization

```
src/__tests__/
├── unit/              # Unit tests (TC-U*)
├── integration/       # Integration tests (TC-I*)
├── performance/       # Performance benchmarks (TC-P*)
├── contract/          # API contract tests (TC-C*)
├── e2e/              # End-to-end tests (optional)
└── fixtures/         # Test data generators and mocks
```

---

## Setup & Utilities

### Test Fixtures (`__tests__/fixtures/`)

```typescript
// TODO: Add data generators, mock factories, helper utilities
```

---

## Unit Tests

### File: `__tests__/unit/{{module}}.spec.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('{{ModuleName}} - {{TestCategory}}', () => {
  // TC-U001: {{TestCaseDescription}}
  it('[RED] should {{expectedBehavior}}', () => {
    // ARRANGE: Set up test data

    // ACT: Execute the function under test

    // ASSERT: Verify expected outcome
    // FAIL-FIRST: {{whyThisShouldFail}}
    // PASS: {{whatMakesItPass}}
    expect(actual).toBe(expected);
  });
});
```

---

## Integration Tests

### File: `__tests__/integration/{{module}}.spec.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('{{ModuleName}} Integration', () => {
  // TC-I001: {{TestCaseDescription}}
  it('[RED] should {{expectedBehavior}}', () => {
    // TODO: Integration test skeleton
  });
});
```

---

## Performance Tests

### File: `__tests__/performance/{{module}}.spec.ts`

```typescript
import { describe, it, expect } from 'vitest';

describe('Performance Benchmarks', () => {
  // TC-P001: {{TestCaseDescription}}
  it('[BASELINE] should record baseline performance', () => {
    // TODO: Performance measurement skeleton
  });

  // TC-P002: {{TestCaseDescription}}
  it('[RED] should meet performance target', () => {
    // FAIL-FIRST: Baseline exceeds target
    // PASS: Optimized meets target
  });
});
```

---

## Contract Tests

### File: `__tests__/contract/api-contract.spec.ts`

```typescript
import { describe, it, expect } from 'vitest';

describe('API Contract Tests', () => {
  // TC-C001: {{TestCaseDescription}}
  it('[GREEN] should preserve {{apiName}} signature', () => {
    // Type-level contract verification
  });
});
```

---

## TDD Execution Workflow

### Phase 1: RED (Write Failing Tests)

```bash
npm test
# Expected: Failures for all [RED] tests
```

### Phase 2: GREEN (Implement Minimal Code)

```bash
npm test
# Expected: All tests passing
```

### Phase 3: REFACTOR (Clean Up)

```bash
npm test
# Expected: Tests still passing after refactoring
```

---

## Coverage Requirements

```bash
npm test -- --coverage
# Target: {{coverageTarget}}% line coverage for modified files
```

---

## Next Steps

1. Execute RED phase: Confirm test failures
2. Implement GREEN phase: Write minimal passing code
3. Execute REFACTOR phase: Clean up while maintaining green tests
4. Validate quality gates: Run checks from `15_quality-gate.md`
