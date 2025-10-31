# TDD-CYCLE-1: Recurring Event Functionality - Technical Design

**Feature ID**: TDD-CYCLE-1
**Created**: 2025-11-01
**Depth**: Standard
**Architect**: Technical Architect Agent

---

## 1. Codebase Context

### 1.1 Current Architecture Patterns

**File Organization**:
- **Utilities**: `/src/utils/` - Pure functions for data manipulation (dateUtils, eventUtils, timeValidation, notificationUtils)
- **Hooks**: `/src/hooks/` - React hooks for state management and operations (useEventOperations, useCalendarView, useSearch)
- **Types**: `/src/types.ts` - Centralized type definitions
- **Tests**: `/src/__tests__/` with subdirectories:
  - `unit/` - Pure function tests with naming: `{difficulty}.{module}.spec.ts`
  - `hooks/` - React hook tests with naming: `{difficulty}.{hookName}.spec.ts`

**Event Operation Patterns** (from `hooks/useEventOperations.ts`):
- Async operations with try/catch error handling
- `enqueueSnackbar` for user feedback (success/error/info variants)
- REST API calls: `/api/events` (GET, POST, PUT, DELETE)
- Pattern: Fetch after mutations to refresh state

**Date Utility Patterns** (from `utils/dateUtils.ts`):
- Date formatting: `formatDate(date, day?)` returns `YYYY-MM-DD`
- Zero padding: `fillZero(value, size)` for consistent formatting
- Range checking: `isDateInRange(date, start, end)` with time normalization via `stripTime()`
- Month utilities: `getDaysInMonth(year, month)` for edge case handling

**Testing Conventions**:
- Korean descriptive test names: `"1월은 31일 수를 반환한다"`
- Vitest framework with `@testing-library/react` for hooks
- MSW (Mock Service Worker) for API mocking in `__mocks__/handlers.ts`
- `act()` wrapper for async operations in hook tests
- Edge case coverage: leap years, month boundaries, invalid dates

### 1.2 Existing Type System

**Already Defined** (from `src/types.ts`):
```typescript
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;
  interval: number;      // e.g., 1 for every occurrence
  endDate?: string;      // ISO format 'YYYY-MM-DD'
}

export interface Event extends EventForm {
  id: string;
  seriesId?: string;           // Links instances to parent series
  isSeriesDefinition?: boolean; // True for master, false for instances
  excludedDates?: string[];     // ISO dates skipped in series
  originalDate?: string;        // For standalone instances edited from series
}
```

**Key Observations**:
- Type system is complete for recurring events
- `RepeatInfo` structure matches Google Calendar pattern
- `Event` interface supports both master definitions and instances
- `seriesId` enables linking without changing API contracts

### 1.3 Integration Points

**Event CRUD Hook** (`useEventOperations.ts`):
- `saveEvent(eventData: Event | EventForm)`: Creates/updates events
- `deleteEvent(id: string)`: Deletes single event
- `fetchEvents()`: Returns `Event[]` from backend
- **Extension needed**: Differentiate series operations from instance operations

**Event Filtering** (`utils/eventUtils.ts`):
- `filterEventsByDateRange(events, start, end)`: Uses `isDateInRange` for filtering
- Currently assumes each event is a single date occurrence
- **Extension needed**: Expand recurring events before filtering

**Date Utilities** (`utils/dateUtils.ts`):
- `formatDate(currentDate, day?)`: Consistent date string generation
- `getDaysInMonth(year, month)`: Critical for monthly edge cases
- `isDateInRange(date, start, end)`: For instance filtering
- **Reusable**: No changes needed, provides foundation for recurrence logic

---

## 2. System Design

### 2.1 Architecture Pattern

**Pattern**: **Lazy Expansion with Master-Instance Model**

**Rationale**:
- **Performance**: Expanding all recurring events upfront for a year = 365 × 20 series = 7,300 instances in memory
- **Solution**: Expand instances only for visible date range (max 31 days for month view)
- **Storage**: Master definitions persisted in backend, instances generated on-demand in frontend
- **Flexibility**: Supports infinite series (no `endDate`) without infinite loops

**Component Architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Calendar Views (Month/Week)               │
│  - Consumes expanded Event[] with instances                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              useRecurringEvent Hook                          │
│  - expandRecurringEvent(event, rangeStart, rangeEnd)         │
│  - editRecurringInstance(id, mode: 'single'|'series')        │
│  - deleteRecurringInstance(id, mode: 'single'|'series')      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│          recurringEventUtils.ts (Pure Functions)             │
│  - generateRecurringEvents(event, rangeStart, rangeEnd)      │
│  - getNextOccurrence(date, repeatType, interval)             │
│  - shouldSkipDate(date, repeatType)                          │
│  - isWithinRecurrenceRange(date, event)                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              utils/dateUtils.ts (Existing)                   │
│  - formatDate(), getDaysInMonth(), isDateInRange()           │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

**Creating Recurring Event**:
1. User submits form with `repeat.type !== 'none'`
2. `useEventOperations.saveEvent()` sends master definition to POST `/api/events`
   - Backend stores: `{ id, title, date, repeat, isSeriesDefinition: true, seriesId: id }`
3. Frontend receives master, adds to `events` state
4. Calendar view calls `expandRecurringEvent(masterEvent, viewStart, viewEnd)`
5. Instances rendered with recurring icon

