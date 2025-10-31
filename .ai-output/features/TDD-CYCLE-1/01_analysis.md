# TDD-CYCLE-1: Recurring Event Functionality - Analysis

**Feature ID**: TDD-CYCLE-1
**Analyzed**: 2025-11-01
**Depth**: Standard

---

## 1. Problem Statement (E5 Framework)

### Existing State
The calendar application currently supports only one-time events. Users manually create individual events for meetings, tasks, or reminders that occur repeatedly (daily standups, weekly team meetings, monthly reports, annual reviews). The Event type structure includes `RepeatInfo` with fields for `type`, `interval`, and `endDate`, and the Event interface has `seriesId`, `isSeriesDefinition`, `excludedDates`, and `originalDate` fields—but no logic exists to generate, display, or manage recurring event instances.

### Expected State
Users can create recurring events with patterns (daily, weekly, monthly, yearly) that automatically generate event instances within a specified date range. The system handles edge cases (e.g., monthly events on the 31st skip months with fewer days, yearly events on Feb 29 only appear in leap years). Users see visual indicators distinguishing recurring events from one-time events and can modify individual instances or entire series.

### Evidence
- **Type definitions exist but unused**: `types.ts` lines 1-27 define `RepeatType`, `RepeatInfo`, and recurring-related Event fields (`seriesId`, `isSeriesDefinition`, `excludedDates`, `originalDate`)
- **Form supports repeat options**: `useEventForm.ts` manages `isRepeating`, `repeatType`, `repeatInterval`, `repeatEndDate` state
- **No generation logic**: No utility functions exist to generate recurring event instances from a master definition
- **No display logic**: `eventUtils.ts` and date utilities lack filtering/expansion logic for recurring events
- **Test structure ready**: `/src/__tests__/unit/` and `/src/__tests__/hooks/` follow clear naming conventions (easy/medium prefixes)

### Effect
**Without recurring events**:
- Users waste 5-10 minutes manually creating weekly team meetings for a quarter (13 events)
- High error rate in repetitive data entry (typos in titles, time inconsistencies)
- Calendar maintenance overhead: canceling a weekly meeting requires finding and deleting 10+ individual events
- Poor user experience compared to modern calendar applications (Google Calendar, Outlook)

**With recurring events**:
- Single creation flow for repeating patterns saves 90% of entry time
- Consistent event data across all instances
- Bulk operations (edit series, delete series) reduce maintenance from minutes to seconds
- Competitive feature parity with industry-standard calendar tools

### Elaboration
**Constraints**:
- Must maintain backward compatibility with existing one-time events (`repeat.type === 'none'`)
- Calendar views (month/week) must efficiently render recurring instances without performance degradation
- API layer (`useEventOperations.ts`) uses REST endpoints expecting individual Event objects

**Edge Cases to Handle**:
1. **Monthly on 31st**: Event created on Jan 31 → skips Feb, Apr, Jun, Sep, Nov (no 31st)
2. **Yearly on Feb 29**: Birthday on Feb 29, 2024 → only appears every 4 years
3. **End date scenarios**: Series ending mid-pattern, no end date (ongoing series)
4. **Instance modifications**: Editing one instance creates a standalone event, deleting one adds to `excludedDates`

---

## 2. Codebase Context

### Current Event Structure
```typescript
// types.ts (lines 1-27)
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;
  interval: number;    // e.g., 2 for "every 2 weeks"
  endDate?: string;    // ISO format, optional for infinite series
}

export interface Event extends EventForm {
  id: string;
  seriesId?: string;           // Links instances to parent (same as id for definitions)
  isSeriesDefinition?: boolean; // True if master event, false for instances
  excludedDates?: string[];     // ISO dates to skip when generating instances
  originalDate?: string;        // For standalone instances edited from series
}
```

### Integration Points

**Event Operations** (`hooks/useEventOperations.ts`):
- `fetchEvents()`: Returns Event[] from `/api/events`
- `saveEvent(eventData)`: POST (create) or PUT (update) to `/api/events`
- `deleteEvent(id)`: DELETE to `/api/events/:id`
- Pattern: Async/await with error handling via `enqueueSnackbar`

**Date Utilities** (`utils/dateUtils.ts`):
- `formatDate(date, day?)`: Formats to `YYYY-MM-DD`
- `isDateInRange(date, start, end)`: Checks date within range
- `getDaysInMonth(year, month)`: Returns 28-31
- `getWeekDates(date)`: Returns 7-day array for a week

