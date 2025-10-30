# Agent Rules for This Project

## Goals

- Deliver features via strict TDD (RED → GREEN → REFACTOR) with small, safe, and deterministic steps.
- Keep tests fast, readable, and fully deterministic.

## Operating Principles

- Always read `docs/requirements.md` (if present) and `.cursor/rules/testing-rules.md` before writing tests or code. The source of truth for this assignment is `DOCS/recurring-requirements.en.md`.
- Language policy: 코드 식별자(함수/변수/파일명)는 영어로 작성하고, 커밋/PR/주석/테스트 설명 및 각 단계 산출물 문서는 한국어로 작성합니다.
- Preserve existing file indentation and formatting; do not reformat unrelated code.
- Use behavior-driven test names and the AAA pattern.
- Avoid over-mocking; control time/network/randomness deterministically.

## Change Workflow

1. RED: Add a failing test (unit or integration as appropriate).
2. GREEN: Make the minimal code change to pass only that test.
3. REFACTOR: Improve clarity and remove duplication without changing behavior.
4. Commit after each step using messages:
   - `test(red): <behavior>`
   - `feat(green): <minimal change>`
   - `refactor: <improvement>`

## Testing Conventions

- Use React Testing Library from the user’s perspective (roles/labels/text).
- Use `userEvent` and `findBy*`/`waitFor` for async flows.
- Use MSW for network; use fake timers or an injected clock for date/recurrence logic.

## File/Path Rules

- Keep new design docs in `DOCS/` (not in rules folders or configs).
- Put tests under `src/__tests__/` with clear grouping (unit/hooks/integration).

## Recurring Feature Specifics (Authoritative)

- Monthly on the 31st: generate only on the 31st in months that have it. Do not substitute with the last day.
- Yearly on Feb 29: generate only in leap years (Feb 29). Do not substitute with Feb 28/Mar 1.
- Overlaps are allowed by design; never deduplicate or prevent overlaps.
- Recurring indicator in calendar: show a distinct icon/marker for recurring events only. Detached single events must not show the icon.
- Recurrence end condition: cap generated occurrences at 2025-12-31 at the latest.

## Feature 2 Focus (Recurring Icon & Detach Behavior)

- Tests must cover both: (a) recurring events render with the icon; (b) a detached single edit of a recurring occurrence renders without the icon.
- Preferred test locations:
  - Integration: `src/__tests__/medium.integration.spec.tsx` (calendar rendering and user flows).
  - Hooks/unit: `src/__tests__/hooks/medium.useEventOperations.spec.ts` or a new spec that validates the `isRecurring`/detach flags.
- Minimal implementation targets:
  - `src/components/RecurringIcon.tsx` (render-only component; no business logic).
  - `src/hooks/useCalendarView.ts` and/or `src/hooks/useEventOperations.ts` to ensure events carry `isRecurring` and a detach mechanism that clears the icon when an occurrence is converted to a single event.
- Determinism: fix the clock in tests; do not rely on system time.

## Quality Gates

- No flaky tests; total suite must run in seconds locally.
- Lints and types must be clean after each GREEN and REFACTOR.

## Safety

- Prefer pure functions for recurrence generation and series/detach decisions.
- Add boundary and negative tests for every rule above.

## Stage Documentation & Traceability

- For each TDD phase (RED, GREEN, REFACTOR), create a markdown doc: `DOCS/feature-<num>-RED.md`, `DOCS/feature-<num>-GREEN.md`, `DOCS/feature-<num>-REFACTOR.md`.
- 산출물 문서는 한국어로 작성합니다. 목표, 단계, 근거, 변경 파일 경로, 결과를 간결히 기록합니다.
- 커밋 메시지와 문서 헤더, 스펙 참조는 동일한 번호/용어 체계를 사용합니다.
- 예시 매핑:
  - Commit: `test(red): 2. 반복 이벤트에만 아이콘을 표시한다`
  - Doc: `DOCS/feature-2-RED.md` (관련 스펙: 2 – 캘린더 반복 아이콘)

## Sequential Scope (Unit → Integration)

- Complete unit-level TDD first: RED → GREEN → REFACTOR (unit).
- Then add integration tests:
  - RED (integration): failing integration test capturing UI behavior.
  - GREEN (integration): minimal UI/hook/state wiring to pass.
  - REFACTOR (integration): role separation/readability/duplication removal.
- Repeat the same discipline for each feature slice.
