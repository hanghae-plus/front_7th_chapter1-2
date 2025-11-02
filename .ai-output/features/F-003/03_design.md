# F-003: 반복 일정 생성/수정 폼 UI 구현 - Technical Design

**Feature ID**: F-003
**Status**: Design Phase (TDD RED)
**Created**: 2025-11-02

---

## 1. Codebase Context

### Existing Hook Patterns Observed

**Pattern Analysis from `useEventForm.ts`**:
- **State Management**: All form fields use individual `useState` hooks
- **Setter Export**: Both state values AND setters are exported in return object
- **Naming Convention**: Camel case for state (`repeatType`), setter prefix `set` (`setRepeatType`)
- **Initialization**: Supports `initialEvent` parameter for edit mode
- **Type Safety**: Strict TypeScript types from `types.ts` (`RepeatType`, `RepeatInfo`)

**Current State** (Lines 16-19):
```typescript
const [isRepeating, setIsRepeating] = useState(initialEvent?.repeat.type !== 'none');
const [repeatType, setRepeatType] = useState<RepeatType>(initialEvent?.repeat.type || 'none');
const [repeatInterval, setRepeatInterval] = useState(initialEvent?.repeat.interval || 1);
const [repeatEndDate, setRepeatEndDate] = useState(initialEvent?.repeat.endDate || '');
```

**Problem**:
- State declarations exist (lines 16-19)
- Setters exported in return object (lines 90, 92, 94)
- But in `App.tsx` lines 122-126, the setters are commented out
- This causes runtime errors at lines 569, 584, 594 where the commented setters are called

---

## 2. API Contracts

### TypeScript Signatures

**`useEventForm` Return Type Enhancement**:

```typescript
interface UseEventFormReturn {
  // ... existing fields ...

  // Repeat State (already present)
  isRepeating: boolean;
  setIsRepeating: (value: boolean) => void;

  repeatType: RepeatType;
  setRepeatType: (type: RepeatType) => void;  // ← Currently commented in App.tsx

  repeatInterval: number;
  setRepeatInterval: (interval: number) => void;  // ← Currently commented in App.tsx

  repeatEndDate: string;
  setRepeatEndDate: (date: string) => void;  // ← Currently commented in App.tsx

  // ... existing fields ...
}
```

### Function Signatures (Skeleton)

```typescript
// These already exist in useEventForm.ts but are commented out in App.tsx
const setRepeatType = (type: RepeatType): void => {
  throw new Error('NotImplementedError: setRepeatType');
};

const setRepeatInterval = (interval: number): void => {
  throw new Error('NotImplementedError: setRepeatInterval');
};

const setRepeatEndDate = (date: string): void => {
  throw new Error('NotImplementedError: setRepeatEndDate');
};
```

---

## 3. Architecture Decisions

### ADR-001: Uncomment vs Rewrite Strategy

**Decision**: Uncomment existing setters in `App.tsx` instead of rewriting

**Rationale**:
- The state management infrastructure already exists in `useEventForm.ts` (lines 17-19)
- Setters are properly exported (lines 90, 92, 94)
- The issue is purely in `App.tsx` where they're commented out (lines 122-126)
- Uncommenting is safer than rewriting - preserves existing working code

**Consequences**:
- Minimal risk of breaking existing functionality
- Faster implementation (just uncomment 3 lines)
- Maintains consistency with existing codebase patterns

**Alternatives Rejected**:
- **Full rewrite of repeat logic**: Unnecessary complexity, higher risk
- **Create new hook**: Violates single responsibility - form state should be in useEventForm

---

### ADR-002: State Initialization Strategy

**Decision**: Use existing `useState` initialization from `initialEvent?.repeat.*`

**Rationale**:
- Current pattern already handles both create and edit modes
- `initialEvent?.repeat.type || 'none'` provides safe default
- Consistent with other form fields (title, date, etc.)

**Consequences**:
- Edit mode automatically populates repeat fields
- Create mode defaults to non-repeating (`type: 'none'`)
- No additional initialization logic needed

---

### ADR-003: Integration with App.tsx

**Decision**: No changes to UI JSX (lines 562-599), only uncomment destructured setters

**Rationale**:
- UI code is already complete but commented out (lines 562-599)
- Comment explicitly says "8주차 과제" (Week 8 assignment)
- Uncommenting setters enables the existing UI to work

**Consequences**:
- UI will become functional immediately after uncommenting
- No need to modify rendering logic or event handlers
- Maintains original design intent

---

## 4. Test Architecture (Structure Only)

### What to Test

**Unit Tests** (Not in scope for RED phase - only examples):
1. `setRepeatType` updates state correctly
2. `setRepeatInterval` validates positive integers
3. `setRepeatEndDate` handles date string format

**Integration Tests** (Target: `src/__tests__/integration/recurring-form.test.tsx`):
1. Checkbox toggle shows/hides repeat fields
2. RepeatType selector changes type state
3. RepeatInterval input updates interval
4. RepeatEndDate picker sets end date
5. Form submission includes repeat data

### Test Structure Example

