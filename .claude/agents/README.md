# TDD 에이전트 가이드

> **목적**: 세 에이전트 간 공통 패턴, 원칙, 가이드를 중앙 집중화하여 일관성과 유지보수성을 향상시키기

---

## 목차

1. [에이전트 개요](#에이전트-개요)
2. [작업 흐름](#작업-흐름)
3. [공통 원칙](#공통-원칙)
4. [공통 기술 가이드](#공통-기술-가이드)
5. [공통 참고 문서](#공통-참고-문서)
6. [에이전트별 역할](#에이전트별-역할)

---

## 에이전트 개요

### 0. tdd-orchestrator (TDD 워크플로우 조율자) ⭐
- **역할**: TDD 전체 사이클을 조율하고 각 단계의 품질을 검증
- **출력**: TDD 워크플로우 완료 보고서
- **파일**: `tdd-orchestrator.md`
- **색상**: purple

### 1. test-planner (테스트 설계자)
- **역할**: 기능 명세를 분석하여 "무엇을 테스트할지" 결정
- **출력**: 테스트 TODO List (설계 문서)
- **파일**: `test-planner.md`
- **색상**: cyan

### 2. test-code-implementer (테스트 코드 작성자)
- **역할**: 설계 문서를 실패하는 테스트 코드로 변환 (RED 단계)
- **출력**: 실행 가능한 실패하는 테스트 코드
- **파일**: `test-code-implementer.md`
- **색상**: red

### 3. test-driven-developer (프로덕션 코드 작성자)
- **역할**: 실패하는 테스트를 통과시키기 위한 최소 구현 (GREEN 단계)
- **출력**: 테스트를 통과하는 프로덕션 코드
- **파일**: `test-driven-developer.md`
- **색상**: green

### 4. code-refactorer (코드 리팩토링 전문가)
- **역할**: GREEN 단계 완료 후 코드 품질 개선 (REFACTOR 단계)
- **출력**: 리팩토링된 프로덕션 코드
- **파일**: `code-refactorer.md`
- **색상**: blue

---

## 작업 흐름

### 수동 모드 (개별 에이전트 실행)

```
┌─────────────────┐
│ test-planner    │ → 테스트 설계 문서 생성
│ (설계 단계)     │   reports/test-design-{feature}.md
└─────────────────┘
        ↓
┌─────────────────┐
│ test-code-      │ → 실패하는 테스트 코드 작성
│ implementer     │   src/__tests__/**/*.spec.{ts,tsx}
│ (RED 단계)      │   + 🔴 자동 커밋 (npm run tdd:red)
└─────────────────┘
        ↓
┌─────────────────┐
│ test-driven-    │ → 프로덕션 코드 구현
│ developer       │   src/utils/**, src/hooks/**, etc.
│ (GREEN 단계)    │   + 🟢 자동 커밋 (npm run tdd:green)
└─────────────────┘
        ↓
┌─────────────────┐
│ code-refactorer │ → 리팩토링 (선택사항)
│ (REFACTOR 단계) │   코드 품질 개선
│                 │   + 🔵 자동 커밋 (npm run tdd:refactor)
└─────────────────┘
```

### 자동 모드 (오케스트레이터 실행) ⭐

```
┌──────────────────────────────────────────────┐
│         tdd-orchestrator (조율자)            │
│   전체 워크플로우 관리 + 품질 게이트 검증   │
└──────────────────────────────────────────────┘
                    ↓
    ┌───────────────┴───────────────┐
    ↓               ↓               ↓
[Phase 1]      [Phase 2]       [Phase 3]       [Phase 4]
설계 검증 →    RED 검증  →    GREEN 검증 →   REFACTOR 검증
test-planner   test-code-     test-driven-    code-refactorer
               implementer    developer       (선택)
    ↓               ↓               ↓               ↓
 승인/거부       승인/거부       승인/거부       승인/거부
    ↓               ↓               ↓               ↓
                최종 완료 보고서
```

### TDD 자동 커밋 워크플로우

각 에이전트는 작업 완료 시 자동으로 해당 TDD 단계의 커밋을 실행합니다:

- **RED 단계**: `test-code-implementer`가 테스트 코드 작성 완료 후 자동 커밋
- **GREEN 단계**: `test-driven-developer`가 구현 완료 후 자동 커밋
- **REFACTOR 단계**: `test-driven-developer`가 리팩토링 완료 후 자동 커밋

상세 내용은 [TDD 워크플로우 가이드](../../docs/tdd-workflow-guide.md)를 참조하세요.

### 각 단계의 전달 정보

#### test-planner → test-code-implementer
```typescript
{
  testDesignDocument: string;  // reports/test-design-{feature}.md
  targetFiles: string[];        // 구현할 테스트 파일 목록
}
```

#### test-code-implementer → test-driven-developer
```typescript
{
  testImplementationReport: string;  // reports/test-implementation-report.md
  testFiles: string[];               // 실패한 테스트 파일 경로
  failedTests: {
    integration: string[];
    unit: string[];
  };
}
```

---

## 공통 원칙

### 1. 명세가 유일한 진실
- ✅ **명세에 명시된 것만 테스트**
- ✅ **명세에 없는 것은 절대 추가하지 않음**
- ✅ **불명확한 것은 사용자에게 질문**

**적용 범위**: 모든 에이전트

### 2. 사용자 관점
- ✅ **"사용자가 무엇을 경험하는가"로 생각**
- ❌ **"구현 세부사항이 어떻게 동작하는가"가 아님**

**예시**:
- ✅ "저장 버튼을 클릭하면 이벤트가 생성된다"
- ❌ "saveEvent 함수가 호출된다"

**적용 범위**: 모든 에이전트

### 3. 작은 단계 (Baby Steps)
- ✅ **간단한 것부터 복잡한 순서**
- ✅ **각 단계는 5~15분 단위**
- ✅ **가장 확신 있는 것부터**

**순서**:
1. Happy Path (기본 동작)
2. Validation (간단한 검증)
3. Boundary (경계값)
4. Edge Cases (특수 케이스)
5. Error Handling

**적용 범위**: test-planner, test-code-implementer, test-driven-developer

### 4. 구현과 분리
- ✅ **"무엇을" 테스트할지만 결정 (설계)**
- ✅ **"어떻게"는 구현자의 몫 (코드)**

**예시**:
- 설계자: "제목 검증이 필요하다" (무엇)
- 구현자: "toBe(), toHaveLength() 사용" (어떻게)

**적용 범위**: test-planner (설계만)

### 5. 테스트가 유일한 진실 (GREEN 단계)
- ✅ **테스트가 요구하는 것만 구현**
- ❌ **테스트에 없는 기능 추가 금지**
- ❌ **과도한 추상화 금지 (YAGNI)**

**적용 범위**: test-driven-developer

---

## 공통 기술 가이드

### 1. React Testing Library 쿼리 우선순위

**우선순위** (접근성 및 안정성 기준):

```typescript
// 1. getByRole (최우선) - 접근성 기준
screen.getByRole('button', { name: /save/i });
screen.getByRole('textbox', { name: /title/i });
screen.getByRole('combobox', { name: /repeat/i });

// 2. getByLabelText (폼 요소)
screen.getByLabelText(/repeat type/i);
screen.getByLabelText(/title/i);

// 3. getByPlaceholderText
screen.getByPlaceholderText(/enter title/i);

// 4. getByText
screen.getByText(/daily meeting/i);

// 5. getByTestId (최후의 수단)
screen.getByTestId('recurring-icon');
```

**절대 금지**:
```typescript
// ❌ 절대 금지
document.querySelector('.button');
document.getElementById('submit');
container.querySelector('[data-testid="button"]');
```

**적용 범위**: test-code-implementer, test-driven-developer

---

### 2. AAA 패턴 (Arrange-Act-Assert)

**구조**:
```typescript
it('should create recurring event when form submitted', async () => {
  expect.hasAssertions(); // 비동기 테스트 필수

  // ===== ARRANGE (준비) =====
  const user = userEvent.setup();
  render(<EventForm />);

  // ===== ACT (실행) =====
  await user.type(screen.getByLabelText(/title/i), 'Daily Meeting');
  await user.selectOptions(screen.getByLabelText(/repeat/i), 'daily');
  await user.click(screen.getByRole('button', { name: /save/i }));

  // ===== ASSERT (검증) =====
  expect(await screen.findByText('Daily Meeting')).toBeInTheDocument();
  expect(screen.getAllByText('Daily Meeting')).toHaveLength(7);
});
```

**적용 범위**: test-code-implementer

---

### 3. MSW Handler 활용

**원칙**: 모킹 대신 MSW Handler 사용

#### 기본 패턴
```typescript
// ✅ GOOD: 실제 API 호출 (MSW가 자동으로 가로챔)
export async function fetchEvents(): Promise<Event[]> {
  const response = await fetch('/api/events');
  const data = await response.json();
  return data.events;
}
```

#### 특정 테스트에서 다른 응답 필요 시
```typescript
it('should handle API error', async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    })
  );

  render(<EventList />);
  expect(await screen.findByText('Failed to load')).toBeInTheDocument();
});
```

#### 절대 사용하지 말 것
```typescript
// ❌ 절대 금지
vi.mock('@/api/events', () => ({
  fetchEvents: vi.fn(() => Promise.resolve([...])),
}));
```

**적용 범위**: test-code-implementer, test-driven-developer

---

### 4. 비동기 처리

**원칙**:
- ✅ `userEvent` 호출 시 항상 `await` 사용
- ✅ `findBy` 또는 `waitFor` 사용
- ❌ `setTimeout` 절대 금지

```typescript
// ✅ GOOD
await user.click(button);
await user.type(input, 'text');
const element = await screen.findByText('Loaded');

await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});

// ❌ BAD
setTimeout(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
}, 1000);
```

**적용 범위**: test-code-implementer

---

### 5. Kent Beck TDD 전략

#### Baby Steps (작은 단계)
```typescript
// 가장 간단한 구현부터
export function generateRecurringEvents(eventForm: EventForm): EventForm[] {
  if (repeat.type === 'none') {
    return [eventForm]; // 가장 간단한 케이스
  }
  return [];
}
```

#### Triangulation (삼각측량)
```typescript
// 2~3개의 유사한 테스트가 통과하면 일반화
it('3일간 매일', () => { ... });
it('7일간 매일', () => { ... });
// → 일반화된 구현 필요
```

#### Fake It Till You Make It
```typescript
// 처음에는 하드코딩
function generateDailyEvents(): EventForm[] {
  return [
    { date: '2025-01-01' },
    { date: '2025-01-02' },
    { date: '2025-01-03' }
  ];
}
// 나중에 일반화
```

#### Obvious Implementation (명확한 구현)
```typescript
// 구현이 명확하면 바로 작성
function isLeapYear(year: number): boolean {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  if (year % 4 === 0) return true;
  return false;
}
```

**적용 범위**: test-driven-developer

---

## 공통 참고 문서

모든 에이전트가 참조하는 표준 문서:

### 필수 문서
- `docs/specification.md` - 기능 명세 (요구사항, 제약사항)
- `docs/kent-beck-tdd-philosophy.md` - TDD 철학 및 방법론
- `docs/test-code-rules.md` - 테스트 작성 규칙
- `docs/react-testing-library-best-practices.md` - RTL 가이드

### 선택 문서
- `docs/template/test-specific.md` - 테스트 설계 문서 템플릿

### 프로젝트 파일
- `src/types.ts` - TypeScript 타입 정의
- `src/__mocks__/handlers.ts` - MSW 핸들러
- `src/__mocks__/response/*.json` - Mock 데이터
- `src/__tests__/**/*.spec.{ts,tsx}` - 기존 테스트 파일 (패턴 참고)

---

## 에이전트별 역할

### test-planner

**하는 것**:
- ✅ 명세 분석
- ✅ TODO List 작성
- ✅ Coverage Map 작성
- ✅ 테스트 설계 문서 생성

**하지 않는 것**:
- ❌ 테스트 코드 작성
- ❌ 프로덕션 코드 작성
- ❌ 명세에 없는 내용 추가

### test-code-implementer

**하는 것**:
- ✅ 설계 문서를 테스트 코드로 변환
- ✅ Red 단계 테스트 작성 (실패하는 테스트)
- ✅ AAA 패턴 준수
- ✅ 공통 작업 beforeEach로 추출

**하지 않는 것**:
- ❌ 프로덕션 코드 작성
- ❌ Green/Refactor 단계
- ❌ 새로운 테스트 케이스 추가
- ❌ 설계 문서에 없는 내용 테스트

### test-driven-developer

**하는 것**:
- ✅ 실패하는 테스트를 통과시키는 최소 구현
- ✅ Baby Steps 전략
- ✅ 테스트가 요구하는 것만 구현

**하지 않는 것**:
- ❌ 테스트 코드 수정 (버그 제외)
- ❌ 새로운 테스트 추가
- ❌ 과도한 추상화
- ❌ 성능 최적화 (테스트가 요구하지 않으면)
- ❌ 리팩토링 (Refactor 단계에서)

---

## 체크리스트

### 공통 체크리스트
- [ ] 명세에 있는 내용만 작업
- [ ] 사용자 관점으로 작성
- [ ] 작은 단계로 진행
- [ ] TypeScript/ESLint 에러 없음
- [ ] 참고 문서 확인

### test-planner 체크리스트
- [ ] TODO List가 명세 기준으로 작성됨
- [ ] 우선순위가 명확함 (Critical → High → Medium)
- [ ] Coverage Map 100%

### test-code-implementer 체크리스트
- [ ] 설계 문서의 TODO만 구현
- [ ] 쿼리 우선순위 준수
- [ ] AAA 패턴 준수
- [ ] MSW Handler 사용
- [ ] 모든 테스트가 실패함 (Red 단계 확인)

### test-driven-developer 체크리스트
- [ ] 테스트가 요구하는 것만 구현
- [ ] 모든 테스트 통과
- [ ] Baby Steps 전략 사용
- [ ] 기존 테스트 영향 없음

---

## 문서 업데이트 가이드

### 중복 제거 원칙
1. **공통 내용은 이 문서에 작성**
2. **에이전트별 특수 내용만 개별 문서에 유지**
3. **변경 시 이 문서를 먼저 업데이트**

### 문서 구조
```
.claude/agents/
├── README.md (이 문서 - 공통 가이드)
├── test-planner.md (설계 전용)
├── test-code-implementer.md (RED 단계 전용)
└── test-driven-developer.md (GREEN 단계 전용)
```

---

**마지막 업데이트**: 2025-01-XX  
**버전**: 1.0.0  
**유지보수**: 공통 내용 변경 시 이 문서를 먼저 업데이트할 것

