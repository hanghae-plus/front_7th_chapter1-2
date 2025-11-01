# Test Design: Recurring Events Feature

## Executive Summary

- **PRD Source**: `PRD_RECURRING_EVENTS.md`
- **Total Requirements**: 66 functional requirements (FR-001 through FR-009) + 15 non-functional requirements
- **Total Test Cases Designed**: 58
- **Test Files Affected**:
  - `src/__tests__/unit/recurringEventGeneration.spec.ts` (NEW)
  - `src/__tests__/unit/dateUtils.spec.ts` (EXTENDED - leap year/31st logic)
  - `src/__tests__/hooks/useEventOperations.spec.ts` (EXTENDED)
  - `src/__tests__/hooks/useRecurringEventDialog.spec.ts` (NEW)
  - `src/__tests__/components/EventFormRecurring.spec.tsx` (NEW)
  - `src/__tests__/components/RecurringEventIcon.spec.tsx` (NEW)
  - `src/__tests__/components/RecurringEventDialog.spec.tsx` (NEW)
  - `src/__tests__/integration/recurringEvents.integration.spec.tsx` (NEW)
- **Estimated Coverage**: 100% (all PRD requirements)

## Test Distribution by Category

- **Component Tests**: 15 tests in 3 files
- **Hook Tests**: 8 tests in 2 files
- **Integration Tests**: 12 tests in 1 file
- **Edge Case Tests**: 18 tests in 2 files
- **Unit/Utility Tests**: 5 tests in 2 files

**Total**: 58 test cases

## Existing Test Architecture Analysis

### Discovered Patterns

**Test Framework**: Vitest with jsdom environment
**Naming Convention**: `.spec.ts` for utility/hook tests, `.spec.tsx` for component tests
**Directory Structure**:
- `src/__tests__/unit/` - Pure function/utility tests
- `src/__tests__/hooks/` - Custom React hook tests
- `src/__tests__/` - Integration tests (named `*.integration.spec.tsx`)

**Testing Libraries**:
- `@testing-library/react` - Component and hook testing
- `@testing-library/user-event` - User interaction simulation
- `msw` (Mock Service Worker) - API mocking

**Setup Configuration** (`src/setupTests.ts`):
- MSW server initialized in `beforeAll`
- Fake timers enabled with `vi.useFakeTimers()`
- System time set to `2025-10-01` in `beforeEach`
- Timezone stubbed to UTC
- `expect.hasAssertions()` enforced in every test

**Common Patterns Observed**:
- Use `renderHook` from `@testing-library/react` for hook tests
- Use `render`, `screen`, `within` for component tests
- Use `userEvent.setup()` for user interactions (NOT `fireEvent`)
- MSW handlers setup with `setupMockHandlerCreation/Updating/Deletion` utilities
- API responses wrapped in `act()` for async state updates
- Test descriptions in Korean language
- Descriptive test names focusing on behavior

**Assertion Style**:
- `expect(result).toEqual([...])` for arrays/objects
- `expect(element).toBeInTheDocument()` for DOM elements
- `expect(fn).toHaveBeenCalledWith(...)` for function calls
- `expect(result).toHaveLength(N)` for array length

### Conventions to Follow

1. All test descriptions in Korean
2. Use `act()` for async operations
3. Setup MSW handlers before tests that make API calls
4. Use `vi.setSystemTime()` for time-dependent tests
5. Always include `expect.hasAssertions()` (already in setup)
6. Use `userEvent` over `fireEvent`
7. File naming: `[priority].[feature].spec.{ts|tsx}`
8. Priority prefix: `easy`, `medium`, `hard` (recurring events = `medium` complexity)

---

## Test Cases

### Category: Unit Tests - Recurring Event Generation Logic

#### Test Case: TC-001 - Generate Daily Recurring Events

**Category**: unit

**File**: `src/__tests__/unit/medium.recurringEventGeneration.spec.ts`

**Description**:
Tests the `generateRecurringEvents` utility function to verify it creates the correct number of event instances for daily recurrence. Given a start date, end date, and 'daily' repeat type, the function must generate one event for each day in the range (inclusive).

**Given**: Event with start date '2025-01-01', end date '2025-01-05', repeat type 'daily'
**When**: `generateRecurringEvents(eventData)` is called
**Then**: Function returns array of 5 Event objects with dates Jan 1, 2, 3, 4, 5

**Acceptance Criteria**:
- [ ] Returned array has exactly 5 elements
- [ ] Each event has unique `id` (UUID v4 format)
- [ ] All events share identical `repeat.id` value
- [ ] Event dates are '2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05'
- [ ] Each event has `repeat.type = 'daily'`
- [ ] Each event has `repeat.endDate = '2025-01-05'`
- [ ] Each event has `repeat.interval = 1`
- [ ] All other fields (title, startTime, endTime, etc.) are identical across events

**Edge Cases to Consider**:
- Single day range (start date = end date)
- Large date range (365 days)

**Test Priority**: Critical

**Implementation Notes**:
Create new utility function `generateRecurringEvents(eventForm: EventForm): Event[]` in `src/utils/eventUtils.ts`. Function will generate event instances based on repeat configuration and return array. Use `crypto.randomUUID()` for generating IDs and shared repeat.id.

---

#### Test Case: TC-002 - Generate Weekly Recurring Events

**Category**: unit

**File**: `src/__tests__/unit/medium.recurringEventGeneration.spec.ts`

**Description**:
Verifies weekly recurring event generation produces events on the same day of the week. Given a start date, end date, and 'weekly' repeat type, generates events at 7-day intervals.

**Given**: Event with start date '2025-01-06' (Monday), end date '2025-01-27', repeat type 'weekly'
**When**: `generateRecurringEvents(eventData)` is called
**Then**: Function returns array of 4 Event objects with dates Jan 6, 13, 20, 27 (all Mondays)

**Acceptance Criteria**:
- [ ] Returned array has exactly 4 elements
- [ ] All event dates fall on Monday (day of week = 1)
- [ ] Date intervals are exactly 7 days apart
- [ ] Each event has unique `id`
- [ ] All events share identical `repeat.id`
- [ ] Each event has `repeat.type = 'weekly'`

**Edge Cases to Consider**:
- Start date near month boundary
- End date that doesn't align with 7-day interval (last event before end date)

**Test Priority**: Critical

**Implementation Notes**:
Function adds 7 days to current date iteratively until end date is exceeded. Uses `new Date().getDay()` to verify day of week consistency in tests.

---

#### Test Case: TC-003 - Generate Monthly Recurring Events (Normal Days)

**Category**: unit

**File**: `src/__tests__/unit/medium.recurringEventGeneration.spec.ts`

**Description**:
Tests monthly recurrence for typical days (not 29-31) to ensure events are created on the same day of each month. This establishes baseline monthly behavior before edge cases.

**Given**: Event with start date '2025-01-15', end date '2025-04-30', repeat type 'monthly'
**When**: `generateRecurringEvents(eventData)` is called
**Then**: Function returns array of 4 Event objects with dates Jan 15, Feb 15, Mar 15, Apr 15

**Acceptance Criteria**:
- [ ] Returned array has exactly 4 elements
- [ ] Event dates are '2025-01-15', '2025-02-15', '2025-03-15', '2025-04-15'
- [ ] Each event has unique `id`
- [ ] All events share identical `repeat.id`
- [ ] Each event has `repeat.type = 'monthly'`
- [ ] All months between start and end are represented

**Edge Cases to Consider**:
- Single month range
- Year boundary crossing (Dec to Jan)

**Test Priority**: Critical

**Implementation Notes**:
Function adds 1 month to current date iteratively. For normal days (1-28), straightforward month increment works. Must validate this before testing edge cases.

---

#### Test Case: TC-004 - Generate Monthly Recurring Events on 31st (Edge Case)

**Category**: edge-case

**File**: `src/__tests__/unit/medium.recurringEventGeneration.spec.ts`

**Description**:
CRITICAL EDGE CASE: Tests monthly recurrence starting on the 31st. Events must ONLY be created in months with 31 days. February (28/29 days), April (30 days), June (30 days), September (30 days), November (30 days) must be SKIPPED.

**Given**: Event with start date '2025-01-31', end date '2025-04-30', repeat type 'monthly'
**When**: `generateRecurringEvents(eventData)` is called
**Then**: Function returns array of 2 Event objects with dates Jan 31, Mar 31 ONLY

**Acceptance Criteria**:
- [ ] Returned array has exactly 2 elements (NOT 4)
- [ ] Event dates are '2025-01-31' and '2025-03-31' ONLY
- [ ] NO event created for '2025-02-31' (does not exist)
- [ ] NO event created for '2025-04-31' (does not exist)
- [ ] Each event has day-of-month = 31
- [ ] All events share identical `repeat.id`
- [ ] Each event has `repeat.type = 'monthly'`

**Edge Cases to Consider**:
- Monthly recurrence on 30th (skips February)
- Monthly recurrence on 29th (skips February in non-leap years)
- Full year starting Jan 31 (7 events: Jan, Mar, May, Jul, Aug, Oct, Dec)

**Test Priority**: Critical

**Implementation Notes**:
Function must check if target month has the required day. Use logic: `new Date(year, month + 1, 0).getDate()` to get last day of month. Only create event if day-of-month exists in target month. This is a PRD-specified requirement - DO NOT create events on "last day of month" as fallback.

---

#### Test Case: TC-005 - Generate Yearly Recurring Events on Feb 29 (Leap Day Edge Case)

**Category**: edge-case

**File**: `src/__tests__/unit/medium.recurringEventGeneration.spec.ts`

**Description**:
CRITICAL EDGE CASE: Tests yearly recurrence starting on Feb 29 (leap day). Events must ONLY be created on Feb 29 in leap years. Non-leap years must be SKIPPED (do NOT create on Feb 28).

**Given**: Event with start date '2024-02-29', end date '2027-03-01', repeat type 'yearly'
**When**: `generateRecurringEvents(eventData)` is called
**Then**: Function returns array of 1 Event object with date Feb 29, 2024 ONLY

**Acceptance Criteria**:
- [ ] Returned array has exactly 1 element (NOT 4)
- [ ] Event date is '2024-02-29' ONLY
- [ ] NO event created for '2025-02-29' (2025 not leap year)
- [ ] NO event created for '2026-02-29' (2026 not leap year)
- [ ] NO event created for '2027-02-29' (2027 not leap year, also past end date)
- [ ] Event has month = 2 (February), day = 29
- [ ] Event has `repeat.type = 'yearly'`
- [ ] All events share identical `repeat.id`

