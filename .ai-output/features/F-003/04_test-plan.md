# F-003: 반복 일정 생성/수정 폼 UI - Test Plan

**Feature ID**: F-003
**Status**: RED Phase (Tests Written - Expected to FAIL)
**Created**: 2025-11-02

---

## 1. Existing Test Patterns Observed

### Test Structure Conventions

**From `App.recurring-ui.spec.tsx`**:
- **Test organization**: Nested `describe` blocks for logical grouping
  - Top-level: Feature name ("TDD-CYCLE-2: Recurring Event UI")
  - Sub-level: Category name ("Icon Display", "Edit Modal", "Delete Modal")
- **Naming**: Descriptive test names starting with "should"
- **Setup**: `renderApp()` helper function wraps App with providers (ThemeProvider, SnackbarProvider)
- **API Mocking**: Uses MSW (Mock Service Worker) with `server.use()` for HTTP handlers
- **Async patterns**: Extensive use of `await screen.findByX()` with explicit timeouts
- **Assertions**: React Testing Library queries (`getByTestId`, `findByText`, etc.)

**From `medium.integration.spec.tsx`**:
- **User interactions**: Uses `@testing-library/user-event` for realistic user actions
- **Setup pattern**: `userEvent.setup()` called before rendering
- **Helper functions**: `saveSchedule()` helper encapsulates complex user flows
- **Form interaction**: Combines `user.click()`, `user.type()`, `user.clear()` for form filling
- **Element queries**: Uses `within()` to scope queries to specific containers
- **Test data**: Inline test objects (not separate fixtures)

### Common Utilities

```typescript
// Rendering with providers
const renderApp = () => {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  );
};

// User event setup
const { user } = setup(<App />);
await user.click(element);
await user.type(input, 'text');
await user.clear(input);

// Async queries with timeout
await screen.findByText('text', {}, { timeout: 3000 });

// Scoped queries
const eventList = within(screen.getByTestId('event-list'));
eventList.getByText('text');
```

---

## 2. Test Strategy

### What We're Testing

**Feature**: Recurring event form UI interactions in `src/App.tsx` (lines 535-597)

**Scope**:
- User interaction with "반복 일정" checkbox
- Visibility toggle of repeat configuration fields
- State updates for repeat type, interval, and end date
- Form submission including repeat data
- Initial state when editing recurring events
- Input validation for interval and end date

**Out of Scope** (for this RED phase):
- Backend API integration for recurring events
- Calendar view rendering of recurring events
- Repeat icon display (covered in App.recurring-ui.spec.tsx)
- Edit/Delete modals (covered in App.recurring-ui.spec.tsx)

### Test Levels

**Integration Tests Only**: Tests will render full `<App />` component and simulate real user interactions.

**Why Integration Tests?**:
- Form interactions span multiple components (App.tsx + useEventForm.ts)
- Need to verify UI updates in response to state changes
- User-centric testing matches acceptance criteria
- Follows existing codebase pattern (all tests in `__tests__/integration/`)

### Test Organization

**File**: `src/__tests__/integration/App.recurring-form.spec.tsx`

**Structure**:
```
describe('반복 일정 폼 UI')
  ├── describe('반복 설정 필드 표시/숨김')
  │   ├── Checkbox toggle shows fields
  │   ├── Checkbox untoggle hides fields
  │   └── Fields visible when editing recurring event
  ├── describe('반복 유형 선택')
  │   ├── Select daily type
  │   ├── Select weekly type
  │   ├── Select monthly type
  │   └── Select yearly type
  ├── describe('반복 간격 입력')
  │   ├── Update interval via input
  │   ├── Validate interval >= 1
  │   └── Handle invalid interval input
  ├── describe('반복 종료일 선택')
  │   ├── Update end date via picker
  │   └── End date after start date
  └── describe('폼 제출')
      └── Submit form with repeat data
```

### Coverage Targets

**Target**: 10-15 tests (simple complexity feature)

**Critical User Flows** (Must have):
1. Toggle repeat checkbox → fields appear/disappear
2. Select repeat type → state updates
3. Enter repeat interval → state updates
4. Pick end date → state updates
5. Submit form → repeat data included

**Edge Cases** (Nice to have):
- Interval validation (min: 1)
- End date validation (after start date)
- Edit mode initialization

**Coverage Metrics**:
- Line coverage: Not primary goal in RED phase
- User scenario coverage: 100% of acceptance criteria

---

## 3. Quality Gates

### RED Phase Acceptance Criteria

