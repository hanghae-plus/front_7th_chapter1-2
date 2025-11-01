# Story 6: 반복 일정 시각적 표시 구현

## Rules to Follow
This task *must* be executed according to the following 3 official rule documents:
1.  `docs/kentcdodds-rtl-rules.md`
2.  `docs/rtl-official-query-guide.md`
3.  `docs/tidy-first-tdd-workflow.md`

---
## User Story (From PRD)
- 사용자는 캘린더에서 어떤 일정이 반복되는 일정인지 한눈에 알아볼 수 있다.

## Acceptance Criteria
- [ ] 캘린더 뷰에 표시되는 반복 일정에는 시각적 표시(예: 아이콘)가 포함되어야 한다.
- [ ] 반복되지 않는 일정에는 해당 아이콘이 표시되지 않아야 한다.

## Architecture
- `src/App.tsx`의 일정 렌더링 부분을 수정하여, `event.repeat.type`이 'none'이 아닐 경우 반복 아이콘(예: `<ReplayIcon />`)을 조건부로 렌더링한다.

## File Paths (통합 테스트)
- **수정:** `src/App.tsx`
- **수정:** `src/__tests__/medium.integration.spec.tsx` (통합 테스트 파일)

---
## Test Progression Order (테스트 진행 순서)
- **1. 단위 테스트 (Unit Test) TDD 사이클:** 이 스토리는 UI 렌더링 로직이 핵심이므로, 별도의 순수 로직 단위 테스트는 생략합니다.
- **2. 통합 테스트 (Integration Test) TDD 사이클:** 일정이 반복될 때 아이콘이 올바르게 표시되는지 검증하는 통합 테스트 TDD 사이클(RED-GREEN-REFACTOR)을 진행합니다.

## UI Flow for Integration Test (통합 테스트용 UI 플로우)
- MSW를 사용하여 반복 일정이 포함된 목(mock) 데이터를 반환하도록 설정한다.
- 앱이 렌더링된 후, 반복 일정이 포함된 리스트 아이템 내에 반복 아이콘이 존재하는지 확인한다.
- 반복되지 않는 일정에는 아이콘이 없는지 확인한다.

## Integration Test Requirement (통합 테스트 필요)
- 예, UI 렌더링 및 조건부 로직을 포함하므로 통합 테스트가 필요합니다. 관련 테스트 파일: `src/__tests__/medium.integration.spec.tsx`

---
## Commit Messages (통합 테스트 - 반복 아이콘 표시)
- **[Tidy]**: `N/A`
- **[RED]**: `test(event): Add failing integration test for displaying recurrence icon`
- **[GREEN]**: `feat(event): Display icon for recurring events`
- **[REFACTOR]**: `refactor(event): Improve recurrence icon display logic`

---

# Hotfix: Story-006.1 - 달력 뷰에 반복 일정 확장 표시

## Bug Report
- **문제:** `Story-006` 완료 후, 반복 아이콘은 우측 목록 뷰에서는 정상적으로 표시되나, 메인 캘린더(주/월) 뷰에서는 이벤트의 시작일에만 표시됨.
- **원인:** 캘린더 뷰 렌더링 시, 반복 규칙에 따라 이벤트를 여러 날짜에 걸쳐 '확장(expand)'하는 로직이 부재함.

## User Story (New)
- 사용자는 주/월 캘린더 뷰에서 반복 일정이 모든 해당 날짜에 표시되는 것을 볼 수 있다.

## Acceptance Criteria (New)
- [ ] '매일' 반복되는 이벤트는 캘린더 뷰의 해당 주(week) 모든 날짜에 표시되어야 한다.
- [ ] '매주' 월요일에 반복되는 이벤트는 캘린더 뷰에서 여러 주에 걸쳐 월요일마다 표시되어야 한다.

## Architecture (New)
- `src/utils/repeatUtils.ts`에 새로운 유틸리티 함수 `expandRecurringEvents`를 추가한다.
- 이 함수는 이벤트 목록과 날짜 범위(시작/종료)를 인자로 받아, 해당 범위 내에서 발생하는 모든 단일/반복 이벤트를 포함하는 새로운 배열을 반환한다.
- `App.tsx`의 `renderWeekView`, `renderMonthView` 또는 이 뷰들에 데이터를 전달하는 상위 로직(`useSearch` 등)에서 `expandRecurringEvents` 함수를 사용하여 캘린더에 표시할 최종 이벤트 목록을 계산한다.

## File Paths (Hotfix)
- **신규/수정:** `src/utils/repeatUtils.ts`
- **신규/수정:** `src/__tests__/utils/repeatUtils.spec.ts`
- **수정:** `src/App.tsx` (또는 `src/hooks/useSearch.ts`)
- **수정:** `src/__tests__/medium.integration.spec.tsx`

---
## Test Progression Order (Hotfix)
- **1. 단위 테스트 (Unit Test) TDD 사이클:** `expandRecurringEvents` 함수에 대한 단위 테스트를 TDD(RED-GREEN-REFACTOR)로 우선 개발한다.
- **2. 통합 테스트 (Integration Test) TDD 사이클:** 단위 테스트 통과 후, 실제 캘린더 뷰에 확장된 이벤트가 올바르게 렌더링되는지 확인하는 통합 테스트를 진행한다.

## Commit Messages (Hotfix - 반복 확장 기능)
- **[RED] (Unit):** `test(repeat): Add failing unit test for expandRecurringEvents util`
- **[GREEN] (Unit):** `feat(repeat): Implement expandRecurringEvents util`
- **[REFACTOR] (Unit):** `refactor(repeat): Improve expandRecurringEvents util logic`
- **[RED] (Integration):** `test(view): Add failing integration test for displaying expanded recurring events`
- **[GREEN] (Integration):** `feat(view): Display expanded recurring events in calendar views`
- **[REFACTOR] (Integration):** `refactor(view): Clean up integration of event expansion logic`