**Editing Single Instance**:
1. User clicks edit on instance with date `2025-03-15`
2. Modal shows: "해당 일정만 수정하시겠어요?" → User clicks "예"
3. `editRecurringInstance(eventId, 'single', updates)`:
   - Creates new standalone event: `{ id: newId, ...updates, repeat: { type: 'none' }, originalDate: '2025-03-15' }`
   - POST `/api/events` with standalone event
   - Master series `excludedDates` updated: `['2025-03-15']`
   - PUT `/api/events/:seriesId` with updated `excludedDates`
4. Calendar re-renders: Original instance hidden, new standalone visible

**Editing Entire Series**:
1. User clicks edit on any instance → Modal: "해당 일정만 수정하시겠어요?" → User clicks "아니오"
2. `editRecurringInstance(eventId, 'series', updates)`:
   - Updates master definition: `{ id: seriesId, ...updates }`
   - PUT `/api/events/:seriesId`
3. All instances re-generated with new properties

**Deleting Single Instance**:
1. User clicks delete on instance with date `2025-04-10` → Modal: "해당 일정만 삭제하시겠어요?" → User clicks "예"
2. `deleteRecurringInstance(eventId, 'single', date)`:
   - Adds `'2025-04-10'` to master's `excludedDates` array
   - PUT `/api/events/:seriesId` with updated `excludedDates`
3. Instance filtered out during expansion

**Deleting Entire Series**:
1. User clicks delete on any instance → Modal: "해당 일정만 삭제하시겠어요?" → User clicks "아니오"
2. `deleteRecurringInstance(eventId, 'series')`:
   - DELETE `/api/events/:seriesId`
3. All instances removed from calendar

---

## 3. API Contracts (TypeScript Signatures)

### 3.1 New File: `src/utils/recurringEventUtils.ts`

**Purpose**: Pure functions for recurring event instance generation and validation

```typescript
import { Event, RepeatType } from '../types';

/**
 * Generates recurring event instances within a date range.
 *
 * @param event - Master event with repeat configuration
 * @param rangeStart - Start date for instance generation (ISO format)
 * @param rangeEnd - End date for instance generation (ISO format)
 * @returns Array of event instances (does not include master definition)
 *
 * @example
 * const master = {
 *   id: '1',
 *   title: 'Weekly Meeting',
 *   date: '2025-01-06',
 *   repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
 *   isSeriesDefinition: true,
 *   seriesId: '1',
 *   excludedDates: ['2025-03-10']
 * };
 * const instances = generateRecurringEvents(master, '2025-01-01', '2025-01-31');
 * // Returns instances for Jan 6, 13, 20, 27 (excludes Mar 10)
 */
export function generateRecurringEvents(
  event: Event,
  rangeStart: string,
  rangeEnd: string
): Event[];

/**
 * Calculates the next occurrence date for a recurring pattern.
 *
 * @param currentDate - Current date in ISO format
 * @param repeatType - Type of recurrence (daily, weekly, monthly, yearly)
 * @param interval - Number of periods to advance (default: 1)
 * @returns Next occurrence date in ISO format
 *
 * @throws Error if repeatType is 'none'
 *
 * @example
 * getNextOccurrence('2025-01-15', 'weekly', 1); // '2025-01-22'
 * getNextOccurrence('2025-01-31', 'monthly', 1); // '2025-02-28' (no Feb 31)
 */
export function getNextOccurrence(
  currentDate: string,
  repeatType: RepeatType,
  interval?: number
): string;

/**
 * Determines if a date should be skipped for a given repeat type.
 * Handles edge cases like monthly 31st and yearly Feb 29.
 *
 * @param date - Date to check in ISO format
 * @param repeatType - Type of recurrence
 * @param originalDay - Original day of month for monthly recurrence (optional)
 * @returns True if date should be skipped, false otherwise
 *
 * @example
 * shouldSkipDate('2025-02-31', 'monthly'); // true (Feb has no 31st)
 * shouldSkipDate('2025-02-29', 'yearly'); // true (2025 is not a leap year)
 * shouldSkipDate('2025-03-31', 'monthly'); // false (Mar has 31 days)
 */
export function shouldSkipDate(
  date: string,
  repeatType: RepeatType,
  originalDay?: number
): boolean;

/**
 * Checks if a date is within the recurrence range of an event.
 * Considers event start date, end date, and excluded dates.
 *
 * @param date - Date to check in ISO format
 * @param event - Master event with repeat configuration
 * @returns True if date is within valid recurrence range
 *
 * @example
 * const event = {
 *   date: '2025-01-01',
 *   repeat: { type: 'daily', interval: 1, endDate: '2025-01-31' },
 *   excludedDates: ['2025-01-15']
 * };
 * isWithinRecurrenceRange('2025-01-10', event); // true
 * isWithinRecurrenceRange('2025-01-15', event); // false (excluded)
 * isWithinRecurrenceRange('2025-02-01', event); // false (after endDate)
 */
export function isWithinRecurrenceRange(
  date: string,
  event: Event
): boolean;

/**
 * Checks if a year is a leap year.
 * Used for yearly Feb 29 edge case handling.
 *
 * @param year - Year to check
 * @returns True if leap year, false otherwise
 *
 * @example
 * isLeapYear(2024); // true
 * isLeapYear(2025); // false
 */
export function isLeapYear(year: number): boolean;
```

### 3.2 New File: `src/hooks/useRecurringEvent.ts`

