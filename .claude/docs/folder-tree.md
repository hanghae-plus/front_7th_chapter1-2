# 📁 `.claude` 폴더 구조 가이드

> 이 문서는 AI 에이전트가 각 작업을 구성하고 작동하기 위한 경로(path) 기준을 제공합니다.

## 📂 전체 구조 개요

```
.claude/
├── agents/              # 에이전트 역할 정의 (Agent Definitions)
├── docs/                # 공통 문서 및 가이드 (Shared Documentation)
├── agent-docs/          # 에이전트별 작업 기록 (Agent Work Logs)
├── resources/           # 공통 리소스 (Shared Resources)
└── references/          # 전역 참조 자료 (Global References)
```

---

## 1️⃣ `agents/` - 에이전트 역할 정의

**경로**: `.claude/agents/`

각 AI 에이전트의 역할, 책임, 작동 방식을 정의한 Markdown 파일들이 위치합니다.

### 📄 파일 목록 및 역할

#### `orchestrator.md`
- **역할**: 전체 개발 워크플로우 조율자
- **책임**:
  - 복잡한 작업을 세분화하고 순서 계획
  - 작업 간 의존성 관리 및 우선순위 설정
  - TDD 워크플로우 전체 조율 (DESIGN → TEST DESIGN → RED → GREEN → REFACTOR → VALIDATE)
  - 품질 게이트 점검 및 진행 상황 모니터링
  - 최종 통합 및 검증
- **호출 시점**: 복잡한 개발 세션 시작, 여러 작업이 연결된 경우, TDD 방식 개발
- **사용 모델**: `sonnet`

#### `feature-designer.md`
- **역할**: 기능 설계 및 아키텍처 전문가
- **책임**:
  - 사용자 요구사항을 기술 명세서로 변환
  - 컴포넌트 구조, 데이터 흐름, API 설계
  - TypeScript 타입 정의
  - 테스트 전략 수립 (테스트 가능한 설계)
  - 파일 구조 및 구현 계획 작성
- **호출 시점**: 새 기능 추가, 대규모 리팩토링 계획, 요구사항이 모호할 때
- **사용 모델**: `opus`
- **산출물**: 상세 기술 명세서, 컴포넌트 아키텍처, API 인터페이스

#### `code-writer.md`
- **역할**: TypeScript/React 코드 구현 전문가
- **책임**:
  - 설계 명세에 따른 실제 코드 작성
  - 프로젝트 컨벤션 엄격 준수 (import 순서, 네이밍, 포맷팅)
  - TDD GREEN 단계: 최소 구현으로 테스트 통과
  - 타입 안전성 확보 (`any` 사용 금지)
  - 에러 처리 및 접근성 속성 추가
- **호출 시점**: 설계 완료 후 구현 필요, TDD GREEN 단계
- **사용 모델**: `sonnet`
- **산출물**: 프로덕션 수준의 TypeScript/React 코드

#### `test-designer.md`
- **역할**: 테스트 전략 설계 아키텍트
- **책임**:
  - 포괄적인 테스트 전략 개발
  - 테스트 케이스 설계 (정상/경계/오류/통합 시나리오)
  - 목킹 전략 수립 (MSW 핸들러, 모의 데이터)
  - 커버리지 목표 설정 및 우선순위 정의
  - GWT 패턴 기반 테스트 구조화
- **호출 시점**: 새 기능 테스트 필요, 테스트 커버리지 향상, 리팩토링 전 안전망 구축
- **사용 모델**: `sonnet`
- **산출물**: 테스트 전략 문서, 테스트 케이스 목록, 목킹 계획

#### `test-writer.md`
- **역할**: 테스트 코드 작성 전문가
- **책임**:
  - Vitest + React Testing Library + MSW 기반 테스트 코드 작성
  - TDD RED 단계: 실패하는 테스트 먼저 작성
  - GWT 패턴 준수 및 한글 설명 작성
  - 모의 데이터 생성 (프로젝트 타입 시스템 일치)
  - 테스트 유틸리티 함수 작성
- **호출 시점**: 테스트 코드 작성 필요, TDD RED 단계, 커버리지 보완
- **사용 모델**: `sonnet`
- **산출물**: `task.*.spec.ts` 테스트 파일, 모의 데이터, 테스트 유틸리티

#### `refactoring-expert.md`
- **역할**: 코드 품질 개선 및 리팩토링 전문가
- **책임**:
  - DRY 원칙 적용 및 코드 중복 제거
  - React 성능 최적화 (memo, useMemo, useCallback)
  - 타입 안전성 강화 (`any` 제거)
  - 코드 가독성 및 유지보수성 향상
  - TDD REFACTOR 단계: 테스트 통과 후 코드 개선
  - 디자인 패턴 적용
