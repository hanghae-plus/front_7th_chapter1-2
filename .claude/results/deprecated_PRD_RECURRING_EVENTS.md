# Recurring Events Feature - Product Requirements Document

## Document Metadata

- **Version**: 1.0.0
- **Date**: 2025-11-01
- **Author**: PRD Creator Agent
- **Status**: Draft

## 1. Overview

### Purpose

Enable users to create, edit, and delete recurring calendar events that automatically generate multiple event instances based on specified repetition patterns (daily, weekly, monthly, yearly) within a bounded time period.

### Value Proposition

- **Users benefit from**: Reduced manual effort when creating repeated events (e.g., weekly team meetings, monthly reviews, daily standup)
- **Business benefit**: Increased user engagement and calendar utility by supporting common real-world scheduling patterns
- **Time savings**: Users create one event definition instead of manually creating dozens or hundreds of individual events

### Scope

**Included:**
- Repeat type selection (daily, weekly, monthly, yearly) during event creation and editing
- Automatic generation of event instances based on repeat pattern and end date
- Visual indicators (icon) to identify recurring events in calendar view
- End date specification with maximum constraint of 2025-12-31
- Confirmation dialogs for editing recurring events (single vs. series)
- Confirmation dialogs for deleting recurring events (single vs. series)
- Special edge case handling for monthly 31st and yearly Feb 29 (leap day)
- Exemption from overlap detection for recurring events

**Excluded:**
- Custom repeat patterns (e.g., "every 2nd Tuesday")
- Infinite recurring events (no end date)
- Recurring event exceptions (excluding specific dates from series)
- Bi-weekly, quarterly, or other non-standard intervals
- Time zone handling for recurring events across DST transitions

### Success Metrics

- 100% of generated recurring event instances match expected dates based on repeat rules
- Zero instances created on invalid dates (e.g., Feb 31, Feb 28 for leap day events)
- 100% of single-instance edits successfully convert event to non-recurring
- 100% of series edits successfully update all instances
- 100% of single-instance deletes preserve other instances
- 100% of series deletes remove all instances
- Recurring event icon displays for 100% of recurring event instances
- 0% false positives for overlap detection on recurring events

## 2. User Stories

### US-001: Create Recurring Event (Must-have)

**As a** calendar user
**I want to** create an event with a repeat pattern
**So that** I don't have to manually create multiple instances of the same event

**Acceptance Criteria:**
- User can select repeat type from dropdown (daily, weekly, monthly, yearly)
- User must specify an end date for recurring events
- System generates all event instances automatically upon save
- All instances appear in calendar view with recurring icon

### US-002: Identify Recurring Events (Must-have)

**As a** calendar user
**I want to** visually identify which events are recurring
**So that** I know which events are part of a series

**Acceptance Criteria:**
- Recurring event instances display a distinctive icon
- Icon is visible in both month and week calendar views
- Icon distinguishes recurring events from one-time events

### US-003: Edit Single Recurring Event Instance (Must-have)

**As a** calendar user
**I want to** modify only one occurrence of a recurring event
**So that** I can make exceptions without affecting the entire series

**Acceptance Criteria:**
- Clicking edit on recurring event shows confirmation dialog
- Dialog asks: "해당 일정만 수정하시겠어요?" (Edit only this event?)
- Selecting "예" (Yes) allows editing single instance
- Edited instance becomes non-recurring (loses repeat icon)
- Other instances in series remain unchanged

### US-004: Edit Entire Recurring Event Series (Must-have)

**As a** calendar user
**I want to** modify all occurrences of a recurring event
**So that** I can update the entire series at once

**Acceptance Criteria:**
- Clicking edit on recurring event shows confirmation dialog
- Selecting "아니오" (No) allows editing entire series
- Changes apply to all instances in the series
- All instances maintain recurring icon
- All instances reflect updated information

### US-005: Delete Single Recurring Event Instance (Must-have)

**As a** calendar user
**I want to** delete only one occurrence of a recurring event
**So that** I can remove exceptions without canceling the entire series

**Acceptance Criteria:**
- Clicking delete on recurring event shows confirmation dialog
- Dialog asks: "해당 일정만 삭제하시겠어요?" (Delete only this event?)
- Selecting "예" (Yes) deletes only that instance
- Other instances in series remain unchanged

### US-006: Delete Entire Recurring Event Series (Must-have)

**As a** calendar user
**I want to** delete all occurrences of a recurring event
**So that** I can cancel a recurring meeting series

**Acceptance Criteria:**
- Clicking delete on recurring event shows confirmation dialog
- Selecting "아니오" (No) deletes entire series
- All instances are removed from calendar
- No orphaned instances remain

### US-007: Monthly 31st Edge Case (Must-have)

**As a** calendar user creating a monthly recurring event on the 31st
**I want to** see instances created only on the 31st of each month
**So that** the system respects my specific date requirement

