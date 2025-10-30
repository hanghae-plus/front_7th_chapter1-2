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

## Commit, PR, and Artifact Language Policy
- 모든 커밋 메시지와 PR 설명은 반드시 한국어로 작성합니다.
- 각 TDD 단계(RED, GREEN, REFACTOR)별로 생성하는 산출물(md 문서 등)도 반드시 한국어로 작성합니다.
- 코드 식별자(함수/변수/파일명)는 영어로, **주석과 테스트 설명(it/describe 메시지)은 한국어로** 작성합니다.

## TDD 단계별 표준 산출물 및 에이전트 책임 순서

아래의 흐름(RED, GREEN, REFACTOR 모두 동일)을 반드시 따름.

1. 코드(테스트/구현/리팩터 등) 작성
   - RED: Test Author Agent
   - GREEN: Minimal Implementer Agent
   - REFACTOR: Refactorer Agent
2. 해당 단계 산출물(한국어 md 문서) 작성
   - 해당 단계 주도 에이전트가 산출물도 작성
   - 산출물 이름과 커밋 메시지, 요구사항 번호/내용을 통일함
3. 검토
   - Reviewer Agent가 코드와 산출물 모두 점검(품질, TDD 규칙, 요구사항 매핑 등)
4. 커밋
   - Committer Agent가 커밋 메시지 작성(한국어), 산출물-코드-요구사항 번호-커밋 간 매칭 책임

> 코드 식별자는 영어, **주석/테스트 설명/산출물/커밋/PR은 한국어** 원칙을 반드시 지킴

## 단계적 진행 규칙(단위 → 통합)
- 먼저 단위 수준에서 TDD 사이클을 완료한다: **RED → GREEN → REFACTOR(단위)**
- 단위 GREEN이 안정화되면, 통합 테스트를 작성한다:
  - **RED(통합)**: 실패하는 통합 테스트 추가
  - **GREEN(통합)**: 실제 UI/훅/상태 연동 최소 구현
  - **REFACTOR(통합)**: 전체 구조 개선(역할 분리/가독성/중복 제거)
- 각 단계마다 산출물(한국어 문서) 작성 → 검토 → 한국어 커밋 메시지로 기록
- 다음 기능으로 넘어갈 때도 동일한 절차를 반복 적용한다