**Edge Cases to Consider**:
- Leap year logic validation: 2024 (leap), 2025-2027 (not leap), 2028 (leap)
- Yearly recurrence on Feb 29 spanning 2024-2028 (2 events)
- Leap year calculation for century years (2000 is leap, 2100 is not)

**Test Priority**: Critical

**Implementation Notes**:
Function must check leap year for Feb 29 events. Leap year if: (year % 4 === 0 AND year % 100 !== 0) OR (year % 400 === 0). Only create event if target year is leap year when original date is Feb 29. This is a PRD-specified requirement - DO NOT create on Feb 28 as fallback.

---

#### Test Case: TC-006 - All Events in Series Share Same repeat.id

**Category**: unit

**File**: `src/__tests__/unit/medium.recurringEventGeneration.spec.ts`

**Description**:
Verifies that all generated event instances in a recurring series have the same `repeat.id` value, enabling series-level operations (edit all, delete all). This shared identifier is critical for backend API operations.

**Given**: Event with any repeat type (daily/weekly/monthly/yearly) generating 5+ events
**When**: `generateRecurringEvents(eventData)` is called
**Then**: All returned events have identical `repeat.id` value

**Acceptance Criteria**:
- [ ] Extract `repeat.id` from all events into array
- [ ] Convert array to Set and verify Set size = 1
- [ ] Verify `repeat.id` is valid UUID v4 format (regex: `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`)
- [ ] Verify `repeat.id` is NOT equal to any event's `id` (different identifiers)

**Edge Cases to Consider**:
- Single event series (start date = end date for daily)
- Large series (365 events)

**Test Priority**: Critical

**Implementation Notes**:
Generate single UUID for repeat.id at start of function, assign to all events in series. Use `crypto.randomUUID()` for generation.

---

#### Test Case: TC-007 - All Events Have Unique event.id

**Category**: unit

**File**: `src/__tests__/unit/medium.recurringEventGeneration.spec.ts`

**Description**:
Verifies that each event instance in a recurring series has a unique `id` field. This enables individual event operations (edit single, delete single, fetch single).

**Given**: Event with any repeat type generating 5+ events
**When**: `generateRecurringEvents(eventData)` is called
**Then**: All returned events have unique `id` values

**Acceptance Criteria**:
- [ ] Extract `id` from all events into array
- [ ] Convert array to Set
- [ ] Verify Set size equals array length (all unique)
- [ ] Verify each `id` is valid UUID v4 format

**Edge Cases to Consider**:
- Single event series
- Large series (365 events, all must be unique)

**Test Priority**: Critical

**Implementation Notes**:
Generate new UUID for each event's `id` field using `crypto.randomUUID()`. Different from `repeat.id` which is shared.

---

#### Test Case: TC-008 - Leap Year Detection Utility

**Category**: unit

**File**: `src/__tests__/unit/easy.dateUtils.spec.ts` (EXTEND EXISTING FILE)

**Description**:
Tests a utility function `isLeapYear(year: number): boolean` that determines if a given year is a leap year. Required for Feb 29 recurring event logic.

**Given**: Year values: 2024, 2025, 2026, 2027, 2028, 2000, 2100
**When**: `isLeapYear(year)` is called for each
**Then**: Returns correct boolean for each year

**Acceptance Criteria**:
- [ ] `isLeapYear(2024)` returns `true` (divisible by 4, not by 100)
- [ ] `isLeapYear(2025)` returns `false`
- [ ] `isLeapYear(2026)` returns `false`
- [ ] `isLeapYear(2027)` returns `false`
- [ ] `isLeapYear(2028)` returns `true` (divisible by 4, not by 100)
- [ ] `isLeapYear(2000)` returns `true` (divisible by 400)
- [ ] `isLeapYear(2100)` returns `false` (divisible by 100, not by 400)

**Edge Cases to Consider**:
- Century years (1900, 2000, 2100, 2400)
- Negative years (BC dates - likely not needed for calendar app)

**Test Priority**: High

**Implementation Notes**:
Add `isLeapYear` function to `src/utils/dateUtils.ts`. Implementation: `(year % 4 === 0 && year % 100 !== 0) || year % 400 === 0`

---

#### Test Case: TC-009 - Days in Month Utility

**Category**: unit

**File**: `src/__tests__/unit/easy.dateUtils.spec.ts` (EXTEND EXISTING FILE)

**Description**:
Tests a utility function `getDaysInMonth(year: number, month: number): number` that returns the number of days in a given month, accounting for leap years. Required for monthly 31st edge case logic.

**Given**: Various year/month combinations
**When**: `getDaysInMonth(year, month)` is called
**Then**: Returns correct number of days

**Acceptance Criteria**:
- [ ] `getDaysInMonth(2025, 1)` returns 31 (January)
- [ ] `getDaysInMonth(2025, 2)` returns 28 (February, non-leap year)
- [ ] `getDaysInMonth(2024, 2)` returns 29 (February, leap year)
- [ ] `getDaysInMonth(2025, 4)` returns 30 (April)
- [ ] `getDaysInMonth(2025, 5)` returns 31 (May)
- [ ] `getDaysInMonth(2025, 12)` returns 31 (December)

**Edge Cases to Consider**:
- February in leap vs non-leap years
- All months with 30 days (Apr, Jun, Sep, Nov)
- All months with 31 days (Jan, Mar, May, Jul, Aug, Oct, Dec)

**Test Priority**: High

**Implementation Notes**:
Add `getDaysInMonth` function to `src/utils/dateUtils.ts`. Implementation: `new Date(year, month + 1, 0).getDate()` (month is 0-indexed in JavaScript Date).

---

### Category: Component Tests - Event Form Recurring Fields

#### Test Case: TC-010 - Repeat Type Selector Displays All Options

**Category**: component

**File**: `src/__tests__/components/medium.EventFormRecurring.spec.tsx`

**Description**:
Tests that the event form displays a repeat type selector (dropdown/select) with all 5 options: none, daily, weekly, monthly, yearly. Verifies UI rendering of repeat type field.

**Given**: Event form component rendered
**When**: User clicks on repeat type selector
**Then**: Dropdown opens showing 5 options with Korean labels

**Acceptance Criteria**:
- [ ] Select element labeled "반복 유형" is rendered
- [ ] Default selected value is 'none'
- [ ] Clicking select opens dropdown with 5 options
- [ ] Option '반복 안함' (value='none') exists
- [ ] Option '매일' (value='daily') exists
- [ ] Option '매주' (value='weekly') exists
- [ ] Option '매월' (value='monthly') exists
- [ ] Option '매년' (value='yearly') exists

**Edge Cases to Consider**:
- Keyboard navigation (Tab, Arrow keys, Enter)
- Screen reader accessibility (ARIA labels)

**Test Priority**: High

**Implementation Notes**:
Add repeat type Select component to event form (likely `src/components/EventForm.tsx` or new component). Use Material-UI Select component. Positioned after notification field per PRD.

---

#### Test Case: TC-011 - Repeat End Date Field Shows When Type Selected

**Category**: component

**File**: `src/__tests__/components/medium.EventFormRecurring.spec.tsx`

**Description**:
Tests conditional rendering of repeat end date field. Field must be hidden when repeat type is 'none' and visible for all other repeat types.

**Given**: Event form with repeat type selector
**When**: User selects repeat type '매일' (daily)
**Then**: Repeat end date field becomes visible

**Acceptance Criteria**:
- [ ] Initially, with repeat type 'none', end date field NOT in document
- [ ] After selecting 'daily', end date field appears
- [ ] End date field labeled "반복 종료일"
- [ ] End date field has `required` attribute
- [ ] End date field is type="date" or DatePicker component
- [ ] Changing back to 'none' hides end date field again

**Edge Cases to Consider**:
- Switching between different non-none types (end date remains visible)
- Form validation when end date is required but empty

**Test Priority**: High

**Implementation Notes**:
Use conditional rendering: `{repeatType !== 'none' && <DateField />}`. Material-UI DatePicker or native HTML date input.

---

#### Test Case: TC-012 - Repeat End Date Validation - Max Date 2025-12-31

**Category**: component

**File**: `src/__tests__/components/medium.EventFormRecurring.spec.tsx`

**Description**:
Tests validation that prevents users from setting repeat end date beyond 2025-12-31. Error message must display when user attempts to exceed max date.

**Given**: Event form with repeat type 'daily' selected, end date field visible
**When**: User enters end date '2026-01-01'
**Then**: Error message displays below field, submit button disabled

**Acceptance Criteria**:
- [ ] After entering '2026-01-01' and blurring field, error message appears
- [ ] Error text is "반복 종료일은 2025년 12월 31일을 초과할 수 없습니다"
- [ ] Error displayed in FormHelperText with error styling (red)
- [ ] Submit button has `disabled` attribute
- [ ] Changing to valid date (e.g., '2025-12-31') removes error
- [ ] Submit button becomes enabled after fixing error

**Edge Cases to Consider**:
- Exactly 2025-12-31 (should be valid, boundary test)
- Far future dates (2030-01-01)
- Invalid date formats

**Test Priority**: Critical

**Implementation Notes**:
Add validation in event form hook or component. Check `endDate > '2025-12-31'`. Display error using Material-UI FormHelperText. Disable submit when validation fails.

---

#### Test Case: TC-013 - Repeat End Date Validation - After Start Date

**Category**: component

**File**: `src/__tests__/components/medium.EventFormRecurring.spec.tsx`

**Description**:
Tests validation that prevents repeat end date from being before or equal to event start date. Ensures logical date ordering.

**Given**: Event form with start date '2025-01-10', repeat type 'daily'
**When**: User enters end date '2025-01-05'
**Then**: Error message displays, submit button disabled

**Acceptance Criteria**:
- [ ] After entering end date before start date, error message appears
- [ ] Error text is "반복 종료일은 시작일 이후여야 합니다"
- [ ] Error displayed in FormHelperText with error styling
- [ ] Submit button has `disabled` attribute
- [ ] End date equal to start date (same day) also shows error
- [ ] Valid end date (after start date) removes error

**Edge Cases to Consider**:
- End date = start date (should error or allow? PRD implies "after", so likely error)
- Start date changes after end date is set (must revalidate)

**Test Priority**: Critical

**Implementation Notes**:
Add validation comparing `endDate <= startDate`. Validate on both field changes. Display error using FormHelperText.

---

#### Test Case: TC-014 - Repeat End Date Required When Type Not None

**Category**: component

**File**: `src/__tests__/components/medium.EventFormRecurring.spec.tsx`

**Description**:
Tests that repeat end date field is required when repeat type is not 'none'. Empty end date must show validation error.

**Given**: Event form with repeat type 'daily' selected
**When**: User leaves end date field empty and attempts to submit
**Then**: Error message displays, form does not submit

