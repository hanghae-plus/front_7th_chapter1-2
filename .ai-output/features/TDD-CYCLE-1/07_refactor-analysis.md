# TDD-CYCLE-1: Refactor Analysis

**Feature ID**: TDD-CYCLE-1
**Analyzed**: 2025-11-01
**Refactoring Specialist**: Refactor Agent
**Depth**: Standard (Tactical - 2-4 hours)

---

## 1. Codebase Patterns (Observed Conventions)

### 1.1 Code Structure Patterns

**Utility File Organization**:
- Pure functions exported from `/src/utils/*.ts`
- Small, focused utility files (each <120 lines)
- Helper functions defined before public exports
- No default exports, only named exports

**Hook Organization**:
- Custom hooks in `/src/hooks/*.ts`
- Return type interfaces defined above implementation
- Integration with `useSnackbar` for user feedback
- Async operations with try/catch error handling

**Naming Conventions**:
- **Utils**: Verb-based names (`getDaysInMonth`, `formatDate`, `isDateInRange`)
- **Hooks**: `use*` prefix with descriptive suffix (`useEventOperations`, `useRecurringEvent`)
- **Variables**: camelCase, descriptive names
- **Constants**: UPPER_SNAKE_CASE for magic values (observed in `notificationUtils.ts`: `const 초 = 1000`)

### 1.2 Function Design Patterns

**Pure Function Preference**:
```typescript
// Pattern: Small, single-purpose pure functions
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
```

**Helper Function Extraction**:
```typescript
// Pattern: Private helpers before public exports
function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(({ title, description, location }) =>
    containsTerm(title, term) || ...
  );
}
```

**Date Handling**:
- ISO format strings (`YYYY-MM-DD`) for date interchange
- `Date` objects for manipulation, `string` for storage
- `formatDate()` utility for Date → ISO string conversion
- Local time parsing to avoid timezone issues

### 1.3 Documentation Patterns

**JSDoc Style**:
- Korean descriptions for user-facing behavior
- English parameter/return documentation
- `@param` for each parameter with type
- `@returns` for return value description
- `@example` blocks with practical usage

**Example from existing codebase**:
```typescript
/**
 * 주어진 년도와 월의 일수를 반환합니다.
 * @param year - 년도
 * @param month - 월 (1-12, 1=January)
 */
export function getDaysInMonth(year: number, month: number): number
```

### 1.4 Error Handling Patterns

**Utility Functions**: No explicit error handling (rely on caller)
```typescript
// Pattern: Let errors propagate naturally
export function formatDate(currentDate: Date, day?: number) {
  return [
    currentDate.getFullYear(),
    fillZero(currentDate.getMonth() + 1),
    fillZero(day ?? currentDate.getDate()),
  ].join('-');
}
```

**Hook Functions**: Try/catch with user notifications
```typescript
// Pattern: Graceful degradation with snackbar feedback
try {
  const response = await fetch('/api/events');
  if (!response.ok) throw new Error('Failed to fetch events');
  // ... success path
} catch (error) {
  console.error('Error fetching events:', error);
  enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
}
```

### 1.5 Test Patterns

**Test File Naming**: `{difficulty}.{feature}.spec.ts` (e.g., `medium.recurringEventUtils.spec.ts`)

**Test Description Language**: Korean
```typescript
it('일별 반복 일정이 7일간 정확히 생성된다', () => {
  // ...
});
```

**Test Structure**: AAA (Arrange-Act-Assert)
```typescript
// Arrange
const event: Event = { /* ... */ };

// Act
const instances = generateRecurringEvents(event, '2025-01-01', '2025-01-07');

// Assert
expect(instances).toHaveLength(7);
```

---

## 2. Code Quality Assessment

### 2.1 Code Smells Detected

**File: `recurringEventUtils.ts`**

**Smell #1: Long Method** (Priority: P1)
- **Function**: `generateRecurringEvents` (lines 33-90, ~57 lines)
- **Complexity**: Cyclomatic complexity ~8 (multiple nested conditions)
- **Issue**: Combines generation loop + filtering logic + date calculation
- **Impact**: Harder to test individual concerns, cognitive load

**Smell #2: Magic Numbers** (Priority: P2)
- **Location**: Line 46 `const maxIterations = 10000;`
- **Issue**: No constant declaration or explanation
- **Impact**: Low (safety mechanism), but reduces clarity

**Smell #3: Primitive Obsession** (Priority: P2)
- **Pattern**: Date strings (`YYYY-MM-DD`) passed everywhere
- **Issue**: No type-safe wrapper for ISO date strings
- **Impact**: Runtime errors from malformed dates (e.g., `2025-13-45`)

