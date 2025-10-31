# REQ-005: 반복 일정 시각적 표시 - 테스트 설계

> **작성일**: 2025-10-30  
> **명세 문서**: docs/specification.md (REQ-005)  
> **설계자**: test-planner  
> **우선순위**: High

---

## 📊 Executive Summary

### 핵심 통계

- **총 TODO 항목**: 18개
- **예상 작업 시간**: 3시간
- **명세 커버리지**: 100%
- **Critical 항목**: 0개
- **High 항목**: 15개 (2.5시간)
- **Medium 항목**: 3개 (30분)
- **불명확한 항목**: 0개

### 주요 결정사항

1. **반복 아이콘 표시**: 반복 일정(type !== 'none')에 🔁 아이콘 표시 (REQ-005)
2. **아이콘 위치**: 일정 제목 바로 옆에 표시
3. **단일 일정 구분**: 단일 일정(type === 'none')은 아이콘 없음
4. **모든 뷰 지원**: 월/주/일 뷰 모두에서 아이콘 표시

### 예상 리스크

| 위험 요소 | 영향도 | 대응 방안 |
| --------- | ------ | --------- |
| 아이콘 렌더링 누락 | High | 각 반복 유형별 테스트 작성 |
| 스크린 리더 접근성 | Medium | aria-label 속성 테스트 포함 |
| 다양한 뷰 지원 | Medium | 월/주/일 뷰별 통합 테스트 |

---

## 명세 분석 결과

### 핵심 요구사항

#### High (반드시 동작해야 함)

1. **반복 일정 아이콘 표시**: 캘린더 뷰에서 반복 일정을 아이콘으로 구분

   - 명세 참조: REQ-005
   - 테스트 필요:
     - 반복 일정(daily, weekly, monthly, yearly)에 🔁 아이콘 표시
     - 단일 일정(none)은 아이콘 미표시
     - 아이콘이 제목 옆에 위치
     - 모든 캘린더 뷰(월/주/일)에서 표시

2. **단일 일정과 명확히 구분**: 시각적으로 구분 가능해야 함

   - 명세 참조: REQ-005
   - 테스트 필요:
     - 반복 일정: "회의 🔁"
     - 단일 일정: "회의"
     - 사용자가 한눈에 구분 가능

3. **접근성**: 스크린 리더 지원

   - 명세 참조: NFR-003
   - 테스트 필요:
     - 아이콘에 aria-label="반복 일정" 속성
     - 스크린 리더가 "반복 일정"으로 읽음

---

## Kent Beck TODO List

### 테스트 작성 순서 (간단 → 복잡)

#### Phase 1: Happy Path (기본 동작 검증)

```
✅ TODO-001: 매일 반복 일정은 제목 옆에 반복 아이콘(🔁)을 표시한다
  - 대상: Event 렌더링 (캘린더 뷰)
  - 검증: event.repeat.type === 'daily' → 🔁 아이콘 존재
  - 예상 시간: 10분

✅ TODO-002: 매주 반복 일정은 제목 옆에 반복 아이콘(🔁)을 표시한다
  - 대상: Event 렌더링
  - 검증: event.repeat.type === 'weekly' → 🔁 아이콘 존재
  - 예상 시간: 10분

✅ TODO-003: 매월 반복 일정은 제목 옆에 반복 아이콘(🔁)을 표시한다
  - 대상: Event 렌더링
  - 검증: event.repeat.type === 'monthly' → 🔁 아이콘 존재
  - 예상 시간: 10분

✅ TODO-004: 매년 반복 일정은 제목 옆에 반복 아이콘(🔁)을 표시한다
  - 대상: Event 렌더링
  - 검증: event.repeat.type === 'yearly' → 🔁 아이콘 존재
  - 예상 시간: 10분

✅ TODO-005: 단일 일정(반복 안 함)은 반복 아이콘을 표시하지 않는다
  - 대상: Event 렌더링
  - 검증: event.repeat.type === 'none' → 🔁 아이콘 없음
  - 예상 시간: 10분
```

#### Phase 2: UI 위치 및 스타일 검증

