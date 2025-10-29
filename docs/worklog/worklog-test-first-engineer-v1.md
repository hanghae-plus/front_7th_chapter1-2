# Worklog

- 작성자: Test First Engineer
- 업무 지시 내용: 반복 일정 기능 테스트를 RED 상태로 만들고 스켈레톤 코드 제공
- 참고자료: src/__tests__/recurring-events.spec.ts, docs/prd/prd-recurring-events-v3.md, docs/worklog/worklog-qa-engineer-v1.md
- 산출물: src/types.ts (업데이트), src/features/recurring-events/

# 업무 과정

- QA Engineer가 작성한 90개의 테스트 케이스 분석
- PRD v3 문서에서 요구사항 확인
- Event 타입에 repeatGroupId 필드 추가 (optional)
- 반복 일정 기능을 위한 새로운 디렉토리 구조 생성 (src/features/recurring-events/)
- 타입 정의 파일 생성 (RecurringInstance, SplitRecurringResult, RecurringOptions)
- 반복 일정 인스턴스 생성 함수 스켈레톤 작성 (generateRecurringInstances, isValidRecurringDate, isLeapYear, getDaysInMonth)
- 반복 일정 분할 함수 스켈레톤 작성 (splitRecurringEvent, getPreviousRecurringDate, getNextRecurringDate)
- repeatGroupId 생성 함수 스켈레톤 작성 (generateRepeatGroupId)
- 모든 함수를 빈 구현 또는 기본값 반환으로 작성하여 테스트가 실패하도록 구성
- 테스트 실행 결과: 111개 테스트 모두 실패(RED) 확인

# 참고 파일

- src/__tests__/recurring-events.spec.ts (QA Engineer가 작성한 테스트 케이스)
- docs/prd/prd-recurring-events-v3.md (요구사항 문서)
- docs/worklog/worklog-qa-engineer-v1.md (QA Engineer 작업 로그)
- src/types.ts (기존 타입 정의)
- .cursor/agents/engineers/test-first-engineer/steps/analyze-test-cases.md
- .cursor/agents/engineers/test-first-engineer/steps/create-skeleton.md

# 다음 작업자에게 남기는 코멘트

Implementation Engineer는 다음 함수들을 구현하여 모든 테스트를 통과(GREEN)시켜주세요:

## 1. 반복 일정 인스턴스 생성 (generateInstances.ts)

- `generateRecurringInstances`: 반복 패턴에 따라 뷰 범위 내 모든 날짜 인스턴스 생성
- `isValidRecurringDate`: 특수 날짜 검증 (31일이 없는 달, 윤년 2/29 처리)
- `isLeapYear`: 윤년 판별
- `getDaysInMonth`: 특정 월의 마지막 날짜 계산

## 2. 반복 일정 분할 (splitRecurrence.ts)

- `splitRecurringEvent`: 단일 수정/삭제 시 반복 일정을 3개로 분할
  - before: 수정/삭제 날짜 이전의 반복 일정 (endDate 조정)
  - modified: 수정된 단일 일정 (수정 시에만, repeat.type = 'none')
  - after: 수정/삭제 날짜 이후의 새 반복 일정 (startDate 조정)
- `getPreviousRecurringDate`: 이전 반복 날짜 계산
- `getNextRecurringDate`: 다음 반복 날짜 계산

## 3. repeatGroupId 생성 (repeatGroupId.ts)

- `generateRepeatGroupId`: 고유한 ID 생성 (UUID 또는 타임스탬프 기반)

## 주의사항

1. **특수 날짜 처리 경계값 케이스**
   - 매월 31일 반복: 2월, 4월, 6월, 9월, 11월에는 일정이 생성되지 않음
   - 매년 윤년 2/29 반복: 평년에는 일정이 생성되지 않음
   - 매월 30일: 2월에는 생성되지 않음
   - 매월 29일: 평년 2월에는 생성되지 않음, 윤년 2월에는 생성됨

2. **반복 일정 분할 로직**
   - 첫 번째 일정 수정: 원본 삭제, 단일 일정 + 새 반복 일정 생성
   - 마지막 일정 수정: 원본 endDate 조정, 단일 일정 생성
   - 첫 번째 일정 삭제: 원본 startDate를 다음 반복 날짜로 조정
   - 마지막 일정 삭제: 원본 endDate를 이전 반복 날짜로 조정
   - 중간 일정 수정/삭제: 3개로 분할 (before, modified/deleted, after)

3. **repeatGroupId 관리**
   - 분할된 모든 일정은 원본과 동일한 repeatGroupId 유지
   - 전체 수정/삭제 시 같은 repeatGroupId를 가진 모든 일정 처리

4. **반복 간격**
   - 현재는 항상 1로 고정 (interval = 1)

모든 테스트는 현재 실패(RED) 상태이며, 스켈레톤 코드의 TODO 주석을 참고하여 구현을 완성해주세요.

