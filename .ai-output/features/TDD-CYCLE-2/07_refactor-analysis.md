# Refactor Analysis: TDD-CYCLE-2 - 반복 일정 UI 기능

**Feature ID**: TDD-CYCLE-2
**Created**: 2025-11-01
**Phase**: REFACTOR (Analysis)
**Status**: ANALYSIS COMPLETE

---

## 1. Codebase Patterns (Observed Conventions)

### Architecture Pattern: Monolithic Component
**Finding**: This codebase uses a **single-file App component** pattern
- **App.tsx**: 796 lines (main application component)
- **main.tsx**: 21 lines (minimal entry point)
- **No separate components directory**: All UI is in App.tsx

### Component Structure Convention
**Pattern**: **Inline components within App.tsx**
- **Existing example**: None (this is the first inline component)
- **RecurringConfirmModal**: Lines 69-98 (29 lines) - NEW inline component
- **Design decision**: Keep components inline unless extracted to separate files

### Hook Organization Pattern
**Pattern**: **Custom hooks in dedicated /hooks directory**
- 6 custom hooks found:
  - `useCalendarView.ts`
  - `useEventForm.ts`
  - `useEventOperations.ts`
  - `useNotifications.ts`
  - `useRecurringEvent.ts`
  - `useSearch.ts`
- **All business logic extracted to hooks**
- **App.tsx focuses on UI composition**

### Import Organization Pattern
**Pattern**: **Grouped imports with blank lines**
```typescript
// 1. Third-party UI components (MUI icons)
// 2. Third-party UI components (MUI components)
// 3. Third-party utilities (notistack, react)
// 4. Custom hooks
// 5. Custom types
// 6. Custom utilities
```

### Modal Pattern
**Existing pattern**: MUI Dialog (lines 721-761 - overlap dialog)
- State: `const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false)`
- Structure: `<Dialog> → <DialogTitle> → <DialogContent> → <DialogActions>`
- **RecurringConfirmModal follows this exact pattern** ✅

### Icon Pattern
**Existing pattern**: Conditional rendering with MUI icons
- Notifications icon: `{isNotified && <Notifications fontSize="small" />}`
- **Repeat icon follows this pattern** ✅

### Component Extraction Decision
**Question**: Should RecurringConfirmModal be extracted to separate file?

**Analysis**:
- **Current state**: Inline component (29 lines)
- **Complexity**: LOW (simple dialog, no state, pure presentation)
- **Reusability**: Used once in App.tsx
- **Codebase convention**: NO components directory exists
- **ROI**: Extracting creates new file for single-use component

**Decision**: **KEEP INLINE** (follows codebase pattern of monolithic App.tsx)

---

## 2. Code Quality Assessment

### File Size Metrics
| Metric | Before TDD-CYCLE-2 | After TDD-CYCLE-2 | Change |
|--------|-------------------|-------------------|--------|
| App.tsx lines | 627 | 796 | +169 (+27%) |
| Function count | ~8 | ~14 | +6 handlers |
| Complexity | Medium | Medium-High | ↑ |

### Cyclomatic Complexity Analysis

**RecurringConfirmModal** (lines 69-98): **Complexity: 2**
- 1 conditional (type === 'edit' ternary)
- Simple, well-structured

**handleEditClick** (lines 194-200): **Complexity: 2**
- 1 conditional (event.repeat.type !== 'none')
- Clean, single responsibility

**handleDeleteClick** (lines 203-209): **Complexity: 2**
- 1 conditional (event.repeat.type !== 'none')
- Duplicate structure of handleEditClick (CODE SMELL)

**Handler methods** (lines 211-250): **Complexity: 1-2 each**
- Simple null checks
- Well-factored

**App component** (lines 100-794): **Complexity: ~30**
- Large function with multiple concerns
- View rendering logic: renderWeekView (80 lines), renderMonthView (95 lines)
- Event list rendering (70 lines)
- Form rendering (170 lines)
- **Note**: This is existing complexity, not introduced by TDD-CYCLE-2

### Code Smells Identified

#### P0: ESLint Warnings (6 issues - MUST FIX)

**1. Line 1: Extra space in import**
```typescript
import {
  Notifications, ChevronLeft, ChevronRight, Delete, Edit, Close, Repeat } from '@mui/icons-material';
```
**Issue**: Extra space after opening brace
**Fix**: `import {Notifications, ...}`

