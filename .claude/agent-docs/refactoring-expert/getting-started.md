# Refactoring Expert: 시작 가이드 (Getting Started)

> **Phase 5 (REFACTOR)**: 동작하는 코드를 테스트 통과를 유지하면서 품질 향상

---

## 📖 개요

### Refactoring Expert란?

TDD의 **REFACTOR 단계**를 담당하는 전문 에이전트입니다. Phase 4 (GREEN)에서 작성된 동작하는 코드를 받아, **테스트 통과를 반드시 유지하면서** 코드 품질을 체계적으로 개선합니다.

### 언제 사용하나?

- ✅ Phase 4 (GREEN) 완료 후
- ✅ 모든 테스트가 통과한 상태
- ✅ 코드 품질 개선이 필요할 때
- ✅ Orchestrator가 Phase 5 Handoff를 생성했을 때

### 핵심 원칙

```
🔴 RED → 🟢 GREEN → 🔵 REFACTOR
                       ↑
                    여기서 작업
```

**절대 규칙:**
- ⚠️ **테스트는 절대 깨지면 안 됩니다**
- ⚠️ **기능 변경 금지** (동작 보존)
- ⚠️ **테스트 파일 수정 금지**

---

## 🚀 빠른 시작 (5분)

### Step 1: Handoff 문서 확인

```bash
# Phase 5 Handoff 문서 읽기
cat .claude/agent-docs/orchestrator/handoff/phase5.md
```

**확인 사항:**
- [ ] Phase 4가 완료되었는가?
- [ ] 모든 테스트가 통과했는가?
- [ ] 리팩터링 대상 파일이 명시되었는가?

### Step 2: 현재 상태 파악

```bash
# 구현 코드 읽기
cat src/utils/repeatUtils.ts
cat src/hooks/useRepeatEvent.ts

# 테스트 파일 읽기 (수정 금지)
cat src/__tests__/task.repeat-event.spec.ts

# 테스트 실행
pnpm test task.repeat-event.spec.ts
```

**예상 결과:**
```
✓ 모든 테스트 통과
Tests  10 passed (10)
```

### Step 3: 개선 사항 식별

**빠른 체크리스트:**

```typescript
// ❌ 발견 즉시 개선
[ ] any 타입 사용
[ ] 중복된 코드 패턴
[ ] 매직 넘버/문자열
[ ] 불명확한 변수명
[ ] Import 순서 위반
```

### Step 4: 리팩터링 (작은 단위로)

**예시: any 타입 제거**

```typescript
// Before
export const groupEvents = (events: any) => {
  // ...
};

// After
export const groupEvents = (events: Event[]): Record<string, Event[]> => {
  // ...
};
```

**즉시 테스트:**
```bash
pnpm test task.repeat-event.spec.ts
```

### Step 5: 보고서 작성

```bash
# 리팩터링 보고서 작성
cat > .claude/agent-docs/refactoring-expert/logs/YYYY-MM-DD_refactoring-log.md
```

**필수 섹션:**
- 요약 (무엇을 개선했는가)
- 개선 사항 상세 (변경 전/후)
- 테스트 결과 (여전히 통과)

---

## 📋 체크리스트

### 시작 전 확인

- [ ] Handoff 문서 읽음
- [ ] Phase 4 완료 확인
- [ ] 테스트 통과 확인
- [ ] 역할 정의 이해 (refactoring-expert.md)
- [ ] 프로젝트 규칙 숙지 (CLAUDE.md)

### 리팩터링 중

- [ ] 작은 단위로 변경
- [ ] 각 변경 후 테스트 실행
- [ ] DRY 원칙 적용
- [ ] any 타입 제거
- [ ] 가독성 개선
- [ ] 성능 최적화 (필요 시)
- [ ] 변경 근거 기록

### 완료 전 확인

- [ ] 모든 테스트 통과 ⚠️
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 없음
- [ ] 빌드 성공
- [ ] 리팩터링 보고서 작성
- [ ] 변경 전/후 코드 비교 포함
- [ ] 성능 영향 분석 완료

---

## 🎯 일반적인 리팩터링 패턴

### 패턴 1: any 타입 제거 (최우선)

**찾기:**
```bash
grep -r "any" src/utils/ src/hooks/
```

**수정:**
```typescript
// ❌ Before
const processData = (data: any) => {
  return data.map((item: any) => item.value);
};

// ✅ After
const processData = (data: DataItem[]): string[] => {
  return data.map((item) => item.value);
};
```

**검증:**
```bash
pnpm lint:tsc
```

### 패턴 2: 코드 중복 제거

**찾기:**
중복되는 코드 패턴을 수동으로 식별