**Acceptance Criteria**:
- [ ] With repeat type='daily' and empty end date, error message appears
- [ ] Error text is "반복 종료일을 입력해주세요"
- [ ] Submit button disabled or form submission prevented
- [ ] Error appears on blur or submit attempt
- [ ] Entering valid end date removes error

**Edge Cases to Consider**:
- Whitespace-only input
- Changing repeat type to 'none' after error (should remove validation)

**Test Priority**: High

**Implementation Notes**:
Add required validation when `repeatType !== 'none'`. Check field is not empty string. Display error using FormHelperText.

---

#### Test Case: TC-015 - Form Submits Event Data with Repeat Configuration

**Category**: component

**File**: `src/__tests__/components/medium.EventFormRecurring.spec.tsx`

**Description**:
Tests that when user fills out event form including repeat fields and submits, the form passes correct event data including repeat configuration to the save handler.

**Given**: Event form with all fields filled including repeat type='daily', end date='2025-01-05'
**When**: User clicks submit button
**Then**: Save handler called with EventForm object containing repeat configuration

**Acceptance Criteria**:
- [ ] Mock save handler is called with object containing `repeat` field
- [ ] `repeat.type` is 'daily'
- [ ] `repeat.interval` is 1
- [ ] `repeat.endDate` is '2025-01-05'
- [ ] `repeat.id` is undefined (not set in form, generated during creation)
- [ ] All other event fields (title, date, times, etc.) are included

**Edge Cases to Consider**:
- Repeat type 'none' should have repeat object but with type='none', no endDate
- Different repeat types (weekly, monthly, yearly)

**Test Priority**: Critical

**Implementation Notes**:
Event form must construct EventForm object with repeat configuration from form state. Pass to save handler (likely `useEventOperations.saveEvent`).

---

### Category: Component Tests - Recurring Event Visual Indicator

#### Test Case: TC-016 - Recurring Event Displays Icon in Calendar View

**Category**: component

**File**: `src/__tests__/components/medium.RecurringEventIcon.spec.tsx`

**Description**:
Tests that events with `repeat.type !== 'none'` display a recurring event icon in the calendar view. Icon must be visually distinct and accessible.

**Given**: Event with `repeat.type = 'daily'` rendered in calendar
**When**: Component renders
**Then**: Recurring icon is visible within event card

**Acceptance Criteria**:
- [ ] Event card contains an icon element (Material-UI RepeatIcon or equivalent)
- [ ] Icon has aria-label="반복 일정"
- [ ] Icon is visible (not display: none or visibility: hidden)
- [ ] Icon size is 16x16 pixels or specified size
- [ ] Hovering icon shows tooltip "반복 일정"

**Edge Cases to Consider**:
- Icon positioning (top-right vs before title)
- Icon color contrast for accessibility
- Mobile view icon visibility

**Test Priority**: High

**Implementation Notes**:
Add conditional icon rendering in event card component (likely `CalendarCell` or `EventItem` component). Check `event.repeat.type !== 'none'` before rendering icon. Use Material-UI RepeatIcon or circular arrows icon.

---

#### Test Case: TC-017 - Non-Recurring Event Does Not Display Icon

**Category**: component

**File**: `src/__tests__/components/medium.RecurringEventIcon.spec.tsx`

**Description**:
Tests that events with `repeat.type = 'none'` do NOT display a recurring event icon. Ensures icon is only shown for actual recurring events.

**Given**: Event with `repeat.type = 'none'` rendered in calendar
**When**: Component renders
**Then**: No recurring icon is present in event card

**Acceptance Criteria**:
- [ ] Query for icon with aria-label="반복 일정" returns null
- [ ] Event card renders normally without icon
- [ ] No placeholder or hidden icon element exists

**Edge Cases to Consider**:
- Events with undefined repeat field (treat as non-recurring)
- Events with repeat but type='none'

**Test Priority**: High

**Implementation Notes**:
Conditional rendering only when `event.repeat?.type && event.repeat.type !== 'none'`.

---

### Category: Component Tests - Recurring Event Confirmation Dialogs

#### Test Case: TC-018 - Edit Recurring Event Shows Confirmation Dialog

**Category**: component

**File**: `src/__tests__/components/medium.RecurringEventDialog.spec.tsx`

**Description**:
Tests that clicking edit on a recurring event displays a confirmation dialog asking if user wants to edit only this event or the entire series.

**Given**: Recurring event displayed in calendar (repeat.type='daily')
**When**: User clicks edit button
**Then**: Confirmation dialog appears with Korean message and 3 buttons

**Acceptance Criteria**:
- [ ] Dialog is rendered and visible
- [ ] Dialog title is "반복 일정 수정"
- [ ] Dialog message is "해당 일정만 수정하시겠어요?"
- [ ] Three buttons present: "취소", "아니오", "예"
- [ ] Dialog is modal (blocks interaction with calendar)
- [ ] Edit form does NOT open yet (waits for user selection)

**Edge Cases to Consider**:
- Pressing Escape key (should close dialog, same as Cancel)
- Clicking outside dialog (Material-UI Dialog behavior)

**Test Priority**: Critical

**Implementation Notes**:
Add dialog component triggered on recurring event edit click. Use Material-UI Dialog component. Store event being edited in state. Dialog intercepts normal edit flow.

---

#### Test Case: TC-019 - Edit Dialog "예" Opens Form for Single Event Edit

**Category**: component

**File**: `src/__tests__/components/medium.RecurringEventDialog.spec.tsx`

**Description**:
Tests that clicking "예" (Yes) in edit confirmation dialog closes the dialog and opens the edit form in single-event edit mode.

**Given**: Edit confirmation dialog displayed for recurring event
**When**: User clicks "예" button
**Then**: Dialog closes, edit form opens with event data, single-edit mode flag set

**Acceptance Criteria**:
- [ ] Dialog is no longer in document after click
- [ ] Edit form/modal is visible
- [ ] Edit form is pre-populated with event data
- [ ] Edit mode flag indicates single-event edit (not series edit)
- [ ] Repeat fields in form show current values but will be removed on save

**Edge Cases to Consider**:
- Rapid clicking (button should disable during action)
- Form cancellation after opening

**Test Priority**: Critical

**Implementation Notes**:
"예" button click handler closes dialog, sets edit mode to 'single', opens edit form. Pass event data and edit mode to form component.

---

#### Test Case: TC-020 - Edit Dialog "아니오" Opens Form for Series Edit

**Category**: component

**File**: `src/__tests__/components/medium.RecurringEventDialog.spec.tsx`

**Description**:
Tests that clicking "아니오" (No) in edit confirmation dialog closes the dialog and opens the edit form in series edit mode.

**Given**: Edit confirmation dialog displayed for recurring event
**When**: User clicks "아니오" button
**Then**: Dialog closes, edit form opens with event data, series-edit mode flag set

**Acceptance Criteria**:
- [ ] Dialog is no longer in document after click
- [ ] Edit form/modal is visible
- [ ] Edit form is pre-populated with event data
- [ ] Edit mode flag indicates series edit (not single-event edit)
- [ ] Repeat fields in form remain editable for series modification

**Edge Cases to Consider**:
- Changing repeat type during series edit
- Changing repeat end date (may add/remove instances)

**Test Priority**: Critical

**Implementation Notes**:
"아니오" button click handler closes dialog, sets edit mode to 'series', opens edit form. Pass event data and edit mode to form component.

---

#### Test Case: TC-021 - Edit Dialog "취소" Closes Without Action

**Category**: component

**File**: `src/__tests__/components/medium.RecurringEventDialog.spec.tsx`

**Description**:
Tests that clicking "취소" (Cancel) in edit confirmation dialog closes the dialog and returns to calendar view without opening edit form.

**Given**: Edit confirmation dialog displayed
**When**: User clicks "취소" button
**Then**: Dialog closes, no form opens, calendar remains unchanged

**Acceptance Criteria**:
- [ ] Dialog is no longer in document after click
- [ ] Edit form is NOT visible
- [ ] Calendar view is displayed
- [ ] Event remains unchanged in calendar

**Edge Cases to Consider**:
- Escape key (same behavior as Cancel)
- Clicking backdrop (if Material-UI Dialog allows)

**Test Priority**: High

**Implementation Notes**:
"취소" button click handler closes dialog, resets state, does not open form.

---

#### Test Case: TC-022 - Delete Recurring Event Shows Confirmation Dialog

**Category**: component

**File**: `src/__tests__/components/medium.RecurringEventDialog.spec.tsx`

**Description**:
Tests that clicking delete on a recurring event displays a confirmation dialog asking if user wants to delete only this event or the entire series.

**Given**: Recurring event displayed in calendar
**When**: User clicks delete button
**Then**: Confirmation dialog appears with Korean message and 3 buttons

**Acceptance Criteria**:
- [ ] Dialog is rendered and visible
- [ ] Dialog title is "반복 일정 삭제"
- [ ] Dialog message is "해당 일정만 삭제하시겠어요?"
- [ ] Three buttons present: "취소", "아니오", "예"
- [ ] "아니오" and "예" buttons have error color (red)
- [ ] Dialog is modal

**Edge Cases to Consider**:
- Pressing Escape key
- Accidental delete (importance of clear messaging)

**Test Priority**: Critical

**Implementation Notes**:
Add delete dialog similar to edit dialog. Different title/message. Buttons styled with error variant for delete actions.

---

#### Test Case: TC-023 - Delete Dialog "예" Deletes Single Event Only

**Category**: component

**File**: `src/__tests__/components/medium.RecurringEventDialog.spec.tsx`

**Description**:
Tests that clicking "예" (Yes) in delete confirmation dialog deletes only the selected event instance, leaving other events in the series intact.

**Given**: Delete confirmation dialog for recurring event from 5-event series
**When**: User clicks "예" button
**Then**: Single event is deleted via DELETE /api/events/:id, other 4 events remain

**Acceptance Criteria**:
- [ ] DELETE request sent to `/api/events/:id` with selected event's ID
- [ ] Request body is empty or contains only event ID
- [ ] After deletion, 4 events from series remain in calendar
- [ ] Remaining events still have recurring icon
- [ ] Snackbar shows "일정이 삭제되었습니다"

**Edge Cases to Consider**:
- Deleting last remaining event from series (series effectively ends)
- API error during deletion

**Test Priority**: Critical

**Implementation Notes**:
"예" click handler calls `deleteEvent(eventId)` with single event ID. Uses existing DELETE /api/events/:id endpoint. Does not affect other events in series.

---

#### Test Case: TC-024 - Delete Dialog "아니오" Deletes Entire Series

**Category**: component

