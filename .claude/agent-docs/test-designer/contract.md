# Test Designer: 계약 명세서 (Contract)

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

Test Designer는 **Phase 2**에서 동작하며, 기능 명세서를 기반으로 포괄적인 테스트 전략을 수립하는 역할을 수행한다.

**핵심 책임:**
- 테스트 케이스 설계 (단위, 통합, E2E)
- 목킹 전략 수립 (MSW, vi.mock)
- GWT(Given-When-Then) 패턴 적용
- 커버리지 목표 설정
- 테스트 파일 명명 규칙 정의

**선행 조건:**
- Phase 1 (Feature Design)이 완료되어야 함
- Feature Designer가 생성한 spec.md가 존재해야 함
- Orchestrator가 생성한 Handoff 문서가 존재해야 함

**후속 단계:**
- Phase 3 (RED - Test Writing)로 전달
- Test Writer가 이 전략을 기반으로 실패하는 테스트 작성

---

## 입력 계약

### Handoff 문서 경로

```
.claude/agent-docs/orchestrator/handoff/phase2.md
```

### 필수 입력 항목

```yaml
---
phase: 2
agent: test-designer
timestamp: [ISO 8601 형식]
status: ready

inputs:
  feature_spec: .claude/agent-docs/feature-designer/logs/spec.md
  context_files:
    - CLAUDE.md                              # 프로젝트 규칙
    - .claude/docs/rule-of-make-good-test.md # 테스트 철학
    - src/types.ts                           # 타입 정의
    - [관련 기존 테스트 파일들]

references:
  agent_definition: ../../agents/test-designer.md
  test_conventions: ../../docs/rule-of-make-good-test.md
  project_rules: CLAUDE.md

output_requirements:
  path: .claude/agent-docs/test-designer/logs/test-strategy.md
  required_sections:
    - 테스트 전략 개요
    - 테스트 케이스 목록
    - 목킹 계획
    - 구현 가이드

constraints:
  - GWT(Given-When-Then) 패턴 필수
  - 테스트 파일 명명 규칙 준수 (easy/medium/task)
  - Vitest + React Testing Library 사용
  - MSW로 API 모킹
  - 한국어 테스트 설명

validation_criteria:
  - 모든 핵심 동작에 테스트 케이스가 있는가
  - GWT 패턴이 올바르게 적용되었는가
  - 목킹 전략이 구체적인가
  - 커버리지 목표가 설정되었는가
  - 테스트 파일 명명이 규칙을 따르는가
---
```

### 입력 데이터 구조

#### 1. feature_spec (필수)

Feature Designer가 작성한 기술 명세서:

```markdown
# 기능: [기능명]

## 1. 요구사항 요약
[기능 개요, 사용자 스토리, 성공 기준]

## 2. 기술 설계
[컴포넌트 구조, 데이터 흐름, API 설계, 타입 정의]

## 3. 테스트 가능한 동작
[핵심 동작, 엣지 케이스, 오류 시나리오]

...
```

#### 2. context_files (필수)

최소 포함 파일:
- `CLAUDE.md` - 프로젝트 테스트 규칙
- `.claude/docs/rule-of-make-good-test.md` - 테스트 철학
- `src/types.ts` - 타입 정의 확인
- `src/__mocks__/handlers.ts` - 기존 MSW 패턴 참고

선택 파일:
- 관련 기존 테스트 파일 (패턴 참고용)
- 테스트할 유틸/훅 파일

#### 3. references (필수)

- `agent_definition`: test-designer.md 경로
- `test_conventions`: rule-of-make-good-test.md 경로
- `project_rules`: CLAUDE.md 경로

---

## 출력 계약

### 출력 파일 경로

```
.claude/agent-docs/test-designer/logs/test-strategy.md
```

### 필수 출력 구조