**Acceptance Criteria:**
- Event created on Jan 31 with monthly repeat creates instances on: Jan 31, Mar 31, May 31, Jul 31, Aug 31, Oct 31, Dec 31
- No instances created in February, April, June, September, November (months without 31st)
- System does NOT create on last day of shorter months

### US-008: Leap Day Edge Case (Must-have)

**As a** calendar user creating a yearly recurring event on Feb 29
**I want to** see instances created only on Feb 29 in leap years
**So that** the system respects my specific date requirement

**Acceptance Criteria:**
- Event created on Feb 29, 2024 with yearly repeat creates instances only on Feb 29, 2028, 2032, etc.
- No instances created on Feb 28 in non-leap years
- System recognizes leap year rules correctly

### US-009: Overlap Exemption for Recurring Events (Should-have)

**As a** calendar user creating recurring events
**I want to** bypass overlap detection for recurring events
**So that** I can create recurring events without manual conflict resolution

**Acceptance Criteria:**
- Recurring events do NOT trigger overlap warnings
- Recurring events can be created even if they overlap with existing events
- Single-instance edits (that convert to non-recurring) MAY trigger overlap detection

## 3. Functional Requirements

### FR-001: Repeat Type Selection UI

- MUST display repeat type dropdown in event creation form
- MUST display repeat type dropdown in event editing form
- Dropdown options MUST include: "none", "daily", "weekly", "monthly", "yearly"
- Default value MUST be "none" for new events
- When repeat type is not "none", MUST display end date picker
- End date picker MUST be required when repeat type is not "none"
- End date picker MUST enforce maximum date of 2025-12-31
- MUST prevent form submission if repeat type is not "none" and end date is empty
- MUST prevent form submission if end date is after 2025-12-31

### FR-002: Recurring Event Generation

- MUST generate all event instances when repeat type is not "none"
- Each instance MUST have unique `id` (generated server-side using `randomUUID()`)
- All instances in series MUST share same `repeat.id` value
- Instance dates MUST follow selected repeat pattern:
  - **Daily**: Create instance for each day from start date to end date
  - **Weekly**: Create instance for same day of week each week from start date to end date
  - **Monthly**: Create instance for same day of month each month from start date to end date
  - **Yearly**: Create instance for same date each year from start date to end date
- MUST preserve all event properties across instances: title, startTime, endTime, description, location, category, notificationTime
- Each instance date field MUST be set to the calculated date for that instance
- MUST skip invalid dates according to edge case rules (FR-003, FR-004)

### FR-003: Monthly 31st Edge Case Handling

- When event date is 31st and repeat type is "monthly":
  - MUST create instances ONLY in months with 31 days
  - MUST skip months with fewer than 31 days (February, April, June, September, November)
  - MUST NOT create instance on last day of month if month has fewer than 31 days
- Valid months for 31st: January, March, May, July, August, October, December

### FR-004: Yearly Leap Day Edge Case Handling

- When event date is February 29 and repeat type is "yearly":
  - MUST create instances ONLY in leap years
  - MUST NOT create instance on February 28 in non-leap years
  - MUST use correct leap year calculation:
    - Year divisible by 4 is leap year
    - EXCEPT if year divisible by 100 (not leap year)
    - EXCEPT if year divisible by 400 (is leap year)
- Example leap years: 2024, 2028, 2032, 2400
- Example non-leap years: 2025, 2026, 2027, 2100

### FR-005: Recurring Event Visual Indicator

- MUST display recurring icon on all event instances where `repeat.type !== 'none'`
- Icon MUST be visible in month view calendar
- Icon MUST be visible in week view calendar
- Icon MUST be visible in event list view (if applicable)
- Icon MUST be distinguishable from non-recurring events
- Icon SHOULD use Material-UI icon component (consistency with existing UI)
- Recommended icon: `RepeatIcon` from `@mui/icons-material`

### FR-006: Edit Recurring Event - Confirmation Dialog

- When user clicks edit on event where `repeat.type !== 'none'`:
  - MUST display confirmation dialog BEFORE opening edit form
  - Dialog title MUST be: "반복 일정 수정" (Edit Recurring Event)
  - Dialog message MUST be: "해당 일정만 수정하시겠어요?" (Edit only this event?)
  - Dialog MUST have two buttons:
    - "예" (Yes) - Edit only this instance
    - "아니오" (No) - Edit entire series
  - MUST prevent edit form from opening until user makes selection
  - MUST close dialog after user selects option

### FR-007: Edit Single Instance (Convert to Non-Recurring)

- When user selects "예" (Yes) in edit confirmation dialog:
  - MUST open edit form pre-filled with selected instance data
  - MUST set `repeat.type` to "none" for this instance
  - MUST remove `repeat.id` from this instance (or set to new unique value)
  - On save, MUST send PUT request to `/api/events/:id` (single event update)
  - MUST NOT affect other instances in the series
  - Updated instance MUST NOT display recurring icon
  - Other instances MUST continue displaying recurring icon