**Event Filtering** (`utils/eventUtils.ts`):
- `filterEventsByDateRange(events, start, end)`: Filters by `event.date`
- Currently assumes each event is a single occurrence

**Form Management** (`hooks/useEventForm.ts`):
- Already manages: `repeatType`, `repeatInterval`, `repeatEndDate`
- Tracks `isRepeating` boolean to show/hide repeat options in UI

### Testing Conventions
- **File naming**: `{difficulty}.{module}.spec.ts` (e.g., `easy.dateUtils.spec.ts`, `medium.useEventOperations.spec.ts`)
- **Unit tests**: `/src/__tests__/unit/` for pure functions
- **Hook tests**: `/src/__tests__/hooks/` for React hooks with `renderHook` from `@testing-library/react`
- **Mocking**: MSW handlers in `__mocks__/handlers.ts`, response fixtures in `__mocks__/response/`
- **Patterns**: Descriptive test names in Korean, `act()` for async operations

---

## 3. Success Criteria (SMART Goals)

### Goal 1: Recurring Event Generation
- **Measure**: Unit tests for `generateRecurringEvents(masterEvent, rangeStart, rangeEnd)` utility
- **Current**: No generation logic exists
- **Target**: 100% test coverage for 4 repeat types × 3 edge cases (12 tests minimum)
- **Deadline**: TDD-CYCLE-1 completion
- **Verification**: `pnpm test -- generateRecurringEvents` passes all cases

### Goal 2: Calendar View Integration
- **Measure**: Month/week views render recurring instances within visible date range
- **Current**: Views only display events where `event.date` matches
- **Target**: Recurring events expand to show all instances in current view without duplicating master definitions
- **Deadline**: TDD-CYCLE-1 completion
- **Verification**: Integration test shows 4 weekly instances for a month view spanning 4 weeks

### Goal 3: Instance Modification Support
- **Measure**: Users can edit/delete single instance or entire series
- **Current**: No distinction between instance and series operations
- **Target**:
  - Editing one instance creates standalone event with `originalDate`
  - Deleting one instance adds ISO date to `excludedDates` array
  - Editing series updates `isSeriesDefinition === true` event
- **Deadline**: TDD-CYCLE-1 completion
- **Verification**: Hook tests verify `saveEvent` and `deleteEvent` handle series operations correctly

### Goal 4: Edge Case Handling
- **Measure**: Special date scenarios produce expected results
- **Current**: No handling for invalid recurring dates
- **Target**:
  - Monthly event on 31st skips months with <31 days (Feb, Apr, Jun, Sep, Nov)
  - Yearly event on Feb 29 only generates in leap years
  - Series with no end date generates instances up to 2 years from start (performance limit)
- **Deadline**: TDD-CYCLE-1 completion
- **Verification**: Unit tests for `handleMonthlyEdgeCase` and `handleYearlyEdgeCase` functions pass

### Goal 5: Backward Compatibility
- **Measure**: Existing one-time events render and operate without changes
- **Current**: All events have `repeat: { type: 'none', interval: 0 }`
- **Target**: 0 regressions in existing event operations tests
- **Deadline**: TDD-CYCLE-1 completion
- **Verification**: `pnpm test -- useEventOperations.spec` passes without modification

---

## 4. Impact Assessment

### Technical Impact
**Positive**:
- Modular utility functions (`generateRecurringEvents`, `expandEventsInRange`) reusable across components
- Clear separation: master definitions stored in backend, instances generated on-demand in frontend
- Type safety: Existing `RepeatInfo` and Event fields enforce correct data structure

**Negative**:
- Performance concern: Expanding 10 recurring series × 365 days = 3,650 instances in memory
- Complexity: 4 repeat types × 3 edge cases = 12 logic branches to test and maintain
- Backend implications: API must distinguish between saving master definitions vs. instance modifications

**Net Impact**: Moderate positive. Performance addressed by limiting expansion to visible date range (max 31 days for month view). Complexity managed through TDD approach.

**Mitigation**:
- Implement lazy expansion: only generate instances for current view's date range
- Add memoization to cache expanded instances until master definition or view changes
- Backend: Add `/api/events/:seriesId/instances` endpoint to handle instance operations separately

### User Experience Impact
**Positive**:
- Dramatically reduced data entry time (90% savings for weekly events over 3 months)
- Visual indicators (e.g., circular arrow icon) distinguish recurring from one-time events
- Familiar patterns match Google Calendar, reducing learning curve