**2. Line 2: Import formatting**
```typescript
  Notifications, ChevronLeft, ChevronRight, Delete, Edit, Close, Repeat } from '@mui/icons-material';
```
**Issue**: Inconsistent multi-line import formatting
**Fix**: Align all imports vertically or keep on one line if short

**3. Line 82: Extra newline**
```typescript
  const message =
    type === 'edit' ? '해당 일정만 수정하시겠어요?' : '해당 일정만 삭제하시겠어요?';

  return (
```
**Issue**: Extra blank line
**Fix**: Remove blank line

**4-6. Lines 399, 400, 401: Extra spaces in JSX**
```typescript
<Repeat
  fontSize="small"
  data-testid={`repeat-icon-${event.id}`}
/>
```
**Issue**: Trailing spaces on lines 399, 400, 401
**Fix**: Remove trailing spaces

#### P1: Code Duplication (Medium Impact)

**Duplicate Handler Pattern** (handleEditClick vs handleDeleteClick)
```typescript
// Lines 194-200
const handleEditClick = (event: Event) => {
  if (event.repeat.type !== 'none') {
    setRecurringModalState({ isOpen: true, type: 'edit', event });
  } else {
    editEvent(event);
  }
};

// Lines 203-209 (DUPLICATE STRUCTURE)
const handleDeleteClick = (event: Event) => {
  if (event.repeat.type !== 'none') {
    setRecurringModalState({ isOpen: true, type: 'delete', event });
  } else {
    deleteEvent(event.id);
  }
};
```
**Issue**: Same conditional logic, different actions
**ROI**: Medium (reduce 13 lines to 1 function with callback)
**Recommendation**: Extract common pattern

**Duplicate Icon Rendering** (3 locations)
```typescript
// Lines 307-309 (Week view)
{event.repeat.type !== 'none' && (
  <Repeat fontSize="small" data-testid={`repeat-icon-${event.id}`} />
)}

// Lines 397-399 (Month view)
{event.repeat.type !== 'none' && (
  <Repeat fontSize="small" data-testid={`repeat-icon-${event.id}`} />
)}

// Lines 661-663 (Event list)
{event.repeat.type !== 'none' && (
  <Repeat data-testid={`repeat-icon-${event.id}`} />
)}
```
**Issue**: Same conditional render logic in 3 places
**ROI**: Low-Medium (could extract to helper function, but JSX fragments are common pattern)
**Recommendation**: DEFER (this is acceptable React pattern)

#### P2: Naming & Clarity (Low Impact)

**Ternary in JSX props** (lines 766-767)
```typescript
<RecurringConfirmModal
  isOpen={recurringModalState.isOpen}
  type={recurringModalState.type}
  onSingle={recurringModalState.type === 'edit' ? handleSingleEdit : handleSingleDelete}
  onAll={recurringModalState.type === 'edit' ? handleAllEdit : handleAllDelete}
  onClose={() => setRecurringModalState({ isOpen: false, type: 'edit', event: null })}
/>
```
**Issue**: Ternary operators reduce readability
**ROI**: Low (code works, but harder to scan)
**Recommendation**: Extract to computed variables

**Magic strings** (lines 195, 204, 221, 234, 241, 249)
```typescript
if (event.repeat.type !== 'none') { ... }
```
**Issue**: 'none' is repeated 6+ times
**ROI**: Very Low (type-safe, clear meaning)
**Recommendation**: SKIP (low value)

### Maintainability Concerns

**App.tsx size: 796 lines**
- **Concern**: Large component file (React best practice: <400 lines)
- **Impact**: Harder to navigate, test, and maintain
- **Root Cause**: Monolithic architecture (NOT introduced by TDD-CYCLE-2)
- **Recommendation**: DEFER to separate refactoring (out of scope for this cycle)

**Handler proliferation: 6 new handlers**
- **Handlers added**: handleEditClick, handleDeleteClick, handleSingleEdit, handleAllEdit, handleSingleDelete, handleAllDelete
- **Concern**: Many small functions with similar names
- **Impact**: Medium (could be confusing)
- **Recommendation**: Consolidate duplicate logic (handleEditClick + handleDeleteClick)

---

## 3. Improvement Opportunities

