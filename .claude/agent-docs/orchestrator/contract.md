# 🤝 Orchestrator 에이전트 계약 명세

> **목적**: 6단계 TDD 파이프라인에서 Orchestrator의 Input/Output 계약을 명시  
> **패러다임**: 단일 책임 에이전트 + 문서 기반 인터페이스  
> **통신 방식**: 문서 기반 (Handoff → Artifact), 에이전트 간 직접 통신 없음

---

## 📋 계약 개요

Orchestrator는 명확한 입력/출력 계약을 가진 독립 실행 단위입니다 (순수함수처럼):

```typescript
// 비유: 순수함수 시그니처
type Orchestrator = (userRequirement: string) => ProjectCompletion;

interface ProjectCompletion {
  plan: WorkPlan;
  phases: PhaseResult[];
  validation: ValidationReport;
  artifacts: Artifact[];
}
```

---

## 📥 Input Contract

### Phase 0: 초기 입력

**입력 소스**: CLI 명령어 또는 대화형 요청

```yaml
Type: UserRequirement
Format:
  - 자연어 문장 (한글/영어)
  - 기능 설명 포함
  - 선택적 제약사항

Example:
  "UI, 상태관리, 유틸리티를 포함한 반복 일정 기능을 추가해야 해"
  "검색 필터 개선, 알림 버그 수정, 캘린더 렌더링 최적화를 같이 진행하자"
```

**필수 참조 파일**:

```yaml
- CLAUDE.md # 프로젝트 규칙
- .claude/docs/folder-tree.md # 폴더 구조
- .claude/agents/orchestrator.md # 자신의 역할 정의
```

---

## 📤 Output Contract

### 1️⃣ Phase 0: 작업 계획 (Work Plan)

**출력 파일**:

```
Path: .claude/agent-docs/orchestrator/logs/YYYY-MM-DD_[task-name]-plan.md
Type: Markdown Document
```

**필수 섹션**:

```yaml
sections:
  - title: '📋 개요'
    required_fields:
      - 작업 목표
      - 범위
      - 예상 소요 시간

  - title: '🔨 작업 세분화'
    required_fields:
      - 작업명
      - 우선순위 (P0/P1/P2/P3)
      - 범위(Scope)
      - 의존성(Dependencies)
      - 담당 에이전트
      - 결과물(Deliverables)
      - 영향 파일(Affected Files)
      - 복잡도(Complexity)

  - title: '📊 실행 순서'
    description: 'Phase 1-6의 순차적 실행 계획'

  - title: '✅ 품질 검증 포인트'
    description: '각 Phase별 검증 기준'

  - title: '⚠️ 리스크 평가'
    description: '예상 문제와 대응 방안'

  - title: '📌 참조 문서'
    description: '관련 문서 및 파일 경로'
```

**예시**:

```markdown
# Work Plan: 반복 일정 기능 추가

## 📋 개요

- 작업 목표: 반복 일정(daily/weekly/monthly/yearly) 생성 및 관리 기능 구현
- 범위: 타입 정의, 유틸 함수, 훅, UI 컴포넌트, 테스트
- 예상 소요 시간: 8-10시간

## 🔨 작업 세분화

1. **타입 및 인터페이스 정의** (우선순위: P0)
   - 범위: RepeatInfo 인터페이스 정의 및 타입 확장
   - 의존성: 없음
   - 담당 에이전트: feature-designer
   - 결과물: 업데이트된 src/types.ts
   - 영향 파일: src/types.ts
   - 복잡도: Low
     ...
```

### 2️⃣ Phase 1-5: Handoff Documents

각 Phase마다 다음 에이전트를 위한 Handoff 문서 생성:

**출력 파일**:

```
Path: .claude/agent-docs/orchestrator/handoff/phaseN.md
Type: YAML + Markdown
```

**필수 구조**:

```yaml
---
phase: 1
agent: feature-designer
timestamp: 2025-10-30T10:00:00Z
status: ready

inputs:
  requirement: "반복 일정 기능 추가"
  context_files:
    - CLAUDE.md
    - .claude/agent-docs/orchestrator/logs/2025-10-30_plan.md

references:
  agent_definition: ../../agents/feature-designer.md
  agent_prompt: ../feature-designer/prompt.md
  shared_docs:
    - ../../docs/folder-tree.md

output_requirements:
  path: .claude/agent-docs/feature-designer/logs/2025-10-30_spec.md
  required_sections:
    - 요구사항 요약
    - 기술 설계
    - 타입 정의
    - 파일 구조
  format: markdown

constraints:
  - 반복 일정 UI는 보류 (백엔드 로직만)
  - CLAUDE.md 컨벤션 준수
  - 테스트 가능한 설계

validation_criteria:
  - 타입 정의 완료
  - 컴포넌트 구조 명확
  - API 인터페이스 설계 완료
---

# Phase 1: Feature Design

## 작업 내용
반복 일정 기능에 대한 상세 기술 명세서를 작성하세요.

## 참고사항
- 현재 프로젝트는 Event, EventForm 타입 구조를 사용
- RepeatInfo는 주석 처리되어 있음
- 8주차 과제로 UI는 나중에 구현 예정
...
```

### 3️⃣ Phase 6: 최종 검증 보고서

**출력 파일**:

```
Path: .claude/agent-docs/orchestrator/logs/YYYY-MM-DD_[task-name]-final-report.md
Type: Markdown Document
```

**필수 섹션**:

```yaml
sections:
  - 작업 요약 (시작일, 완료일, 소요 시간)
  - 완료된 작업 목록
  - 품질 검증 결과
  - 변경 사항 (신규/수정/삭제 파일)
  - 테스트 커버리지
  - 남은 기술 부채
  - 후속 작업 제안
```

---

## 🔄 Handoff Protocol

### 문서 기반 인터페이스

각 에이전트는 **완전히 독립적**으로 실행되며, 오직 **문서(Handoff)**를 통해서만 통신합니다.

```
┌─────────────────────────────────────────────────────┐
│                  Orchestrator                       │
│  (유일하게 전체 파이프라인을 보는 조율자)           │
└─────────────────────────────────────────────────────┘
                    │
          1. 요구사항 분석
          2. Handoff 문서 생성 (phase1.md)
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│              Phase 1 Execution                      │
│  Agent: feature-designer (완전 독립 세션)           │
│                                                     │
│  Input:  handoff/phase1.md (명시적 계약)           │
│  Output: logs/2025-10-30_spec.md (산출물)          │
│                                                     │
│  [암묵적 컨텍스트 접근 불가]                        │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│          Orchestrator Validation                   │
│  1. 산출물(Artifact) 존재 확인                      │
│  2. 계약 준수 검증                                  │
│  3. 다음 Handoff 문서 생성 (phase2.md)             │
└─────────────────────────────────────────────────────┘
                    │
          (Phase 2~6 반복)
```

### Phase 전환 프로세스

```typescript
// Phase N 완료 후
function transitionToNextPhase(currentPhase: number): void {
  // 1. 현재 Phase 산출물 검증
  const output = validatePhaseOutput(currentPhase);

  // 2. 검증 통과 확인
  if (!output.isValid) {
    handleValidationFailure(currentPhase, output.errors);
    return;
  }

  // 3. 다음 Phase Handoff 생성
  const nextPhase = currentPhase + 1;
  const handoff = createHandoff({
    phase: nextPhase,
    agent: PHASE_AGENT_MAP[nextPhase],
    inputs: [...previousOutputs, output.artifacts],
    requirements: extractRequirements(nextPhase),
  });

  // 4. Handoff 파일 저장
  saveHandoff(`handoff/phase${nextPhase}.md`, handoff);

  // 5. 사용자에게 알림
  notifyUser(`Phase ${currentPhase} 완료. Phase ${nextPhase} 준비됨.`);
}
```

### Handoff 파일 템플릿