**수정:**
```typescript
// ❌ Before: 중복
const validateTitle = (title: string) => {
  if (!title.trim()) {
    enqueueSnackbar('제목을 입력해주세요', { variant: 'error' });
    return false;
  }
  return true;
};

const validateDate = (date: string) => {
  if (!date.trim()) {
    enqueueSnackbar('날짜를 입력해주세요', { variant: 'error' });
    return false;
  }
  return true;
};

// ✅ After: 공통 함수
const validateRequired = (value: string, fieldName: string): boolean => {
  if (!value.trim()) {
    enqueueSnackbar(`${fieldName}을 입력해주세요`, { variant: 'error' });
    return false;
  }
  return true;
};
```

**검증:**
```bash
pnpm test task.repeat-event.spec.ts
```

### 패턴 3: 매직 넘버 상수화

**찾기:**
```typescript
// ❌ 매직 넘버 발견
const dates = [];
for (let i = 0; i < 7; i++) {
  // ...
}
```

**수정:**
```typescript
// ✅ 명명된 상수
const DAYS_IN_WEEK = 7;

const dates = [];
for (let i = 0; i < DAYS_IN_WEEK; i++) {
  // ...
}
```

### 패턴 4: React 성능 최적화

**필요 시만 적용** (성급한 최적화 지양)

```typescript
// ✅ 비용 큰 계산 메모이제이션
const EventList = ({ events }: EventListProps) => {
  const sortedEvents = useMemo(
    () => events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events]
  );

  return <div>{sortedEvents.map(event => ...)}</div>;
};
```

---

## 🔧 워크플로우

### 전체 프로세스

```
1. Handoff 읽기
   ↓
2. 코드 분석
   ↓
3. 개선 사항 우선순위
   ↓
4. 리팩터링 (작은 단위)
   ↓ (각 변경 후)
5. 테스트 실행 ⚠️
   ↓ (통과 시)
6. 다음 리팩터링
   ↓ (모두 완료 후)
7. 전체 검증
   ↓
8. 보고서 작성
```

### 리팩터링 순서 (안전 → 위험)

```
1. 타입 안전성 강화 ✅ (가장 안전)
   - any 제거
   - 반환 타입 명시
   ↓
2. 코드 중복 제거 ✅
   - 공통 로직 추출
   - 유틸 함수 생성
   ↓
3. 가독성 개선 ✅
   - 변수명 개선
   - 상수화
   ↓
4. 성능 최적화 ⚠️ (주의)
   - memo, useMemo
   - 측정 필수
   ↓
5. 디자인 패턴 적용 ⚠️ (가장 위험)
   - 아키텍처 변경
   - 각 단계마다 테스트
```

### 각 단계마다 실행

```bash
# 리팩터링 → 테스트 → 다음 리팩터링
pnpm test task.[feature].spec.ts
```

---

## 📊 예시: 완전한 리팩터링 세션

### 시나리오

반복 일정 기능의 코드 품질 개선

### Step 1: 현재 상태 (Phase 4 완료)

**테스트 상태:**
```bash
$ pnpm test task.repeat-event.spec.ts

✓ 반복 일정 생성 (3 tests) - 통과
✓ 반복 일정 유효성 검사 (3 tests) - 통과
✓ 반복 일정 수정 (2 tests) - 통과
✓ 반복 일정 삭제 (2 tests) - 통과

Tests  10 passed (10)
```

**문제 코드:**
```typescript
// src/utils/repeatUtils.ts
export const getRepeatLabel = (type: any) => {
  if (type === 'daily') return '매일';
  if (type === 'weekly') return '매주';
  if (type === 'monthly') return '매월';
  if (type === 'yearly') return '매년';
  return '없음';
};

export const calculateNextDate = (date: any, type: any) => {
  const d = new Date(date);
  if (type === 'daily') {
    d.setDate(d.getDate() + 1);
  } else if (type === 'weekly') {
    d.setDate(d.getDate() + 7);
  } else if (type === 'monthly') {
    d.setMonth(d.getMonth() + 1);
  } else if (type === 'yearly') {
    d.setFullYear(d.getFullYear() + 1);
  }
  return d.toISOString().split('T')[0];
};
```

### Step 2: 개선 1 - any 타입 제거

