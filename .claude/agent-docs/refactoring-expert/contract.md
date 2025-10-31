# Refactoring Expert: 계약 명세서 (Contract)

## 목차

1. [개요](#개요)
2. [입력 계약](#입력-계약)
3. [출력 계약](#출력-계약)
4. [검증 기준](#검증-기준)
5. [Handoff 문서 형식](#handoff-문서-형식)
6. [격리 계약](#격리-계약)
7. [에러 처리](#에러-처리)

---

## 개요

Refactoring Expert는 **Phase 5 (REFACTOR)**에서 동작하며, GREEN 단계에서 작성된 동작하는 코드를 테스트 통과를 유지하면서 품질을 향상시키는 역할을 수행한다.

**핵심 책임:**

- 코드 중복 제거 (DRY 원칙)
- React 성능 최적화 (memo, useMemo, useCallback)
- TypeScript 타입 안전성 강화 (any 제거)
- 코드 가독성 및 유지보수성 향상
- 디자인 패턴 적용
- 리팩터링 근거 문서화

**선행 조건:**

- Phase 4 (GREEN)이 완료되어야 함
- 모든 테스트가 통과한 상태여야 함
- TypeScript 컴파일 성공
- Orchestrator가 생성한 Handoff 문서가 존재해야 함

**후속 단계:**

- Phase 6 (VALIDATE)로 전달
- Orchestrator가 최종 검증 수행

**핵심 제약:**

- ⚠️ **테스트는 반드시 통과를 유지해야 함**
- ⚠️ **기능 변경 금지** (동작 보존)
- ⚠️ **테스트 파일은 수정하지 않음** (프로덕션 코드만 개선)

---

## 입력 계약

### Handoff 문서 경로

```
.claude/agent-docs/orchestrator/handoff/phase5.md
```

### 필수 입력 항목

```yaml
---
phase: 5
agent: refactoring-expert
timestamp: [ISO 8601 형식]
status: ready

inputs:
  implementation_files:
    - [구현 완료된 파일 목록]
    - src/utils/*.ts
    - src/hooks/*.ts
    - src/components/*.tsx

  test_files:
    - src/__tests__/task.*.spec.ts

  test_results:
    status: PASS
    all_tests_passing: true
    coverage: [커버리지 %]

  context_files:
    - CLAUDE.md # 프로젝트 규칙
    - .claude/docs/folder-tree.md # 프로젝트 구조
    - .claude/agent-docs/feature-designer/logs/spec.md # 기능 명세
    - .claude/agent-docs/test-designer/logs/test-strategy.md # 테스트 전략

references:
  agent_definition: ../../agents/refactoring-expert.md
  project_rules: CLAUDE.md
  previous_phase: ../code-writer/logs/green-phase-log.md

output_requirements:
  path: .claude/agent-docs/refactoring-expert/logs/YYYY-MM-DD_refactoring-log.md
  required_sections:
    - 리팩터링 요약
    - 개선 사항 상세
    - 변경 전/후 코드 비교
    - 성능 영향 분석
    - 테스트 결과
  format: markdown

constraints:
  - 테스트 통과 유지 (필수)
  - 기능 변경 금지
  - CLAUDE.md 컨벤션 준수
  - 프로덕션 코드만 수정 (테스트 파일 수정 금지)
  - 근거 있는 최적화만 적용
  - ESLint 및 TypeScript 검사 통과

validation_criteria:
  - 모든 테스트가 여전히 통과하는가
  - 코드 중복이 제거되었는가
  - TypeScript any가 제거되었는가
  - ESLint 경고가 해결되었는가
  - 리팩터링 근거가 명확한가
---
```

### 입력 데이터 구조

#### 1. implementation_files (필수)

```typescript
{
  files: string[];              // 리팩터링 대상 파일 경로 목록
  green_phase_log: string;      // Phase 4 작업 로그 경로
}
```

#### 2. test_results (필수)

```typescript
{
  status: 'PASS'; // 반드시 PASS여야 함
  all_tests_passing: true; // 모든 테스트 통과
  test_command: string; // 실행한 테스트 명령어
  output: string; // 테스트 실행 결과
}
```

#### 3. context_files (필수)

최소 포함 파일:

- `CLAUDE.md` - 프로젝트 규칙
- `.claude/docs/folder-tree.md` - 프로젝트 구조
- Feature Designer의 명세서 (설계 의도 파악)
- Test Designer의 테스트 전략 (테스트 범위 확인)

---

## 출력 계약

### 출력 파일 경로

```
.claude/agent-docs/refactoring-expert/logs/YYYY-MM-DD_refactoring-log.md
```

### 필수 출력 구조

````markdown
# 리팩터링 보고서: [기능명]

## 1. 요약

### 1.1 리팩터링 개요

- **대상 기능**: [기능명]
- **리팩터링 시작 시각**: [ISO 8601]
- **리팩터링 완료 시각**: [ISO 8601]
- **전체 품질 평가**: [1-2문장 요약]

### 1.2 최우선 개선 사항 (Top 3)

1. [개선 1] - [이유]
2. [개선 2] - [이유]
3. [개선 3] - [이유]

### 1.3 주요 지표

| 지표            | Before | After | 개선율  |
| --------------- | ------ | ----- | ------- |
| 코드 중복       | [N개]  | [M개] | [-X%]   |
| any 타입 사용   | [N개]  | [0개] | [-100%] |
| ESLint 경고     | [N개]  | [M개] | [-X%]   |
| TypeScript 에러 | [N개]  | [0개] | [-100%] |
| 테스트 통과율   | 100%   | 100%  | 유지 ✅ |

## 2. 개선 사항 상세

### 2.1 DRY 원칙 적용

#### 개선 1: [제목]

**카테고리**: DRY / 코드 중복 제거

**문제점**:
[중복 코드나 반복 패턴 설명]

**영향**:

- 유지보수 비용 증가
- 버그 발생 위험 증가
- 코드 가독성 저하

**우선순위**: 높음

**변경 전**:

```typescript
// 파일: src/hooks/useEventForm.ts
const validateStartTime = (startTime: string) => {
  if (!startTime) {
    enqueueSnackbar('시작 시간을 입력해주세요', { variant: 'error' });
    return false;
  }
  return true;
};

const validateEndTime = (endTime: string) => {
  if (!endTime) {
    enqueueSnackbar('종료 시간을 입력해주세요', { variant: 'error' });
    return false;
  }
  return true;
};
```
````

**변경 후**:

```typescript
// 파일: src/utils/timeValidation.ts
export const validateTimeInput = (
  time: string,
  fieldName: string,
  enqueueSnackbar: EnqueueSnackbar
): boolean => {
  if (!time) {
    enqueueSnackbar(`${fieldName}을 입력해주세요`, { variant: 'error' });
    return false;
  }
  return true;
};

// 파일: src/hooks/useEventForm.ts
const isStartTimeValid = validateTimeInput(startTime, '시작 시간', enqueueSnackbar);
const isEndTimeValid = validateTimeInput(endTime, '종료 시간', enqueueSnackbar);
```

**설명**:

- 중복된 유효성 검사 로직을 공통 유틸리티 함수로 추출
- 순수 함수 원칙 준수 (외부 상태 의존 없음)
- 재사용성 향상

**테스트 고려사항**:

- 기존 테스트가 여전히 통과하는지 확인
- `pnpm test task.[feature].spec.ts` 실행

---

### 2.2 React 성능 최적화

#### 개선 2: [제목]

**카테고리**: 성능 / React 최적화

**문제점**:
[불필요한 리렌더링, 비용 큰 계산 등]

**영향**:

- 성능 저하
- 사용자 경험 악화
- 배터리 소모 증가

**우선순위**: 중간

**변경 전**:

```typescript
// 파일: src/components/EventList.tsx
const EventList = ({ events, onEdit, onDelete }: EventListProps) => {
  // 매 렌더마다 필터링 재계산
  const filteredEvents = events
    .filter((event) => event.date >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Box>
      {filteredEvents.map((event) => (
        <EventCard key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </Box>
  );
};
```

**변경 후**:

```typescript
// 파일: src/components/EventList.tsx
const EventList = memo(({ events, onEdit, onDelete }: EventListProps) => {
  // 비용 큰 계산은 useMemo로 메모이제이션
  const filteredEvents = useMemo(
    () =>
      events
        .filter((event) => event.date >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events]
  );

  // 콜백 함수는 useCallback으로 참조 안정화
  const handleEdit = useCallback(
    (id: string) => {
      onEdit(id);
    },
    [onEdit]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDelete(id);
    },
    [onDelete]
  );

  return (
    <Box>
      {filteredEvents.map((event) => (
        <EventCard key={event.id} event={event} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </Box>
  );
});
```

**설명**:

- `React.memo`로 props 변경 시에만 리렌더
- `useMemo`로 비용 큰 필터링/정렬 계산 메모이제이션
- `useCallback`으로 자식 컴포넌트 props 참조 안정화
- 명확한 성능 이점이 있는 경우에만 적용 (성급한 최적화 지양)

**테스트 고려사항**:

- 기능 동작이 동일한지 확인
- 렌더 횟수가 감소했는지 React DevTools로 확인

---

### 2.3 타입 안전성 강화

#### 개선 3: [제목]

**카테고리**: 타입 안전성 / TypeScript

**문제점**:
[any 사용, 타입 주석 누락 등]

**영향**:

- 타입 안전성 손실
- IDE 자동완성 불가
- 런타임 에러 위험

**우선순위**: 높음

**변경 전**:

```typescript
// 파일: src/utils/eventUtils.ts
export const groupEventsByDate = (events: any) => {
  const grouped: any = {};
  events.forEach((event: any) => {
    if (!grouped[event.date]) {
      grouped[event.date] = [];
    }
    grouped[event.date].push(event);
  });
  return grouped;
};
```

**변경 후**:

```typescript
// 파일: src/utils/eventUtils.ts
export const groupEventsByDate = (events: Event[]): Record<string, Event[]> => {
  const grouped: Record<string, Event[]> = {};
  events.forEach((event) => {
    if (!grouped[event.date]) {
      grouped[event.date] = [];
    }
    grouped[event.date].push(event);
  });
  return grouped;
};
```

**설명**:

- 모든 `any` 타입을 구체적인 타입으로 대체
- 반환 타입 명시로 타입 안전성 확보
- IDE 자동완성 및 타입 체킹 활성화

**테스트 고려사항**:

- `pnpm lint:tsc` 실행하여 타입 에러 없는지 확인

---

### 2.4 코드 가독성 향상

#### 개선 4: [제목]

**카테고리**: 가독성 / 유지보수성

**문제점**:
[복잡한 로직, 매직 넘버, 불명확한 이름 등]

**영향**:

- 코드 이해 어려움
- 유지보수 비용 증가
- 버그 발생 위험

**우선순위**: 중간

**변경 전**:

```typescript
// 파일: src/utils/dateUtils.ts
export const getWeekDates = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    dates.push(current);
  }
  return dates;
};
```

**변경 후**:

```typescript
// 파일: src/utils/dateUtils.ts
const DAYS_IN_WEEK = 7;
const SUNDAY_INDEX = 0;
const DAYS_TO_SUBTRACT_FOR_SUNDAY = -6;
const MONDAY_OFFSET = 1;

export const getWeekDates = (date: Date): Date[] => {
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay();

  // 월요일로 정규화
  const daysFromMonday =
    dayOfWeek === SUNDAY_INDEX ? DAYS_TO_SUBTRACT_FOR_SUNDAY : MONDAY_OFFSET - dayOfWeek;

  const mondayDate = new Date(targetDate);
  mondayDate.setDate(targetDate.getDate() + daysFromMonday);

  // 월요일부터 일요일까지 생성
  return Array.from({ length: DAYS_IN_WEEK }, (_, index) => {
    const currentDate = new Date(mondayDate);
    currentDate.setDate(mondayDate.getDate() + index);
    return currentDate;
  });
};
```

**설명**:

- 매직 넘버를 명명된 상수로 추출
- 변수명을 명확하게 개선 (`d` → `targetDate`, `day` → `dayOfWeek`)
- 복잡한 로직을 단계별로 분해하여 가독성 향상
- 명확한 주석 추가

**테스트 고려사항**:

- 동일한 입력에 동일한 출력 반환 확인

---

### 2.5 디자인 패턴 적용

#### 개선 5: [제목]

**카테고리**: 디자인 패턴 / 아키텍처

**문제점**:
[관심사 분리 부족, 결합도 높음 등]

**영향**:

- 코드 재사용 어려움
- 테스트 복잡도 증가
- 확장성 저하

**우선순위**: 낮음

**변경 전**:

```typescript
// 파일: src/hooks/useEventForm.ts
const useEventForm = () => {
  const handleSubmit = async () => {
    // 유효성 검사
    if (!title) return;
    if (!date) return;
    if (startTime >= endTime) return;

    // API 호출
    try {
      await fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      console.error(error);
    }
  };
};
```

**변경 후**:

```typescript
// 파일: src/hooks/useEventForm.ts
const useEventForm = () => {
  const { createEvent } = useEventOperations();
  const { validateEventForm } = useEventValidation();

  const handleSubmit = async () => {
    // 관심사 분리: 유효성 검사는 별도 훅으로
    const validation = validateEventForm(eventData);
    if (!validation.isValid) {
      validation.errors.forEach((error) => enqueueSnackbar(error, { variant: 'error' }));
      return;
    }

    // 관심사 분리: API 호출은 useEventOperations로
    try {
      await createEvent(eventData);
      enqueueSnackbar('일정이 생성되었습니다', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('일정 생성에 실패했습니다', { variant: 'error' });
    }
  };
};
```

**설명**:

- 단일 책임 원칙 적용 (유효성 검사, API 호출 분리)
- 커스텀 훅으로 로직 캡슐화
- 재사용성 및 테스트 용이성 향상

**테스트 고려사항**:

- 각 훅을 독립적으로 테스트 가능

---

## 3. 구현 로드맵

### 3.1 변경 순서 (안전한 것 → 위험한 것)

1. **Step 1: 타입 안전성 강화** (가장 안전)

   - any 타입 제거
   - 반환 타입 명시
   - 예상 작업량: 30분

2. **Step 2: 코드 중복 제거**

   - 공통 로직을 유틸 함수로 추출
   - 테스트 실행하여 동작 보존 확인
   - 예상 작업량: 1시간

3. **Step 3: 가독성 개선**

   - 변수명 개선
   - 매직 넘버 상수화
   - 주석 추가
   - 예상 작업량: 30분

4. **Step 4: 성능 최적화** (주의 필요)

   - memo, useMemo, useCallback 적용
   - 각 변경 후 테스트 실행
   - 예상 작업량: 1시간

5. **Step 5: 디자인 패턴 적용** (가장 위험)
   - 아키텍처 변경
   - 각 단계마다 테스트 확인
   - 예상 작업량: 1-2시간

### 3.2 변경 간 의존성

```
타입 안전성 강화
  ↓ (선행 필요)
코드 중복 제거
  ↓ (선행 필요)
가독성 개선
  ↓ (독립 가능)
성능 최적화
  ↓ (독립 가능)
디자인 패턴 적용
```

### 3.3 각 변경 후 검증

모든 변경 후 다음 명령어 실행:

```bash
# 1. 테스트 통과 확인 (필수)
pnpm test task.[feature].spec.ts

# 2. 타입 검사 (필수)
pnpm lint:tsc

# 3. ESLint 검사 (필수)
pnpm lint:eslint

# 4. 전체 테스트 (권장)
pnpm test

# 5. 빌드 성공 확인 (최종)
pnpm build
```

---

## 4. 문서 개선 사항

### 4.1 코드 주석 권장 위치

- 복잡한 알고리즘 설명
- 비즈니스 로직 의도
- 엣지 케이스 처리 이유
- 성능 최적화 근거

**예시:**

```typescript
// 윤년 2월 29일 처리: 평년에는 3월 1일로 대체
const adjustedDate = isLeapYear(year) ? new Date(year, 1, 29) : new Date(year, 2, 1);
```

### 4.2 타입 문서화 권장

````typescript
/**
 * 일정 데이터를 날짜별로 그룹화
 *
 * @param events - 그룹화할 일정 배열
 * @returns 날짜를 키로 하는 일정 배열의 Record
 *
 * @example
 * ```typescript
 * const grouped = groupEventsByDate([
 *   { id: '1', date: '2025-10-30', ... },
 *   { id: '2', date: '2025-10-30', ... }
 * ]);
 * // { '2025-10-30': [event1, event2] }
 * ```
 */
export const groupEventsByDate = (events: Event[]): Record<string, Event[]> => {
  // ...
};
````

### 4.3 아키텍처 결정 기록

리팩터링 중 중요한 아키텍처 결정이 있다면 `references/architecture-decisions.md`에 기록:

```markdown
# 아키텍처 결정 기록 (ADR)

## 2025-10-30: React.memo 적용 기준

**상황:**
EventList 컴포넌트가 부모 리렌더 시 불필요하게 리렌더됨.

**결정:**
React.memo 적용하되, 다음 조건을 만족할 때만 적용:

1. 렌더 비용이 큼 (많은 DOM 노드 또는 비용 큰 계산)
2. props가 자주 변경되지 않음
3. 성능 프로파일링으로 효과 확인됨

**근거:**

- 성급한 최적화 방지
- 코드 복잡도 증가 최소화
- 명확한 이점이 있을 때만 적용

**영향:**

- EventList, CalendarView 컴포넌트에 적용
- 나머지 컴포넌트는 프로파일링 후 결정
```

---

## 5. 테스트 결과

### 5.1 리팩터링 전 테스트 결과

```bash
$ pnpm test task.repeat-event.spec.ts

✓ src/__tests__/task.repeat-event.spec.ts (10 tests) 2500ms
  ✓ 반복 일정 생성 (3 tests)
    ✓ 매일 반복 일정 생성
    ✓ 매주 반복 일정 생성
    ✓ 매월 반복 일정 생성
  ✓ 반복 일정 유효성 검사 (3 tests)
  ✓ 반복 일정 수정 (2 tests)
  ✓ 반복 일정 삭제 (2 tests)

Tests  10 passed (10)
Time   2500ms
```

### 5.2 리팩터링 후 테스트 결과

```bash
$ pnpm test task.repeat-event.spec.ts

✓ src/__tests__/task.repeat-event.spec.ts (10 tests) 2300ms
  ✓ 반복 일정 생성 (3 tests)
    ✓ 매일 반복 일정 생성
    ✓ 매주 반복 일정 생성
    ✓ 매월 반복 일정 생성
  ✓ 반복 일정 유효성 검사 (3 tests)
  ✓ 반복 일정 수정 (2 tests)
  ✓ 반복 일정 삭제 (2 tests)

Tests  10 passed (10)
Time   2300ms ✅ (200ms 개선)

$ pnpm test

✓ 전체 테스트 통과
Tests  150 passed (150)
```

### 5.3 품질 검증

```bash
$ pnpm lint:tsc
✓ TypeScript 에러 없음

$ pnpm lint:eslint
✓ ESLint 경고 없음

$ pnpm build
✓ 빌드 성공
```

---

## 6. 성능 영향 분석

### 6.1 렌더 성능

**측정 방법**: React DevTools Profiler

| 컴포넌트     | Before (ms) | After (ms) | 개선 |
| ------------ | ----------- | ---------- | ---- |
| EventList    | 45ms        | 12ms       | -73% |
| CalendarView | 80ms        | 60ms       | -25% |

### 6.2 번들 크기

| 항목      | Before | After | 차이 |
| --------- | ------ | ----- | ---- |
| 번들 크기 | 250KB  | 248KB | -2KB |
| Gzipped   | 80KB   | 79KB  | -1KB |

### 6.3 TypeScript 컴파일 시간

| 항목        | Before | After   |
| ----------- | ------ | ------- |
| 컴파일 시간 | 3.2s   | 3.0s ✅ |

---

## 7. 남은 기술 부채

### 7.1 현재 리팩터링에서 해결하지 못한 사항

1. **App.tsx 컴포넌트 분리** (661줄)

   - 이유: 명시적 요청 없음
   - 우선순위: 낮음
   - 향후 과제로 보류

2. **반복 일정 UI 구현**
   - 이유: 8주차 과제 예정
   - 우선순위: 보류
   - 백엔드 로직만 완료

### 7.2 후속 작업 제안

1. **성능 프로파일링 추가**

   - React DevTools로 실제 사용 시나리오 측정
   - 병목 지점 추가 최적화

2. **테스트 커버리지 개선**

   - 현재 커버리지: 85%
   - 목표 커버리지: 90%+
   - 엣지 케이스 테스트 추가

3. **접근성 개선**
   - aria-label 추가
   - 키보드 네비게이션 지원

---

## 8. 결론

### 8.1 리팩터링 성과

✅ **성공 지표:**

- 테스트 100% 통과 유지
- any 타입 0개 (완전 제거)
- ESLint 경고 0개
- 코드 중복 50% 감소
- 렌더 성능 25-73% 개선

✅ **코드 품질:**

- DRY 원칙 준수
- 타입 안전성 확보
- React 최적화 적용
- 가독성 향상
- 유지보수성 개선

### 8.2 Phase 6 준비 완료

다음 검증 항목:

- [x] 모든 테스트 통과
- [x] TypeScript 에러 없음
- [x] ESLint 경고 없음
- [x] 빌드 성공
- [x] 리팩터링 근거 문서화

**Phase 6 (VALIDATE)로 진행 가능합니다.** ✅

````

---

## 검증 기준

### Phase 5 완료 조건

#### 필수 체크리스트

- ✅ **테스트 통과 유지** (최우선)
  - 모든 테스트가 여전히 통과함
  - 테스트 파일은 수정하지 않음
  - `pnpm test` 결과: PASS

- ✅ **코드 품질 개선**
  - DRY 원칙 적용 (중복 제거)
  - any 타입 완전 제거
  - ESLint 경고 해결
  - 가독성 향상

- ✅ **성능 최적화** (해당 시)
  - React.memo, useMemo, useCallback 적절히 적용
  - 근거 있는 최적화만 수행
  - 성급한 최적화 지양

- ✅ **타입 안전성**
  - 모든 함수에 타입 주석
  - 반환 타입 명시
  - TypeScript strict 모드 통과

- ✅ **문서화**
  - 리팩터링 근거 명확
  - 변경 전/후 코드 비교
  - 영향 분석 포함

- ✅ **프로젝트 규칙 준수**
  - CLAUDE.md 컨벤션 준수
  - 파일 명명 규칙 유지
  - Import 순서 규칙 준수

### 검증 명령어

```bash
# 1. 테스트 통과 확인 (필수)
pnpm test task.[feature].spec.ts

# 2. 전체 테스트 통과 확인 (필수)
pnpm test

# 3. TypeScript 검사 (필수)
pnpm lint:tsc

# 4. ESLint 검사 (필수)
pnpm lint:eslint

# 5. 통합 검사 (권장)
pnpm lint

# 6. 빌드 성공 확인 (최종)
pnpm build

# 7. 리팩터링 보고서 존재 확인
ls -la .claude/agent-docs/refactoring-expert/logs/YYYY-MM-DD_refactoring-log.md
````

### 품질 기준

**동작 보존 (Behavior Preservation)**

- ❌ 기능 변경
- ✅ 동일한 동작 유지
- ✅ 테스트 100% 통과

**근거 기반 최적화 (Justified Optimization)**

- ❌ "더 나아 보여서"
- ✅ "렌더 횟수가 N배 감소"
- ✅ "번들 크기가 X% 감소"

**점진적 개선 (Incremental Improvement)**

- ❌ 전체 재작성
- ✅ 작은 안전한 변경
- ✅ 각 단계마다 테스트

**실용성 (Pragmatism)**

- ❌ 과도한 추상화
- ✅ 필요한 수준의 품질
- ✅ 완벽함과 실용성의 균형

---

## Handoff 문서 형식

### Phase 5 → Phase 6 전환

Orchestrator가 다음 Handoff 문서 생성:

```yaml
---
phase: 6
agent: orchestrator
timestamp: [ISO 8601]
status: ready
previous_phase: 5

inputs:
  refactor_report: .claude/agent-docs/refactoring-expert/logs/YYYY-MM-DD_refactoring-log.md
  implementation_files:
    - [리팩터링된 파일 목록]
  test_files:
    - src/__tests__/task.*.spec.ts

  all_phase_logs:
    - .claude/agent-docs/feature-designer/logs/spec.md
    - .claude/agent-docs/test-designer/logs/test-strategy.md
    - .claude/agent-docs/test-writer/logs/YYYY-MM-DD_test-writing-log.md
    - .claude/agent-docs/code-writer/logs/YYYY-MM-DD_implementation-log.md
    - .claude/agent-docs/refactoring-expert/logs/YYYY-MM-DD_refactoring-log.md

references:
  agent_definition: ../../agents/orchestrator.md
  project_rules: CLAUDE.md

output_requirements:
  path: .claude/agent-docs/orchestrator/logs/final-report.md
  required_sections:
    - 작업 요약
    - 완료된 작업 목록
    - 품질 검증 결과
    - 변경 사항
    - 테스트 커버리지
    - 남은 기술 부채
    - 후속 작업 제안

validation_criteria:
  - 모든 테스트 통과
  - 커버리지 목표 달성
  - TypeScript 에러 없음
  - ESLint 경고 없음
  - 통합 시나리오 동작
  - Git 커밋 완료
---
```

---

## 격리 계약

### Refactoring Expert가 할 수 있는 것

✅ **허용:**

- Handoff 문서 읽기
- refactoring-expert.md 참조
- CLAUDE.md 읽기
- Phase 4 산출물 (구현 코드) 읽기
- Phase 1-2 산출물 (명세서, 테스트 전략) 참조
- implementation_files에 명시된 파일 수정
- logs/YYYY-MM-DD_refactoring-log.md 작성
- references/ 디렉토리에 참고 자료 저장
- 테스트 실행 (검증용)

### Refactoring Expert가 할 수 없는 것

❌ **금지:**

- 테스트 파일 수정 (절대 금지)
- 기능 변경 (동작 보존 필수)
- 다른 Phase의 Handoff 문서 읽기
- Orchestrator의 전체 계획 접근
- 다른 에이전트 실행 컨텍스트 접근
- Git 커밋 생성 (Orchestrator의 역할)
- 새로운 테스트 작성 (Test Writer의 역할)

### 순수 함수 원칙

```typescript
// 개념적 모델
type RefactoringExpert = (handoff: HandoffDoc, code: ProductionCode) => RefactoredCode;

// 특성
// - 동일한 입력 → 동일한 출력
// - 테스트 통과 유지 (불변 조건)
// - 기능 변경 없음 (동작 보존)
// - 부수 효과 최소화 (파일 수정만)
// - 다른 에이전트와 독립적
```

---

## 에러 처리

### 테스트 실패

**상황:** 리팩터링 후 테스트 실패

**조치:**

1. 즉시 변경 사항 되돌리기
2. 실패 원인 분석
3. `references/issues-log.md`에 문제 기록
4. 더 작은 단위로 리팩터링 재시도
5. Orchestrator에게 보고

**예시:**

```markdown
## ⚠️ 리팩터링 실패

### 실패한 변경

파일: src/hooks/useEventForm.ts
변경: 유효성 검사 로직을 유틸로 추출

### 실패 원인

테스트: "시작 시간 유효성 검사"
에러: enqueueSnackbar가 undefined

### 근본 원인

순수 함수로 추출하면서 enqueueSnackbar 접근 불가

### 해결 방안

1. enqueueSnackbar를 파라미터로 전달
2. 또는 유효성 검사는 훅 내부에 유지

### 조치

변경 사항 롤백 후 방안 1로 재시도
```

### TypeScript 에러

**상황:** any 제거 시 타입 에러 발생

**조치:**

1. 에러 메시지 분석
2. 적절한 타입 정의 추가
3. 필요 시 제네릭 활용
4. 타입 가드 함수 작성
5. 컴파일 성공 확인

**예시:**

```typescript
// ❌ 타입 에러
const result = data.map((item) => item.value); // item이 any

// ✅ 해결 1: 명시적 타입
const result = data.map((item: DataItem) => item.value);

// ✅ 해결 2: 제네릭
const mapValues = <T extends { value: string }>(data: T[]): string[] => {
  return data.map((item) => item.value);
};
```

### 성능 저하

**상황:** 최적화가 오히려 성능 저하

**조치:**

1. React DevTools Profiler로 측정
2. 최적화 전/후 비교
3. 성능 저하 시 최적화 제거
4. 근거 있는 최적화만 유지
5. 측정 결과 문서화

**예시:**

```markdown
## 성능 측정 결과

### 시나리오: 10개 이벤트 렌더링

| 최적화          | 렌더 시간 | 결과          |
| --------------- | --------- | ------------- |
| 최적화 전       | 25ms      | 기준          |
| React.memo 적용 | 40ms ❌   | 오히려 느려짐 |
| useMemo만 적용  | 15ms ✅   | 40% 개선      |

### 결정

- React.memo 제거 (오버헤드)
- useMemo만 유지 (실제 이득)
```

### 아키텍처 충돌

**상황:** 리팩터링이 프로젝트 아키텍처와 충돌

**조치:**

1. 충돌 지점 명시
2. 현재 아키텍처 원칙 확인
3. 대안 제시
4. Orchestrator와 논의
5. 승인 후 진행

**예시:**

```markdown
## ⚠️ 아키텍처 충돌

### 문제

리팩터링: 전역 캐시 레이어 추가 권장
프로젝트 원칙: 전역 상태 라이브러리 미사용

### 대안

1. **로컬 캐시만 사용** (권장)

   - Context API로 제한된 범위 캐싱
   - 프로젝트 원칙 준수

2. **캐싱 없이 최적화**
   - useMemo로 계산 메모이제이션
   - 서버 캐싱 활용

### 결정 필요

Orchestrator 승인 대기
```

---

## 작업 산출물

### 핵심 파일

```
.claude/agent-docs/refactoring-expert/
├── logs/
│   ├── YYYY-MM-DD_refactoring-log.md  # 리팩터링 보고서 (필수)
│   └── performance-analysis.md    # 성능 분석 (선택)
│
└── references/
    ├── architecture-decisions.md  # 아키텍처 결정 기록
    ├── issues-log.md              # 문제 발생 로그
    └── optimization-rationale.md  # 최적화 근거
```

### YYYY-MM-DD_refactoring-log.md 템플릿

상단 [출력 계약](#출력-계약) 섹션 참조

---

## 참고 자료

- [Refactoring Expert 역할 정의](../../agents/refactoring-expert.md)
- [프로젝트 규칙 (CLAUDE.md)](../../../CLAUDE.md)
- [Orchestrator 계약](../orchestrator/contract.md)
- [Code Writer 계약](../code-writer/contract.md)

---

**마지막 업데이트**: 2025-10-30
**버전**: 1.0.0
**Phase**: 5 (REFACTOR)
