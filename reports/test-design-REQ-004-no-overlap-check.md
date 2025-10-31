# REQ-004: 반복 일정 겹침 미고려 - 테스트 설계

> **작성일**: 2025-10-30  
> **명세 문서**: docs/specification.md (REQ-004)  
> **설계자**: test-planner  
> **우선순위**: Critical

---

## 📊 Executive Summary

### 핵심 통계

- **총 TODO 항목**: 12개
- **예상 작업 시간**: 2.5시간
- **명세 커버리지**: 100%
- **Critical 항목**: 8개 (1.5시간)
- **Integration 항목**: 4개 (1시간)
- **불명확한 항목**: 0개

### 주요 결정사항

1. **겹침 미검증**: 반복 일정 생성 시 기존 일정과의 시간 충돌을 검사하지 않음 (REQ-004)
2. **동일 시간대 허용**: 같은 시간대에 여러 일정이 생성될 수 있음
3. **중복 허용**: 동일한 제목, 시간의 일정도 생성 가능
4. **테스트 범위**: Unit 테스트(유틸 함수), Integration 테스트(실제 생성 흐름)

### 예상 리스크

| 위험 요소                    | 영향도 | 대응 방안                                  |
| ---------------------------- | ------ | ------------------------------------------ |
| 의도하지 않은 겹침 검증 추가 | High   | 명시적으로 겹침 검증이 없음을 테스트       |
| API 응답 실패 시 처리        | Medium | 에러 핸들링 테스트 포함                    |
| 대량 반복 일정 생성 시 성능  | Medium | 365개 일정 생성 시 성능 테스트 (NFR-001)   |

---

## 명세 분석 결과

### 핵심 요구사항

#### Critical (반드시 동작해야 함)

1. **반복 일정 겹침 미검증**: 반복 일정 생성 시 기존 일정과의 겹침을 검사하지 않는다

   - 명세 참조: REQ-004
   - 테스트 필요: 
     - 같은 시간대에 여러 반복 일정 생성 가능
     - 단일 일정과 반복 일정 겹침 허용
     - 반복 일정 간 겹침 허용
     - 동일한 내용(제목, 시간)의 일정도 생성 가능

2. **중복 검증 없음**: 사용자가 수동으로 관리

   - 명세 참조: REQ-004, CONS-001
   - 테스트 필요:
     - 겹침 검증 로직이 호출되지 않음
     - 모든 반복 일정이 정상 생성됨

---

## Kent Beck TODO List

### 테스트 작성 순서 (간단 → 복잡)

#### Phase 1: Happy Path (기본 동작 검증)

```
✅ TODO-001: 반복 일정 생성 시 겹침 검증을 수행하지 않는다
  - 대상: generateRecurringEvents
  - 검증: 겹침 검증 함수가 호출되지 않음
  - 예상 시간: 10분

✅ TODO-002: 같은 시간대에 단일 일정과 반복 일정을 생성할 수 있다
  - 대상: saveEvent (useEventOperations)
  - 검증: 둘 다 정상 생성됨
  - 예상 시간: 15분

✅ TODO-003: 같은 시간대에 여러 반복 일정을 생성할 수 있다
  - 대상: saveEvent (useEventOperations)
  - 검증: 모든 반복 일정이 정상 생성됨
  - 예상 시간: 15분
```

#### Phase 2: Validation (검증 로직 확인)

```
✅ TODO-004: 동일한 제목, 시간의 단일 일정을 여러 개 생성할 수 있다
  - 대상: saveEvent
  - 검증: 중복 검증 없이 모두 생성됨
  - 예상 시간: 10분

✅ TODO-005: 동일한 제목, 시간의 반복 일정을 여러 개 생성할 수 있다
  - 대상: saveEvent
  - 검증: 중복 검증 없이 모두 생성됨
  - 예상 시간: 10분

✅ TODO-006: 기존 일정과 완전히 겹치는 시간대에 반복 일정을 생성할 수 있다
  - 대상: saveEvent
  - 검증: startTime, endTime이 동일해도 생성됨
  - 예상 시간: 15분
```

#### Phase 3: Edge Cases (특수 케이스)

```
✅ TODO-007: 반복 일정의 각 인스턴스가 기존 일정과 겹쳐도 모두 생성된다
  - 대상: generateRecurringEvents
  - 시나리오: 매일 반복 일정 생성 시 기존 일정 10개와 겹침
  - 검증: 모든 반복 일정 인스턴스가 생성됨
  - 예상 시간: 20분

✅ TODO-008: 365개의 매일 반복 일정이 기존 일정과 관계없이 생성된다 (성능)
  - 대상: generateRecurringEvents
  - 시나리오: 2025-01-01 ~ 2025-12-31 매일 반복
  - 검증: 365개 모두 생성, 1초 이내 완료 (NFR-001)
  - 예상 시간: 20분
```

#### Phase 4: Integration (통합 테스트)

