# 테스트 명세: 반복 일정 기능

**작성일**: 2025-10-29  
**작성자**: Test Architect Agent  
**User Story**: `us001-recurring-event-selection.md`  
**상태**: Test Specification Complete ✅

---

## 작성된 테스트 요약

- **총 테스트 파일**: 5개
- **총 테스트 케이스**: 약 50개
- **정상 시나리오**: 약 20개
- **엣지 케이스**: 약 15개
- **에러 케이스**: 약 10개
- **통합 테스트**: 약 5개

---

## 테스트 파일 구조

### 1. Unit Tests - 반복 규칙 생성

**파일**: `src/__tests__/unit/medium.repeatRuleGenerator.spec.ts`

**커버리지**:

- `generateDailyOccurrences()` - interval, count, until 기반 생성
- `generateWeeklyOccurrences()` - 시작 요일 기준 생성
- `generateMonthlyOccurrences()` - 31일 스킵 로직 포함
- `generateYearlyOccurrences()` - 2/29 윤년 처리 포함
- 생성 상한 검증 (10,000회)

**Acceptance Criteria 매핑**: Scenario 1, 2, 3, 9, 10, 12, 13

---

### 2. Unit Tests - 검증 로직

**파일**: `src/__tests__/unit/easy.repeatValidation.spec.ts`

**커버리지**:

- `validateRepeatRule()` - 종료 조건, 값 범위 검증
- `validateOccurrenceCount()` - 생성 상한 검증
- 에러 코드 및 메시지 매핑

**Acceptance Criteria 매핑**: Scenario 5, 6, 8

---

### 3. Unit Tests - 날짜/시간 유틸리티

**파일**: `src/__tests__/unit/easy.dateTimeUtils.spec.ts`

**커버리지**:

- `isLeapYear()` - 윤년 판단
- `addDays()`, `addWeeks()`, `addMonths()`, `addYears()` - 날짜 연산
- ISO 8601 날짜 변환 함수

---

### 4. Unit Tests - 시간 자동 조정

**파일**: `src/__tests__/unit/easy.timeAdjustment.spec.ts`

**커버리지**:

- `adjustEndTime()` - endTime ≤ startTime 시 자동 조정

**Acceptance Criteria 매핑**: Scenario 7

---

### 5. Integration Tests - 전체 플로우

**파일**: `src/__tests__/medium.recurringEvent.integration.spec.tsx`

**커버리지**:

- 일정 생성 플로우 (폼 + 검증 + API)
- 검증 에러 표시
- 반복 일정 겹침 무시
- 반복 일정 수정 (시리즈 전체)
- API 연동
- 캘린더 표시

**Acceptance Criteria 매핑**: Scenario 4, 11, 14

---

## 주요 테스트 시나리오

### 정상 시나리오 (Happy Path)

1. **daily 반복**: interval=1, count 기반 매일 생성
2. **weekly 반복**: 시작 요일 기준 매주 생성
3. **monthly 반복**: 31일 있는 달에만 생성 (스킵 로직)
4. **yearly 반복**: 윤년 2/29는 윤년에만 생성 (대체 없음)
5. **until 기반 종료**: 종료일 이하 모든 인스턴스 생성
6. **interval > 1**: 간격 설정 정상 작동

### 엣지 케이스

1. **31일 시작 + monthly**: 31일 없는 달 스킵
2. **30일 시작 + monthly**: 2월 스킵
3. **2월 29일 시작 + yearly**: 평년 스킵 (대체 없음)
4. **count 기반 정확성**: startDate 포함 N회 생성
5. **until 기반 범위**: until 날짜 "이하" 처리

### 에러 케이스

1. **종료 조건 누락**: count와 until 모두 없음 → REPEAT_MISSING_SCOPE
2. **종료 조건 충돌**: count와 until 동시 지정 → REPEAT_INVALID_SCOPE
3. **생성 상한 초과**: 10,000회 초과 → REPEAT_TOO_MANY
4. **값 범위 검증**: count (1-1000), interval (1-12), until 날짜 범위
5. **endTime 자동 조정**: endTime ≤ startTime → TIME_INVALID_RANGE

