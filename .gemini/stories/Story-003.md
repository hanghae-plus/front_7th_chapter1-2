# Story 3: '매월' 반복 일정 생성 로직 구현

## Rules to Follow
This task *must* be executed according to the following 3 official rule documents:
1.  `docs/kentcdodds-rtl-rules.md`
2.  `docs/rtl-official-query-guide.md`
3.  `docs/tidy-first-tdd-workflow.md`

---
## User Story (From PRD)
- 사용자는 일정을 생성하거나 수정할 때, 반복 옵션을 선택하여 동일한 일정을 주기적으로 생성할 수 있다.

## Acceptance Criteria (From PRD)
- [ ] '매월' 옵션, 간격(예: 3), 일(예: 15일), 종료일(예: '2025-12-31') 선택 시, 해당 기간 동안 3개월마다 15일에 일정이 생성되어야 한다.
- [ ] '매월' 반복 시, 시작일이 31일인 경우 해당 월에 31일이 있을 때만 일정이 생성된다. (예: 2월에는 생성되지 않음)

## Architecture (From Architecture.md)
- **저장 방식:** 개별 인스턴스 저장 방식 채택.
- **데이터:** 생성되는 모든 일정은 고유 `id`와 동일한 `seriesId`를 가져야 한다.
- **구현 위치:** `src/utils/repeatUtils.ts` 파일에 관련 로직 함수 구현 제안됨. (`calculateMonthlyDates`)

## File Paths (단위 테스트)
- **수정:** `src/utils/repeatUtils.ts` (for `calculateMonthlyDates`)
- **수정:** `src/__tests__/utils/repeatUtils.spec.ts` (for `calculateMonthlyDates`)

---
## Test Progression Order (테스트 진행 순서)
- **1. 단위 테스트 (Unit Test) TDD 사이클:** `calculateMonthlyDates` 함수에 대한 단위 테스트 TDD 사이클(RED-GREEN-REFACTOR)을 먼저 완료합니다.
- **2. 통합 테스트 (Integration Test) TDD 사이클:** 이 스토리의 핵심 로직은 순수 유틸리티 함수이므로, UI 상호작용을 포함하는 통합 테스트는 다음 스토리에서 진행합니다. (해당 없음)

## UI Flow for Integration Test (통합 테스트용 UI 플로우)
- 이 스토리의 핵심 로직은 순수 유틸리티 함수이므로, UI 플로우는 다음 스토리에서 다룹니다. (해당 없음)

## Integration Test Requirement (통합 테스트 필요)
- 이 스토리의 핵심 로직은 순수 유틸리티 함수이므로, 통합 테스트는 다음 스토리에서 진행합니다. (해당 없음)

---
## Commit Messages (단위 테스트 - 매월 반복)
- **[Tidy]**: `N/A`
- **[RED]**: `test(repeat): Add failing test for monthly repeat event generation`
- **[GREEN]**: `feat(repeat): Implement monthly repeat event generation logic`
- **[REFACTOR]**: `refactor(repeat): Improve clarity of monthly repeat generation code`