### FR-008: Edit Entire Series

- When user selects "아니오" (No) in edit confirmation dialog:
  - MUST open edit form pre-filled with selected instance data
  - MUST preserve `repeat.type` and `repeat.id` values
  - On save, MUST send PUT request to `/api/recurring-events/:repeatId`
  - Backend MUST update all events with matching `repeat.id`
  - All instances MUST reflect updated information
  - All instances MUST maintain recurring icon
  - If repeat pattern changes (type or end date), MUST regenerate series

### FR-009: Delete Recurring Event - Confirmation Dialog

- When user clicks delete on event where `repeat.type !== 'none'`:
  - MUST display confirmation dialog BEFORE deleting
  - Dialog title MUST be: "반복 일정 삭제" (Delete Recurring Event)
  - Dialog message MUST be: "해당 일정만 삭제하시겠어요?" (Delete only this event?)
  - Dialog MUST have two buttons:
    - "예" (Yes) - Delete only this instance
    - "아니오" (No) - Delete entire series
  - MUST prevent deletion until user makes selection
  - MUST close dialog after user selects option

### FR-010: Delete Single Instance

- When user selects "예" (Yes) in delete confirmation dialog:
  - MUST send DELETE request to `/api/events/:id` (single event deletion)
  - MUST remove only the selected instance from database
  - MUST NOT affect other instances in the series
  - Deleted instance MUST disappear from calendar immediately
  - Other instances MUST remain visible with recurring icon

### FR-011: Delete Entire Series

- When user selects "아니오" (No) in delete confirmation dialog:
  - MUST send DELETE request to `/api/recurring-events/:repeatId`
  - Backend MUST delete all events with matching `repeat.id`
  - All instances MUST be removed from database
  - All instances MUST disappear from calendar immediately
  - MUST NOT leave orphaned instances

### FR-012: Overlap Detection Exemption

- Recurring events (where `repeat.type !== 'none'`) MUST bypass overlap detection
- MUST NOT show overlap warning when creating recurring events
- MUST NOT prevent recurring event creation due to overlapping times
- Single-instance edits that convert to non-recurring (FR-007) MAY re-enable overlap detection for that instance
- Non-recurring events MUST continue to check for overlaps with existing events (including recurring event instances)

### FR-013: Backend API - Create Recurring Events

- Endpoint: `POST /api/events-list`
- Request body: Array of Event objects (all instances)
- MUST generate unique `id` for each instance using `randomUUID()`
- MUST assign same `repeat.id` to all instances in series
- MUST validate all instances before persisting
- MUST persist all instances to `realEvents.json` (or `e2e.json` in test mode)
- Response: 200 OK with array of created events
- Error response: 400 Bad Request if validation fails

### FR-014: Backend API - Update Recurring Event Series

- Endpoint: `PUT /api/recurring-events/:repeatId`
- Request body: Updated event data (without id)
- MUST find all events with matching `repeat.id`
- MUST update all fields except `id` and `date` for each instance
- `date` field MUST remain unchanged (preserves instance-specific dates)
- MUST validate updated data before persisting
- Response: 200 OK with array of updated events
- Error response: 404 Not Found if no events with `repeatId` exist

### FR-015: Backend API - Delete Recurring Event Series

- Endpoint: `DELETE /api/recurring-events/:repeatId`
- MUST find all events with matching `repeat.id`
- MUST delete all matching events from database
- Response: 200 OK with success message
- Error response: 404 Not Found if no events with `repeatId` exist

## 4. Non-Functional Requirements

### NFR-001: Performance

- Event instance generation MUST complete within 2 seconds for up to 365 instances (daily for 1 year)
- Calendar view rendering MUST handle 1000+ recurring event instances without noticeable lag
- Edit confirmation dialog MUST appear within 500ms of clicking edit
- Delete confirmation dialog MUST appear within 500ms of clicking delete
- Series updates MUST complete within 3 seconds for up to 100 instances

### NFR-002: Data Integrity

- All instances in a recurring series MUST maintain referential integrity via `repeat.id`
- Single-instance edits MUST NOT orphan or corrupt series data
- Concurrent edits to different instances of same series MUST be handled safely
- Database operations MUST be atomic (all instances created/updated/deleted or none)

### NFR-003: Usability

- Repeat type dropdown MUST be clearly labeled: "반복" (Repeat)
- End date picker MUST show clear label: "반복 종료일" (Repeat End Date)
- Confirmation dialogs MUST use clear, unambiguous Korean text
- Recurring icon MUST be recognizable without requiring hover or explanation
- Error messages MUST clearly indicate why recurring event creation/edit failed

### NFR-004: Accessibility

