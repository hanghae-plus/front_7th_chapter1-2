# Test Designer Agent Output Template

**버전:** 1.0.0
**생성일:** 2025-01-29
**목적:** Test Designer 에이전트의 산출물 형식 및 구조 정의

---

## 산출물 개요

Test Designer 에이전트는 **테스트 시나리오 문서**를 주요 산출물로 생성한다.

### 파일 정보
- **파일명**: `test-scenarios.md`
- **경로**: `.claude/outputs/{project-id}-{YYYYMMDD}/stories/{story-id}/test-scenarios.md`
- **예시**: `.claude/outputs/PROJ-001-20250129/stories/PROJ-007/test-scenarios.md`
- **티켓**: Story 티켓 번호와 동일 (예: PROJ-007)
- **목적**: Test Writer가 테스트 코드를 작성할 수 있는 구체적인 테스트 시나리오 제공

---

## 테스트 시나리오 문서 템플릿

```markdown
# 테스트 시나리오: {Story ID} - {Story 제목}

**Story ID**: {PROJ-XXX}
**Epic**: {Epic-X} - {Epic 이름}
**버전**: 1.0.0
**작성일**: YYYY-MM-DD
**작성자**: Test Designer Agent
**티켓**: {PROJ-XXX}

---

## 1. 테스트 개요

### 1.1 Story 요약

**제목**: {Story 제목}

**Acceptance Criteria** (참조):
- [ ] {AC 1}
- [ ] {AC 2}

**참조**:
- **Story 상세 명세**: `.claude/outputs/{project-id}/stories/{story-id}/story-detail.md`
- **Architecture**: `.claude/outputs/{project-id}/architecture.md` (섹션 {X})
- **UX Design**: `.claude/outputs/{project-id}/ux-design.md` (섹션 {Y})

### 1.2 테스트 목표

**주요 테스트 목표**:
- {목표 1: 예: 반복 유형 드롭다운이 정상 작동하는지 검증}
- {목표 2: 예: 조건부 렌더링이 올바르게 동작하는지 검증}

**테스트 범위**:
- **단위 테스트**: {대상 컴포넌트 및 함수}
- **통합 테스트**: {통합 포인트}

**테스트 커버리지 목표**: 70% 이상

---

## 2. 단위 테스트 시나리오

### 2.1 컴포넌트 테스트

#### 2.1.1 {ComponentName} 컴포넌트

**테스트 대상**: `src/.../ComponentName.tsx`

**Scenario 1: 기본 렌더링**

- **Given**: ComponentName이 기본 Props로 마운트됨
- **When**: 컴포넌트가 렌더링됨
- **Then**:
  - [ ] 컴포넌트가 DOM에 표시됨
  - [ ] 기본 Props 값이 올바르게 렌더링됨
  - [ ] 필수 요소(버튼, 입력 필드 등)가 모두 표시됨

**우선순위**: High

**테스트 데이터**:
```typescript
{
  prop1: 'default value',
  prop2: false,
}
```

---

**Scenario 2: Props 변경 시 리렌더링**

- **Given**: ComponentName이 렌더링됨
- **When**: Props가 업데이트됨
- **Then**:
  - [ ] 새로운 Props 값이 반영됨
  - [ ] 올바른 요소가 리렌더링됨

**우선순위**: High

**테스트 데이터**:
```typescript
// 초기 Props
{ value: 'initial' }
// 업데이트된 Props
{ value: 'updated' }
```

---

**Scenario 3: 사용자 인터랙션 - {Action}**

- **Given**: ComponentName이 렌더링됨
- **When**: 사용자가 {버튼을 클릭함 / 입력 필드에 입력함 / 드롭다운을 선택함}
- **Then**:
  - [ ] onChange 콜백이 올바른 인자와 함께 호출됨
  - [ ] 상태가 업데이트됨 (해당 시)
  - [ ] UI가 적절히 변경됨

**우선순위**: High

**테스트 데이터**:
```typescript
{
  onChange: vi.fn(),  // Mock 함수
  initialValue: 'test',
}
```

**Mocking 전략**:
- `onChange` 콜백을 `vi.fn()`으로 Mocking
- 호출 횟수 및 인자 검증: `expect(onChange).toHaveBeenCalledWith('expected value')`

---

**Scenario 4: 조건부 렌더링**

- **Given**: ComponentName이 특정 조건의 Props로 렌더링됨
- **When**: 조건이 {true / false}일 때
- **Then**:
  - [ ] 조건이 true일 때 {요소}가 표시됨
  - [ ] 조건이 false일 때 {요소}가 숨겨짐

**우선순위**: High

**테스트 데이터**:
```typescript
// 조건 true
{ showElement: true }
// 조건 false
{ showElement: false }
```

---

**Scenario 5: 엣지 케이스 - {케이스명}**

- **Given**: ComponentName이 {빈 값 / null / undefined} Props로 렌더링됨
- **When**: 엣지 케이스 Props가 전달됨
- **Then**:
  - [ ] 에러가 발생하지 않음
  - [ ] 기본값 또는 폴백 UI가 표시됨

**우선순위**: Medium

**테스트 데이터**:
```typescript
{ value: null }
{ value: undefined }
{ value: '' }
```

---

**Scenario 6: 에러 케이스 - {에러 상황}**

- **Given**: ComponentName이 렌더링됨
- **When**: {유효하지 않은 입력 / 에러 발생 조건}
- **Then**:
  - [ ] 에러 메시지가 표시됨
  - [ ] 에러 상태가 올바르게 설정됨

**우선순위**: Medium

**테스트 데이터**:
```typescript
{ value: 'invalid' }
```

---

#### 2.1.2 {AnotherComponentName} 컴포넌트

{위와 동일한 형식으로 작성}

---

### 2.2 함수 테스트

#### 2.2.1 {functionName} 함수

**테스트 대상**: `src/.../utils.ts`의 `functionName` 함수

**Scenario 1: 정상 케이스**

- **Given**: 유효한 입력 값이 제공됨
- **When**: functionName이 호출됨
- **Then**:
  - [ ] 올바른 출력 값이 반환됨
  - [ ] 부수 효과가 없음 (순수 함수)

**우선순위**: High

**테스트 데이터**:
```typescript
// 입력
{ input: 'test', options: { flag: true } }
// 예상 출력
{ output: 'processed test' }
```

---

**Scenario 2: 엣지 케이스**

- **Given**: {빈 배열 / 빈 문자열 / 0 / null}이 입력으로 제공됨
- **When**: functionName이 호출됨
- **Then**:
  - [ ] 에러가 발생하지 않음
  - [ ] 적절한 기본값 또는 빈 값이 반환됨

**우선순위**: Medium

**테스트 데이터**:
```typescript
{ input: [] }  // 빈 배열
{ input: '' }  // 빈 문자열
{ input: null }
```

---

**Scenario 3: 에러 케이스**

- **Given**: 유효하지 않은 입력이 제공됨
- **When**: functionName이 호출됨
- **Then**:
  - [ ] 적절한 에러가 발생함
  - [ ] 에러 메시지가 명확함

**우선순위**: High

**테스트 데이터**:
```typescript
{ input: 'invalid format' }
```

---

### 2.3 Hook 테스트

#### 2.3.1 {useHookName} Hook

**테스트 대상**: `src/.../hooks/useHookName.ts`

**Scenario 1: 초기 상태**

- **Given**: Hook이 마운트됨
- **When**: Hook이 호출됨
- **Then**:
  - [ ] 초기 상태 값이 올바름
  - [ ] 필요한 함수가 반환됨

**우선순위**: High

**테스트 데이터**:
```typescript
// Hook 인자
{ initialValue: 'test' }
```

---

**Scenario 2: 상태 업데이트**

- **Given**: Hook이 마운트됨
- **When**: 상태 업데이트 함수가 호출됨
- **Then**:
  - [ ] 상태가 올바르게 업데이트됨
  - [ ] 리렌더링이 발생함

**우선순위**: High

---

**Scenario 3: 의존성 변경 시 재실행**

- **Given**: Hook이 의존성 배열과 함께 사용됨
- **When**: 의존성이 변경됨
- **Then**:
  - [ ] useEffect/useMemo가 재실행됨
  - [ ] 올바른 값이 계산됨

**우선순위**: Medium

**Mocking 전략**:
- `renderHook`의 `rerender` 사용하여 의존성 변경 시뮬레이션

---

## 3. 통합 테스트 시나리오

### 3.1 컴포넌트 통합 테스트

#### 3.1.1 {ParentComponent} ↔ {ChildComponent}

**통합 포인트**: Props 전달 및 콜백 호출

**Scenario 1: 부모-자식 데이터 전달**

- **Given**: ParentComponent가 ChildComponent를 렌더링함
- **When**: ParentComponent의 상태가 변경됨
- **Then**:
  - [ ] ChildComponent가 새로운 Props를 받음
  - [ ] ChildComponent가 올바르게 리렌더링됨

**우선순위**: High

**테스트 데이터**:
```typescript
// Parent 상태
{ parentState: 'initial' }
// Child에 전달되는 Props
{ childProp: 'initial' }
```

---

**Scenario 2: 자식 콜백 → 부모 상태 업데이트**

- **Given**: ChildComponent가 onChange 콜백을 받음
- **When**: ChildComponent가 onChange를 호출함
- **Then**:
  - [ ] ParentComponent의 상태가 업데이트됨
  - [ ] ParentComponent가 리렌더링됨

**우선순위**: High

---

### 3.2 전역 상태 통합 테스트

#### 3.2.1 {Component} ↔ Zustand Store

**통합 포인트**: 전역 상태 읽기/쓰기

**Scenario 1: 전역 상태 읽기**

- **Given**: Component가 Zustand 스토어를 구독함
- **When**: Component가 렌더링됨
- **Then**:
  - [ ] 스토어의 현재 상태를 읽음
  - [ ] 상태가 올바르게 표시됨

**우선순위**: High

**Mocking 전략**:
- Zustand 스토어를 테스트용 초기 상태로 설정
- `create` 함수를 Mocking하여 테스트 격리

---

**Scenario 2: 전역 상태 업데이트**

- **Given**: Component가 스토어의 액션을 호출함
- **When**: 액션이 실행됨
- **Then**:
  - [ ] 스토어 상태가 업데이트됨
  - [ ] Component가 새로운 상태를 받음

**우선순위**: High

---

### 3.3 사용자 플로우 테스트

#### 3.3.1 전체 플로우: {플로우명}

**Scenario: {사용자 시나리오 제목}**

- **Given**: {초기 상태}
- **When**:
  1. 사용자가 {액션 1}을 수행함
  2. 사용자가 {액션 2}를 수행함
  3. 사용자가 {액션 3}을 수행함
- **Then**:
  - [ ] {결과 1}
  - [ ] {결과 2}
  - [ ] {최종 상태}

**우선순위**: High

**예시**:
- **Given**: 일정 생성 폼이 열림
- **When**:
  1. 사용자가 제목 입력 필드에 "주간 회의" 입력
  2. 사용자가 반복 유형 드롭다운에서 "매주" 선택
  3. 사용자가 "저장" 버튼 클릭
- **Then**:
  - [ ] 종료 날짜 필드가 Slide down으로 나타남
  - [ ] "저장" 버튼이 활성화됨
  - [ ] 폼 제출 시 올바른 데이터가 전달됨

---

## 4. 테스트 데이터 명세

### 4.1 Mock 데이터

#### 4.1.1 컴포넌트 Props Mock

```typescript
// {ComponentName} Props Mock
export const mockComponentProps = {
  value: 'test',
  onChange: vi.fn(),
  disabled: false,
};
```

#### 4.1.2 API 응답 Mock

```typescript
// API 응답 Mock (해당 시)
export const mockApiResponse = {
  data: {
    id: '1',
    title: 'Test Event',
  },
  status: 200,
};
```

#### 4.1.3 Zustand 스토어 Mock

```typescript
// 스토어 초기 상태 Mock
export const mockStoreState = {
  events: [],
  currentMonth: new Date('2025-01-29'),
};
```

### 4.2 테스트 픽스처

#### 4.2.1 Setup 함수

```typescript
// 재사용 가능한 Setup 함수
function setupComponent(props = {}) {
  const defaultProps = mockComponentProps;
  return render(<Component {...defaultProps} {...props} />);
}
```

#### 4.2.2 Teardown

- 각 테스트 후 DOM 클린업 (React Testing Library 자동 처리)
- Mock 함수 리셋: `vi.clearAllMocks()`

---

## 5. Mocking 전략

### 5.1 함수 Mocking

**Mocking 대상**:
- 이벤트 핸들러 콜백: `vi.fn()`
- 외부 의존성 함수: `vi.spyOn()` 또는 `vi.mock()`

**예시**:
```typescript
const mockOnChange = vi.fn();
// 호출 검증
expect(mockOnChange).toHaveBeenCalledWith('expected value');
expect(mockOnChange).toHaveBeenCalledTimes(1);
```

### 5.2 모듈 Mocking

**Mocking 대상**:
- 외부 라이브러리: `vi.mock('library-name')`
- 유틸 함수: `vi.mock('@/utils/functionName')`

**예시**:
```typescript
vi.mock('date-fns', () => ({
  format: vi.fn(() => '2025-01-29'),
}));
```

### 5.3 날짜/시간 Mocking

**Mocking 방법**:
- `vi.useFakeTimers()` 사용
- 특정 날짜로 고정: `vi.setSystemTime(new Date('2025-01-29'))`

**예시**:
```typescript
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-01-29'));
});