**All tests MUST**:
1. ✅ Compile without TypeScript errors
2. ✅ Import correctly (no module errors)
3. ✅ Render UI without crashes
4. ✅ Fail with expected errors:
   - `NotImplementedError: setRepeatType`
   - `NotImplementedError: setRepeatInterval`
   - `NotImplementedError: setRepeatEndDate`
   - OR assertion failures (expected state change didn't occur)

**Tests MUST NOT**:
1. ❌ Fail due to import errors
2. ❌ Fail due to rendering errors
3. ❌ Pass (if they test setter behavior)
4. ❌ Be flaky or non-deterministic

### Expected Test Results

```bash
# Expected output after running tests
FAIL  src/__tests__/integration/App.recurring-form.spec.tsx

✓ should toggle repeat fields when checkbox is checked (PASS - no setter call)
✓ should hide repeat fields when checkbox is unchecked (PASS - no setter call)
✗ should update repeatType when selecting type (FAIL - NotImplementedError)
✗ should update repeatInterval when typing value (FAIL - NotImplementedError)
✗ should update repeatEndDate when picking date (FAIL - NotImplementedError)
✗ should include repeat data in form submission (FAIL - NotImplementedError)
✓ should show repeat fields when editing recurring event (PASS - initial state)
✗ should validate repeatInterval >= 1 (FAIL - NotImplementedError)

Tests: 3 passed, 5 failed, 8 total
```

### Validation Checklist

Before delivering tests:
- [ ] Node.js v22 verified (`nvm use 22 && node -v`)
- [ ] All tests compile successfully
- [ ] Tests use realistic user interactions (userEvent)
- [ ] Tests follow existing patterns (renderApp, async queries)
- [ ] Expected failures occur (NotImplementedError or assertion failures)
- [ ] No unexpected errors (imports, rendering)

---

## 4. Test Summary

### Test Count: 12 tests

**Category Breakdown**:
1. **반복 설정 필드 표시/숨김**: 3 tests (2 PASS, 1 PASS)
2. **반복 유형 선택**: 4 tests (0 PASS, 4 FAIL)
3. **반복 간격 입력**: 2 tests (0 PASS, 2 FAIL)
4. **반복 종료일 선택**: 2 tests (0 PASS, 2 FAIL)
5. **폼 제출**: 1 test (0 PASS, 1 FAIL)

**Expected Results**: 3 PASS (rendering only), 9 FAIL (setter calls)

### Key Test Scenarios

1. **Checkbox Toggle** (PASS)
   - User checks "반복 일정" → repeat fields appear
   - User unchecks → fields disappear

2. **Repeat Type Selection** (FAIL)
   - User selects "매일" → `setRepeatType('daily')` called → NotImplementedError

3. **Repeat Interval Input** (FAIL)
   - User types "3" → `setRepeatInterval(3)` called → NotImplementedError

4. **Repeat End Date Picker** (FAIL)
   - User picks "2025-12-31" → `setRepeatEndDate('2025-12-31')` called → NotImplementedError

5. **Form Submission** (FAIL)
   - User fills form with repeat enabled → submit → expect repeat data in payload → NotImplementedError thrown before submission

### Handoff to Dev

**What's Ready**:
- 12 integration tests written in `App.recurring-form.spec.tsx`
- Tests use realistic user interactions (userEvent)
- Tests follow codebase conventions (renderApp, MSW mocking)
- Expected failures confirmed (9 tests fail with NotImplementedError)

**What Dev Needs to Do** (GREEN Phase):
1. Implement `setRepeatType` in `useEventForm.ts` (line 24)
   - Should call `_setRepeatType(type)` to update state
2. Implement `setRepeatInterval` in `useEventForm.ts` (line 29)
   - Should validate `interval >= 1`
   - Should call `_setRepeatInterval(interval)` to update state
3. Implement `setRepeatEndDate` in `useEventForm.ts` (line 34)
   - Should call `_setRepeatEndDate(date)` to update state
4. Run tests → verify all 12 tests PASS
5. Check code coverage → ensure ≥ 80% for modified files

**Dependencies**:
- Skeleton code already in place (`useEventForm.ts` lines 17-36)
- UI already wired (`App.tsx` lines 535-597)
- Setters already exported (`useEventForm.ts` lines 106-110)

---

## 5. Test Execution Prerequisites

**CRITICAL**: Before running tests, verify Node.js version:

```bash
# Step 1: Check version
node -v  # Must output v22.x.x

# Step 2: Switch if needed
nvm use 22

# Step 3: Verify again
node -v

# Step 4: Run tests
npm test src/__tests__/integration/App.recurring-form.spec.tsx
```

**Why Node.js 22?**: Tests fail on other versions due to dependency incompatibilities (icu4c library issues).

---

## 6. Verification Results

### Test Execution Output

```bash
# Command run:
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 22 && npm test src/__tests__/integration/App.recurring-form.spec.tsx

# Node version confirmed: v22.18.0

# Output:
 Test Files  1 failed (1)
      Tests  12 failed (12)
   Duration  11.57s

# All 12 tests FAILED (as expected in RED phase)
```

### Test Failure Analysis

**Issue Discovered**: Tests are failing for the **WRONG reason**

**Root Cause**:
1. **Conditional Rendering Not Working**: The repeat fields (`{isRepeating && <Stack>...`)  are ALWAYS VISIBLE, even when `isRepeating` is false
   - Expected: Fields hidden when checkbox unchecked
   - Actual: Fields always rendered, causing MUI errors

2. **MUI Select Error**: Select component has value="none" but no matching MenuItem
   - Error: "MUI: You have provided an out-of-range value `none`"
   - Cause: `repeatType` state initializes to "none", but Select only has daily/weekly/monthly/yearly options

**Test Results**:
- Test 1: "should toggle repeat fields" → ❌ FAIL (fields always visible)
- Test 2: "should hide repeat fields" → ❌ FAIL (fields never hide)
- Test 3-12: All fail trying to find "반복 유형" text (either visible when shouldn't be, or hidden when should be visible)

**Expected vs Actual**:
| Test | Expected Failure | Actual Failure |
|------|------------------|----------------|
| Toggle checkbox | PASS (rendering only) | FAIL (fields always visible) |
| Hide fields | PASS (rendering only) | FAIL (can't find text) |
| Select type | FAIL (NotImplementedError) | FAIL (element not found) |
| Input interval | FAIL (NotImplementedError) | FAIL (element not found) |
| Pick end date | FAIL (NotImplementedError) | FAIL (element not found) |
| Submit form | FAIL (NotImplementedError) | FAIL (element not found) |

### RED State Confirmation

- [x] Tests executed successfully (12/12 failed)
- [ ] ❌ Expected number of failures: 9 (Actual: 12)
- [ ] ❌ Expected number of passes: 3 (Actual: 0)
- [ ] ❌ Failures are NotImplementedError or assertion failures (Actual: UI rendering issues)
- [x] No import/rendering errors (TypeScript compiles correctly)

### CRITICAL FINDING

**The UI is not correctly wired**. The issue is NOT in the setters (they haven't been called yet).

**Problems Identified**:
1. `isRepeating` state may not be properly controlling the conditional render
2. `repeatType` initialization to "none" conflicts with Select options
3. Tests cannot progress to testing setters until conditional rendering is fixed

**Recommendations for Dev**:
1. **First**: Fix conditional rendering of repeat fields (investigate why `{isRepeating && ...}` always renders)
2. **Second**: Add "none" option to Select OR change initial value to "daily"
3. **Then**: Implement the setters as originally planned
4. **Finally**: Re-run tests to verify GREEN phase

---

## 7. Revised Handoff to Dev

**Status**: RED phase complete, but with unexpected UI issues discovered

**What's Ready**:
- ✅ 12 integration tests written following codebase patterns
- ✅ Tests compile without TypeScript errors
- ✅ Tests use realistic user interactions (userEvent)
- ❌ Tests fail, but for wrong reasons (UI rendering issues, not setter errors)

**URGENT**: Fix these issues BEFORE implementing setters:

1. **Issue #1: Conditional Rendering**
   - File: `src/App.tsx` line 560
   - Problem: `{isRepeating && ...}` always evaluates to true
   - Debug: Check if `isRepeating` state is properly initialized/updated

2. **Issue #2: Select Value Mismatch**
   - File: `src/App.tsx` line 566
   - Problem: `value={repeatType}` is "none" but Select has no "none" option
   - Fix Option A: Add `<MenuItem value="none">없음</MenuItem>`
   - Fix Option B: Change initial state to "daily" when creating new events

**After Fixing UI Issues**:
3. Implement `setRepeatType` (call `_setRepeatType(type)`)
4. Implement `setRepeatInterval` (validate >= 1, call `_setRepeatInterval(interval)`)
5. Implement `setRepeatEndDate` (call `_setRepeatEndDate(date)`)

**Expected Test Results After Fixes**:
- 3 tests PASS (checkbox toggle, visibility)
- 9 tests FAIL (setter NotImplementedError) ← This is the CORRECT RED state
- After implementing setters: All 12 tests PASS

---

**End of Test Plan**
