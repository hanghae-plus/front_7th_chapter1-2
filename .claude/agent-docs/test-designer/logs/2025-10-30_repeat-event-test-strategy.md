# 테스트 전략: 반복 일정 기능

**작성일**: 2025-10-30
**작성자**: test-designer agent
**버전**: 1.0.0
**Phase**: Phase 2 - Test Design

---

## 1. 테스트 전략 개요

### 1.1 목표

반복 일정 기능의 완전한 품질 보증을 위해 단위 테스트, 통합 테스트, E2E 테스트를 작성하고 80% 이상의 코드 커버리지 달성.

### 1.2 테스트 구조

```
src/__tests__/
├── unit/
│   └── task.repeatUtils.spec.ts           # 순수 함수 테스트 (20-25개)
├── hooks/
│   └── task.useEventOperations.spec.ts    # 훅 테스트 (10-15개)
└── integration/
    └── task.repeat-event-integration.spec.ts # E2E 테스트 (8-12개)
```

### 1.3 테스트 통계

| 카테고리 | 테스트 파일 | 예상 케이스 | 총 라인 수 |
|---------|-----------|-----------|----------|
| 단위 테스트 (유틸) | 1 | 20-25 | 350-450 |
| 훅 테스트 | 1 | 10-15 | 200-300 |
| 통합 테스트 | 1 | 8-12 | 200-300 |
| **총계** | **3** | **38-52** | **750-1,050** |

### 1.4 커버리지 목표

- **전체 커버리지**: 80% 이상
- **핵심 함수 커버리지**: 100%
  - `generateRepeatDates`: 100%
  - `getNextRepeatDate`: 100%
  - `isValid31stMonthly`: 100%
  - `isValidLeapYearFeb29`: 100%
- **훅 메서드 커버리지**: 90% 이상
  - `saveRecurringEvents`: 90%
  - `updateRecurringSeries`: 90%
  - `deleteRecurringSeries`: 90%
- **통합 흐름 커버리지**: 85% 이상

### 1.5 테스트 우선순위

| 순위 | 항목 | 난이도 | 우선도 | 근거 |
|-----|------|-------|-------|------|
| 1 | `generateRepeatDates` | 중 | P0 | 핵심 로직, 복잡한 날짜 계산 |
| 2 | `isValid31stMonthly` | 저 | P0 | 특수 규칙, 간단하지만 중요 |
| 3 | `isValidLeapYearFeb29` | 저 | P0 | 특수 규칙, 간단하지만 중요 |
| 4 | `getNextRepeatDate` | 중 | P1 | 보조 함수, 필요하지만 덜 복잡 |
| 5 | `saveRecurringEvents` | 중 | P0 | API 통신, MSW 모킹 필요 |
| 6 | `updateRecurringSeries` | 중 | P1 | API 통신, 선택적 필드 처리 |
| 7 | `deleteRecurringSeries` | 저 | P1 | API 통신, 간단한 DELETE |
| 8 | E2E 통합 테스트 | 고 | P0 | 전체 흐름, 실제 사용 시나리오 |
| 9 | 겹침 제외 검증 | 저 | P1 | 기존 함수 수정, 회귀 테스트 |

---

## 2. 테스트 케이스 상세 설계

### 2.1 단위 테스트: `task.repeatUtils.spec.ts`

**목적**: 반복 일정 날짜 생성 로직의 순수 함수 테스트

**총 케이스**: 20-25개

#### 2.1.1 `generateRepeatDates` 테스트 (10-12개)

```typescript
describe('generateRepeatDates - 반복 일정 날짜 배열 생성', () => {
```

**테스트 케이스**:

1. **반복 없음 (daily, daily 간격 1)**
   - 입력: baseDate='2025-01-15', repeatInfo={type: 'daily', interval: 1}
   - 예상: 최대 2년(730일) 생성
   - 경계: 2년 경계 확인

2. **매일 반복, 종료일 있음**
   - 입력: baseDate='2025-01-15', repeatInfo={type: 'daily', interval: 1, endDate: '2025-01-20'}
   - 예상: ['2025-01-15', '2025-01-16', '2025-01-17', '2025-01-18', '2025-01-19', '2025-01-20']
   - 경계: 종료일 포함

3. **매일 반복, 간격 3일**
   - 입력: baseDate='2025-01-15', repeatInfo={type: 'daily', interval: 3, endDate: '2025-01-30'}
   - 예상: 3일 단위로 생성
   - 검증: 길이 = 6

4. **매주 반복, 종료일 2개월**
   - 입력: baseDate='2025-01-15', repeatInfo={type: 'weekly', interval: 1, endDate: '2025-03-15'}
   - 예상: 7일 단위로 생성, 약 9개
   - 검증: 모두 같은 요일 (수요일)

5. **매주 반복, 간격 2주**
   - 입력: baseDate='2025-01-15', repeatInfo={type: 'weekly', interval: 2, endDate: '2025-02-15'}
   - 예상: 14일 단위로 생성
   - 검증: 첫 번째와 두 번째 날짜 차이 = 14일

