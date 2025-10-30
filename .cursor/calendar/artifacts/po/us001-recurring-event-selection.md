# User Story: 반복 일정 선택으로 일정을 자동 생성하고 관리한다

## 📋 Story

**As a** 일정 관리 사용자  
**I want** 일정 생성/수정 시 반복 유형(매일/매주/매월/매년)을 설정하여 일정 시리즈를 자동 생성할 수 있다  
**So that** 반복되는 업무/약속을 한 번의 설정으로 관리하고, 입력 시간을 절약하며 일정 누락을 방지한다

## 📖 Description

사용자가 일정을 생성하거나 수정할 때 반복 설정을 통해 일정 시리즈를 자동으로 생성할 수 있는 기능입니다. 반복 유형으로는 매일(daily), 매주(weekly), 매월(monthly), 매년(yearly) 4가지를 지원하며, 각 유형에 따라 특정 규칙을 적용합니다.

### 핵심 비즈니스 규칙

1. **날짜 대체 없음 원칙**: 존재하지 않는 날짜는 절대 대체하지 않고 스킵

   - 31일 시작 + 매월: 31일이 있는 달에만 생성
   - 30일 시작 + 매월: 2월은 스킵
   - 2월 29일 시작 + 매년: 윤년에만 생성 (2/28 또는 3/1로 대체하지 않음)

2. **겹침 무시 원칙**: 반복 일정 생성 시 기존 일정과의 시간 겹침을 검사하지 않음

3. **종료 조건 필수**: count(횟수) 또는 until(종료일) 중 하나는 반드시 지정

4. **안전 한도**: 최대 생성 상한 10,000회

### User Journey

1. 사용자가 일정 생성/수정 폼을 연다
2. 반복 설정을 활성화(`repeat.enabled = true`)한다
3. 반복 유형을 선택한다 (daily/weekly/monthly/yearly)
4. 종료 조건을 입력한다 (count 또는 until 중 하나)
5. 고급 옵션으로 interval을 설정한다 (선택, 기본값 1)
6. 시스템이 입력값을 검증하고 반복 인스턴스를 미리 계산한다
7. 사용자가 저장하면 규칙에 따라 모든 인스턴스가 생성/갱신된다
8. 캘린더 뷰에 각 인스턴스가 표시된다

### 사용자 시나리오 예시

**시나리오 1: 주간 회의 일정**

- 매주 수요일 오후 2시 팀 회의를 다음 3개월간 자동 생성
- 입력: 시작일 2025-11-05(수), 반복 유형 weekly, until=2026-02-05
- 결과: 매주 수요일 11회 자동 생성

**시나리오 2: 월말 정산 작업**

- 매월 마지막 날(31일이 있는 달만) 정산 작업을 설정
- 입력: 시작일 2025-01-31, 반복 유형 monthly, count=5
- 결과: 1월, 3월, 5월, 7월, 8월에만 생성 (2월, 4월, 6월, 9월은 스킵)

**시나리오 3: 생일/기념일 설정**

- 2월 29일 생일을 윤년에만 알림받기
- 입력: 시작일 2024-02-29, 반복 유형 yearly, until=2030-02-28
- 결과: 2024년, 2028년에만 생성 (2025-2027, 2029년은 스킵)

## ✅ Acceptance Criteria

### Scenario 1: monthly - 31일 시작 시 31일 있는 달에만 생성

```gherkin
Given 시작일이 2025-01-31 14:00-15:00 이고 반복 유형이 monthly 이다
  And 종료 조건으로 count=5 를 설정했다
  And interval=1 (기본값) 이다
When 일정을 저장한다
Then 31일이 있는 달에만 5회 생성되어야 한다
  And 발생 일자는 2025-01-31, 2025-03-31, 2025-05-31, 2025-07-31, 2025-08-31 이다
  And 2월, 4월, 6월, 9월, 11월은 스킵된다
  And 각 인스턴스의 시간은 14:00-15:00 이다
```

### Scenario 2: yearly - 2/29 시작 시 윤년에만 생성 (대체 없음)

