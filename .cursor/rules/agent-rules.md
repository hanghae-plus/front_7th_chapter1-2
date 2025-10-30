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

## Stage Documentation & Cross-Referencing

- For each TDD phase (RED, GREEN, REFACTOR):
  - Create a markdown doc (`DOCS/feature-<num>-RED.md`, `feature-<num>-GREEN.md`, etc.) summarizing what was done at that stage (goal, steps, reasons, paths, result).
  - Save and commit this doc together with the code/test for the corresponding phase.
  - Ensure commit messages, doc file headers, and requirements/spec references use the same numbering/convention for traceability.
  - Example:
    - Commit: `test(red): 1. Recurrence type selection – only 31st of month`
    - Doc: `DOCS/feature-1-RED.md` (`Related Spec: 1`)
    - Clear mapping between code, docs, and spec for every feature and phase.

## Commit & PR Language Policy

- 모든 커밋 메시지와 PR 설명은 반드시 한국어로 작성합니다.
- 코드/테스트/주석 등은 영어로 작성하며, 사용자와의 소통(커밋, PR)은 한국어를 원칙으로 합니다.