afterEach(() => {
  vi.useRealTimers();
});
```

### 5.4 API Mocking

**Mocking 방법**:
- MSW (Mock Service Worker) 사용 (권장)
- 또는 `vi.mock()` 사용

**예시 (MSW)**:
```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/events', (req, res, ctx) => {
    return res(ctx.json(mockApiResponse));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 6. 테스트 우선순위

### High Priority
- 핵심 기능 테스트 (Acceptance Criteria 직접 연관)
- 사용자 인터랙션 테스트
- 통합 포인트 테스트

### Medium Priority
- 엣지 케이스 테스트
- 조건부 렌더링 세부 테스트
- Hook 의존성 테스트

### Low Priority
- UI 스타일 테스트 (스냅샷 테스트)
- 성능 테스트 (별도로 수행)

---

## 7. 접근성 테스트 시나리오

### 7.1 키보드 네비게이션

**Scenario: Tab 키로 포커스 이동**

- **Given**: 컴포넌트가 렌더링됨
- **When**: Tab 키를 누름
- **Then**:
  - [ ] 포커스가 올바른 순서로 이동함
  - [ ] 포커스 표시가 명확히 보임

**테스트 방법**: `userEvent.tab()` 사용

---

### 7.2 스크린 리더 지원

**Scenario: ARIA 레이블 확인**