**Smell #4: Multiple Concerns** (Priority: P1)
- **Function**: `getNextOccurrence` (lines 110-154, ~44 lines)
- **Issue**: Combines date parsing + switch logic + date formatting
- **Impact**: Harder to unit test parsing vs calculation separately

**File: `useRecurringEvent.ts`**

**Smell #5: Duplicated API Fetch Pattern** (Priority: P1)
- **Locations**:
  - `editRecurringInstance` lines 213-216 (GET master event)
  - `deleteRecurringInstance` lines 264-267 (GET master event)
- **Issue**: Same fetch-and-check pattern repeated
- **Impact**: Violates DRY, harder to maintain error handling

**Smell #6: Long Method** (Priority: P1)
- **Function**: `editRecurringInstance` (lines 181-250, ~69 lines)
- **Complexity**: Cyclomatic complexity ~6 (two modes + error paths)
- **Issue**: Mixes single/series logic, multiple API calls
- **Impact**: Difficult to follow control flow

**Smell #7: No Input Validation** (Priority: P2)
- **Functions**: All utility functions assume valid input
- **Issue**: No checks for date format, null values, invalid repeat types
- **Impact**: Silent failures or runtime errors with bad data

### 2.2 Complexity Metrics

**Cyclomatic Complexity**:
| Function | Current | Target | Status |
|----------|---------|--------|--------|
| `generateRecurringEvents` | 8 | ≤5 | High |
| `getNextOccurrence` | 5 | ≤5 | OK |
| `shouldSkipDate` | 7 | ≤5 | High |
| `isWithinRecurrenceRange` | 4 | ≤5 | OK |
| `editRecurringInstance` | 6 | ≤5 | High |
| `deleteRecurringInstance` | 5 | ≤5 | OK |

**Nesting Depth**:
| Function | Current | Target | Status |
|----------|---------|--------|--------|
| `generateRecurringEvents` | 4 levels | ≤3 | High |
| `editRecurringInstance` | 3 levels | ≤3 | OK |

**Function Length**:
| Function | Lines | Target | Status |
|----------|-------|--------|--------|
| `generateRecurringEvents` | 57 | ≤50 | Exceeded |
| `editRecurringInstance` | 69 | ≤50 | Exceeded |
| `getNextOccurrence` | 44 | ≤50 | OK |

### 2.3 Duplication Detected

**Duplication #1: Date Parsing Pattern** (3 occurrences)
```typescript
// recurringEventUtils.ts line 39
const [originalYearStr, originalMonthStr, originalDayStr] = event.date.split('-');
const originalYear = parseInt(originalYearStr, 10);
const originalMonth = parseInt(originalMonthStr, 10);
const originalDay = parseInt(originalDayStr, 10);

// recurringEventUtils.ts line 119
const [year, month, day] = baseDate.split('-').map(Number);

// recurringEventUtils.ts line 178
const [yearStr, monthStr, dayStr] = date.split('-');
const year = parseInt(yearStr, 10);
const month = parseInt(monthStr, 10);
const day = parseInt(dayStr, 10);
```
**Impact**: Inconsistent parsing styles (`.map(Number)` vs `parseInt()`), DRY violation

**Duplication #2: Fetch Master Event** (2 occurrences)
```typescript
// editRecurringInstance line 213
const masterResponse = await fetch(`/api/events/${eventId}`);
if (!masterResponse.ok) {
  throw new Error('Failed to fetch master event');
}
const masterEvent = await masterResponse.json();

// deleteRecurringInstance line 264
const response = await fetch(`/api/events/${eventId}`);
if (!response.ok) {
  throw new Error('Failed to fetch master event');
}
const masterEvent = await response.json();
```
**Impact**: DRY violation, inconsistent error messages

### 2.4 Maintainability Concerns

**Concern #1: Tight Coupling to Event Type**
- **Issue**: All functions tightly coupled to `Event` interface
- **Impact**: Changes to `Event` type require updates across all functions
- **Severity**: Medium (expected coupling, but worth noting)

**Concern #2: No Date Validation**
- **Issue**: Functions assume well-formed ISO dates
- **Example**: `'2025-99-99'` would cause silent failures
- **Impact**: Potential runtime errors in production
- **Severity**: Medium

**Concern #3: Implicit API Contract**
- **Issue**: Hook relies on backend API structure without documented contract
- **Example**: Assumes `GET /api/events/:id` returns full event object
- **Impact**: Breaking changes if backend changes
- **Severity**: Low (standard REST pattern)