- **호출 시점**: 기능 구현 후 품질 개선, 성능 문제 발견, TDD REFACTOR 단계
- **사용 모델**: `sonnet`
- **산출물**: 리팩토링 분석 보고서, 개선된 코드

---

## 2️⃣ `docs/` - 공통 문서 및 가이드

**경로**: `.claude/docs/`

프로젝트 전반에 걸쳐 모든 에이전트가 참조하는 공통 문서를 저장합니다.

### 📄 현재 문서

#### `rule-of-make-good-test.md`
- **내용**: 테스트 작성 철학 및 원칙
- **주요 섹션**:
  - 테스트의 정의와 긍정적 영향
  - 명세 기반 vs 구현 기반 테스트
  - 좋은 테스트를 위한 핵심 원칙
  - GWT (Given-When-Then) 패턴
  - AI 에이전트를 위한 테스트 작성 체크리스트
  - 테스트 작성 지침 (8가지 Rules)
- **참조 에이전트**: test-designer, test-writer, orchestrator

#### `folder-tree.md` (본 문서)
- **내용**: `.claude` 폴더 구조 및 경로 가이드
- **목적**: 에이전트가 작업 구성 시 올바른 경로 참조
- **참조 에이전트**: 모든 에이전트

### 📝 추가 예상 문서

- `coding-conventions.md`: 코드 스타일 및 컨벤션 상세 가이드
- `architecture-guide.md`: 프로젝트 아키텍처 패턴 및 원칙
- `workflow-guide.md`: 표준 개발 워크플로우 가이드
- `api-design-patterns.md`: API 설계 패턴 및 베스트 프랙티스

---

## 3️⃣ `agent-docs/` - 에이전트별 작업 기록

**경로**: `.claude/agent-docs/`

각 에이전트의 작업 이력, 로그, 참조 자료를 에이전트별로 분리하여 저장합니다.

### 📂 구조

```
agent-docs/
├── orchestrator/
│   ├── logs/         # 조율 로그, 작업 계획, 진행 보고
│   └── references/   # 의사결정 근거, 참조한 자료
├── feature-designer/
│   ├── logs/         # 설계 문서, 기술 명세서
│   └── references/   # 설계 참고 자료
├── code-writer/
│   ├── logs/         # 구현 로그, 변경 이력
│   └── references/   # 참조 코드, 라이브러리 문서
├── test-designer/
│   ├── logs/         # 테스트 전략 문서
│   └── references/   # 테스트 패턴, 예제
├── test-writer/
│   ├── logs/         # 테스트 작성 로그, 커버리지 리포트
│   └── references/   # 모의 데이터 템플릿
└── refactoring-expert/
    ├── logs/         # 리팩토링 분석 보고서
    └── references/   # 리팩토링 패턴, 벤치마크
```

### 📝 사용 지침

#### `logs/` 디렉토리
- **용도**: 에이전트의 작업 산출물 및 로그 저장
- **파일 네이밍**: `YYYY-MM-DD_작업명.md` 또는 `task-id_작업명.md`
- **내용 예시**:
  - orchestrator: 작업 계획서, 진행 상황 보고, 최종 검증 결과
  - feature-designer: 기술 명세서, 아키텍처 설계도
  - code-writer: 구현 로그, 주요 의사결정 기록
  - test-designer: 테스트 전략 문서, 테스트 케이스 목록
  - test-writer: 테스트 작성 로그, 커버리지 결과
  - refactoring-expert: 리팩토링 분석 보고서, 개선 이력

#### `references/` 디렉토리
- **용도**: 작업 중 참조한 외부 자료, 코드 스니펫, 문서 링크
- **내용 예시**:
  - 참조한 코드베이스 파일 경로
  - 외부 라이브러리 문서 링크
  - 설계 결정의 근거가 된 자료
  - 유사 사례 또는 패턴 예제

---

## 4️⃣ `resources/` - 공통 리소스

**경로**: `.claude/resources/`

**현재 상태**: 비어있음

### 📝 예상 용도

- **템플릿 파일**: 표준 컴포넌트 템플릿, 테스트 템플릿
- **설정 파일**: 공통 설정, 환경 변수 예제
- **코드 스니펫**: 재사용 가능한 코드 조각
- **다이어그램**: 아키텍처 다이어그램, 플로우 차트
- **체크리스트**: 작업별 체크리스트 템플릿

### 📂 예상 구조

```
resources/
├── templates/
│   ├── component.template.tsx
│   ├── hook.template.ts
│   └── test.template.spec.ts
├── configs/
│   └── ...
├── snippets/
│   └── ...
└── diagrams/
    └── ...
```

---

## 5️⃣ `references/` - 전역 참조 자료

**경로**: `.claude/references/`

**현재 상태**: 비어있음

### 📝 예상 용도