6. **매월 반복, 일반 일자 (15일)**
   - 입력: baseDate='2025-01-15', repeatInfo={type: 'monthly', interval: 1, endDate: '2025-06-15'}
   - 예상: 매월 15일 [1-15, 2-15, 3-15, 4-15, 5-15, 6-15]
   - 검증: 길이 = 6

7. **매월 반복, 31일 (특수 규칙)**
   - 입력: baseDate='2025-01-31', repeatInfo={type: 'monthly', interval: 1, endDate: '2025-12-31'}
   - 예상: 31일 있는 달만 [1-31, 3-31, 5-31, 7-31, 8-31, 10-31, 12-31]
   - 경계: 2월, 4월, 6월, 9월, 11월 제외

8. **매월 반복, 30일 (2월 처리)**
   - 입력: baseDate='2025-01-30', repeatInfo={type: 'monthly', interval: 1, endDate: '2025-03-30'}
   - 예상: [1-30, 3-30] (2월 제외)
   - 검증: 2월 자동 건너뜀

9. **매년 반복, 일반 날짜**
   - 입력: baseDate='2025-01-15', repeatInfo={type: 'yearly', interval: 1, endDate: '2029-01-15'}
   - 예상: [2025-01-15, 2026-01-15, 2027-01-15, 2028-01-15, 2029-01-15]
   - 검증: 길이 = 5

10. **매년 반복, 2월 29일 (윤년 규칙)**
    - 입력: baseDate='2024-02-29', repeatInfo={type: 'yearly', interval: 1, endDate: '2032-02-29'}
    - 예상: [2024-02-29, 2028-02-29, 2032-02-29] (2025, 2026, 2027, 2029, 2030, 2031 제외)
    - 경계: 윤년만 포함, 평년 자동 건너뜀

11. **매년 반복, 간격 4년 (윤년 사이)**
    - 입력: baseDate='2024-02-29', repeatInfo={type: 'yearly', interval: 4, endDate: '2040-02-29'}
    - 예상: [2024-02-29, 2028-02-29, 2032-02-29, 2036-02-29, 2040-02-29]
    - 검증: 4년 간격 윤년만

12. **예외: type='none'**
    - 입력: repeatInfo={type: 'none', interval: 1}
    - 예상: [] (빈 배열)

13. **예외: 유효하지 않은 baseDate**
    - 입력: baseDate='invalid-date'
    - 예상: [] (빈 배열)

14. **예외: interval <= 0**
    - 입력: interval=-1 또는 0
    - 예상: [] (빈 배열)

15. **예외: endDate < baseDate**
    - 입력: baseDate='2025-12-31', endDate='2025-01-01'
    - 예상: [] (빈 배열)

#### 2.1.2 `getNextRepeatDate` 테스트 (5-6개)

```typescript
describe('getNextRepeatDate - 다음 반복 날짜 계산', () => {
```

**테스트 케이스**:

1. **매일 반복, 간격 1**
   - 입력: currentDate='2025-01-15', repeatType='daily', interval=1
   - 예상: '2025-01-16'

2. **매일 반복, 간격 10**
   - 입력: currentDate='2025-01-15', repeatType='daily', interval=10
   - 예상: '2025-01-25'

3. **매주 반복, 간격 1**
   - 입력: currentDate='2025-01-15', repeatType='weekly', interval=1
   - 예상: '2025-01-22' (7일 후)

4. **매월 반복, 간격 1**
   - 입력: currentDate='2025-01-31', repeatType='monthly', interval=1
   - 예상: '2025-02-28' (2월은 28/29일이므로 끝 날짜)

5. **매년 반복, 간격 1**
   - 입력: currentDate='2025-01-15', repeatType='yearly', interval=1
   - 예상: '2026-01-15'

6. **예외: type='none'**
   - 입력: repeatType='none'
   - 예상: null

7. **예외: 유효하지 않은 날짜**
   - 입력: currentDate='invalid'
   - 예상: null

#### 2.1.3 `isValid31stMonthly` 테스트 (4-5개)

```typescript
describe('isValid31stMonthly - 31일 매월 규칙 검증', () => {
```

**테스트 케이스**:

1. **31일 있는 달 (1월)**
   - 입력: '2025-01-31'
   - 예상: true

2. **31일 있는 달 (5월)**
   - 입력: '2025-05-31'
   - 예상: true

3. **31일 없는 달 (2월)**
   - 입력: '2025-02-28'
   - 예상: false

4. **31일 없는 달 (4월)**
   - 입력: '2025-04-30'
   - 예상: false

5. **31일 있는 달, 다른 일자 (1월 15일)**
   - 입력: '2025-01-15'
   - 예상: true

#### 2.1.4 `isValidLeapYearFeb29` 테스트 (4-5개)

```typescript
describe('isValidLeapYearFeb29 - 윤년 2월 29일 규칙 검증', () => {
```

**테스트 케이스**:

1. **윤년 2월 29일**
   - 입력: '2024-02-29'
   - 예상: true

