# Agent Rules for This Project

## Goals

- Implement features via TDD (RED → GREEN → REFACTOR) with clear commits.
- Prefer small, safe edits; keep tests fast and deterministic.

## Operating Principles

- Always read `docs/requirements.md` and `.cursor/rules/good-test-rules.md` before writing tests or code.
- Default language for commits and code comments: English; for user communication: Korean.
- Preserve existing file indentation and formatting.
- Use behavioral test names and AAA pattern.
- Avoid over-mocking; mock time/network/random deterministically.

## Change Workflow

1. Write a failing test first (unit or integration as appropriate).
2. Make the minimal change to pass.
3. Refactor to remove duplication and improve clarity.
4. Commit after each step with messages:
   - `test(red): ...`
   - `feat(green): ...`
   - `refactor: ...`

## Testing Conventions

- Use React Testing Library from the user’s perspective (roles/labels/text).
- Use `userEvent` and `findBy*`/`waitFor` for async.
- Use MSW for API; fake timers or injected clock for date/recurrence logic.

## File/Path Rules

- Keep new docs in `DOCS/` unless they are agent rules (this folder) or config.
- New tests under `src/__tests__/` with clear grouping (unit/hooks/integration).

## Recurring Feature Specifics

- Monthly 31st occurs only on the 31st; Yearly Feb 29 only in leap years.
- Overlaps allowed by design; do not de-duplicate.
- Calendar must show an icon for recurring events; detached single edits remove the icon.
- End date must not exceed 2025-12-31.

## Quality Gates

- No flaky tests. Keep total run time within seconds locally.
- Ensure lints/types are clean after edits.

## Safety

- Prefer pure functions for date recurrence generation.
- Add boundary and negative tests for every rule.