```
✅ TODO-006: 반복 아이콘은 일정 제목 바로 옆에 표시된다
  - 대상: Event 렌더링 레이아웃
  - 검증: 아이콘이 title과 같은 줄(row)에 위치
  - 예상 시간: 15분

✅ TODO-007: 반복 아이콘은 일정 제목과 함께 한 줄에 표시된다
  - 대상: Stack direction="row" 컴포넌트
  - 검증: title과 icon이 가로로 배치됨
  - 예상 시간: 10분

✅ TODO-008: 여러 반복 일정이 있을 때 각각 아이콘이 표시된다
  - 대상: Event 리스트 렌더링
  - 검증: 모든 반복 일정에 개별 아이콘 표시
  - 예상 시간: 15분
```

#### Phase 3: 캘린더 뷰별 검증

```
✅ TODO-009: 월간 뷰에서 반복 일정 아이콘이 표시된다
  - 대상: 캘린더 월간 뷰
  - 검증: 월간 뷰에서 반복 일정 아이콘 확인
  - 예상 시간: 15분

✅ TODO-010: 주간 뷰에서 반복 일정 아이콘이 표시된다
  - 대상: 캘린더 주간 뷰
  - 검증: 주간 뷰에서 반복 일정 아이콘 확인
  - 예상 시간: 15분

✅ TODO-011: 일간 뷰에서 반복 일정 아이콘이 표시된다
  - 대상: 캘린더 일간 뷰
  - 검증: 일간 뷰 전환 후 아이콘 확인
  - 예상 시간: 15분
```

#### Phase 4: 접근성 (Accessibility)

```
✅ TODO-012: 반복 아이콘은 aria-label 속성을 가진다
  - 대상: 반복 아이콘 컴포넌트
  - 검증: aria-label="반복 일정" 속성 존재
  - 예상 시간: 10분

✅ TODO-013: 스크린 리더가 반복 일정을 "반복 일정"으로 읽는다
  - 대상: 접근성 트리
  - 검증: getByLabelText('반복 일정') 성공
  - 예상 시간: 15분

✅ TODO-014: 반복 아이콘은 키보드로 접근 가능하다
  - 대상: 아이콘 요소
  - 검증: Tab 키로 포커스 가능 (필요시)
  - 예상 시간: 10분
```

#### Phase 5: Integration (통합 테스트)

```
✅ TODO-015: 반복 일정 생성 후 캘린더에 아이콘과 함께 표시된다
  - 대상: 전체 워크플로우 (생성 → 표시)
  - 검증: 일정 생성 → 캘린더에서 🔁 아이콘 확인
  - 예상 시간: 20분

✅ TODO-016: 단일 일정에서 반복 일정으로 수정하면 아이콘이 나타난다
  - 대상: 일정 수정 워크플로우
  - 검증: repeat.type 'none' → 'daily' 변경 시 아이콘 표시
  - 예상 시간: 15분

✅ TODO-017: 반복 일정에서 단일 일정으로 수정하면 아이콘이 사라진다
  - 대상: 일정 수정 워크플로우
  - 검증: repeat.type 'daily' → 'none' 변경 시 아이콘 제거
  - 예상 시간: 15min

✅ TODO-018: 검색 결과에서도 반복 일정 아이콘이 표시된다
  - 대상: 검색 기능 + 일정 표시
  - 검증: 검색 필터 적용 후에도 아이콘 유지
  - 예상 시간: 15분
```

---

## Coverage Map

### 기능별 커버리지

| 기능 | 관련 TODO | 커버리지 | 우선순위 |
| ---- | --------- | -------- | -------- |
| 매일 반복 아이콘 | TODO-001 | 100% | High |
| 매주 반복 아이콘 | TODO-002 | 100% | High |
| 매월 반복 아이콘 | TODO-003 | 100% | High |
| 매년 반복 아이콘 | TODO-004 | 100% | High |
| 단일 일정 아이콘 없음 | TODO-005 | 100% | High |
| 아이콘 위치 | TODO-006, 007 | 100% | High |
| 여러 일정 렌더링 | TODO-008 | 100% | High |
| 월간 뷰 | TODO-009 | 100% | High |
| 주간 뷰 | TODO-010 | 100% | High |
| 일간 뷰 | TODO-011 | 100% | Medium |
| 접근성 (aria-label) | TODO-012, 013 | 100% | High |
| 키보드 접근성 | TODO-014 | 100% | Medium |
| 생성 후 표시 | TODO-015 | 100% | High |
| 수정 (단일→반복) | TODO-016 | 100% | High |
| 수정 (반복→단일) | TODO-017 | 100% | High |
| 검색 결과 표시 | TODO-018 | 100% | Medium |