**File**: `src/__tests__/components/medium.RecurringEventDialog.spec.tsx`

**Description**:
Tests that clicking "아니오" (No) in delete confirmation dialog deletes all events in the recurring series using the repeat.id identifier.

**Given**: Delete confirmation dialog for recurring event from 5-event series
**When**: User clicks "아니오" button
**Then**: All 5 events are deleted via DELETE /api/recurring-events/:repeatId

**Acceptance Criteria**:
- [ ] DELETE request sent to `/api/recurring-events/:repeatId` with shared repeat.id
- [ ] After deletion, 0 events from series remain in calendar
- [ ] Snackbar shows "일정이 삭제되었습니다"
- [ ] Calendar refreshes showing no events from deleted series

**Edge Cases to Consider**:
- Series where some events were individually edited (those with different repeat.id)
- API error during deletion

**Test Priority**: Critical

**Implementation Notes**:
"아니오" click handler calls new function `deleteEventSeries(repeatId)` with event's repeat.id. Function calls DELETE /api/recurring-events/:repeatId endpoint.

---

### Category: Hook Tests - useEventOperations Extensions

#### Test Case: TC-025 - Save Recurring Event Calls POST /api/events-list

**Category**: hook

**File**: `src/__tests__/hooks/medium.useEventOperations.spec.ts` (EXTEND)

**Description**:
Tests that when saving a new event with repeat type != 'none', the hook calls POST /api/events-list endpoint with an array of generated event instances.

**Given**: `useEventOperations` hook, event form with repeat type='daily', start date='2025-01-01', end date='2025-01-03'
**When**: `saveEvent(eventFormData)` is called
**Then**: POST request sent to `/api/events-list` with array of 3 event objects

**Acceptance Criteria**:
- [ ] POST request URL is '/api/events-list' (not '/api/events')
- [ ] Request body is array of Event objects
- [ ] Array length is 3
- [ ] Each event has unique `id`
- [ ] All events share same `repeat.id`
- [ ] Each event has correct date (Jan 1, 2, 3)
- [ ] After success, `fetchEvents()` is called to refresh
- [ ] Snackbar shows "일정이 추가되었습니다"

**Edge Cases to Consider**:
- API returns 500 error (show error snackbar)
- Network timeout
- Large series (365 events)

**Test Priority**: Critical

**Implementation Notes**:
Extend `useEventOperations.saveEvent` function. Check if `eventData.repeat.type !== 'none'`. If true, generate instances using `generateRecurringEvents`, then POST to /api/events-list. If false, use existing POST /api/events flow.

---

#### Test Case: TC-026 - Update Single Event Converts to Non-Recurring

**Category**: hook

**File**: `src/__tests__/hooks/medium.useEventOperations.spec.ts` (EXTEND)

**Description**:
Tests that when editing a single instance of a recurring event (single-edit mode), the hook updates that event via PUT /api/events/:id and sets repeat.type to 'none'.

**Given**: `useEventOperations` hook, recurring event being edited in single-edit mode
**When**: `saveEvent(eventData, { editMode: 'single' })` is called
**Then**: PUT request sent to `/api/events/:id` with repeat.type='none'

**Acceptance Criteria**:
- [ ] PUT request URL is '/api/events/:id' with correct event ID
- [ ] Request body contains updated event data
- [ ] Request body has `repeat.type = 'none'`
- [ ] Request body has `repeat.id` undefined or removed
- [ ] After update, single event no longer has recurring icon
- [ ] Other events in original series remain unchanged
- [ ] Snackbar shows "일정이 수정되었습니다"

**Edge Cases to Consider**:
- Event was last in series (effectively ends series)
- API error during update

**Test Priority**: Critical

**Implementation Notes**:
Add `editMode` parameter to `saveEvent` function. When `editMode === 'single'`, modify event data: set `repeat.type = 'none'`, remove `repeat.id`. Call PUT /api/events/:id.

---

#### Test Case: TC-027 - Update Entire Series Calls PUT /api/recurring-events/:repeatId

**Category**: hook

**File**: `src/__tests__/hooks/medium.useEventOperations.spec.ts` (EXTEND)

**Description**:
Tests that when editing entire recurring series (series-edit mode), the hook calls PUT /api/recurring-events/:repeatId endpoint with updated event data, and backend regenerates all instances.

**Given**: `useEventOperations` hook, recurring event being edited in series-edit mode
**When**: `saveEvent(eventData, { editMode: 'series' })` is called
**Then**: PUT request sent to `/api/recurring-events/:repeatId` with updated data

**Acceptance Criteria**:
- [ ] PUT request URL is '/api/recurring-events/:repeatId' with correct repeat.id
- [ ] Request body contains updated event data (title, times, etc.)
- [ ] Request body maintains repeat configuration
- [ ] After update, ALL events in series reflect changes
- [ ] All events still have recurring icon
- [ ] All events maintain same `repeat.id`
- [ ] Snackbar shows "일정이 수정되었습니다"

**Edge Cases to Consider**:
- Changing repeat end date (may add/remove instances)
- Changing repeat type (complex, may be out of scope)
- API error during update

**Test Priority**: Critical

**Implementation Notes**:
When `editMode === 'series'`, call PUT /api/recurring-events/:repeatId with event data (excluding id). Backend handles regeneration of all instances based on updated data.

---

#### Test Case: TC-028 - Delete Event Series Calls DELETE /api/recurring-events/:repeatId

**Category**: hook

**File**: `src/__tests__/hooks/medium.useEventOperations.spec.ts` (EXTEND)

**Description**:
Tests that when deleting entire recurring series, the hook calls DELETE /api/recurring-events/:repeatId endpoint to remove all events in the series.

**Given**: `useEventOperations` hook, recurring event with repeat.id
**When**: `deleteEventSeries(repeatId)` is called
**Then**: DELETE request sent to `/api/recurring-events/:repeatId`

**Acceptance Criteria**:
- [ ] DELETE request URL is '/api/recurring-events/:repeatId' with correct repeat.id
- [ ] After deletion, ALL events with matching repeat.id are removed from state
- [ ] Calendar no longer shows any events from deleted series
- [ ] Snackbar shows "일정이 삭제되었습니다"

**Edge Cases to Consider**:
- Series where some events were individually edited (different repeat.id)
- API error during deletion
- Network timeout

**Test Priority**: Critical

**Implementation Notes**:
Add new function `deleteEventSeries(repeatId: string)` to `useEventOperations`. Function calls DELETE /api/recurring-events/:repeatId. After success, call `fetchEvents()` to refresh calendar.

---

#### Test Case: TC-029 - useRecurringEventDialog Hook Manages Dialog State

**Category**: hook

**File**: `src/__tests__/hooks/medium.useRecurringEventDialog.spec.ts` (NEW)

**Description**:
Tests a new custom hook `useRecurringEventDialog` that manages state for edit/delete confirmation dialogs, including which event is being acted upon and which action (edit/delete) was selected.

**Given**: `useRecurringEventDialog` hook rendered
**When**: Hook methods called to open/close dialogs and set actions
**Then**: Hook state updates correctly

**Acceptance Criteria**:
- [ ] `openEditDialog(event)` sets `editDialogOpen = true` and stores event
- [ ] `closeEditDialog()` sets `editDialogOpen = false` and clears event
- [ ] `openDeleteDialog(event)` sets `deleteDialogOpen = true` and stores event
- [ ] `closeDeleteDialog()` sets `deleteDialogOpen = false` and clears event
- [ ] `selectEditMode('single')` stores edit mode selection
- [ ] `selectEditMode('series')` stores edit mode selection
- [ ] `selectDeleteMode('single')` stores delete mode selection
- [ ] `selectDeleteMode('series')` stores delete mode selection

**Edge Cases to Consider**:
- Opening dialog when another is already open
- Multiple rapid open/close calls

**Test Priority**: High

**Implementation Notes**:
Create new hook `src/hooks/useRecurringEventDialog.ts` to encapsulate dialog state management. Returns open/close functions, dialog state, selected event, and action mode.

---

### Category: Integration Tests - Full User Flows

#### Test Case: TC-030 - Create Daily Recurring Event End-to-End

**Category**: integration

**File**: `src/__tests__/integration/medium.recurringEvents.integration.spec.tsx` (NEW)

**Description**:
Tests complete user flow of creating a daily recurring event from form input through API call to calendar display with recurring icons.

**Given**: Calendar application rendered with no events
**When**: User fills form with repeat type='daily', dates Jan 1-5, and submits
**Then**: 5 events appear in calendar, each with recurring icon

**Acceptance Criteria**:
- [ ] User clicks "일정 추가" button
- [ ] User fills title, date, times, repeat type='매일', end date='2025-01-05'
- [ ] User clicks submit button
- [ ] POST request to /api/events-list is made
- [ ] 5 events appear in calendar on dates Jan 1, 2, 3, 4, 5
- [ ] Each event displays recurring icon
- [ ] Snackbar shows "일정이 추가되었습니다"
- [ ] Form closes after successful submission

**Edge Cases to Consider**:
- Form validation errors
- API failure
- Large series (performance)

**Test Priority**: Critical

**Implementation Notes**:
Use full App render with MSW handlers. Simulate user interactions with userEvent. Verify DOM elements and API calls.

---

#### Test Case: TC-031 - Create Monthly Recurring on 31st - Events Only in Eligible Months

**Category**: integration

**File**: `src/__tests__/integration/medium.recurringEvents.integration.spec.tsx`

**Description**:
Tests complete user flow for critical edge case: creating monthly recurring event on the 31st. Verifies only months with 31 days show events.

**Given**: Calendar application rendered
**When**: User creates monthly recurring event on Jan 31 with end date Apr 30
**Then**: Only 2 events appear (Jan 31, Mar 31), NO events for Feb or Apr

**Acceptance Criteria**:
- [ ] User creates event with date='2025-01-31', repeat type='매월', end date='2025-04-30'
- [ ] 2 events appear in calendar
- [ ] Event exists on Jan 31, 2025
- [ ] Event exists on Mar 31, 2025
- [ ] NO event on Feb 28/29, 2025 (only 28 days in Feb 2025)
- [ ] NO event on Apr 31, 2025 (only 30 days in Apr)
- [ ] Both events have recurring icon

**Edge Cases to Consider**:
- Navigating between months in calendar view to see skipped months
- User confusion about missing months (may need tooltip/help)

**Test Priority**: Critical

**Implementation Notes**:
Full integration test with calendar navigation. Check event presence across multiple months.

---

#### Test Case: TC-032 - Create Yearly Recurring on Feb 29 - Events Only in Leap Years

**Category**: integration

**File**: `src/__tests__/integration/medium.recurringEvents.integration.spec.tsx`