```markdown
---
phase: { N }
agent: { agent-name }
timestamp: { ISO-8601 }
status: ready

inputs:
  primary: { description }
  files:
    - { file-path-1 }
    - { file-path-2 }

references:
  agent_definition: ../../agents/{agent-name}.md  # 예: ../../agents/feature-designer.md
  agent_prompt: ../{agent-name}/prompt.md  # 예: ../feature-designer/prompt.md

output_requirements:
  path: { output-path }
  required_sections: [{ sections }]
  format: { markdown|json|typescript }

constraints:
  - { constraint-1 }
  - { constraint-2 }

validation_criteria:
  - { criterion-1 }
  - { criterion-2 }
---

# Phase {N}: {Phase Name}

## 작업 개요

{description}

## 입력 파일

- **{file-1}**: {description}
- **{file-2}**: {description}

## 산출물 요구사항

{detailed requirements}

## 제약 조건

{detailed constraints}

## 검증 방법

{validation steps}
```

---

## ✅ Validation Contract

### Phase별 검증 기준

#### Phase 0: 계획 수립

```yaml
validation:
  - work_plan_exists: true
  - required_sections_complete: true
  - phases_defined: [0, 1, 2, 3, 4, 5, 6]
  - agent_assignments_clear: true
```

#### Phase 1: Feature Design

```yaml
validation:
  - spec_file_exists: true
  - type_definitions_complete: true
  - component_structure_defined: true
  - api_interface_designed: true
  - testable_design: true
```

#### Phase 2: Test Design

```yaml
validation:
  - test_strategy_exists: true
  - test_cases_listed: true
  - mocking_strategy_defined: true
  - gwt_pattern_applied: true
  - coverage_goals_set: true
```

#### Phase 3: RED (Test Writer)

```yaml
validation:
  - test_file_created: 'src/__tests__/task.*.spec.ts'
  - test_execution_result: 'FAIL'
  - failure_messages_clear: true
  - no_implementation_code: true
  - red_phase_log_exists: true

commands:
  - 'pnpm test task.[feature].spec.ts'

expected_output: |
  ✗ 테스트 실패 (예상됨)
  FAIL src/__tests__/task.repeat-event.spec.ts
```

#### Phase 4: GREEN (Code Writer)

```yaml
validation:
  - implementation_exists: true
  - test_execution_result: 'PASS'
  - typescript_compile: 'SUCCESS'
  - conventions_followed: true
  - green_phase_log_exists: true

commands:
  - 'pnpm test task.[feature].spec.ts'
  - 'pnpm lint:tsc'

expected_output: |
  ✓ 모든 테스트 통과
  PASS src/__tests__/task.repeat-event.spec.ts
```

#### Phase 5: REFACTOR (Refactoring Expert)

```yaml
validation:
  - code_quality_improved: true
  - tests_still_passing: true
  - eslint_passing: true
  - performance_optimized: true (if applicable)
  - refactor_log_exists: true

commands:
  - 'pnpm test'
  - 'pnpm lint'
```

#### Phase 6: VALIDATE (Orchestrator)

```yaml
validation:
  - all_tests_passing: 100%
  - coverage_meets_goal: true
  - typescript_errors: 0
  - eslint_errors: 0
  - integration_scenarios_work: true
  - final_report_exists: true

commands:
  - 'pnpm test'
  - 'pnpm test:coverage'
  - 'pnpm lint'
  - 'pnpm lint:tsc'
```

---

## 🔒 Isolation Contract

### 에이전트 독립성 보장

각 에이전트는 다음을 **보장받습니다**:

```yaml
guarantees:
  clean_context:
    description: '이전 Phase의 실행 컨텍스트가 남아있지 않음'
    enforcement: '별도 세션으로 실행'

  explicit_interface:
    description: 'Handoff 문서에 명시된 입력만 접근 가능'
    enforcement: '문서 기반 인터페이스'

  single_responsibility:
    description: '자신의 역할 정의만 로드'
    enforcement: 'agent-specific prompt.md 참조'

  artifact_isolation:
    description: '산출물이 다른 Phase에 직접 영향주지 않음'
    enforcement: 'Orchestrator가 명시적으로 전달'
```