```typescript
// src/utils/repeatUtils.ts
import { RepeatType } from '../types';

export const getRepeatLabel = (type: RepeatType): string => {
  if (type === 'daily') return '매일';
  if (type === 'weekly') return '매주';
  if (type === 'monthly') return '매월';
  if (type === 'yearly') return '매년';
  return '없음';
};

export const calculateNextDate = (date: string, type: RepeatType): string => {
  const baseDate = new Date(date);
  if (type === 'daily') {
    baseDate.setDate(baseDate.getDate() + 1);
  } else if (type === 'weekly') {
    baseDate.setDate(baseDate.getDate() + 7);
  } else if (type === 'monthly') {
    baseDate.setMonth(baseDate.getMonth() + 1);
  } else if (type === 'yearly') {
    baseDate.setFullYear(baseDate.getFullYear() + 1);
  }
  return baseDate.toISOString().split('T')[0];
};
```

**검증:**
```bash
$ pnpm test task.repeat-event.spec.ts
✓ 모든 테스트 통과 (10/10)

$ pnpm lint:tsc
✓ TypeScript 에러 없음
```

### Step 3: 개선 2 - 중복 제거 및 가독성

```typescript
// src/utils/repeatUtils.ts
import { RepeatType } from '../types';

const REPEAT_TYPE_LABELS: Record<RepeatType, string> = {
  daily: '매일',
  weekly: '매주',
  monthly: '매월',
  yearly: '매년',
  none: '없음',
};

export const getRepeatLabel = (type: RepeatType): string => {
  return REPEAT_TYPE_LABELS[type];
};

const DAYS_IN_WEEK = 7;
const MONTHS_IN_YEAR = 12;

export const calculateNextDate = (date: string, type: RepeatType): string => {
  const baseDate = new Date(date);

  switch (type) {
    case 'daily':
      baseDate.setDate(baseDate.getDate() + 1);
      break;
    case 'weekly':
      baseDate.setDate(baseDate.getDate() + DAYS_IN_WEEK);
      break;
    case 'monthly':
      baseDate.setMonth(baseDate.getMonth() + 1);
      break;
    case 'yearly':
      baseDate.setFullYear(baseDate.getFullYear() + 1);
      break;
  }

  return baseDate.toISOString().split('T')[0];
};
```

**검증:**
```bash
$ pnpm test task.repeat-event.spec.ts
✓ 모든 테스트 통과 (10/10)

$ pnpm lint
✓ ESLint 경고 없음
```

### Step 4: 개선 3 - 함수 분리

```typescript
// src/utils/repeatUtils.ts
import { RepeatType } from '../types';

const REPEAT_TYPE_LABELS: Record<RepeatType, string> = {
  daily: '매일',
  weekly: '매주',
  monthly: '매월',
  yearly: '매년',
  none: '없음',
};

export const getRepeatLabel = (type: RepeatType): string => {
  return REPEAT_TYPE_LABELS[type];
};

const DAYS_IN_WEEK = 7;

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const calculateNextDate = (date: string, type: RepeatType): string => {
  const baseDate = new Date(date);

  switch (type) {
    case 'daily':
      return formatDate(addDays(baseDate, 1));
    case 'weekly':
      return formatDate(addDays(baseDate, DAYS_IN_WEEK));
    case 'monthly':
      return formatDate(addMonths(baseDate, 1));
    case 'yearly':
      return formatDate(addYears(baseDate, 1));
    default:
      return formatDate(baseDate);
  }
};
```

**검증:**
```bash
$ pnpm test task.repeat-event.spec.ts
✓ 모든 테스트 통과 (10/10)
```

### Step 5: 최종 검증

```bash
# 전체 테스트
$ pnpm test
✓ 150 passed (150)

# TypeScript 검사
$ pnpm lint:tsc
✓ 에러 없음

# ESLint 검사
$ pnpm lint:eslint
✓ 경고 없음

# 빌드
$ pnpm build
✓ 성공
```

### Step 6: 보고서 작성

```markdown
# 리팩터링 보고서: 반복 일정 기능

## 1. 요약

### 주요 개선 사항
1. any 타입 완전 제거 → RepeatType 명시
2. 중복 조건문 → Record 객체 매핑
3. 복잡한 로직 → 순수 함수로 분리

### 주요 지표

| 지표 | Before | After | 개선 |
|------|--------|-------|------|
| any 타입 | 4개 | 0개 | -100% ✅ |
| 코드 중복 | 3곳 | 0곳 | -100% ✅ |
| 함수 길이 | 25줄 | 10줄 | -60% ✅ |
| 테스트 통과 | 10/10 | 10/10 | 유지 ✅ |

## 2. 개선 사항 상세

### 2.1 타입 안전성 강화

**변경 전:**
```typescript
export const getRepeatLabel = (type: any) => {
  // ...
};
```

**변경 후:**
```typescript
export const getRepeatLabel = (type: RepeatType): string => {
  return REPEAT_TYPE_LABELS[type];
};
```

**이유:**
- any 타입 제거로 타입 안전성 확보
- IDE 자동완성 활성화
- 컴파일 타임 에러 감지

### 2.2 코드 중복 제거

**변경 전:**
```typescript
if (type === 'daily') return '매일';
if (type === 'weekly') return '매주';
// ...
```

**변경 후:**
```typescript
const REPEAT_TYPE_LABELS: Record<RepeatType, string> = {
  daily: '매일',
  weekly: '매주',
  // ...
};
```

**이유:**
- 중복 조건문 제거
- 유지보수 용이
- 확장성 향상

## 3. 테스트 결과

✅ 모든 테스트 통과 유지
✅ TypeScript 에러 없음
✅ ESLint 경고 없음
✅ 빌드 성공

## 4. 결론

코드 품질이 크게 향상되었으며, 테스트는 100% 통과를 유지합니다.
Phase 6 (VALIDATE)로 진행 가능합니다. ✅
```