```gherkin
Given 시작일이 2024-02-29 09:00-10:00 이고 반복 유형이 yearly 이다
  And 종료 조건으로 until=2030-02-28 을 설정했다
When 일정을 저장한다
Then 윤년에만 인스턴스가 생성되어야 한다
  And 발생 일자는 2024-02-29, 2028-02-29 이다
  And 2025, 2026, 2027, 2029, 2030년은 생성되지 않는다 (대체 없음)
  And 2월 28일 또는 3월 1일로 대체하지 않는다
```

### Scenario 3: weekly - 시작 요일 기준 반복

```gherkin
Given 시작일이 2025-10-29(수) 10:00-11:00 이고 반복 유형이 weekly 이다
  And 종료 조건으로 count=3 을 설정했다
When 일정을 저장한다
Then 매주 수요일에 3회 생성되어야 한다
  And 발생 일자는 2025-10-29, 2025-11-05, 2025-11-12 이다
  And 각 인스턴스는 수요일이다
```

### Scenario 4: daily - 겹침 무시 원칙

```gherkin
Given 시작일이 2025-11-01 08:00-09:00 이고 반복 유형이 daily 이다
  And 종료 조건으로 count=2 를 설정했다
  And 2025-11-02 08:30-09:30 에 다른 일정이 이미 존재한다
When 일정을 저장한다
Then 11/01, 11/02 모두 생성되어야 한다 (겹침 무시)
  And 충돌 경고나 자동 조정 없이 저장된다
  And 기존 일정과의 겹침 검사가 수행되지 않는다
```

### Scenario 5: 종료 조건 누락 에러

```gherkin
Given 반복 설정을 활성화했지만 count와 until을 모두 비워두었다
When 일정을 저장한다
Then 저장이 거부되고 에러가 표시되어야 한다
  And 에러 코드는 REPEAT_MISSING_SCOPE 이다
  And 사용자 메시지는 "반복 종료 조건을 지정하세요" 이다
  And 필드 위치는 repeat 영역이어야 한다
```

### Scenario 6: count와 until 동시 지정 에러

```gherkin
Given 반복 설정을 활성화하고 count=5 와 until=2026-12-31 을 모두 설정했다
When 일정을 저장한다
Then 저장이 거부되고 에러가 표시되어야 한다
  And 에러 코드는 REPEAT_INVALID_SCOPE 이다
  And 사용자 메시지는 "count와 until 중 하나만 지정하세요" 이다
```

### Scenario 7: endTime 자동 조정

```gherkin
Given startTime=14:00, endTime=13:30 으로 역전 입력했다
  And 반복 유형은 daily 이고 count=1 이다
When 일정을 저장한다
Then endTime 이 startTime+1h(15:00) 로 자동 조정되어 저장된다
  And 에러 코드는 TIME_INVALID_RANGE 이다
  And 정보 메시지 "종료 시간이 자동으로 1시간 뒤로 조정되었습니다" 가 표시된다
```

### Scenario 8: 생성 상한 초과 에러

```gherkin
Given 반복 유형이 daily 이고 until 로 수년 간 반복을 설정하여 10,000회를 초과한다
When 일정을 저장한다
Then 저장이 거부되고 에러가 표시되어야 한다
  And 에러 코드는 REPEAT_TOO_MANY 이다
  And 사용자 메시지는 "반복 횟수가 너무 큽니다(최대 10,000)" 이다
```

### Scenario 9: interval > 1 처리

```gherkin
Given 시작일이 2025-11-01 이고 반복 유형이 daily 이다
  And interval=2 로 설정하고 count=3 을 설정했다
When 일정을 저장한다
Then 2일마다 3회 생성되어야 한다
  And 발생 일자는 2025-11-01, 2025-11-03, 2025-11-05 이다
```

### Scenario 10: until 기반 종료 조건

```gherkin
Given 시작일이 2025-11-01 이고 반복 유형이 daily 이다
  And until=2025-11-05 을 설정했다
When 일정을 저장한다
Then 2025-11-01부터 2025-11-05까지 모든 날짜에 인스턴스가 생성되어야 한다
  And 발생 일자는 2025-11-01, 2025-11-02, 2025-11-03, 2025-11-04, 2025-11-05 이다
```