### 통합 시나리오

1. **반복 일정 생성 플로우**: 폼 → 검증 → API → 캘린더 표시
2. **겹침 무시 규칙**: 반복 일정은 기존 일정과 겹쳐도 생성
3. **반복 일정 수정**: 시리즈 전체 업데이트
4. **에러 처리**: API 에러 발생 시 사용자 피드백

---

## MSW 핸들러 정의

### 기존 핸들러 확장 필요

**기존**: `src/__mocks__/handlers.ts`

**추가 필요 핸들러**:

```typescript
// 반복 일정 생성 (일괄 생성)
http.post('/api/events/batch', async ({ request }) => {
  const body = await request.json();
  // body.events: Event[] - 생성할 인스턴스 배열
  // body.repeat: RepeatInfo - 반복 규칙 메타
  return HttpResponse.json(
    {
      success: true,
      data: {
        events: body.events, // 생성된 인스턴스 배열
        repeat: body.repeat,
        occurrences: body.events.map((e) => `${e.date}T${e.startTime}:00+09:00`),
      },
    },
    { status: 201 }
  );
});

// 반복 일정 수정 (일괄 업데이트)
http.put('/api/events/recurring/:seriesId', async ({ params, request }) => {
  const { seriesId } = params;
  const body = await request.json();
  // 기존 시리즈 삭제 후 새로운 인스턴스 생성
  return HttpResponse.json({
    success: true,
    data: {
      events: body.events,
      repeat: body.repeat,
    },
  });
});

// 검증 에러 시뮬레이션
http.post('/api/events', async ({ request }) => {
  const body = await request.json();

  // REPEAT_MISSING_SCOPE 시뮬레이션
  if (!body.repeat?.count && !body.repeat?.endDate) {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'REPEAT_MISSING_SCOPE',
          message: '반복 종료 조건을 지정하세요',
          field: 'repeat',
        },
      },
      { status: 400 }
    );
  }

  // REPEAT_INVALID_SCOPE 시뮬레이션
  if (body.repeat?.count && body.repeat?.endDate) {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'REPEAT_INVALID_SCOPE',
          message: 'count와 until 중 하나만 지정하세요',
          field: 'repeat',
        },
      },
      { status: 400 }
    );
  }

  // REPEAT_TOO_MANY 시뮬레이션 (테스트용)
  // 실제로는 클라이언트에서 검증하므로 선택적

  // 정상 생성
  return HttpResponse.json(
    {
      success: true,
      data: {
        events: body.events || [{ ...body, id: String(Date.now()) }],
      },
    },
    { status: 201 }
  );
});
```

### 에러 시나리오 핸들러

```typescript
// 서버 에러 (500)
export const serverErrorHandler = http.post('/api/events', () => {
  return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
});

// 네트워크 에러
export const networkErrorHandler = http.post('/api/events', () => {
  return HttpResponse.error();
});
```

---

## 테스트 구조 예시

### Unit Test 구조

```typescript
describe('repeatRuleGenerator', () => {
  describe('정상 동작', () => {
    describe('generateDailyOccurrences', () => {
      it('interval=1, count 기반으로 일정을 생성한다', () => {
        // Developer가 구현
        // Given-When-Then
      });
    });
  });

  describe('엣지 케이스', () => {
    // ...
  });
});
```

### Integration Test 구조

```typescript
describe('반복 일정 통합 테스트', () => {
  describe('일정 생성 플로우', () => {
    it('반복 설정을 활성화하고 유효한 규칙으로 일정을 생성한다', () => {
      // Developer가 구현
      // 힌트: 폼 → 검증 → API → 캘린더
    });
  });

  describe('검증 에러 표시', () => {
    // ...
  });
});
```

---

## Acceptance Criteria 커버리지