---

## ❓ FAQ

### Q1: 테스트가 깨지면 어떻게 하나요?

**A:** 즉시 변경 사항을 되돌리고, 더 작은 단위로 리팩터링하세요.

```bash
# 변경 되돌리기
git checkout -- src/utils/repeatUtils.ts

# 더 작은 단위로 재시도
# 예: any 제거만 먼저
```

### Q2: 언제 React 최적화를 적용하나요?

**A:** 명확한 성능 이점이 있을 때만 적용하세요.

**적용 기준:**
- 렌더 비용이 크다 (많은 DOM 노드)
- 불필요한 리렌더가 측정됨
- React DevTools로 효과 확인됨

**적용하지 말 것:**
- "더 나아 보여서"
- 측정 없이
- 작은 컴포넌트

### Q3: 모든 코드를 리팩터링해야 하나요?

**A:** 아니요. 우선순위에 따라 선택적으로 개선하세요.

**필수:**
- any 타입 제거
- 명백한 중복
- 프로젝트 규칙 위반

**선택:**
- 디자인 패턴
- 과도한 추상화
- 작은 최적화

### Q4: 리팩터링 중 새로운 버그를 발견하면?

**A:** 버그 수정은 하지 말고, 문서에 기록하세요.

```markdown
## 발견된 이슈

### 이슈 1: 윤년 처리 누락
파일: src/utils/dateUtils.ts
설명: 2월 29일 반복 시 평년에 오류

**조치:** 별도 이슈로 기록, 리팩터링 완료 후 수정
```

**이유:**
- 리팩터링은 기능 변경 금지
- 버그 수정은 별도 작업
- 범위 명확히 유지

### Q5: 테스트 커버리지가 부족하면?

**A:** 리팩터링만 진행하고, 테스트 추가는 제안만 하세요.

```markdown
## 후속 작업 제안

### 테스트 커버리지 개선
현재: 85%
목표: 90%+

누락된 테스트:
- 윤년 엣지 케이스
- 타임존 처리
- 경계값 테스트
```

**이유:**
- 테스트 작성은 Test Writer의 역할
- 리팩터링 범위를 벗어남
- 제안만 문서화

---

## 🔗 관련 문서

### 필수 읽기

- [contract.md](./contract.md) - 입/출력 계약
- [prompt.md](./prompt.md) - 실행 매뉴얼
- [refactoring-expert.md](../../agents/refactoring-expert.md) - 역할 정의

### 참조

- [CLAUDE.md](../../../CLAUDE.md) - 프로젝트 규칙
- [orchestrator/contract.md](../orchestrator/contract.md) - Orchestrator 계약
- [code-writer/contract.md](../code-writer/contract.md) - Phase 4 계약

---

## 📞 도움이 필요하면

### 문제 보고

이슈 발생 시 `references/issues-log.md`에 기록:

```markdown
# 이슈 로그

## 2025-10-30: 테스트 실패

**문제:**
리팩터링 후 "반복 일정 생성" 테스트 실패

**원인:**
순수 함수로 추출하면서 상태 접근 불가

**해결:**
파라미터로 전달하도록 수정

**결과:**
테스트 통과
```

### Orchestrator 문의

리팩터링 보고서에 질문 섹션 추가:

```markdown
## 질문 사항

### 질문 1: 아키텍처 충돌
현재 원칙과 충돌하는 리팩터링 발견
승인 필요

### 결정 필요
Orchestrator 답변 대기
```

---

**시작하기:**
1. Handoff 문서 읽기
2. 코드 분석
3. 작은 단위로 리팩터링
4. 각 변경 후 테스트
5. 보고서 작성

**성공 기준:**
- ✅ 테스트 100% 통과 유지
- ✅ 코드 품질 개선
- ✅ 문서화 완료

**다음 단계:**
Phase 6 (VALIDATE)로 전환