```typescript
// src/__tests__/integration/recurring-form.test.tsx

describe('Recurring Event Form UI', () => {
  it('should show repeat fields when checkbox is checked', () => {
    // Arrange: Render form
    // Act: Check "반복 일정" checkbox
    // Assert: Repeat fields visible
  });

  it('should update repeatType when user selects type', () => {
    // Arrange: Enable repeat checkbox
    // Act: Select "매주" from dropdown
    // Assert: repeatType state = 'weekly'
  });

  it('should update repeatInterval via input field', () => {
    // Arrange: Enable repeat checkbox
    // Act: Type "3" in interval field
    // Assert: repeatInterval state = 3
  });

  it('should update repeatEndDate via date picker', () => {
    // Arrange: Enable repeat checkbox
    // Act: Select date "2025-12-31"
    // Assert: repeatEndDate state = "2025-12-31"
  });

  it('should include repeat data in form submission', async () => {
    // Arrange: Fill form with repeat enabled
    // Act: Submit form
    // Assert: saveEvent called with repeat: { type, interval, endDate }
  });
});
```

### Test Execution Prerequisites

**CRITICAL**: Before running tests, verify Node.js version:
```bash
node -v  # Must output v22.x.x
nvm use 22  # If not v22
```

### Test Coverage Target

- **RED Phase**: 5 integration tests (example above)
- **GREEN Phase**: Tests will fail with NotImplementedError
- **REFACTOR Phase**: Add edge case tests (invalid intervals, past end dates)

---

## 5. Implementation Strategy

### Phase 1: Uncomment App.tsx Setters (2 minutes)

**File**: `src/App.tsx`

**Lines 122-126** - Current:
```typescript
    repeatType,
    // setRepeatType,
    repeatInterval,
    // setRepeatInterval,
    repeatEndDate,
    // setRepeatEndDate,
```

**Change to**:
```typescript
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
```

---

### Phase 2: Verify Setter Usage (No changes needed)

**File**: `src/App.tsx`

**Lines 569, 584, 594** - Already correct:
```typescript
// Line 569
onChange={(e) => setRepeatType(e.target.value as RepeatType)}

// Line 584
onChange={(e) => setRepeatInterval(Number(e.target.value))}

// Line 594
onChange={(e) => setRepeatEndDate(e.target.value)}
```

These calls will work once setters are uncommented in Phase 1.

---

### Phase 3: Skeleton Code in useEventForm.ts (5 minutes)

**File**: `src/hooks/useEventForm.ts`

**Goal**: Replace default React setters with NotImplementedError stubs

**Current** (lines 17-19):
```typescript
const [repeatType, setRepeatType] = useState<RepeatType>(initialEvent?.repeat.type || 'none');
const [repeatInterval, setRepeatInterval] = useState(initialEvent?.repeat.interval || 1);
const [repeatEndDate, setRepeatEndDate] = useState(initialEvent?.repeat.endDate || '');
```

**Strategy**: Keep useState for state management, override setters with stubs

**Pattern**:
```typescript
const [repeatType, _setRepeatType] = useState<RepeatType>(initialEvent?.repeat.type || 'none');
const setRepeatType = (type: RepeatType): void => {
  throw new Error('NotImplementedError: setRepeatType');
};
```

This allows:
- State to exist (no crashes on initial render)
- Tests to import and call setters
- Tests to fail properly with NotImplementedError
- Dev to implement actual logic in GREEN phase

---

### Phase 4: Update resetForm and editEvent (No changes needed)

**File**: `src/hooks/useEventForm.ts`

**Lines 50-52**: `resetForm` already resets repeat state
```typescript
setRepeatType('none');
setRepeatInterval(1);
setRepeatEndDate('');
```

**Lines 66-68**: `editEvent` already populates repeat state
```typescript
setRepeatType(event.repeat.type);
setRepeatInterval(event.repeat.interval);
setRepeatEndDate(event.repeat.endDate || '');
```

Once skeleton setters are implemented, these will throw NotImplementedError (expected in RED phase).

---

### Phase 5: Verify TypeScript Compilation

```bash
# Should compile without errors
npm run build

# Runtime will fail with NotImplementedError (expected)
```

---

## 6. Handoff Summary for QA

### What's Implemented (RED Phase)

1. **Skeleton Setters**: `setRepeatType`, `setRepeatInterval`, `setRepeatEndDate` throw NotImplementedError
2. **App.tsx Integration**: Setters uncommented, UI fully wired
3. **Type Safety**: All TypeScript types properly declared

### What to Test

1. Create 5 integration tests (see Section 4 examples)
2. Verify tests fail with NotImplementedError
3. Ensure Node.js v22 is active before running tests

### Expected Behavior

- **UI Renders**: Repeat fields visible when checkbox checked
- **Calls Fail**: All setter calls throw NotImplementedError
- **Tests Fail**: All tests should fail in RED phase

### Next Phase (GREEN)

Dev will implement actual state update logic in setters to make tests pass.

---

## 7. Files Modified

| File | Change | Lines |
|------|--------|-------|
| `src/App.tsx` | Uncomment setters | 122-126 |
| `src/hooks/useEventForm.ts` | Add NotImplementedError stubs | 17-19 |

---

## 8. Validation Checklist

- [ ] TypeScript compiles without errors
- [ ] App.tsx imports setters correctly
- [ ] useEventForm exports setters in return object
- [ ] Skeleton setters throw NotImplementedError
- [ ] Existing tests still pass (non-repeat functionality)
- [ ] New tests written (5 integration tests)
- [ ] Node.js v22 verified before test execution

---

**End of Design Document**
