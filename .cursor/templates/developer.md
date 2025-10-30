# Developer Agent Templates

## 1. 구현 완료 보고서 템플릿

### Standard Implementation Report

```markdown
# 구현 완료: [기능명]

## 📋 개요

- **구현 일자**: YYYY-MM-DD
- **담당**: Developer Agent
- **관련 테스트**: `__test__/[파일명].spec.tsx`
- **구현 시간**: [예상 시간]

## ✅ 테스트 통과 현황

### 새로운 테스트

- ✅ [테스트 케이스 1]: PASS
- ✅ [테스트 케이스 2]: PASS
- ✅ [테스트 케이스 3]: PASS
- **총계**: 5/5 통과

### 기존 테스트

- ✅ 모든 기존 테스트 통과: 23/23
- ✅ 회귀 테스트: 이상 없음

### 커버리지

- **라인 커버리지**: 85%
- **브랜치 커버리지**: 78%
- **함수 커버리지**: 90%

## 📦 구현 파일 목록

### 새로 생성된 파일
```

src/
├── utils/
│ ├── dateUtils.ts # 날짜 유틸리티 함수
│ └── dateUtils.test.ts # 테스트 파일
├── hooks/
│ ├── useCalendar.ts # 캘린더 커스텀 훅
│ └── useCalendar.test.ts # 테스트 파일
└── types/
└── calendar.ts # 타입 정의

````

### 수정된 파일
없음 (기존 코드 보존)

## 🔧 주요 구현 내용

### 1. [기능/모듈명]

**파일**: `src/utils/dateUtils.ts`

**구현된 함수**:
```typescript
export function formatDate(date: string, format: string): string {
  // ISO 8601 문자열을 받아 지정된 포맷으로 변환
  // 테스트 케이스 'formats date correctly' 통과
}

export function isWeekend(date: string): boolean {
  // 주말 여부 확인
  // 테스트 케이스 'identifies weekend days' 통과
}
````

**통과된 테스트**:

- ✅ `formats date correctly`
- ✅ `identifies weekend days`
- ✅ `handles invalid dates`

### 2. [기능/모듈명]

**파일**: `src/hooks/useCalendar.ts`

**구현된 훅**:

```typescript
export function useCalendar(initialDate?: string) {
  // 캘린더 상태 관리
  // 날짜 선택, 이벤트 필터링 등
}
```

**통과된 테스트**:

- ✅ `initializes with current date`
- ✅ `changes selected date`
- ✅ `filters events by date`

## 🚫 기존 코드 수정 사항

**없음** - 모든 구현이 새 파일/함수로 완료되었습니다.

## 📝 구현 노트

### 기술적 결정사항

1. **date-fns 사용**: 날짜 포맷팅에 date-fns 라이브러리 활용
2. **ISO 8601 표준**: 모든 날짜는 ISO 8601 문자열로 처리
3. **불변성 유지**: 날짜 객체를 직접 수정하지 않고 새 객체 반환

### 제약사항

- 타임존은 로컬 시간 기준
- 날짜 범위는 1900-01-01 ~ 2100-12-31

### 향후 개선 가능 사항

- [ ] 다국어 지원 추가
- [ ] 타임존 처리 개선
- [ ] 성능 최적화 (메모이제이션)

## 🔍 코드 품질

### ESLint

```bash
✅ No warnings or errors
```

### TypeScript

```bash
✅ No type errors
✅ Strict mode enabled
```

### 테스트 실행 결과

```bash
pnpm test

 ✓ src/utils/dateUtils.test.ts (5 tests) 234ms
 ✓ src/hooks/useCalendar.test.ts (8 tests) 456ms

Test Files  2 passed (2)
     Tests  13 passed (13)
```

## 👤 다음 단계

**Status**: ✅ Implementation Complete - **Pending User Approval**

### 승인 요청

위 구현 내용을 검토하시고 승인해 주시겠습니까?

**[ ] 승인 - 다음 단계로 진행**  
**[ ] 수정 요청 - 피드백 주세요**  
**[ ] 보류 - 추가 논의 필요**

승인 주시면 @code-reviewer에게 코드 리뷰를 요청하겠습니다.

### 리뷰 포인트 (승인 후)

- 테스트 통과 확인
- 코드 가독성 검토
- 에러 처리 적절성
- 타입 안전성 확인

---

**작성자**: Developer Agent  
**작성일**: YYYY-MM-DD

````

---

## 2. 기존 코드 수정 승인 요청 템플릿

```markdown
# 🔄 기존 코드 수정 승인 요청

## 변경 개요
- **수정 레벨**: Level 2 (사용자 승인 필요)
- **긴급도**: 보통
- **영향 범위**: 중간