- Repeat type dropdown MUST be keyboard navigable
- End date picker MUST be keyboard accessible
- Confirmation dialogs MUST be keyboard operable (Tab, Enter, Escape)
- Recurring icon MUST have aria-label: "반복 일정" (Recurring Event)
- Dialog buttons MUST have clear aria-labels

### NFR-005: Compatibility

- MUST work in Chrome, Firefox, Safari, Edge (latest versions)
- MUST work on desktop (1920x1080 and 1366x768)
- MUST work on tablet (iPad, 1024x768)
- Date calculations MUST respect UTC timezone as configured in tests
- Leap year calculations MUST work for years 2024-2100

### NFR-006: Maintainability

- Recurring event generation logic MUST be isolated in utility functions
- Date calculation logic MUST be unit testable
- Confirmation dialogs MUST be reusable components
- Edge case handling MUST be documented in code comments

## 5. User Interface Requirements

### UI-001: Event Form - Repeat Type Dropdown

**Location**: Event creation/edit form
**Component**: Material-UI Select component
**Label**: "반복" (Repeat)
**Options**:
- "안 함" (None) - value: "none"
- "매일" (Daily) - value: "daily"
- "매주" (Weekly) - value: "weekly"
- "매월" (Monthly) - value: "monthly"
- "매년" (Yearly) - value: "yearly"

**Behavior**:
- Default: "안 함" (none)
- When value changes from "none" to other, show end date picker
- When value changes to "none", hide end date picker

### UI-002: Event Form - End Date Picker

**Location**: Event creation/edit form (conditionally visible)
**Component**: Material-UI DatePicker
**Label**: "반복 종료일" (Repeat End Date)
**Constraints**:
- Required when repeat type is not "none"
- Minimum date: Event start date
- Maximum date: 2025-12-31
- Display format: YYYY-MM-DD

**Behavior**:
- Visible only when repeat type is not "none"
- Shows validation error if empty and repeat type is not "none"
- Shows validation error if date is after 2025-12-31

### UI-003: Calendar View - Recurring Event Icon

**Location**: Event display in month/week calendar views
**Component**: Material-UI RepeatIcon
**Placement**: Next to event title or in event badge
**Size**: 16px x 16px
**Color**: Inherit from theme (should contrast with event background)
**Aria-label**: "반복 일정" (Recurring Event)

**Behavior**:
- Display for all events where `repeat.type !== 'none'`
- Hide for events where `repeat.type === 'none'`
- Maintain visibility on hover and selected states

### UI-004: Edit Confirmation Dialog

**Component**: Material-UI Dialog
**Title**: "반복 일정 수정" (Edit Recurring Event)
**Message**: "해당 일정만 수정하시겠어요?" (Edit only this event?)
**Buttons**:
- "예" (Yes) - Primary button, calls single-instance edit handler
- "아니오" (No) - Secondary button, calls series edit handler
**Behavior**:
- Modal (blocks interaction with calendar)
- Keyboard accessible (Tab between buttons, Enter to confirm, Escape to cancel)
- Closes after button click
- Prevents edit form from opening until selection made

### UI-005: Delete Confirmation Dialog

**Component**: Material-UI Dialog
**Title**: "반복 일정 삭제" (Delete Recurring Event)
**Message**: "해당 일정만 삭제하시겠어요?" (Delete only this event?)
**Buttons**:
- "예" (Yes) - Danger button (red), calls single-instance delete handler
- "아니오" (No) - Secondary button, calls series delete handler
**Behavior**:
- Modal (blocks interaction with calendar)
- Keyboard accessible
- Closes after button click
- Prevents deletion until selection made

### UI-006: Error States

**Empty End Date Error**:
- Message: "반복 종료일을 선택해주세요" (Please select repeat end date)
- Display: Below end date picker in red text

**End Date Too Late Error**:
- Message: "반복 종료일은 2025-12-31 이전이어야 합니다" (Repeat end date must be before 2025-12-31)
- Display: Below end date picker in red text

**Server Error on Creation**:
- Message: "반복 일정 생성에 실패했습니다" (Failed to create recurring events)
- Display: Snackbar notification (notistack)

**Server Error on Update**:
- Message: "반복 일정 수정에 실패했습니다" (Failed to update recurring events)
- Display: Snackbar notification (notistack)

**Server Error on Delete**:
- Message: "반복 일정 삭제에 실패했습니다" (Failed to delete recurring events)
- Display: Snackbar notification (notistack)

### UI-007: Loading States

**During Recurring Event Creation**:
- Display loading spinner on save button
- Disable form inputs
- Message: "반복 일정 생성 중..." (Creating recurring events...)

**During Series Update**:
- Display loading spinner on save button
- Disable form inputs
- Message: "반복 일정 수정 중..." (Updating recurring events...)

**During Series Delete**:
- Display loading spinner in calendar
- Disable event interactions
- Message: "반복 일정 삭제 중..." (Deleting recurring events...)

## 6. Acceptance Criteria

### AC-001: Daily Recurring Event Creation