```markdown
# 테스트 전략: [기능명]

## 1. 테스트 전략 개요

### 1.1 커버리지 목표

**전체 목표**: 80% 이상

**세부 목표**:
- 핵심 사용자 경로: 100%
- 비즈니스 로직 (Utils): 100%
- 커스텀 훅: 90% 이상
- UI 컴포넌트: 70% 이상

**근거**:
[왜 이 목표를 설정했는지 설명]

### 1.2 테스트 우선순위

#### P0 (필수 - 핵심 경로)
- [테스트 대상 1]: [이유]
- [테스트 대상 2]: [이유]

#### P1 (중요 - 비즈니스 로직)
- [테스트 대상 3]: [이유]

#### P2 (선택 - 엣지 케이스)
- [테스트 대상 4]: [이유]

### 1.3 예상 노력

- **총 테스트 파일**: N개
- **총 테스트 케이스**: M개
- **예상 작업 시간**: X시간

## 2. 테스트 케이스 목록

### 2.1 유틸 함수 테스트 (easy.*.spec.ts)

#### 파일: `src/__tests__/easy.[util-name].spec.ts`

**테스트 대상**: `src/utils/[util-name].ts`

**테스트 케이스**:

1. **정상 동작 - [동작 설명]**
   - **Given**: [초기 상태/입력]
   - **When**: [함수 호출]
   - **Then**: [예상 결과]
   - **입력 예시**: [구체적 입력값]
   - **출력 예시**: [구체적 출력값]

2. **경계 조건 - [경계 케이스]**
   - **Given**: [경계 입력]
   - **When**: [함수 호출]
   - **Then**: [예상 동작]
   - **입력 예시**: [경계값]
   - **출력 예시**: [예상값]

3. **오류 처리 - [오류 시나리오]**
   - **Given**: [잘못된 입력]
   - **When**: [함수 호출]
   - **Then**: [오류 처리]
   - **입력 예시**: [잘못된 값]
   - **예상 오류**: [오류 메시지]

**목킹 전략**: 없음 (순수 함수)

**예상 커버리지**: 100%

---

### 2.2 커스텀 훅 테스트 (medium.*.spec.ts)

#### 파일: `src/__tests__/medium.[hook-name].spec.ts`

**테스트 대상**: `src/hooks/[hook-name].ts`

**테스트 케이스**:

1. **초기 상태 검증**
   - **Given**: 훅 마운트
   - **When**: 초기 렌더링
   - **Then**: 초기값 확인
   - **의존성**: [필요한 Props/Context]

2. **상태 변경 동작**
   - **Given**: 초기 상태
   - **When**: 상태 변경 함수 호출
   - **Then**: 상태 업데이트 확인
   - **부수 효과**: [API 호출, 로컬 스토리지 등]

3. **API 통신 성공**
   - **Given**: MSW로 성공 응답 설정
   - **When**: API 호출 함수 실행
   - **Then**: 성공 상태 + 데이터 저장
   - **MSW 핸들러**: [필요한 핸들러]

4. **API 통신 실패**
   - **Given**: MSW로 에러 응답 설정
   - **When**: API 호출 함수 실행
   - **Then**: 에러 상태 + 에러 메시지
   - **MSW 핸들러**: [에러 핸들러]

**목킹 전략**:
- MSW로 API 모킹
- vi.mock()으로 외부 의존성 모킹 (필요 시)

**예상 커버리지**: 90%

---

### 2.3 통합 테스트 (task.*.spec.ts)

#### 파일: `src/__tests__/task.[feature-name].spec.ts`

**테스트 대상**: 전체 기능 통합

**테스트 케이스**:

1. **전체 사용자 흐름 - [시나리오 이름]**
   - **Given**: [초기 화면 상태]
   - **When**: [사용자 동작 시퀀스]
   - **Then**: [최종 결과 확인]
   - **단계**:
     1. 사용자가 [동작 1]
     2. 시스템이 [반응 1]
     3. 사용자가 [동작 2]
     4. 시스템이 [반응 2]
   - **검증 항목**:
     - [ ] UI 상태
     - [ ] API 호출 여부
     - [ ] 데이터 저장 여부

2. **엣지 케이스 - [특수 상황]**
   - **Given**: [특수한 초기 상태]
   - **When**: [특수한 동작]
   - **Then**: [예상 처리]

**목킹 전략**:
- MSW로 전체 API 모킹
- 실제 컴포넌트 사용 (가능한 모킹 최소화)

**예상 커버리지**: 80%

---

## 3. 목킹 계획

### 3.1 MSW 핸들러

#### 핸들러 파일: `src/__mocks__/handlers.ts`

**신규 핸들러**:

```typescript
// 성공 응답
http.get('/api/new-endpoint', () => {
  return HttpResponse.json({
    success: true,
    data: [/* 목 데이터 */]
  });
}),