**Purpose**: React hook for managing recurring event operations with UI integration

```typescript
import { Event } from '../types';

export interface RecurringEventOperations {
  /**
   * Expands a single recurring event into instances within a date range.
   * Returns empty array if event is not recurring (repeat.type === 'none').
   *
   * @param event - Master event to expand
   * @param rangeStart - Start date for expansion (ISO format)
   * @param rangeEnd - End date for expansion (ISO format)
   * @returns Array of event instances
   */
  expandRecurringEvent(
    event: Event,
    rangeStart: string,
    rangeEnd: string
  ): Event[];

  /**
   * Expands all recurring events in a list within a date range.
   * Non-recurring events are returned as-is.
   *
   * @param events - Mixed array of master events and one-time events
   * @param rangeStart - Start date for expansion (ISO format)
   * @param rangeEnd - End date for expansion (ISO format)
   * @returns Flattened array with instances replacing masters
   */
  expandAllRecurringEvents(
    events: Event[],
    rangeStart: string,
    rangeEnd: string
  ): Event[];

  /**
   * Edits a recurring event instance (single or series).
   * Shows modal prompt: "해당 일정만 수정하시겠어요?"
   *
   * @param eventId - ID of the clicked instance (for series, use seriesId)
   * @param mode - 'single' creates standalone event, 'series' updates master
   * @param updates - Partial event data to apply
   * @param instanceDate - Required for 'single' mode (ISO format)
   *
   * @example
   * // Edit single instance
   * editRecurringInstance('evt-1', 'single', { title: 'Rescheduled' }, '2025-03-15');
   * // Result: New standalone event created, '2025-03-15' added to excludedDates
   *
   * // Edit series
   * editRecurringInstance('evt-1', 'series', { title: 'New Title' });
   * // Result: Master definition updated, all instances reflect change
   */
  editRecurringInstance(
    eventId: string,
    mode: 'single' | 'series',
    updates: Partial<Event>,
    instanceDate?: string
  ): Promise<void>;

  /**
   * Deletes a recurring event instance (single or series).
   * Shows modal prompt: "해당 일정만 삭제하시겠어요?"
   *
   * @param eventId - ID of the clicked instance (for series, use seriesId)
   * @param mode - 'single' adds to excludedDates, 'series' deletes master
   * @param instanceDate - Required for 'single' mode (ISO format)
   *
   * @example
   * // Delete single instance
   * deleteRecurringInstance('evt-1', 'single', '2025-04-10');
   * // Result: '2025-04-10' added to excludedDates, instance hidden
   *
   * // Delete series
   * deleteRecurringInstance('evt-1', 'series');
   * // Result: Master definition deleted, all instances removed
   */
  deleteRecurringInstance(
    eventId: string,
    mode: 'single' | 'series',
    instanceDate?: string
  ): Promise<void>;
}

/**
 * Hook for managing recurring event operations.
 * Integrates with useEventOperations for API calls.
 *
 * @returns Object with recurring event operation functions
 *
 * @example
 * const { expandAllRecurringEvents, editRecurringInstance } = useRecurringEvent();
 *
 * // In calendar view component
 * const expandedEvents = expandAllRecurringEvents(events, '2025-01-01', '2025-01-31');
 *
 * // In event edit modal
 * await editRecurringInstance(event.seriesId, 'single', updates, event.date);
 */
export function useRecurringEvent(): RecurringEventOperations;
```

### 3.3 Type Updates: `src/types.ts`

**No new types needed** - Existing `RepeatInfo`, `RepeatType`, and `Event` interfaces are sufficient.

**Clarifications**:
- `Event.isSeriesDefinition`: `true` for masters stored in backend, `false` for generated instances (frontend-only)
- `Event.seriesId`: Same as `id` for master events, parent `id` for instances
- `Event.excludedDates`: Array of ISO date strings to skip during instance generation
- `Event.originalDate`: Set when editing single instance (reference to original series date)

---

## 4. Architecture Decisions (ADRs)

### ADR-001: Lazy Expansion Strategy

**Status**: Accepted
**Date**: 2025-11-01

**Context**:
Recurring events could expand all instances upfront (eager) or on-demand for visible date ranges (lazy). Eager expansion for a year of daily events = 365 instances per series. With 20 series = 7,300 events in memory, causing performance issues.

**Decision**:
Implement lazy expansion - generate instances only for visible calendar view range (max 31 days for month view).

**Rationale**:
- **Performance**: Month view with 20 series × 31 days = max 620 instances (vs 7,300 for eager)
- **Infinite series support**: No `endDate` series can generate instances without infinite loops
- **Memory efficiency**: Only renders what user sees, garbage collected when view changes
- **Alignment with patterns**: Existing `filterEventsByDateRange` already operates on visible ranges

**Consequences**:
- ✅ <100ms render target achievable with lazy expansion
- ✅ Supports infinite recurring events (team standup with no end date)
- ❌ Requires expansion on every view change (mitigated by memoization)
- ❌ Backend must support `endDate?: string` (optional field)

**Alternatives Considered**:
- **Eager expansion**: Simple but poor performance and memory usage
- **Backend expansion**: Requires API changes, couples frontend to backend logic

---

### ADR-002: Master-Instance Storage Model

**Status**: Accepted
**Date**: 2025-11-01

**Context**:
Two storage models possible:
1. **Master + Instances**: Store master definition in backend, generate instances in frontend
2. **Fully Expanded**: Store all instances as individual events in backend

