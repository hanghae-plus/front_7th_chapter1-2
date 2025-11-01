# Story 12: 반복 일정 단일 삭제 로직 구현 ('예' 선택)

## Rules to Follow
This task *must* be executed according to the following 3 official rule documents:
1.  `docs/kentcdodds-rtl-rules.md`
2.  `docs/rtl-official-query-guide.md`
3.  `docs/tidy-first-tdd-workflow.md`

---
## User Story (From PRD)
- 사용자는 반복 일정 중 하나를 삭제할 때, 해당 이벤트만 삭제할지 아니면 전체 반복 시리즈를 삭제할지 선택할 수 있다.

## Acceptance Criteria
- [ ] 사용자가 반복 일정 삭제 확인 창에서 '예'(단일 삭제)를 선택하면, 해당 특정 날짜의 일정만 삭제되어야 한다.
- [ ] API 요청(`DELETE /api/events/:id`)이 호출되어야 한다.
- [ ] API 호출 성공 후, UI가 갱신되어 해당 이벤트가 목록에서 사라져야 한다.

## Architecture
- `App.tsx`의 '반복 일정 삭제 확인 다이얼로그'에서 '예' 버튼의 `onClick` 핸들러는 `useEventOperations` 훅의 `deleteEvent(eventId)` 함수를 호출한다.
- `deleteEvent` 함수는 이미 `DELETE /api/events/:id` API를 호출하고 성공 시 `fetchEvents()`를 통해 UI를 갱신하는 로직을 포함하고 있으므로 재사용한다.

## File Paths (통합 테스트)
- **수정:** `src/App.tsx`
- **수정:** `src/__tests__/medium.integration.spec.tsx`

---
## Test Progression Order (테스트 진행 순서)
- **1. 단위 테스트 (Unit Test) TDD 사이클:** 이 스토리는 API 연동 및 여러 컴포넌트/훅의 상호작용이 핵심이므로, 통합 테스트에 집중합니다.
- **2. 통합 테스트 (Integration Test) TDD 사이클:** '예' 버튼 클릭 시 API 호출 및 UI 변경이 올바르게 일어나는지 검증하는 통합 테스트 TDD 사이클(RED-GREEN-REFACTOR)을 진행합니다.

## UI Flow for Integration Test (통합 테스트용 UI 플로우)
- MSW를 사용하여 `seriesId`를 가진 반복 이벤트를 반환하도록 설정한다.
- 해당 이벤트의 '삭제' 버튼을 클릭한다.
- 나타난 다이얼로그에서 '예' 버튼을 클릭한다.
- `DELETE /api/events/:id` API가 호출되었는지 검증한다. (MSW 핸들러를 통해)
- 테스트 화면에서 해당 이벤트가 사라졌는지(`not.toBeInTheDocument`) 검증한다.

## Integration Test Requirement (통합 테스트 필요)
- 예, UI 상호작용, API 호출, 여러 컴포넌트/훅의 연동을 포함하므로 통합 테스트가 필요합니다.

---
## Commit Messages (통합 테스트 - 단일 반복 삭제)
- **[Tidy]**: `N/A`
- **[RED]**: `test(event): Add failing test for deleting a single recurring event`
- **[GREEN]**: `feat(event): Implement logic to delete a single recurring event`
- **[REFACTOR]**: `refactor(event): Improve clarity of single recurring event deletion logic`
