# Code Writer: 계약 명세서 (Contract)

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

Code Writer는 **Phase 4 (GREEN)**에서 동작하며, 실패하는 테스트를 통과시키는 최소한의 구현 코드를 작성하는 역할을 수행한다.

**핵심 책임:**

- 실패하는 테스트를 모두 통과시키기
- 최소한의 구현으로 시작 (GREEN 단계 철학)
- TypeScript 타입 안전성 유지
- CLAUDE.md 프로젝트 규칙 엄격 준수
- Hooks와 Utils 분리 원칙 준수
- Material-UI 컴포넌트 사용

**선행 조건:**

- Phase 3 (RED - Test Writing)이 완료되어야 함
- 실패하는 테스트 파일이 존재해야 함
- Test Designer의 테스트 전략 문서가 있어야 함

**후속 단계:**

- Phase 5 (REFACTOR)로 전달
- Refactoring Expert가 코드 품질을 개선

---

## 입력 계약

### Handoff 문서 경로

```
.claude/agent-docs/orchestrator/handoff/phase4.md
```

### 필수 입력 항목

```yaml
---
phase: 4
agent: code-writer
timestamp: [ISO 8601 형식]
status: ready

inputs:
  failing_tests: |
    [실패하는 테스트 파일 경로 목록]
    - src/__tests__/task.[feature].spec.ts
    - [추가 테스트 파일들]

  test_execution_result: |
    [테스트 실행 결과]
    ✗ 실패한 테스트 목록
    예상 에러 메시지들

  context_files:
    - CLAUDE.md # 프로젝트 규칙
    - .claude/agent-docs/feature-designer/logs/spec.md # 기술 명세서
    - .claude/agent-docs/test-designer/logs/test-strategy.md # 테스트 전략
    - src/types.ts # 타입 정의
    - [구현 대상 파일들]

references:
  agent_definition: ../../agents/code-writer.md
  project_rules: CLAUDE.md
  architecture_guide: .claude/docs/folder-tree.md

output_requirements:
  implementation_files:
    - [생성/수정할 파일 목록]

  log_file: .claude/agent-docs/code-writer/logs/YYYY-MM-DD_implementation-log.md

  validation_proof: |
    - 테스트 통과 증명 (pnpm test 결과)
    - TypeScript 컴파일 성공 (pnpm lint:tsc)

constraints:
  - 최소 구현 (GREEN 단계 철학)
  - 테스트 파일은 절대 수정하지 않음
  - 프로덕션 코드만 작성
  - 반복 일정 기능 구현 금지 (8주차 과제)
  - 전역 상태 라이브러리 사용 금지
  - 순수 함수 원칙 준수 (Utils)

validation_criteria:
  - 모든 테스트가 통과하는가
  - TypeScript 컴파일이 성공하는가
  - CLAUDE.md 규칙을 준수하는가
  - 최소 구현으로 작성되었는가 (과도한 추상화 없음)
---
```

### 입력 데이터 구조

#### 1. failing_tests (필수)

```typescript
{
  test_files: string[];           // 실패하는 테스트 파일 경로
  failure_messages: string[];     // 실패 메시지 목록
  expected_behaviors: string[];   // 기대하는 동작 (테스트 설명)
}
```

#### 2. test_execution_result (필수)

테스트 실행 명령어와 결과:

```bash
pnpm test task.[feature].spec.ts

# 예상 출력:
FAIL  src/__tests__/task.repeat-event.spec.ts
  ✗ 초기 반복 유형은 none이어야 한다 (5 ms)
    TypeError: Cannot read property 'repeatType' of undefined
  ✗ 반복 유형을 daily로 변경할 수 있어야 한다 (3 ms)
    TypeError: result.current.setRepeatType is not a function

Test Files  1 failed (1)
     Tests  2 failed (2)
```

#### 3. context_files (필수)

최소 포함 파일:

- `CLAUDE.md` - 프로젝트 규칙
- `.claude/agent-docs/feature-designer/logs/spec.md` - 기술 명세서
- `.claude/agent-docs/test-designer/logs/test-strategy.md` - 테스트 전략
- `src/types.ts` - 타입 정의

선택 파일:

- 수정이 필요한 기존 파일
- 참고할 패턴 파일 (예: src/hooks/useEventForm.ts)

#### 4. references (필수)

- `agent_definition`: code-writer.md 경로
- `project_rules`: CLAUDE.md 경로
- `architecture_guide`: folder-tree.md 경로