**Decision**:
Use Master + Instances model with `isSeriesDefinition` flag to distinguish.

**Rationale**:
- **Storage efficiency**: 1 master vs. 52 weekly instances for a year
- **Bulk operations**: Edit series updates 1 row instead of 52
- **Consistency**: Single source of truth for series properties (title, time, category)
- **Type system alignment**: `Event.isSeriesDefinition` and `seriesId` already defined in types.ts

**Consequences**:
- ✅ Minimal backend storage requirements
- ✅ Series edits affect all instances without database looping
- ✅ Clear separation: Masters persist, instances are ephemeral
- ❌ Complex query logic: Backend must handle `excludedDates` filtering
- ❌ Frontend must expand instances before rendering (addressed by lazy expansion)

**Alternatives Considered**:
- **Fully expanded model**: Simpler queries but massive storage overhead (52× for weekly events)
- **Hybrid model**: Store both master and instances - redundant and prone to data inconsistency

---

### ADR-003: Edge Case Handling Approach

**Status**: Accepted
**Date**: 2025-11-01

**Context**:
Edge cases require special logic:
- Monthly events on 31st (Feb, Apr, Jun, Sep, Nov have <31 days)
- Yearly events on Feb 29 (only valid in leap years)

Two approaches:
1. **Skip invalid dates silently**: Advance to next valid occurrence
2. **Adjust dates**: Move Feb 31 → Feb 28/29 (last day of month)

**Decision**:
Skip invalid dates silently - monthly 31st skips short months, yearly Feb 29 skips non-leap years.

**Rationale**:
- **User expectation**: Google Calendar behavior - "31st monthly" means "31st when possible"
- **Data accuracy**: No "adjusted" dates that differ from user intent
- **Simplicity**: No ambiguity about what "last day of month" means (28, 29, 30, or 31?)
- **Clear logic**: `shouldSkipDate()` utility returns boolean, easy to test

**Consequences**:
- ✅ Predictable behavior matching industry standards
- ✅ No "mystery dates" where event appears on unexpected day
- ✅ Simple validation: Check if day exists in month, skip if not
- ❌ User may be confused why monthly 31st doesn't appear in February
- ❌ Requires UI warning: "This event will skip months with fewer than 31 days"

**Alternatives Considered**:
- **Adjust to last day of month**: Confusing when Feb 31 becomes Feb 28, user didn't choose 28th
- **Fail creation**: Prevent monthly 31st events entirely - too restrictive

---

### ADR-004: Modal Confirmation Pattern for Instance Operations

**Status**: Accepted
**Date**: 2025-11-01

**Context**:
Editing or deleting a recurring event instance requires choosing:
- **Single instance**: Affects only clicked occurrence
- **Entire series**: Affects all occurrences

Two UI patterns:
1. **Inline choice**: Radio buttons in edit/delete dialog
2. **Modal prompt**: Separate modal asking "해당 일정만 수정/삭제하시겠어요?" before showing form

**Decision**:
Use modal prompt pattern with Korean text:
- Edit: "해당 일정만 수정하시겠어요?" ("예" = single, "아니오" = series)
- Delete: "해당 일정만 삭제하시겠어요?" ("예" = single, "아니오" = series)

**Rationale**:
- **User clarity**: Forces explicit choice before showing form, prevents accidental series edits
- **Industry pattern**: Google Calendar, Outlook, Apple Calendar all use modal prompts
- **Reduced errors**: 2-step process (choose scope → edit/delete) vs 1-step with radio button users might miss
- **Korean UX**: Requirements specify exact modal text, indicating design decision already made

**Consequences**:
- ✅ Clear user intent capture (prevents "I didn't mean to edit all events" support tickets)
- ✅ Familiar pattern for users of other calendar apps
- ❌ Extra click required (mitigated by fast modal response)
- ❌ Modal implementation needed in both edit and delete flows

**Alternatives Considered**:
- **Inline radio buttons**: Faster but easy to overlook, high error risk
- **Smart defaults**: Auto-detect intent - too ambiguous, unpredictable

---

## 5. Test Architecture

### 5.1 Test Categories and Structure

**Unit Tests** (`src/__tests__/unit/medium.recurringEventUtils.spec.ts`):
- **Purpose**: Test pure functions in isolation with edge cases
- **Difficulty**: Medium (recurring logic complexity)
- **Coverage**: All utility functions in `recurringEventUtils.ts`

**Hook Tests** (`src/__tests__/hooks/medium.useRecurringEvent.spec.ts`):
- **Purpose**: Test React hook behavior with mocked API calls
- **Difficulty**: Medium (async operations + state management)
- **Coverage**: All functions in `useRecurringEvent` hook

**Integration Tests** (optional enhancement to existing `medium.integration.spec.tsx`):
- **Purpose**: End-to-end user flows with recurring events
- **Difficulty**: Hard (full UI + API + state)
- **Coverage**: Create series → view instances → edit single/series → delete single/series

### 5.2 Test Organization by Category

#### Category 1: Event Generation Logic

**What to Test**:
- Daily recurrence: Consecutive days generated correctly
- Weekly recurrence: Same day-of-week across weeks
- Monthly recurrence: Same day-of-month across months
- Yearly recurrence: Same month-day across years
- Interval support: `interval: 2` generates every 2nd occurrence

**File**: `src/__tests__/unit/medium.recurringEventUtils.spec.ts`