2. **윤년 2월 29일 (400년마다 나뉘는 경우)**
   - 입력: '2000-02-29'
   - 예상: true

3. **평년 2월 28일**
   - 입력: '2025-02-28'
   - 예상: false

4. **평년 2월 (윤년 규칙 예외 - 100으로 나뉘고 400으로는 안 나뉨)**
   - 입력: '1900-02-29' (1900은 평년)
   - 예상: false

5. **윤년이지만 2월이 아님**
   - 입력: '2024-03-29'
   - 예상: false

#### 2.1.5 보조 함수 테스트 (2-3개)

```typescript
describe('formatRepeatInfo - 반복 정보 문자열 변환', () => {
```

**테스트 케이스**:

1. **반복 없음**
   - 입력: {type: 'none', interval: 1}
   - 예상: ''

2. **매일, 간격 1**
   - 입력: {type: 'daily', interval: 1}
   - 예상: '매일'

3. **매주, 간격 2**
   - 입력: {type: 'weekly', interval: 2, endDate: '2025-12-31'}
   - 예상: '매주 (2주마다) ~ 2025-12-31'

---

### 2.2 훅 테스트: `task.useEventOperations.spec.ts`

**목적**: API 통신 훅의 배치 API 메서드 테스트

**총 케이스**: 10-15개

**의존성**: MSW 핸들러 설정, 반복 유틸 함수

#### 2.2.1 `saveRecurringEvents` 테스트 (4-5개)

```typescript
describe('useEventOperations - saveRecurringEvents', () => {
```

**테스트 케이스**:

1. **반복 일정 배치 생성 성공**
   - Given: 매주 반복, 3주간 EventForm
   - When: saveRecurringEvents 호출
   - Then: POST /api/events-list 호출됨, events 업데이트됨
   - 검증:
     - 요청 본문에 3개의 EventForm 포함
     - 응답에서 id와 repeat.id 할당됨
     - enqueueSnackbar('반복 일정이 생성되었습니다. (3개)') 호출됨
     - fetchEvents 호출됨

2. **반복 날짜가 없는 경우**
   - Given: 유효하지 않은 반복 정보
   - When: saveRecurringEvents 호출
   - Then: API 호출 없음
   - 검증: enqueueSnackbar('반복 일정을 생성할 수 없습니다.') 호출됨

3. **API 실패 (500 에러)**
   - Given: MSW 핸들러가 500 에러 반환
   - When: saveRecurringEvents 호출
   - Then: 에러 처리됨
   - 검증: enqueueSnackbar('반복 일정 생성 실패') 호출됨

4. **네트워크 에러**
   - Given: 네트워크 연결 끊김
   - When: saveRecurringEvents 호출
   - Then: 에러 처리됨
   - 검증: enqueueSnackbar('네트워크 연결을 확인해주세요.') 또는 기본 에러 메시지

5. **31일 특수 규칙으로 인한 배치 생성**
   - Given: 2025-01-31부터 2025-06-31까지 매월 반복
   - When: saveRecurringEvents 호출
   - Then: 5개의 일정 생성 (2월 제외)
   - 검증: events 배열에 5개 아이템 포함

#### 2.2.2 `updateRecurringSeries` 테스트 (3-4개)

```typescript
describe('useEventOperations - updateRecurringSeries', () => {
```

**테스트 케이스**:

1. **반복 시리즈 전체 수정 성공**
   - Given: repeatId='repeat-123', updateData={title: '수정된 제목'}
   - When: updateRecurringSeries 호출
   - Then: PUT /api/recurring-events/repeat-123 호출됨
   - 검증:
     - 요청 본문에 updateData 포함
     - fetchEvents 호출됨
     - enqueueSnackbar('반복 일정 시리즈가 수정되었습니다.') 호출됨

2. **반복 시리즈 수정 - 시리즈 없음 (404)**
   - Given: 존재하지 않는 repeatId='invalid-repeat-id'
   - When: updateRecurringSeries 호출
   - Then: 404 에러 처리됨
   - 검증: enqueueSnackbar('반복 일정 시리즈를 찾을 수 없습니다.') 호출됨

3. **반복 정보 부분 수정**
   - Given: repeatId, updateData={repeat: {endDate: '2025-12-31'}}
   - When: updateRecurringSeries 호출
   - Then: 종료일만 수정됨
   - 검증: 요청 본문에 repeat 필드 포함

#### 2.2.3 `deleteRecurringSeries` 테스트 (3-4개)

```typescript
describe('useEventOperations - deleteRecurringSeries', () => {
```

**테스트 케이스**:

1. **반복 시리즈 전체 삭제 성공**
   - Given: repeatId='repeat-123'
   - When: deleteRecurringSeries 호출
   - Then: DELETE /api/recurring-events/repeat-123 호출됨
   - 검증:
     - fetchEvents 호출됨
     - enqueueSnackbar('반복 일정 시리즈가 삭제되었습니다.') 호출됨

2. **반복 시리즈 삭제 - 시리즈 없음 (404)**
   - Given: 존재하지 않는 repeatId
   - When: deleteRecurringSeries 호출
   - Then: 404 에러 처리됨
   - 검증: enqueueSnackbar('반복 일정 시리즈를 찾을 수 없습니다.') 호출됨

