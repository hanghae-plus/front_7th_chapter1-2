# Copilot Instructions (Project-Specific)

## Mission

- Assist with TDD development for recurring schedule features.
- Prefer small, safe, and readable edits that keep lints/types clean.

## Behavior

- Generate tests first (failing), then minimal implementation, then refactor.
- Use domain language and AAA structure in tests.
- Favor React Testing Library queries by role/label/text; use `userEvent`.
- Mock time/network/random deterministically (MSW, fake timers, injected clock).
- Keep files and paths consistent with the repository structure.

## Do

- Put new docs in `DOCS/` (except `.cursor` rules); tests in `src/__tests__/`.
- Write clear commit messages per stage: `test(red)`, `feat(green)`, `refactor`.
- Add boundary/negative test cases for date/recurrence rules.

## Don’t

- Don’t rely on implementation details in tests.
- Don’t introduce flaky tests or time-dependent assertions.
- Don’t over-mock core domain logic in integration tests.

## Recurring Feature Notes

- Monthly 31st → only on the 31st; no substitution with 30/28/29.
- Yearly Feb 29 → only in leap years.
- Overlaps allowed; no de-dup.
- Calendar shows icon for recurring; detached single edits remove the icon.
- End date must not exceed 2025-12-31.