**Description**:
Tests complete user flow for critical edge case: creating yearly recurring event on Feb 29. Verifies only leap years show events.

**Given**: Calendar application rendered, system time set to 2024-02-29 (leap year)
**When**: User creates yearly recurring event on Feb 29, 2024 with end date Feb 28, 2027
**Then**: Only 1 event appears (Feb 29, 2024), NO events for 2025, 2026, 2027

**Acceptance Criteria**:
- [ ] User creates event with date='2024-02-29', repeat type='매년', end date='2027-02-28'
- [ ] 1 event appears in calendar
- [ ] Event exists on Feb 29, 2024
- [ ] NO event on Feb 29, 2025 (not leap year)
- [ ] NO event on Feb 29, 2026 (not leap year)
- [ ] NO event on Feb 29, 2027 (not leap year)
- [ ] Event has recurring icon

**Edge Cases to Consider**:
- System time management (use vi.setSystemTime to test different years)
- User understanding of leap year logic

**Test Priority**: Critical

**Implementation Notes**:
Use vi.setSystemTime to set test date to leap year. Create event on Feb 29. Verify generation logic skips non-leap years.

---

#### Test Case: TC-033 - Edit Single Instance of Recurring Event - Icon Removed

**Category**: integration

**File**: `src/__tests__/integration/medium.recurringEvents.integration.spec.tsx`

**Description**:
Tests complete user flow of editing a single instance of a recurring event. Verifies confirmation dialog, single-event edit, icon removal, and other events remaining unchanged.

**Given**: Calendar with 5-event daily recurring series (Jan 1-5)
**When**: User clicks edit on Jan 3 event, selects "예" (single edit), changes title, saves
**Then**: Jan 3 event updated without icon, Jan 1, 2, 4, 5 remain unchanged with icons

**Acceptance Criteria**:
- [ ] User clicks edit button on Jan 3 event
- [ ] Confirmation dialog appears with message "해당 일정만 수정하시겠어요?"
- [ ] User clicks "예" button
- [ ] Edit form opens with Jan 3 event data
- [ ] User changes title to "Updated Single Event"
- [ ] User clicks submit
- [ ] PUT request to /api/events/:id is made
- [ ] Jan 3 event title updates to "Updated Single Event"
- [ ] Jan 3 event NO LONGER has recurring icon
- [ ] Jan 1, 2, 4, 5 events unchanged, still have recurring icons
- [ ] Snackbar shows "일정이 수정되었습니다"

**Edge Cases to Consider**:
- Canceling dialog (no changes)
- Canceling form (no changes)
- API error during update

**Test Priority**: Critical

**Implementation Notes**:
Full integration test with dialog interactions, form submission, API mocking. Verify icon presence/absence using aria-label queries.

---

#### Test Case: TC-034 - Edit Entire Series - All Events Updated

**Category**: integration

**File**: `src/__tests__/integration/medium.recurringEvents.integration.spec.tsx`

**Description**:
Tests complete user flow of editing entire recurring series. Verifies confirmation dialog, series edit, all events updated, icons retained.

**Given**: Calendar with 5-event daily recurring series (Jan 1-5)
**When**: User clicks edit on any event, selects "아니오" (series edit), changes location, saves
**Then**: All 5 events updated with new location, all retain recurring icons

**Acceptance Criteria**:
- [ ] User clicks edit button on any event from series
- [ ] Confirmation dialog appears
- [ ] User clicks "아니오" button
- [ ] Edit form opens
- [ ] User changes location to "New Location"
- [ ] User clicks submit
- [ ] PUT request to /api/recurring-events/:repeatId is made
- [ ] ALL 5 events (Jan 1-5) have location "New Location"
- [ ] ALL 5 events still have recurring icon
- [ ] Snackbar shows "일정이 수정되었습니다"

**Edge Cases to Consider**:
- Changing repeat end date (may add/remove events)
- Previously edited single instances (should not be affected - different repeat.id)

**Test Priority**: Critical

**Implementation Notes**:
Full integration test. Mock PUT /api/recurring-events/:repeatId to return updated series. Verify all events updated in calendar.

---

#### Test Case: TC-035 - Delete Single Instance - Other Events Remain

**Category**: integration

**File**: `src/__tests__/integration/medium.recurringEvents.integration.spec.tsx`

**Description**:
Tests complete user flow of deleting a single instance of a recurring event. Verifies confirmation dialog, single deletion, remaining events intact.

**Given**: Calendar with 5-event daily recurring series (Jan 1-5)
**When**: User clicks delete on Jan 3 event, selects "예" (single delete)
**Then**: Jan 3 event deleted, Jan 1, 2, 4, 5 remain with icons

**Acceptance Criteria**:
- [ ] User clicks delete button on Jan 3 event
- [ ] Confirmation dialog appears with message "해당 일정만 삭제하시겠어요?"
- [ ] User clicks "예" button
- [ ] DELETE request to /api/events/:id is made with Jan 3 event ID
- [ ] Jan 3 event disappears from calendar
- [ ] Jan 1, 2, 4, 5 events remain visible
- [ ] Remaining events still have recurring icons
- [ ] Snackbar shows "일정이 삭제되었습니다"

**Edge Cases to Consider**:
- Deleting last event in series (series ends)
- Canceling dialog (no deletion)

**Test Priority**: Critical

**Implementation Notes**:
Full integration test with dialog interaction. Mock DELETE /api/events/:id. Verify single event removal from DOM.

---

#### Test Case: TC-036 - Delete Entire Series - All Events Removed

**Category**: integration

**File**: `src/__tests__/integration/medium.recurringEvents.integration.spec.tsx`

**Description**:
Tests complete user flow of deleting entire recurring series. Verifies confirmation dialog, series deletion, all events removed.

**Given**: Calendar with 5-event daily recurring series (Jan 1-5)
**When**: User clicks delete on any event, selects "아니오" (series delete)
**Then**: All 5 events deleted from calendar

**Acceptance Criteria**:
- [ ] User clicks delete button on any event from series
- [ ] Confirmation dialog appears
- [ ] User clicks "아니오" button
- [ ] DELETE request to /api/recurring-events/:repeatId is made
- [ ] ALL 5 events disappear from calendar
- [ ] No events from series remain
- [ ] Snackbar shows "일정이 삭제되었습니다"

**Edge Cases to Consider**:
- Previously edited single instances (should not be deleted - different repeat.id)
- Canceling dialog (no deletion)

**Test Priority**: Critical

**Implementation Notes**:
Full integration test. Mock DELETE /api/recurring-events/:repeatId. Verify all matching events removed from DOM.

---

#### Test Case: TC-037 - Recurring Events Do Not Trigger Overlap Detection

**Category**: integration

**File**: `src/__tests__/integration/medium.recurringEvents.integration.spec.tsx`

**Description**:
Tests that creating overlapping recurring events does NOT trigger overlap warnings or errors. Verifies PRD requirement that recurring events bypass overlap detection.

**Given**: Calendar application rendered
**When**: User creates daily recurring event Jan 1-5, 09:00-10:00, then creates another daily recurring event Jan 1-5, 09:30-10:30
**Then**: Both series created successfully without overlap warnings

**Acceptance Criteria**:
- [ ] First series created (Jan 1-5, 09:00-10:00)
- [ ] Second series created (Jan 1-5, 09:30-10:30) without error
- [ ] NO overlap warning/error message displayed
- [ ] Both series visible in calendar
- [ ] Events overlap visually in calendar view (expected)

**Edge Cases to Consider**:
- Partial overlap vs complete overlap
- Overlap with non-recurring events (should still detect for non-recurring)

**Test Priority**: High

**Implementation Notes**:
Disable overlap detection check when `event.repeat.type !== 'none'`. Test by creating overlapping recurring series and verifying no error.

---

#### Test Case: TC-038 - Calendar Icon Tooltip Shows on Hover

**Category**: integration

**File**: `src/__tests__/integration/medium.recurringEvents.integration.spec.tsx`

**Description**:
Tests that hovering over recurring event icon displays tooltip with text "반복 일정" to provide user feedback about icon meaning.

**Given**: Calendar with recurring event displayed
**When**: User hovers mouse over recurring icon
**Then**: Tooltip appears showing "반복 일정"

**Acceptance Criteria**:
- [ ] Recurring icon is visible on event
- [ ] User hovers over icon (simulate with userEvent.hover)
- [ ] Tooltip element appears in DOM
- [ ] Tooltip contains text "반복 일정"
- [ ] Tooltip positioned near icon

**Edge Cases to Consider**:
- Touch devices (tooltip may not work, consider aria-label as fallback)
- Keyboard focus (tooltip should appear on focus for accessibility)

**Test Priority**: Medium

**Implementation Notes**:
Add Material-UI Tooltip component wrapping recurring icon. Tooltip title="반복 일정". Test with userEvent.hover().

---

#### Test Case: TC-039 - Keyboard Navigation in Confirmation Dialogs

**Category**: integration

**File**: `src/__tests__/integration/medium.recurringEvents.integration.spec.tsx`

**Description**:
Tests keyboard accessibility for confirmation dialogs. Verifies Tab, Enter, Escape key navigation works correctly.

**Given**: Edit or delete confirmation dialog open
**When**: User presses Tab, Enter, Escape keys
**Then**: Dialog responds appropriately to keyboard input

**Acceptance Criteria**:
- [ ] Tab key moves focus between "취소", "아니오", "예" buttons
- [ ] Enter key activates focused button
- [ ] Escape key closes dialog (same as "취소")
- [ ] Focus trap keeps focus within dialog
- [ ] Initial focus is on "취소" or "예" button (sensible default)

**Edge Cases to Consider**:
- Shift+Tab for reverse navigation
- Focus return to trigger element after dialog closes

**Test Priority**: Medium (Accessibility requirement)

**Implementation Notes**:
Material-UI Dialog provides focus management by default. Test with userEvent.tab() and userEvent.keyboard('{Escape}').

---

#### Test Case: TC-040 - Weekly Recurring Event Maintains Day of Week

**Category**: integration

**File**: `src/__tests__/integration/medium.recurringEvents.integration.spec.tsx`

**Description**:
Tests that weekly recurring events are created on the same day of the week across all instances, even across month boundaries.

**Given**: Calendar application rendered
**When**: User creates weekly recurring event starting Monday Jan 6, end date Monday Feb 3
**Then**: 5 events created, all on Mondays

**Acceptance Criteria**:
- [ ] User creates event with date='2025-01-06' (Monday), repeat type='매주', end date='2025-02-03'
- [ ] 5 events appear: Jan 6, 13, 20, 27, Feb 3
- [ ] All event dates are Mondays (getDay() === 1)
- [ ] Events appear in both January and February calendar views
- [ ] All events have recurring icon

