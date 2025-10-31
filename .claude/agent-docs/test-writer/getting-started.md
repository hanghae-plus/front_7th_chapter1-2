# Test Writer: 시작 가이드 (Getting Started)

## 목차

1. [개요](#개요)
2. [5분 빠른 시작](#5분-빠른-시작)
3. [역할 이해하기](#역할-이해하기)
4. [핵심 개념](#핵심-개념)
5. [실전 예제](#실전-예제)
6. [자주 묻는 질문](#자주-묻는-질문)
7. [다음 단계](#다음-단계)

---

## 개요

### Test Writer란?

Test Writer는 **TDD (Test-Driven Development)의 RED 단계**를 담당하는 전문 에이전트이다.

**TDD 3단계:**
1. **RED (Test Writer)**: 실패하는 테스트 작성 ← **당신의 역할**
2. **GREEN (Code Writer)**: 테스트를 통과시키는 최소 구현
3. **REFACTOR (Refactoring Expert)**: 코드 품질 개선

### 핵심 임무

**"구현 없이 테스트만 작성하고, 실패를 확인하라"**

### 작업 흐름

```
Phase 2 (Test Designer)
  → 테스트 전략 문서 생성
    ↓
Phase 3 (Test Writer) ← 당신의 역할
  → 실패하는 테스트 작성
  → 실패 확인 및 문서화
    ↓
Phase 4 (Code Writer)
  → 테스트를 통과시키는 구현 작성
```

---

## 5분 빠른 시작

### Step 1: 입력 파일 확인 (30초)

```bash
# Handoff 문서 읽기
cat .claude/agent-docs/orchestrator/handoff/phase3.md

# 테스트 전략 읽기
cat .claude/agent-docs/test-designer/logs/test-strategy.md
```

### Step 2: 테스트 파일 생성 (2분)

```typescript
// src/__tests__/task.[feature-name].spec.ts

/**
 * TDD RED 단계 테스트
 * 작성일: 2025-10-30
 * 기능: [기능명]
 *
 * 예상 실패 (구현 전):
 * - ✗ [테스트 1]
 *   → [예상 에러]
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useYourHook } from '../hooks/useYourHook';

describe('[기능 그룹명 - 한글]', () => {
  it('[구체적인 한글 설명]', () => {
    // Given
    const { result } = renderHook(() => useYourHook());

    // When & Then
    expect(result.current.someValue).toBe(expectedValue);
  });
});
```

### Step 3: 테스트 실행 및 실패 확인 (1분)

```bash
# 테스트 실행 (반드시 실패해야 함)
pnpm test task.[feature-name].spec.ts

# 예상 출력:
# FAIL  src/__tests__/task.[feature-name].spec.ts
#   ✗ 여러 테스트 실패
```

### Step 4: 로그 작성 (1분 30초)

```markdown
# .claude/agent-docs/test-writer/logs/YYYY-MM-DD_test-writing-log.md

## 실행 결과

```
FAIL  src/__tests__/task.[feature-name].spec.ts
  ✗ 초기값 테스트 (5 ms)
    TypeError: Cannot read property 'someValue' of undefined
```

## 검증 완료

- ✅ 모든 테스트가 예상대로 실패함
- ✅ 실패 메시지가 명확함
- ✅ GREEN 단계로 전달 준비 완료
```

**완료! 이제 Orchestrator가 Phase 4 (GREEN)으로 진행한다.**

---

## 역할 이해하기

### TDD RED 단계의 의미

#### 왜 실패하는 테스트를 작성하는가?

1. **요구사항을 명확히 정의**
   - 테스트 = 실행 가능한 명세서
   - "무엇을 만들어야 하는가"를 코드로 표현

2. **구현을 이끄는 가이드**
   - 구현자가 무엇을 만들어야 하는지 명확히 알 수 있음
   - 테스트 통과 = 구현 완료

3. **버그 예방**
   - 구현 전에 테스트를 작성하면 빠뜨리는 경우가 없음
   - 모든 요구사항이 테스트로 커버됨

4. **리팩터링 안전망**
   - 나중에 코드를 개선할 때 안전하게 변경 가능
   - 테스트가 통과하면 기능이 정상 동작함을 보장

#### RED 단계의 철학

```
❌ 잘못된 접근:
   구현 → 테스트 작성 → 통과 확인
   (이미 동작하는 코드에 맞춰 테스트를 작성하게 됨)

✅ 올바른 접근 (TDD):
   테스트 작성 → 실패 확인 → 구현 → 통과 확인
   (테스트가 구현을 이끔)
```

### 당신의 역할 범위

#### ✅ 해야 하는 것

- **테스트 코드 작성**
  - 순수 함수 테스트
  - 커스텀 훅 테스트
  - 컴포넌트 테스트
  - API 통신 테스트 (MSW)

- **GWT 패턴 적용**
  - Given: 준비
  - When: 실행
  - Then: 검증

- **한글 설명 작성**
  - describe 블록
  - it 블록
  - 주석

- **예상 실패 문서화**
  - 파일 상단 주석
  - RED 단계 로그

- **실패 확인**
  - `pnpm test` 실행
  - 모든 테스트 실패 확인

#### ❌ 하지 말아야 하는 것

- **구현 코드 작성**
  - 프로덕션 코드 작성 금지
  - 훅, 유틸, 컴포넌트 구현 금지

- **테스트 수정**
  - 테스트를 통과시키기 위해 테스트 약화 금지
  - 실패가 예상과 다르면 구현이 문제 (테스트가 아님)

- **타입 활성화**
  - 주석 처리된 타입 정의 활성화 금지
  - 타입만 임시로 정의 가능 (테스트 파일 내부)

---

## 핵심 개념

### 1. GWT 패턴

#### Given-When-Then 구조

```typescript
it('명확한 한글 설명', () => {
  // Given - 준비 단계
  // 테스트에 필요한 데이터, 상태, Mock 설정
  const mockData = { /* ... */ };
  const { result } = renderHook(() => useYourHook());

  // When - 실행 단계
  // 테스트할 동작 수행
  act(() => {
    result.current.someAction(mockData);
  });

  // Then - 검증 단계
  // 예상 결과 확인
  expect(result.current.state).toBe(expected);
});
```

#### 왜 GWT 패턴을 사용하는가?

- **가독성**: 테스트 의도가 명확해짐
- **유지보수성**: 각 단계의 역할이 분명함
- **일관성**: 모든 테스트가 동일한 구조를 가짐

### 2. 테스트 파일 명명 규칙

```
src/__tests__/
├── easy.*.spec.ts      # 단순 로직 (기존 파일)
├── medium.*.spec.ts    # 복잡한 로직 (기존 파일)
└── task.*.spec.ts      # 새로 작성하는 테스트 ← 당신이 작성
```

**예시:**
- `task.repeat-event.spec.ts` - 반복 일정 기능
- `task.category-filter.spec.ts` - 카테고리 필터
- `task.drag-drop.spec.ts` - 드래그 앤 드롭

### 3. 예상 실패 문서화

#### 파일 상단 주석

```typescript
/**
 * TDD RED 단계 테스트
 * 작성일: 2025-10-30
 * 기능: 반복 일정 유형 선택
 *
 * 예상 실패 (구현 전):
 * - ✗ 초기 반복 유형은 none이어야 한다
 *   → TypeError: Cannot read property 'repeatType' of undefined
 *   (useEventForm 훅이 아직 구현되지 않음)
 *
 * - ✗ 반복 유형을 daily로 변경할 수 있어야 한다
 *   → TypeError: result.current.setRepeatType is not a function
 *   (setRepeatType 함수가 구현되지 않음)
 *
 * GREEN 단계 이후 (예상):
 * - ✓ 모든 테스트가 통과해야 함
 */
```

#### RED 단계 로그 파일

```markdown
# .claude/agent-docs/test-writer/logs/YYYY-MM-DD_test-writing-log.md

## 실행 명령어

```bash
pnpm test task.repeat-event.spec.ts
```

## 실행 결과

[실제 터미널 출력 붙여넣기]

## 검증 완료

- ✅ 모든 테스트가 예상대로 실패함
- ✅ 실패 메시지가 명확함
- ✅ 구현 코드는 작성하지 않음
```

### 4. MSW를 이용한 API 모킹

#### 기본 패턴

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '../__mocks__/server';

describe('API 통신 테스트', () => {
  it('API 호출 성공 시나리오', async () => {
    // Given - MSW 핸들러 설정
    const mockResponse = { success: { id: '1', title: '회의' } };
    server.use(
      http.post('/api/events', () => {
        return HttpResponse.json(mockResponse);
      })
    );

    const { result } = renderHook(() => useEventOperations());

    // When
    await act(async () => {
      await result.current.createEvent({ title: '회의' });
    });

    // Then
    await waitFor(() => {
      expect(result.current.events).toContainEqual(mockResponse.success);
    });
  });
});
```

---

## 실전 예제

### 예제 1: 순수 함수 테스트

**요구사항:** 반복 유형을 한글 라벨로 변환하는 함수

#### 테스트 전략 (Phase 2 산출물)

```markdown
## 테스트 케이스: formatRepeatLabel

### TC-1: 반복 유형 라벨 변환
- **Given**: 반복 유형 'daily'
- **When**: formatRepeatLabel('daily') 호출
- **Then**: '매일' 반환

### TC-2: none 처리
- **Given**: 반복 유형 'none'
- **When**: formatRepeatLabel('none') 호출
- **Then**: '반복 안함' 반환
```

#### 테스트 코드 (Phase 3 - 당신의 작업)

```typescript
/**
 * TDD RED 단계 테스트
 * 작성일: 2025-10-30
 * 기능: 반복 유형 라벨 변환
 *
 * 예상 실패 (구현 전):
 * - ✗ daily는 "매일"로 변환되어야 한다
 *   → ReferenceError: formatRepeatLabel is not defined
 * - ✗ weekly는 "매주"로 변환되어야 한다
 *   → ReferenceError: formatRepeatLabel is not defined
 * - ✗ none은 "반복 안함"으로 변환되어야 한다
 *   → ReferenceError: formatRepeatLabel is not defined
 *
 * GREEN 단계 이후 (예상):
 * - ✓ 모든 테스트가 통과해야 함
 */

import { describe, it, expect } from 'vitest';

import { formatRepeatLabel } from '../utils/repeatUtils';

describe('formatRepeatLabel - 반복 유형 라벨 변환', () => {
  it('daily는 "매일"로 변환되어야 한다', () => {
    // Given
    const repeatType = 'daily';

    // When
    const label = formatRepeatLabel(repeatType);

    // Then
    expect(label).toBe('매일');
  });

  it('weekly는 "매주"로 변환되어야 한다', () => {
    // Given
    const repeatType = 'weekly';

    // When
    const label = formatRepeatLabel(repeatType);

    // Then
    expect(label).toBe('매주');
  });

  it('monthly는 "매월"로 변환되어야 한다', () => {
    // Given
    const repeatType = 'monthly';

    // When
    const label = formatRepeatLabel(repeatType);

    // Then
    expect(label).toBe('매월');
  });

  it('yearly는 "매년"로 변환되어야 한다', () => {
    // Given
    const repeatType = 'yearly';

    // When
    const label = formatRepeatLabel(repeatType);

    // Then
    expect(label).toBe('매년');
  });

  it('none은 "반복 안함"으로 변환되어야 한다', () => {
    // Given
    const repeatType = 'none';

    // When
    const label = formatRepeatLabel(repeatType);

    // Then
    expect(label).toBe('반복 안함');
  });
});
```

#### 실행 결과

```bash
pnpm test task.repeat-label.spec.ts

# 출력:
FAIL  src/__tests__/task.repeat-label.spec.ts
  formatRepeatLabel - 반복 유형 라벨 변환
    ✗ daily는 "매일"로 변환되어야 한다 (2 ms)
      ReferenceError: formatRepeatLabel is not defined
    ✗ weekly는 "매주"로 변환되어야 한다 (1 ms)
      ReferenceError: formatRepeatLabel is not defined
    ...

Test Files  1 failed (1)
     Tests  5 failed (5)
```

**✅ 완벽! 모든 테스트가 실패함 (예상된 결과)**

---

### 예제 2: 커스텀 훅 테스트

**요구사항:** 반복 일정 설정을 관리하는 훅

#### 테스트 전략 (Phase 2 산출물)

```markdown
## 테스트 케이스: useRepeatSettings

### TC-1: 초기 상태
- **Given**: 훅 실행
- **When**: 초기 렌더링
- **Then**: isEnabled: false, type: 'none', interval: 1

### TC-2: 반복 활성화
- **Given**: 초기 상태
- **When**: enableRepeat() 호출
- **Then**: isEnabled: true, type: 'daily', interval: 1
```

#### 테스트 코드 (Phase 3 - 당신의 작업)

```typescript
/**
 * TDD RED 단계 테스트
 * 작성일: 2025-10-30
 * 기능: 반복 설정 관리 훅
 *
 * 예상 실패 (구현 전):
 * - ✗ 초기 상태가 올바른가
 *   → TypeError: Cannot read property 'isEnabled' of undefined
 * - ✗ 반복 활성화 시 기본값이 설정되는가
 *   → TypeError: result.current.enableRepeat is not a function
 * - ✗ 반복 유형을 변경할 수 있는가
 *   → TypeError: result.current.setRepeatType is not a function
 *
 * GREEN 단계 이후 (예상):
 * - ✓ 모든 테스트가 통과해야 함
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useRepeatSettings } from '../hooks/useRepeatSettings';

describe('useRepeatSettings - 반복 설정 관리', () => {
  it('초기 상태가 올바른가', () => {
    // Given
    const { result } = renderHook(() => useRepeatSettings());

    // When & Then
    expect(result.current.isEnabled).toBe(false);
    expect(result.current.type).toBe('none');
    expect(result.current.interval).toBe(1);
  });

  it('반복 활성화 시 기본값이 설정되는가', () => {
    // Given
    const { result } = renderHook(() => useRepeatSettings());

    // When
    act(() => {
      result.current.enableRepeat();
    });

    // Then
    expect(result.current.isEnabled).toBe(true);
    expect(result.current.type).toBe('daily');
    expect(result.current.interval).toBe(1);
  });

  it('반복 유형을 변경할 수 있는가', () => {
    // Given
    const { result } = renderHook(() => useRepeatSettings());
    act(() => {
      result.current.enableRepeat();
    });

    // When
    act(() => {
      result.current.setRepeatType('weekly');
    });

    // Then
    expect(result.current.type).toBe('weekly');
  });

  it('반복 비활성화 시 상태가 초기화되는가', () => {
    // Given
    const { result } = renderHook(() => useRepeatSettings());
    act(() => {
      result.current.enableRepeat();
      result.current.setRepeatType('monthly');
    });

    // When
    act(() => {
      result.current.disableRepeat();
    });

    // Then
    expect(result.current.isEnabled).toBe(false);
    expect(result.current.type).toBe('none');
  });
});
```

#### 실행 결과

```bash
pnpm test task.repeat-settings.spec.ts

# 출력:
FAIL  src/__tests__/task.repeat-settings.spec.ts
  useRepeatSettings - 반복 설정 관리
    ✗ 초기 상태가 올바른가 (3 ms)
      TypeError: Cannot read property 'isEnabled' of undefined
    ✗ 반복 활성화 시 기본값이 설정되는가 (2 ms)
      TypeError: Cannot read property 'enableRepeat' of undefined
    ...

Test Files  1 failed (1)
     Tests  4 failed (4)
```

**✅ 완벽! 모든 테스트가 실패함 (예상된 결과)**

---

### 예제 3: API 통신 테스트 (MSW)

**요구사항:** 반복 일정 생성 API 호출

#### 테스트 전략 (Phase 2 산출물)

```markdown
## 테스트 케이스: 반복 일정 생성 API

### TC-1: 성공 시나리오
- **Given**: MSW 핸들러 설정, 반복 정보 포함 이벤트
- **When**: createEvent() 호출
- **Then**: 서버에 올바른 데이터 전송, 생성된 이벤트 반환

### TC-2: 실패 시나리오
- **Given**: MSW 에러 응답 설정
- **When**: createEvent() 호출
- **Then**: 에러 처리, 사용자 알림
```

#### 테스트 코드 (Phase 3 - 당신의 작업)

```typescript
/**
 * TDD RED 단계 테스트
 * 작성일: 2025-10-30
 * 기능: 반복 일정 API 통신
 *
 * 예상 실패 (구현 전):
 * - ✗ 반복 일정 생성 시 올바른 데이터를 전송해야 한다
 *   → TypeError: result.current.createEvent is not a function
 * - ✗ API 실패 시 에러를 처리해야 한다
 *   → TypeError: result.current.createEvent is not a function
 *
 * GREEN 단계 이후 (예상):
 * - ✓ 모든 테스트가 통과해야 함
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '../__mocks__/server';
import { useEventOperations } from '../hooks/useEventOperations';

describe('반복 일정 API 통신', () => {
  it('반복 일정 생성 시 올바른 데이터를 전송해야 한다', async () => {
    // Given - MSW 핸들러 설정
    let requestBody: any;
    const mockEvent = {
      id: '1',
      title: '매일 회의',
      date: '2025-10-30',
      startTime: '10:00',
      endTime: '11:00',
      repeat: { type: 'daily', interval: 1 }
    };

    server.use(
      http.post('/api/events', async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ success: mockEvent });
      })
    );

    const { result } = renderHook(() => useEventOperations());

    // When
    await act(async () => {
      await result.current.createEvent({
        title: '매일 회의',
        date: '2025-10-30',
        startTime: '10:00',
        endTime: '11:00',
        repeat: { type: 'daily', interval: 1 }
      });
    });

    // Then
    expect(requestBody.repeat.type).toBe('daily');
    expect(requestBody.repeat.interval).toBe(1);

    await waitFor(() => {
      expect(result.current.events).toContainEqual(mockEvent);
    });
  });

  it('API 실패 시 에러를 처리해야 한다', async () => {
    // Given - 에러 응답 설정
    server.use(
      http.post('/api/events', () => {
        return HttpResponse.json(
          { error: '서버 오류' },
          { status: 500 }
        );
      })
    );

    const { result } = renderHook(() => useEventOperations());

    // When
    await act(async () => {
      await result.current.createEvent({
        title: '회의',
        repeat: { type: 'daily', interval: 1 }
      });
    });

    // Then
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

#### 실행 결과

```bash
pnpm test task.repeat-api.spec.ts

# 출력:
FAIL  src/__tests__/task.repeat-api.spec.ts
  반복 일정 API 통신
    ✗ 반복 일정 생성 시 올바른 데이터를 전송해야 한다 (10 ms)
      TypeError: result.current.createEvent is not a function
    ✗ API 실패 시 에러를 처리해야 한다 (5 ms)
      TypeError: result.current.createEvent is not a function

Test Files  1 failed (1)
     Tests  2 failed (2)
```

**✅ 완벽! 모든 테스트가 실패함 (예상된 결과)**

---

## 자주 묻는 질문

### Q1: 테스트가 실패하지 않으면 어떻게 하나요?

**A:** RED 단계 실패! 원인을 파악하세요.

**가능한 원인:**
1. 구현이 이미 있음 → 제거하거나 주석 처리
2. 테스트가 실제 동작을 검증하지 않음 → 테스트 로직 수정
3. import 경로 오류 → 경로 확인

```bash
# 구현 파일 확인
ls src/hooks/useYourHook.ts
ls src/utils/yourUtil.ts

# 있으면 제거 또는 주석 처리
```

### Q2: TypeScript 컴파일 오류가 나면 어떻게 하나요?

**A:** 타입만 임시로 정의하세요.

```typescript
// 테스트 파일 내부
type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;
}

// 실제 import는 주석 처리하거나 오류 무시
// import { useEventForm } from '../hooks/useEventForm';

describe('테스트', () => {
  // ... 테스트 작성
});
```

### Q3: 테스트 전략이 불명확하면 어떻게 하나요?

**A:** 최소한의 테스트만 작성하고 질문을 기록하세요.

```markdown
# references/issues-log.md

## 🤔 명확화 필요

### 질문 1: 반복 간격 검증 범위
**현재 이해:** 양의 정수만 허용
**불명확한 점:** 최대값 제한이 있는가? (예: 999일까지?)
**현재 구현:** 최대값 제한 없이 테스트 작성

### 결정 필요
Phase 4 (Code Writer)에서 최대값 검증 필요 여부 확인
```

### Q4: MSW 핸들러 설정이 복잡하면 어떻게 하나요?

**A:** 기존 핸들러를 참고하세요.

```bash
# 기존 MSW 설정 확인
cat src/__mocks__/handlers.ts
cat src/__mocks__/server.ts

# 기존 테스트 참고
cat src/__tests__/medium.integration.spec.ts
```

### Q5: 모든 엣지 케이스를 테스트해야 하나요?

**A:** 테스트 전략에 명시된 케이스만 작성하세요.

**우선순위:**
1. **핵심 동작** (필수)
2. **주요 엣지 케이스** (필수)
3. **부가 엣지 케이스** (선택)

테스트 전략에 없는 케이스는 나중에 추가 가능.

---

## 다음 단계

### Phase 3 완료 후

1. **테스트 파일 생성 확인**
   ```bash
   ls src/__tests__/task.*.spec.ts
   ```

2. **모든 테스트 실패 확인**
   ```bash
   pnpm test task.[feature-name].spec.ts
   # 예상: FAIL
   ```

3. **로그 파일 작성**
   ```bash
   cat .claude/agent-docs/test-writer/logs/YYYY-MM-DD_test-writing-log.md
   ```

4. **Orchestrator에게 보고**
   - Orchestrator가 자동으로 Phase 4 (GREEN) 시작

### Phase 4 (GREEN - Code Writer)

Code Writer가:
1. 실패하는 테스트 읽기
2. 테스트를 통과시키는 최소 구현 작성
3. 모든 테스트 통과 확인

### Phase 5 (REFACTOR)

Refactoring Expert가:
1. 코드 품질 개선
2. 테스트 통과 유지

---

## 추가 학습 자료

### 필독 문서

- [Test Writer 계약 명세](contract.md) - 상세한 입출력 계약
- [Test Writer 실행 매뉴얼](prompt.md) - 단계별 실행 가이드
- [Test Writer 역할 정의](../../agents/test-writer.md) - 역할 및 책임
- [프로젝트 테스트 규칙 (CLAUDE.md)](../../../CLAUDE.md) - 프로젝트별 규칙

### TDD 참고 자료

- [TDD란 무엇인가?](https://en.wikipedia.org/wiki/Test-driven_development)
- [GWT 패턴](https://martinfowler.com/bliki/GivenWhenThen.html)
- [Vitest 문서](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW (Mock Service Worker)](https://mswjs.io/)

---

## 요약

### 핵심 3원칙

1. **테스트 먼저, 구현 나중**
   - 구현 코드를 작성하지 않음
   - 테스트만 작성

2. **실패 확인 필수**
   - 모든 테스트가 실패해야 함
   - 실패하지 않으면 TDD가 아님

3. **명확한 문서화**
   - 예상 실패 내용 주석
   - RED 단계 로그 작성

### 빠른 체크리스트

Phase 3 완료 전에 확인:

- [ ] 테스트 파일명: `task.[feature-name].spec.ts`
- [ ] 파일 상단에 예상 실패 주석 작성
- [ ] GWT 패턴 엄수
- [ ] 한글 설명 명확
- [ ] 모든 테스트 실패 확인 (`pnpm test`)
- [ ] RED 단계 로그 작성
- [ ] 구현 코드 포함 안 됨

**이제 시작하세요! 실패하는 테스트를 작성하는 것이 성공의 시작입니다.**