## 📍 변경 대상

### 파일
`src/components/Calendar/Calendar.tsx`

### 변경 내용
**함수**: `onDateSelect` Props 시그니처 변경

**현재 (Before)**:
```typescript
interface CalendarProps {
  onDateSelect?: (date: Date) => void;
}
````

**변경 후 (After)**:

```typescript
interface CalendarProps {
  onDateSelect?: (date: string) => void; // ISO 8601 string
}
```

## 🎯 변경 이유

### 테스트 케이스 요구사항

테스트 파일 `test/Calendar.test.tsx:45-52`에서 다음과 같이 기대하고 있습니다:

```typescript
it('calls onDateSelect with ISO string', () => {
  const handleSelect = vi.fn();
  render();

  // 날짜 클릭
  fireEvent.click(screen.getByText('15'));

  // ISO 문자열을 기대
  expect(handleSelect).toHaveBeenCalledWith('2025-10-15');
});
```

### 문제점

현재 구현은 Date 객체를 전달하지만, 테스트는 ISO 문자열을 기대합니다.

## 🌊 영향 범위 분석

### 직접 영향

**수정 필요 파일** (3개):

1. `src/pages/CalendarPage.tsx`
   - onDateSelect 핸들러 수정 필요
2. `src/components/EventForm.tsx`
   - 날짜 처리 로직 수정 필요
3. `src/hooks/useEventFilter.ts`
   - 날짜 비교 로직 수정 필요

**수정 예시**:

```typescript
// Before
const handleDateSelect = (date: Date) => {
  setSelectedDate(date);
  filterEvents(date);
};

// After
const handleDateSelect = (dateString: string) => {
  setSelectedDate(dateString);
  filterEvents(dateString);
};
```

### 테스트 영향

**수정 필요 테스트** (2개):

1. `test/CalendarPage.test.tsx`
2. `test/EventForm.test.tsx`

## 🔀 대안 검토

### 대안 1: 테스트 케이스 수정 (❌ 권장하지 않음)

```typescript
// 테스트를 Date 객체 기대하도록 변경
expect(handleSelect).toHaveBeenCalledWith(new Date('2025-10-15'));
```

**단점**:

- test-architect가 작성한 명세를 무시
- Date 객체는 타임존 이슈 가능성
- 직렬화/역직렬화 복잡

### 대안 2: Adapter 함수 생성 (⚠️ 더 복잡)

```typescript
const dateAdapter = {
  toISO: (date: Date) => date.toISOString(),
  fromISO: (iso: string) => new Date(iso),
};
```

**단점**:

- 불필요한 복잡성 증가
- 두 가지 표현 방식 혼재
- 유지보수 부담

### 대안 3: Props 시그니처 변경 (✅ 권장)

ISO 문자열을 표준으로 사용
**장점**:

- 테스트 통과
- 타입 안전성 향상
- 직렬화 용이
- 타임존 이슈 없음

## ⚡ 변경 작업 계획

### 1단계: Calendar 컴포넌트 수정

```typescript
// src/components/Calendar/Calendar.tsx
const handleDateClick = (day: number) => {
  const dateString = `${year}-${month}-${day}`;
  onDateSelect?.(dateString);
};
```

### 2단계: 사용처 수정

- CalendarPage: 핸들러 업데이트
- EventForm: 날짜 파싱 로직 업데이트
- useEventFilter: 날짜 비교 로직 업데이트

### 3단계: 테스트 업데이트

- 관련 테스트 수정
- 전체 테스트 실행 (pnpm test)

### 예상 소요 시간

약 30분 (코딩 20분 + 테스트 10분)

## ✅ 승인 요청

이 변경사항을 진행해도 될까요?

**[ ] Yes - 변경 진행**  
**[ ] No - 대안 제시 필요**  
**[ ] Hold - 추가 논의 필요**

---

**요청자**: Developer Agent  
**요청일**: YYYY-MM-DD

````

---

## 3. 빠른 구현 보고 템플릿 (간단한 기능)

```markdown
# ⚡ 빠른 구현: [기능명]

## 구현 파일
- ✅ `src/utils/[파일명].ts` (새 파일)

## 테스트 결과
```bash
pnpm test

✅ 5/5 통과
✅ 기존 테스트 영향 없음
````

## 구현 내용

[간단한 설명 1-2줄]

```typescript
// 핵심 코드
export function [함수명]([매개변수]) {
  // 구현
}
```

## 승인 요청

✅ 구현 완료 - 승인 후 @code-reviewer에게 전달하겠습니다.

**[ ] 승인**  
**[ ] 수정 요청**

---

작성: Developer Agent | YYYY-MM-DD

````

---

## 4. 부분 구현 보고 템플릿

```markdown
# 🔨 진행 중: [기능명]