// 에러 응답
http.post('/api/new-endpoint', () => {
  return HttpResponse.json(
    { error: '에러 메시지' },
    { status: 400 }
  );
}),
```

**목 데이터 구조**:

```typescript
// src/__mocks__/response/test-data.json
{
  "events": [
    {
      "id": "1",
      "title": "테스트 이벤트",
      "date": "2025-10-30",
      // ...
    }
  ]
}
```

### 3.2 의존성 모킹

**Date 객체 모킹** (시간 의존 테스트):

```typescript
vi.useFakeTimers();
vi.setSystemTime(new Date('2025-10-30'));

// 테스트 후 정리
vi.useRealTimers();
```

**localStorage 모킹** (필요 시):

```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;
```

### 3.3 컴포넌트 모킹 (최소화)

**원칙**: 가능하면 실제 컴포넌트 사용

**예외 (모킹 필요 시)**:
- 외부 라이브러리 컴포넌트 (복잡한 Chart 등)
- 브라우저 API 의존 컴포넌트

```typescript
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ value, onChange }: any) => (
    <input
      data-testid="mock-date-picker"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));
```

## 4. 구현 가이드

### 4.1 테스트 작성 패턴

#### GWT 패턴 템플릿

```typescript
describe('기능 그룹명 (한글)', () => {
  it('구체적인 시나리오 설명 (한글)', async () => {
    // Given - 테스트 환경 준비
    const mockData = { /* ... */ };
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json(mockData);
      })
    );

    // When - 테스트 대상 동작 실행
    const { result } = renderHook(() => useEvents());
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Then - 결과 검증
    expect(result.current.events).toEqual(mockData.events);
  });
});
```

#### 비동기 처리 패턴

```typescript
// waitFor 사용
await waitFor(() => {
  expect(screen.getByText('로딩 완료')).toBeInTheDocument();
});

// findBy 쿼리 사용 (권장)
const element = await screen.findByText('로딩 완료');
expect(element).toBeInTheDocument();

// act 경고 방지
await act(async () => {
  fireEvent.click(button);
});
```

### 4.2 흔히 발생하는 실수

#### 실수 1: 비동기 처리 누락

```typescript
// ❌ 잘못된 예
it('API 호출 테스트', () => {
  const { result } = renderHook(() => useEvents());
  expect(result.current.events).toHaveLength(3); // 아직 로딩 중!
});

// ✅ 올바른 예
it('API 호출 테스트', async () => {
  const { result } = renderHook(() => useEvents());
  await waitFor(() => {
    expect(result.current.events).toHaveLength(3);
  });
});
```

#### 실수 2: MSW 핸들러 정리 누락

```typescript
// ✅ 올바른 예
describe('테스트 그룹', () => {
  beforeEach(() => {
    server.listen(); // 서버 시작
  });

  afterEach(() => {
    server.resetHandlers(); // 핸들러 초기화 (중요!)
  });

  afterAll(() => {
    server.close(); // 서버 종료
  });
});
```

#### 실수 3: 테스트 간 상태 공유

```typescript
// ❌ 잘못된 예
let sharedState = { count: 0 };
it('테스트 1', () => {
  sharedState.count++;
});
it('테스트 2', () => {
  expect(sharedState.count).toBe(0); // 실패! count는 1
});

