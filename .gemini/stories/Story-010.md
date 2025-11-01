# Story 10: 반복 일정 전체 수정 로직 구현 ('아니오' 선택)

## Rules to Follow
This task *must* be executed according to the following 3 official rule documents:
1.  `docs/kentcdodds-rtl-rules.md`
2.  `docs/rtl-official-query-guide.md`
3.  `docs/tidy-first-tdd-workflow.md`

---
## User Story (From PRD)
- 사용자가 반복 일정 수정 확인 창에서 '아니오'(전체 수정)를 선택하면, 해당 일정을 포함한 모든 과거 및 미래의 반복 일정이 함께 수정된다.

## Acceptance Criteria
- [ ] '아니오' 버튼 클릭 시, 수정 폼이 해당 이벤트의 정보로 채워져야 한다.
- [ ] 사용자가 폼을 수정하고 '일정 수정' 버튼을 클릭하면, 해당 이벤트의 `seriesId`를 기반으로 전체 시리즈를 수정하는 API 요청(`PUT /api/events-series/:seriesId`)이 호출되어야 한다.
- [ ] API 호출 성공 후, UI가 갱신되어 동일한 `seriesId`를 가진 모든 이벤트의 내용이 변경되어야 한다.

## Architecture
- `App.tsx`에 전체 시리즈를 수정 중인지 여부를 나타내는 새로운 상태를 추가한다. (예: `editingSeriesId: string | null`)
- `useEventOperations.ts`에 `updateEventSeries(seriesId: string, eventData: EventForm)` 함수를 새로 추가한다.
    - 이 함수는 `PUT /api/events-series/:seriesId` API를 호출한다.
    - 성공 시, `fetchEvents()`를 호출하여 이벤트 목록을 갱신한다.
- `App.tsx`의 '반복 일정 수정 확인 다이얼로그'에서 '아니오' 버튼의 `onClick` 핸들러를 수정한다.
    - `editingSeriesId` 상태를 설정하고, `editEvent`를 호출하여 폼을 채운다.
- `App.tsx`의 `addOrUpdateEvent` 함수를 수정하여, `editingSeriesId`가 설정되어 있을 경우 `updateEventSeries`를 호출하도록 분기 처리한다.

## File Paths (통합 테스트)
- **수정:** `src/App.tsx`
- **수정:** `src/hooks/useEventOperations.ts`
- **수정:** `src/__tests__/medium.integration.spec.tsx`

---
## Test Progression Order (테스트 진행 순서)
- **1. 단위 테스트 (Unit Test) TDD 사이클:** 이 스토리는 API 연동 및 여러 컴포넌트/훅의 상호작용이 핵심이므로, 통합 테스트에 집중합니다.
- **2. 통합 테스트 (Integration Test) TDD 사이클:** '아니오' 버튼 클릭 후 전체 시리즈가 수정되는지 검증하는 통합 테스트 TDD 사이클(RED-GREEN-REFACTOR)을 진행합니다.

## UI Flow for Integration Test (통합 테스트용 UI 플로우)
- MSW를 사용하여 동일한 `seriesId`를 가진 여러 개의 반복 이벤트를 반환하도록 설정한다.
- 그 중 하나의 '수정' 버튼을 클릭한다.
- 나타난 다이얼로그에서 '아니오' 버튼을 클릭한다.
- 폼의 '제목'을 '전체 수정된 회의'로 변경한다.
- '일정 수정' 버튼을 클릭한다.
- `PUT /api/events-series/:seriesId` API가 호출되었는지 검증한다.
- UI가 갱신된 후, 동일한 `seriesId`를 가졌던 모든 이벤트의 제목이 '전체 수정된 회의'로 변경되었는지 검증한다.

## Integration Test Requirement (통합 테스트 필요)
- 예, UI 상호작용, API 호출, 여러 컴포넌트/훅의 연동을 포함하므로 통합 테스트가 필요합니다.

---
## Commit Messages (통합 테스트 - 전체 반복 수정)
- **[Tidy]**: `N/A`
- **[RED]**: `test(eventForm): Add failing integration test for updating an entire recurring series`
- **[GREEN]**: `feat(eventForm): Implement logic to update an entire recurring series`
- **[REFACTOR]**: `refactor(eventForm): Improve clarity of recurring series update logic`