### 2.5 Test Coverage Baseline

**From Verification Report**:
- Line Coverage: ~95% (estimated)
- Branch Coverage: ~92% (estimated)
- Function Coverage: 100%
- Test Count: 38 tests

**Coverage Gaps**:
- No tests for malformed input handling
- No tests for edge cases (empty strings, null values)
- No performance tests for large recurrence ranges

---

## 3. Improvement Opportunities

### 3.1 Priority P0: Critical Issues (Must Fix)

**None identified** - All code is functional and passes tests

### 3.2 Priority P1: High Value Improvements (Should Fix)

**P1-1: Extract Date Parsing Helper**
- **ROI**: High (DRY + consistency)
- **Effort**: 15 minutes
- **Benefit**: Single source of truth for date parsing, easier to validate
- **Implementation**:
  ```typescript
  function parseISODate(dateStr: string): { year: number; month: number; day: number } {
    const [year, month, day] = dateStr.split('-').map(Number);
    return { year, month, day };
  }
  ```

**P1-2: Extract Method from `generateRecurringEvents`**
- **ROI**: High (readability + testability)
- **Effort**: 30 minutes
- **Benefit**: Reduce complexity from 8 to 4, improve readability
- **Implementation**:
  - Extract `createInstance()` helper
  - Extract `shouldGenerateInstance()` predicate
  - Simplify main loop logic