// ✅ 올바른 예
describe('테스트 그룹', () => {
  let state: any;

  beforeEach(() => {
    state = { count: 0 }; // 매 테스트마다 초기화
  });
});
```

### 4.3 성능 고려사항

#### 테스트 속도 최적화

1. **병렬 실행 활용**:
   - 독립적인 테스트 파일은 병렬 실행
   - Vitest는 기본적으로 병렬 실행

2. **불필요한 렌더링 제거**:
   - 순수 함수는 `renderHook` 불필요
   - 직접 함수 호출로 테스트

3. **목 데이터 최소화**:
   - 테스트에 필요한 필드만 포함
   - 대용량 데이터는 별도 파일로 분리

#### 불안정성(Flakiness) 방지

1. **타이머 모킹**:
   ```typescript
   vi.useFakeTimers();
   vi.advanceTimersByTime(1000); // 명시적 시간 제어
   ```

2. **waitFor 타임아웃 설정**:
   ```typescript
   await waitFor(
     () => expect(element).toBeInTheDocument(),
     { timeout: 5000 }
   );
   ```

3. **정확한 쿼리 사용**:
   ```typescript
   // ✅ 구체적인 쿼리
   screen.getByRole('button', { name: '저장' });

   // ❌ 애매한 쿼리
   screen.getByText(/저장/);
   ```

## 5. 우선순위 및 난이도

### 테스트 우선순위 결정 기준

**P0 (필수 - 즉시 구현):**
- 핵심 사용자 경로
- 데이터 손실 방지 관련
- 보안 관련 기능

**P1 (중요 - 이번 스프린트):**
- 비즈니스 로직
- 복잡한 계산 함수
- API 통신 로직

**P2 (선택 - 시간 여유 시):**
- UI 세부 동작
- 엣지 케이스
- 성능 테스트

### 난이도 추정

**쉬움 (easy.*.spec.ts):**
- 순수 함수
- 입출력이 명확
- 외부 의존성 없음
- 예상 작성 시간: 케이스당 5-10분

**중간 (medium.*.spec.ts):**
- 커스텀 훅
- API 통신 포함
- 상태 관리 로직
- 예상 작성 시간: 케이스당 15-30분

**복잡 (task.*.spec.ts):**
- 전체 통합 흐름
- 여러 컴포넌트 상호작용
- 복잡한 시나리오
- 예상 작성 시간: 케이스당 30-60분

---

## 검증 기준

### Phase 2 완료 조건

#### 필수 체크리스트

- ✅ **테스트 전략 명확성**
  - 커버리지 목표가 구체적으로 설정됨
  - 우선순위가 근거와 함께 정의됨
  - 예상 작업량이 현실적으로 추정됨

- ✅ **테스트 케이스 완전성**
  - 모든 핵심 동작에 테스트 케이스 존재
  - GWT 패턴이 모든 케이스에 적용됨
  - 입력/출력 예시가 구체적임
  - 엣지 케이스가 충분히 식별됨

- ✅ **목킹 전략 구체성**
  - MSW 핸들러가 명확히 정의됨
  - 목 데이터 구조가 타입과 일치함
  - 외부 의존성 모킹 방법 명시됨

- ✅ **테스트 파일 명명 규칙**
  - easy/medium/task 접두사 올바르게 사용
  - 파일명이 테스트 대상 반영
  - 규칙: `easy.[util].spec.ts`, `medium.[hook].spec.ts`, `task.[feature].spec.ts`

- ✅ **프로젝트 규칙 준수**
  - CLAUDE.md 테스트 컨벤션 준수
  - GWT 패턴 일관성
  - 한국어 테스트 설명

### 검증 명령어

```bash
# 전략 문서 존재 확인
ls -la .claude/agent-docs/test-designer/logs/test-strategy.md

# 필수 섹션 확인
grep -E "^## [0-9]\." .claude/agent-docs/test-designer/logs/test-strategy.md

