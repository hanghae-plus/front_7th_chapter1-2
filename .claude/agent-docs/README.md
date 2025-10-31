# 단일 책임 에이전트 아키텍처 문서

## 개요

이 디렉토리는 **6단계 TDD 파이프라인**을 위한 **단일 책임 에이전트(Single Responsibility Agent)** 아키텍처 문서를 포함합니다.

각 에이전트는 명확한 하나의 책임을 가지며, **문서 기반 인터페이스(Document-Based Interface)**를 통해 통신합니다.

---

## 아키텍처 원칙

### 1. 단일 책임 원칙 (Single Responsibility)

각 에이전트는 **하나의 명확한 역할**만 수행합니다:

```typescript
// 개념적 모델
type Agent = (handoff: HandoffDoc) => Artifact;
```

**특징:**

- 명확한 입력/출력 계약
- 외부 의존성 없음
- 재현 가능한 결과
- 완전한 독립성

### 2. 문서 기반 인터페이스 (Document-Based Interface)

에이전트는 **직접 통신하지 않고**, **Handoff 문서**를 통해서만 통신합니다:

```
Orchestrator → Handoff Document → Agent → Artifact → Orchestrator
              (명시적 계약)                (검증)
```

### 3. 순수 함수 패러다임 (Pure Function Paradigm)

에이전트는 순수 함수처럼 동작합니다:

- 동일한 입력 → 동일한 출력
- 부수 효과 없음 (파일 쓰기 제외)
- 전역 상태 접근 금지
- 다른 에이전트와 격리

---

## 6단계 TDD 파이프라인

```
Phase 0: Planning (orchestrator)
  ↓ handoff/phase1.md
Phase 1: Feature Design (feature-designer)
  ↓ handoff/phase2.md
Phase 2: Test Design (test-designer)
  ↓ handoff/phase3.md
Phase 3: RED - Test Writing (test-writer)
  ↓ handoff/phase4.md
Phase 4: GREEN - Implementation (code-writer)
  ↓ handoff/phase5.md
Phase 5: REFACTOR - Code Quality (refactoring-expert)
  ↓ handoff/phase6.md
Phase 6: VALIDATE - Final Verification (orchestrator)
```

### Phase별 핵심 검증 기준

- **Phase 3 (RED)**: 테스트가 **반드시 실패**해야 함
- **Phase 4 (GREEN)**: 테스트가 **반드시 통과**해야 함
- **Phase 5 (REFACTOR)**: 테스트가 **여전히 통과**해야 함

---

## 에이전트 문서 구조

각 에이전트는 동일한 3문서 패턴을 따릅니다:

```
agent-docs/[agent-name]/
├── contract.md            # 계약 명세서 (What to exchange)
├── prompt.md              # 실행 매뉴얼 (How to execute)
├── getting-started.md     # 사용자 가이드 (Quick start)
├── logs/                  # 산출물 저장소 (생성됨)
└── references/            # 참고 자료 (선택)
```

### 문서별 역할

#### 1. contract.md (계약 명세서)

**목적**: 입력/출력 계약 정의

**포함 내용:**

- 입력 계약 (Handoff 문서 형식)
- 출력 계약 (산출물 형식)
- 검증 기준
- Handoff 프로토콜
- 격리 계약

**대상**: 시스템 설계자, Orchestrator

#### 2. prompt.md (실행 매뉴얼)

**목적**: 단계별 실행 가이드

**포함 내용:**

- Step-by-step 절차
- 검증 명령어
- Git 워크플로우
- 문제 해결 방법
- 체크리스트

**대상**: 에이전트 자신, 개발자

#### 3. getting-started.md (사용자 가이드)

**목적**: 빠른 시작 안내

**포함 내용:**

- 문서 읽기 순서
- Quick Start
- 실제 예시
- FAQ
- 핵심 개념

**대상**: 처음 사용하는 개발자

---

## 에이전트별 역할

### Phase 0-6: orchestrator

**역할**: 전체 파이프라인 조율

- 6단계 TDD 파이프라인 관리
- Phase 전환 및 검증
- Git 브랜치 관리
- 에러 복구 및 재시도

**문서 위치**: [orchestrator/](orchestrator/)

- [계약 명세](orchestrator/contract.md)
- [실행 매뉴얼](orchestrator/prompt.md)
- [사용자 가이드](orchestrator/getting-started.md)

---

### Phase 1: feature-designer

**역할**: 요구사항 → 기술 명세

- 요구사항 분석 및 명확화
- 컴포넌트 아키텍처 설계
- 데이터 흐름 설계
- API 인터페이스 설계
- TypeScript 타입 정의
- 테스트 전략 수립

**입력**: 사용자 요구사항
**출력**: 기술 명세서 (spec.md)

**문서 위치**: [feature-designer/](feature-designer/)

- [계약 명세](feature-designer/contract.md)
- [실행 매뉴얼](feature-designer/prompt.md)
- [사용자 가이드](feature-designer/getting-started.md)

