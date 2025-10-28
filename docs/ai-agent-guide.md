# AI 테스트 에이전트 구축 가이드

## 개요

이 프로젝트는 TDD(Test-Driven Development) 워크플로우를 자동화하는 6개의 AI 에이전트를 구축한 것입니다. 각 에이전트는 특정 역할을 담당하며, 오케스트레이터 에이전트가 전체 워크플로우를 관리합니다.

## 에이전트 구조

### 1. Orchestrator Agent (오케스트레이터)

- **파일**: `orchestrator.js`
- **역할**: 전체 TDD 워크플로우 관리 및 각 단계별 에이전트 조율
- **주요 기능**:
  - RED → GREEN → REFACTOR 사이클 실행
  - 각 단계별 에이전트 호출
  - 단계별 커밋 관리
  - 테스트 실행 및 결과 검증

### 2. Feature Design Agent (기능 설계)

- **파일**: `agents/feature-design-agent.js`
- **역할**: 기능 요구사항을 구체적이고 명확한 명세로 변환
- **주요 기능**:
  - 요구사항 분석 및 복잡도 평가
  - API 설계 및 컴포넌트 설계
  - 마크다운 형식의 상세한 기능 명세서 작성

### 3. Test Design Agent (테스트 설계)

- **파일**: `agents/test-design-agent.js`
- **역할**: 기능 명세를 바탕으로 포괄적이고 체계적인 테스트 케이스 설계
- **주요 기능**:
  - 테스트 케이스 설계 (단위, 통합, E2E)
  - 테스트 데이터 및 모킹 전략 수립
  - 테스트 우선순위 설정

### 4. Test Writing Agent (테스트 작성)

- **파일**: `agents/test-writing-agent.js`
- **역할**: 테스트 설계를 바탕으로 실제 테스트 코드 작성
- **주요 기능**:
  - Vitest + React Testing Library 기반 테스트 코드 생성
  - Given-When-Then 패턴 적용
  - MSW를 활용한 API 모킹

### 5. Code Writing Agent (코드 작성)

- **파일**: `agents/code-writing-agent.js`
- **역할**: 테스트 코드를 바탕으로 실제 구현 코드 작성
- **주요 기능**:
  - 실패하는 테스트를 통과시키는 최소한의 코드 작성
  - React Hook 및 컴포넌트 구현
  - TypeScript 타입 안전성 보장

### 6. Refactoring Agent (리팩토링)

- **파일**: `agents/refactoring-agent.js`
- **역할**: 구현된 코드의 품질을 개선하고 최적화
- **주요 기능**:
  - 성능 최적화 (useCallback, useMemo, React.memo)
  - 코드 품질 개선 (함수 분리, 네이밍 개선)
  - 접근성 향상 (ARIA 속성 추가)

## 사용법

### 기본 TDD 사이클 실행

```bash
# 전체 TDD 사이클 실행
node orchestrator.js --feature="반복 일정 수정"

# 특정 단계만 실행
node orchestrator.js --step="test-design" --feature="반복 일정 수정"

# 커밋 메시지와 함께 실행
node orchestrator.js --feature="반복 일정 수정" --commit-message="feat: 반복 일정 수정 기능 추가"
```

### 개별 에이전트 실행

```bash
# 기능 설계 에이전트
node agents/feature-design-agent.js --feature="반복 일정 수정" --output="feature-spec.md"

# 테스트 설계 에이전트
node agents/test-design-agent.js --spec="feature-spec.md" --output="test-design.md"

# 테스트 작성 에이전트
node agents/test-writing-agent.js --design="test-design.md" --target="useRecurringEventOperations.spec.ts"

# 코드 작성 에이전트
node agents/code-writing-agent.js --test="useRecurringEventOperations.spec.ts" --target="useRecurringEventOperations.ts"

# 리팩토링 에이전트
node agents/refactoring-agent.js --target="useRecurringEventOperations.ts,RecurringEventDialog.tsx" --goals="performance,readability"
```

## TDD 워크플로우

### 1. Feature Design 단계

- 기능 요구사항 분석
- 상세한 기능 명세서 작성
- API 및 컴포넌트 설계

### 2. Test Design 단계

- 테스트 케이스 설계
- 테스트 데이터 및 모킹 전략 수립
- 테스트 우선순위 설정

### 3. Test Writing 단계 (RED)

- 실패하는 테스트 코드 작성
- 모든 테스트가 RED 상태인지 확인
- 테스트 코드 검증

### 4. Code Writing 단계 (GREEN)

- 테스트를 통과시키는 최소한의 코드 작성
- 모든 테스트가 GREEN 상태인지 확인
- 구현 코드 검증

### 5. Refactoring 단계

- 코드 품질 개선
- 성능 최적화
- 접근성 향상
- 모든 테스트가 여전히 통과하는지 확인

## 설정

### 환경 변수