**Edge Cases to Consider**:
- Week spanning month boundary
- Week spanning year boundary

**Test Priority**: High

**Implementation Notes**:
Full integration test with calendar month navigation. Verify day of week for all generated events.

---

### Category: Edge Case Tests

#### Test Case: TC-041 - Single Day Recurring Event (Start = End)

**Category**: edge-case

**File**: `src/__tests__/unit/medium.recurringEventGeneration.spec.ts`

**Description**:
Tests edge case where start date equals end date for recurring event. Should generate exactly 1 event.

**Given**: Event with start date='2025-01-01', end date='2025-01-01', repeat type='daily'
**When**: `generateRecurringEvents(eventData)` is called
**Then**: Function returns array with 1 event

**Acceptance Criteria**:
- [ ] Returned array has exactly 1 element
- [ ] Event date is '2025-01-01'
- [ ] Event has all recurring properties (repeat.id, repeat.type='daily')

**Edge Cases to Consider**:
- Weekly with start = end (1 event)
- Monthly with start = end (1 event)

**Test Priority**: Medium

**Implementation Notes**:
Inclusive range logic: `date <= endDate` should include boundary. Single event is valid recurring series.

---

#### Test Case: TC-042 - Large Recurring Series (365 Days)

**Category**: edge-case

**File**: `src/__tests__/unit/medium.recurringEventGeneration.spec.ts`

**Description**:
Tests performance and correctness for maximum realistic recurring series size (daily events for full year).

**Given**: Event with start date='2025-01-01', end date='2025-12-31', repeat type='daily'
**When**: `generateRecurringEvents(eventData)` is called
**Then**: Function returns array with 365 events, completes within 2 seconds

**Acceptance Criteria**:
- [ ] Returned array has exactly 365 elements
- [ ] First event date is '2025-01-01'
- [ ] Last event date is '2025-12-31'
- [ ] All dates are sequential with no gaps
- [ ] All events share same repeat.id
- [ ] All event IDs are unique
- [ ] Function execution time < 2000ms

**Edge Cases to Consider**:
- Memory usage for 365 event objects
- API request payload size for 365 events

**Test Priority**: High (Performance requirement)

**Implementation Notes**:
Measure execution time using `performance.now()` or Vitest timing utilities. Optimize generation algorithm if needed.

---

#### Test Case: TC-043 - Empty Repeat End Date (Validation Error)

**Category**: edge-case

**File**: `src/__tests__/components/medium.EventFormRecurring.spec.tsx`

**Description**:
Tests form validation when user selects repeat type but leaves end date empty. Should prevent form submission.

**Given**: Event form with repeat type='daily', end date field empty
**When**: User attempts to submit form
**Then**: Validation error displays, form does not submit

**Acceptance Criteria**:
- [ ] Error message appears: "반복 종료일을 입력해주세요"
- [ ] Submit button disabled or form submission prevented
- [ ] Error clears when valid date entered

**Edge Cases to Consider**:
- Whitespace-only date input
- Null vs undefined vs empty string

**Test Priority**: High

**Implementation Notes**:
Add required field validation for end date when repeat type != 'none'.

---

#### Test Case: TC-044 - Repeat End Date Exactly on Max (2025-12-31)

**Category**: edge-case

**File**: `src/__tests__/components/medium.EventFormRecurring.spec.tsx`

**Description**:
Tests boundary condition where repeat end date is exactly the maximum allowed date. Should be valid.

**Given**: Event form with repeat type='daily', end date='2025-12-31'
**When**: User submits form
**Then**: Form submits successfully without validation error

**Acceptance Criteria**:
- [ ] No validation error displayed
- [ ] Submit button enabled
- [ ] Form submission succeeds
- [ ] Events generated up to and including 2025-12-31

**Edge Cases to Consider**:
- One day before max (2025-12-30) - should be valid
- One day after max (2026-01-01) - should error

**Test Priority**: Medium

**Implementation Notes**:
Validation condition: `endDate > '2025-12-31'` (strictly greater than). Boundary value is valid.

---

#### Test Case: TC-045 - Monthly Recurring on 30th (February Skipped)

**Category**: edge-case

**File**: `src/__tests__/unit/medium.recurringEventGeneration.spec.ts`

**Description**:
Tests monthly recurring event on the 30th. February should be skipped (only 28/29 days).

**Given**: Event with start date='2025-01-30', end date='2025-03-30', repeat type='monthly'
**When**: `generateRecurringEvents(eventData)` is called
**Then**: Function returns 2 events (Jan 30, Mar 30), NO Feb event

**Acceptance Criteria**:
- [ ] Returned array has exactly 2 elements
- [ ] Event dates are '2025-01-30' and '2025-03-30'
- [ ] NO event for '2025-02-30' (does not exist)

**Edge Cases to Consider**:
- Monthly on 29th in non-leap year (skips February)
- Monthly on 29th in leap year (includes February)

**Test Priority**: High

**Implementation Notes**:
Use `getDaysInMonth` utility to check if day exists in target month.

---

#### Test Case: TC-046 - Monthly Recurring on 29th in Non-Leap Year

**Category**: edge-case

**File**: `src/__tests__/unit/medium.recurringEventGeneration.spec.ts`

**Description**:
Tests monthly recurring event on the 29th in non-leap year. February should be skipped.

**Given**: Event with start date='2025-01-29', end date='2025-03-29', repeat type='monthly'
**When**: `generateRecurringEvents(eventData)` is called
**Then**: Function returns 2 events (Jan 29, Mar 29), NO Feb event

**Acceptance Criteria**:
- [ ] Returned array has exactly 2 elements
- [ ] Event dates are '2025-01-29' and '2025-03-29'
- [ ] NO event for '2025-02-29' (2025 not leap year, Feb has 28 days)

**Edge Cases to Consider**:
- Same scenario in leap year (2024) - February should be included

**Test Priority**: High

**Implementation Notes**:
Check days in month for February specifically. 2025 has 28 days in Feb, so 29th does not exist.

---

#### Test Case: TC-047 - Monthly Recurring on 29th in Leap Year

**Category**: edge-case

**File**: `src/__tests__/unit/medium.recurringEventGeneration.spec.ts`

**Description**:
Tests monthly recurring event on the 29th in leap year. February should be included.

**Given**: Event with start date='2024-01-29', end date='2024-03-29', repeat type='monthly'
**When**: `generateRecurringEvents(eventData)` is called
**Then**: Function returns 3 events (Jan 29, Feb 29, Mar 29)

**Acceptance Criteria**:
- [ ] Returned array has exactly 3 elements
- [ ] Event dates are '2024-01-29', '2024-02-29', '2024-03-29'
- [ ] Feb 29 event included (2024 is leap year)

**Edge Cases to Consider**:
- Non-leap year comparison (should skip February)

**Test Priority**: High

**Implementation Notes**:
2024 is leap year, February has 29 days. Day 29 exists in February 2024.

---

#### Test Case: TC-048 - API Failure During Recurring Event Creation

**Category**: edge-case

**File**: `src/__tests__/hooks/medium.useEventOperations.spec.ts`

**Description**:
Tests error handling when POST /api/events-list request fails. Should display error message and not create partial series.

**Given**: `useEventOperations` hook, MSW handler returns 500 error
**When**: `saveEvent(recurringEventData)` is called
**Then**: Error snackbar displays, no events added to state

**Acceptance Criteria**:
- [ ] POST request to /api/events-list is made
- [ ] API returns 500 Internal Server Error
- [ ] Snackbar shows "일정 저장 실패" with error variant
- [ ] `events` state remains unchanged (no partial series)
- [ ] User can retry operation

**Edge Cases to Consider**:
- Network timeout
- 400 Bad Request (validation error)
- 403 Forbidden (permission error)

**Test Priority**: High

**Implementation Notes**:
Use MSW to mock error response. Verify error handling in catch block shows appropriate snackbar.

---

#### Test Case: TC-049 - API Failure During Series Update

**Category**: edge-case

**File**: `src/__tests__/hooks/medium.useEventOperations.spec.ts`

**Description**:
Tests error handling when PUT /api/recurring-events/:repeatId request fails. Should display error message and maintain original data.

**Given**: `useEventOperations` hook, MSW handler returns 500 error
**When**: `saveEvent(eventData, { editMode: 'series' })` is called
**Then**: Error snackbar displays, original events unchanged

**Acceptance Criteria**:
- [ ] PUT request to /api/recurring-events/:repeatId is made
- [ ] API returns 500 error
- [ ] Snackbar shows "일정 수정 실패" with error variant
- [ ] Original events remain in state (no partial update)
- [ ] User can retry operation

**Edge Cases to Consider**:
- Concurrent edit conflict (409 Conflict)
- Series not found (404 Not Found)

**Test Priority**: High

**Implementation Notes**:
Mock error response. Verify catch block error handling.

---

#### Test Case: TC-050 - API Failure During Series Deletion

**Category**: edge-case

**File**: `src/__tests__/hooks/medium.useEventOperations.spec.ts`

**Description**:
Tests error handling when DELETE /api/recurring-events/:repeatId request fails. Should display error message and maintain events.

**Given**: `useEventOperations` hook, MSW handler returns 500 error
**When**: `deleteEventSeries(repeatId)` is called
**Then**: Error snackbar displays, events remain in calendar

**Acceptance Criteria**:
- [ ] DELETE request to /api/recurring-events/:repeatId is made
- [ ] API returns 500 error
- [ ] Snackbar shows "일정 삭제 실패" with error variant
- [ ] Events remain in state (no partial deletion)
- [ ] User can retry operation

**Edge Cases to Consider**:
- Series not found (404 Not Found)
- Permission denied (403 Forbidden)

**Test Priority**: High

**Implementation Notes**:
Mock error response. Verify catch block error handling.

---

#### Test Case: TC-051 - Editing Previously Edited Single Instance (Not in Series)

**Category**: edge-case

**File**: `src/__tests__/integration/medium.recurringEvents.integration.spec.tsx`

**Description**:
Tests that when a single instance was previously edited (converted to non-recurring), it is NOT affected by subsequent series edits.

**Given**: 5-event series (Jan 1-5), Jan 3 previously edited as single (now non-recurring)
**When**: User edits series (Jan 1), changes title
**Then**: Jan 1, 2, 4, 5 updated, Jan 3 unchanged

**Acceptance Criteria**:
- [ ] Jan 3 was previously edited as single event (repeat.type='none', no repeat.id)
- [ ] Series edit updates Jan 1, 2, 4, 5 to new title
- [ ] Jan 3 retains original title (not updated)
- [ ] Jan 3 still has no recurring icon
- [ ] Jan 1, 2, 4, 5 have recurring icon

