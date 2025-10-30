# Worklog

- 작성자: Test First Engineer
- 업무 지시 내용: 반복 일정 기능을 위한 테스트 코드 작성 및 함수 인터페이스 정의, RED 상태 확인
- 참고자료: docs/testcases/recurring-events-testcases.md, 기존 코드베이스 구조
- 산출물:
  - src/__tests__/recurring-events.integration.spec.tsx (통합 테스트)
  - src/__tests__/unit/easy.recurringUtils.spec.ts (유닛 테스트)
  - src/utils/recurringUtils.ts (스켈레톤 코드)

# 업무 과정

## 1. 기존 코드 구조 파악
- src/types.ts에서 RepeatInfo, Event 타입이 이미 정의되어 있음을 확인
- src/utils/ 디렉토리에 유틸 함수들이 분리된 구조 파악
- src/hooks/ 디렉토리에 커스텀 훅들이 분리된 구조 파악
- src/__tests__/unit/, src/__tests__/hooks/, src/__tests__/ 구조 파악
- 기존 유닛 테스트가 상대 경로로 import하고 있음을 확인

## 2. 테스트 케이스 분석 및 테스트 설계
- QA Engineer가 작성한 테스트 케이스 문서 분석
- 15개의 통합 테스트 시나리오 확인:
  - 반복 일정 생성 (매일, 매주, 매월, 매년, 무한 반복)
  - 경계값 케이스 (매월 31일, 윤년 2/29)
  - 반복 일정 수정 (단일/전체)
  - 반복 일정 삭제 (단일/전체)
  - 반복 일정 뷰 표시 (주간/월간)
  - 유효성 검증

- 필요한 유닛 테스트 함수 설계:
  - generateRecurringDates: 날짜 배열 생성
  - validateRecurringConfig: 유효성 검증
  - splitRecurringEvent: 단일 일정 분할
  - getRepeatText: 반복 정보 텍스트 생성
  - expandRecurringEvents: 날짜별 인스턴스 전개
  - isLeapYear: 윤년 판별

## 3. 함수 인터페이스 정의 및 스켈레톤 코드 생성
- src/utils/recurringUtils.ts 파일 생성
- 6개 함수의 인터페이스 정의 (JSDoc 포함):
  - generateRecurringDates(startDate, repeat, endDate?): string[]
  - validateRecurringConfig(startDate, repeat, endDate?): { isValid, errorMessage? }
  - splitRecurringEvent(event, targetDate): { before?, after? }
  - getRepeatText(repeat): string
  - expandRecurringEvents(events, rangeStart, rangeEnd): Event[]
  - isLeapYear(year): boolean
- 각 함수는 빈 구현으로 테스트가 실패하도록 작성
- RED 상태를 위해 eslint-disable 주석 추가

## 4. 통합 테스트 코드 작성
- src/__tests__/recurring-events.integration.spec.tsx 파일 생성
- 15개 통합 테스트 시나리오를 Vitest 코드로 작성
- medium.integration.spec.tsx 패턴을 참고하여 setup 함수 구현
- saveRecurringSchedule 헬퍼 함수 구현

## 5. 유닛 테스트 코드 작성
- src/__tests__/unit/easy.recurringUtils.spec.ts 파일 생성
- 36개 유닛 테스트 케이스 작성:
  - generateRecurringDates: 14개 테스트 (매일/매주/매월/매년 반복, 경계값)
  - validateRecurringConfig: 7개 테스트 (유효성 검증)
  - splitRecurringEvent: 3개 테스트 (분할 로직)
  - getRepeatText: 6개 테스트 (텍스트 생성)
  - expandRecurringEvents: 4개 테스트 (인스턴스 전개)
  - isLeapYear: 2개 테스트 (윤년 판별)

## 6. RED 상태 확인
- 유닛 테스트 실행: 36개 중 33개 실패, 3개 통과 (RED 상태)
- 통합 테스트 실행: 15개 모두 실패 (RED 상태)
- RED 상태 확인 완료

## 7. Lint 및 타입 검사
- Import 경로 수정 (상대 경로로 변경)
- RED 상태에서 불가피한 unused variable 경고를 eslint-disable로 처리
- 포맷팅 오류 수정
- TypeScript compiler warning은 RED 상태에서 불가피한 것으로 확인

# 테스트 실행 결과

## 유닛 테스트 결과
- 총 테스트: 36개
- 실패: 33개 (RED 상태)
- 통과: 3개
  - generateRecurringDates > 반복 종료일 없음 > 종료일이 없으면 빈 배열을 반환한다
  - getRepeatText > 반복 없음(none)은 빈 문자열을 반환한다
  - isLeapYear > 평년을 판별할 수 있다

## 통합 테스트 결과
- 총 테스트: 15개
- 실패: 15개 (RED 상태)
- UI 요소가 아직 구현되지 않아 모든 테스트가 실패함

## 설계한 함수 인터페이스

### src/utils/recurringUtils.ts

1. **generateRecurringDates(startDate: string, repeat: RepeatInfo, endDate?: string): string[]**
   - 반복 일정 설정을 바탕으로 날짜 배열을 생성
   - 매일/매주/매월/매년 반복 로직 구현 필요
   - 경계값 케이스 처리 (매월 31일, 윤년 2/29)

