# Test Writer: 계약 명세서 (Contract)

## 목차

1. [개요](#개요)
2. [입력 계약](#입력-계약)
3. [출력 계약](#출력-계약)
4. [검증 기준](#검증-기준)
5. [TDD RED 단계 계약](#tdd-red-단계-계약)
6. [Handoff 문서 형식](#handoff-문서-형식)
7. [격리 계약](#격리-계약)
8. [에러 처리](#에러-처리)

---

## 개요

Test Writer는 **Phase 3 (RED)**에서 동작하며, 테스트 전략을 실제 실패하는 테스트 코드로 변환하는 역할을 수행한다.

**핵심 책임:**

- 테스트 전략을 실행 가능한 테스트 코드로 변환
- GWT 패턴 기반 테스트 작성
- MSW를 이용한 API 모킹 설정
- **반드시 실패하는** 테스트 작성 (TDD RED 단계)
- 예상 실패 내용 문서화

**선행 조건:**

- Phase 2 (Test Design)이 완료되어야 함
- Test Designer가 생성한 테스트 전략 문서가 존재해야 함
- Orchestrator가 생성한 Handoff 문서가 존재해야 함

**후속 단계:**

- Phase 4 (GREEN - Code Writing)로 전달
- Code Writer가 이 테스트를 통과시키는 구현 작성

---

## 입력 계약

### Handoff 문서 경로

```
.claude/agent-docs/orchestrator/handoff/phase3.md
```

### 필수 입력 항목

```yaml
---
phase: 3
agent: test-writer
timestamp: [ISO 8601 형식]
status: ready

inputs:
  test_strategy: .claude/agent-docs/test-designer/logs/test-strategy.md
  feature_spec: .claude/agent-docs/feature-designer/logs/spec.md
  context_files:
    - CLAUDE.md
    - src/types.ts
    - src/__mocks__/handlers.ts
    - [관련 파일 경로들]

references:
  agent_definition: ../../agents/test-writer.md
  test_conventions: CLAUDE.md
  gwt_pattern: ../../docs/rule-of-make-good-test.md

output_requirements:
  path: src/__tests__/task.[feature-name].spec.ts
  required_sections:
    - TDD RED 단계 헤더 주석
    - 테스트 import 문
    - describe 블록 (한글 설명)
    - it 블록들 (GWT 패턴)
  format: TypeScript

constraints:
  - 테스트는 반드시 실패해야 함 (구현 없음)
  - GWT (Given-When-Then) 패턴 엄수
  - 테스트 설명은 한글로 작성
  - 파일명: task.[feature-name].spec.ts
  - MSW 핸들러 사용 (API 테스트)
  - 구현 코드는 작성하지 않음

validation_criteria:
  - 테스트 파일이 생성되었는가
  - 모든 테스트가 실패하는가 (pnpm test 실행 결과)
  - GWT 패턴을 준수하는가
  - 예상 실패 내용이 문서화되었는가
  - 구현 코드가 포함되지 않았는가
---
```

### 입력 데이터 구조

#### 1. test_strategy (필수)

Phase 2에서 Test Designer가 생성한 테스트 전략 문서:

```typescript
{
  test_cases: TestCase[];           // 테스트 케이스 목록
  mocking_strategy: MockingPlan;    // 모킹 계획
  gwt_scenarios: GWTScenario[];     // GWT 시나리오
  edge_cases: EdgeCase[];           // 엣지 케이스
}
```

#### 2. feature_spec (필수)

Phase 1에서 Feature Designer가 생성한 기술 명세서:

```typescript
{
  type_definitions: TypeScript; // 타입 정의
  api_design: APISpec; // API 설계
  component_structure: Component; // 컴포넌트 구조
}
```

#### 3. context_files (필수)

최소 포함 파일:

- `CLAUDE.md` - 프로젝트 규칙 및 테스트 컨벤션
- `src/types.ts` - 타입 정의
- `src/__mocks__/handlers.ts` - MSW 핸들러 패턴

선택 파일:

- 기존 테스트 파일 (패턴 참고용)
- Mock 데이터 파일 (`src/__mocks__/response/*.json`)

---

## 출력 계약

### 출력 파일 경로

```
src/__tests__/task.[feature-name].spec.ts
```

**파일명 규칙:**

- 새 테스트: `task.[feature-name].spec.ts`
- 예: `task.repeat-event.spec.ts`, `task.category-filter.spec.ts`

### 필수 출력 구조

```typescript
/**
 * TDD RED 단계 테스트
 * 작성일: [YYYY-MM-DD]
 * 기능: [기능명]
 *
 * 예상 실패 (구현 전):
 * - ✗ [테스트 설명 1]
 *   → [예상 에러: TypeError: undefined의 'x' 속성을 읽을 수 없음]
 * - ✗ [테스트 설명 2]
 *   → [예상 에러: ReferenceError: functionName이 정의되지 않음]
 * - ✗ [테스트 설명 3]
 *   → [예상 에러: expect(received).toBe(expected) - received: undefined]
 *
 * GREEN 단계 이후 (예상):
 * - ✓ 모든 테스트가 통과해야 함
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '../__mocks__/server';
import { Event, EventForm } from '../types';
// ... 필요한 import

describe('[기능 그룹명 - 한글]', () => {
  beforeEach(() => {
    // 테스트 초기화 로직
  });

  it('[구체적이고 명확한 한글 설명]', () => {
    // Given - 테스트 환경 및 데이터 준비
    const mockData = {
      // ... 준비 데이터
    };

    // When - 테스트할 동작 실행
    const result = functionUnderTest(mockData);

    // Then - 결과 검증
    expect(result).toBe(expected);
  });

  it('[다른 테스트 시나리오 - 한글]', async () => {
    // Given
    // ... 준비

    // When
    // ... 동작

    // Then
    await waitFor(() => {
      expect(/* 검증 조건 */).toBeTruthy();
    });
  });
});

describe('[API 통신 - 한글]', () => {
  it('[API 호출 시나리오 - 한글]', async () => {
    // Given - MSW 핸들러 설정
    server.use(
      http.post('/api/events', () => {
        return HttpResponse.json({ success: mockEvent });
      })
    );

    // When
    // ... API 호출 로직

    // Then
    // ... 검증
  });
});
```

### 추가 산출물

#### RED 단계 실행 로그

```
.claude/agent-docs/test-writer/logs/YYYY-MM-DD_test-writing-log.md
```

**내용:**

````markdown
# TDD RED 단계 실행 결과

작성일: [YYYY-MM-DD]
기능: [기능명]
테스트 파일: src/**tests**/task.[feature-name].spec.ts

## 실행 명령어

```bash
pnpm test task.[feature-name].spec.ts
```
````

## 실행 결과

```
FAIL  src/__tests__/task.[feature-name].spec.ts
  [기능 그룹명]
    ✗ [테스트 설명 1] (X ms)
      TypeError: Cannot read property 'repeatType' of undefined
    ✗ [테스트 설명 2] (X ms)
      ReferenceError: setRepeatType is not a function
    ✗ [테스트 설명 3] (X ms)
      expect(received).toBe(expected)
      Expected: "daily"
      Received: undefined

Test Files  1 failed (1)
     Tests  X failed (X)
```

## 검증 완료

- ✅ 모든 테스트가 예상대로 실패함
- ✅ 실패 메시지가 명확함
- ✅ 구현 코드는 작성하지 않음
- ✅ GREEN 단계로 전달 준비 완료

````

---

## 검증 기준

### Phase 3 완료 조건

#### 필수 체크리스트

- ✅ **테스트 파일 생성**
  - 경로: `src/__tests__/task.[feature-name].spec.ts`
  - 파일명 규칙 준수
  - TypeScript 문법 오류 없음

- ✅ **TDD RED 단계 준수**
  - 모든 테스트가 실패함
  - 실패 메시지가 명확하고 유용함
  - 구현 코드가 포함되지 않음

- ✅ **GWT 패턴 준수**
  - Given-When-Then 주석 명확
  - 각 섹션의 역할이 분명함
  - 테스트 의도가 명확함

- ✅ **한글 설명**
  - describe 블록 한글 설명
  - it 블록 한글 설명
  - 주석도 한글로 작성

- ✅ **예상 실패 문서화**
  - 파일 상단에 예상 실패 내용 주석
  - 각 테스트의 예상 에러 메시지
  - RED 단계 로그 파일 생성

- ✅ **프로젝트 규칙 준수**
  - CLAUDE.md 테스트 컨벤션 준수
  - Import 순서 규칙 적용
  - MSW 사용 (API 테스트)

### 검증 명령어

#### 1. 테스트 파일 존재 확인

```bash
ls -la src/__tests__/task.*.spec.ts
````

#### 2. 테스트 실행 (반드시 실패해야 함)

```bash
pnpm test task.[feature-name].spec.ts
```

**예상 출력:**

```
FAIL  src/__tests__/task.[feature-name].spec.ts
  ✗ 여러 테스트들이 실패

Test Files  1 failed (1)
     Tests  X failed (X)
```

**❌ 만약 테스트가 통과하면:**

- RED 단계 실패 (구현이 이미 있거나 테스트가 잘못됨)
- 테스트를 수정하거나 구현 코드 제거 필요

#### 3. TypeScript 컴파일 확인

```bash
pnpm lint:tsc
```

**테스트 파일은 컴파일되어야 함** (타입 오류 없이)

#### 4. GWT 패턴 확인

```bash
grep -E "(Given|When|Then)" src/__tests__/task.[feature-name].spec.ts
```

**모든 테스트에 GWT 주석이 있어야 함.**

### 품질 기준

**명확성 (Clarity)**

- ❌ "테스트 1"
- ✅ "초기 반복 유형은 none이어야 한다"

**실패 메시지 유용성**

- ❌ "테스트 실패"
- ✅ "TypeError: Cannot read property 'repeatType' of undefined"

**테스트 독립성**

- 각 테스트는 독립적으로 실행 가능
- 테스트 순서에 의존하지 않음
- 공유 상태 사용 최소화

**완전성 (Completeness)**

- 모든 핵심 동작 테스트
- 엣지 케이스 포함
- 에러 시나리오 포함

---

## TDD RED 단계 계약

### RED 단계 핵심 원칙

#### 1. 구현이 없어야 한다

**금지:**

- ❌ 프로덕션 코드 작성
- ❌ 훅, 유틸, 컴포넌트 구현
- ❌ 타입 정의 활성화 (주석 처리된 것)

**허용:**

- ✅ 테스트 코드만 작성
- ✅ Mock 데이터 생성
- ✅ 테스트 헬퍼 함수 작성

#### 2. 테스트는 반드시 실패해야 한다

**검증 방법:**

```bash
pnpm test task.[feature-name].spec.ts

# 예상 결과:
# ✗ 모든 테스트 실패
```

**실패하지 않으면:**

1. 구현이 이미 있는지 확인
2. 테스트가 실제로 동작을 검증하는지 확인
3. import 경로가 올바른지 확인

#### 3. 실패 메시지는 명확해야 한다

**좋은 실패 메시지:**

```
TypeError: Cannot read property 'repeatType' of undefined
ReferenceError: setRepeatType is not a function
expect(received).toBe(expected)
  Expected: "daily"
  Received: undefined
```

**나쁜 실패 메시지:**

```
Error: Test failed
Assertion failed
undefined is not an object
```

#### 4. 예상 실패 내용 문서화

**테스트 파일 상단:**

```typescript
/**
 * TDD RED 단계 테스트
 *
 * 예상 실패 (구현 전):
 * - ✗ 초기 반복 유형은 none이어야 한다
 *   → TypeError: Cannot read property 'repeatType' of undefined
 * - ✗ 반복 유형을 daily로 변경할 수 있어야 한다
 *   → TypeError: setRepeatType is not a function
 */
```

**로그 파일:**
`.claude/agent-docs/test-writer/logs/YYYY-MM-DD_test-writing-log.md`

### RED 단계 검증 절차

#### Step 1: 테스트 작성 완료

```bash
# 파일 생성 확인
ls src/__tests__/task.[feature-name].spec.ts
```

#### Step 2: 테스트 실행

```bash
pnpm test task.[feature-name].spec.ts
```

#### Step 3: 실패 결과 캡처

실행 결과를 `logs/YYYY-MM-DD_test-writing-log.md`에 기록

#### Step 4: 검증 완료

- [ ] 모든 테스트가 실패함
- [ ] 실패 메시지가 예상과 일치함
- [ ] 구현 코드가 없음
- [ ] 로그 파일 생성됨

#### Step 5: GREEN 단계로 전달

Orchestrator가 다음 Handoff 생성 (Phase 4 - Code Writer)

---

## Handoff 문서 형식

### Phase 3 → Phase 4 전환

Orchestrator가 다음 Handoff 문서 생성:

```yaml
---
phase: 4
agent: code-writer
timestamp: [ISO 8601]
status: ready
previous_phase: 3

inputs:
  test_file: src/__tests__/task.[feature-name].spec.ts
  feature_spec: .claude/agent-docs/feature-designer/logs/spec.md
  red_phase_log: .claude/agent-docs/test-writer/logs/YYYY-MM-DD_test-writing-log.md
  context_files:
    - CLAUDE.md
    - src/types.ts
    - [관련 파일들]

references:
  agent_definition: ../../agents/code-writer.md
  coding_guidelines: CLAUDE.md

output_requirements:
  description: 실패하는 테스트를 통과시키는 최소 구현
  affected_files:
    - src/types.ts
    - src/utils/[feature].ts
    - src/hooks/[feature].ts
    - [필요한 파일들]

constraints:
  - 모든 테스트가 통과해야 함
  - 최소 구현 (과도한 최적화 금지)
  - TypeScript 타입 안전성 유지
  - CLAUDE.md 규칙 준수

validation_criteria:
  - pnpm test 통과
  - pnpm lint:tsc 통과
  - 테스트 파일은 수정하지 않음
---
```

---

## 격리 계약

### Test Writer가 할 수 있는 것

✅ **허용:**

- Handoff 문서 읽기
- test-writer.md 참조
- CLAUDE.md 읽기
- test-strategy.md 읽기 (Phase 2 산출물)
- feature-spec.md 읽기 (Phase 1 산출물)
- 기존 테스트 파일 참고 (패턴 학습)
- Mock 데이터 파일 참조
- 테스트 파일 작성 (`src/__tests__/task.*.spec.ts`)
- Mock 헬퍼 작성 (`src/__mocks__/`)
- 로그 파일 작성 (`logs/YYYY-MM-DD_test-writing-log.md`)

### Test Writer가 할 수 없는 것

❌ **금지:**

- 프로덕션 코드 작성 (src/hooks/, src/utils/, src/components/)
- 타입 정의 활성화 (src/types.ts 수정)
- 다른 Phase의 Handoff 문서 읽기
- Orchestrator의 전체 계획 접근
- 테스트를 통과시키기 위해 테스트 수정
- Git 커밋 생성

### 순수 함수 원칙

```typescript
// 개념적 모델
type TestWriter = (testStrategy: TestStrategy, spec: FeatureSpec) => FailingTests;

// 특성
// - 동일한 입력 → 동일한 테스트 코드
// - 외부 상태에 의존하지 않음
// - 부수 효과: 테스트 파일 생성만
// - 다른 에이전트와 독립적
```

---

## 에러 처리

### 입력 검증 실패

**상황:** Handoff 문서 또는 테스트 전략이 불완전함

**조치:**

1. 누락된 항목 명확히 기록
2. `references/issues-log.md`에 문제 기록
3. Orchestrator에게 보고

**예시:**

```markdown
## ⚠️ 입력 검증 실패

### 누락 항목

- [ ] 테스트 전략에 엣지 케이스 미정의
- [ ] API 모킹 계획 불명확
- [ ] GWT 시나리오 불완전

### 필요한 정보

1. API 엔드포인트 모킹 시 어떤 응답을 반환해야 하는가?
2. 엣지 케이스로 어떤 상황을 테스트해야 하는가?
```

### 테스트 작성 중 모호함

**상황:** 테스트 시나리오가 명확하지 않음

**조치:**

1. 가능한 해석 나열
2. 가장 일반적인 케이스로 작성
3. 질문 사항 기록

**예시:**

```markdown
## 🤔 명확화 필요

### 질문 1: "반복 일정 생성" 동작

**현재 이해:** 단일 이벤트 생성 후 반복 정보 포함
**불명확한 점:** 여러 이벤트를 한 번에 생성하는가?
**현재 구현:** 단일 이벤트 생성으로 가정
```

### 기존 코드 충돌

**상황:** 테스트가 기존 코드와 충돌

**조치:**

1. 충돌 지점 명시
2. 기존 코드 수정 필요 여부 평가
3. Orchestrator에게 보고

**예시:**

```markdown
## ⚠️ 기존 코드 충돌

### 문제

현재 Event 타입에 repeat 필드가 주석 처리됨.
테스트를 작성하려면 활성화 필요.

### 조치

Phase 4 (Code Writer)에서 타입 활성화 필요.
현재는 주석으로 표시하고 진행.
```

---

## 작업 산출물

### 핵심 파일

```
src/__tests__/
└── task.[feature-name].spec.ts        # 실패하는 테스트 (필수)

.claude/agent-docs/test-writer/
├── logs/
│   └── YYYY-MM-DD_test-writing-log.md # RED 단계 실행 결과 (필수)
│
└── references/
    ├── issues-log.md                  # 문제 기록 (필요 시)
    └── mock-data-examples.ts          # Mock 데이터 예시 (필요 시)
```

### 테스트 파일 템플릿

상단 [출력 계약](#출력-계약) 섹션 참조

### RED 단계 로그 템플릿

````markdown
# TDD RED 단계 실행 결과

작성일: [YYYY-MM-DD]
기능: [기능명]
테스트 파일: src/**tests**/task.[feature-name].spec.ts

## 실행 명령어

```bash
pnpm test task.[feature-name].spec.ts
```
````

## 실행 결과

[실제 터미널 출력 붙여넣기]

## 검증 완료

- ✅ 모든 테스트가 예상대로 실패함
- ✅ 실패 메시지가 명확함
- ✅ 구현 코드는 작성하지 않음
- ✅ GREEN 단계로 전달 준비 완료

## 다음 단계

Phase 4 (GREEN - Code Writer)에서 이 테스트를 통과시키는 구현 작성.

````

---

## 성공 사례

### 좋은 테스트 예시

```typescript
/**
 * TDD RED 단계 테스트
 * 작성일: 2025-10-30
 * 기능: 반복 일정 유형 선택
 *
 * 예상 실패 (구현 전):
 * - ✗ 초기 반복 유형은 none이어야 한다
 *   → TypeError: Cannot read property 'repeatType' of undefined
 * - ✗ 반복 유형을 daily로 변경할 수 있어야 한다
 *   → TypeError: result.current.setRepeatType is not a function
 * - ✗ 반복 유형 변경 시 상태가 업데이트되어야 한다
 *   → expect(received).toBe(expected) - received: undefined, expected: "weekly"
 *
 * GREEN 단계 이후 (예상):
 * - ✓ 모든 테스트가 통과해야 함
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useEventForm } from '../hooks/useEventForm';

describe('useEventForm - 반복 유형 관리', () => {
  it('초기 반복 유형은 none이어야 한다', () => {
    // Given
    const { result } = renderHook(() => useEventForm());

    // When & Then
    expect(result.current.repeatType).toBe('none');
  });

  it('반복 유형을 daily로 변경할 수 있어야 한다', () => {
    // Given
    const { result } = renderHook(() => useEventForm());

    // When
    act(() => {
      result.current.setRepeatType('daily');
    });

    // Then
    expect(result.current.repeatType).toBe('daily');
  });

  it('반복 유형 변경 시 상태가 업데이트되어야 한다', () => {
    // Given
    const { result } = renderHook(() => useEventForm());

    // When
    act(() => {
      result.current.setRepeatType('weekly');
    });

    // Then
    expect(result.current.repeatType).toBe('weekly');
  });
});
````

**왜 좋은가:**

- ✅ 명확한 예상 실패 문서화
- ✅ GWT 패턴 엄수
- ✅ 한글 설명 명확
- ✅ 각 테스트가 독립적
- ✅ 실패 메시지가 유용함

---

## 참고 자료

- [Test Writer 역할 정의](../../agents/test-writer.md)
- [프로젝트 테스트 규칙 (CLAUDE.md)](../../../CLAUDE.md)
- [Orchestrator 계약](../orchestrator/contract.md)
- [Test Designer 계약](../test-designer/contract.md)
- [Code Writer 계약](../code-writer/contract.md)