**Example Test Cases** (3-5 per pattern):

```typescript
describe('generateRecurringEvents - Daily', () => {
  it('일별 반복 일정이 7일간 정확히 생성된다', () => {
    const event = {
      id: '1',
      date: '2025-01-01',
      repeat: { type: 'daily', interval: 1 },
      isSeriesDefinition: true,
    };
    const instances = generateRecurringEvents(event, '2025-01-01', '2025-01-07');
    expect(instances).toHaveLength(7);
    expect(instances[0].date).toBe('2025-01-01');
    expect(instances[6].date).toBe('2025-01-07');
  });

  it('종료일이 설정된 일별 반복은 종료일 이후 생성되지 않는다', () => {
    const event = {
      id: '1',
      date: '2025-01-01',
      repeat: { type: 'daily', interval: 1, endDate: '2025-01-05' },
      isSeriesDefinition: true,
    };
    const instances = generateRecurringEvents(event, '2025-01-01', '2025-01-10');
    expect(instances).toHaveLength(5);
    expect(instances[4].date).toBe('2025-01-05');
  });

  it('excludedDates에 포함된 날짜는 생성되지 않는다', () => {
    const event = {
      id: '1',
      date: '2025-01-01',
      repeat: { type: 'daily', interval: 1 },
      excludedDates: ['2025-01-03', '2025-01-05'],
      isSeriesDefinition: true,
    };
    const instances = generateRecurringEvents(event, '2025-01-01', '2025-01-07');
    expect(instances).toHaveLength(5); // 7 days - 2 excluded
    expect(instances.map(e => e.date)).not.toContain('2025-01-03');
    expect(instances.map(e => e.date)).not.toContain('2025-01-05');
  });
});

describe('generateRecurringEvents - Monthly', () => {
  it('월별 반복 일정이 매월 15일에 생성된다', () => {
    const event = {
      id: '1',
      date: '2025-01-15',
      repeat: { type: 'monthly', interval: 1 },
      isSeriesDefinition: true,
    };
    const instances = generateRecurringEvents(event, '2025-01-01', '2025-06-30');
    expect(instances).toHaveLength(6);
    expect(instances[0].date).toBe('2025-01-15');
    expect(instances[5].date).toBe('2025-06-15');
  });

  it('31일 월별 반복은 해당 월에만 생성된다', () => {
    const event = {
      id: '1',
      date: '2025-01-31',
      repeat: { type: 'monthly', interval: 1 },
      isSeriesDefinition: true,
    };
    const instances = generateRecurringEvents(event, '2025-01-01', '2025-12-31');
    // Jan, Mar, May, Jul, Aug, Oct, Dec = 7 months with 31 days
    expect(instances).toHaveLength(7);
    expect(instances.map(e => e.date)).toEqual([
      '2025-01-31', '2025-03-31', '2025-05-31',
      '2025-07-31', '2025-08-31', '2025-10-31', '2025-12-31'
    ]);
  });
});

describe('generateRecurringEvents - Yearly', () => {
  it('윤년 2월 29일 연별 반복은 윤년에만 생성된다', () => {
    const event = {
      id: '1',
      date: '2024-02-29',
      repeat: { type: 'yearly', interval: 1 },
      isSeriesDefinition: true,
    };
    const instances = generateRecurringEvents(event, '2024-01-01', '2028-12-31');
    // 2024 (leap), 2028 (leap) = 2 instances
    expect(instances).toHaveLength(2);
    expect(instances[0].date).toBe('2024-02-29');
    expect(instances[1].date).toBe('2028-02-29');
  });
});
```

#### Category 2: Edge Case Handling

**What to Test**:
- Monthly 31st: Skip Feb, Apr, Jun, Sep, Nov
- Monthly 30th: Skip Feb only
- Yearly Feb 29: Skip non-leap years
- Leap year detection
- Invalid date skipping

**File**: `src/__tests__/unit/medium.recurringEventUtils.spec.ts`

**Example Test Cases**:

```typescript
describe('shouldSkipDate - Monthly Edge Cases', () => {
  it('2월 31일은 스킵된다 (존재하지 않는 날짜)', () => {
    expect(shouldSkipDate('2025-02-31', 'monthly', 31)).toBe(true);
  });

  it('4월 31일은 스킵된다 (30일까지만 존재)', () => {
    expect(shouldSkipDate('2025-04-31', 'monthly', 31)).toBe(true);
  });

  it('3월 31일은 스킵되지 않는다 (31일 존재)', () => {
    expect(shouldSkipDate('2025-03-31', 'monthly', 31)).toBe(false);
  });

  it('2월 30일은 스킵된다', () => {
    expect(shouldSkipDate('2025-02-30', 'monthly', 30)).toBe(true);
  });

  it('4월 30일은 스킵되지 않는다', () => {
    expect(shouldSkipDate('2025-04-30', 'monthly', 30)).toBe(false);
  });
});

describe('isLeapYear', () => {
  it('2024년은 윤년이다', () => {
    expect(isLeapYear(2024)).toBe(true);
  });

  it('2025년은 평년이다', () => {
    expect(isLeapYear(2025)).toBe(false);
  });

  it('2000년은 윤년이다 (400의 배수)', () => {
    expect(isLeapYear(2000)).toBe(true);
  });

  it('1900년은 평년이다 (100의 배수지만 400의 배수 아님)', () => {
    expect(isLeapYear(1900)).toBe(false);
  });
});
```