### 에이전트가 **할 수 없는** 것:

```yaml
forbidden:
  - 다른 에이전트의 실행 컨텍스트 접근
  - 이전 Phase의 암묵적 컨텍스트 참조
  - Orchestrator의 전체 계획 보기
  - 다른 Phase 산출물 직접 수정
  - 전역 상태 변경
  - 다른 에이전트 직접 호출
```

### 에이전트가 **해야 하는** 것:

```yaml
required:
  - Handoff 문서만 읽기 (명시적 계약)
  - 자신의 역할 정의(agent.md, prompt.md) 참조
  - 지정된 경로에 산출물(Artifact) 생성
  - 작업 로그 기록
  - 재현 가능한 결과 생성 (같은 입력 → 같은 출력)
```

---

## 📊 상태 추적 (State Tracking)

### 진행 상태 파일

**경로**: `.claude/agent-docs/orchestrator/state/current-state.json`

```json
{
  "task_id": "2025-10-30_repeat-event",
  "task_name": "반복 일정 기능 추가",
  "started_at": "2025-10-30T09:00:00Z",
  "current_phase": 3,
  "phases": [
    {
      "phase": 0,
      "name": "Planning",
      "status": "completed",
      "agent": "orchestrator",
      "output": ".claude/agent-docs/orchestrator/logs/2025-10-30_plan.md",
      "validated": true,
      "completed_at": "2025-10-30T09:15:00Z"
    },
    {
      "phase": 1,
      "name": "Feature Design",
      "status": "completed",
      "agent": "feature-designer",
      "input": ".claude/agent-docs/orchestrator/handoff/phase1.md",
      "output": ".claude/agent-docs/feature-designer/logs/2025-10-30_spec.md",
      "validated": true,
      "completed_at": "2025-10-30T10:00:00Z"
    },
    {
      "phase": 2,
      "name": "Test Design",
      "status": "completed",
      "agent": "test-designer",
      "input": ".claude/agent-docs/orchestrator/handoff/phase2.md",
      "output": ".claude/agent-docs/test-designer/logs/2025-10-30_test-strategy.md",
      "validated": true,
      "completed_at": "2025-10-30T10:30:00Z"
    },
    {
      "phase": 3,
      "name": "RED - Test Writing",
      "status": "in_progress",
      "agent": "test-writer",
      "input": ".claude/agent-docs/orchestrator/handoff/phase3.md",
      "output": null,
      "validated": false,
      "started_at": "2025-10-30T10:35:00Z"
    }
  ]
}
```

---

## 🔁 재시작 및 복구 (Restart & Recovery)

### Phase 실패 시

```yaml
scenario: "Phase N 실패"
actions:
  1. 실패 원인 분석
  2. 문제 기록 (references/issues-log.md)
  3. 재시도 전략 결정:
     - 같은 Phase 재실행 (handoff 수정)
     - 이전 Phase로 롤백 (설계 재검토)
     - Phase 건너뛰기 (특정 상황만)
  4. 상태 파일 업데이트
  5. 사용자 승인 후 재시작
```

### 중단 후 재개

```yaml
scenario: '작업 중단 후 나중에 재개'
restore_process: 1. state/current-state.json 읽기
  2. 마지막 완료 Phase 확인
  3. 다음 Phase handoff 존재 확인
  4. 사용자에게 진행 상황 보고
  5. 승인 후 다음 Phase 실행
```

---

## 🌿 Git 브랜치 및 커밋 관리

### 브랜치 전략

**Feature Branch 생성** (Phase 0 시작 시):

```bash
git checkout -b feat/[feature-slug]
```

**브랜치 네이밍 규칙**:

- `feat/[feature-slug]` - 새 기능 (예: feat/repeat-event)
- `fix/[bug-slug]` - 버그 수정 (예: fix/overlap-detection)
- `refactor/[scope-slug]` - 리팩토링 (예: refactor/event-utils)