```
✅ TODO-009: UI에서 겹치는 시간에 반복 일정 생성 시 경고 없이 생성된다
  - 대상: 일정 생성 폼 → saveEvent → API
  - 검증: 경고/에러 없이 정상 생성, 성공 메시지 표시
  - 예상 시간: 20분

✅ TODO-010: 여러 사용자가 같은 시간에 반복 일정을 생성해도 모두 저장된다
  - 대상: API 레벨 (POST /api/events-list)
  - 검증: 동시 요청 시 모두 정상 저장
  - 예상 시간: 20분

✅ TODO-011: 캘린더 뷰에서 겹친 일정들이 모두 표시된다
  - 대상: 캘린더 렌더링
  - 검증: 같은 시간대의 여러 일정이 모두 보임
  - 예상 시간: 15분

✅ TODO-012: 반복 일정 수정 시에도 겹침 검증을 하지 않는다
  - 대상: saveEvent (editing mode)
  - 검증: 수정된 일정이 다른 일정과 겹쳐도 저장됨
  - 예상 시간: 15분
```

---

## Coverage Map

### 기능별 커버리지

| 기능                  | 관련 TODO          | 커버리지 | 우선순위 |
| --------------------- | ------------------ | -------- | -------- |
| 겹침 검증 미수행      | TODO-001           | 100%     | Critical |
| 단일 일정 겹침 허용   | TODO-002, TODO-004 | 100%     | Critical |
| 반복 일정 겹침 허용   | TODO-003, TODO-005 | 100%     | Critical |
| 완전 겹침 허용        | TODO-006           | 100%     | Critical |
| 대량 인스턴스 생성    | TODO-007, TODO-008 | 100%     | Critical |
| UI 통합 (생성)        | TODO-009           | 100%     | High     |
| API 동시성            | TODO-010           | 100%     | Medium   |
| 캘린더 표시           | TODO-011           | 100%     | High     |
| 수정 시 겹침 검증 없음 | TODO-012           | 100%     | Critical |

### 명세 커버리지

| 명세 ID   | 설명                         | 관련 TODO                    | 상태 |
| --------- | ---------------------------- | ---------------------------- | ---- |
| REQ-004   | 반복 일정 겹침 미고려        | TODO-001 ~ TODO-012          | ✅   |
| CONS-001  | 반복 일정 겹침 검사하지 않음 | TODO-001, TODO-002, TODO-003 | ✅   |
| NFR-001   | 성능 (1초 이내)              | TODO-008                     | ✅   |

### 테스트 레벨별 커버리지

| 레벨        | TODO 수 | 비율 |
| ----------- | ------- | ---- |
| Unit        | 6       | 50%  |
| Integration | 4       | 33%  |
| E2E         | 2       | 17%  |

---

## 권장 테스트 파일 구조

TODO 항목을 논리적 단위로 그룹화하여 테스트 파일을 구성합니다:

```
src/__tests__/
├── unit/
│   ├── noOverlapCheck.spec.ts           # TODO-001 (겹침 검증 미수행)
│   └── recurringEventsNoValidation.spec.ts  # TODO-004, TODO-005 (중복 허용)
│
├── hooks/
│   └── useEventOperations.spec.ts       # TODO-002, TODO-003, TODO-006, TODO-012
│
├── integration/
│   └── noOverlapIntegration.spec.tsx    # TODO-009, TODO-010, TODO-011
│
└── performance/
    └── recurringPerformance.spec.ts     # TODO-007, TODO-008 (대량 생성)
```

---

## 테스트 시나리오 상세

### 시나리오 1: 기본 겹침 허용 (TODO-001 ~ TODO-003)

```typescript
// 테스트 데이터 예시
const existingEvent = {
  title: "기존 회의",
  date: "2025-06-15",
  startTime: "10:00",
  endTime: "11:00",
  repeat: { type: 'none' }
};

const recurringEvent = {
  title: "반복 회의",
  date: "2025-06-15",
  startTime: "10:00",
  endTime: "11:00",
  repeat: { type: 'daily', interval: 1, endDate: "2025-06-20" }
};

// 예상 결과
// - 기존 회의: 2025-06-15 10:00-11:00
// - 반복 회의: 2025-06-15 ~ 2025-06-20 (6일간) 매일 10:00-11:00
// → 총 7개 일정, 모두 같은 시간대에 생성됨
```

### 시나리오 2: 동일 내용 중복 생성 (TODO-004, TODO-005)

```typescript
// 완전히 동일한 일정 3개 생성
const event1 = { title: "회의", date: "2025-06-15", startTime: "10:00", ... };
const event2 = { title: "회의", date: "2025-06-15", startTime: "10:00", ... };
const event3 = { title: "회의", date: "2025-06-15", startTime: "10:00", ... };

// 예상 결과: 3개 모두 생성됨 (각각 다른 ID)
```

### 시나리오 3: 대량 반복 일정 겹침 (TODO-007, TODO-008)