- [ ] User selects "매일" (daily) repeat type
- [ ] User sets end date to 2025-10-07 (7 days from start date 2025-10-01)
- [ ] System generates exactly 7 event instances (Oct 1-7)
- [ ] All instances display recurring icon
- [ ] All instances share same `repeat.id`
- [ ] Each instance has unique `id`

### AC-002: Weekly Recurring Event Creation

- [ ] User creates event on Wednesday, 2025-10-01
- [ ] User selects "매주" (weekly) repeat type
- [ ] User sets end date to 2025-10-29
- [ ] System generates instances on: Oct 1, 8, 15, 22, 29 (all Wednesdays)
- [ ] No instances created on non-Wednesday dates
- [ ] All instances display recurring icon

### AC-003: Monthly Recurring Event Creation

- [ ] User creates event on 2025-10-15 (15th of month)
- [ ] User selects "매월" (monthly) repeat type
- [ ] User sets end date to 2025-12-31
- [ ] System generates instances on: Oct 15, Nov 15, Dec 15
- [ ] All instances display recurring icon

### AC-004: Yearly Recurring Event Creation

- [ ] User creates event on 2025-10-01
- [ ] User selects "매년" (yearly) repeat type
- [ ] User sets end date to 2025-12-31
- [ ] System generates only 1 instance (Oct 1, 2025)
- [ ] No instance for 2026 (beyond end date)

### AC-005: Monthly 31st Edge Case

- [ ] User creates event on 2024-01-31
- [ ] User selects "매월" (monthly) repeat type
- [ ] User sets end date to 2024-12-31
- [ ] System generates instances on: Jan 31, Mar 31, May 31, Jul 31, Aug 31, Oct 31, Dec 31
- [ ] No instance for Feb, Apr, Jun, Sep, Nov (months without 31st)
- [ ] Exactly 7 instances created

### AC-006: Leap Day Edge Case

- [ ] User creates event on 2024-02-29
- [ ] User selects "매년" (yearly) repeat type
- [ ] User sets end date to 2030-12-31
- [ ] System generates instances on: Feb 29 2024, Feb 29 2028 (only leap years)
- [ ] No instance for 2025, 2026, 2027, 2029, 2030 (non-leap years)
- [ ] Exactly 2 instances created

### AC-007: End Date Validation

- [ ] User selects repeat type not "none"
- [ ] User attempts to save without end date
- [ ] System prevents submission
- [ ] Error message displayed: "반복 종료일을 선택해주세요"
- [ ] User sets end date to 2026-01-01
- [ ] System prevents submission
- [ ] Error message displayed: "반복 종료일은 2025-12-31 이전이어야 합니다"

### AC-008: Edit Single Instance

- [ ] User clicks edit on recurring event instance
- [ ] Confirmation dialog appears
- [ ] User selects "예" (Yes)
- [ ] Edit form opens with instance data
- [ ] User modifies title
- [ ] User saves
- [ ] Only selected instance updated
- [ ] Updated instance loses recurring icon
- [ ] Other instances unchanged, keep recurring icon

### AC-009: Edit Entire Series

- [ ] User clicks edit on recurring event instance
- [ ] Confirmation dialog appears
- [ ] User selects "아니오" (No)
- [ ] Edit form opens with instance data
- [ ] User modifies location
- [ ] User saves
- [ ] All instances in series updated with new location
- [ ] All instances maintain recurring icon
- [ ] All instances maintain original dates

### AC-010: Delete Single Instance

- [ ] User clicks delete on recurring event instance
- [ ] Confirmation dialog appears
- [ ] User selects "예" (Yes)
- [ ] Only selected instance deleted
- [ ] Other instances remain in calendar
- [ ] Other instances maintain recurring icon

### AC-011: Delete Entire Series

- [ ] User clicks delete on recurring event instance
- [ ] Confirmation dialog appears
- [ ] User selects "아니오" (No)
- [ ] All instances in series deleted
- [ ] Calendar no longer shows any instance
- [ ] No orphaned events with that `repeat.id`

### AC-012: Recurring Icon Display

- [ ] Recurring event instance displays RepeatIcon
- [ ] Icon visible in month view
- [ ] Icon visible in week view
- [ ] Icon has aria-label "반복 일정"
- [ ] Non-recurring events do not display icon

### AC-013: Overlap Exemption

- [ ] User creates recurring event overlapping existing event
- [ ] No overlap warning displayed
- [ ] Recurring event created successfully
- [ ] Both events visible in calendar

## 7. Edge Cases and Error Scenarios

### EC-001: End Date Before Start Date

**Scenario**: User sets end date earlier than event start date
**Expected Behavior**:
- System prevents submission
- Error message: "반복 종료일은 시작일 이후여야 합니다" (Repeat end date must be after start date)

### EC-002: Very Long Recurring Series (Performance)