## 현재 상태
**진행률**: 60% (6/10 테스트 통과)

## 완료된 항목
- ✅ 기본 함수 구현
- ✅ 유효성 검사
- ✅ 에러 처리

## 진행 중인 항목
- 🔄 엣지 케이스 처리
  - [ ] 빈 배열 처리
  - [ ] null/undefined 처리
  - [ ] 경계값 처리

## 차단 요소
### 🚧 기존 코드 수정 필요
- 파일: `src/components/EventList.tsx`
- 이유: 인터페이스 불일치
- 승인 필요: [별도 요청서 작성]

## 다음 작업
1. 승인 대기 중
2. 엣지 케이스 구현
3. 테스트 완료

## 예상 완료
승인 후 1-2시간

---
작성: Developer Agent | YYYY-MM-DD
````

---

## 5. 리팩토링 제안 템플릿

````markdown
# 💡 리팩토링 제안: [대상]

## 배경

테스트 통과 완료 후 코드 품질 개선 기회 발견

## 현재 코드 문제점

### 중복 코드

**위치**:

- `src/utils/dateUtils.ts:15-25`
- `src/utils/timeUtils.ts:30-40`

**문제**:

```typescript
// dateUtils.ts
function formatDate(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// timeUtils.ts (중복!)
function formatDateTime(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
```
````

## 제안 개선안

### 공통 함수 추출

```typescript
// src/utils/dateFormatter.ts (새 파일)
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

export function formatYMD(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// 사용
import { parseDate, formatYMD } from './dateFormatter';

function formatDate(date: string): string {
  return formatYMD(parseDate(date));
}
```

## 테스트 영향

```bash
pnpm test
✅ 모든 테스트 통과 (리팩토링 전후 동일)
```

## 영향 분석

- ✅ 테스트에 영향 없음
- ✅ 기존 API 변경 없음
- ✅ 내부 구현만 개선

## 이점

1. 중복 코드 제거
2. 유지보수성 향상
3. 재사용성 증가

## 진행 여부

**[ ] 승인 - 리팩토링 진행**  
**[ ] 보류 - 추후 진행**  
**[ ] 거절 - 현상 유지**

---

제안: Developer Agent | YYYY-MM-DD

````

---

## 6. 에러 해결 보고 템플릿

```markdown
# 🐛 에러 해결: [에러명]

## 발생 에러
```bash
TypeError: Cannot read property 'length' of undefined
  at formatEvents (src/utils/eventUtils.ts:15)
  at useEventList.ts:22
````

## 원인 분석

```typescript
// 문제 코드
function formatEvents(events: Event[]): string[] {
  return events.map((e) => e.title); // events가 undefined일 수 있음
}
```

**테스트 케이스**: `test/eventUtils.test.ts:34`

```typescript
it('handles undefined events gracefully', () => {
  expect(formatEvents(undefined)).toEqual([]);
});
```

## 해결 방법

```typescript
// 수정 후
function formatEvents(events?: Event[]): string[] {
  if (!events) return [];
  return events.map((e) => e.title);
}
```

## 테스트 결과

```bash
pnpm test

✅ handles undefined events gracefully: PASS
✅ 모든 테스트 통과: 8/8
```

## 재발 방지

- TypeScript strict null checks 활성화됨
- 선택적 매개변수에 대한 null check 필수

## 승인 요청

✅ 에러 수정 완료 - 승인 후 @code-reviewer에게 전달하겠습니다.

---

해결: Developer Agent | YYYY-MM-DD

````

---

## 7. 성능 최적화 보고 템플릿

```markdown
# ⚡ 성능 최적화: [대상]

## 최적화 대상
`src/components/EventList.tsx`

## 측정 결과

### Before
```bash
렌더링 시간: 245ms
재렌더링 횟수: 15회 (불필요: 12회)
메모리: 15MB
````

### After

```bash
렌더링 시간: 45ms (-82%)
재렌더링 횟수: 3회 (불필요: 0회)
메모리: 8MB (-47%)
```

## 적용 기법

### 1. React.memo

```typescript
export const EventCard = React.memo(
  ({ event }: EventCardProps) => {
    // 구현
  },
  (prev, next) => prev.event.id === next.event.id
);
```

### 2. useMemo

```typescript
const filteredEvents = useMemo(
  () => events.filter((e) => e.date === selectedDate),
  [events, selectedDate]
);
```

### 3. useCallback

```typescript
const handleClick = useCallback(
  (id: string) => {
    onEventClick(id);
  },
  [onEventClick]
);
```

## 테스트 영향