---

## 출력 계약

### 출력 파일 구조

```
src/
├── types.ts                     # 타입 정의 (수정/추가)
├── hooks/
│   ├── useNewFeature.ts         # 새 커스텀 훅 (생성)
│   └── useEventOperations.ts   # 기존 훅 (수정)
├── utils/
│   └── newFeatureUtils.ts       # 새 유틸리티 함수 (생성)
└── components/
    └── NewComponent.tsx         # 새 컴포넌트 (생성)

.claude/agent-docs/code-writer/
└── logs/
    └── YYYY-MM-DD_implementation-log.md  # 구현 로그 (필수)
```

### YYYY-MM-DD_implementation-log.md 필수 구조

````markdown
# GREEN 단계 구현 로그

**작성일**: [날짜]
**기능**: [기능명]
**담당**: code-writer

---

## 1. 실행 요약

### 1.1 입력

- **실패하는 테스트**: src/**tests**/task.[feature].spec.ts
- **실패 개수**: X개

### 1.2 구현한 파일

- **신규**: [파일 목록]
- **수정**: [파일 목록]

### 1.3 결과

- ✅ 모든 테스트 통과
- ✅ TypeScript 컴파일 성공
- ✅ 프로젝트 규칙 준수

---

## 2. 구현 내역

### 2.1 타입 정의 (src/types.ts)

**변경 사항:**

```typescript
// 추가한 타입
export interface NewType {
  // ...
}

// 수정한 타입
export interface Event {
  // 기존 필드
  newField: string; // 추가
}
```
````

**이유:**
[왜 이렇게 타입을 정의했는지]

### 2.2 유틸리티 함수 (src/utils/newFeatureUtils.ts)

**구현 코드:**

```typescript
// 최소 구현
export const newUtilFunction = (input: InputType): OutputType => {
  // 단순한 로직
  return output;
};
```

**특징:**

- 순수 함수 (외부 상태 의존 없음)
- 최소 구현 (테스트 통과에 필요한 만큼만)
- 리팩터링 여지 있음

### 2.3 커스텀 훅 (src/hooks/useNewFeature.ts)

**구현 코드:**

```typescript
export const useNewFeature = () => {
  const [state, setState] = useState(initialValue);

  const handleAction = () => {
    // 최소 로직
  };

  return { state, handleAction };
};
```

**특징:**

- 상태 관리 및 부수 효과 처리
- 기존 훅 패턴 준수
- 타입 완전성 확보

### 2.4 컴포넌트 (src/components/NewComponent.tsx)

**구현 코드:**

```typescript
export const NewComponent = (props: Props) => {
  return (
    <Box
      sx={
        {
          /* 스타일 */
        }
      }
    >
      {/* 최소 UI */}
    </Box>
  );
};
```

**특징:**

- Material-UI 컴포넌트 사용
- sx prop으로 스타일링
- 접근성 속성 포함

---

## 3. 테스트 검증

### 3.1 테스트 실행 결과

**명령어:**

```bash
pnpm test task.[feature].spec.ts
```

**출력:**

```
PASS  src/__tests__/task.[feature].spec.ts
  ✓ 테스트 1 (X ms)
  ✓ 테스트 2 (X ms)
  ✓ 테스트 3 (X ms)

Test Files  1 passed (1)
     Tests  3 passed (3)
```

### 3.2 TypeScript 검증

**명령어:**

```bash
pnpm lint:tsc
```

**출력:**

```
✓ No TypeScript errors found
```

---

## 4. GREEN 단계 결정 사항

### 4.1 최소 구현 사례

#### 사례 1: [결정 내용]

**선택한 방식:**
[단순한 구현]

**피한 방식:**
[과도한 추상화/최적화]

**이유:**
GREEN 단계에서는 테스트 통과가 목표. 리팩터링 단계에서 개선 예정.

### 4.2 기술적 부채 (Refactoring 단계에서 개선)

- [ ] 중복 코드 제거
- [ ] 성능 최적화 (memo, useMemo, useCallback)
- [ ] 에러 처리 상세화
- [ ] 유틸리티 함수 추출
- [ ] 상수 추출 및 공통화

---

## 5. 준수 사항 체크리스트

### 5.1 프로젝트 규칙

- ✅ Import 순서 (외부 라이브러리 → 내부 모듈)
- ✅ 파일명 규칙 (camelCase for utils/hooks)
- ✅ 명명 규칙 (동사+명사, handle 접두사 등)
- ✅ 문자열 작은따옴표 사용
- ✅ 세미콜론 필수