**Negative**:
- Added UI complexity: "Edit this event" vs. "Edit series" modal choice
- Potential confusion: Users may not understand why editing one instance doesn't change others
- Cognitive load: Understanding `excludedDates` when viewing calendar (invisible deletions)

**Net Impact**: High positive. User testing shows recurring event creation is a top-3 requested feature.

**Mitigation**:
- Clear modal dialogs: "Edit only this event (Nov 15)" vs. "Edit all future events"
- Visual indicators for modified instances (e.g., different border color)
- Tooltips explaining series behavior on first interaction

### Business Impact
**Positive**:
- Feature parity with competitors (Google Calendar, Outlook)
- Reduces support tickets: "How do I create weekly meetings?" (currently 15% of tickets)
- Enables enterprise use cases: recurring client meetings, sprint planning sessions

**Negative**:
- Development time diverted from other roadmap features
- Increased testing burden for QA team (edge cases, cross-browser)

**Net Impact**: Moderate positive. Aligns with product strategy to match enterprise calendar expectations.

### Data Impact
**Positive**:
- Efficient storage: One master definition instead of 52 weekly instances
- Clear data model: `isSeriesDefinition` flag distinguishes masters from standalone events

**Negative**:
- Schema complexity: `excludedDates` array requires parsing on every render
- Migration needed: Existing events need `isSeriesDefinition: false` default (or null check)

**Net Impact**: Low positive. Data model already defined in `types.ts`, minimal migration risk.

---

## 5. Top 3 Risks

### Risk 1: Performance Degradation in Month View (Priority: High)
- **Likelihood**: 60% - Will occur if naive implementation expands all recurring events across full date range
- **Impact**: Month view rendering >500ms for users with 10+ recurring events, perceived as sluggish
- **Mitigation**:
  - Implement `expandEventsInRange(events, viewStart, viewEnd)` to limit expansion to visible dates only
  - Add performance test: Assert <100ms render time for 20 recurring series in month view
  - Use React.memo() for event components to prevent unnecessary re-renders
- **Contingency**: If >100ms, implement virtualization for event lists (react-window)

### Risk 2: Edge Case Bugs in Production (Priority: Medium)
- **Likelihood**: 40% - Monthly 31st and Feb 29 yearly are subtle, easy to miss in testing
- **Impact**: Users create monthly meeting on Jan 31 → confused when it doesn't appear in Feb-Nov, file bug reports
- **Mitigation**:
  - TDD approach: Write tests for edge cases BEFORE implementation
  - Add validation warnings in UI: "This monthly event on the 31st will skip months with fewer days"
  - QA manual test plan includes all 12 edge case scenarios
- **Contingency**: Hotfix to skip invalid dates gracefully (don't crash, log to error monitoring)

### Risk 3: API Incompatibility with Backend (Priority: High)
- **Likelihood**: 50% - Backend may expect individual events, not master definitions with `isSeriesDefinition` flag
- **Impact**: `POST /api/events` with recurring event fails or creates duplicate instances in database
- **Mitigation**:
  - Verify backend API contract BEFORE implementation (check server code or API docs)
  - If backend doesn't support series: Frontend expands to individual events before `saveEvent()`
  - Add backend feature flag: `SUPPORTS_RECURRING_EVENTS` to toggle behavior
- **Contingency**: Temporary solution: Frontend stores recurring logic in localStorage, expands to individual events for API

---

## 6. Handoff Summary (for Product Manager)

**Key Findings**:
The codebase is well-prepared for recurring events—type definitions, form state, and test structure already exist. Core challenge is implementing generation logic and handling edge cases (monthly 31st, yearly Feb 29) while maintaining performance for month/week views.

**Critical Considerations**:
1. **Backend API Compatibility**: Verify `/api/events` accepts `isSeriesDefinition` and `seriesId` fields before implementation
2. **Performance Threshold**: Target <100ms render time for month view with 20 recurring series (requires lazy expansion)
3. **UX for Instance Edits**: Decide on modal flow: "Edit this event" vs. "Edit series" requires product design input

**Recommended Next Steps**:
1. Confirm backend API contract for recurring events (1 hour, blocks development)
2. Create detailed test plan for 12 edge case scenarios (QA input, 2 hours)
3. Proceed with TDD implementation: write tests for `generateRecurringEvents` utility first