| Scenario | AC 내용             | 테스트 파일                           | 상태 |
| -------- | ------------------- | ------------------------------------- | ---- |
| 1        | monthly - 31일 시작 | `repeatRuleGenerator.spec.ts`         | ✅   |
| 2        | yearly - 2/29 윤년  | `repeatRuleGenerator.spec.ts`         | ✅   |
| 3        | weekly - 시작 요일  | `repeatRuleGenerator.spec.ts`         | ✅   |
| 4        | daily - 겹침 무시   | `recurringEvent.integration.spec.tsx` | ✅   |
| 5        | 종료 조건 누락      | `repeatValidation.spec.ts`            | ✅   |
| 6        | count와 until 충돌  | `repeatValidation.spec.ts`            | ✅   |
| 7        | endTime 자동 조정   | `timeAdjustment.spec.ts`              | ✅   |
| 8        | 생성 상한 초과      | `repeatValidation.spec.ts`            | ✅   |
| 9        | interval > 1        | `repeatRuleGenerator.spec.ts`         | ✅   |
| 10       | until 기반 종료     | `repeatRuleGenerator.spec.ts`         | ✅   |
| 11       | 반복 설정 비활성화  | `recurringEvent.integration.spec.tsx` | ✅   |
| 12       | 30일 시작 + monthly | `repeatRuleGenerator.spec.ts`         | ✅   |
| 13       | count 기준 정확성   | `repeatRuleGenerator.spec.ts`         | ✅   |
| 14       | 반복 일정 수정      | `recurringEvent.integration.spec.tsx` | ✅   |

**커버리지**: 14/14 (100%)

---

## 검증 완료 항목

- [x] 모든 Acceptance Criteria 커버 (14개 시나리오)
- [x] 엣지 케이스 및 에러 처리 포함
- [x] MSW 핸들러 정의 완료
- [x] 테스트 구조 명확히 정의
- [x] TDD 원칙 준수 (구조와 시나리오만 설계)
- [x] 사용자 관점 시나리오 작성
- [x] 파일 네이밍 규칙 준수
- [x] 기존 프로젝트 패턴 준수

---

## Developer 구현 가이드

### 구현 순서

1. **날짜/시간 유틸리티** (`dateTimeUtils.spec.ts`)

   - `isLeapYear`, `addDays`, `addWeeks`, `addMonths`, `addYears` 구현
   - ISO 8601 변환 함수 구현

2. **검증 로직** (`repeatValidation.spec.ts`)

   - `validateRepeatRule()` 구현
   - `validateOccurrenceCount()` 구현
   - 에러 코드 및 메시지 정의

3. **반복 규칙 생성** (`repeatRuleGenerator.spec.ts`)

   - 각 반복 유형별 생성 함수 구현
   - 스킵 로직 구현 (31일, 2/29)
   - 생성 상한 적용

4. **시간 자동 조정** (`timeAdjustment.spec.ts`)

   - `adjustEndTime()` 구현

5. **통합 테스트** (`recurringEvent.integration.spec.tsx`)
   - 폼 컴포넌트 연동
   - API 연동
   - 캘린더 표시

### MSW 핸들러 적용

- 기존 `handlers.ts`에 반복 일정 관련 핸들러 추가
- 에러 시나리오 핸들러 정의
- 각 테스트에서 필요 시 `server.use()`로 핸들러 오버라이드

---

## 다음 단계

**Status**: Test Specification Complete ✅  
**Next Action**: 테스트 명세를 확인하신 후 승인해주시면 @developer에게 구현을 요청하겠습니다.

---

**승인 후 진행**:

1. Developer Agent가 spec.ts 파일의 테스트 로직 구현
2. TDD Red → Green → Refactor 사이클 진행
3. 모든 테스트 통과 확인 후 기능 완료

---

**작성자**: Test Architect Agent  
**문서 버전**: 1.0.0  
**마지막 업데이트**: 2025-10-29