### Phase 커밋 규칙

**자동 커밋 타이밍**: 각 Phase 검증 성공 직후

**커밋 메시지 포맷**:

```text
Phase-N: [한글 설명]

- [한글 상세 내용]
- [변경사항]
- [산출물 목록]
```

**예시**:

```bash
git commit -m "Phase-0: 반복 일정 기능 계획 수립

- 6단계 TDD 파이프라인 수립
- 타입, 유틸, 훅, UI 작업 세분화
- 산출물: handoff/phase1.md, state/current-state.json"
```

**Phase Tag 생성**:

```bash
git tag phase-N-[feature-slug]
```

### Git 자동화 실행 (중요!)

**⚠️ Orchestrator의 필수 책임**: 각 Phase 검증 성공 시 **반드시** git 명령을 실행해야 합니다.

**Phase 완료 후 실행할 명령**:

```bash
# 1. 변경사항 스테이징
git add .

# 2. Phase 커밋 생성
git commit -m "$(cat <<'EOF'
Phase-N: [한글 설명]

- [상세 내용 1]
- [상세 내용 2]
- 산출물: [파일 목록]
EOF
)"

# 3. Phase 태그 생성
git tag phase-N-[feature-slug]
```

**실행 시점**:
- Phase 검증이 **성공**한 직후
- 다음 Phase Handoff 문서 생성 **전**

**Bash Tool 사용 예시**:

```typescript
// Orchestrator 내부 로직
await validatePhase(N);  // Phase N 검증

if (validationSuccess) {
  // Git 커밋 실행 (Bash tool 사용)
  await bash({
    command: `git add . && git commit -m "Phase-${N}: ${description}" && git tag phase-${N}-${featureSlug}`,
    description: `Phase ${N} 커밋 및 태그 생성`
  });

  // 다음 Phase Handoff 생성
  await createHandoff(N + 1);
}
```

**체크리스트**:
- [ ] Phase 검증 성공 확인
- [ ] `git add .` 실행
- [ ] Phase 커밋 생성
- [ ] Phase 태그 생성
- [ ] Git log 확인 (커밋이 생성되었는지)
- [ ] 다음 Phase Handoff 생성

### 검증 실패 시 롤백

**자동 롤백 프로토콜**:

```bash
# Phase N 검증 실패 시
git reset --hard phase-{N-1}-[feature-slug]
git tag -d phase-N-[feature-slug]  # 실패한 Phase 태그 제거

# 사용자에게 실패 원인 보고
# 재작업 여부 확인
```

### Main 브랜치 머지

**Phase 6 완료 후**:

1. **Feature 완성 태그 생성**:

   ```bash
   git tag feature/[feature-slug]-v1.0.0
   ```

1. **사용자에게 머지 옵션 제안**:

   ```text
   ✅ 모든 Phase 완료!

   다음 중 선택하세요:
   1. [추천] main 브랜치에 머지
      → git checkout main && git merge --no-ff feat/[feature-slug]
   2. PR 생성 (팀 리뷰 필요 시)
      → gh pr create --base main --head feat/[feature-slug]
   3. 추가 작업 계속
   ```

1. **머지 커밋 메시지**:

   ```text
   Feat: [한글 기능 설명]

   - [한글 상세 내용]
   - [주요 변경사항]
   - 완료된 Phase: 0~6
   ```

**예시**:

```bash
git checkout main
git merge --no-ff feat/repeat-event \
  -m "Feat: 반복 일정 기능 추가

- 매일/매주/매월/매년 반복 유형 지원
- RepeatInfo 타입 활성화 및 UI 통합
- 완료된 Phase: 0~6"
```

### 커밋 메시지 규칙

**기본 원칙**:

- **말머리**: 파스칼케이스 영어 (Phase-N:, Feat:, Fix:, Refactor:)
- **타이틀/본문**: 한글
- **Claude 서명**: 제외 (🤖 Generated with Claude Code 등)