- **프로젝트 전체 문서**: 프로젝트 개요, 히스토리
- **API 문서**: 백엔드 API 명세, 엔드포인트 가이드
- **외부 라이브러리 가이드**: 주요 라이브러리 사용법 정리
- **아키텍처 문서**: 전체 시스템 아키텍처, 설계 결정 기록
- **학습 자료**: 팀원 온보딩 자료, 베스트 프랙티스

### 📂 예상 구조

```
references/
├── api/
│   └── backend-api-spec.md
├── architecture/
│   ├── system-architecture.md
│   └── design-decisions.md
├── libraries/
│   ├── react-testing-library.md
│   ├── vitest.md
│   └── msw.md
└── onboarding/
    └── ...
```

---

## 🎯 에이전트 작업 흐름과 경로 사용

### TDD 워크플로우 예시

```
1. [orchestrator] 작업 계획 수립
   📝 작성 위치: .claude/agent-docs/orchestrator/logs/YYYY-MM-DD_task-plan.md

2. [feature-designer] 기술 명세 작성
   📝 작성 위치: .claude/agent-docs/feature-designer/logs/YYYY-MM-DD_feature-spec.md
   🔍 참조: .claude/docs/rule-of-make-good-test.md

3. [test-designer] 테스트 전략 설계
   📝 작성 위치: .claude/agent-docs/test-designer/logs/YYYY-MM-DD_test-strategy.md
   🔍 참조: .claude/docs/rule-of-make-good-test.md

4. [test-writer] RED 단계 - 실패하는 테스트 작성
   📝 작성 위치: src/__tests__/task.*.spec.ts
   📝 로그 위치: .claude/agent-docs/test-writer/logs/YYYY-MM-DD_red-phase.md
   🔍 참조: .claude/agents/test-writer.md

5. [code-writer] GREEN 단계 - 최소 구현
   📝 로그 위치: .claude/agent-docs/code-writer/logs/YYYY-MM-DD_green-phase.md
   🔍 참조: .claude/agents/code-writer.md

6. [refactoring-expert] REFACTOR 단계 - 코드 개선
   📝 작성 위치: .claude/agent-docs/refactoring-expert/logs/YYYY-MM-DD_refactor-report.md
   🔍 참조: .claude/agents/refactoring-expert.md

7. [orchestrator] 최종 검증 및 통합
   📝 작성 위치: .claude/agent-docs/orchestrator/logs/YYYY-MM-DD_final-report.md
```

---

## 📋 경로 참조 규칙

### 에이전트가 문서를 참조할 때

1. **역할 정의 확인**: `.claude/agents/{agent-name}.md`
2. **공통 가이드 참조**: `.claude/docs/*.md`
3. **프로젝트 규칙 확인**: `.cursor/rules/*.mdc`
4. **이전 작업 확인**: `.claude/agent-docs/{agent-name}/logs/*.md`

### 에이전트가 산출물을 작성할 때

1. **작업 로그**: `.claude/agent-docs/{agent-name}/logs/YYYY-MM-DD_작업명.md`
2. **참조 자료**: `.claude/agent-docs/{agent-name}/references/자료명.md`
3. **실제 코드**: 프로젝트 루트의 적절한 위치 (src/, etc.)

### 공통 자산 활용 시

1. **템플릿 사용**: `.claude/resources/templates/*.template.*`
2. **전역 참조**: `.claude/references/**/*.md`
3. **공통 문서**: `.claude/docs/*.md`

---

## 🔧 유지보수 지침

### 문서 업데이트 원칙

1. **역할 변경 시**: `.claude/agents/{agent-name}.md` 업데이트
2. **새로운 규칙 추가 시**: `.claude/docs/`에 새 문서 작성
3. **작업 완료 시**: `.claude/agent-docs/{agent-name}/logs/`에 로그 저장
4. **공통 템플릿 필요 시**: `.claude/resources/templates/`에 추가

### 파일 네이밍 컨벤션

- **로그 파일**: `YYYY-MM-DD_작업명.md` 또는 `task-id_작업명.md`
- **문서 파일**: `kebab-case.md` (소문자, 하이픈 구분)
- **템플릿 파일**: `name.template.ext`
- **참조 파일**: 명확한 설명적 이름 사용

### 정리 주기

- **logs/**: 분기별 아카이브 검토 (오래된 로그는 `logs/archive/YYYY-QQ/`로 이동)
- **references/**: 반기별 유효성 검토 (깨진 링크, 구식 정보 정리)
- **resources/**: 사용하지 않는 템플릿/자산 제거

---

## 📚 관련 문서

- [테스트 작성 가이드](./rule-of-make-good-test.md)
- [프로젝트 개발 규칙](../../.cursor/rules/calendar-app-conventions.mdc)
- [심화 개발 가이드](../../.cursor/rules/advanced-development-guide.mdc)
- [프로젝트 README](../../README.md)

---

**마지막 업데이트**: 2025-10-30  
**버전**: 1.0.0  
**작성자**: AI Assistant