### Scenario 11: 반복 설정 비활성화 시

```gherkin
Given 반복 설정이 비활성화되어 있다 (repeat.enabled = false)
  And 반복 유형은 none 이다
When 일정을 저장한다
Then 단일 일정만 생성되고 반복 인스턴스는 생성되지 않는다
  And 종료 조건(count/until)은 무시된다
```

### Scenario 12: 30일 시작 + monthly (2월 스킵)

```gherkin
Given 시작일이 2025-01-30 이고 반복 유형이 monthly 이다
  And count=12 를 설정했다
When 일정을 저장한다
Then 30일이 있는 달에만 생성되어야 한다
  And 2월은 스킵된다 (30일이 없음)
```

### Scenario 13: count 기준 정확성 (startDate 포함)

```gherkin
Given 시작일이 2025-11-01 이고 반복 유형이 daily 이다
  And count=5 를 설정했다
When 일정을 저장한다
Then startDate 포함 정확히 5회 생성되어야 한다
  And 발생 일자는 2025-11-01, 2025-11-02, 2025-11-03, 2025-11-04, 2025-11-05 이다
  And 총 개수는 정확히 5개이다
```

### Scenario 14: 반복 일정 수정 (시리즈 전체 업데이트)

```gherkin
Given 기존에 반복 일정 시리즈가 생성되어 있다
  And 시리즈의 제목, 시간, 반복 규칙을 변경하려고 한다
When 일정을 수정하고 저장한다
Then 시리즈의 모든 인스턴스가 새로운 규칙으로 갱신되어야 한다
  And 기존 인스턴스가 삭제되고 새로운 인스턴스로 교체된다
```

## 📝 Tasks

### 🧪 Phase 1: Test Setup (Small)

**목표**: 테스트 환경 구성 및 Mock 데이터 준비

- [ ] MSW 핸들러 정의
  - [ ] Express API 엔드포인트 mock (`POST /api/events`, `PUT /api/events/:id`)
  - [ ] 성공 시나리오 (200, 201)
  - [ ] 클라이언트 에러 (400: 검증 실패)
  - [ ] 서버 에러 (500)
  - [ ] 네트워크 에러
- [ ] Test 유틸리티 함수 작성
  - [ ] 반복 인스턴스 생성 결과 비교 helper (`expectOccurrences`)
  - [ ] 날짜 유효성 검증 helper (`expectValidDates`)
  - [ ] ISO 8601 날짜 생성 helper
- [ ] Mock 데이터 생성 (API 응답 형식)
  - [ ] 정상 케이스: daily, weekly, monthly, yearly
  - [ ] 엣지 케이스: 31일, 2/29, 30일
  - [ ] 에러 케이스: 검증 실패 응답
- [ ] 테스트 환경 설정 (`setupTests.ts`)
  - [ ] 날짜 유틸리티 import
  - [ ] 타임존 설정 (KST)

**예상 소요**: Small (2-4시간)

---

### 🔴 Phase 2: Red - Test First (Medium)

**목표**: 실패하는 테스트 작성 (TDD Red Phase)

#### 2.1 Unit Tests - 반복 규칙 계산 로직

- [ ] `utils/repeatRuleGenerator.ts` (또는 유사 파일) 생성
- [ ] `generateDailyOccurrences()` 테스트
  - [ ] 기본 케이스: interval=1, count=3
  - [ ] interval > 1 케이스
  - [ ] until 기반 종료
- [ ] `generateWeeklyOccurrences()` 테스트
  - [ ] 시작 요일 기준 정확성
  - [ ] 여러 주에 걸친 생성
- [ ] `generateMonthlyOccurrences()` 테스트
  - [ ] 31일 시작 → 31일 있는 달만 생성
  - [ ] 30일 시작 → 2월 스킵
  - [ ] 29일 시작 → 평년 2월도 생성
  - [ ] interval > 1 케이스