#### 2.2.4 `saveEvent` 분기 로직 테스트 (2-3개)

```typescript
describe('useEventOperations - saveEvent 분기 로직', () => {
```

**테스트 케이스**:

1. **신규 반복 일정: 배치 API 사용**
   - Given: editing=false, eventData.repeat.type='weekly'
   - When: saveEvent 호출
   - Then: POST /api/events-list 호출됨 (단일 API 아님)
   - 검증: 요청 URL이 /api/events-list 포함

2. **신규 일반 일정: 단일 API 사용**
   - Given: editing=false, eventData.repeat.type='none'
   - When: saveEvent 호출
   - Then: POST /api/events 호출됨
   - 검증: 요청 URL이 /api/events

3. **수정: 반복 여부 상관없이 단일 API 사용**
   - Given: editing=true, eventData.repeat.type='daily'
   - When: saveEvent 호출
   - Then: PUT /api/events/:id 호출됨
   - 검증: 요청 URL이 /api/events/:id 포함

---

### 2.3 통합 테스트: `task.repeat-event-integration.spec.ts`

**목적**: 반복 일정 전체 흐름 테스트 (생성 → 표시 → 수정 → 삭제)

**총 케이스**: 8-12개

#### 2.3.1 완전한 E2E 시나리오 (3-4개)

```typescript
describe('반복 일정 전체 흐름 - E2E', () => {
```

**테스트 케이스**:

1. **매주 반복 일정: 생성 → 표시 → 수정 → 삭제 완전 흐름**
   - Given: 초기 이벤트 목록
   - Step 1 (생성): 매주 반복, 5주간 회의 일정 생성
   - Then 1: events 배열에 5개 아이템 추가됨, 모두 같은 repeatId
   - Step 2 (표시): 달력에서 모든 회의가 표시됨
   - Then 2: findByTestId('event-item') 5개 모두 찾음
   - Step 3 (수정): 제목을 '수정된 회의'로 변경
   - Then 3: 모든 회의의 제목 변경됨, repeat.id 유지
   - Step 4 (삭제): 시리즈 전체 삭제
   - Then 4: events 배열에서 5개 모두 제거됨

2. **31일 매월 반복: 생성 → 표시 검증**
   - Given: 2025-01-31부터 2025-12-31까지
   - Step 1: 매월 반복 일정 생성
   - Then 1: 7개 생성됨 (2, 4, 6, 9, 11월 제외)
   - Step 2: 달력에서 정확한 달에만 표시됨
   - Then 2: 2월, 4월에 일정 없음을 확인

3. **윤년 2월 29일 반복: 4년 주기 검증**
   - Given: 2024-02-29부터 2032-02-29까지 매년 반복
   - Step 1: 매년 반복 일정 생성
   - Then 1: 3개 생성됨 (2024, 2028, 2032만)
   - Step 2: 윤년이 아닌 해에는 표시 안 됨
   - Then 2: 2025, 2026, 2027 확인시 해당 일정 없음

#### 2.3.2 특수 규칙 시나리오 (2-3개)

```typescript
describe('반복 일정 특수 규칙', () => {
```

**테스트 케이스**:

1. **31일 매월: 4월 30일 기준 처리**
   - Given: baseDate='2025-04-30'
   - Step 1: 매월 반복 설정
   - Then 1: 다음 달은 5월 30일 아님, 5월 31일로 생성
   - 검증: generateRepeatDates 호출 결과 확인

2. **2월 29일 윤년 규칙: 1900년 vs 2000년**
   - Given: 특정 연도의 윤년 판별
   - When: isValidLeapYearFeb29 호출
   - Then: 1900년(평년), 2000년(윤년) 올바르게 구분

#### 2.3.3 일정 겹침 제외 검증 (2-3개)

```typescript
describe('반복 일정과 일정 겹침 감지', () => {
```

**테스트 케이스**:

1. **반복 일정은 겹침 체크 제외**
   - Given: 매주 반복 일정과 동일 시간 일반 일정
   - When: findOverlappingEvents 호출
   - Then: 반복 일정은 겹침으로 인식 안 됨
   - 검증: overlapping.length === 0

2. **일반 일정끼리만 겹침 체크**
   - Given: 두 개의 일반 일정 (시간 겹침)
   - When: findOverlappingEvents 호출
   - Then: 겹침 감지됨
   - 검증: overlapping.length === 1

3. **반복 일정끼리는 겹침 체크 제외**
   - Given: 두 개의 반복 일정 (시간 겹침)
   - When: findOverlappingEvents 호출
   - Then: 겹침 감지 안 됨
   - 검증: overlapping.length === 0

#### 2.3.4 에러 시나리오 (2-3개)

```typescript
describe('반복 일정 에러 처리', () => {
```

**테스트 케이스**:

1. **반복 종료일이 시작일보다 이전**
   - Given: startDate='2025-12-31', endDate='2025-01-01'
   - When: generateRepeatDates 호출
   - Then: 빈 배열 반환
   - 검증: length === 0