**P1-3: Extract Fetch Master Event Helper**
- **ROI**: High (DRY + maintainability)
- **Effort**: 15 minutes
- **Benefit**: Reusable across edit/delete operations
- **Implementation**:
  ```typescript
  async function fetchMasterEvent(eventId: string): Promise<Event> {
    const response = await fetch(`/api/events/${eventId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch master event');
    }
    return response.json();
  }
  ```

**P1-4: Simplify `editRecurringInstance` Control Flow**
- **ROI**: High (readability + maintainability)
- **Effort**: 30 minutes
- **Benefit**: Reduce nesting, clearer separation of single/series logic
- **Implementation**:
  - Extract `editSingleInstance()` helper
  - Extract `editSeriesDefinition()` helper
  - Main function becomes router

**P1-5: Reduce Complexity in `shouldSkipDate`**
- **ROI**: Medium (readability)
- **Effort**: 20 minutes
- **Benefit**: Reduce complexity from 7 to 4
- **Implementation**:
  - Extract `shouldSkipMonthlyDate()` predicate
  - Extract `shouldSkipYearlyDate()` predicate

### 3.3 Priority P2: Nice-to-Have Optimizations (Can Fix)

**P2-1: Named Constants for Magic Numbers**
- **ROI**: Low (clarity)
- **Effort**: 5 minutes
- **Benefit**: Self-documenting code
- **Implementation**:
  ```typescript
  const MAX_RECURRENCE_ITERATIONS = 10000; // Safety limit for infinite loops
  ```

**P2-2: Type-Safe Date Strings**
- **ROI**: Medium (type safety)
- **Effort**: 45 minutes
- **Benefit**: Catch malformed dates at compile time
- **Implementation**:
  ```typescript
  type ISODate = string & { __brand: 'ISODate' };
  function createISODate(dateStr: string): ISODate {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error(`Invalid ISO date: ${dateStr}`);
    }
    return dateStr as ISODate;
  }
  ```
  **Note**: This is a larger change affecting many files - defer to later cycle

**P2-3: Add JSDoc `@throws` Tags**
- **ROI**: Low (documentation)
- **Effort**: 10 minutes
- **Benefit**: Clearer error contract for API consumers
- **Implementation**: Add `@throws` to functions that can throw errors

**P2-4: Consistent Date Parsing Style**
- **ROI**: Low (consistency)
- **Effort**: 5 minutes
- **Benefit**: Single parsing pattern across file
- **Implementation**: Use `.map(Number)` everywhere instead of mixed `parseInt()`

**P2-5: Early Return in `expandRecurringEvent`**
- **ROI**: Low (minor clarity)
- **Effort**: 2 minutes
- **Benefit**: Guard clause pattern
- **Implementation**:
  ```typescript
  const expandRecurringEvent = (event: Event, rangeStart: string, rangeEnd: string): Event[] => {
    if (event.repeat.type === 'none') return [];
    return generateRecurringEvents(event, rangeStart, rangeEnd);
  };
  ```
  (Already clear, but could be slightly more explicit)

### 3.4 ROI Analysis

**Time Saved per Change** (based on standard maintenance):
- P1-1: 2 hours/year (debugging date parsing issues)
- P1-2: 4 hours/year (understanding/modifying generation logic)
- P1-3: 1 hour/year (updating fetch patterns)
- P1-4: 3 hours/year (understanding edit flow, debugging)
- P1-5: 1 hour/year (understanding skip logic)

**Total P1 Savings**: ~11 hours/year
**Total P1 Effort**: ~2 hours
**ROI**: 5.5x return on investment

**P2 Changes**: Nice-to-have, low ROI (<2x)

---

## 4. Refactoring Plan

### 4.1 What to Change (Ordered by Safety)

**Phase 1: Extract Helpers** (30 minutes, low risk)
1. Extract `parseISODate()` helper function
2. Extract `fetchMasterEvent()` async helper
3. Extract `MAX_RECURRENCE_ITERATIONS` constant
4. Add consistent `.map(Number)` parsing style

**Phase 2: Simplify Complex Functions** (60 minutes, medium risk)
5. Refactor `generateRecurringEvents` - extract helpers:
   - `createEventInstance()`
   - `shouldGenerateInstance()`
6. Refactor `shouldSkipDate` - extract predicates:
   - `shouldSkipMonthlyDate()`
   - `shouldSkipYearlyDate()`
7. Refactor `editRecurringInstance` - extract mode handlers:
   - `editSingleInstance()`
   - `editSeriesDefinition()`

**Phase 3: Documentation** (15 minutes, no risk)
8. Add JSDoc `@throws` tags
9. Update JSDoc examples to reflect new helpers

### 4.2 Implementation Order (Safest First)

**Order Rationale**:
1. **Constants first** - Zero risk, no behavior change
2. **Extract pure helpers** - Low risk, easy to test
3. **Extract async helpers** - Medium risk, need to verify error handling
4. **Refactor complex functions** - Higher risk, need careful testing
5. **Documentation** - No risk, improves maintainability

**Rollback Points**:
- After Phase 1: Commit "refactor: extract date parsing and API helpers"
- After Phase 2: Commit "refactor: simplify complex recurring event functions"
- After Phase 3: Commit "docs: improve JSDoc annotations"

### 4.3 Risk Assessment per Change

| Change | Risk | Mitigation |
|--------|------|------------|
| Extract `parseISODate()` | Low | Pure function, easy to test |
| Extract `fetchMasterEvent()` | Low | Replace 2 identical patterns |
| Extract constant | None | Compile-time check |
| Refactor `generateRecurringEvents` | Medium | Run full test suite after each extraction |
| Refactor `shouldSkipDate` | Medium | Run edge case tests (31st, Feb 29) |
| Refactor `editRecurringInstance` | Medium | Run integration tests with MSW |
| Add JSDoc `@throws` | None | Documentation only |

**Risk Mitigation Strategy**:
- Run tests after EACH change (not batched)
- Commit after each successful refactor
- Keep original behavior identical (no feature changes)
- Use TypeScript compiler to catch breaking changes

### 4.4 Expected Outcomes

**After Phase 1**:
- ~40 lines reduced (consolidated date parsing)
- All tests still GREEN
- No duplication in date parsing
- Consistent API fetch pattern

**After Phase 2**:
- Cyclomatic complexity reduced:
  - `generateRecurringEvents`: 8 → 4
  - `shouldSkipDate`: 7 → 4
  - `editRecurringInstance`: 6 → 3
- Function lengths reduced:
  - `generateRecurringEvents`: 57 → ~35 lines
  - `editRecurringInstance`: 69 → ~25 lines
- Nesting depth reduced:
  - `generateRecurringEvents`: 4 → 2 levels

**After Phase 3**:
- Complete JSDoc coverage with `@throws` tags
- Clearer error contract for API consumers

**Overall Improvement Metrics**:
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Average Cyclomatic Complexity | 6.2 | 3.8 | 39% reduction |
| Lines of Code (total) | ~527 | ~480 | 9% reduction |
| Code Duplication | 5 instances | 0 instances | 100% reduction |
| Test Coverage | 95% | 95% | Maintained |

---

## 5. Handoff Summary

**Status**: Ready for REFACTOR implementation

**Key Improvements**:
1. Extract date parsing helper (DRY + consistency)
2. Simplify `generateRecurringEvents` (complexity 8 → 4)
3. Extract API fetch helper (DRY)

**Estimated Time**: 2 hours (105 minutes total)
**Risk Level**: Low-Medium (all changes testable, incremental commits)
**Expected Impact**: 39% complexity reduction, zero duplication, maintained test coverage

**All tests must stay GREEN** - Run test suite after each phase.