#### Category 3: Instance Modification (Single vs Series)

**What to Test**:
- Edit single instance creates standalone event with `originalDate`
- Edit series updates master definition
- Delete single instance adds to `excludedDates`
- Delete series removes master and all instances
- Modal confirmation flow

**File**: `src/__tests__/hooks/medium.useRecurringEvent.spec.ts`

**Example Test Cases**:

```typescript
describe('editRecurringInstance', () => {
  it('단일 인스턴스 수정 시 독립 일정으로 변환된다', async () => {
    const { result } = renderHook(() => useRecurringEvent());

    await act(async () => {
      await result.current.editRecurringInstance(
        'evt-1',
        'single',
        { title: '수정된 제목' },
        '2025-03-15'
      );
    });

    // Verify POST /api/events called with standalone event
    expect(mockApiPost).toHaveBeenCalledWith('/api/events', {
      title: '수정된 제목',
      repeat: { type: 'none', interval: 0 },
      originalDate: '2025-03-15',
    });

    // Verify PUT /api/events/:id called with updated excludedDates
    expect(mockApiPut).toHaveBeenCalledWith('/api/events/evt-1', {
      excludedDates: ['2025-03-15'],
    });
  });

  it('시리즈 수정 시 모든 인스턴스가 업데이트된다', async () => {
    const { result } = renderHook(() => useRecurringEvent());

    await act(async () => {
      await result.current.editRecurringInstance(
        'evt-1',
        'series',
        { title: '새 시리즈 제목' }
      );
    });

    // Verify PUT /api/events/:id called with series updates
    expect(mockApiPut).toHaveBeenCalledWith('/api/events/evt-1', {
      title: '새 시리즈 제목',
    });
  });
});

describe('deleteRecurringInstance', () => {
  it('단일 인스턴스 삭제 시 excludedDates에 추가된다', async () => {
    const { result } = renderHook(() => useRecurringEvent());

    await act(async () => {
      await result.current.deleteRecurringInstance('evt-1', 'single', '2025-04-10');
    });

    expect(mockApiPut).toHaveBeenCalledWith('/api/events/evt-1', {
      excludedDates: ['2025-04-10'],
    });
  });

  it('시리즈 삭제 시 모든 인스턴스가 제거된다', async () => {
    const { result } = renderHook(() => useRecurringEvent());

    await act(async () => {
      await result.current.deleteRecurringInstance('evt-1', 'series');
    });

    expect(mockApiDelete).toHaveBeenCalledWith('/api/events/evt-1');
  });
});
```

#### Category 4: End Date Validation

**What to Test**:
- Instances stop at `endDate`
- No `endDate` generates up to system max (2025-12-31)
- Invalid end date (before start) handled
- End date in middle of pattern

**File**: `src/__tests__/unit/medium.recurringEventUtils.spec.ts`

**Example Test Cases**:

```typescript
describe('isWithinRecurrenceRange', () => {
  it('종료일 이후 날짜는 범위 밖이다', () => {
    const event = {
      date: '2025-01-01',
      repeat: { type: 'daily', interval: 1, endDate: '2025-01-31' },
    };
    expect(isWithinRecurrenceRange('2025-02-01', event)).toBe(false);
  });

  it('종료일 당일은 범위 내다', () => {
    const event = {
      date: '2025-01-01',
      repeat: { type: 'daily', interval: 1, endDate: '2025-01-31' },
    };
    expect(isWithinRecurrenceRange('2025-01-31', event)).toBe(true);
  });

  it('종료일이 없으면 2025-12-31까지 유효하다', () => {
    const event = {
      date: '2025-01-01',
      repeat: { type: 'daily', interval: 1 },
    };
    expect(isWithinRecurrenceRange('2025-12-31', event)).toBe(true);
    expect(isWithinRecurrenceRange('2026-01-01', event)).toBe(false);
  });
});
```

#### Category 5: Performance and Optimization

**What to Test**:
- Large date ranges don't cause performance issues
- Expansion time <100ms for 20 series
- Memoization prevents redundant calculations

**File**: `src/__tests__/unit/medium.recurringEventUtils.spec.ts` or performance-specific file

**Example Test Cases**:

```typescript
describe('Performance', () => {
  it('20개 시리즈의 월별 확장이 100ms 이하다', () => {
    const series = Array.from({ length: 20 }, (_, i) => ({
      id: `evt-${i}`,
      date: '2025-01-01',
      repeat: { type: 'weekly', interval: 1 },
      isSeriesDefinition: true,
    }));

    const start = performance.now();
    series.forEach(event =>
      generateRecurringEvents(event, '2025-01-01', '2025-01-31')
    );
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
  });
});
```

### 5.3 Test Priorities for RED Phase

**P0 (Must Have for RED phase)**:
- Daily, weekly, monthly, yearly generation (happy path)
- Monthly 31st edge case
- Yearly Feb 29 edge case
- Single instance edit/delete
- Series edit/delete

**P1 (Add in GREEN phase)**:
- End date validation
- excludedDates filtering
- Performance benchmarks

**P2 (REFACTOR phase)**:
- Integration tests with full UI
- Error handling edge cases
- Accessibility tests for modals

---

## 6. Implementation Strategy

### Phase 1: Foundation (Day 1-2)

**Deliverables**:
1. Create `src/utils/recurringEventUtils.ts` with skeleton functions
2. Create `src/hooks/useRecurringEvent.ts` with skeleton hook
3. Write RED phase tests (failing) for P0 requirements