2. **유효하지 않은 간격 값**
   - Given: interval=-1 또는 0
   - When: generateRepeatDates 호출
   - Then: 빈 배열 반환

3. **API 통신 실패 시 상태 보존**
   - Given: MSW 핸들러가 에러 반환
   - When: saveRecurringEvents 호출
   - Then: events 배열이 변경되지 않음 (롤백)
   - 검증: events.length 이전 값과 동일

---

## 3. MSW 핸들러 전략

### 3.1 필요한 핸들러

#### 3.1.1 배치 생성 핸들러

```typescript
http.post('/api/events-list', async ({ request }) => {
  const { events } = (await request.json()) as BatchCreateEventsRequest;

  if (!events || events.length === 0) {
    return new HttpResponse(null, { status: 400 });
  }

  const repeatId = crypto.randomUUID();
  const createdEvents = events.map((event) => ({
    id: crypto.randomUUID(),
    ...event,
    repeat: {
      ...event.repeat,
      id: event.repeat.type !== 'none' ? repeatId : undefined,
    },
  }));

  return HttpResponse.json({ events: createdEvents }, { status: 201 });
})
```

#### 3.1.2 시리즈 수정 핸들러

```typescript
http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
  const { repeatId } = params;
  const updateData = (await request.json()) as UpdateRecurringSeriesRequest;

  // 실제 구현에서는 repeatId로 시리즈의 모든 일정을 찾아 업데이트
  // 테스트용으로는 성공 응답 반환
  return HttpResponse.json({ success: true }, { status: 200 });
})
```

#### 3.1.3 시리즈 삭제 핸들러

```typescript
http.delete('/api/recurring-events/:repeatId', ({ params }) => {
  const { repeatId } = params;

  // 실제 구현에서는 repeatId로 시리즈의 모든 일정을 삭제
  // 테스트용으로는 204 No Content 반환
  return new HttpResponse(null, { status: 204 });
})
```

### 3.2 기존 핸들러 확장

기존 `/api/events` 핸들러는 유지하되, `repeat` 필드 처리 추가:

```typescript
http.post('/api/events', async ({ request }) => {
  const newEvent = (await request.json()) as EventForm;

  const event: Event = {
    id: String(events.length + 1),
    ...newEvent,
    repeat: {
      ...newEvent.repeat,
      // repeat.id는 서버에서 할당되지 않음 (배치 API에서만)
    },
  };

  return HttpResponse.json(event, { status: 201 });
})
```

### 3.3 핸들러 배치 설정

`src/__mocks__/handlersUtils.ts`에서 함수로 관리:

```typescript
export function setupMockHandlerBatchCreation() {
  server.use(
    http.post('/api/events-list', async ({ request }) => {
      // 배치 생성 핸들러
    })
  );
}

export function setupMockHandlerRecurringSeries() {
  server.use(
    http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
      // 시리즈 수정 핸들러
    }),
    http.delete('/api/recurring-events/:repeatId', ({ params }) => {
      // 시리즈 삭제 핸들러
    })
  );
}
```

---

## 4. 테스트 데이터 및 픽스처

### 4.1 기본 반복 정보 픽스처

```typescript
const recurringEventFixtures = {
  dailyEvent: {
    title: '매일 회의',
    date: '2025-01-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '매일 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'daily', interval: 1, endDate: '2025-01-20' },
    notificationTime: 10,
  },

  weeklyEvent: {
    title: '주간 회의',
    date: '2025-01-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-02-15' },
    notificationTime: 10,
  },

  monthlyEvent31st: {
    title: '월말 회의',
    date: '2025-01-31',
    startTime: '14:00',
    endTime: '15:00',
    description: '월말 팀 미팅',
    location: '회의실 C',
    category: '업무',
    repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
    notificationTime: 10,
  },

  yearlyFeb29: {
    title: '윤년 기념일',
    date: '2024-02-29',
    startTime: '09:00',
    endTime: '17:00',
    description: '특별한 날',
    location: '본사',
    category: '특별',
    repeat: { type: 'yearly', interval: 1, endDate: '2032-02-29' },
    notificationTime: 60,
  },
};
```

### 4.2 예상 날짜 매트릭스

#### 4.2.1 31일 매월 반복 테스트 매트릭스

| 기준월 | 반복 종료 | 예상 개수 | 포함 월 |
|--------|---------|---------|--------|
| 2025-01 | 2025-06 | 5 | 1,3,5,7,8,10,12 중 1-6월 |
| 2025-01 | 2025-12 | 7 | 1,3,5,7,8,10,12 |
| 2024-01 | 2024-12 | 7 | 1,3,5,7,8,10,12 |

#### 4.2.2 윤년 2월 29일 반복 테스트 매트릭스

| 기준연도 | 반복 종료 | 예상 개수 | 포함 연도 |
|---------|---------|---------|---------|
| 2024 | 2032 | 3 | 2024,2028,2032 |
| 2020 | 2040 | 6 | 2020,2024,2028,2032,2036,2040 |
| 1996 | 2004 | 3 | 1996,2000,2004 |

