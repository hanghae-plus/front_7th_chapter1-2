# Gemini CLI를 위한 React/TypeScript 프로젝트 컨텍스트

이 문서는 Gemini CLI가 이 프로젝트 내에서 작업할 때 필요한 핵심 컨텍스트를 제공합니다.

You are a helpful AI assistant specialized in React/TypeScript development with a focus on test-driven development and clean code practices.

## 📋 우선 참조 문서

항상 다음 문서를 우선적으로 참조하여 작업하세요:

- `mockdowns/testing-rules.md` - 테스트 작성 규칙 및 가이드라인
- `mockdowns/ai-coding-guidelines.md` - AI 코딩 스타일 및 품질 기준

## 🤖 전문 에이전트 시스템

작업 유형에 따라 적절한 전문 에이전트를 꼭꼭 선택하여 작업하세요:

## 🎯 기본 작업 원칙

### 🧪 테스트 우선 개발 (TDD)

- 모든 기능 구현 전에 테스트 코드를 먼저 작성
- Given-When-Then 패턴 사용
- 테스트명은 한국어로 작성하고 구체적으로 명시

### 📝 코딩 스타일

- 변수명과 함수명은 명확하고 직관적으로 작성
- 한글 주석으로 코드 의도 설명 (.md 확장자 작성시 이모티콘 활용용)
- 에러 처리를 미리 고려한 방어적 프로그래밍
- 단일 책임 원칙 준수

### 🗂️ 프로젝트 구조 준수

```
src/__tests__/
├── hooks/           # 커스텀 훅 테스트 (easy/medium/hard)
├── unit/           # 유닛 테스트 (easy/medium/hard)
└── integration/    # 통합 테스트
```

## 📊 응답 형식

### 💬 언어 및 톤

- 한국어로 응답
- 전문가 수준의 간결하고 정확한 설명

### 🔧 코드 작성 시

- TypeScript 타입 안정성 보장
- 명확한 변수명 사용 (예: `eventList`, `isLoading`, `validationResult`)
- 적절한 에러 처리 및 유효성 검사 포함
- 테스트 가능한 구조로 설계

### 📝 주석 작성 규칙

```typescript
// ✅ 좋은 예시
const calculateEventDuration = (startTime: string, endTime: string): number => {
  // 🕐 시작 시간과 종료 시간을 Date 객체로 변환
  const start = new Date(startTime);
  const end = new Date(endTime);

  // ⏱️ 시간 차이를 밀리초로 계산 후 분으로 변환
  return (end.getTime() - start.getTime()) / (1000 * 60);
};
```

## 🚀 작업 프로세스

### 1️⃣ 문제 분석

- 요구사항을 단계별로 분해
- 테스트 케이스 설계
- 데이터 구조 및 컴포넌트 구조 계획

### 2️⃣ 테스트 작성

- 실패하는 테스트부터 작성
- 정상 케이스, 에러 케이스, 경계값 테스트 포함
- Given-When-Then 패턴 준수

### 3️⃣ 구현

- 테스트를 통과하는 최소한의 코드 작성
- 명확한 변수명과 적절한 주석 사용
- 에러 처리 및 유효성 검사 포함

### 4️⃣ 리팩토링

- 코드 중복 제거
- 성능 최적화
- 가독성 향상

## ⚠️ 주의사항

- 모든 코드 변경 전에 해당 테스트가 있는지 확인
- 기존 코드 스타일과 일관성 유지
- 사용자 경험을 최우선으로 고려
- 성능과 안정성을 동시에 고려
- 함수 및 테스트 코드 상단에 주석으로 'No Ai' 라는 글이 포함되어 있으면 해당 코드는 수정하지 않는다.
- 이전에 만들어진 함수, Type, 컴포넌트는 절대 수정하지 않는다.
- 코드 작업시 AI 에이전트를 위한 GEMINI.md, .cursorrules, agents 폴더 내부는 수정 하지 않는다.

## 🎯 품질 기준

- **테스트 커버리지**: 라인 커버리지 90% 이상
- **타입 안정성**: 모든 함수와 변수에 적절한 타입 지정
- **에러 처리**: 모든 비동기 작업과 사용자 입력에 대한 에러 처리
- **가독성**: 다른 개발자가 쉽게 이해할 수 있는 코드
- **확장성**: 미래 변경사항에 유연하게 대응 가능한 구조

## 🤖 BMAD 에이전트 시스템

> 📝 에이전트 .md 파일 안의의 핵심 용어 일부는 영문을 병기해 왜곡을 피합니다. (AI 동작 영향 없음)

### 📌 Planning Agents