```typescript
// 기존: 1월 ~ 12월 매주 월요일 회의 (약 52개)
const existingWeekly = {
  repeat: { type: 'weekly', interval: 1, endDate: "2025-12-31" }
};

// 신규: 1월 ~ 12월 매일 스탠드업 (365개)
const newDaily = {
  repeat: { type: 'daily', interval: 1, endDate: "2025-12-31" }
};

// 예상 결과:
// - 매주 월요일에는 회의 + 스탠드업 (2개 일정 겹침)
// - 나머지 날에는 스탠드업만
// - 총 417개 일정 생성 (52 + 365)
// - 생성 시간 < 1초 (NFR-001)
```

### 시나리오 4: UI/API 통합 (TODO-009 ~ TODO-011)

```typescript
// 사용자 액션:
// 1. 일정 생성 폼 열기
// 2. 기존 일정과 겹치는 시간 입력 (경고 없음)
// 3. 반복 설정 (매주)
// 4. "저장" 클릭

// 예상 동작:
// - API POST /api/events-list 호출
// - 응답: { success: true, created: 52 }
// - Snackbar: "일정이 추가되었습니다." (success)
// - 캘린더 뷰 갱신 → 겹친 일정들 모두 표시
```

---

## 테스트 데이터

### 공통 테스트 데이터

```typescript
// 겹침 테스트용 기준 일정
export const baseOverlappingEvent = {
  title: "기준 일정",
  date: "2025-06-15",
  startTime: "10:00",
  endTime: "11:00",
  description: "겹침 테스트용 기준 일정",
  location: "회의실 A",
  category: "업무",
  repeat: { type: 'none', interval: 1 },
  notificationTime: 10
};

// 완전히 겹치는 반복 일정
export const fullyOverlappingRecurring = {
  ...baseOverlappingEvent,
  title: "반복 일정",
  repeat: { type: 'daily', interval: 1, endDate: "2025-06-20" }
};

// 부분적으로 겹치는 일정 (시작 시간만 겹침)
export const partiallyOverlapping = {
  ...baseOverlappingEvent,
  title: "부분 겹침",
  startTime: "10:30",
  endTime: "11:30"
};

// 대량 반복 일정 (365개)
export const yearlyDailyRecurring = {
  ...baseOverlappingEvent,
  repeat: { type: 'daily', interval: 1, endDate: "2025-12-31" }
};
```

---

## 검증 포인트

### 핵심 검증 사항

1. **겹침 검증 로직 부재**
   - ✅ `generateRecurringEvents`에서 기존 일정을 조회하지 않음
   - ✅ `saveEvent`에서 겹침 검증 함수를 호출하지 않음
   - ✅ API 요청에 validation 파라미터가 없음

2. **생성 성공**
   - ✅ 같은 시간대에 여러 일정이 정상 생성됨
   - ✅ API 응답이 성공 (200 OK)
   - ✅ DB에 모든 일정이 저장됨

3. **UI 피드백**
   - ✅ 경고/에러 메시지가 표시되지 않음
   - ✅ 성공 메시지 표시: "일정이 추가되었습니다."
   - ✅ 캘린더 뷰에서 겹친 일정들이 모두 보임

4. **성능**
   - ✅ 365개 일정 생성 시 1초 이내 (NFR-001)
   - ✅ API 응답 시간 < 500ms (권장)

---

## 불명확한 항목

> ✅ **REQ-004는 명확하게 정의되어 있어 불명확한 항목이 없습니다.**

다음 사항은 명세에서 명확히 정의됨:
- ✅ 반복 일정 생성 시 겹침 검사하지 않음 (REQ-004)
- ✅ 중복 검증 하지 않음 (CONS-001)
- ✅ 사용자가 수동 관리 (CONS-001)
- ✅ 성능 요구사항 명시 (NFR-001: 1초 이내)

---

## TODO 우선순위 요약

| 우선순위  | 항목 수 | 예상 시간 | TODO ID              |
| --------- | ------- | --------- | -------------------- |
| Critical  | 8       | 1.5시간   | 001-008              |
| High      | 2       | 35분      | 009, 011             |
| Medium    | 2       | 35분      | 010, 012             |
| **Total** | **12**  | **2.5시간** | **001-012**        |

---

## 다음 단계

### 1. 설계 검토

이 문서를 검토하고 다음 중 선택해주세요:

- ✅ **승인**: "OK" 또는 "구현 시작" → `test-code-implementer` 호출
- 🔄 **수정**: "TODO-XXX 수정 필요: [이유]" → 수정 후 재검토
- 🔙 **재설계**: "재설계" → 전체 재작성

### 2. 구현 시작

승인 후 다음 명령으로 구현 시작:

```
@test-code-implementer @test-design-REQ-004-no-overlap-check.md 
TODO-001부터 순차적으로 테스트 코드 구현 시작
```

---

## 참고 문서

- [명세서](../docs/specification.md) - REQ-004, CONS-001, NFR-001
- [테스트 코드 규칙](../docs/test-code-rules.md)
- [Kent Beck TDD Philosophy](../docs/kent-beck-tdd-philosophy.md)

---

**작성 완료일**: 2025-10-30  
**최종 검토자**: test-planner  
**상태**: ⏳ 승인 대기