#### 4.2.3 2월 30일 처리 테스트 매트릭스

| 기준월 | 기준일 | 다음 날짜 | 설명 |
|--------|--------|---------|------|
| 2025-01 | 30 | 2025-03-30 | 2월 건너뜀 |
| 2024-01 | 31 | 2024-03-31 | 윤년 2월 29일 처리 |
| 2025-02 | 28 | 2025-03-28 | 평년 2월 |

---

## 5. 테스트 실행 및 커버리지 계획

### 5.1 실행 순서

1. **Phase 3 (RED)**: 모든 테스트 파일 작성
   ```bash
   pnpm test:ui
   # 모든 테스트 RED (실패) 상태 확인
   ```

2. **Phase 4 (GREEN)**: 구현 코드 작성
   ```bash
   pnpm test -- task.repeatUtils.spec.ts
   # repeatUtils 테스트 통과 확인

   pnpm test -- task.useEventOperations.spec.ts
   # useEventOperations 훅 테스트 통과 확인

   pnpm test -- task.repeat-event-integration.spec.ts
   # 통합 테스트 통과 확인
   ```

3. **커버리지 검증**
   ```bash
   pnpm test:coverage
   # 출력: .coverage/index.html 생성
   # 목표: 80% 이상 달성 확인
   ```

### 5.2 커버리지 목표 상세

**`src/utils/repeatUtils.ts`**:
- 목표: 100%
- 주요 경로:
  - `generateRepeatDates`: 모든 RepeatType 포함 (daily/weekly/monthly/yearly)
  - `isValid31stMonthly`: 모든 월 포함 (12개 월)
  - `isValidLeapYearFeb29`: 윤년/평년 모두 포함
  - Edge cases: 빈 배열, null, 유효하지 않은 입력

**`src/hooks/useEventOperations.ts`**:
- 목표: 90% 이상
- 주요 경로:
  - `saveRecurringEvents`: 성공/실패 경로 모두
  - `updateRecurringSeries`: 성공/404 에러 경로
  - `deleteRecurringSeries`: 성공/404 에러 경로
  - `saveEvent`: 단일/배치 분기 로직

**`src/utils/eventOverlap.ts`**:
- 목표: 90% 이상 (기존 함수 수정)
- 주요 경로:
  - 반복 일정 제외 로직
  - 일반 일정 겹침 감지

### 5.3 커버리지 제외 항목

```typescript
/* c8 ignore start */
// 외부 라이브러리 타입 체크, 테스트 불가능한 부분
/* c8 ignore end */
```

---

## 6. GWT 패턴 적용 가이드

### 6.1 구조

모든 테스트는 다음 구조 준수:

```typescript
it('한글로 작성한 구체적인 테스트 시나리오', () => {
  // Given: 테스트를 위한 환경 및 데이터 준비
  const baseDate = '2025-01-15';
  const repeatInfo = { type: 'daily', interval: 1, endDate: '2025-01-20' };

  // When: 테스트 대상 동작 실행
  const result = generateRepeatDates(baseDate, repeatInfo);

  // Then: 결과 검증
  expect(result).toHaveLength(6);
  expect(result[0]).toBe('2025-01-15');
  expect(result[5]).toBe('2025-01-20');
});
```

### 6.2 설명 규칙

**테스트 케이스 이름**:
- 구체적이고 명확한 한국어 사용
- 테스트하는 시나리오를 충분히 설명
- "~한다", "~되어야 한다", "~를 처리한다" 형태 사용

**예시**:
- ✅ "매월 31일 반복 시 2월은 건너뛰고 생성되어야 한다"
- ❌ "31일 반복"
- ✅ "API 호출 실패 시 enqueueSnackbar에 에러 메시지를 전달한다"
- ❌ "에러 처리"

---

## 7. 엣지 케이스 및 특수 테스트

### 7.1 날짜 경계 테스트

**연도 경계**:
- 2024년 12월 → 2025년 1월 전환
- 윤년 2월 29일 → 평년 3월 1일
- 월말 (28/29/30/31일) 처리

**테스트 케이스**:
```typescript
it('연도를 넘어가는 반복 일정을 올바르게 생성한다', () => {
  // Given
  const baseDate = '2024-12-15';
  const repeatInfo = { type: 'weekly', interval: 1, endDate: '2025-01-15' };

  // When
  const result = generateRepeatDates(baseDate, repeatInfo);

  // Then - 2024년 4주 + 2025년 1주 = 5개
  expect(result).toHaveLength(5);
  expect(result[3]).toBe('2025-01-05'); // 2025년 포함됨
});
```

### 7.2 윤년 특수 처리

**4년 주기**:
- 2024년 (윤년) → 2025년 (평년) → 2026년 (평년) → 2027년 (평년) → 2028년 (윤년)

**100년 경계**:
- 1900년 (평년) - 400으로 나누어떨어지지 않음
- 2000년 (윤년) - 400으로 나누어떨어짐