**Phase 커밋**:

```text
Phase-N: [한글 설명]

- [상세 내용]
```

**기능 완료 커밋**:

```text
Feat: [한글 설명]

- [상세 내용]
```

**버그 수정**:

```text
Fix: [한글 설명]

- [상세 내용]
```

### 병렬 기능 개발

**여러 기능 동시 작업 시**:

```bash
main
  ├── feat/repeat-event (Phase 3 진행 중)
  ├── feat/category-filter (Phase 0 완료)
  └── feat/drag-drop (대기 중)
```

**각 브랜치는 독립적으로 Phase 진행**:

- 각자의 handoff/, state/ 파일 관리
- Phase tag는 feature-slug로 구분
- 완료 순서대로 main에 머지

---

## 🎯 사용 예시

### 전체 워크플로우 실행

Orchestrator 에이전트는 Claude Code 대화 중 **Task tool**을 사용하여 다른 에이전트를 순차적으로 호출합니다.

#### Step 1: 사용자가 Orchestrator에게 요구사항 전달

Claude Code 세션에서 Orchestrator 역할을 명시적으로 부여합니다:

```text
사용자:
"당신은 Orchestrator 에이전트입니다.
참조 문서:
- .claude/agents/orchestrator.md
- .claude/agent-docs/orchestrator/prompt.md
- CLAUDE.md

이 프로젝트에 반복 일정 기능을 추가하고 싶습니다.
- 반복 유형: 매일, 매주, 매월, 매년
- 31일에 매월 선택 시 매월 31일에만 생성
- 윤년 29일에 매년 선택 시 2월 29일에만 생성
- 반복일정은 일정 겹침 감지 제외

6단계 TDD 파이프라인으로 진행해주세요."
```

#### Step 2: Orchestrator - Phase 0 (Planning)

Orchestrator가 Work Plan을 작성합니다:

```text
Orchestrator:
"요구사항을 분석하여 Work Plan을 작성하겠습니다.

[Work Plan 작성 중...]

산출물: .claude/agent-docs/orchestrator/logs/2025-10-30_repeat-event-plan.md
```

#### Step 3: Orchestrator - Phase 1 Handoff 생성 → feature-designer 호출

```text
Orchestrator:
"Phase 1: Feature Design을 시작합니다.
Handoff 문서를 생성하고 feature-designer 에이전트를 호출하겠습니다.

Handoff 생성: .claude/agent-docs/orchestrator/handoff/phase1.md

<uses Task tool to launch feature-designer agent with:
  - subagent_type: "feature-designer"
  - prompt: "Handoff 문서(.claude/agent-docs/orchestrator/handoff/phase1.md)를
             읽고 반복 일정 기능에 대한 기술 명세서를 작성하세요."
>"
```

**feature-designer 실행 결과:**

- 산출물: `.claude/agent-docs/feature-designer/logs/2025-10-30_repeat-event-spec.md`

#### Step 4: Orchestrator - Phase 1 검증 → Phase 2 Handoff 생성 → test-designer 호출

```text
Orchestrator:
"Phase 1 산출물을 검증했습니다.
- ✅ spec.md 파일 생성됨
- ✅ 타입 정의 완료
- ✅ API 인터페이스 설계 완료

Phase 2: Test Design을 진행합니다.

<uses Task tool to launch test-designer agent>"
```

**test-designer 실행 결과:**

- 산출물: `.claude/agent-docs/test-designer/logs/2025-10-30_repeat-event-test-strategy.md`

#### Step 5: Orchestrator - Phase 3 (RED) → test-writer 호출

```text
Orchestrator:
"Phase 3: RED - 실패하는 테스트를 작성합니다.

<uses Task tool to launch test-writer agent>"
```

**test-writer 실행 결과:**

- 산출물: `src/__tests__/task.repeat-event.spec.ts`

**Orchestrator 검증:**

