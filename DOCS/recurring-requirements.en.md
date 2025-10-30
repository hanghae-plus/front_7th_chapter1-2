# Recurring Events - Required Feature Specification

This document defines the mandatory behavior for implementing recurring events. Use it as the source of truth for tests (TDD) and implementation.

## 1) Recurrence Type Selection

- Users can select a recurrence type when creating or editing an event.
- Supported types: Daily, Weekly, Monthly, Yearly.
- Special rules:
  - Monthly on the 31st: generate occurrences only on the 31st of months that have 31 days. Do NOT substitute with the last day (30/28/29).
  - Yearly on Feb 29: generate occurrences only in leap years (Feb 29). Do NOT substitute with Feb 28/Mar 1.
- Overlaps are allowed by design; do not prevent or merge overlapping occurrences.

## 2) Recurring Indicator in Calendar

- In the calendar view, display a distinct icon/marker for recurring events.
- Single (detached) events should not display the recurring icon.

## 3) Recurrence End Condition

- Users can specify an end condition for the recurrence.
- Option: Until a specific date.
  - For this assignment, ensure the maximum generated date is capped at 2025-12-31.

## 4) Edit Recurring Events

- When editing an occurrence of a recurring event, prompt the user: "Edit only this occurrence?"
  - If the user selects Yes (single edit):
    - Convert the selected occurrence into a single (detached) event.
    - Remove the recurring icon for that event.
  - If the user selects No (edit all):
    - Apply changes to the entire series (the event remains recurring).
    - The recurring icon remains for occurrences in the series.

## 5) Delete Recurring Events

- When deleting an occurrence of a recurring event, prompt the user: "Delete only this occurrence?"
  - If the user selects Yes (single delete):
    - Remove only the selected occurrence.
  - If the user selects No (delete all):
    - Delete all occurrences in the series.

## Notes

- All rules must be covered by tests first (RED → GREEN → REFACTOR).
- Treat time/clock deterministically in tests (fake timers or injected clock).