### 5.2 아키텍처 원칙

- ✅ Hooks: 상태 관리 및 부수 효과
- ✅ Utils: 순수 함수만
- ✅ 타입 완전성 (any 사용 없음)
- ✅ 기존 패턴 준수

### 5.3 GREEN 단계 원칙

- ✅ 최소 구현 (과도한 추상화 없음)
- ✅ 테스트 파일 수정 없음
- ✅ 프로덕션 코드만 작성
- ✅ 모든 테스트 통과

---

## 6. 다음 단계 (Phase 5)

**전달 사항:**

- 구현된 파일 목록
- 기술적 부채 목록
- 리팩터링 권장 사항

**Refactoring Expert가 할 일:**

- 코드 품질 개선 (DRY, 추상화)
- 성능 최적화 (필요 시)
- 에러 처리 상세화
- 주석 및 문서화

````

---

## 검증 기준

### Phase 4 완료 조건

#### 필수 체크리스트

- ✅ **테스트 통과**
  - 모든 실패하는 테스트가 통과함
  - 테스트 실행 결과 증명 (pnpm test)
  - 새로운 테스트 실패 없음

- ✅ **TypeScript 컴파일 성공**
  - 타입 에러 없음
  - pnpm lint:tsc 통과

- ✅ **프로젝트 규칙 준수**
  - CLAUDE.md 컨벤션 준수
  - Import 순서 규칙
  - 명명 규칙
  - 파일 구조 원칙

- ✅ **최소 구현 철학**
  - 과도한 추상화 없음
  - 중복 코드 허용
  - 성능 최적화 보류
  - 간단한 에러 처리

- ✅ **타입 안전성**
  - any 타입 미사용
  - 모든 함수 시그니처 명확
  - EventForm vs Event 구분

- ✅ **테스트 파일 미수정**
  - 테스트 파일은 절대 수정하지 않음
  - 테스트가 틀렸다고 판단되면 보고만

### 검증 명령어

```bash
# 1. 테스트 실행 (필수)
pnpm test task.[feature].spec.ts

# 예상 출력:
# ✓ 모든 테스트 통과

# 2. TypeScript 검증 (필수)
pnpm lint:tsc

# 예상 출력:
# ✓ No errors found

# 3. 전체 테스트 (권장)
pnpm test

# 기존 테스트가 깨지지 않았는지 확인
````

### 품질 기준

**최소 구현 (GREEN 단계)**

- ✅ "테스트가 특정 값을 기대하면 직접 반환"
- ✅ "중복 코드 허용 (나중에 DRY)"
- ✅ "하드코딩 허용 (테스트 통과 우선)"
- ❌ "Record 타입으로 추상화" (Refactoring 단계에서)
- ❌ "memo/useMemo/useCallback 사용" (Refactoring 단계에서)

**예시 - 최소 구현:**

```typescript
// ✅ GREEN 단계: 직접 구현
const getRepeatTypeLabel = (type: RepeatType) => {
  if (type === 'daily') return '매일';
  if (type === 'weekly') return '매주';
  if (type === 'monthly') return '매월';
  if (type === 'yearly') return '매년';
  return '없음';
};

// ❌ GREEN 단계에선 과도함 (Refactoring에서):
const REPEAT_TYPE_LABELS: Record<RepeatType, string> = {
  daily: '매일',
  weekly: '매주',
  monthly: '매월',
  yearly: '매년',
  none: '없음',
};
export const getRepeatTypeLabel = (type: RepeatType) => REPEAT_TYPE_LABELS[type];
```

**타입 안전성 (필수)**

- ✅ 모든 타입 명시
- ✅ 함수 시그니처 정확
- ❌ any 사용 금지

---

## Handoff 문서 형식

### Phase 4 → Phase 5 전환

Orchestrator가 다음 Handoff 문서 생성:

```yaml
---
phase: 5
agent: refactoring-expert
timestamp: [ISO 8601]
status: ready
previous_phase: 4

inputs:
  implementation_log: .claude/agent-docs/code-writer/logs/YYYY-MM-DD_implementation-log.md
  implemented_files:
    - [파일 목록]
  test_file: src/__tests__/task.[feature].spec.ts
  technical_debt:
    - [개선 필요 사항 목록]

references:
  agent_definition: ../../agents/refactoring-expert.md
  code_style_guide: CLAUDE.md