```bash
pnpm test
✅ 모든 테스트 통과 (성능 개선이 기능에 영향 없음)
```

## 권장사항

비슷한 패턴이 있는 다른 컴포넌트도 최적화 고려

## 승인 요청

✅ 최적화 완료 - 승인 후 @code-reviewer에게 전달하겠습니다.

---

최적화: Developer Agent | YYYY-MM-DD

````

---

## 8. 타입 정의 문서 템플릿

```markdown
# 📘 타입 정의: [모듈명]

## 파일
`src/types/calendar.ts`

## 핵심 타입

### Event
```typescript
/**
 * 캘린더 이벤트
 */
export interface Event {
  /** 고유 식별자 (UUID v4) */
  id: string;

  /** 이벤트 제목 (최대 100자) */
  title: string;

  /** 시작 날짜/시간 (ISO 8601) */
  startDate: string;

  /** 종료 날짜/시간 (ISO 8601) */
  endDate: string;

  /** 설명 (선택, 최대 500자) */
  description?: string;

  /** 카테고리 */
  category: EventCategory;
}
````

### EventCategory

```typescript
/**
 * 이벤트 카테고리
 */
export enum EventCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  MEETING = 'meeting',
  REMINDER = 'reminder',
}
```

## 타입 가드

```typescript
/**
 * Event 타입 가드
 */
export function isEvent(value: unknown): value is Event {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'startDate' in value &&
    'endDate' in value
  );
}
```

## 유틸리티 타입

```typescript
/**
 * 이벤트 생성용 (id 제외)
 */
export type CreateEventDTO = Omit;

/**
 * 이벤트 수정용 (부분 업데이트)
 */
export type UpdateEventDTO = Partial<Omit>;
```

## 사용 예시

```typescript
import { Event, CreateEventDTO, isEvent } from '@/types/calendar';

// 이벤트 생성
const newEvent: CreateEventDTO = {
  title: '팀 회의',
  startDate: '2025-10-29T10:00:00Z',
  endDate: '2025-10-29T11:00:00Z',
  category: EventCategory.MEETING,
};

// 타입 검증
if (isEvent(data)) {
  console.log('유효한 이벤트:', data.title);
}
```

## 테스트

```bash
pnpm type-check
✅ No type errors
```

## 승인 요청

✅ 타입 정의 완료 - 승인 후 @code-reviewer에게 전달하겠습니다.

---

작성: Developer Agent | YYYY-MM-DD

````

---

## 9. 구현 승인 대기 템플릿

```markdown
# ⏸️ 구현 완료 - 승인 대기

## 완료된 작업
- ✅ 모든 테스트 통과
- ✅ 타입 체크 통과
- ✅ 린트 통과
- ✅ 구현 완료 보고서 작성

## 요약
[한 줄 요약]

## 주요 변경사항
1. [변경 1]
2. [변경 2]
3. [변경 3]

## 테스트 결과
```bash
pnpm test
✅ All tests passed
````

## 다음 단계

👤 **사용자 승인 대기 중**

승인해 주시면:

1. @code-reviewer 멘션
2. 코드 리뷰 진행
3. 최종 완료

## 액션 필요

**[ ] 승인 - 다음 단계 진행**  
**[ ] 수정 요청 - 피드백 주세요**  
**[ ] 추가 설명 필요**

---

대기: Developer Agent | YYYY-MM-DD

````

---

## 템플릿 선택 가이드

| 상황 | 사용 템플릿 |
|------|-------------|
| 일반 구현 완료 | Template 1: Standard Implementation Report |
| 기존 코드 수정 필요 | Template 2: 기존 코드 수정 승인 요청 |
| 간단한 함수 추가 | Template 3: 빠른 구현 보고 |
| 구현 진행 중 | Template 4: 부분 구현 보고 |
| 리팩토링 제안 | Template 5: 리팩토링 제안 |
| 버그 수정 | Template 6: 에러 해결 보고 |
| 성능 개선 | Template 7: 성능 최적화 보고 |
| 타입 정의 추가 | Template 8: 타입 정의 문서 |
| 승인 대기 리마인더 | Template 9: 구현 승인 대기 |

## 승인 프로세스

### 모든 보고서의 마지막에 포함
```markdown
---
**Status**: ✅ Implementation Complete - **Pending User Approval**

### 승인 요청
위 구현 내용을 검토하시고 승인해 주시겠습니까?

**[ ] 승인 - 다음 단계로 진행**
**[ ] 수정 요청 - 피드백 주세요**
**[ ] 보류 - 추가 논의 필요**

승인 주시면 @code-reviewer에게 코드 리뷰를 요청하겠습니다.
````

---

**Version**: 1.0.1  
**Last Updated**: 2025-10-29
