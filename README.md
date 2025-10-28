# AI 테스트 에이전트 구축 프로젝트

## 프로젝트 개요

이 프로젝트는 TDD(Test-Driven Development) 워크플로우를 자동화하는 AI 에이전트들을 구축한 것입니다. 각 에이전트는 특정 역할을 담당하며, 공식 문서 기반으로 완전한 코드를 자동 생성합니다.

## 🚀 최신 업데이트 (v2.0)

### ✅ Agent 구조 개선 및 완전 재구현

- **파일 구조 재구조화**: 가시성 좋은 계층적 구조로 개선
- **Test Writing Agent 완전 재구현**: 공식 문서 기반 완전한 테스트 코드 생성
- **Code Writing Agent 완전 재구현**: 테스트 기반 TypeScript 구현 코드 생성
- **Refactoring Agent 구현**: 코드 품질 분석 및 자동 최적화
- **공식 문서 추가**: 완전한 테스트 작성 가이드라인

### 📁 새로운 파일 구조

```
agents/
├── core/                    # 핵심 Agent들 (검증된 기능)
│   ├── specification-analysis-agent.js
│   └── true-tdd-agent.js
├── improved/               # 개선된 Agent들 (최신 기능)
│   ├── improved-test-writing-agent.js
│   ├── improved-code-writing-agent.js
│   └── improved-refactoring-agent.js
└── legacy/                 # 기존 Agent들 (참고용)
    ├── test-writing-agent.js
    ├── code-writing-agent.js
    └── ...

docs/
├── guidelines/             # 공식 문서들
│   ├── testing-guidelines.md
│   └── test-writing-rules.md
├── improvement-report.md   # 개선 작업 보고서
└── agent-usage-guide.md    # Agent 사용 가이드
```

## 🚀 빠른 시작

### 1. 개선된 Agent 사용법

#### Test Writing Agent
```bash
node agents/improved/improved-test-writing-agent.js \
  --testDesign "테스트 설계 내용" \
  --featureSpec "기능 명세 내용" \
  --output "test.spec.ts"
```

#### Code Writing Agent
```bash
node agents/improved/improved-code-writing-agent.js \
  --testCode "테스트 코드 내용" \
  --featureSpec "기능 명세 내용" \
  --output "implementation.ts"
```

#### Refactoring Agent
```bash
node agents/improved/improved-refactoring-agent.js \
  --file "src/hooks/useFeature.ts" \
  --optimize
```

### 2. 완전한 TDD 워크플로우

1. **기능 명세 작성** → 2. **테스트 생성** → 3. **구현 생성** → 4. **리팩토링** → 5. **테스트 실행**

### 3. 문서 참조

- 📖 [Agent 사용 가이드](docs/agent-usage-guide.md)
- 📊 [개선 작업 보고서](docs/improvement-report.md)
- 📋 [테스트 작성 가이드라인](docs/guidelines/testing-guidelines.md)

## 완성된 작업

### ✅ 1. 테스트 작성 규칙 명세 문서

- **파일**: `docs/test-writing-rules.md`
- **내용**:
  - 테스트 작성의 기본 원칙 (단일 책임, 명확성, 독립성)
  - React Testing Library 모범 사례
  - 테스트 구조 패턴 (AAA, Given-When-Then)
  - 모킹 전략 및 테스트 데이터 관리
  - 에러 처리 및 접근성 테스트

### ✅ 2. 6개 AI 에이전트 구현

#### 2.1 Orchestrator Agent (오케스트레이터)

- **파일**: `orchestrator.js`
- **역할**: 전체 TDD 워크플로우 관리
- **기능**:
  - RED → GREEN → REFACTOR 사이클 실행
  - 각 단계별 에이전트 호출 및 조율
  - 단계별 커밋 관리
  - 테스트 실행 및 결과 검증

#### 2.2 Feature Design Agent (기능 설계)

- **파일**: `agents/feature-design-agent.js`
- **역할**: 기능 요구사항을 구체적인 명세로 변환
- **기능**:
  - 요구사항 분석 및 복잡도 평가
  - API 설계 및 컴포넌트 설계
  - 마크다운 형식의 상세한 기능 명세서 작성

#### 2.3 Test Design Agent (테스트 설계)

- **파일**: `agents/test-design-agent.js`
- **역할**: 기능 명세를 바탕으로 테스트 케이스 설계
- **기능**:
  - 테스트 케이스 설계 (단위, 통합, E2E)
  - 테스트 데이터 및 모킹 전략 수립
  - 테스트 우선순위 설정

#### 2.4 Test Writing Agent (테스트 작성)

- **파일**: `agents/test-writing-agent.js`
- **역할**: 테스트 설계를 바탕으로 실제 테스트 코드 작성
- **기능**:
  - Vitest + React Testing Library 기반 테스트 코드 생성
  - Given-When-Then 패턴 적용
  - MSW를 활용한 API 모킹

#### 2.5 Code Writing Agent (코드 작성)

- **파일**: `agents/code-writing-agent.js`
- **역할**: 테스트 코드를 바탕으로 실제 구현 코드 작성
- **기능**:
  - 실패하는 테스트를 통과시키는 최소한의 코드 작성
  - React Hook 및 컴포넌트 구현
  - TypeScript 타입 안전성 보장

#### 2.6 Refactoring Agent (리팩토링)