**Scenario**: User creates daily recurring event from 2025-01-01 to 2025-12-31 (365 instances)
**Expected Behavior**:
- System generates all 365 instances within 2 seconds
- Calendar renders without lag
- All instances have unique IDs
- All instances share `repeat.id`

### EC-003: Invalid Month for Monthly 31st

**Scenario**: User creates monthly recurring event on Jan 31
**Expected Behavior**:
- February skipped (only 28/29 days)
- April skipped (30 days)
- June skipped (30 days)
- September skipped (30 days)
- November skipped (30 days)
- Only valid 31st dates created

### EC-004: Leap Year Calculation Edge Cases

**Scenario**: User creates yearly recurring Feb 29 event
**Expected Behavior**:
- 2024: Instance created (leap year, divisible by 4)
- 2025-2027: Skipped (non-leap years)
- 2028: Instance created (leap year, divisible by 4)
- 2100: Skipped (divisible by 100 but not 400)
- 2400: Instance created (divisible by 400)

### EC-005: Concurrent Edit of Same Series

**Scenario**: Two users edit same recurring series simultaneously
**Expected Behavior**:
- Last write wins (acceptable for MVP)
- No data corruption or orphaned instances
- All instances maintain consistency
- Future enhancement: Optimistic locking

### EC-006: Network Failure During Creation

**Scenario**: Network fails while creating recurring events
**Expected Behavior**:
- Request times out after 10 seconds
- Error message displayed
- No partial instances created (atomic operation)
- User can retry

### EC-007: Backend Validation Failure

**Scenario**: Backend rejects recurring event data (e.g., invalid date format)
**Expected Behavior**:
- 400 Bad Request response
- Error message displayed to user
- No instances created
- User can correct and retry

### EC-008: Deleting Last Instance vs. Series

**Scenario**: Only one instance remains in recurring series
**Expected Behavior**:
- Delete confirmation dialog still appears
- "예" (Yes) deletes that one instance
- "아니오" (No) also deletes that one instance (series has 1 event)
- Both options result in same outcome

### EC-009: Edit Series with Different Repeat Pattern

**Scenario**: User edits series and changes repeat type from weekly to monthly
**Expected Behavior**:
- Old instances deleted
- New instances generated based on new pattern
- New instances share new `repeat.id`
- Calendar updated with new instances

### EC-010: Timezone Boundary Issues

**Scenario**: Event at midnight with different timezone
**Expected Behavior**:
- All date calculations use UTC (as per CLAUDE.md)
- No date shifting due to timezone conversion
- Instances created on exact dates regardless of local time

### EC-011: Maximum End Date Boundary

**Scenario**: User sets end date to exactly 2025-12-31
**Expected Behavior**:
- Validation passes (inclusive maximum)
- If pattern generates instance on 2025-12-31, it is created
- If pattern would generate instance after 2025-12-31, it is not created

### EC-012: Single Instance Edit of Event with No Repeat ID

**Scenario**: Database contains event with `repeat.type !== 'none'` but missing `repeat.id`
**Expected Behavior**:
- Treat as corrupted data
- Edit should work as single instance edit
- Log warning for data integrity issue

## 8. Dependencies

### Internal Dependencies

- **useEventOperations hook**: Must be extended to support recurring event APIs
- **useEventForm hook**: Must be extended to manage repeat type and end date state
- **Event type (types.ts)**: Already includes RepeatInfo, may need `repeat.id` field added
- **eventUtils.ts**: Must implement recurring event generation logic
- **dateUtils.ts**: Must implement date calculation and validation utilities
- **server.js**: Must implement recurring event API endpoints (FR-013, FR-014, FR-015)

### External Dependencies

- **Material-UI Dialog**: For confirmation dialogs
- **Material-UI Select**: For repeat type dropdown
- **Material-UI DatePicker**: For end date selection (or existing date picker component)
- **Material-UI RepeatIcon**: For recurring event visual indicator
- **notistack**: For error and success notifications
- **Node.js crypto.randomUUID()**: For generating unique IDs server-side

### API Dependencies

- `GET /api/events`: Must return events including recurring instances
- `POST /api/events-list`: Create multiple recurring event instances (NEW)
- `PUT /api/recurring-events/:repeatId`: Update all events in series (NEW)
- `DELETE /api/recurring-events/:repeatId`: Delete all events in series (NEW)
- `PUT /api/events/:id`: Update single event (existing)
- `DELETE /api/events/:id`: Delete single event (existing)

## 9. Constraints and Assumptions

### Technical Constraints

- Maximum end date: 2025-12-31 (hard limit)
- Minimum repeat interval: 1 (no sub-daily or custom intervals)
- Supported repeat types: daily, weekly, monthly, yearly only
- Timezone: UTC for all date calculations (no timezone conversion)
- ID generation: Server-side only (client does not generate IDs)

### Business Constraints