**테스트 케이스**:
```typescript
it('100년 경계의 윤년을 올바르게 판별한다', () => {
  // 1900년: 100으로 나누어떨어지고 400으로는 아님 → 평년
  expect(isValidLeapYearFeb29('1900-02-29')).toBe(false);

  // 2000년: 400으로 나누어떨어짐 → 윤년
  expect(isValidLeapYearFeb29('2000-02-29')).toBe(true);
});
```

### 7.3 큰 간격 처리

**간격이 매우 큰 경우**:
- daily, interval: 365 (365일마다)
- monthly, interval: 12 (12개월마다 = 매년)
- yearly, interval: 100 (100년마다)

**테스트 케이스**:
```typescript
it('간격이 매우 큰 경우를 올바르게 처리한다', () => {
  const baseDate = '2025-01-15';
  const repeatInfo = {
    type: 'daily',
    interval: 365,
    endDate: '2027-01-15'
  };

  const result = generateRepeatDates(baseDate, repeatInfo);
  expect(result).toEqual([
    '2025-01-15',
    '2026-01-15',
  ]);
});
```

### 7.4 포함/제외 경계

**종료일 포함 검증**:
```typescript
it('종료일이 정확히 반복 날짜와 일치하면 포함한다', () => {
  const baseDate = '2025-01-15';
  const repeatInfo = {
    type: 'weekly',
    interval: 1,
    endDate: '2025-01-15' // 시작일과 동일
  };

  const result = generateRepeatDates(baseDate, repeatInfo);
  expect(result).toEqual(['2025-01-15']); // 1개만 포함
});
```

---

## 8. 성능 고려사항

### 8.1 테스트 속도

**목표**: 모든 테스트 < 1초 내 완료

**최적화**:
- MSW 핸들러는 즉시 응답 (네트워크 지연 시뮬레이션 제거)
- 큰 반복 배열 생성 테스트는 최대 2년(730개)로 제한
- 반복되는 setup 로직은 `beforeEach` 활용

**테스트 예시**:
```typescript
beforeEach(() => {
  vi.clearAllMocks();
  enqueueSnackbarFn.mockClear();
});
```

### 8.2 테스트 안정성

**불안정성 제거**:
- 타이머 모킹 (`vi.useFakeTimers()`)
- 고정된 테스트 데이터 사용 (실제 날짜 기반 계산 피하기)
- 비동기 작업은 `waitFor()` 사용

**예시**:
```typescript
await waitFor(() => {
  expect(result.current.events).toHaveLength(5);
}, { timeout: 1000 });
```

---

## 9. 디버깅 및 로깅

### 9.1 로그 레벨

테스트 실패 시 디버깅용:

```typescript
// 테스트 내에서 필요시 콘솔 출력
console.log('Generated dates:', result);
console.log('Expected:', expected);

// 하지만 최종 테스트에서는 제거
```

### 9.2 스냅샷 테스트 (필요시)

반복 일정 배치 결과가 매우 길 경우:

```typescript
it('대량의 반복 일정을 올바르게 생성한다', () => {
  const result = generateRepeatDates('2025-01-01', {
    type: 'daily',
    interval: 1,
    endDate: '2025-12-31',
  });

  // 배열이 매우 크면 스냅샷 사용 가능
  expect(result).toMatchSnapshot();
});
```

---

## 10. 테스트 체크리스트

### 10.1 테스트 파일 생성 체크리스트

- [ ] `task.repeatUtils.spec.ts` 생성
  - [ ] `generateRepeatDates` 테스트 (15개)
  - [ ] `getNextRepeatDate` 테스트 (7개)
  - [ ] `isValid31stMonthly` 테스트 (5개)
  - [ ] `isValidLeapYearFeb29` 테스트 (5개)
  - [ ] 헬퍼 함수 테스트 (3개)
  - [ ] 총 35개 이상

- [ ] `task.useEventOperations.spec.ts` 생성
  - [ ] `saveRecurringEvents` 테스트 (5개)
  - [ ] `updateRecurringSeries` 테스트 (4개)
  - [ ] `deleteRecurringSeries` 테스트 (4개)
  - [ ] `saveEvent` 분기 로직 테스트 (3개)
  - [ ] 총 16개 이상

- [ ] `task.repeat-event-integration.spec.ts` 생성
  - [ ] E2E 시나리오 (4개)
  - [ ] 특수 규칙 시나리오 (3개)
  - [ ] 겹침 제외 검증 (3개)
  - [ ] 에러 시나리오 (3개)
  - [ ] 총 13개 이상

- [ ] `easy.eventOverlap.spec.ts` 추가
  - [ ] 반복 일정 겹침 제외 테스트 (3개)

### 10.2 테스트 실행 체크리스트

- [ ] 모든 테스트 파일이 정상적으로 로드됨
- [ ] `pnpm test` 실행 시 모든 테스트 RED 상태 (구현 전)
- [ ] 테스트 파일에 문법 에러 없음
- [ ] 테스트 이름이 모두 한글로 작성됨
- [ ] GWT 패턴이 모든 테스트에 적용됨