---

### Phase 2: test-designer

**역할**: 기술 명세 → 테스트 전략

- 테스트 케이스 식별 (단위/통합/E2E)
- GWT 패턴 시나리오 작성
- 목킹 전략 수립 (MSW, vi.mock)
- 커버리지 목표 설정
- 테스트 파일 명명 규칙 정의

**입력**: 기술 명세서 (spec.md)
**출력**: 테스트 전략 (test-strategy.md)

**문서 위치**: [test-designer/](test-designer/)

- [계약 명세](test-designer/contract.md)
- [실행 매뉴얼](test-designer/prompt.md)
- [사용자 가이드](test-designer/getting-started.md)

---

### Phase 3: test-writer (RED)

**역할**: 테스트 전략 → 실패하는 테스트

- **구현 전에** 테스트 작성
- Vitest + React Testing Library 사용
- GWT 패턴 준수
- MSW로 API 모킹
- 테스트 **반드시 실패** (RED 검증)
- 예상 실패 문서화

**입력**: 테스트 전략 (test-strategy.md)
**출력**: 실패하는 테스트 코드 (task.\*.spec.ts)

**중요**: 구현 코드 작성 금지!

**문서 위치**: [test-writer/](test-writer/)

- [계약 명세](test-writer/contract.md)
- [실행 매뉴얼](test-writer/prompt.md)
- [사용자 가이드](test-writer/getting-started.md)

---

### Phase 4: code-writer (GREEN)

**역할**: 실패하는 테스트 → 통과하는 코드

- **최소한의 구현**으로 테스트 통과
- TypeScript/React 베스트 프랙티스
- CLAUDE.md 컨벤션 준수
- Hooks vs Utils 분리
- 테스트 **반드시 통과** (GREEN 검증)
- 최적화는 나중에 (Refactoring 단계)

**입력**: 실패하는 테스트 코드
**출력**: 통과하는 구현 코드

**중요**: 테스트 파일 수정 금지!

**문서 위치**: [code-writer/](code-writer/)

- [계약 명세](code-writer/contract.md)
- [실행 매뉴얼](code-writer/prompt.md)
- [사용자 가이드](code-writer/getting-started.md)

---

### Phase 5: refactoring-expert (REFACTOR)

**역할**: 동작하는 코드 → 품질 높은 코드

- DRY 원칙 적용 (중복 제거)
- React 최적화 (memo, useMemo, useCallback)
- TypeScript 타입 강화 (any 제거)
- 가독성 향상 (명명, 구조)
- 디자인 패턴 적용
- 테스트 **여전히 통과** (REFACTOR 검증)

**입력**: 통과하는 구현 코드
**출력**: 리팩터링된 코드 + 리팩터링 보고서

**중요**: 동작 변경 금지! (Behavior Preservation)

**문서 위치**: [refactoring-expert/](refactoring-expert/)

- [계약 명세](refactoring-expert/contract.md)
- [실행 매뉴얼](refactoring-expert/prompt.md)
- [사용자 가이드](refactoring-expert/getting-started.md)

---

## 공통 산출물

### State 추적

**파일**: [orchestrator/state/current-state.json](orchestrator/state/current-state.json)

**목적**: 진행 상황 추적

**내용**:

- 현재 Phase
- Phase별 상태
- Git 태그 정보
- 재시도 횟수
- 검증 결과

### Issues 로그

**파일**: [orchestrator/references/issues-log.md](orchestrator/references/issues-log.md)

**목적**: 이슈 추적 및 관리

**내용**:

- 이슈 제목 및 설명
- 발생 Phase
- 근본 원인
- 해결 방법
- 재발 방지책

---

## Handoff 문서 프로토콜

### Handoff 문서 구조

```yaml
---
phase: N
agent: [agent-name]
timestamp: [ISO 8601]
status: ready | in_progress | completed | failed
previous_phase: N-1

inputs:
  [입력 항목들]

references:
  agent_definition: ../../agents/[agent].md
  [기타 참조 파일들]

output_requirements:
  path: .claude/agent-docs/[agent]/logs/[output-file].md
  required_sections:
    - 섹션 1
    - 섹션 2

constraints:
  - 제약 1
  - 제약 2

validation_criteria:
  - 기준 1
  - 기준 2
---

# Phase N: [Phase 이름]

[상세 지시사항]
```

### Handoff 문서 위치

```
orchestrator/handoff/
├── phase1.md    # Planning → Feature Design
├── phase2.md    # Feature Design → Test Design
├── phase3.md    # Test Design → Test Writing (RED)
├── phase4.md    # Test Writing → Implementation (GREEN)
├── phase5.md    # Implementation → Refactoring (REFACTOR)
└── phase6.md    # Refactoring → Validation
```

---

## Git 워크플로우

### 브랜치 전략