2. **validateRecurringConfig(startDate: string, repeat: RepeatInfo, endDate?: string): { isValid: boolean, errorMessage?: string }**
   - 반복 일정 설정이 유효한지 검증
   - 반복 종료일 검증 (endDate >= startDate)
   - interval 검증 (1 이상)

3. **splitRecurringEvent(event: Event, targetDate: string): { before?: Event, after?: Event }**
   - 반복 일정을 단일 인스턴스로 분할 (수정/삭제 시 사용)
   - 이전 일정 (시작일 ~ targetDate 전날)
   - 이후 일정 (targetDate 다음날 ~ 종료일)
   - repeatGroupId 유지

4. **getRepeatText(repeat: RepeatInfo): string**
   - 반복 정보를 사람이 읽을 수 있는 텍스트로 변환
   - 형식: "반복: 1일마다 (종료: YYYY-MM-DD)"
   - 종료일 없으면 종료일 정보 생략

5. **expandRecurringEvents(events: Event[], rangeStart: Date, rangeEnd: Date): Event[]**
   - 반복 일정을 날짜별 인스턴스로 전개
   - 뷰 타입에 맞는 날짜 범위만 전개
   - repeat.type='none'인 일정은 전개하지 않음

6. **isLeapYear(year: number): boolean**
   - 윤년 여부를 판별
   - 규칙: year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)

# 참고 파일

- docs/testcases/recurring-events-testcases.md (테스트 케이스 문서)
- src/__tests__/medium.integration.spec.tsx (통합 테스트 참고)
- src/utils/dateUtils.ts (기존 유틸 함수 구조 참고)
- src/utils/eventUtils.ts (기존 유틸 함수 구조 참고)
- src/hooks/useEventOperations.ts (기존 훅 구조 참고)
- src/types.ts (타입 정의 참고)

# 다음 작업자에게 남기는 코멘트

Implementation Engineer는 다음 파일들을 구현하여 모든 테스트를 통과(GREEN)시켜주세요:

## 1. src/utils/recurringUtils.ts 구현
각 함수의 구현이 필요합니다. 특히 다음 사항에 주의해주세요:

### generateRecurringDates 구현 시 주의사항:
- **매일 반복**: 시작일부터 종료일까지 모든 날짜 생성
- **매주 반복**: 시작일의 요일을 유지하며 매주 생성
- **매월 반복**: 
  - 같은 날짜에 매월 생성
  - **중요**: 31일이 없는 달(2월, 4월, 6월, 9월, 11월)은 건너뛰기
  - **중요**: 평년 2월은 29일/30일/31일 건너뛰기
- **매년 반복**: 
  - 같은 월/일에 매년 생성
  - **중요**: 윤년 2/29는 윤년에만 생성 (평년은 건너뛰기)
- **무한 반복**: endDate가 없으면 빈 배열 반환 (expandRecurringEvents에서 처리)

### validateRecurringConfig 구현 시 주의사항:
- endDate < startDate이면 에러: "반복 종료일은 시작일 이후여야 합니다."
- interval < 1이면 에러: "반복 간격은 1 이상이어야 합니다."
- repeat.type === 'none'이면 항상 유효

### splitRecurringEvent 구현 시 주의사항:
- targetDate가 시작일이면 before는 undefined
- targetDate가 종료일이면 after는 undefined
- before/after 모두 원본의 repeatGroupId를 유지
- 날짜 계산 시 매일/매주/매월/매년 반복 타입 고려

### expandRecurringEvents 구현 시 주의사항:
- repeat.type === 'none'인 일정은 그대로 반환
- endDate가 없는 반복 일정은 rangeStart ~ rangeEnd 범위 내에서만 전개
- 각 인스턴스는 원본 일정의 모든 정보를 복사하되 date만 변경
- generateRecurringDates 함수를 활용

### isLeapYear 구현:
- 공식: `year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)`

## 2. UI 구현 (App.tsx, EventForm 등)
통합 테스트를 통과시키기 위해 다음 UI 요소들이 필요합니다:
- "반복 일정" 체크박스
- "반복 유형" 드롭다운 (daily/weekly/monthly/yearly 옵션)
- "반복 종료일" 입력 필드
- Repeat 아이콘 (MUI Repeat 아이콘 사용)
- 반복 정보 텍스트 표시
- 반복 일정 수정/삭제 시 다이얼로그 ("해당 일정만 수정하시겠어요?")

## 3. useEventOperations 훅 확장
반복 일정 관련 로직을 추가해주세요:
- 반복 일정 생성 시 repeatGroupId 자동 생성 (uuid 또는 timestamp 사용)
- 단일 일정 수정/삭제 시 splitRecurringEvent 활용
- 전체 일정 수정/삭제 시 repeatGroupId 기준으로 처리
- 반복 일정은 겹침 검사 제외

## 4. 테스트 실행
구현 후 다음 명령어로 모든 테스트가 통과하는지 확인해주세요:
```bash
npm test -- src/__tests__/unit/easy.recurringUtils.spec.ts --run
npm test -- src/__tests__/recurring-events.integration.spec.tsx --run
```

모든 유닛 테스트와 통합 테스트가 GREEN 상태가 되어야 합니다.