- Recurring events do NOT check overlap (business decision to reduce friction)
- No support for infinite recurring events (all must have end date)
- No support for excluding specific dates from series (MVP limitation)
- No support for bi-weekly, quarterly, or custom patterns (MVP limitation)

### Assumptions

- Backend API endpoints exist or will be implemented as specified
- Database (JSON file) supports atomic read-write operations for event lists
- Event instances can be numerous (up to 365+) without performance degradation
- Users understand Korean UI text (all dialogs in Korean)
- Material-UI components are available and properly configured
- Existing event form can be extended with repeat controls
- Existing calendar views can display additional icon without layout issues

### Data Model Assumptions

- `repeat.id` field will be added to Event type
- All events in recurring series share same `repeat.id`
- Single-instance edits set `repeat.type = 'none'` and remove/change `repeat.id`
- `repeat.interval` is always 1 for MVP (daily=1 day, weekly=1 week, etc.)
- `repeat.endDate` is stored as ISO 8601 date string (YYYY-MM-DD)

## 10. Out of Scope

### Explicitly Excluded Features

- **Infinite recurring events**: No support for events without end date
- **Custom repeat patterns**: No "every 2nd Tuesday" or "last Friday of month"
- **Recurring event exceptions**: No excluding specific dates from series
- **Timezone handling**: No DST transitions or timezone-specific recurrence
- **Bi-weekly/Quarterly patterns**: Only daily, weekly, monthly, yearly
- **Advanced interval**: `repeat.interval` always 1, no "every 3 weeks"
- **Edit future instances**: No "edit this and all future instances" option
- **Recurring event search**: No filtering by recurring vs. non-recurring
- **Recurring event import/export**: CSV/iCal format for recurring events
- **Conflict resolution**: No smart conflict detection for recurring events
- **Recurring task delegation**: No assigning different instances to different users
- **Partial series deletion**: No "delete all future instances" option

### Future Considerations

- Support for custom repeat patterns (v2.0)
- RRULE standard compliance (v2.0)
- Timezone-aware recurrence (v2.0)
- Recurring event exceptions (v1.1)
- Optimistic locking for concurrent edits (v1.1)
- Performance optimization for very large series (v1.1)

### Related Features (Separate PRDs)

- Event overlap detection (existing feature, recurring events exempt)
- Event notifications (existing feature, applies to recurring instances)
- Event categories (existing feature, applies to recurring events)
- Event search and filtering (existing feature, extend for recurring)

## 11. Acceptance Testing Strategy

### Unit Test Coverage

**dateUtils.ts**:
- `generateRecurringDates(startDate, repeatType, endDate)`: Returns correct date array
- `isLeapYear(year)`: Correctly identifies leap years
- `isValidDayOfMonth(date, day)`: Validates day exists in month
- `addDays(date, count)`: Correctly adds days
- `addWeeks(date, count)`: Correctly adds weeks
- `addMonths(date, count)`: Correctly adds months with edge cases
- `addYears(date, count)`: Correctly adds years with leap day handling

**eventUtils.ts**:
- `generateRecurringEvents(eventForm, repeatId)`: Creates correct instances
- `filterInvalidDates(dates, startDay)`: Removes invalid monthly 31st dates
- `filterNonLeapYearDates(dates)`: Removes non-leap year Feb 29 dates

### Integration Test Scenarios

**Create Daily Recurring Event**:
1. Open event form
2. Fill in event details
3. Select repeat type "매일" (daily)
4. Set end date 7 days from start
5. Submit form
6. Verify 7 instances created in database
7. Verify all instances visible in calendar
8. Verify all instances have recurring icon

**Create Weekly Recurring Event**:
1. Create event on Monday
2. Select repeat type "매주" (weekly)
3. Set end date 4 weeks from start
4. Submit form
5. Verify 5 instances created (weeks 0-4)
6. Verify instances only on Mondays
7. Verify recurring icons displayed

**Create Monthly 31st Event**:
1. Create event on Jan 31
2. Select repeat type "매월" (monthly)
3. Set end date Dec 31 (same year)
4. Submit form
5. Verify 7 instances created (Jan, Mar, May, Jul, Aug, Oct, Dec)
6. Verify no instances for Feb, Apr, Jun, Sep, Nov
7. Verify all instances on 31st

**Create Yearly Leap Day Event**:
1. Create event on Feb 29, 2024
2. Select repeat type "매년" (yearly)
3. Set end date Dec 31, 2030
4. Submit form
5. Verify only 2024 and 2028 instances created
6. Verify no instances for 2025-2027, 2029-2030

**Edit Single Instance**:
1. Create weekly recurring event (4 instances)
2. Click edit on 2nd instance
3. Verify confirmation dialog appears
4. Select "예" (Yes)
5. Modify title
6. Save
7. Verify only 2nd instance updated
8. Verify 2nd instance loses recurring icon
9. Verify other instances unchanged