**Tasks**:
- [ ] Implement `isLeapYear(year)` utility (foundation for Feb 29 logic)
- [ ] Implement `shouldSkipDate(date, repeatType, originalDay)` utility
- [ ] Write 12 edge case tests for monthly 31st and yearly Feb 29

**File Creation Order**:
1. `recurringEventUtils.ts` - Pure functions (no dependencies)
2. Tests for utils - Validate edge cases before complex logic
3. `useRecurringEvent.ts` - Hook depends on utils

**Success Criteria**:
- All edge case tests fail with NotImplementedError (RED phase)
- Type signatures compile without errors
- Test structure matches existing patterns (`medium.*.spec.ts`)

### Phase 2: Core Generation Logic (Day 3-4)

**Deliverables**:
1. Implement `generateRecurringEvents()` for all 4 repeat types
2. Implement `getNextOccurrence()` with interval support
3. Implement `isWithinRecurrenceRange()` for filtering

**Tasks**:
- [ ] Daily recurrence: Add `interval` days to current date
- [ ] Weekly recurrence: Add `interval × 7` days to current date
- [ ] Monthly recurrence: Advance month, handle `shouldSkipDate()` for 31st
- [ ] Yearly recurrence: Advance year, handle `shouldSkipDate()` for Feb 29
- [ ] Integration: `generateRecurringEvents()` orchestrates `getNextOccurrence()` loop

**Integration Points**:
- Reuse `formatDate()` from `utils/dateUtils.ts` for consistent date formatting
- Reuse `getDaysInMonth()` for monthly edge case validation
- Follow async/await + try/catch pattern from `useEventOperations.ts`

**Success Criteria**:
- P0 generation tests pass (GREEN phase)
- Edge case tests pass for monthly 31st and yearly Feb 29
- Performance: <50ms to generate 31 daily instances

### Phase 3: Hook Implementation (Day 5-6)

**Deliverables**:
1. Implement `expandRecurringEvent()` and `expandAllRecurringEvents()`
2. Implement `editRecurringInstance()` with single/series modes
3. Implement `deleteRecurringInstance()` with single/series modes
4. Integrate with `useEventOperations` for API calls

**Tasks**:
- [ ] `expandRecurringEvent()`: Call `generateRecurringEvents()`, return instances
- [ ] `expandAllRecurringEvents()`: Map over events, expand if recurring
- [ ] `editRecurringInstance('single')`: POST new event + PUT excludedDates
- [ ] `editRecurringInstance('series')`: PUT master definition
- [ ] `deleteRecurringInstance('single')`: PUT excludedDates
- [ ] `deleteRecurringInstance('series')`: DELETE master
- [ ] Error handling: `enqueueSnackbar` for failures

**Integration Points**:
- Import `saveEvent`, `deleteEvent`, `fetchEvents` from `useEventOperations`
- Follow error handling pattern: try/catch with snackbar notifications
- Maintain state updates: Call `fetchEvents()` after mutations

**Success Criteria**:
- Hook tests pass for edit/delete single and series
- API calls verified with MSW mocks
- Snackbar notifications appear on success/error

### Phase 4: Calendar View Integration (Day 7)

**Deliverables**:
1. Update `utils/eventUtils.ts` to expand recurring events before filtering
2. Add visual indicators (recurring icon) to event components
3. Modal dialogs for edit/delete confirmation

**Tasks**:
- [ ] Modify `getFilteredEvents()`: Call `expandAllRecurringEvents()` before `filterEventsByDateRange()`
- [ ] Add recurring icon component (SVG or icon library)
- [ ] Create modal component: "해당 일정만 수정하시겠어요?" with "예" / "아니오"
- [ ] Create modal component: "해당 일정만 삭제하시겠어요?" with "예" / "아니오"
- [ ] Wire modal responses to `editRecurringInstance(mode)` and `deleteRecurringInstance(mode)`

**Integration Points**:
- Use existing modal components if available, or create new ones
- Follow existing event component structure for icon placement
- Maintain calendar re-render performance with memoization

**Success Criteria**:
- Month view renders recurring instances within visible range
- Recurring icon displays on all instances (except standalone edited events)
- Modals appear when clicking edit/delete on recurring events
- Single vs series operations work as expected

### Phase 5: Testing and Refinement (Day 8)

**Deliverables**:
1. Add P1 tests (end date validation, excludedDates)
2. Performance benchmarks
3. Integration tests for full user flows

**Tasks**:
- [ ] Write tests for `isWithinRecurrenceRange()` with various end dates
- [ ] Performance test: 20 series × 31 days <100ms
- [ ] Integration test: Create series → edit single → delete series
- [ ] Edge case validation: Negative intervals, invalid repeat types
- [ ] Documentation: Update JSDoc comments with examples

**Success Criteria**:
- Test coverage >90% for utils and hook
- Performance benchmarks pass
- Integration tests validate end-to-end flows
- All P0 and P1 tests pass

---

## 7. Handoff Summary (for QA Agent)

### 7.1 Key Design Decisions

**1. Lazy Expansion Strategy (ADR-001)**:
- Recurring events expand only for visible calendar view range (max 31 days)
- Performance target: <100ms for month view with 20 series
- **QA Priority**: Test performance with large datasets (50+ recurring series)