- **Given**: 컴포넌트가 렌더링됨
- **When**: 스크린 리더가 요소를 읽음
- **Then**:
  - [ ] `aria-label` 또는 `aria-labelledby`가 존재함
  - [ ] 레이블 텍스트가 명확함

**테스트 방법**: `getByRole()`, `getByLabelText()` 사용

---

## 8. 참조 및 연결

### 8.1 Story 상세 명세 참조

- **섹션 {X}**: {참조 내용}
- Story Refiner가 작성한 테스트 가이드 참조

### 8.2 Architecture 참조

- **섹션 {X}**: 테스트 프레임워크 (Vitest, React Testing Library)
- **섹션 {Y}**: 테스트 디렉토리 구조
- **섹션 {Z}**: 테스트 커버리지 목표 (70%)

### 8.3 UX Design 참조

- **섹션 {X}**: 사용자 인터랙션
- **섹션 {Y}**: 접근성 요구사항

---

## 9. 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | YYYY-MM-DD | Test Designer | 초안 작성 |

---

**다음 단계**: Test Writer가 이 시나리오를 기반으로 실패하는 테스트 코드 작성 (Red 단계)
```

---

## 출력 위치 및 파일 관리

### 디렉토리 구조

```
.claude/outputs/
└── {project-id}-{YYYYMMDD}/
    └── stories/
        └── {story-id}/
            ├── story-detail.md          # Story Refiner
            └── test-scenarios.md        # Test Designer
```

### 파일 경로 규칙

- **테스트 시나리오**: `.claude/outputs/{project-id}/stories/{story-id}/test-scenarios.md`
- **예시**: `.claude/outputs/PROJ-001-20250129/stories/PROJ-007/test-scenarios.md`

### 티켓 번호

- Story 티켓 번호와 동일 (예: PROJ-007)

---

## 주요 원칙

### 구체성 원칙
- Given-When-Then 형식으로 명확히 작성
- 측정 가능한 검증 조건
- 테스트 데이터 명시

### 완전성 원칙
- 정상, 엣지, 에러 케이스 모두 포함
- 단위 및 통합 테스트 범위 정의
- Mocking 전략 명시

### 독립성 원칙
- 각 테스트는 독립적으로 실행 가능
- 테스트 간 의존성 최소화
- Setup/Teardown 명확히 정의

### 실용성 원칙
- 실제로 작성 가능한 시나리오
- 테스트 도구 제약사항 고려
- 우선순위 설정으로 효율성 확보

---

**이 템플릿은 Test Designer 에이전트가 산출물을 생성할 때 반드시 따라야 하는 표준 형식이다.**
