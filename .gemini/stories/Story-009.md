# Story 9: 반복 일정 단일 수정 로직 구현 ('예' 선택)

## Rules to Follow
This task *must* be executed according to the following 3 official rule documents:
1.  `docs/kentcdodds-rtl-rules.md`
2.  `docs/rtl-official-query-guide.md`
3.  `docs/tidy-first-tdd-workflow.md`

---
## User Story (From PRD)
- 사용자가 반복 일정 수정 확인 창에서 '예'(단일 수정)를 선택하면, 해당 일정만 '단일 일정'으로 변경되고 기존 반복 시리즈에서 분리된다.

## Acceptance Criteria
- [ ] '예' 버튼 클릭 시, 해당 이벤트의 `seriesId`를 `null`로 변경하는 API 요청(`PUT /api/events/:id/detach`)이 호출되어야 한다.
- [ ] API 호출 성공 후, UI가 갱신되어 해당 이벤트에서 반복 아이콘이 사라져야 한다.
- [ ] `src/types.ts`의 `Event` 타입에 `seriesId: string | null;` 필드가 추가되어야 한다.

## Architecture
- `src/types.ts`의 `Event` 타입에 `seriesId: string | null;` 필드를 추가한다.
- `src/hooks/useEventOperations.ts`에 `detachEventFromSeries(eventId: string)` 함수를 새로 추가한다.
    - 이 함수는 `PUT /api/events/:id/detach` API를 호출한다.
    - 성공 시, `fetchEvents()`를 호출하여 이벤트 목록을 갱신한다.
- `App.tsx`의 '반복 일정 수정 확인 다이얼로그'에서 '예' 버튼의 `onClick` 핸들러를 수정한다.
    - 기존 `editEvent` 호출 대신, 새로 만든 `detachEventFromSeries` 함수를 호출한다.
    - 그 후, `editEvent`를 호출하여 폼을 채운다.

## File Paths (통합 테스트)
- **수정:** `src/types.ts`
- **수정:** `src/App.tsx`
- **수정:** `src/hooks/useEventOperations.ts`
- **수정:** `src/__tests__/medium.integration.spec.tsx`

---
## Test Progression Order (테스트 진행 순서)
- **1. 단위 테스트 (Unit Test) TDD 사이클:** 이 스토리는 API 연동 및 여러 컴포넌트/훅의 상호작용이 핵심이므로, 통합 테스트에 집중합니다.
- **2. 통합 테스트 (Integration Test) TDD 사이클:** '예' 버튼 클릭 시 API 호출 및 UI 변경이 올바르게 일어나는지 검증하는 통합 테스트 TDD 사이클(RED-GREEN-REFACTOR)을 진행합니다.

## UI Flow for Integration Test (통합 테스트용 UI 플로우)
- MSW를 사용하여 `seriesId`를 가진 반복 이벤트를 반환하도록 설정한다.
- 해당 이벤트의 '수정' 버튼을 클릭한다.
- 나타난 다이얼로그에서 '예' 버튼을 클릭한다.
- `PUT /api/events/:id/detach` API가 호출되었는지 검증한다. (MSW 핸들러를 통해)
- API가 `seriesId: null`로 업데이트된 이벤트를 반환하도록 설정한다.
- 테스트 화면에서 해당 이벤트의 반복 아이콘(`ReplayIcon`)이 사라졌는지(`not.toBeInTheDocument`) 검증한다.

## Integration Test Requirement (통합 테스트 필요)
- 예, UI 상호작용, API 호출, 여러 컴포넌트/훅의 연동을 포함하므로 통합 테스트가 필요합니다.

---
## Commit Messages (통합 테스트 - 단일 반복 수정)
- **[Tidy]**: `N/A`
- **[RED]**: `test(eventForm): Add failing integration test for detaching a single recurring event`
- **[GREEN]**: `feat(eventForm): Implement logic to detach a single recurring event`
- **[REFACTOR]**: `refactor(eventForm): Improve clarity of event detachment logic`