# GWT 패턴 사용 확인
grep -E "(Given|When|Then)" .claude/agent-docs/test-designer/logs/test-strategy.md
```

### 품질 기준

**구체성 (Specificity)**
- ❌ "이벤트 생성을 테스트한다"
- ✅ "유효한 입력으로 이벤트 생성 시 API 호출 및 성공 알림 표시를 검증한다"

**완전성 (Completeness)**
- 모든 핵심 경로 커버
- 엣지 케이스 식별
- 에러 시나리오 포함
- 목킹 전략 완비

**실행 가능성 (Actionability)**
- 테스트 작성자가 추가 질문 없이 구현 가능
- 목 데이터가 구체적으로 정의됨
- 코드 예시 포함

**현실성 (Realism)**
- 달성 가능한 커버리지 목표
- 현실적인 작업 시간 추정
- 우선순위가 리소스와 균형

---

## Handoff 문서 형식

### Phase 2 → Phase 3 전환

Orchestrator가 다음 Handoff 문서 생성:

```yaml
---
phase: 3
agent: test-writer
timestamp: [ISO 8601]
status: ready
previous_phase: 2

inputs:
  test_strategy: .claude/agent-docs/test-designer/logs/test-strategy.md
  feature_spec: .claude/agent-docs/feature-designer/logs/spec.md
  context_files:
    - CLAUDE.md
    - src/types.ts
    - src/__mocks__/handlers.ts

references:
  agent_definition: ../../agents/test-writer.md
  test_conventions: ../../docs/rule-of-make-good-test.md

output_requirements:
  path: src/__tests__/task.[feature-name].spec.ts
  required_format: TypeScript + Vitest
  must_fail: true  # RED Phase

constraints:
  - 구현 코드 절대 작성 금지
  - 테스트는 반드시 실패해야 함
  - GWT 패턴 준수
  - 한국어 테스트 설명
  - MSW 핸들러 사용

validation_criteria:
  - 테스트 파일이 생성되었는가
  - pnpm test 실행 시 모두 실패하는가 (RED)
  - 구현 코드가 없는가
  - GWT 주석이 명확한가
---
```

---

## 격리 계약

### Test Designer가 할 수 있는 것

✅ **허용:**
- Handoff 문서 읽기
- test-designer.md 참조
- feature-designer의 spec.md 읽기
- CLAUDE.md 읽기
- 기존 테스트 파일 참고 (패턴 학습)
- logs/test-strategy.md 작성
- references/ 디렉토리에 참고 자료 저장

### Test Designer가 할 수 없는 것

❌ **금지:**
- 다른 Phase의 Handoff 문서 읽기
- Orchestrator의 전체 계획 접근
- 다른 에이전트 실행 컨텍스트 접근
- 실제 테스트 코드 작성 (Test Writer의 역할)
- 프로덕션 코드 작성 (Code Writer의 역할)
- Git 커밋 생성

### 순수 함수 원칙

```typescript
// 개념적 모델
type TestDesigner = (handoff: HandoffDoc) => TestStrategy;

// 특성
// - 동일한 Handoff + spec.md → 동일한 test-strategy.md
// - 외부 상태에 의존하지 않음
// - 부수 효과 없음 (파일 쓰기 제외)
// - 다른 에이전트와 독립적
```

---

## 에러 처리

### 입력 검증 실패

**상황:** Feature spec이 불완전함

**조치:**
1. 누락된 항목 명확히 기록
2. `references/issues-log.md`에 문제 기록
3. Orchestrator에게 보고 (출력 문서에 명시)

**예시:**
```markdown
## ⚠️ Feature Spec 불완전

### 누락 항목
- [ ] API 엔드포인트 정의 누락
- [ ] 에러 시나리오 미고려
- [ ] 타입 정의 불명확

### 필요한 정보
1. POST /api/events의 에러 응답 형식은?
2. 네트워크 실패 시 재시도 로직이 있는가?
3. EventForm 타입에 필수 필드는 무엇인가?