```bash
# Phase 0: Feature 브랜치 생성
git checkout -b feat/[feature-name]

# Phase N 완료 시: 커밋 + 태그
git add .
git commit -m "Phase-N: [설명]"
git tag phase-N-[feature-name]

# Phase 검증 실패 시: 롤백
git reset --hard phase-(N-1)-[feature-name]
git tag -d phase-N-[feature-name]

# Phase 6 완료 시: main 머지
git checkout main
git merge --no-ff feat/[feature-name]
```

### 커밋 메시지 규칙

**형식**:

```
Phase-N: [한글 제목]

[한글 본문]

완료된 Phase: 0~N
```

**특징**:

- Prefix: 영문 PascalCase (`Phase-N:`)
- 제목/본문: 한글
- Claude 서명 제외 (일반 커밋과 구분)

---

## 문서 읽기 순서

### 처음 사용하는 경우

**1단계: 전체 아키텍처 이해 (30분)**

1. 이 README 읽기 (10분)
2. [orchestrator/getting-started.md](orchestrator/getting-started.md) (20분)

**2단계: 실행 준비 (15분)** 3. [orchestrator/contract.md](orchestrator/contract.md) 훑어보기 (5분) 4. [orchestrator/prompt.md](orchestrator/prompt.md) 필요 부분만 (10분)

**3단계: 실행** 5. Orchestrator 활성화 6. 각 Phase별로 해당 에이전트 문서 참조

### 특정 에이전트만 사용하는 경우

**읽기 순서** (각 에이전트 공통):

1. `[agent]/getting-started.md` - 빠른 시작 (10분)
2. `[agent]/contract.md` - 계약 이해 (15분)
3. `[agent]/prompt.md` - 실행 시 참조 (on-demand)

---

## 검증 기준

### Phase별 성공 기준

| Phase | 에이전트           | 필수 검증              | 명령어                     |
| ----- | ------------------ | ---------------------- | -------------------------- |
| 0     | orchestrator       | 계획 수립 완료         | -                          |
| 1     | feature-designer   | 명세서 완성            | `ls logs/spec.md`          |
| 2     | test-designer      | 테스트 전략 수립       | `ls logs/test-strategy.md` |
| 3     | test-writer        | **테스트 실패**        | `pnpm test` (실패해야 함)  |
| 4     | code-writer        | **테스트 통과**        | `pnpm test` (통과해야 함)  |
| 5     | refactoring-expert | **테스트 여전히 통과** | `pnpm test && pnpm lint`   |
| 6     | orchestrator       | **빌드 성공**          | `pnpm build`               |

### 전체 성공 기준

- ✅ 모든 Phase 완료
- ✅ 모든 테스트 통과
- ✅ TypeScript 컴파일 성공
- ✅ ESLint 통과
- ✅ 빌드 성공
- ✅ 커버리지 목표 달성
- ✅ Git 커밋 히스토리 정리

---

## 문제 해결

### Phase 검증 실패

**증상**: Phase N의 검증 기준 미충족

**조치**:

1. Phase N-1로 롤백 (`git reset --hard phase-(N-1)-tag`)
2. 문제 분석 (issues-log.md에 기록)
3. Handoff 문서 개선
4. 재시도 (최대 3회)

### 에이전트 격리 위반

**증상**: 에이전트가 다른 Phase 산출물 접근 시도

**조치**:

1. 접근 거부
2. 문제 기록
3. Handoff 문서에 필요 정보 추가
4. 재시작

### Git 충돌

**증상**: main 브랜치 변경으로 충돌 발생

**조치**:

1. Feature 브랜치에서 main 병합 (`git merge main`)
2. 충돌 해결
3. Phase 6 재검증

---

## 참고 자료

### 프로젝트 문서

- [CLAUDE.md](../../CLAUDE.md) - 프로젝트 규칙
- [folder-tree.md](../docs/folder-tree.md) - 프로젝트 구조
- [git-commit-convention.md](../docs/git-commit-convention.md) - 커밋 규칙
- [rule-of-make-good-test.md](../docs/rule-of-make-good-test.md) - 테스트 철학

### 에이전트 정의

- [orchestrator.md](../agents/orchestrator.md)
- [feature-designer.md](../agents/feature-designer.md)
- [test-designer.md](../agents/test-designer.md)
- [test-writer.md](../agents/test-writer.md)
- [code-writer.md](../agents/code-writer.md)
- [refactoring-expert.md](../agents/refactoring-expert.md)

---

## 라이센스 및 기여

이 문서는 React + TypeScript 캘린더 애플리케이션 프로젝트의 일부입니다.

**작성일**: 2025년 10월 30일
**버전**: 1.0.0
**작성자**: TDD Pipeline Architecture Team

---

## 변경 이력

### v1.0.0 (2025-10-30)

- 초기 아키텍처 문서 작성
- 6개 에이전트 문서 완성 (orchestrator, feature-designer, test-designer, test-writer, code-writer, refactoring-expert)
- Handoff 프로토콜 정의
- Git 워크플로우 통합
- State 추적 시스템 구축