### Priority P0: Critical (ESLint Warnings - MUST FIX)

**Fix 1: Import formatting (lines 1-2)**
- **Change**: Fix extra space, align imports
- **Effort**: 1 minute
- **Benefit**: Clean linting, pass CI/CD
- **Risk**: ZERO

**Fix 2: Remove extra newline (line 82)**
- **Change**: Delete blank line
- **Effort**: 5 seconds
- **Benefit**: Clean linting
- **Risk**: ZERO

**Fix 3: Remove trailing spaces (lines 399-401)**
- **Change**: Delete trailing spaces
- **Effort**: 10 seconds
- **Benefit**: Clean linting
- **Risk**: ZERO

**Total P0 effort**: 2 minutes
**Total P0 benefit**: Pass linting, clean build

### Priority P1: High Value (Code Quality Improvements)

**Improvement 1: Consolidate Edit/Delete Click Handlers**

**Current** (13 lines, duplicated logic):
```typescript
const handleEditClick = (event: Event) => {
  if (event.repeat.type !== 'none') {
    setRecurringModalState({ isOpen: true, type: 'edit', event });
  } else {
    editEvent(event);
  }
};

const handleDeleteClick = (event: Event) => {
  if (event.repeat.type !== 'none') {
    setRecurringModalState({ isOpen: true, type: 'delete', event });
  } else {
    deleteEvent(event.id);
  }
};
```

**Proposed** (1 function + 2 wrapper functions):
```typescript
// Generic handler (DRY principle)
const handleRecurringAction = (
  event: Event,
  type: 'edit' | 'delete',
  directAction: () => void
) => {
  if (event.repeat.type !== 'none') {
    setRecurringModalState({ isOpen: true, type, event });
  } else {
    directAction();
  }
};

// Specific wrappers
const handleEditClick = (event: Event) =>
  handleRecurringAction(event, 'edit', () => editEvent(event));

const handleDeleteClick = (event: Event) =>
  handleRecurringAction(event, 'delete', () => deleteEvent(event.id));
```

**Benefits**:
- ✅ Eliminate 10 lines of duplication
- ✅ Single source of truth for recurring check logic
- ✅ Easier to maintain/modify
- ✅ Clearer intent (name reveals pattern)

**Risks**:
- ⚠️ Slightly more abstract (but well-named)
- ✅ All tests still pass (no behavior change)

**ROI**: **HIGH** (5 min effort, significant clarity gain)

**Improvement 2: Extract Modal Prop Ternaries**

**Current** (lines 766-767):
```typescript
onSingle={recurringModalState.type === 'edit' ? handleSingleEdit : handleSingleDelete}
onAll={recurringModalState.type === 'edit' ? handleAllEdit : handleAllDelete}
```

**Proposed**:
```typescript
const singleHandler = recurringModalState.type === 'edit' ? handleSingleEdit : handleSingleDelete;
const allHandler = recurringModalState.type === 'edit' ? handleAllEdit : handleAllDelete;

<RecurringConfirmModal
  isOpen={recurringModalState.isOpen}
  type={recurringModalState.type}
  onSingle={singleHandler}
  onAll={allHandler}
  onClose={() => setRecurringModalState({ isOpen: false, type: 'edit', event: null })}
/>
```

**Benefits**:
- ✅ Clearer JSX (easier to scan)
- ✅ Variables can be debugged/logged
- ✅ Follows "extract variable" refactoring pattern

**Risks**:
- None (purely cosmetic)

**ROI**: **MEDIUM** (2 min effort, readability improvement)

### Priority P2: Nice-to-Have (Low Priority Optimizations)

**Optimization 1: Extract Repeat Icon Component**

**Current** (3 locations with same logic):
```typescript
{event.repeat.type !== 'none' && (
  <Repeat fontSize="small" data-testid={`repeat-icon-${event.id}`} />
)}
```

**Proposed**:
```typescript
const RepeatIcon = ({ event }: { event: Event }) =>
  event.repeat.type !== 'none' ? (
    <Repeat fontSize="small" data-testid={`repeat-icon-${event.id}`} />
  ) : null;

// Usage:
<RepeatIcon event={event} />
```

**Benefits**:
- ✅ DRY: Eliminate duplication
- ✅ Single place to modify icon logic