- [ ] `generateYearlyOccurrences()` 테스트
  - [ ] 2/29 시작 → 윤년에만 생성
  - [ ] 기타 날짜 → 매년 생성
  - [ ] interval > 1 케이스

#### 2.2 Unit Tests - 검증 로직

- [ ] `validateRepeatRule()` 테스트
  - [ ] count와 until 모두 없음 → 에러
  - [ ] count와 until 동시 지정 → 에러
  - [ ] count만 지정 → 성공
  - [ ] until만 지정 → 성공
  - [ ] count 범위 검증 (1-1000)
  - [ ] interval 범위 검증 (1-12)
  - [ ] until 날짜 범위 검증 (startDate ≤ until ≤ startDate+10y)
- [ ] `validateOccurrenceCount()` 테스트
  - [ ] 10,000회 이하 → 통과
  - [ ] 10,000회 초과 → 에러
  - [ ] 계산 로직 정확성

#### 2.3 Unit Tests - 시간 처리

- [ ] `adjustEndTime()` 테스트
  - [ ] endTime ≤ startTime → startTime + 1h로 조정
  - [ ] endTime > startTime → 변경 없음
  - [ ] 23:00 이후 시간 처리 (자정 넘김)

#### 2.4 Integration Tests - 폼 연동

- [ ] `useEventForm` 또는 이벤트 폼 컴포넌트 테스트
  - [ ] 반복 설정 토글 활성화
  - [ ] 반복 유형 선택
  - [ ] 종료 조건 입력 (count/until)
  - [ ] interval 입력
  - [ ] 검증 에러 메시지 표시
- [ ] 폼 제출 시 반복 규칙 적용
  - [ ] 반복 활성화 시 인스턴스 생성
  - [ ] 반복 비활성화 시 단일 일정만 생성

#### 2.5 User Interaction Tests

- [ ] 사용자 이벤트 시뮬레이션
  - [ ] 반복 토글 클릭
  - [ ] 반복 유형 드롭다운 선택
  - [ ] count/until 입력 필드 입력
  - [ ] 에러 메시지 확인
- [ ] 폼 제출 테스트
  - [ ] 유효한 반복 규칙 제출 → 성공
  - [ ] 무효한 반복 규칙 제출 → 에러 표시

**예상 소요**: Medium (1-2일)

---

### 🟢 Phase 3: Green - Implementation (Large)

**목표**: 테스트를 통과시키는 최소 구현 (TDD Green Phase)

#### 3.1 데이터 모델 확장

- [ ] `src/types.ts` 업데이트
  - [ ] `RepeatInfo` 인터페이스에 `enabled: boolean` 추가
  - [ ] `RepeatInfo` 인터페이스에 `count?: number` 추가
  - [ ] `endDate` 필드 유지 (until과 동일 의미)
  - [ ] 타입 검증 강화

#### 3.2 반복 규칙 계산 로직 구현

- [ ] `src/utils/repeatRuleGenerator.ts` 생성
  - [ ] `generateDailyOccurrences()` 구현
    - [ ] interval 기반 일자 계산
    - [ ] count 기반 종료
    - [ ] until 기반 종료
  - [ ] `generateWeeklyOccurrences()` 구현
    - [ ] 시작 요일 기준 계산
    - [ ] interval 주기 계산
  - [ ] `generateMonthlyOccurrences()` 구현
    - [ ] 일(day-of-month) 기준 계산
    - [ ] 존재하지 않는 날짜 스킵 로직 (31일, 30일 등)
    - [ ] `getDaysInMonth()` 활용
  - [ ] `generateYearlyOccurrences()` 구현
    - [ ] 월-일 기준 계산
    - [ ] 윤년 판단 (`isLeapYear` 함수 필요)
    - [ ] 2/29 스킵 로직
  - [ ] 공통 함수: `generateOccurrences()` 메인 함수

#### 3.3 검증 로직 구현