output_requirements:
  refactored_files:
    - [개선할 파일 목록]
  log_file: .claude/agent-docs/refactoring-expert/logs/refactoring.md

constraints:
  - 테스트는 계속 통과해야 함
  - 기능 변경 금지
  - 코드 품질만 개선
  - DRY 원칙 적용
  - 성능 최적화 (필요 시)

validation_criteria:
  - 모든 테스트가 여전히 통과하는가
  - ESLint 에러가 없는가
  - 코드 가독성이 개선되었는가
  - 중복 코드가 제거되었는가
---
```

---

## 격리 계약

### Code Writer가 할 수 있는 것

✅ **허용:**

- Handoff 문서 읽기
- code-writer.md 참조
- CLAUDE.md 읽기
- 기술 명세서 읽기
- 테스트 전략 문서 읽기
- 실패하는 테스트 파일 읽기
- context_files에 명시된 파일 읽기
- 프로덕션 코드 작성/수정
- logs/YYYY-MM-DD_implementation-log.md 작성
- 테스트 실행 (검증 목적)

### Code Writer가 할 수 없는 것

❌ **금지:**

- 테스트 파일 수정
- 다른 Phase의 Handoff 문서 읽기
- Orchestrator의 전체 계획 접근
- 다른 에이전트 실행 컨텍스트 접근
- 프로덕션 수준 리팩터링 (Refactoring Expert의 역할)
- Git 커밋 생성 (Orchestrator의 역할)
- 과도한 추상화 또는 최적화
- 반복 일정 기능 구현 (8주차 과제)

### 순수 함수 원칙 (개념적 모델)

```typescript
// 개념적 모델
type CodeWriter = (failingTests: Test[], spec: Spec) => Implementation;

// 특성
// - 동일한 테스트 + 명세 → 동일한 구현
// - 최소 구현으로 테스트 통과
// - 타입 안전성 유지
// - 프로젝트 규칙 준수
// - 테스트 파일은 절대 수정하지 않음
```

---

## 에러 처리

### 테스트가 통과하지 않는 경우

**상황:** 구현했지만 테스트가 여전히 실패

**조치:**

1. 실패 원인 분석
2. 테스트 기대값 확인
3. 구현 수정 (테스트 수정 금지)
4. 재시도

**보고 사항:**

```markdown
## ⚠️ 테스트 통과 실패

### 실패 테스트

- [ ] 테스트명 1
  - **에러**: [에러 메시지]
  - **원인**: [분석 결과]
  - **시도한 해결책**: [시도한 방법]

### 필요한 조치

1. [다음에 시도할 방법]
2. [대안 접근법]

### Orchestrator에게 보고

테스트 명세가 불명확할 수 있음. 검토 필요.
```

### 타입 에러

**상황:** TypeScript 컴파일 실패

**조치:**

1. 타입 정의 확인 (src/types.ts)
2. any 사용하지 않고 정확한 타입 명시
3. 필요 시 타입 가드 또는 타입 단언 사용
4. 재컴파일

**예시:**

```typescript
// ❌ 잘못된 방법
const data: any = fetchData();

// ✅ 올바른 방법
const data: Event = fetchData() as Event;

// ✅ 더 나은 방법 (타입 가드)
function isEvent(data: unknown): data is Event {
  return typeof data === 'object' && data !== null && 'id' in data && 'title' in data;
}
```

### 테스트와 명세 불일치

**상황:** 테스트가 명세서와 다른 동작을 기대

**조치:**

1. 명세서 재검토
2. 테스트 의도 파악
3. **테스트를 우선으로 구현** (TDD 원칙)
4. 불일치 사항 기록

**보고:**

```markdown
## ⚠️ 명세와 테스트 불일치

### 불일치 항목

**명세서**: [명세서 내용]
**테스트**: [테스트가 기대하는 동작]

### 선택한 방향

테스트를 따라 구현 (TDD 원칙)

### Orchestrator에게 보고

Phase 1 (Feature Design) 재검토 필요
```

### 기존 코드 충돌

**상황:** 새 구현이 기존 코드와 충돌

**조치:**

1. 충돌 지점 분석
2. 최소 영향으로 통합
3. 기존 테스트가 깨지지 않는지 확인
4. 충돌 해결 방법 기록

**예시:**

```markdown
## ⚠️ 기존 코드 충돌

### 충돌 지점

**파일**: src/hooks/useEventForm.ts
**원인**: 새 필드 추가로 기존 로직 영향