```bash
export GIT_AUTHOR_NAME="Your Name"
export GIT_AUTHOR_EMAIL="your.email@example.com"
export AI_MODEL="gpt-4"  # 사용할 AI 모델
```

### 설정 파일

`orchestrator.config.json`에서 세부 설정을 관리할 수 있습니다.

## 반복 일정 수정 기능 구현 예시

### 기능 명세

```markdown
# 반복 일정 수정 기능 명세

## 개요

기존 반복 일정을 수정할 때 사용자가 단일 일정만 수정할지, 전체 반복 일정을 수정할지 선택할 수 있는 기능

## 시나리오

### 시나리오 1: 단일 일정 수정

- 사용자가 반복 일정 중 하나를 수정하려고 할 때
- "해당 일정만 수정하시겠어요?" 확인 다이얼로그 표시
- "예" 선택 시: 해당 일정만 수정되고 반복 일정에서 제외
- 반복 일정 아이콘 제거

### 시나리오 2: 전체 반복 일정 수정

- "아니오" 선택 시: 전체 반복 일정 수정
- 반복 일정 아이콘 유지
- 모든 관련 일정에 변경사항 적용
```

### 테스트 케이스

```typescript
describe('useRecurringEventOperations', () => {
  it('단일 수정 선택 시 해당 일정만 수정되어야 한다', async () => {
    // Given: 반복 일정이 존재하는 상태
    // When: 단일 수정 실행
    // Then: 해당 일정만 수정되고 반복 일정에서 제외되어야 함
  });

  it('전체 수정 선택 시 모든 관련 일정이 수정되어야 한다', async () => {
    // Given: 반복 일정이 존재하는 상태
    // When: 전체 수정 실행
    // Then: 모든 관련 일정이 수정되어야 함
  });
});
```

### 구현 코드

```typescript
export const useRecurringEventOperations = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const editSingleEvent = useCallback(
    async (eventId: string, updates: Partial<EventForm>) => {
      // 단일 일정 수정 로직
    },
    [enqueueSnackbar]
  );

  const editRecurringEvent = useCallback(
    async (eventId: string, updates: Partial<EventForm>) => {
      // 반복 일정 수정 로직
    },
    [enqueueSnackbar]
  );

  return { events, editSingleEvent, editRecurringEvent };
};
```

## 검증 기준

### 공통 제출

- [x] 테스트를 잘 작성할 수 있는 규칙 명세
- [ ] 명세에 있는 기능을 구현하기 위한 테스트를 모두 작성하고 올바르게 구현했는지
- [ ] 명세에 있는 기능을 모두 올바르게 구현하고 잘 동작하는지

### 기본과제(HARD)

- [x] Agent 구현 명세 문서 또는 코드
- [ ] 커밋별 올바르게 단계에 대한 작업
- [ ] 결과를 올바로 얻기위한 history 또는 log
- [ ] AI 도구 활용을 개선하기 위해 노력한 점 PR에 작성

## AI 도구 활용 개선점

### 1. 프롬프트 최적화

- 명확하고 구체적인 지시사항 제공
- 컨텍스트 정보 충분히 포함
- 예시와 함께 요구사항 설명

### 2. 에이전트 특화

- 각 에이전트의 역할과 책임 명확히 정의
- 에이전트 간 인터페이스 표준화
- 에러 처리 및 복구 로직 구현

### 3. 품질 관리

- 각 단계별 결과물 검증
- 자동화된 테스트 실행
- 코드 품질 기준 적용

### 4. 워크플로우 최적화

- 병렬 처리 가능한 작업 식별
- 불필요한 단계 제거
- 피드백 루프 개선

## 트러블슈팅

### 자주 발생하는 문제

1. **테스트 실패**

   - 테스트 코드와 구현 코드 간 불일치 확인
   - Mock 데이터 정확성 검증
   - 비동기 처리 로직 확인

2. **에이전트 실행 실패**

   - 입력 데이터 형식 확인
   - 파일 경로 정확성 검증
   - 권한 문제 확인

3. **커밋 실패**
   - Git 설정 확인
   - 변경사항 존재 여부 확인
   - 네트워크 연결 상태 확인

### 로그 확인

```bash
# 상세 로그와 함께 실행
node orchestrator.js --feature="반복 일정 수정" --verbose

# 특정 에이전트 로그 확인
node agents/feature-design-agent.js --feature="반복 일정 수정" --verbose
```

## 확장 가능성

### 추가 에이전트

- **Documentation Agent**: 자동 문서 생성
- **Performance Agent**: 성능 테스트 및 최적화
- **Security Agent**: 보안 취약점 검사

### 통합 가능한 도구

- **CI/CD 파이프라인**: 자동화된 배포
- **코드 리뷰 도구**: 자동 코드 리뷰
- **모니터링 도구**: 런타임 모니터링

이 가이드를 따라하면 AI를 활용한 TDD 워크플로우를 성공적으로 구축하고 운영할 수 있습니다.