- [ ] `src/utils/repeatValidation.ts` 생성
  - [ ] `validateRepeatRule()` 구현
    - [ ] enabled=false면 검증 스킵
    - [ ] count와 until 상호 배타 검증
    - [ ] 종료 조건 필수 검증
    - [ ] 값 범위 검증 (count: 1-1000, interval: 1-12)
    - [ ] until 날짜 범위 검증
  - [ ] `validateOccurrenceCount()` 구현
    - [ ] 생성 예상 횟수 계산
    - [ ] 10,000회 상한 체크
  - [ ] 에러 코드 정의 및 메시지 매핑

#### 3.4 날짜/시간 유틸리티 확장

- [ ] `src/utils/dateUtils.ts` 확장
  - [ ] `isLeapYear(year: number): boolean` 구현
  - [ ] `addDays(date: Date, days: number): Date` 구현
  - [ ] `addWeeks(date: Date, weeks: number): Date` 구현
  - [ ] `addMonths(date: Date, months: number): Date` 구현
  - [ ] `addYears(date: Date, years: number): Date` 구현
  - [ ] ISO 8601 날짜 생성/파싱 함수 (`toISO8601Date`, `fromISO8601Date`)

#### 3.5 시간 자동 조정 로직

- [ ] `src/utils/timeValidation.ts` 확장
  - [ ] `adjustEndTime(startTime: string, endTime: string): string` 구현
  - [ ] endTime ≤ startTime 시 +1h 자동 조정
  - [ ] 조정 여부 반환값 (조정됨/안 됨)

#### 3.6 폼 컴포넌트 업데이트

- [ ] `src/hooks/useEventForm.ts` 확장
  - [ ] `repeatCount` state 추가
  - [ ] 반복 설정 검증 로직 추가
  - [ ] 반복 인스턴스 생성 로직 통합
- [ ] 이벤트 폼 UI 컴포넌트 업데이트
  - [ ] 반복 설정 토글 UI
  - [ ] 반복 유형 선택 드롭다운
  - [ ] 종료 조건 선택 (라디오: count/until)
  - [ ] count 입력 필드 (숫자)
  - [ ] until 입력 필드 (날짜 선택기)
  - [ ] interval 입력 필드 (고급 옵션)
  - [ ] 에러 메시지 표시 영역

#### 3.7 API 연동

- [ ] 반복 일정 저장 로직
  - [ ] 반복 인스턴스 배열 생성
  - [ ] Express API 호출 (`POST /api/events` 또는 일괄 생성 엔드포인트)
  - [ ] 응답 데이터 처리
  - [ ] 에러 핸들링
- [ ] 반복 일정 수정 로직
  - [ ] 시리즈 전체 업데이트
  - [ ] Express API 호출 (`PUT /api/events/:id` 또는 일괄 업데이트)
  - [ ] 기존 인스턴스 삭제 후 재생성

#### 3.8 겹침 무시 규칙 적용

- [ ] 반복 일정 생성 시 겹침 검사 우회
  - [ ] `eventOverlap.ts`의 겹침 검사 로직에서 반복 일정 제외
  - [ ] 반복 일정 생성 플래그 추가

**예상 소요**: Large (3-5일)  
**의존성**: Phase 2 완료 필수

---

### 🔵 Phase 4: Refactor (Small)

**목표**: 코드 품질 개선 (TDD Refactor Phase)

#### 4.1 코드 정리

- [ ] 중복 코드 제거
  - [ ] 반복 유형별 공통 로직 추출
  - [ ] 날짜 계산 로직 통합
- [ ] 함수 분리 (단일 책임 원칙)
  - [ ] 큰 함수를 작은 함수로 분해
  - [ ] 순수 함수로 분리 가능한 로직 추출
- [ ] 매직 넘버/문자열 상수화
  - [ ] `MAX_OCCURRENCE_COUNT = 10000`
  - [ ] `MAX_COUNT = 1000`
  - [ ] `MAX_INTERVAL = 12`
  - [ ] 에러 메시지 상수화
- [ ] 타입 안정성 강화
  - [ ] 명시적 타입 정의
  - [ ] enum 활용 (`RepeatType`, `RepeatErrorCode`)
  - [ ] 유니온 타입 최소화