```bash
pnpm test task.repeat-event.spec.ts
# ✗ 모든 테스트 실패 (예상된 결과 ✅)
```

#### Step 6: Orchestrator - Phase 4 (GREEN) → code-writer 호출

```text
Orchestrator:
"Phase 4: GREEN - 테스트를 통과시키는 구현을 작성합니다.

<uses Task tool to launch code-writer agent>"
```

**code-writer 실행 결과:**

- 산출물: `src/types.ts`, `src/utils/repeatUtils.ts`, `src/hooks/useEventOperations.ts` 등

**Orchestrator 검증:**

```bash
pnpm test task.repeat-event.spec.ts
# ✓ 모든 테스트 통과 ✅

pnpm lint:tsc
# ✓ TypeScript 에러 없음
```

#### Step 7: Orchestrator - Phase 5 (REFACTOR) → refactoring-expert 호출

```text
Orchestrator:
"Phase 5: REFACTOR - 코드 품질을 개선합니다.

<uses Task tool to launch refactoring-expert agent>"
```

**Orchestrator 검증:**

```bash
pnpm test
# ✓ 모든 테스트 통과 유지

pnpm lint
# ✓ ESLint 에러 없음
```

#### Step 8: Orchestrator - Phase 6 (VALIDATE) - 최종 검증

```text
Orchestrator:
"Phase 6: VALIDATE - 최종 통합 검증을 수행합니다.

검증 명령어 실행:
- pnpm test (모든 테스트)
- pnpm test:coverage (커버리지)
- pnpm lint (코드 품질)
- pnpm lint:tsc (타입 검사)

최종 산출물: .claude/agent-docs/orchestrator/logs/2025-10-30_repeat-event-final-report.md
"
```

---

### 핵심 포인트

1. **에이전트 호출 방식**:
   - ❌ CLI 명령어 (`claude code --agent`)는 지원되지 않음
   - ✅ 대화 중 **Task tool** 사용

2. **Handoff 문서**:
   - 각 Phase 전에 Orchestrator가 생성
   - 다음 에이전트의 입력 계약 역할

3. **독립 실행**:
   - 각 에이전트는 Handoff 문서만 읽고 작업
   - 이전 Phase의 암묵적 컨텍스트 접근 불가

4. **검증**:
   - 각 Phase 완료 후 Orchestrator가 검증
   - 검증 실패 시 재작업 또는 롤백

5. **문서 기반 통신**:
   - 에이전트 간 직접 통신 없음
   - 모든 통신은 파일 시스템 기반

---

## 📝 계약 준수 체크리스트

Orchestrator 실행 시 다음을 확인:

### 입력 단계

- [ ] 사용자 요구사항이 명확한가?
- [ ] CLAUDE.md를 참조했는가?
- [ ] folder-tree.md를 확인했는가?

### 계획 단계

- [ ] Work Plan이 모든 필수 섹션을 포함하는가?
- [ ] Phase 1-6이 명확히 정의되었는가?
- [ ] 각 Phase의 에이전트가 할당되었는가?

### Handoff 생성

- [ ] handoff 파일이 YAML 형식을 따르는가?
- [ ] 모든 필수 필드가 포함되었는가?
- [ ] 입력 파일 경로가 정확한가?
- [ ] 출력 요구사항이 명확한가?

### 검증 단계

- [ ] 산출물이 지정된 경로에 생성되었는가?
- [ ] 모든 검증 기준을 통과했는가?
- [ ] 다음 Phase로 진행 가능한가?

### 최종 단계

- [ ] 모든 Phase가 완료되었는가?
- [ ] 최종 검증 보고서가 작성되었는가?
- [ ] 모든 산출물이 정리되었는가?

---

---

**마지막 업데이트**: 2025-10-30
**버전**: 1.0.1 (경로 수정)
**관련 문서**:

- [orchestrator.md](../../agents/orchestrator.md) - 역할 정의
- [prompt.md](./prompt.md) - 실행 매뉴얼
- [getting-started.md](./getting-started.md) - 시작 가이드
