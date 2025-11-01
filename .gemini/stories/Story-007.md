# Story 7: 반복 종료일 저장 로직 구현

## Rules to Follow
This task *must* be executed according to the following 3 official rule documents:
1.  `docs/kentcdodds-rtl-rules.md`
2.  `docs/rtl-official-query-guide.md`
3.  `docs/tidy-first-tdd-workflow.md`

---
## User Story (From PRD)
- 사용자는 반복 일정이 무한히 생성되지 않도록 특정 날짜에 반복이 종료되도록 설정할 수 있다.

## Acceptance Criteria
- [ ] 사용자가 반복 종료일을 입력하고 일정을 생성하면, `addOrUpdateEvent` 함수 호출 시 `repeat` 객체에 `endDate`가 포함되어야 한다.
- [ ] 최대 반복 종료일은 2025년 12월 31일로 제한된다. (UI 레벨 유효성 검사는 다음 스토리에서 다룸)

## Architecture
- `src/App.tsx`의 `addOrUpdateEvent` 함수는 `useEventForm` 훅에서 관리되는 `repeatEndDate` 상태를 `eventData.repeat` 객체에 포함하여 `saveEvent`로 전달한다.
- `RepeatOptions.tsx` 컴포넌트는 이미 종료일 입력을 위한 `<input type="date">`를 포함하고 있다.

## File Paths (통합 테스트)
- **수정:** `src/__tests__/medium.integration.spec.tsx` (통합 테스트 파일)

---
## Test Progression Order (테스트 진행 순서)
- **1. 단위 테스트 (Unit Test) TDD 사이클:** 이 스토리는 UI와 상태, 저장 로직의 연동이 주 목적이므로, 별도의 순수 로직 단위 테스트는 생략합니다.
- **2. 통합 테스트 (Integration Test) TDD 사이클:** 사용자가 입력한 반복 종료일이 `addOrUpdateEvent`를 통해 올바르게 전달되는지 검증하는 통합 테스트 TDD 사이클(RED-GREEN-REFACTOR)을 진행합니다.

## UI Flow for Integration Test (통합 테스트용 UI 플로우)
- 일정 생성 폼에서 '반복' 체크박스를 클릭한다.
- '반복 유형'을 '매일'로 선택한다.
- '반복 종료일' 필드에 '2025-10-31'을 입력한다.
- '일정 추가' 버튼을 클릭한다.
- `saveEvent`로 전달된 `eventData` 객체 내의 `repeat.endDate` 값이 '2025-10-31'인지 확인한다.

## Integration Test Requirement (통합 테스트 필요)
- 예, UI 상호작용 및 `addOrUpdateEvent` 로직의 연동을 포함하므로 통합 테스트가 필요합니다. 관련 테스트 파일: `src/__tests__/medium.integration.spec.tsx`

---
## Commit Messages (통합 테스트 - 반복 종료일 저장)
- **[Tidy]**: `N/A`
- **[RED]**: `test(eventForm): Add failing integration test for saving repeatEndDate`
- **[GREEN]**: `feat(eventForm): Implement saving repeatEndDate`
- **[REFACTOR]**: `refactor(eventForm): Improve clarity of repeatEndDate saving logic`