#### 4.2 성능 최적화

- [ ] 불필요한 리렌더링 방지
  - [ ] useMemo로 반복 인스턴스 계산 결과 캐싱
  - [ ] useCallback으로 핸들러 함수 메모이제이션
- [ ] 컴포넌트 분리
  - [ ] 반복 설정 폼을 별도 컴포넌트로 분리
  - [ ] 종료 조건 입력 컴포넌트 분리
- [ ] 디바운싱/쓰로틀링
  - [ ] 미리보기 계산 디바운싱 (선택사항)

#### 4.3 재사용성 향상

- [ ] 커스텀 훅 추출
  - [ ] `useRepeatRule()`: 반복 규칙 계산 및 검증
  - [ ] `useRepeatOccurrences()`: 인스턴스 생성 및 미리보기
- [ ] 공통 컴포넌트화
  - [ ] `RepeatTypeSelector` 컴포넌트
  - [ ] `RepeatEndCondition` 컴포넌트
- [ ] 유틸리티 함수 분리
  - [ ] 날짜 유틸리티 모듈 정리
  - [ ] 반복 규칙 유틸리티 모듈 정리

**예상 소요**: Small (1일)  
**의존성**: Phase 3 완료 필수

---

### 📝 Phase 5: Documentation (Small)

**목표**: 문서화 및 최종 검증

- [ ] JSDoc 주석 추가
  - [ ] 반복 규칙 생성 함수들
  - [ ] 검증 함수들
  - [ ] 복잡한 날짜 로직의 근거 설명
- [ ] README 업데이트
  - [ ] 반복 일정 기능 섹션 추가
  - [ ] 반복 규칙 및 예외(31일, 2/29) 설명
  - [ ] 사용 예시
- [ ] 코드 리뷰 요청 준비
  - [ ] PR 설명 작성
  - [ ] 테스트 커버리지 리포트
- [ ] 최종 테스트 실행 및 커버리지 확인
  - [ ] Unit Test 커버리지 ≥ 80%
  - [ ] Integration Test 통과 확인
  - [ ] 모든 Acceptance Criteria 충족 확인

**예상 소요**: Small (0.5일)

---

## 📊 Story Points

**복잡도**: **8** (피보나치)

**추정 근거**:

- **구현 복잡도**: 상
  - 날짜 계산 로직 복잡 (monthly, yearly)
  - 엣지 케이스 다수 (31일, 2/29, 스킵 로직)
  - 검증 규칙 다수
- **테스트 복잡도**: 상
  - 다양한 반복 유형별 테스트
  - 엣지 케이스 테스트 다수
  - 통합 테스트 필요
- **UI 복잡도**: 중
  - 반복 설정 폼 UI 추가
  - 종료 조건 선택 UI
  - 에러 메시지 표시
- **기술적 불확실성**: 중
  - 날짜 계산 로직의 정확성 검증 필요
  - 윤년 처리 로직 검증 필요

## 🔧 Technical Notes

### 기술 스택

- **Frontend**: React + TypeScript
- **Backend**: Express.js REST API (기구현됨)
- **Database**: JSON 파일 기반 (서버 측)
- **UI Library**: MUI (Material-UI) - 기구현됨
- **State**: useState, useEventForm hook 확장
- **Testing**: Vitest + Testing Library
- **Mocking**: MSW (Express API mock)

### 구현 고려사항

- **날짜/시간 처리**

  - 모든 날짜/시간은 KST(UTC+9) 기준
  - ISO 8601 형식 사용 (`YYYY-MM-DD`, `YYYY-MM-DDTHH:mm:ss+09:00`)
  - JavaScript `Date` 객체 활용, 주의: 월은 0-based (0=1월)

- **존재하지 않는 날짜 처리**

  - `getDaysInMonth(year, month)` 활용
  - 31일 스킵: `targetDay > getDaysInMonth(year, month)` 체크
  - 2/29 스킵: `isLeapYear(year)` 체크

