# Story 2: '매주' 반복 일정 생성 로직 구현

## Rules to Follow
This task *must* be executed according to the following 3 official rule documents:
1.  `docs/kentcdodds-rtl-rules.md`
2.  `docs/rtl-official-query-guide.md`
3.  `docs/tidy-first-tdd-workflow.md`

---
## User Story (From PRD)
- 사용자는 일정을 생성하거나 수정할 때, 반복 옵션을 선택하여 동일한 일정을 주기적으로 생성할 수 있다.

## Acceptance Criteria (From PRD)
- [ ] '매주' 옵션, 간격(예: 2), 요일(예: 월, 수, 금), 종료일(예: '2025-12-31') 선택 시, 해당 기간 동안 2주마다 월, 수, 금요일에 일정이 생성되어야 한다.

## Architecture (From Architecture.md)
- **저장 방식:** 개별 인스턴스 저장 방식 채택.
- **데이터:** 생성되는 모든 일정은 고유 `id`와 동일한 `seriesId`를 가져야 한다.
- **구현 위치:** `src/utils/repeatUtils.ts` 파일에 관련 로직 함수 구현 제안됨. (`calculateWeeklyDates`)

## File Paths (단위 테스트)
- **수정:** `src/utils/repeatUtils.ts` (for `calculateWeeklyDates`)
- **수정:** `src/__tests__/utils/repeatUtils.spec.ts` (for `calculateWeeklyDates`)

---
## Test Progression Order (테스트 진행 순서)
- **1. 단위 테스트 (Unit Test) TDD 사이클:** `calculateWeeklyDates` 함수에 대한 단위 테스트 TDD 사이클(RED-GREEN-REFACTOR)을 먼저 완료합니다.
- **2. 통합 테스트 (Integration Test) TDD 사이클:** 이 스토리의 핵심 로직은 순수 유틸리티 함수이므로, UI 상호작용을 포함하는 통합 테스트는 다음 스토리에서 진행합니다. (해당 없음)

## UI Flow for Integration Test (통합 테스트용 UI 플로우)
- 이 스토리의 핵심 로직은 순수 유틸리티 함수이므로, UI 플로우는 다음 스토리에서 다룹니다. (해당 없음)

## Integration Test Requirement (통합 테스트 필요)
- 이 스토리의 핵심 로직은 순수 유틸리티 함수이므로, 통합 테스트는 다음 스토리에서 진행합니다. (해당 없음)

---
## Commit Messages (단위 테스트 - 매주 반복)
- **[Tidy]**: `N/A`
- **[RED]**: `test(repeat): Add failing test for weekly repeat event generation`
- **[GREEN]**: `feat(repeat): Implement weekly repeat event generation logic`
- **[REFACTOR]**: `refactor(repeat): Improve clarity of weekly repeat generation code`