### 조치
Phase 1로 롤백하여 spec.md 보완 필요.
```

### 테스트 가능성 부족

**상황:** 설계가 테스트하기 어려움

**조치:**
1. 테스트 가능하도록 리팩터링 제안
2. 대안 테스트 접근법 제시
3. Feature Designer에게 피드백

**예시:**
```markdown
## 🤔 테스트 가능성 문제

### 문제
현재 설계: 컴포넌트 내부에 복잡한 로직 포함
결과: 테스트가 매우 어려움

### 제안
대안 1: 로직을 커스텀 훅으로 분리
- 장점: 단위 테스트 가능
- 단점: 추가 파일 필요

대안 2: 유틸 함수로 추출
- 장점: 완전히 독립적 테스트
- 단점: 컴포넌트 구조 변경

### 권장
대안 1 (커스텀 훅 분리)
```

### 목킹 복잡도 높음

**상황:** 의존성이 너무 많아 목킹이 복잡함

**조치:**
1. 의존성 복잡도 지적
2. 설계 개선 제안
3. 단계적 테스트 전략 수립

**예시:**
```markdown
## ⚠️ 목킹 복잡도 경고

### 문제
- 10개 이상의 외부 의존성
- 중첩된 API 호출
- 복잡한 상태 관리

### 영향
- 테스트 작성 시간: 예상 2배 증가
- 테스트 유지보수 어려움
- 불안정한 테스트 가능성

### 제안
#### 단계 1: 핵심 경로만 테스트
- 의존성 최소화
- 통합 테스트 위주

#### 단계 2: 설계 개선 (리팩터링)
- Dependency Injection 적용
- 컴포넌트 분리

### 현재 전략
단계 1로 진행, 리팩터링 후 커버리지 확대
```

---

## 작업 산출물

### 핵심 파일

```
.claude/agent-docs/test-designer/
├── logs/
│   ├── test-strategy.md           # 테스트 전략 (필수)
│   └── coverage-analysis.md       # 커버리지 분석 (선택)
│
└── references/
    ├── test-patterns.md           # 테스트 패턴 모음
    └── mocking-examples.md        # 목킹 예시
```

### test-strategy.md 템플릿

상단 [출력 계약](#출력-계약) 섹션 참조

### coverage-analysis.md 템플릿 (선택)

```markdown
# 커버리지 분석: [기능명]

작성일: [날짜]

## 현재 커버리지 (기존 코드)

```bash
$ pnpm test:coverage

File                  | % Stmts | % Branch | % Funcs | % Lines
----------------------|---------|----------|---------|--------
src/utils/dateUtils.ts|   95.2  |   88.9   |  100.0  |  94.7
src/hooks/useEvents.ts|   78.3  |   70.0   |   85.7  |  77.8
...
```

## 신규 기능 목표 커버리지

- 신규 유틸: 100%
- 신규 훅: 90%
- 신규 컴포넌트: 70%

## Gap 분석

### 기존 코드 보완 필요
- `src/utils/eventUtils.ts`: 커버리지 60% → 90% 목표
- `src/hooks/useSearch.ts`: 엣지 케이스 테스트 추가

### 신규 코드 전략
- TDD로 진행하여 100% 달성 목표
```

---

## 참고 자료

- [Test Designer 역할 정의](../../agents/test-designer.md)
- [프로젝트 규칙 (CLAUDE.md)](../../../CLAUDE.md)
- [테스트 작성 철학](../../docs/rule-of-make-good-test.md)
- [Orchestrator 계약](../orchestrator/contract.md)
- [Feature Designer 계약](../feature-designer/contract.md)

---

**마지막 업데이트**: 2025-10-30
**버전**: 1.0.0
**관련 문서**:
- [test-designer.md](../../agents/test-designer.md) - 역할 정의
- [prompt.md](./prompt.md) - 실행 매뉴얼
- [getting-started.md](./getting-started.md) - 사용자 가이드
