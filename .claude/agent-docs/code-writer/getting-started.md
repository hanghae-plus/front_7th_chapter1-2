# Code Writer: 시작 가이드 (Getting Started)

> **대상**: Code Writer 에이전트를 처음 사용하는 사용자
> **목적**: TDD GREEN 단계에서 최소 구현으로 테스트를 통과시키는 방법 안내
> **소요 시간**: 약 30-60분 (기능 복잡도에 따라)

---

## 목차

1. [Code Writer란?](#code-writer란)
2. [언제 사용하나?](#언제-사용하나)
3. [빠른 시작](#빠른-시작)
4. [단계별 가이드](#단계별-가이드)
5. [실전 예제](#실전-예제)
6. [자주 묻는 질문](#자주-묻는-질문)
7. [문제 해결](#문제-해결)

---

## Code Writer란?

Code Writer는 **TDD의 GREEN 단계**를 담당하는 에이전트입니다.

### TDD 3단계

```
RED (Phase 3)
  ↓
  실패하는 테스트 작성
  └─→ Test Writer 에이전트

GREEN (Phase 4) ← 여기가 Code Writer!
  ↓
  최소 구현으로 테스트 통과
  └─→ Code Writer 에이전트

REFACTOR (Phase 5)
  ↓
  코드 품질 개선
  └─→ Refactoring Expert 에이전트
```

### 핵심 철학

**"Make it work, then make it right"**
- 먼저 작동하게 만들고 (GREEN)
- 그 다음 올바르게 개선 (REFACTOR)

### Code Writer의 목표

1. ✅ 모든 실패하는 테스트 통과시키기
2. ✅ TypeScript 타입 안전성 유지
3. ✅ 프로젝트 규칙 준수
4. ❌ 완벽한 코드 작성 (리팩터링 단계에서)
5. ❌ 성능 최적화 (리팩터링 단계에서)

---

## 언제 사용하나?

### 사용 시점

Code Writer는 다음 상황에서 사용됩니다:

1. **Phase 3 (RED) 완료 후**
   - Test Writer가 실패하는 테스트를 작성함
   - 테스트 실행 결과: FAIL

2. **Orchestrator의 Handoff 문서 생성 후**
   - `.claude/agent-docs/orchestrator/handoff/phase4.md` 존재
   - 실패하는 테스트 파일 경로 명시
   - 구현 대상 파일 목록 명시

3. **기술 명세서 준비 완료 후**
   - Feature Designer의 spec.md 존재
   - Test Designer의 test-strategy.md 존재

### 전제 조건 체크리스트

시작하기 전에 다음을 확인하세요:

- [ ] Phase 3 (RED) 완료됨
- [ ] 실패하는 테스트 파일 존재 (`src/__tests__/task.*.spec.ts`)
- [ ] Handoff 문서 존재 (`.claude/agent-docs/orchestrator/handoff/phase4.md`)
- [ ] 기술 명세서 존재 (`.claude/agent-docs/feature-designer/logs/spec.md`)
- [ ] 테스트 전략 문서 존재 (`.claude/agent-docs/test-designer/logs/test-strategy.md`)

---

## 빠른 시작

### 5분 체크리스트

```bash
# 1. Handoff 문서 읽기
cat .claude/agent-docs/orchestrator/handoff/phase4.md

# 2. 실패하는 테스트 확인
pnpm test task.[feature].spec.ts
# 예상: FAIL (모든 테스트 실패)

# 3. 테스트 파일 읽기
cat src/__tests__/task.[feature].spec.ts

# 4. 명세서 읽기
cat .claude/agent-docs/feature-designer/logs/spec.md

# 5. 프로젝트 규칙 확인
cat CLAUDE.md
```

### 첫 구현 흐름

```
1. 타입 정의
   ↓
2. 유틸 함수 작성 (순수 함수)
   ↓
3. 커스텀 훅 구현 (상태 관리)
   ↓
4. 컴포넌트 작성 (UI)
   ↓
5. 테스트 실행
   ↓
6. 로그 작성
```

---

## 단계별 가이드

### Step 1: 환경 설정 확인

```bash
# 프로젝트 루트에서
pwd
# /Users/[user]/[path]/front_7th_chapter1-2

# 의존성 설치 확인
ls node_modules/ | wc -l
# 패키지가 있어야 함

# 테스트 도구 확인
pnpm test --version
# Vitest가 설치되어 있어야 함
```

### Step 2: Handoff 문서 읽기

```bash
# Handoff 문서 위치
cat .claude/agent-docs/orchestrator/handoff/phase4.md
```

**확인할 내용:**

```yaml
---
phase: 4
agent: code-writer

inputs:
  failing_tests:
    - src/__tests__/task.[feature].spec.ts  # ← 실패하는 테스트

  test_execution_result: |
    FAIL src/__tests__/task.[feature].spec.ts
    ✗ 테스트 1
    ✗ 테스트 2

  context_files:
    - CLAUDE.md                             # ← 프로젝트 규칙
    - .claude/agent-docs/feature-designer/logs/spec.md  # ← 명세서
---
```

### Step 3: 실패하는 테스트 분석

```bash
# 테스트 파일 읽기
cat src/__tests__/task.[feature].spec.ts
```

**파악할 내용:**

```typescript
describe('기능명', () => {
  it('테스트 설명', () => {
    // Given - 무엇을 준비하는가?
    const input = ...;

    // When - 무엇을 실행하는가?
    const result = functionUnderTest(input);

    // Then - 무엇을 기대하는가?
    expect(result).toBe(expected);
  });
});
```

**체크리스트:**
- [ ] 테스트가 기대하는 함수/훅/컴포넌트 이름
- [ ] 입력값 타입
- [ ] 예상 출력값 타입
- [ ] 엣지 케이스

### Step 4: 타입 정의

**파일**: `src/types.ts`

```typescript
// 1. 필요한 타입 추가
export type NewType = 'value1' | 'value2' | 'value3';

// 2. 기존 타입 확장
export interface EventForm {
  // 기존 필드들...
  newField?: NewType;  // 새 필드 추가
}

// 3. Event는 EventForm 확장
export interface Event extends EventForm {
  id: string;
}
```

**체크:**
```bash
# TypeScript 에러 확인
pnpm lint:tsc
# ✓ No errors
```

### Step 5: 유틸리티 함수 구현

**파일**: `src/utils/[feature]Utils.ts`

**템플릿:**
```typescript
// Import 순서: 외부 → 내부, 그룹 간 공백
import { NewType } from '../types';

// ✅ 순수 함수 (외부 상태 의존 없음)
export const utilFunction = (input: InputType): OutputType => {
  // 최소 구현 (if 문으로 직접)
  if (input === 'condition1') return 'result1';
  if (input === 'condition2') return 'result2';
  return 'default';
};

// ✅ 타입 가드
export const isValidType = (value: string): value is NewType => {
  return ['value1', 'value2', 'value3'].includes(value);
};
```

**체크:**
```bash
# 관련 테스트 실행
pnpm test -- -t "유틸 함수 테스트 설명"
```

### Step 6: 커스텀 훅 구현

**파일**: `src/hooks/use[Feature].ts`

**템플릿:**
```typescript
// Import 순서
import { useState } from 'react';

import { NewType } from '../types';

// ✅ 커스텀 훅
export const useFeature = () => {
  // 최소 상태
  const [state, setState] = useState<NewType>('value1');

  // 단순 핸들러
  const handleChange = (value: NewType) => {
    setState(value);
  };

  // 명확한 반환 타입
  return {
    state,
    handleChange,
  };
};
```

**체크:**
```bash
# 훅 테스트 실행
pnpm test -- -t "use[Feature] 테스트"
```

### Step 7: 컴포넌트 구현 (필요 시)

**파일**: `src/App.tsx` (또는 별도 컴포넌트)

**템플릿:**
```typescript
// Import 순서
import { Select, MenuItem } from '@mui/material';

import { useFeature } from './hooks/useFeature';

const FeatureComponent = () => {
  const { state, handleChange } = useFeature();

  return (
    <Select
      value={state}
      onChange={(e) => handleChange(e.target.value)}
      data-testid="feature-select"
      aria-label="기능 선택"
    >
      <MenuItem value="value1">옵션 1</MenuItem>
      <MenuItem value="value2">옵션 2</MenuItem>
    </Select>
  );
};
```

### Step 8: 테스트 검증

```bash
# 1. 실패했던 테스트 실행
pnpm test task.[feature].spec.ts

# 예상 출력:
# PASS src/__tests__/task.[feature].spec.ts
#   ✓ 테스트 1 (X ms)
#   ✓ 테스트 2 (X ms)
# Test Files  1 passed (1)
#      Tests  X passed (X)

# 2. TypeScript 검증
pnpm lint:tsc
# ✓ No errors

# 3. 전체 테스트 (권장)
pnpm test
# 기존 테스트가 깨지지 않았는지 확인
```

### Step 9: 구현 로그 작성

**파일**: `.claude/agent-docs/code-writer/logs/YYYY-MM-DD_implementation-log.md`

**템플릿**: [contract.md 참조](./contract.md#implementationmd-필수-구조)

**필수 포함:**
- 구현한 파일 목록
- 테스트 통과 증명
- GREEN 단계 결정 사항
- 기술적 부채 목록

---

## 실전 예제

### 예제: 반복 유형 선택 기능

#### 시나리오

**요구사항**: 일정에 반복 유형(매일, 매주, 매월, 매년)을 선택하는 기능 추가

**Phase 3 결과** (실패하는 테스트):
```typescript
// src/__tests__/task.repeat-type.spec.ts

describe('useEventForm - 반복 유형', () => {
  it('초기 반복 유형은 none이어야 한다', () => {
    const { result } = renderHook(() => useEventForm());
    expect(result.current.repeatType).toBe('none');
  });

  it('반복 유형을 daily로 변경할 수 있다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setRepeatType('daily');
    });

    expect(result.current.repeatType).toBe('daily');
  });
});
```

**테스트 실행 결과**:
```bash
pnpm test task.repeat-type.spec.ts

# FAIL src/__tests__/task.repeat-type.spec.ts
#   ✗ 초기 반복 유형은 none이어야 한다
#     TypeError: Cannot read property 'repeatType' of undefined
#   ✗ 반복 유형을 daily로 변경할 수 있다
#     TypeError: result.current.setRepeatType is not a function
```

#### 구현 단계

**Step 1: 타입 정의**

```typescript
// src/types.ts

// ✅ 새 타입 추가
export type RepeatType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';

// ✅ EventForm에 필드 추가
export interface EventForm {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeatType?: RepeatType;  // 새 필드
  // 기타 필드들...
}
```

**Step 2: 훅 구현**

```typescript
// src/hooks/useEventForm.ts

import { useState } from 'react';

import { EventForm, RepeatType } from '../types';

export const useEventForm = (initialEvent?: Event) => {
  // 기존 상태들...
  const [title, setTitle] = useState(initialEvent?.title ?? '');
  const [date, setDate] = useState(initialEvent?.date ?? '');

  // ✅ 새 상태 추가 (최소 구현)
  const [repeatType, setRepeatType] = useState<RepeatType>('none');

  // 기존 핸들러들...

  return {
    // 기존 반환값들...
    title,
    setTitle,
    date,
    setDate,

    // ✅ 새 반환값 추가
    repeatType,
    setRepeatType,
  };
};
```

**Step 3: 테스트 검증**

```bash
pnpm test task.repeat-type.spec.ts

# PASS src/__tests__/task.repeat-type.spec.ts
#   ✓ 초기 반복 유형은 none이어야 한다 (3 ms)
#   ✓ 반복 유형을 daily로 변경할 수 있다 (2 ms)
#
# Test Files  1 passed (1)
#      Tests  2 passed (2)
```

**Step 4: TypeScript 검증**

```bash
pnpm lint:tsc
# ✓ No errors
```

#### 구현 로그 (요약)

```markdown
# GREEN 단계 구현 로그

## 1. 구현 요약
- **기능**: 반복 유형 선택
- **파일**: src/types.ts, src/hooks/useEventForm.ts
- **결과**: 모든 테스트 통과 ✅

## 2. GREEN 단계 결정
- 최소 구현: useState만 추가 (useCallback 사용 안 함)
- 기본값: 'none' (하드코딩)
- 유효성 검사: 없음 (테스트가 요구하지 않음)

## 3. 기술적 부채
- [ ] setRepeatType을 useCallback으로 메모이제이션
- [ ] 유효성 검사 함수 추가
- [ ] 기본값 상수화

→ Refactoring 단계에서 개선 예정
```

---

## 자주 묻는 질문

### Q1: 테스트를 수정해도 되나요?

**A**: ❌ 절대 안 됩니다.

TDD의 핵심 원칙은 "테스트가 구현을 이끈다"입니다. 테스트를 수정하면 이 원칙이 무너집니다.

**예외**: 테스트에 명백한 오류가 있으면 Orchestrator에게 보고하세요.

### Q2: 얼마나 최소로 구현해야 하나요?

**A**: "테스트가 통과할 정도로만"입니다.

**예시:**
```typescript
// ✅ 충분한 구현
const getLabel = (type: string) => {
  if (type === 'daily') return '매일';
  if (type === 'weekly') return '매주';
  return '없음';
};

// ❌ 과도한 구현
const LABELS: Record<string, string> = {
  daily: '매일',
  weekly: '매주',
  monthly: '매월',
  yearly: '매년',
  none: '없음',
};
const getLabel = (type: string) => LABELS[type] ?? '없음';
```

### Q3: 중복 코드가 있으면 어떻게 하나요?

**A**: ✅ GREEN 단계에서는 허용됩니다.

중복 제거는 Refactoring 단계에서 합니다. 지금은 테스트 통과가 목표입니다.

**기록 방법:**
```markdown
## 기술적 부채
- [ ] 중복 코드 제거 (파일1, 파일2)
```

### Q4: 성능 최적화가 필요한 것 같은데요?

**A**: ⏰ Refactoring 단계에서 합니다.

**GREEN 단계 금지:**
- ❌ memo, useMemo, useCallback
- ❌ 복잡한 알고리즘 최적화
- ❌ 캐싱 메커니즘

**Refactoring 단계 허용:**
- ✅ 필요 시 모든 최적화

### Q5: TypeScript 에러를 any로 해결해도 되나요?

**A**: ❌ 절대 안 됩니다.

타입 안전성은 GREEN 단계에서도 필수입니다.

**대신 사용:**
```typescript
// ❌ any 사용
const data: any = fetchData();

// ✅ 타입 단언
const data = fetchData() as Event;

// ✅ 타입 가드
if (isEvent(data)) {
  // data는 Event 타입
}

// ✅ Optional 체이닝
const title = data?.title ?? '제목 없음';
```

### Q6: 기존 코드와 충돌하면 어떻게 하나요?

**A**: 최소 영향으로 통합하세요.

**전략:**
1. 기존 코드는 가능한 한 건드리지 않기
2. 새 필드는 optional로 추가
3. 기본값 제공으로 하위 호환성 유지
4. 기존 테스트가 깨지지 않는지 확인

**예시:**
```typescript
// ✅ 하위 호환성 유지
export interface EventForm {
  // 기존 필드들 (변경 없음)
  title: string;
  date: string;

  // 새 필드 (optional)
  repeatType?: RepeatType;
}

// ✅ 기본값 제공
const [repeatType, setRepeatType] = useState<RepeatType>(
  initialEvent?.repeatType ?? 'none'
);
```

### Q7: 에러 처리를 얼마나 해야 하나요?

**A**: 테스트가 요구하는 만큼만 하세요.

**GREEN 단계:**
```typescript
// ✅ 간단한 검증
if (!title.trim()) {
  enqueueSnackbar('제목을 입력해주세요', { variant: 'error' });
  return;
}
```

**Refactoring 단계:**
```typescript
// ✅ 상세한 검증
const validateEventForm = (form: EventForm): ValidationResult => {
  const errors: string[] = [];

  if (!form.title.trim()) {
    errors.push('제목을 입력해주세요');
  }

  if (!form.date) {
    errors.push('날짜를 선택해주세요');
  }

  // 더 많은 검증...

  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

---

## 문제 해결

### 문제 1: 테스트가 계속 실패

**증상:**
```bash
pnpm test task.[feature].spec.ts
# FAIL (여전히 실패)
```

**해결 순서:**

1. **테스트 기대값 재확인**
   ```typescript
   // 테스트가 무엇을 기대하는가?
   expect(result).toBe(expected);  // ← expected가 무엇인가?
   ```

2. **함수 시그니처 확인**
   ```typescript
   // 테스트가 호출하는 함수
   result.current.functionName(arg);

   // 구현한 함수가 정확히 일치하는가?
   export const functionName = (arg: ArgType) => { };
   ```

3. **Import 경로 확인**
   ```typescript
   // 테스트 파일
   import { functionName } from '../utils/feature';

   // 실제 파일이 있는가?
   // src/utils/feature.ts ← 여기!
   ```

4. **타입 확인**
   ```typescript
   // 입력/출력 타입이 일치하는가?
   export const functionName = (input: InputType): OutputType => {
     // ...
   };
   ```

5. **비동기 처리 확인**
   ```typescript
   // async/await가 필요한가?
   export const asyncFunction = async (): Promise<Result> => {
     await someAsyncOperation();
     return result;
   };
   ```

### 문제 2: TypeScript 컴파일 에러

**증상:**
```bash
pnpm lint:tsc
# error TS2339: Property 'newField' does not exist on type 'EventForm'
```

**해결 순서:**

1. **타입 정의 확인**
   ```typescript
   // src/types.ts에 타입이 정의되었는가?
   export interface EventForm {
     newField: FieldType;  // ← 있는가?
   }
   ```

2. **Import 확인**
   ```typescript
   // 타입을 import 했는가?
   import { EventForm } from '../types';
   ```

3. **Optional vs Required 확인**
   ```typescript
   // Optional이 필요한가?
   newField?: FieldType;  // optional
   newField: FieldType;   // required
   ```

4. **타입 단언 사용 (최후의 수단)**
   ```typescript
   const event = data as Event;
   ```

### 문제 3: 기존 테스트가 깨짐

**증상:**
```bash
pnpm test
# FAIL src/__tests__/easy.eventForm.spec.ts
# (기존 테스트 실패)
```

**해결 순서:**

1. **변경 사항 확인**
   ```bash
   git diff src/hooks/useEventForm.ts
   ```

2. **하위 호환성 검토**
   ```typescript
   // 기존 인터페이스가 깨졌는가?

   // ❌ Breaking Change
   export const useEventForm = (required: NewParam) => { };

   // ✅ 하위 호환
   export const useEventForm = (optional?: NewParam) => { };
   ```

3. **기본값 제공**
   ```typescript
   const [newField, setNewField] = useState(
     initialValue ?? 'default'  // 기본값
   );
   ```

4. **Optional 체이닝**
   ```typescript
   const value = event?.newField ?? 'default';
   ```

### 문제 4: Import 에러

**증상:**
```bash
# Module not found
```

**해결 순서:**

1. **경로 확인**
   ```typescript
   // 상대 경로가 정확한가?
   import { Event } from '../types';  // ← 올바른 경로?
   ```

2. **파일 존재 확인**
   ```bash
   ls src/types.ts
   ls src/utils/feature.ts
   ```

3. **Export 확인**
   ```typescript
   // 파일에서 export 했는가?
   export interface Event { }  // ← export 키워드
   ```

4. **순환 참조 확인**
   ```typescript
   // A → B → A 형태의 import가 있는가?
   ```

---

## 체크리스트

### 시작 전

- [ ] Phase 3 (RED) 완료 확인
- [ ] Handoff 문서 존재 확인
- [ ] 테스트 파일 존재 확인
- [ ] 명세서 존재 확인
- [ ] 프로젝트 규칙 숙지

### 구현 중

- [ ] 타입 정의 (src/types.ts)
- [ ] 유틸 함수 작성 (순수 함수)
- [ ] 커스텀 훅 구현
- [ ] 컴포넌트 작성 (필요 시)
- [ ] Import 순서 준수
- [ ] 명명 규칙 준수
- [ ] any 타입 미사용

### 구현 후

- [ ] 테스트 실행 (pnpm test)
- [ ] 모든 테스트 통과
- [ ] TypeScript 컴파일 (pnpm lint:tsc)
- [ ] 에러 0개
- [ ] 기존 테스트 유지
- [ ] 구현 로그 작성
- [ ] 기술적 부채 기록

---

## 다음 단계

### Phase 5: REFACTOR

Code Writer의 작업이 완료되면 Refactoring Expert가 코드 품질을 개선합니다.

**개선 항목:**
- 중복 코드 제거 (DRY)
- 성능 최적화 (memo, useMemo)
- 에러 처리 상세화
- 상수 추출
- 주석 추가

**참고:**
- [Refactoring Expert 계약](../refactoring-expert/contract.md)

---

## 추가 자료

### 필수 문서

- [Code Writer 계약](./contract.md) - 입출력 명세
- [Code Writer 실행 매뉴얼](./prompt.md) - 상세 가이드
- [CLAUDE.md](../../../CLAUDE.md) - 프로젝트 규칙

### 참고 패턴

**커스텀 훅:**
- `src/hooks/useEventForm.ts`
- `src/hooks/useEventOperations.ts`
- `src/hooks/useCalendarView.ts`

**유틸리티 함수:**
- `src/utils/dateUtils.ts`
- `src/utils/eventUtils.ts`
- `src/utils/eventOverlap.ts`

**컴포넌트:**
- `src/App.tsx`

### 관련 에이전트

- [Orchestrator](../orchestrator/getting-started.md) - 전체 조율
- [Feature Designer](../feature-designer/getting-started.md) - Phase 1
- [Test Designer](../test-designer/getting-started.md) - Phase 2
- [Test Writer](../test-writer/getting-started.md) - Phase 3 (이전)
- [Refactoring Expert](../refactoring-expert/getting-started.md) - Phase 5 (다음)

---

## 도움 받기

### 문제가 해결되지 않을 때

1. **Orchestrator에게 보고**
   - YYYY-MM-DD_implementation-log.md에 문제 상황 기록
   - 시도한 해결책 명시
   - 추가 지원 요청

2. **문서 재확인**
   - [Code Writer 계약](./contract.md)
   - [실행 매뉴얼](./prompt.md)
   - [프로젝트 규칙](../../../CLAUDE.md)

3. **테스트 재검토**
   - 테스트가 정말 올바른가?
   - 명세와 일치하는가?
   - 엣지 케이스를 놓쳤는가?

---

**작성일**: 2025-10-30
**Phase**: 4 (GREEN)
**다음**: Phase 5 (REFACTOR)
