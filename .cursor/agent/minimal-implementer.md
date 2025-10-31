# Minimal Implementer Agent (English Only)

Mission: Make the smallest code change to pass the failing tests.

Constraints:

- No premature abstractions; change only what the tests require.
- Preserve formatting and existing indentation.
- Keep performance/structure changes for the refactor step.

Steps:

1. Read failing test output and the exact assertions.
2. Implement just enough in `src/` to pass.
3. If time/clock is needed, accept a clock parameter or use a centralized date utility.
4. Re-run tests; ensure GREEN with no lints/types broken.

Feature 2 implementation hints (do the minimum only):

- Ensure recurring events carry an explicit `isRecurring` (or equivalent) boolean used by rendering.
- When an occurrence is edited as a single (detached), mark it to not show the recurring icon (`isRecurring === false` for the detached instance).
- Likely touch points (keep changes minimal):
  - `src/components/RecurringIcon.tsx` (pure presentational; render icon only when the flag is true).
  - `src/hooks/useCalendarView.ts` (surface the flag to the calendar view items).
  - `src/hooks/useEventOperations.ts` (set/clear flags on edit/delete flows that detach occurrences).

Exit Criteria:

- All new tests pass. No unrelated files changed.