### 명세 커버리지

| 명세 ID | 설명 | 관련 TODO | 상태 |
| ------- | ---- | --------- | ---- |
| REQ-005 | 반복 일정 시각적 표시 | TODO-001 ~ TODO-018 | ✅ |
| UI-002 | 반복 아이콘 (🔁 또는 ⟳) | TODO-001 ~ TODO-005 | ✅ |
| NFR-003 | 접근성 (스크린 리더) | TODO-012 ~ TODO-014 | ✅ |

### 테스트 레벨별 커버리지

| 레벨 | TODO 수 | 비율 |
| ---- | ------- | ---- |
| Unit | 8 | 44% |
| Integration | 7 | 39% |
| Accessibility | 3 | 17% |

---

## 권장 테스트 파일 구조

TODO 항목을 논리적 단위로 그룹화하여 테스트 파일을 구성합니다:

```
src/__tests__/
├── unit/
│   └── recurringEventIcon.spec.tsx         # TODO-001 ~ TODO-008 (아이콘 렌더링)
│
├── integration/
│   ├── recurringIconViews.spec.tsx         # TODO-009 ~ TODO-011 (뷰별 표시)
│   └── recurringIconWorkflow.spec.tsx      # TODO-015 ~ TODO-018 (전체 워크플로우)
│
└── accessibility/
    └── recurringIconA11y.spec.tsx          # TODO-012 ~ TODO-014 (접근성)
```

---

## 테스트 시나리오 상세

### 시나리오 1: 반복 유형별 아이콘 표시 (TODO-001 ~ TODO-005)

```typescript
// 테스트 데이터 예시
const dailyEvent: Event = {
  id: '1',
  title: '매일 운동',
  date: '2025-06-15',
  startTime: '07:00',
  endTime: '08:00',
  description: '',
  location: '',
  category: '개인',
  repeat: { type: 'daily', interval: 1 },
  notificationTime: 10,
};

const nonRecurringEvent: Event = {
  id: '2',
  title: '단일 회의',
  date: '2025-06-15',
  startTime: '10:00',
  endTime: '11:00',
  description: '',
  location: '',
  category: '업무',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 10,
};

// 예상 렌더링
// 매일 운동 🔁       ← 반복 아이콘 있음
// 단일 회의          ← 반복 아이콘 없음
```

### 시나리오 2: 아이콘 위치 확인 (TODO-006, 007)

```typescript
// 예상 DOM 구조
<Stack direction="row" spacing={1} alignItems="center">
  <Typography>매일 운동</Typography>
  <span aria-label="반복 일정">🔁</span>  {/* 제목 옆에 위치 */}
</Stack>

// 또는 제목 내부
<Typography>
  매일 운동 <span aria-label="반복 일정">🔁</span>
</Typography>
```

### 시나리오 3: 캘린더 뷰별 표시 (TODO-009 ~ TODO-011)

```typescript
// 월간 뷰
// ┌─────────────────────┐
// │ 15일                │
// │ 매일 운동 🔁        │
// │ 단일 회의           │
// └─────────────────────┘

// 주간 뷰
// 월요일 (6/15)
// 07:00 매일 운동 🔁
// 10:00 단일 회의

// 일간 뷰
// 2025-06-15
// 07:00 매일 운동 🔁
// 10:00 단일 회의
```

### 시나리오 4: 수정 워크플로우 (TODO-016, 017)

```typescript
// 시나리오 A: 단일 → 반복
// 1. 초기 상태: "회의" (아이콘 없음)
// 2. 반복 설정: repeat.type = 'daily'
// 3. 저장 후: "회의 🔁" (아이콘 나타남)

// 시나리오 B: 반복 → 단일
// 1. 초기 상태: "회의 🔁" (아이콘 있음)
// 2. 반복 해제: repeat.type = 'none'
// 3. 저장 후: "회의" (아이콘 사라짐)
```

---

## 테스트 데이터

### 공통 테스트 데이터