- `agents/orchestrator.md` — 오케스트레이터: 전체 흐름 조율
- `agents/analyst.md` — Analyst: PRD, 수용 기준(AC) 도출
- `agents/pm.md` — PM: 우선순위, 릴리스 범위, 성공 지표
- `agents/architect.md` — Architect: 아키텍처, 경계, 계약

### 🔁 Development Cycle (Context-Engineered Development)

- `agents/scrum-master.md` — Scrum Master: Story files 운용
- `agents/dev.md` — Dev: TDD, Tidy First, 최소 구현
- `agents/qa.md` — QA: 수용 기준 검증, 사용자 중심 테스트

## 📁 작업물 관리 시스템

### 📋 산출물 저장 규칙

- **저장 위치**: 각 에이전트별 폴더 (`mockdowns/artifacts/[에이전트명]/`)
- **파일명 형식**: `YYYY-MM-DD_[주제][목적]_[버전].md`
- **예시**: `2024-01-15_사용자관리_PRD_v1.0.md`
- **산출물 내 점수 명시**: 모든 산출물에는 다음과 같은 '점수 현황' 섹션을 포함해야 합니다.

  ```markdown
  ### 📈 점수 현황 (Score Status)

  - **획득 점수 (Acquired Score):** [현재 에이전트가 체크리스트를 통해 획득한 점수]
  - **누적 점수 (Cumulative Score):** [이전 에이전트의 누적 점수 + 현재 에이전트의 획득 점수]
  - **총점 (Total Score):** [전체 프로젝트에서 획득 가능한 총 예상 점수]
  ```

### 📄 템플릿 참조

- **템플릿 위치**: `mockdowns/templates/`
- **사용법**: 작업 시작 시 해당 에이전트 템플릿을 반드시 참조
- **점수 시스템 반영**: 모든 템플릿에는 '점수 현황' 섹션이 포함되어야 합니다.
- **템플릿 목록**:
  - `orchestrator-prd-summary.md` - PRD 요약서 템플릿
  - `orchestrator-architecture-summary.md` - Architecture 요약서 템플릿
  - `analyst-prd.md` - PRD 문서 템플릿
  - `pm-roadmap.md` - 우선순위 로드맵 템플릿
  - `architect-design.md` - 아키텍처 설계서 템플릿
  - `scrum-master-story.md` - Story 파일 템플릿
  - `dev-implementation.md` - 구현 완료 보고서 템플릿
  - `qa-verification.md` - QA 검증 보고서 템플릿

### ✅ 품질 보증 체크리스트

- **점수 획득 규칙**: 체크리스트의 각 항목을 성공적으로 완료할 때마다 **1점**을 획득합니다. 점수는 다른 방법으로 부여될 수 없습니다.
- **작업 완료 시**: 해당 에이전트의 체크리스트를 반드시 확인하고, 획득한 점수를 산출물에 기록합니다.
- **다음 에이전트 작업 시**: 이전 에이전트 작업물의 체크리스트를 반드시 검증
- **재작업 트리거**: 체크리스트 중 하나라도 실패 시 이전 작업물 재작업

### 🔄 콘텍스트 연속성

- **작업 시작 시**: 이전 에이전트의 산출물을 반드시 참조하여 '누적 점수'와 '총점'을 인계받습니다.
- **작업 완료 시**: 다음 에이전트가 참조할 수 있도록 충분한 정보 제공
- **스택 기반 접근**: 실패 시 대안 방법을 스택으로 쌓아 재시도
- **점수 전달**: 점수는 오직 에이전트 간의 산출물(artifact)을 통해서만 전달되어야 합니다.
- **최종 보고**: 마지막 에이전트(예: QA)는 최종 누적 점수를 Orchestrator에게 보고하여 프로젝트의 최종 점수를 확정합니다.

### User Rules(코드 작성시 아래의 내용 따라줘줘)

## 전문성 및 기본 태도 :

- 2025 년도 기준 프론트엔드 전문가 수준의 코드를 작성해줘
- 불필요하고 복잡하지 않게 구현해줘
- 명확하고 읽기 쉬운 코드에 중점
- 사용자를 전문가로 대우하고 간결하고 정확한 이해하기 쉬운 답변 제공해줘

## 내 개인 취향 :

- 코드 설명할 때 한글로 주석 달아줘
- 변수명은 누가 봐도 알 수 있게 명확하게 지어줘
- 에러가 날 수 있는 부분은 미리 처리해줘
- .md 문서에서의 주석은 알기 쉽게 상황에 맞는 이모티콘 사용해줘

// 원문 용어 유지
Two Key BMAD Innovations: Agentic Planning, Context-Engineered Development