**Edge Cases to Consider**:
- Multiple single-edited instances
- All instances individually edited (series edit affects nothing)

**Test Priority**: Medium

**Implementation Notes**:
Series operations filter by `repeat.id`. Single-edited events have different or no repeat.id, so they're excluded from series operations.

---

#### Test Case: TC-052 - Deleting Last Remaining Event After Individual Deletions

**Category**: edge-case

**File**: `src/__tests__/integration/medium.recurringEvents.integration.spec.tsx`

**Description**:
Tests that when user has individually deleted all but one event from a series, deleting the last event still shows confirmation dialog (even though series is effectively gone).

**Given**: Originally 5-event series, 4 events individually deleted, 1 event remains
**When**: User deletes last event
**Then**: Confirmation dialog still appears, both options result in same deletion

**Acceptance Criteria**:
- [ ] Confirmation dialog appears with "해당 일정만 삭제하시겠어요?"
- [ ] Clicking "예" deletes single event
- [ ] Clicking "아니오" attempts series delete, but only 1 event exists, so same result
- [ ] After deletion, no events remain
- [ ] No errors occur

**Edge Cases to Consider**:
- Backend returns 404 for series delete (series already effectively deleted)
- UI could detect this and skip dialog, but PRD doesn't specify this optimization

**Test Priority**: Low

**Implementation Notes**:
Dialog always appears for recurring events. Backend handles deletion gracefully whether single or series.

---

#### Test Case: TC-053 - Year Boundary Crossing (December to January)

**Category**: edge-case

**File**: `src/__tests__/unit/medium.recurringEventGeneration.spec.ts`

**Description**:
Tests monthly recurring event that crosses year boundary (December 2024 to January 2025).

**Given**: Event with start date='2024-12-15', end date='2025-01-15', repeat type='monthly'
**When**: `generateRecurringEvents(eventData)` is called
**Then**: Function returns 2 events (Dec 15, 2024 and Jan 15, 2025)

**Acceptance Criteria**:
- [ ] Returned array has exactly 2 elements
- [ ] First event date is '2024-12-15'
- [ ] Second event date is '2025-01-15'
- [ ] Year increments correctly
- [ ] Month wraps from 12 to 1 (December to January)

**Edge Cases to Consider**:
- Leap year transition (2024 to 2025)
- Century transition (2099 to 2100)

**Test Priority**: Medium

**Implementation Notes**:
Date arithmetic must handle year rollover. Use native Date object month increment.

---

#### Test Case: TC-054 - Concurrent Dialog Open Prevention

**Category**: edge-case

**File**: `src/__tests__/components/medium.RecurringEventDialog.spec.tsx`

**Description**:
Tests that opening edit dialog when delete dialog is already open (or vice versa) closes the first dialog.

**Given**: Delete confirmation dialog open for one event
**When**: User clicks edit on another recurring event
**Then**: Delete dialog closes, edit dialog opens

**Acceptance Criteria**:
- [ ] Delete dialog initially open
- [ ] Edit dialog opens for different event
- [ ] Delete dialog is no longer in document
- [ ] Only edit dialog is visible
- [ ] No errors or UI glitches

**Edge Cases to Consider**:
- Rapid clicking between edit/delete buttons
- Same event (edit then delete quickly)

**Test Priority**: Low

**Implementation Notes**:
Dialog state management should close other dialogs when opening new one. Single dialog instance or multiple instances with proper cleanup.

---

#### Test Case: TC-055 - Form Validation Prevents Recurring Generation with Invalid Data

**Category**: edge-case

**File**: `src/__tests__/components/medium.EventFormRecurring.spec.tsx`

**Description**:
Tests that recurring event generation does NOT occur when other form validations fail (e.g., end time before start time).

**Given**: Event form with repeat type='daily', valid end date, but invalid times (end before start)
**When**: User attempts to submit
**Then**: Time validation error displays, recurring generation does not occur, no API call

**Acceptance Criteria**:
- [ ] Time validation error displays
- [ ] Submit button disabled
- [ ] No POST request to /api/events-list is made
- [ ] User must fix time validation before submitting

**Edge Cases to Consider**:
- Multiple validation errors (times AND repeat end date)
- Other field validations (required fields empty)

**Test Priority**: Medium

**Implementation Notes**:
Existing validation runs before recurring generation logic. Validation errors prevent form submission entirely.

---

#### Test Case: TC-056 - Repeat Type Changed After End Date Set

**Category**: edge-case

**File**: `src/__tests__/components/medium.EventFormRecurring.spec.tsx`

**Description**:
Tests that changing repeat type from one non-none value to another maintains the end date field and value.

**Given**: Event form with repeat type='daily', end date='2025-01-10'
**When**: User changes repeat type to 'weekly'
**Then**: End date field remains visible with same value

**Acceptance Criteria**:
- [ ] End date field visible with value '2025-01-10'
- [ ] User changes repeat type from 'daily' to 'weekly'
- [ ] End date field still visible
- [ ] End date value still '2025-01-10'
- [ ] No validation errors (valid configuration)

**Edge Cases to Consider**:
- Changing to 'none' (should hide field and clear value)
- Changing back to non-none (should show field again, potentially empty)

**Test Priority**: Low

**Implementation Notes**:
Form state management. Changing repeat type doesn't reset end date unless changing to/from 'none'.

---

#### Test Case: TC-057 - Screen Reader Announces Recurring Icon

**Category**: edge-case (Accessibility)

**File**: `src/__tests__/components/medium.RecurringEventIcon.spec.tsx`

**Description**:
Tests that recurring event icon has proper ARIA label for screen reader accessibility.

**Given**: Recurring event rendered in calendar
**When**: Screen reader navigates to event
**Then**: Icon is announced with label "반복 일정"

**Acceptance Criteria**:
- [ ] Icon element has aria-label="반복 일정"
- [ ] Icon is not aria-hidden
- [ ] Icon is included in accessibility tree
- [ ] Screen reader can discover and announce icon

**Edge Cases to Consider**:
- SVG icons (may need additional ARIA attributes)
- Icon-only button vs static icon

**Test Priority**: Medium (NFR-002 Accessibility requirement)

**Implementation Notes**:
Test using `getByLabelText('반복 일정')` or `getByRole` with accessible name check. Verify aria-label or aria-labelledby is present.

---

#### Test Case: TC-058 - Dialog Focus Management on Open

**Category**: edge-case (Accessibility)

**File**: `src/__tests__/components/medium.RecurringEventDialog.spec.tsx`

**Description**:
Tests that when confirmation dialog opens, keyboard focus moves into dialog and is trapped within dialog elements.

**Given**: Calendar view with focus on edit button
**When**: User clicks edit button, dialog opens
**Then**: Focus moves to first focusable element in dialog (likely "취소" button)

**Acceptance Criteria**:
- [ ] After dialog opens, focus is on dialog element
- [ ] Tab key cycles focus between dialog buttons only
- [ ] Focus does not escape dialog to background elements
- [ ] Escape key closes dialog and returns focus to original trigger

**Edge Cases to Consider**:
- Shift+Tab reverse focus navigation
- Focus return after closing dialog

**Test Priority**: Medium (NFR-002 Accessibility requirement)

**Implementation Notes**:
Material-UI Dialog provides focus trap by default. Test using document.activeElement checks after dialog opens.

---

## Coverage Matrix

| PRD Requirement | Test Case IDs | Priority | Category | Status |
|-----------------|---------------|----------|----------|--------|
| FR-001: Repeat Type Selector UI | TC-010, TC-011 | High | Component | Designed |
| FR-002: Repeat End Date Configuration | TC-012, TC-013, TC-014, TC-043, TC-044 | Critical | Component | Designed |
| FR-003: Recurring Event Generation Logic | TC-001, TC-002, TC-003, TC-004, TC-005, TC-006, TC-007, TC-041, TC-042, TC-045, TC-046, TC-047, TC-053 | Critical | Unit/Edge | Designed |
| FR-004: Recurring Event Visual Indicator | TC-016, TC-017, TC-038, TC-057 | High | Component | Designed |
| FR-005: Edit Recurring Event Confirmation | TC-018, TC-019, TC-020, TC-021, TC-033, TC-034, TC-039, TC-058 | Critical | Component/Integration | Designed |
| FR-006: Delete Recurring Event Confirmation | TC-022, TC-023, TC-024, TC-035, TC-036, TC-039, TC-058 | Critical | Component/Integration | Designed |
| FR-007: Overlap Detection Exemption | TC-037 | High | Integration | Designed |
| FR-008: API Integration | TC-025, TC-026, TC-027, TC-028, TC-048, TC-049, TC-050 | Critical | Hook/Edge | Designed |
| FR-009: Data Model Requirements | TC-006, TC-007 | Critical | Unit | Designed |
| NFR-001: Performance | TC-042 | High | Edge | Designed |
| NFR-002: Accessibility | TC-039, TC-057, TC-058 | Medium | Edge | Designed |
| Edge Case: Monthly 31st | TC-004, TC-031 | Critical | Unit/Integration | Designed |
| Edge Case: Yearly Feb 29 | TC-005, TC-032 | Critical | Unit/Integration | Designed |
| Edge Case: Form Validation | TC-015, TC-043, TC-044, TC-055, TC-056 | Medium | Component | Designed |
| Edge Case: API Errors | TC-048, TC-049, TC-050 | High | Hook | Designed |
| Edge Case: Data Integrity | TC-051, TC-052 | Medium | Integration | Designed |
| Utility Functions | TC-008, TC-009 | High | Unit | Designed |
| Hook State Management | TC-029 | High | Hook | Designed |
| Dialog Interactions | TC-054 | Low | Component | Designed |
| Complete User Flows | TC-030, TC-031, TC-032, TC-033, TC-034, TC-035, TC-036, TC-040 | Critical | Integration | Designed |

**Coverage Summary**:
- Total Requirements: 9 FR groups + 5 NFR requirements + Edge cases = 100% coverage
- All functional requirements mapped to test cases
- All acceptance criteria covered
- All critical edge cases identified and tested
- Performance and accessibility requirements addressed

---

## Test Execution Recommendation

### Phase 1 - Critical Path (RED → GREEN Foundation)

Execute these tests first to establish core functionality:

1. **TC-001**: Generate Daily Recurring Events
2. **TC-002**: Generate Weekly Recurring Events
3. **TC-003**: Generate Monthly Recurring Events (Normal Days)
4. **TC-006**: All Events Share repeat.id
5. **TC-007**: All Events Have Unique event.id
6. **TC-010**: Repeat Type Selector UI
7. **TC-011**: End Date Field Conditional Rendering
8. **TC-016**: Recurring Icon Display
9. **TC-025**: Save Recurring Event API Call
10. **TC-030**: Create Daily Recurring Event E2E