- **반복 인스턴스 생성**

  - 클라이언트 측에서 계산 후 서버에 전송
  - 또는 서버 측에서 계산 (API 설계에 따라)

- **에러 처리**

  - 사용자 친화적 메시지 표시
  - 필드별 에러 표시
  - 에러 코드와 메시지 매핑

- **성능**
  - 대량 인스턴스 생성 시 (최대 10,000회)
  - 점진적 계산 또는 배치 처리 고려
  - UI 블로킹 방지 (비동기 처리)

### API 엔드포인트 (가정)

```typescript
// POST /api/events (일정 생성)
// Request Body:
{
  title: string;
  date: string; // ISO 8601 (YYYY-MM-DD)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  description: string;
  location: string;
  category: string;
  repeat: {
    enabled: boolean;
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    count?: number;
    endDate?: string; // ISO 8601 (YYYY-MM-DD)
  };
  notificationTime: number;
}

// Response:
{
  success: boolean;
  data?: {
    events: Event[]; // 생성된 인스턴스 배열
    repeat: {
      enabled: boolean;
      type: string;
      interval: number;
      count?: number;
      endDate?: string;
    };
    occurrences: string[]; // ISO 8601 datetime 배열
    skipped?: number; // 스킵된 날짜 개수 (선택)
  };
  error?: {
    code: string;
    message: string;
    field?: string;
  };
}

// PUT /api/events/:id (일정 수정)
// Request Body: 동일
// Response: 동일
```

### 데이터 모델

```typescript
// src/types.ts 확장
interface RepeatInfo {
  enabled: boolean; // 반복 활성화 여부
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // 1-12, 기본값 1
  count?: number; // 1-1000, until과 상호 배타적
  endDate?: string; // ISO 8601 (YYYY-MM-DD), count와 상호 배타적
}

interface EventForm {
  title: string;
  date: string; // ISO 8601 (YYYY-MM-DD), KST 기준
  startTime: string; // HH:mm (00:00-23:59)
  endTime: string; // HH:mm
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number; // 분 단위
}

interface Event extends EventForm {
  id: string;
}
```

### 의존성

- **기존 유틸리티**

  - `src/utils/dateUtils.ts`: `getDaysInMonth()` (기존)
  - `src/utils/timeValidation.ts`: 시간 검증 로직 확장
  - `src/utils/eventOverlap.ts`: 반복 일정 제외 처리

- **신규 구현 필요**
  - `src/utils/repeatRuleGenerator.ts`: 반복 규칙 계산
  - `src/utils/repeatValidation.ts`: 반복 규칙 검증
  - 날짜 연산 함수: `addDays`, `addWeeks`, `addMonths`, `addYears`, `isLeapYear`

## 📚 Definition of Done

- [ ] 모든 Acceptance Criteria 충족 (14개 시나리오)
- [ ] Unit Test 커버리지 80% 이상
- [ ] Integration Test 작성 완료 및 통과
- [ ] 코드 리뷰 승인
- [ ] 문서화 완료 (README, JSDoc)
- [ ] 수동 테스트 완료 (주요 시나리오)
- [ ] 성능 기준 충족 (10,000회 생성 ≤ 2초)

## 🔗 Related

- **Epic**: 반복 일정 기능 v1.0
- **Dependencies**:
  - 일정 생성/수정 폼 기존 로직
  - 캘린더 뷰 표시 로직
  - Express API 서버
- **Related Stories**: (추가 예정)
- **Specification**:
  - `.cursor/calendar/artifacts/spec-writer/반복 일정 선택(생성:수정)_spec_20251029.md`
  - `.cursor/calendar/artifacts/spec-writer/반복_일정_기능_PRD_v1.0.md`

---

**Created**: 2025-10-29  
**Priority**: High  
**Status**: User Story Complete ✅  
**Next Action**: 내용을 확인하신 후 승인해주시면 @test-architect에게 테스트 케이스 작성을 요청하겠습니다.

---

**승인 후 저장 경로**: `.cursor/calendar/artifacts/po/us001-recurring-event-selection.md`  
**예시**: 이미 저장되었습니다.