```typescript
// 반복 유형별 이벤트
export const testEvents = {
  daily: {
    id: '1',
    title: '매일 운동',
    date: '2025-06-15',
    startTime: '07:00',
    endTime: '08:00',
    description: '아침 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'daily', interval: 1, endDate: '2025-12-31' },
    notificationTime: 10,
  },
  weekly: {
    id: '2',
    title: '주간 회의',
    date: '2025-06-15',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
    notificationTime: 10,
  },
  monthly: {
    id: '3',
    title: '월간 리뷰',
    date: '2025-06-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '월간 점검',
    location: '대회의실',
    category: '업무',
    repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
    notificationTime: 10,
  },
  yearly: {
    id: '4',
    title: '생일',
    date: '2025-06-15',
    startTime: '00:00',
    endTime: '23:59',
    description: '생일 축하',
    location: '',
    category: '개인',
    repeat: { type: 'yearly', interval: 1, endDate: '2025-12-31' },
    notificationTime: 1440,
  },
  none: {
    id: '5',
    title: '단일 회의',
    date: '2025-06-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '1회성 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
};

// 혼합 이벤트 (반복 + 단일)
export const mixedEvents = [
  testEvents.daily,
  testEvents.none,
  testEvents.weekly,
];
```

---

## 검증 포인트

### 핵심 검증 사항

1. **아이콘 존재 여부**
   - ✅ 반복 일정: 아이콘 존재 (`screen.getByLabelText('반복 일정')`)
   - ✅ 단일 일정: 아이콘 없음 (`screen.queryByLabelText('반복 일정')` → null)

2. **아이콘 위치**
   - ✅ 제목과 같은 줄(row)에 위치
   - ✅ 제목 바로 옆에 표시
   - ✅ 다른 요소(날짜, 시간 등)와 구분됨

3. **접근성**
   - ✅ `aria-label="반복 일정"` 속성 존재
   - ✅ 스크린 리더가 "반복 일정"으로 읽음
   - ✅ 키보드 접근 가능 (필요시)

4. **시각적 구분**
   - ✅ 반복 일정: "제목 🔁"
   - ✅ 단일 일정: "제목"
   - ✅ 한눈에 구분 가능

5. **모든 뷰 지원**
   - ✅ 월간 뷰: 아이콘 표시
   - ✅ 주간 뷰: 아이콘 표시
   - ✅ 일간 뷰: 아이콘 표시

---

## 불명확한 항목

> ✅ **REQ-005는 명확하게 정의되어 있어 불명확한 항목이 없습니다.**

다음 사항은 명세에서 명확히 정의됨:
- ✅ 반복 아이콘 표시 (🔁 또는 ⟳)
- ✅ 단일 일정과 구분
- ✅ 아이콘 위치 (제목 옆)
- ✅ 캘린더 뷰, 월/주/일 뷰 지원

### 선택적 확인 사항

| 항목 | 질문 | 제안 | 우선순위 |
| ---- | ---- | ---- | -------- |
| 아이콘 종류 | 🔁 또는 ⟳ 중 어느 것? | 🔁 사용 (더 명확) | Low |
| 아이콘 색상 | 테마 색상? 기본 색상? | 기본 inherit 사용 | Low |
| 터치 영역 | 아이콘 클릭 시 동작? | 클릭 불가 (시각 표시용) | Low |

---

## TODO 우선순위 요약

| 우선순위 | 항목 수 | 예상 시간 | TODO ID |
| -------- | ------- | --------- | ------- |
| High | 15 | 2.5시간 | 001-011, 015-017 |
| Medium | 3 | 30분 | 012, 014, 018 |
| **Total** | **18** | **3시간** | **001-018** |

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
@test-code-implementer @test-design-REQ-005-recurring-event-visual-indicator.md
TODO-001부터 순차적으로 테스트 코드 구현 시작
```

---

## 참고 문서

- [명세서](../docs/specification.md) - REQ-005, UI-002, NFR-003
- [테스트 코드 규칙](../docs/test-code-rules.md)
- [React Testing Library Best Practices](../docs/react-testing-library-best-practices.md)

---

**작성 완료일**: 2025-10-30  
**최종 검토자**: test-planner  
**상태**: ⏳ 승인 대기

