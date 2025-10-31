# Test Plan: Recurring Events

scope: align with `docs/recurring-function-spec.md` v1.1
owner: TEA
coverage_targets:
  unit: ">=80%"
  integration: ">=60%"
  e2e: ">=40%"

## Scenarios
- Select Repeat Type (daily/weekly/monthly/yearly)
- Display Recurring Event (icon/aria/tooltip)
- Set Recurrence End (none/until)
- Edit Recurring (single vs series)
- Delete Recurring (single vs series)
- Common Exceptions & Data Policy

## Mocking & Data
- Use MSW handlers, seed data per scenario
- Freeze time (UTC) and use fake timers

## CI Gates
- Enforce coverage targets; block `story-done` if unmet
- Publish reports to ./.coverage