**Edit Entire Series**:
1. Create weekly recurring event (4 instances)
2. Click edit on any instance
3. Verify confirmation dialog appears
4. Select "아니오" (No)
5. Modify location
6. Save
7. Verify all 4 instances updated
8. Verify all instances maintain recurring icon
9. Verify all instances have new location

**Delete Single Instance**:
1. Create weekly recurring event (4 instances)
2. Click delete on 2nd instance
3. Verify confirmation dialog appears
4. Select "예" (Yes)
5. Verify only 2nd instance deleted
6. Verify 3 instances remain
7. Verify remaining instances have recurring icon

**Delete Entire Series**:
1. Create weekly recurring event (4 instances)
2. Click delete on any instance
3. Verify confirmation dialog appears
4. Select "아니오" (No)
5. Verify all 4 instances deleted
6. Verify calendar shows no instances
7. Verify database contains no instances with that repeat.id

### Performance Test Scenarios

**Large Daily Series**:
- Create daily recurring event for 365 days
- Measure creation time (must be < 2 seconds)
- Measure calendar render time (must be < 1 second)
- Verify all 365 instances created

**Concurrent Series Updates**:
- Create recurring event with 50 instances
- Simulate 10 concurrent updates to different instances
- Verify no data corruption
- Verify all updates applied correctly

### Security Test Scenarios

**SQL Injection in Event Data**:
- Attempt to create recurring event with SQL injection in title
- Verify input sanitized
- Verify no database breach

**XSS in Recurring Event**:
- Attempt to create recurring event with script tag in description
- Verify script not executed in calendar view
- Verify HTML escaped properly

**Authorization**:
- Verify user cannot edit/delete recurring events they don't own (if multi-user)
- Verify repeat.id cannot be manipulated to affect other users' events

### Accessibility Test Scenarios

**Keyboard Navigation**:
- Tab through event form to repeat type dropdown
- Use arrow keys to select repeat type
- Tab to end date picker
- Use keyboard to select date
- Tab through confirmation dialog buttons
- Press Enter to confirm

**Screen Reader**:
- Verify repeat type dropdown announced correctly
- Verify end date picker announced with label
- Verify confirmation dialog message read aloud
- Verify recurring icon has aria-label
- Verify validation errors announced

### Browser Compatibility Test Matrix

Test all scenarios in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Test critical paths on:
- Desktop 1920x1080
- Desktop 1366x768
- Tablet (iPad 1024x768)

## 12. Glossary

- **Recurring Event**: An event that repeats at regular intervals (daily, weekly, monthly, yearly)
- **Event Instance**: A single occurrence of a recurring event on a specific date
- **Repeat Type**: The pattern of recurrence (daily, weekly, monthly, yearly, none)
- **Repeat ID**: A unique identifier shared by all instances in a recurring series
- **End Date**: The last date on which a recurring event instance can be created
- **Single Instance Edit**: Modifying only one occurrence, converting it to a non-recurring event
- **Series Edit**: Modifying all occurrences in a recurring event series
- **Single Instance Delete**: Removing only one occurrence from a recurring series
- **Series Delete**: Removing all occurrences of a recurring event
- **Edge Case**: Special scenarios requiring custom handling (monthly 31st, leap day)
- **Leap Year**: Year divisible by 4 (except century years not divisible by 400)
- **Overlap Detection**: Feature that warns when events have conflicting times (exempt for recurring)
- **UTC**: Coordinated Universal Time, timezone used for all date calculations
- **Atomic Operation**: Database operation that completes fully or not at all (no partial state)
- **RRULE**: Standard format for recurring event rules (iCalendar RFC 5545) - out of scope for MVP
- **DST**: Daylight Saving Time - out of scope for MVP timezone handling

---

## Document Validation

This PRD has been validated against all 5 mandatory specification checklist categories:

1. **Clear Intent and Value Expression**: ✅
   - Purpose, value proposition, and success metrics clearly defined
   - Each requirement traces to user benefit

2. **Markdown Format**: ✅
   - Entire document in Markdown
   - Structured with clear headings and hierarchy
   - Version-controllable and scannable

3. **Actionable and Testable**: ✅
   - All functional requirements have unique identifiers
   - Acceptance criteria with objective pass/fail conditions
   - Test strategy with specific scenarios
   - Each requirement can be implemented and verified

4. **Complete Intent Capture**: ✅
   - All aspects of recurring events covered (create, read, update, delete)
   - Edge cases explicitly defined (monthly 31st, leap day)
   - Error scenarios documented
   - Performance, security, and accessibility requirements included
   - UI requirements with exact text and behavior

5. **Reduced Ambiguity**: ✅
   - Precise technical language throughout
   - Uses MUST/SHOULD/MAY for requirement strength
   - Specific metrics (2 seconds, 365 instances, 2025-12-31)
   - Domain terminology defined in glossary
   - No vague qualifiers like "usually" or "user-friendly"

**PRD creation complete. Document validated against all checklist criteria.**