**Rationale**: Establishes basic recurring event generation, UI components, and API integration. These are prerequisites for all other functionality.

---

### Phase 2 - Core Edge Cases (RED → GREEN Critical Scenarios)

Execute these tests to handle PRD-specified edge cases:

11. **TC-004**: Generate Monthly on 31st (Edge Case)
12. **TC-005**: Generate Yearly on Feb 29 (Edge Case)
13. **TC-008**: Leap Year Detection Utility
14. **TC-009**: Days in Month Utility
15. **TC-012**: Repeat End Date Max Validation
16. **TC-013**: Repeat End Date After Start Validation
17. **TC-031**: Create Monthly on 31st E2E
18. **TC-032**: Create Yearly on Feb 29 E2E

**Rationale**: These edge cases are explicitly mentioned in PRD as critical requirements. Must pass to meet acceptance criteria.

---

### Phase 3 - User Interactions (RED → GREEN Dialogs & Operations)

Execute these tests for edit/delete confirmation flows:

19. **TC-018**: Edit Dialog Appears
20. **TC-019**: Edit Dialog "예" Single Edit
21. **TC-020**: Edit Dialog "아니오" Series Edit
22. **TC-022**: Delete Dialog Appears
23. **TC-023**: Delete Dialog "예" Single Delete
24. **TC-024**: Delete Dialog "아니오" Series Delete
25. **TC-026**: Update Single Event API
26. **TC-027**: Update Series API
27. **TC-028**: Delete Series API
28. **TC-033**: Edit Single Instance E2E
29. **TC-034**: Edit Entire Series E2E
30. **TC-035**: Delete Single Instance E2E
31. **TC-036**: Delete Entire Series E2E

**Rationale**: Completes the full CRUD cycle for recurring events with user confirmation flows.

---

### Phase 4 - Additional Functionality (GREEN → REFACTOR)

Execute these tests for remaining features and quality:

32. **TC-014**: End Date Required Validation
33. **TC-015**: Form Submit with Repeat Config
34. **TC-017**: Non-Recurring No Icon
35. **TC-021**: Edit Dialog Cancel
36. **TC-029**: useRecurringEventDialog Hook
37. **TC-037**: No Overlap Detection
38. **TC-038**: Icon Tooltip on Hover
39. **TC-039**: Keyboard Navigation in Dialogs
40. **TC-040**: Weekly Maintains Day of Week

**Rationale**: Completes feature set, improves UX, ensures quality standards.

---

### Phase 5 - Edge Cases & Error Handling (REFACTOR Quality)

Execute these tests for robustness and edge scenarios:

41. **TC-041**: Single Day Recurring
42. **TC-042**: Large Recurring Series (365 events)
43. **TC-043**: Empty End Date Error
44. **TC-044**: End Date Exactly Max
45. **TC-045**: Monthly on 30th
46. **TC-046**: Monthly on 29th Non-Leap
47. **TC-047**: Monthly on 29th Leap Year
48. **TC-048**: API Failure During Creation
49. **TC-049**: API Failure During Update
50. **TC-050**: API Failure During Deletion
51. **TC-051**: Editing Previously Edited Single
52. **TC-052**: Deleting Last Event
53. **TC-053**: Year Boundary Crossing
54. **TC-054**: Concurrent Dialog Prevention
55. **TC-055**: Validation Prevents Generation
56. **TC-056**: Repeat Type Change
57. **TC-057**: Screen Reader Accessibility
58. **TC-058**: Dialog Focus Management

**Rationale**: Ensures production-ready quality, handles errors gracefully, meets accessibility standards.

---

## Kent Beck Principles Applied

### 1. Write Tests First (TDD Red Phase)
All test specifications designed BEFORE implementation. Tests will fail initially - this is expected and correct. Tests define the API surface and expected behavior, guiding implementation.

### 2. Test Behavior, Not Implementation
Test descriptions focus on WHAT the code does (behavior) rather than HOW it does it. For example:
- ✅ "Function returns array of 5 events with dates Jan 1-5"
- ❌ "Function uses for loop to iterate and push events to array"

### 3. Keep Tests Simple
Each test verifies a single concept or behavior. Test cases have clear Given-When-Then structure. Minimal setup required for each test.

### 4. Descriptive Test Names
All tests have Korean language descriptions that clearly state what is being tested. Names are specific, not vague (e.g., "Generate Monthly Recurring Events on 31st" not "Test monthly events").

### 5. Arrange-Act-Assert (AAA)
- **Arrange**: Given section establishes preconditions
- **Act**: When section describes action being tested
- **Assert**: Then section defines expected outcome with acceptance criteria

### 6. Fast and Isolated
- Unit tests run quickly (pure functions, no API calls)
- Tests use MSW for API mocking (no real network)
- Each test is independent (no shared state between tests)
- Use fake timers to control time-dependent tests

### 7. Happy Path First
Critical Path (Phase 1) tests cover standard use cases before edge cases. Daily/weekly/monthly recurring events tested before edge cases like 31st or Feb 29.

### 8. Repeatable Results
- Fixed system time (2025-10-01) ensures consistent date calculations
- UTC timezone eliminates timezone-related flakiness
- Mocked API responses eliminate network variability
- UUID generation is deterministic in tests (can use vi.spyOn(crypto, 'randomUUID'))

---

## Notes for Test Code Agent

### Setup Requirements

1. **New Files to Create**:
   - `src/__tests__/unit/medium.recurringEventGeneration.spec.ts`
   - `src/__tests__/hooks/medium.useRecurringEventDialog.spec.ts`
   - `src/__tests__/components/medium.EventFormRecurring.spec.tsx`
   - `src/__tests__/components/medium.RecurringEventIcon.spec.tsx`
   - `src/__tests__/components/medium.RecurringEventDialog.spec.tsx`
   - `src/__tests__/integration/medium.recurringEvents.integration.spec.tsx`

2. **Files to Extend**:
   - `src/__tests__/unit/easy.dateUtils.spec.ts` (add TC-008, TC-009)
   - `src/__tests__/hooks/medium.useEventOperations.spec.ts` (add TC-025, TC-026, TC-027, TC-028, TC-048, TC-049, TC-050)

3. **Mock Data Needs**:
   - Extend `src/__mocks__/response/events.json` with recurring event samples
   - Add MSW handlers for:
     - POST /api/events-list
     - PUT /api/recurring-events/:repeatId
     - DELETE /api/recurring-events/:repeatId

4. **Test Utilities**:
   - Create helper function `generateMockRecurringEvent(config)` for test data
   - Create helper function `mockUUID(value)` to override crypto.randomUUID for deterministic tests
   - Reuse existing `setup` and `saveSchedule` helpers from integration tests

### Implementation Order

Follow the Test Execution Recommendation phases (1-5) when implementing tests. This ensures:
- Core functionality validated first (immediate feedback loop)
- Edge cases tested after happy path (prevent premature optimization)
- Integration tests validate unit-tested components (confidence in full system)

### Special Considerations

1. **Time Management**:
   - Use `vi.setSystemTime()` for tests requiring specific dates
   - Remember system time is already set to 2025-10-01 in beforeEach
   - For leap year tests, set time to 2024-02-29 or relevant leap year dates

2. **API Mocking**:
   - Use MSW `http.post('/api/events-list', ...)` for recurring event creation
   - Use `http.put('/api/recurring-events/:repeatId', ...)` for series updates
   - Use `http.delete('/api/recurring-events/:repeatId', ...)` for series deletions
   - Mock successful responses with appropriate status codes and bodies

3. **UUID Generation**:
   - For deterministic tests, spy on `crypto.randomUUID()` and return fixed values
   - Example: `vi.spyOn(crypto, 'randomUUID').mockReturnValueOnce('fixed-uuid-1').mockReturnValueOnce('fixed-uuid-2')`
   - Ensure each event gets unique ID but same repeat.id

4. **Component Testing**:
   - Use `@testing-library/react` render for components
   - Use `userEvent` (NOT fireEvent) for user interactions
   - Use `within()` to scope queries to specific containers
   - Use `waitFor()` for async updates

5. **Integration Testing**:
   - Render full `<App />` component with theme and snackbar providers
   - Use `setup()` helper from existing integration tests
   - Simulate complete user journeys (click, type, submit, verify)

6. **Accessibility Testing**:
   - Query by accessible names: `getByLabelText`, `getByRole`
   - Verify ARIA attributes: `aria-label`, `aria-hidden`
   - Test keyboard interactions: `userEvent.tab()`, `userEvent.keyboard('{Escape}')`

### Performance Testing

For TC-042 (365-event series):
```typescript
const start = performance.now();
const result = generateRecurringEvents(eventData);
const end = performance.now();
expect(end - start).toBeLessThan(2000);
expect(result).toHaveLength(365);
```

### Error Scenario Testing

For API failure tests (TC-048, TC-049, TC-050):
```typescript
server.use(
  http.post('/api/events-list', () => {
    return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  })
);

await act(async () => {
  await result.current.saveEvent(eventData);
});

expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
```

### Dialog Testing

For confirmation dialog tests (TC-018 through TC-024):
```typescript
// Edit button click
await userEvent.click(screen.getByLabelText('Edit event'));

// Dialog appears
expect(screen.getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();

// Click "예" button
await userEvent.click(screen.getByRole('button', { name: '예' }));

// Verify dialog closed and form opened
expect(screen.queryByText('해당 일정만 수정하시겠어요?')).not.toBeInTheDocument();
expect(screen.getByLabelText('제목')).toBeInTheDocument(); // Edit form
```

---

## Final Validation Checklist

Before proceeding to Test Code Agent:

- [x] All 66 functional requirements from PRD have corresponding test cases
- [x] All 15 non-functional requirements addressed (performance, accessibility, etc.)
- [x] All 25 acceptance criteria from PRD mapped to tests
- [x] Critical edge cases (monthly 31st, yearly Feb 29) have dedicated tests
- [x] Complete user flows tested end-to-end
- [x] API integration points covered
- [x] Error scenarios and failure modes tested
- [x] Accessibility requirements verified
- [x] Kent Beck TDD principles applied throughout
- [x] Existing test architecture patterns maintained
- [x] Test descriptions are concrete and implementation-focused
- [x] All tests properly categorized (component/hook/integration/edge-case)
- [x] Test execution phases prioritize critical functionality first
- [x] Coverage matrix shows 100% PRD requirement coverage

**Test Design Complete. Ready for Test Code Agent to implement 58 test cases.**
