# TDD-CYCLE-1: Recurring Event Functionality - Requirements

**Feature ID**: TDD-CYCLE-1
**Created**: 2025-11-01
**Depth**: Standard

---

## 1. Product Goals (OKRs + KPIs)

### Objective
Enable users to create, manage, and visualize recurring events with automatic instance generation and flexible modification options.

### Key Results

**KR1**: Reduce repetitive event creation time by 90%
- Current: Users manually create 13 events for a quarterly weekly meeting (10-15 minutes)
- Target: Single creation flow for recurring patterns (<2 minutes)
- Timeline: By TDD-CYCLE-1 completion

**KR2**: Support 4 recurrence patterns with edge case handling
- Daily, weekly, monthly, yearly recurrence types
- 100% accuracy for edge cases (monthly 31st, yearly Feb 29)
- Timeline: By TDD-CYCLE-1 completion

**KR3**: Enable granular instance control without data loss
- Users can modify/delete single instances or entire series
- 0% data corruption in instance operations
- Timeline: By TDD-CYCLE-1 completion

### Primary KPIs

**User Efficiency**
- Metric: Time to create recurring event
- Current: N/A (not supported)
- Target: <2 minutes for any recurrence pattern
- Measurement: User testing with 5 common scenarios

**Feature Adoption**
- Metric: % of events created with recurrence
- Baseline: 0% (feature doesn't exist)
- Target: 25% of all events within first month
- Measurement: Event creation analytics

**Data Accuracy**
- Metric: Edge case correctness rate
- Target: 100% for monthly 31st and yearly Feb 29 scenarios
- Measurement: Automated unit tests (12 edge case tests minimum)

**Performance**
- Metric: Calendar view render time with recurring events
- Target: <100ms for month view with 20 recurring series
- Measurement: Performance benchmarks in integration tests

---

## 2. User Stories

### Story #1: Selecting Recurring Event Type

**As a** calendar user
**I want** to select a recurrence pattern when creating or editing an event
**So that** I don't have to manually create repetitive events

**Priority**: P0 (Must Have)
**Effort**: Medium (3-5 days)
**Value**: Core functionality - enables entire recurring event feature

**Acceptance Criteria**: See Section 3.1

---

### Story #2: Viewing Recurring Events with Visual Indicators

**As a** calendar user
**I want** to see recurring events distinguished from one-time events with icons
**So that** I can quickly identify which events are part of a series

**Priority**: P0 (Must Have)
**Effort**: Small (1-2 days)
**Value**: Critical for user understanding of event types

**Acceptance Criteria**: See Section 3.2

---

### Story #3: Setting End Date for Recurring Events

**As a** calendar user
**I want** to specify when a recurring event series should stop
**So that** temporary recurring events (e.g., 8-week training course) don't repeat forever

**Priority**: P0 (Must Have)
**Effort**: Small (1-2 days)
**Value**: Essential for finite recurring patterns

**Acceptance Criteria**: See Section 3.3

---

### Story #4: Editing Single vs All Recurring Instances

**As a** calendar user
**I want** to choose whether to modify one instance or the entire series
**So that** I can reschedule a single occurrence without affecting others

**Priority**: P0 (Must Have)
**Effort**: Large (5-7 days)
**Value**: High - flexible modification is a core user expectation

**Acceptance Criteria**: See Section 3.4

---

### Story #5: Deleting Single vs All Recurring Instances

**As a** calendar user
**I want** to choose whether to delete one instance or the entire series
**So that** I can cancel a single occurrence without removing the whole pattern

**Priority**: P0 (Must Have)
**Effort**: Medium (3-5 days)
**Value**: High - granular control expected by users familiar with other calendar apps

**Acceptance Criteria**: See Section 3.5

---

### Story #6: Handling Monthly Edge Case (31st)

**As a** calendar user
**I want** monthly events created on the 31st to only appear on months with 31 days
**So that** the system behaves predictably and doesn't create events on wrong dates

**Priority**: P1 (Should Have)
**Effort**: Small (1 day)
**Value**: Medium - edge case handling for data accuracy

**Acceptance Criteria**: See Section 3.6

---

### Story #7: Handling Yearly Edge Case (Feb 29)

**As a** calendar user
**I want** yearly events created on Feb 29 to only appear in leap years
**So that** birthday reminders and anniversaries on leap days are accurate

**Priority**: P1 (Should Have)
**Effort**: Small (1 day)
**Value**: Medium - edge case handling for special dates

**Acceptance Criteria**: See Section 3.7

---

## 3. Acceptance Criteria (BDD Format)

### 3.1 Story #1: Selecting Recurring Event Type

**Scenario 1.1**: User selects daily recurrence
- **Given** I am creating a new event
- **When** I enable the repeat option and select "매일" (daily)
- **Then** the event should have `repeat.type = 'daily'`
- **And** the event should generate instances every 1 day from the start date

**Scenario 1.2**: User selects weekly recurrence
- **Given** I am creating a new event on a Wednesday
- **When** I enable the repeat option and select "매주" (weekly)
- **Then** the event should have `repeat.type = 'weekly'`
- **And** the event should generate instances every Wednesday

**Scenario 1.3**: User selects monthly recurrence
- **Given** I am creating a new event on the 15th of the month
- **When** I enable the repeat option and select "매월" (monthly)
- **Then** the event should have `repeat.type = 'monthly'`
- **And** the event should generate instances on the 15th of each month

**Scenario 1.4**: User selects yearly recurrence
- **Given** I am creating a new event on March 10
- **When** I enable the repeat option and select "매년" (yearly)
- **Then** the event should have `repeat.type = 'yearly'`
- **And** the event should generate instances every March 10

**Scenario 1.5**: User modifies existing event to add recurrence
- **Given** I have an existing one-time event
- **When** I edit the event and enable repeat with type "매주" (weekly)
- **Then** the event should be converted to a recurring series
- **And** future instances should be generated based on the new pattern

---

### 3.2 Story #2: Viewing Recurring Events with Visual Indicators

**Scenario 2.1**: Display recurring event icon in month view
- **Given** I have a weekly recurring event
- **When** I view the month calendar
- **Then** all instances of the recurring event should display a recurring icon
- **And** the icon should visually distinguish them from one-time events

**Scenario 2.2**: Display recurring event icon in week view
- **Given** I have a daily recurring event
- **When** I view the week calendar
- **Then** all instances of the recurring event should display a recurring icon

**Scenario 2.3**: No icon for one-time events
- **Given** I have a one-time event with `repeat.type = 'none'`
- **When** I view the calendar
- **Then** the event should NOT display a recurring icon

**Scenario 2.4**: No icon for modified single instance
- **Given** I have edited a single instance of a recurring event (converted to standalone)
- **When** I view the calendar
- **Then** the modified instance should NOT display a recurring icon
- **And** other unmodified instances should still show the recurring icon

---

### 3.3 Story #3: Setting End Date for Recurring Events

**Scenario 3.1**: Set end date when creating recurring event
- **Given** I am creating a weekly recurring event on 2025-01-01
- **When** I set the end date to 2025-02-28
- **Then** the event should have `repeat.endDate = '2025-02-28'`
- **And** instances should only be generated through 2025-02-28

**Scenario 3.2**: Maximum end date validation (2025-12-31)
- **Given** I am creating a recurring event
- **When** I attempt to set an end date after 2025-12-31
- **Then** the system should enforce a maximum end date of 2025-12-31
- **And** prevent setting dates beyond this limit

**Scenario 3.3**: No end date (ongoing series)
- **Given** I am creating a recurring event
- **When** I do not specify an end date
- **Then** the event should have `repeat.endDate = undefined`
- **And** instances should be generated up to 2025-12-31 (system maximum)

**Scenario 3.4**: End date before start date validation
- **Given** I am creating a recurring event starting 2025-06-01
- **When** I attempt to set an end date of 2025-05-01
- **Then** the system should show a validation error
- **And** prevent creating the event with an invalid end date

---

### 3.4 Story #4: Editing Single vs All Recurring Instances

**Scenario 4.1**: User chooses to edit only single instance
- **Given** I have a weekly recurring event series
- **When** I click to edit one instance on 2025-03-15
- **And** I see the modal with text "해당 일정만 수정하시겠어요?"
- **And** I click "예" (Yes)
- **And** I change the event title
- **Then** only the 2025-03-15 instance should be updated
- **And** the instance should be converted to a standalone event (not part of series)
- **And** the recurring icon should be removed from this instance
- **And** the instance should have `originalDate = '2025-03-15'` (reference to original series)
- **And** other instances in the series should remain unchanged

**Scenario 4.2**: User chooses to edit entire series
- **Given** I have a weekly recurring event series
- **When** I click to edit one instance
- **And** I see the modal with text "해당 일정만 수정하시겠어요?"
- **And** I click "아니오" (No)
- **And** I change the event title to "Updated Title"
- **Then** the series definition (master event with `isSeriesDefinition = true`) should be updated
- **And** all instances should reflect the new title
- **And** the recurring icon should remain on all instances

**Scenario 4.3**: Edit series preserves excluded dates
- **Given** I have a weekly series with one instance previously deleted (added to `excludedDates`)
- **When** I edit the entire series
- **Then** the `excludedDates` array should be preserved
- **And** the previously excluded instance should still not appear

**Scenario 4.4**: Modal not shown for one-time events
- **Given** I have a one-time event with `repeat.type = 'none'`
- **When** I click to edit the event
- **Then** I should NOT see the "해당 일정만 수정하시겠어요?" modal
- **And** the event should be edited directly

---

### 3.5 Story #5: Deleting Single vs All Recurring Instances

**Scenario 5.1**: User chooses to delete only single instance
- **Given** I have a weekly recurring event series
- **When** I click to delete one instance on 2025-03-22
- **And** I see the modal with text "해당 일정만 삭제하시겠어요?"
- **And** I click "예" (Yes)
- **Then** the date '2025-03-22' should be added to the series `excludedDates` array
- **And** the 2025-03-22 instance should no longer appear in the calendar
- **And** other instances should still be displayed with recurring icons

**Scenario 5.2**: User chooses to delete entire series
- **Given** I have a weekly recurring event series with 10 instances
- **When** I click to delete one instance
- **And** I see the modal with text "해당 일정만 삭제하시겠어요?"
- **And** I click "아니오" (No)
- **Then** the master series definition should be deleted
- **And** all instances should be removed from the calendar
- **And** no instances should appear in any calendar view

**Scenario 5.3**: Delete single instance multiple times
- **Given** I have a monthly recurring event
- **When** I delete individual instances on 2025-01-15, 2025-03-15, and 2025-05-15
- **Then** the `excludedDates` array should contain ['2025-01-15', '2025-03-15', '2025-05-15']
- **And** those three instances should not appear
- **And** all other instances should still be displayed

**Scenario 5.4**: Modal not shown for one-time events
- **Given** I have a one-time event with `repeat.type = 'none'`
- **When** I click to delete the event
- **Then** I should NOT see the "해당 일정만 삭제하시겠어요?" modal
- **And** the event should be deleted directly

---

### 3.6 Story #6: Handling Monthly Edge Case (31st)

**Scenario 6.1**: Monthly recurrence on 31st skips invalid months
- **Given** I create a monthly recurring event on 2025-01-31
- **When** the system generates instances for the series
- **Then** instances should be created on: Jan 31, Mar 31, May 31, Jul 31, Aug 31, Oct 31, Dec 31
- **And** instances should NOT be created in: Feb (28 days), Apr (30), Jun (30), Sep (30), Nov (30)

**Scenario 6.2**: Monthly recurrence on 30th
- **Given** I create a monthly recurring event on 2025-01-30
- **When** the system generates instances for the series
- **Then** instances should be created on the 30th of every month except February
- **And** no instance should be created on Feb 30 (invalid date)

**Scenario 6.3**: Monthly recurrence on valid day (15th)
- **Given** I create a monthly recurring event on 2025-01-15
- **When** the system generates instances for the series
- **Then** instances should be created on the 15th of every month
- **And** all 12 months should have instances (no skipping)

---

### 3.7 Story #7: Handling Yearly Edge Case (Feb 29)

**Scenario 7.1**: Yearly recurrence on Feb 29 only appears in leap years
- **Given** I create a yearly recurring event on 2024-02-29 (leap year)
- **When** the system generates instances through 2028
- **Then** instances should be created on: 2024-02-29, 2028-02-29
- **And** instances should NOT be created in: 2025-02-29, 2026-02-29, 2027-02-29 (non-leap years)

**Scenario 7.2**: Yearly recurrence on Feb 28 (non-leap day)
- **Given** I create a yearly recurring event on 2024-02-28
- **When** the system generates instances through 2028
- **Then** instances should be created every year: 2024-02-28, 2025-02-28, 2026-02-28, 2027-02-28, 2028-02-28
- **And** all instances should appear regardless of leap year status

**Scenario 7.3**: Yearly recurrence on Mar 1 (no edge case)
- **Given** I create a yearly recurring event on 2024-03-01
- **When** the system generates instances through 2028
- **Then** instances should be created every year on March 1
- **And** all instances should appear without skipping

---

## 4. Technical Considerations

### 4.1 Data Model

**Master Definition (stored in backend)**:
```typescript
{
  id: "evt-001",
  title: "Weekly Team Meeting",
  date: "2025-01-06",  // First occurrence
  repeat: {
    type: "weekly",
    interval: 1,
    endDate: "2025-12-31"
  },
  isSeriesDefinition: true,
  seriesId: "evt-001",  // Same as id for master
  excludedDates: ["2025-03-10", "2025-05-05"]  // Deleted instances
}
```

**Generated Instance (frontend only, not persisted)**:
```typescript
{
  id: "evt-001-instance-2025-01-13",  // Computed ID
  title: "Weekly Team Meeting",
  date: "2025-01-13",  // Generated date
  repeat: { type: "weekly", interval: 1, endDate: "2025-12-31" },
  seriesId: "evt-001",  // Links to master
  isSeriesDefinition: false
}
```

**Standalone Instance (edited from series, persisted)**:
```typescript
{
  id: "evt-002",  // New unique ID
  title: "Weekly Team Meeting (Rescheduled)",
  date: "2025-01-15",  // Modified date
  repeat: { type: "none", interval: 0 },  // No longer recurring
  originalDate: "2025-01-13",  // Reference to original series date
  seriesId: "evt-001"  // Optional: track which series it came from
}
```

### 4.2 Performance Constraints

- Generate instances only for visible date range (max 31 days for month view)
- Target: <100ms render time with 20 recurring series
- Use memoization to cache expanded instances until series or view changes

### 4.3 Backward Compatibility

- Existing events with `repeat.type = 'none'` must render without changes
- 0 regressions in existing event operation tests
- `isSeriesDefinition` defaults to `false` for one-time events

### 4.4 UI/UX Flow

**Edit Flow**:
1. User clicks edit on recurring instance
2. System shows modal: "해당 일정만 수정하시겠어요?" with "예" / "아니오" buttons
3. If "예": Create standalone event with `originalDate`, remove from series
4. If "아니오": Update master definition (all instances affected)

**Delete Flow**:
1. User clicks delete on recurring instance
2. System shows modal: "해당 일정만 삭제하시겠어요?" with "예" / "아니오" buttons
3. If "예": Add date to `excludedDates` array, hide instance
4. If "아니오": Delete master definition (all instances removed)

---

## 5. Success Metrics

**User Efficiency**:
- 90% reduction in time to create recurring patterns (10min → <2min)

**Edge Case Accuracy**:
- 100% correctness for monthly 31st scenarios (7 occurrences, 5 skipped months)
- 100% correctness for yearly Feb 29 scenarios (1 occurrence per 4 years)

**Performance**:
- <100ms render time for month view with 20 recurring series
- <50ms render time for week view with 10 recurring series

**Feature Adoption**:
- 25% of events created with recurrence within first month of release

**Data Integrity**:
- 0 data corruption cases in instance edit/delete operations
- 0 regressions in existing one-time event operations

---

## 6. Out of Scope (Future Enhancements)

**Won't Have in TDD-CYCLE-1**:
- Custom recurrence intervals (e.g., "every 2 weeks", "every 3 months")
- Advanced patterns (e.g., "second Tuesday of each month", "weekdays only")
- Bulk editing of multiple series
- Undo/redo for series operations
- Time zone handling for recurring events
- Conflict detection/resolution for recurring events

---

## 7. Dependencies

**Prerequisite**:
- Backend API must accept `isSeriesDefinition`, `seriesId`, `excludedDates` fields
- Verify `/api/events` POST/PUT endpoints support series definitions

**Parallel Development**:
- QA team creates manual test plan for 12 edge case scenarios
- Design team provides recurring icon asset (SVG)

**Blocking**:
- If backend doesn't support series: Frontend must expand to individual events before API calls (temporary workaround)

---

## 8. Handoff Summary (for Architect)

**Core Requirements**:
- Implement `generateRecurringEvents(masterEvent, rangeStart, rangeEnd)` utility with 4 repeat types (daily, weekly, monthly, yearly)
- Handle edge cases: monthly 31st (skip invalid months), yearly Feb 29 (leap years only)
- Support instance operations: edit single (create standalone), edit series (update master), delete single (excludedDates), delete series (remove master)

**Critical UX Decisions**:
- Modal prompts: "해당 일정만 수정하시겠어요?" for edits, "해당 일정만 삭제하시겠어요?" for deletes
- Visual indicators: Recurring icon on all instances except standalone edited events
- End date maximum: 2025-12-31 enforced in form validation

**Technical Considerations**:
- Performance target: <100ms month view render with 20 series (requires lazy expansion to visible range only)
- Data model: Master definitions persisted, instances generated on-demand, standalone edits persisted with `originalDate`
- Backend verification needed: Confirm API accepts `isSeriesDefinition`, `seriesId`, `excludedDates` before implementation