**Risks**:
- ⚠️ Creates new inline component (adds complexity)
- ⚠️ Codebase has no existing pattern for this

**ROI**: **LOW** (5 min effort, minor benefit, breaks existing pattern)
**Recommendation**: **SKIP** (current pattern is acceptable React convention)

**Optimization 2: Consolidate Modal Close Logic**

**Current** (repeated in multiple places):
```typescript
setRecurringModalState({ isOpen: false, type: 'edit', event: null })
```

**Proposed**:
```typescript
const closeRecurringModal = () =>
  setRecurringModalState({ isOpen: false, type: 'edit', event: null });

// Usage:
onClose={closeRecurringModal}
```

**Benefits**:
- ✅ DRY: Single source of truth

**Risks**:
- None

**ROI**: **LOW** (1 min effort, minimal benefit)
**Recommendation**: **OPTIONAL** (nice-to-have)

---

## 4. Refactoring Plan

### Refactoring Order (Safest First)

**Phase 1: Linting Fixes (P0 - REQUIRED)**
1. Fix import formatting (line 1)
2. Remove extra newline (line 82)
3. Remove trailing spaces (lines 399-401)
4. **Verify**: Run ESLint, confirm 0 warnings

**Phase 2: Handler Consolidation (P1 - HIGH VALUE)**
5. Extract `handleRecurringAction` generic handler
6. Simplify `handleEditClick` and `handleDeleteClick` to use generic handler
7. **Verify**: Run tests, confirm 18/18 pass

**Phase 3: Readability Improvements (P1 - MEDIUM VALUE)**
8. Extract modal prop ternaries to variables
9. **Verify**: Visual review, tests still pass

**Phase 4: Optional Cleanup (P2 - LOW PRIORITY)**
10. (OPTIONAL) Extract `closeRecurringModal` helper
11. **Verify**: Tests pass

### Risk Assessment Per Change

| Refactoring | Risk Level | Rollback Strategy | Test Coverage |
|-------------|-----------|-------------------|---------------|
| Fix imports | ZERO | Revert file | N/A (formatting) |
| Remove newline | ZERO | Revert file | N/A (formatting) |
| Remove spaces | ZERO | Revert file | N/A (formatting) |
| Consolidate handlers | LOW | Revert function, keep old | 18 tests (edit/delete modals) |
| Extract ternaries | ZERO | Revert variables | 18 tests (modal handlers) |
| Extract close helper | ZERO | Inline function | N/A (trivial) |

**Overall Risk**: **VERY LOW** (all changes are mechanical, tests cover behavior)

### Expected Outcomes

**Code Quality Metrics**:
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| ESLint warnings | 6 | 0 | 100% reduction |
| Duplicate code lines | 13 | ~3 | 77% reduction |
| Handler complexity | Medium | Low | Clearer |
| JSX readability | Medium | High | More scannable |

**Test Coverage**:
- **Before**: 18/18 tests pass
- **After**: 18/18 tests pass (NO BEHAVIOR CHANGE)

**File Size**:
- **Before**: 796 lines
- **After**: ~790 lines (net -6 lines from deduplication)

**Maintainability**:
- ✅ Easier to modify recurring action logic (single function)
- ✅ Cleaner linting (passes CI/CD)
- ✅ More readable JSX (less cognitive load)

### When to Stop Refactoring

**Stop conditions**:
1. ✅ All ESLint warnings fixed (P0 complete)
2. ✅ Handler duplication eliminated (P1 complete)
3. ✅ All 18 tests still GREEN
4. ✅ No new complexity introduced
5. ❌ **Do NOT extract RecurringConfirmModal to separate file** (breaks codebase pattern)
6. ❌ **Do NOT refactor App.tsx architecture** (out of scope, separate epic)

**Philosophy**: "Leave the code better than you found it" (but don't over-engineer)

---

## 5. Handoff Summary

**Refactor scope**: Fix ESLint warnings (P0), eliminate handler duplication (P1), improve JSX readability (P1). All changes are safe, mechanical, and covered by 18 existing tests. Net result: -6 lines, 0 warnings, clearer code. Ready for execution.

**Files to modify**:
- src/App.tsx (only file changed)

**Tests to verify**:
- src/__tests__/integration/App.recurring-ui.spec.tsx (18 tests must stay GREEN)

**Time estimate**: 15-20 minutes total
