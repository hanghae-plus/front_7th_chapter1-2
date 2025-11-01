# Story 8: 반복 일정 수정 시 확인 다이얼로그 표시

## Rules to Follow
This task *must* be executed according to the following 3 official rule documents:
1.  `docs/kentcdodds-rtl-rules.md`
2.  `docs/rtl-official-query-guide.md`
3.  `docs/tidy-first-tdd-workflow.md`

---
## User Story (From PRD)
- 사용자는 반복 일정 중 하나를 수정할 때, 해당 이벤트만 개별적으로 수정할지 아니면 전체 반복 시리즈를 수정할지 선택할 수 있다.

## Acceptance Criteria
- [ ] 사용자가 반복 일정의 '수정' 버튼을 클릭하면, "해당 일정만 수정하시겠어요?"라는 확인 다이얼로그가 나타나야 한다.
- [ ] 다이얼로그에는 '예'(단일 수정)와 '아니오'(전체 수정) 버튼이 포함되어야 한다.
- [ ] 사용자가 일반(반복되지 않는) 일정의 '수정' 버튼을 클릭하면, 이전과 같이 즉시 수정 폼이 나타나야 한다.

## Architecture
- `App.tsx`에 반복 일정 수정 전용 다이얼로그의 상태를 관리하는 새로운 `useState`를 추가한다. (예: `editingSeriesEvent`)
- `useEventForm.ts`의 `editEvent` 함수 로직을 수정한다.
    - 클릭된 이벤트가 반복(`event.repeat.type !== 'none'`)될 경우, 폼을 채우는 대신 새로운 다이얼로그 상태를 `true`로 설정한다.
    - 일반 이벤트일 경우, 기존처럼 폼을 채운다.
- `App.tsx`에 새로운 `<Dialog>` 컴포넌트를 추가하여 확인 메시지와 버튼들을 렌더링한다.

## File Paths (통합 테스트)
- **수정:** `src/App.tsx`
- **수정:** `src/hooks/useEventForm.ts`
- **수정:** `src/__tests__/medium.integration.spec.tsx`

---
## Test Progression Order (테스트 진행 순서)
- **1. 단위 테스트 (Unit Test) TDD 사이클:** 이 스토리는 여러 훅과 컴포넌트의 상호작용이 핵심이므로, 단위 테스트는 생략하고 통합 테스트에 집중합니다.
- **2. 통합 테스트 (Integration Test) TDD 사이클:** 반복 일정 수정 시 다이얼로그가 올바르게 나타나는지 검증하는 통합 테스트 TDD 사이클(RED-GREEN-REFACTOR)을 진행합니다.

## UI Flow for Integration Test (통합 테스트용 UI 플로우)
- MSW를 사용하여 반복되는 이벤트와 반복되지 않는 이벤트를 모두 포함하는 목록을 반환하도록 설정한다.
- 먼저, 반복되지 않는 이벤트의 '수정' 버튼을 클릭하고, 다이얼로그가 나타나지 **않는지** 확인한다.
- 다음으로, 반복되는 이벤트의 '수정' 버튼을 클릭한다.
- "해당 일정만 수정하시겠어요?" 텍스트를 포함하는 다이얼로그가 나타나는지 확인한다.
- '예'와 '아니오' 버튼이 다이얼로그 내에 존재하는지 확인한다.

## Integration Test Requirement (통합 테스트 필요)
- 예, UI 상호작용 및 여러 컴포넌트/훅의 연동을 포함하므로 통합 테스트가 필요합니다.

---
## Commit Messages (통합 테스트 - 반복 수정 확인 다이얼로그)
- **[Tidy]**: `N/A`
- **[RED]**: `test(eventForm): Add failing integration test for recurring event edit confirmation dialog`
- **[GREEN]**: `feat(eventForm): Display confirmation dialog when editing a recurring event`
- **[REFACTOR]**: `refactor(eventForm): Improve recurring event edit confirmation logic`