**2. Master-Instance Storage Model (ADR-002)**:
- Backend stores master definitions with `isSeriesDefinition: true`
- Frontend generates instances on-demand (not persisted)
- Standalone edited instances persisted with `originalDate` field
- **QA Priority**: Verify API calls distinguish between master updates and instance creation

**3. Edge Case Handling (ADR-003)**:
- Monthly 31st: Skips Feb, Apr, Jun, Sep, Nov (only appears in 7 months)
- Yearly Feb 29: Skips non-leap years (appears every 4 years)
- **QA Priority**: Create explicit tests for 2025-2028 range to catch leap year bugs

**4. Modal Confirmation Pattern (ADR-004)**:
- Edit modal: "해당 일정만 수정하시겠어요?" ("예" = single, "아니오" = series)
- Delete modal: "해당 일정만 삭제하시겠어요?" ("예" = single, "아니오" = series)
- **QA Priority**: Test modal flows for both choices in edit and delete

### 7.2 Test Priorities

**P0 - Critical for Release**:
1. ✅ Daily/weekly/monthly/yearly generation (happy path)
2. ✅ Monthly 31st edge case (7 months with 31 days)
3. ✅ Yearly Feb 29 edge case (leap years only)
4. ✅ Edit single instance (creates standalone event)
5. ✅ Edit series (updates all instances)
6. ✅ Delete single instance (excludedDates)
7. ✅ Delete series (removes all instances)

**P1 - Important for Quality**:
1. End date validation (stop at endDate)
2. excludedDates filtering (skip deleted instances)
3. Performance benchmarks (<100ms month view)
4. Modal confirmation flow

**P2 - Nice to Have**:
1. Integration tests (full UI flows)
2. Error handling (network failures)
3. Accessibility (keyboard navigation, screen readers)

### 7.3 Edge Cases to Verify

**Monthly Recurrence**:
- Event on Jan 31 → appears in: Jan, Mar, May, Jul, Aug, Oct, Dec
- Event on Jan 31 → skips: Feb, Apr, Jun, Sep, Nov
- Event on Feb 28 → appears in all 12 months (even Feb)

**Yearly Recurrence**:
- Event on Feb 29, 2024 → next occurrence: Feb 29, 2028
- Event on Feb 29, 2024 → verify NO instances in 2025, 2026, 2027
- Event on Feb 28 → appears every year (not leap-year dependent)

**End Date Scenarios**:
- Series with `endDate: '2025-06-30'` → last instance ≤ June 30
- Series with no `endDate` → generates up to 2025-12-31 (system max)
- Series with `endDate` before `startDate` → should be rejected by validation

**Instance Operations**:
- Edit single instance → verify `originalDate` set correctly
- Edit single instance → verify recurring icon removed from edited instance
- Delete single instance → verify date added to `excludedDates`
- Delete series → verify all instances removed from all calendar views
- Edit series after deleting single instance → verify `excludedDates` preserved

### 7.4 Performance Considerations

**Benchmarks**:
- 20 recurring series × 31 days (month view) → <100ms expansion time
- 10 recurring series × 7 days (week view) → <50ms expansion time
- 1 recurring series × 365 days (full year) → <200ms expansion time

**Test Scenarios**:
- Create 50 weekly recurring events → verify calendar remains responsive
- View month with 100+ event instances (20 series × 5 instances) → no lag
- Switch between month/week views rapidly → smooth transitions

**Optimization Hints**:
- Memoization: Expansion results cached until series or view range changes
- Early exit: Stop generation when reaching `rangeEnd` or `endDate`
- Filtering: Apply `excludedDates` during generation, not post-processing

### 7.5 API Contract Verification

**Backend Requirements** (confirm before implementation):
- POST `/api/events` accepts `isSeriesDefinition`, `seriesId`, `excludedDates` fields
- PUT `/api/events/:id` supports partial updates for `excludedDates` only
- DELETE `/api/events/:id` removes master definition (frontend handles instance cleanup)

**Fallback Plan** (if backend doesn't support):
- Frontend expands recurring events to individual Event objects before POST
- Each instance gets unique ID, `repeat: { type: 'none' }`
- Loss of series operations (edit/delete series becomes manual)

---

## 8. File Deliverables Summary

**New Files Created**:
1. `/src/utils/recurringEventUtils.ts` - Pure functions for recurrence logic
2. `/src/hooks/useRecurringEvent.ts` - React hook for recurring event operations
3. `/src/__tests__/unit/medium.recurringEventUtils.spec.ts` - Unit tests for utilities
4. `/src/__tests__/hooks/medium.useRecurringEvent.spec.ts` - Hook behavior tests

**Modified Files** (future Dev phase):
1. `/src/utils/eventUtils.ts` - Update `getFilteredEvents()` to expand recurring events
2. `/src/hooks/useEventOperations.ts` - Potentially add series-specific operations
3. Event component files - Add recurring icon rendering

**No Changes Needed**:
- `/src/types.ts` - Existing definitions are sufficient
- `/src/utils/dateUtils.ts` - Reused as-is for date operations

**Total Estimated Lines of Code**:
- `recurringEventUtils.ts`: ~200 lines (5 functions + helpers)
- `useRecurringEvent.ts`: ~150 lines (4 hook functions + integration)
- Tests: ~500 lines (40-50 test cases across P0/P1 requirements)
- **Total**: ~850 lines for RED phase skeleton + tests

---

**Design Complete**: Ready for skeleton code generation and QA test authoring.