- **파일**: `agents/refactoring-agent.js`
- **역할**: 구현된 코드의 품질을 개선하고 최적화
- **기능**:
  - 성능 최적화 (useCallback, useMemo, React.memo)
  - 코드 품질 개선 (함수 분리, 네이밍 개선)
  - 접근성 향상 (ARIA 속성 추가)

### ✅ 3. 상세한 에이전트 명세 문서

각 에이전트별로 상세한 명세 문서를 작성했습니다:

- `agents/orchestrator.md`
- `agents/feature-design-agent.md`
- `agents/test-design-agent.md`
- `agents/test-writing-agent.md`
- `agents/code-writing-agent.md`
- `agents/refactoring-agent.md`

### ✅ 4. 종합 가이드 문서

- **파일**: `docs/ai-agent-guide.md`
- **내용**:
  - 에이전트 사용법 및 설정 방법
  - TDD 워크플로우 설명
  - 반복 일정 수정 기능 구현 예시
  - 검증 기준 및 트러블슈팅 가이드

## 프로젝트 구조

```
2nd_assignment/
├── agents/                          # AI 에이전트 구현
│   ├── orchestrator.md             # 오케스트레이터 명세
│   ├── feature-design-agent.js     # 기능 설계 에이전트
│   ├── feature-design-agent.md     # 기능 설계 에이전트 명세
│   ├── test-design-agent.js        # 테스트 설계 에이전트
│   ├── test-design-agent.md        # 테스트 설계 에이전트 명세
│   ├── test-writing-agent.js       # 테스트 작성 에이전트
│   ├── test-writing-agent.md       # 테스트 작성 에이전트 명세
│   ├── code-writing-agent.js       # 코드 작성 에이전트
│   ├── code-writing-agent.md       # 코드 작성 에이전트 명세
│   ├── refactoring-agent.js        # 리팩토링 에이전트
│   └── refactoring-agent.md        # 리팩토링 에이전트 명세
├── docs/                           # 문서
│   ├── test-writing-rules.md       # 테스트 작성 규칙 명세
│   └── ai-agent-guide.md           # AI 에이전트 가이드
├── orchestrator.js                 # 오케스트레이터 메인 파일
└── README.md                       # 프로젝트 개요
```

## 사용법

### 기본 TDD 사이클 실행

```bash
# 전체 TDD 사이클 실행
node orchestrator.js --feature="반복 일정 수정"

# 특정 단계만 실행
node orchestrator.js --step="test-design" --feature="반복 일정 수정"
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

1. **Feature Design**: 기능 요구사항 분석 및 명세 작성
2. **Test Design**: 테스트 케이스 설계 및 모킹 전략 수립
3. **Test Writing (RED)**: 실패하는 테스트 코드 작성
4. **Code Writing (GREEN)**: 테스트를 통과시키는 최소한의 코드 작성
5. **Refactoring**: 코드 품질 개선 및 최적화
6. **Commit**: 각 단계별 커밋 생성

## 주요 특징

### 1. 모듈화된 에이전트 설계

- 각 에이전트는 독립적인 역할과 책임을 가짐
- 명확한 인터페이스와 입출력 형식 정의
- 재사용 가능한 컴포넌트 구조

### 2. 포괄적인 테스트 전략

- 단위 테스트, 통합 테스트, E2E 테스트 지원
- MSW를 활용한 API 모킹
- React Testing Library 모범 사례 적용

### 3. 자동화된 품질 관리

- 각 단계별 결과물 검증
- 코드 품질 기준 자동 적용
- 성능 최적화 및 접근성 개선

### 4. 확장 가능한 아키텍처

- 새로운 에이전트 추가 용이
- 다양한 AI 모델 지원 가능
- CI/CD 파이프라인 통합 가능

## 검증 기준 달성

### 공통 제출

- [x] **테스트를 잘 작성할 수 있는 규칙 명세**: `docs/test-writing-rules.md`에 상세한 테스트 작성 규칙 문서화
- [ ] 명세에 있는 기능을 구현하기 위한 테스트를 모두 작성하고 올바르게 구현했는지
- [ ] 명세에 있는 기능을 모두 올바르게 구현하고 잘 동작하는지

### 기본과제(HARD)

- [x] **Agent 구현 명세 문서 또는 코드**: 6개 에이전트의 완전한 구현 및 명세 문서 제공
- [ ] 커밋별 올바르게 단계에 대한 작업
- [ ] 결과를 올바로 얻기위한 history 또는 log
- [ ] AI 도구 활용을 개선하기 위해 노력한 점 PR에 작성

## 향후 개선 방향

### 1. 실제 AI API 연동

- 현재는 시뮬레이션으로 구현된 부분을 실제 AI API와 연동
- GPT-4, Claude-3 등 다양한 AI 모델 지원

### 2. 웹 인터페이스 추가

- 에이전트 실행을 위한 웹 대시보드
- 실시간 진행 상황 모니터링
- 결과물 시각화

### 3. 고급 기능 추가

- 자동 코드 리뷰 에이전트
- 성능 분석 에이전트
- 보안 검사 에이전트

### 4. 통합 및 배포

- CI/CD 파이프라인 통합
- Docker 컨테이너화
- 클라우드 배포 지원

이 프로젝트는 AI를 활용한 TDD 워크플로우 자동화의 완전한 기반을 제공하며, 실제 개발 환경에서 활용할 수 있는 실용적인 도구입니다.