### 10.3 MSW 핸들러 체크리스트

- [ ] 배치 생성 핸들러 (`POST /api/events-list`) 추가
- [ ] 시리즈 수정 핸들러 (`PUT /api/recurring-events/:repeatId`) 추가
- [ ] 시리즈 삭제 핸들러 (`DELETE /api/recurring-events/:repeatId`) 추가
- [ ] 기존 단일 API 핸들러 유지
- [ ] 모든 핸들러에서 `repeat` 필드 처리

### 10.4 테스트 데이터 체크리스트

- [ ] 반복 정보 픽스처 준비됨
- [ ] 날짜 테스트 매트릭스 작성됨
- [ ] 엣지 케이스 테스트 데이터 준비됨
- [ ] Mock 데이터 구조가 타입 정의와 일치함

---

## 11. 예상 결과

### 11.1 Phase 3 (RED) 예상 결과

```
FAIL  src/__tests__/unit/task.repeatUtils.spec.ts
  ✓ generateRepeatDates
    ✗ 반복 없음
    ✗ 매일 반복, 종료일 있음
    ... (총 35개 실패)

  ✓ getNextRepeatDate
    ✗ 매일 반복, 간격 1
    ... (총 7개 실패)

  ✓ isValid31stMonthly
    ✗ 31일 있는 달 (1월)
    ... (총 5개 실패)

  ✓ isValidLeapYearFeb29
    ✗ 윤년 2월 29일
    ... (총 5개 실패)

Tests:  0 passed, 51 failed, 51 total
```

### 11.2 Phase 4 (GREEN) 예상 결과

```
PASS  src/__tests__/unit/task.repeatUtils.spec.ts (XXXms)
  ✓ generateRepeatDates (15)
  ✓ getNextRepeatDate (7)
  ✓ isValid31stMonthly (5)
  ✓ isValidLeapYearFeb29 (5)
  ✓ formatRepeatInfo (3)

PASS  src/__tests__/hooks/task.useEventOperations.spec.ts (XXXms)
  ✓ saveRecurringEvents (5)
  ✓ updateRecurringSeries (4)
  ✓ deleteRecurringSeries (4)
  ✓ saveEvent 분기 로직 (3)

PASS  src/__tests__/integration/task.repeat-event-integration.spec.ts (XXXms)
  ✓ E2E 시나리오 (4)
  ✓ 특수 규칙 시나리오 (3)
  ✓ 겹침 제외 검증 (3)
  ✓ 에러 시나리오 (3)

PASS  src/__tests__/unit/easy.eventOverlap.spec.ts
  ✓ 기존 테스트 (모두 통과)
  ✓ 반복 일정 테스트 (3)

Test Files:  4 passed (4)
Tests:      51 passed, 51 total
Coverage:   84% statements, 86% branches, 82% functions, 83% lines
```

---

## 12. 다음 단계

### 12.1 Phase 3 (RED) 활동

1. `task.repeatUtils.spec.ts` 작성
2. `task.useEventOperations.spec.ts` 작성
3. `task.repeat-event-integration.spec.ts` 작성
4. `easy.eventOverlap.spec.ts` 테스트 추가
5. `pnpm test` 실행 및 모든 테스트 RED 상태 확인

### 12.2 Phase 4 (GREEN) 준비

구현 순서:
1. `src/types.ts` - 배치 API 타입 추가
2. `src/utils/repeatUtils.ts` - 유틸 함수 구현
3. `src/utils/eventOverlap.ts` - 겹침 제외 로직 수정
4. `src/hooks/useEventOperations.ts` - 배치 API 메서드 구현
5. `src/App.tsx` - UI 통합

### 12.3 검증 기준

- 테스트 파일 생성: ✓ (이 문서)
- MSW 핸들러 설계: ✓ (섹션 3)
- 테스트 데이터 준비: ✓ (섹션 4)
- GWT 패턴 적용: ✓ (섹션 6)
- 엣지 케이스 커버: ✓ (섹션 7)

---

## 13. 참고 문서

### 13.1 프로젝트 문서
- [CLAUDE.md](../../../CLAUDE.md) - 프로젝트 규칙
- [Feature Spec](../feature-designer/logs/2025-10-30_repeat-event-spec.md)
- [Work Plan](../orchestrator/logs/2025-10-30_repeat-event-plan.md)

### 13.2 코드 참고
- `src/__tests__/unit/easy.dateUtils.spec.ts` - 순수 함수 테스트 패턴
- `src/__tests__/hooks/medium.useEventOperations.spec.ts` - 훅 테스트 패턴
- `src/__mocks__/handlers.ts` - MSW 핸들러 패턴

### 13.3 테스트 도구
- Vitest: https://vitest.dev/
- @testing-library/react: https://testing-library.com/react
- MSW: https://mswjs.io/

---

**테스트 전략 완성**: 2025-10-30
**예상 구현 시간**: 약 2시간 (Phase 3) + 2.5시간 (Phase 4) = 4.5시간
**승인 상태**: 대기 중
**다음 담당**: test-writer 에이전트