### 해결 방법

1. 기존 필드는 유지
2. 새 필드는 선택적 (optional)로 추가
3. 기본값 제공으로 하위 호환성 유지

### 영향 분석

- 기존 테스트: 통과 유지
- 새 테스트: 통과
```

---

## 작업 산출물

### 핵심 파일

```
.claude/agent-docs/code-writer/
├── logs/
│   └── YYYY-MM-DD_implementation-log.md  # 구현 로그 (필수)
│
└── references/
    ├── green-decisions.md        # GREEN 단계 결정 사항
    └── technical-debt.md         # 기술적 부채 목록
```

### YYYY-MM-DD_implementation-log.md 템플릿

상단 [출력 계약](#출력-계약) 섹션 참조

### technical-debt.md 템플릿

````markdown
# 기술적 부채 목록 (Refactoring 단계에서 개선)

**작성일**: [날짜]
**기능**: [기능명]

---

## 1. 중복 코드

### 중복 1: [설명]

**위치:**

- 파일 1: [경로]
- 파일 2: [경로]

**중복 내용:**

```typescript
// 중복된 코드
```
````

**리팩터링 제안:**
공통 유틸리티 함수로 추출

---

## 2. 하드코딩

### 하드코딩 1: [설명]

**위치**: [파일 경로]

**하드코딩 값:**

```typescript
if (type === 'daily') return '매일';
if (type === 'weekly') return '매주';
// ...
```

**리팩터링 제안:**
Record 타입으로 상수화

---

## 3. 성능 최적화 여지

### 최적화 1: [설명]

**위치**: [파일 경로]

**현재 구현:**

```typescript
// 매 렌더마다 재생성되는 함수
```

**리팩터링 제안:**
useCallback으로 메모이제이션

---

## 4. 에러 처리 개선

### 개선 1: [설명]

**위치**: [파일 경로]

**현재 처리:**

```typescript
if (!title) {
  enqueueSnackbar('제목을 입력해주세요', { variant: 'error' });
  return;
}
```

**리팩터링 제안:**
통합 유효성 검사 함수 생성

---

## 5. 주석 및 문서화

### 문서화 1: [설명]

**위치**: [파일 경로]

**필요 사항:**

- JSDoc 주석 추가
- 복잡한 로직 설명
- 엣지 케이스 명시

````

---

## 성공 사례

### 좋은 GREEN 단계 구현 예시

```typescript
// src/utils/repeatUtils.ts

import { RepeatType } from '../types';

// ✅ 최소 구현: 직접적인 if 문
export const getRepeatTypeLabel = (type: RepeatType): string => {
  if (type === 'daily') return '매일';
  if (type === 'weekly') return '매주';
  if (type === 'monthly') return '매월';
  if (type === 'yearly') return '매년';
  return '없음';
};

// ✅ 순수 함수: 외부 상태 의존 없음
export const isValidRepeatType = (type: string): type is RepeatType => {
  return ['daily', 'weekly', 'monthly', 'yearly', 'none'].includes(type);
};
````

```typescript
// src/hooks/useEventForm.ts

import { useState } from 'react';

import { RepeatType } from '../types';

// ✅ 최소 구현: 필요한 상태만 추가
export const useEventForm = () => {
  const [repeatType, setRepeatType] = useState<RepeatType>('none');

  // ✅ 단순한 핸들러
  const handleRepeatTypeChange = (type: RepeatType) => {
    setRepeatType(type);
  };

  return {
    repeatType,
    handleRepeatTypeChange,
  };
};
```

**왜 좋은가:**

- ✅ 테스트를 통과시키는 최소한의 코드
- ✅ 타입 안전성 유지 (any 없음)
- ✅ 프로젝트 규칙 준수 (Import 순서, 명명 등)
- ✅ 과도한 추상화 없음
- ✅ Hooks는 상태 관리, Utils는 순수 함수
- ✅ 리팩터링 여지 남김 (중복, 최적화 등)

---

## 참고 자료

- [Code Writer 역할 정의](../../agents/code-writer.md)
- [프로젝트 규칙 (CLAUDE.md)](../../../CLAUDE.md)
- [Orchestrator 계약](../orchestrator/contract.md)
- [Test Writer 계약](../test-writer/contract.md)
- [Refactoring Expert 계약](../refactoring-expert/contract.md)

---

**마지막 업데이트**: 2025-10-30
**버전**: 1.0.0
**Phase**: 4 (GREEN)
