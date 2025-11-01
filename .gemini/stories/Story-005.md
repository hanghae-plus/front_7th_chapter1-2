# Story 5: 반복 일정 유형 선택 UI 구현 및 통합 테스트

## Rules to Follow
This task *must* be executed according to the following 3 official rule documents:
1.  `docs/kentcdodds-rtl-rules.md`
2.  `docs/rtl-official-query-guide.md`
3.  `docs/tidy-first-tdd-workflow.md`

---
## User Story (From PRD)
- 사용자는 일정 생성/수정 시 반복 옵션을 선택하고, 반복 유형(매일, 매주, 매월, 매년) 및 간격, 요일/일자를 설정할 수 있다.

## Acceptance Criteria (UI-focused)
- [ ] 일정 생성/수정 폼에 '반복' 체크박스가 존재한다.
- [ ] '반복' 체크박스 선택 시, 반복 주기를 입력할 영역이 노출된다.
- [ ] 반복 주기 입력 영역에는 '반복 유형'을 선택할 수 있는 셀렉트 박스가 존재한다.
- [ ] '반복 유형' 셀렉트 박스에는 '매일', '매주', '매월', '매년' 선택지가 존재한다.
- [ ] '매주' 선택 시, '월~일'이 적힌 체크박스 7개가 노출된다.
- [ ] '매월' 선택 시, '일자'를 입력할 수 있는 필드가 노출된다.
- [ ] '매년' 선택 시, '월'과 '일자'를 입력할 수 있는 필드가 노출된다.
- [ ] 모든 반복 유형에 대해 '반복 간격'을 숫자로 입력할 수 있는 필드가 노출된다.

## Architecture (From Architecture.md & User Feedback)
- `src/hooks/useEventForm.ts`를 확장하여 반복 관련 상태(recurrenceType, interval, daysOfWeek, dayOfMonth, monthOfYear)를 관리한다.
- `src/App.tsx` 또는 새로운 컴포넌트(`RepeatOptions.tsx` 등)에 반복 설정 UI를 구현한다.
- **`src/types.ts`의 `RepeatInfo` 인터페이스를 확장하여 `daysOfWeek?: number[]`, `dayOfMonth?: number`, `monthOfYear?: number` 필드를 추가한다.**

## File Paths (통합 테스트)
- **수정:** `src/App.tsx`
- **수정:** `src/hooks/useEventForm.ts`
- **수정:** `src/types.ts` (RepeatInfo 인터페이스 확장)
- **신규 생성:** `src/components/RepeatOptions.tsx` (예시)
- **신규 생성:** `src/__tests__/medium.integration.spec.tsx` (통합 테스트 파일)

---
## Test Progression Order (테스트 진행 순서)
- **1. 단위 테스트 (Unit Test) TDD 사이클:** 이 스토리에서는 UI 컴포넌트 구현이 주 목적이므로, 별도의 순수 로직 단위 테스트는 생략하거나 UI 컴포넌트 내의 작은 유틸리티 함수에 한정합니다.
- **2. 통합 테스트 (Integration Test) TDD 사이클:** UI 컴포넌트의 렌더링 및 사용자 상호작용을 검증하는 통합 테스트 TDD 사이클(RED-GREEN-REFACTOR)을 진행합니다.

## UI Flow for Integration Test (통합 테스트용 UI 플로우)
- 일정 생성/수정 폼에서 '반복' 체크박스를 클릭한다.
- '반복 유형' 셀렉트 박스에서 '매주'를 선택한다.
- '월', '수', '금' 체크박스를 선택하고 '반복 간격'을 '2'로 입력한다.
- '반복 유형' 셀렉트 박스에서 '매월'을 선택한다.
- '일자' 필드에 '15'를 입력하고 '반복 간격'을 '3'으로 입력한다.
- '반복 유형' 셀렉트 박스에서 '매년'을 선택한다.
- '월' 필드에 '2'를, '일자' 필드에 '29'를 입력하고 '반복 간격'을 '1'로 입력한다.

## Integration Test Requirement (통합 테스트 필요)
- 예, UI 상호작용 및 여러 컴포넌트/훅의 연동을 포함하므로 통합 테스트가 필요합니다. 관련 테스트 파일: `src/__tests__/medium.integration.spec.tsx`

---
## Commit Messages (통합 테스트 - 반복 유형 선택 UI)
- **[Tidy]**: `refactor(eventForm): Prepare event form for recurrence options`
- **[RED]**: `test(eventForm): Add failing integration test for recurrence selection UI`
- **[GREEN]**: `feat(eventForm): Implement recurrence selection UI`
- **[REFACTOR]**: `refactor(eventForm): Improve clarity of recurrence selection UI code`
