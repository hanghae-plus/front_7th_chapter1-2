# Git 워크플로우 가이드

Orchestrator 에이전트가 관리하는 Git 기반 6단계 TDD 파이프라인의 완전한 워크플로우 가이드입니다.

---

## 📋 목차

1. [완전한 워크플로우 예시](#완전한-워크플로우-예시)
2. [Phase별 상세 가이드](#phase별-상세-가이드)
3. [검증 실패 및 롤백](#검증-실패-및-롤백)
4. [병렬 기능 개발](#병렬-기능-개발)
5. [트러블슈팅](#트러블슈팅)

---

## 🎯 완전한 워크플로우 예시

### 시나리오: 반복 일정 기능 추가

**요구사항**:

```text
@agent-orchestrator

이 프로젝트에 반복 일정 기능을 추가하고 싶습니다.

## 기능 요구사항
- 일정 생성 시 반복 유형 선택 가능
- 반복 유형: 매일, 매주, 매월, 매년
- 반복 종료 날짜 설정 가능
```

### 전체 Git 히스토리

```bash
# 최종 히스토리 (완료 후)
* 8a9b2c3 (tag: feature/repeat-event-v1.0.0, feat/repeat-event) Phase-6: 반복 일정 기능 최종 검증 완료
* 7f8e1d2 (tag: phase-5-repeat-event) Phase-5: 반복 일정 기능 REFACTOR 단계 완료
* 6d7c0a1 (tag: phase-4-repeat-event) Phase-4: 반복 일정 기능 GREEN 단계 완료
* 5b6a9f0 (tag: phase-3-repeat-event) Phase-3: 반복 일정 기능 RED 단계 완료
* 4a5b8e9 (tag: phase-2-repeat-event) Phase-2: 반복 일정 테스트 전략 수립
* 3f4e7d8 (tag: phase-1-repeat-event) Phase-1: 반복 일정 기능 설계 완료
* 2d3c6a7 (tag: phase-0-repeat-event) Phase-0: 반복 일정 기능 계획 수립
* 1a2b5c6 (main) Docs: 프로젝트 규칙 업데이트
```

---

## 📝 Phase별 상세 가이드

### Phase 0: Planning

**Orchestrator 작업**:

1. 요구사항 분석
2. Feature slug 생성: "반복 일정" → `repeat-event`
3. Feature 브랜치 생성
4. Work Plan 작성

**Git 워크플로우**:

```bash
# 1. Feature 브랜치 생성
git checkout -b feat/repeat-event

# 2. Work Plan 작성 (Orchestrator)
# → .claude/agent-docs/orchestrator/logs/2024-10-30_repeat-event-plan.md
# → .claude/agent-docs/orchestrator/state/current-state.json

# 3. 검증 통과 후 커밋
git add .claude/agent-docs/orchestrator/logs/
git add .claude/agent-docs/orchestrator/state/
git commit -m "Phase-0: 반복 일정 기능 계획 수립

- 6단계 TDD 파이프라인 수립
- 타입 정의: RepeatType, RepeatInfo
- 작업 우선순위: types → utils → hooks → UI
- 산출물: logs/2024-10-30_repeat-event-plan.md"

# 4. Phase 태그 생성
git tag phase-0-repeat-event

# 5. 현재 상태 확인
git log --oneline -1
# 2d3c6a7 (HEAD -> feat/repeat-event, tag: phase-0-repeat-event) Phase-0: 반복 일정 기능 계획 수립

# 6. 다음 Phase 준비
# → handoff/phase1.md 생성
```

**산출물**:

```
.claude/agent-docs/orchestrator/
  ├── logs/2024-10-30_repeat-event-plan.md
  ├── state/current-state.json
  └── handoff/phase1.md (다음 Phase용)
```

---

### Phase 1: DESIGN (feature-designer)

**Orchestrator 작업**:

1. handoff/phase1.md 생성
2. Task tool로 feature-designer 호출
3. 산출물 검증 (spec.md)

**Git 워크플로우**:

```bash
# 1. feature-designer 에이전트 실행
<Task tool 호출>

# 2. 산출물 확인
ls -la .claude/agent-docs/feature-designer/logs/
# → 2024-10-30_repeat-event-spec.md

# 3. 검증 체크리스트
# ✅ spec.md 파일 생성됨
# ✅ 타입 정의 완료 (RepeatType, RepeatInfo)
# ✅ 컴포넌트 구조 명확
# ✅ API 인터페이스 설계 완료

# 4. 검증 통과 후 커밋
git add .claude/agent-docs/feature-designer/
git commit -m "Phase-1: 반복 일정 기능 설계 완료

- RepeatInfo 타입 정의
  - type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  - interval: number
  - endDate: string (optional)
- 반복 로직 설계
- UI 컴포넌트 구조 설계
- 산출물: feature-designer/logs/2024-10-30_repeat-event-spec.md"

# 5. Phase 태그 생성
git tag phase-1-repeat-event

# 6. 다음 Phase 준비
# → handoff/phase2.md 생성
```

**산출물**:

```
.claude/agent-docs/feature-designer/
  └── logs/2024-10-30_repeat-event-spec.md
```

---

### Phase 2: TEST DESIGN (test-designer)

**Orchestrator 작업**:

1. handoff/phase2.md 생성
2. Task tool로 test-designer 호출
3. 산출물 검증 (test-strategy.md)

**Git 워크플로우**:

```bash
# 1. test-designer 에이전트 실행
<Task tool 호출>

# 2. 산출물 확인
ls -la .claude/agent-docs/test-designer/logs/
# → 2024-10-30_repeat-event-test-strategy.md

# 3. 검증 체크리스트
# ✅ test-strategy.md 파일 생성됨
# ✅ 테스트 케이스 목록 완성 (15개)
# ✅ 목킹 전략 수립 (MSW)
# ✅ GWT 패턴 적용 계획
# ✅ 커버리지 목표 설정 (80% 이상)

# 4. 검증 통과 후 커밋
git add .claude/agent-docs/test-designer/
git commit -m "Phase-2: 반복 일정 테스트 전략 수립

- 테스트 케이스 설계 완료 (15개)
  - 유닛 테스트: RepeatInfo 타입, 유틸 함수
  - 통합 테스트: useRepeatEvent 훅
  - E2E 테스트: 반복 일정 생성 시나리오
- 목킹 전략: MSW로 API 모킹
- GWT 패턴 적용
- 커버리지 목표: 80%
- 산출물: test-designer/logs/2024-10-30_repeat-event-test-strategy.md"

# 5. Phase 태그 생성
git tag phase-2-repeat-event

# 6. 다음 Phase 준비
# → handoff/phase3.md 생성
```

**산출물**:

```
.claude/agent-docs/test-designer/
  └── logs/2024-10-30_repeat-event-test-strategy.md
```

---

### Phase 3: RED (test-writer)

**Orchestrator 작업**:

1. handoff/phase3.md 생성
2. Task tool로 test-writer 호출
3. 테스트 실행 및 검증 (모두 실패해야 함)

**Git 워크플로우**:

```bash
# 1. test-writer 에이전트 실행
<Task tool 호출>

# 2. 테스트 파일 확인
ls -la src/__tests__/
# → task.repeat-event.spec.ts

# 3. 테스트 실행 (반드시 실패해야 함)
pnpm test task.repeat-event.spec.ts

# 예상 결과:
# FAIL src/__tests__/task.repeat-event.spec.ts
#   ✗ RepeatInfo 타입 정의 확인
#   ✗ 반복 일정 생성 테스트
#   ✗ 매일 반복 설정 테스트
#   ...
# Tests: 0 passed, 15 failed, 15 total

# 4. 검증 체크리스트
# ✅ task.repeat-event.spec.ts 생성됨
# ✅ 모든 테스트 실패 (RED) ⭐ 중요!
# ✅ 실패 메시지가 명확함
# ✅ 구현 코드 없음 확인
ls src/hooks/useRepeatEvent.ts  # → 없어야 함
ls src/utils/repeatUtils.ts     # → 없어야 함

# 5. 검증 통과 후 커밋
git add src/__tests__/task.repeat-event.spec.ts
git add .claude/agent-docs/test-writer/
git commit -m "Phase-3: 반복 일정 기능 RED 단계 완료

- 테스트 파일 작성 완료 (15개 테스트)
- 모든 테스트 실패 확인 (RED) ✓
- GWT 패턴 적용
- 구현 코드 없음 검증 완료
- 산출물: src/__tests__/task.repeat-event.spec.ts"

# 6. Phase 태그 생성
git tag phase-3-repeat-event

# 7. 다음 Phase 준비
# → handoff/phase4.md 생성
```

**산출물**:

```
src/__tests__/task.repeat-event.spec.ts
.claude/agent-docs/test-writer/
  └── logs/red-phase-log.md
```

**중요**: Phase 3에서 테스트가 통과하면 안 됩니다! 통과하면 검증 실패 → 롤백해야 합니다.

---

### Phase 4: GREEN (code-writer)

**Orchestrator 작업**:

1. handoff/phase4.md 생성
2. Task tool로 code-writer 호출
3. 테스트 실행 및 검증 (모두 통과해야 함)

**Git 워크플로우**:

```bash
# 1. code-writer 에이전트 실행
<Task tool 호출>

# 2. 구현 파일 확인
ls -la src/
# → src/types.ts (RepeatInfo 추가됨)
# → src/hooks/useRepeatEvent.ts (생성됨)
# → src/utils/repeatUtils.ts (생성됨)

# 3. TypeScript 컴파일 확인
pnpm lint:tsc
# 예상: ✓ No errors

# 4. 테스트 실행 (반드시 통과해야 함)
pnpm test task.repeat-event.spec.ts

# 예상 결과:
# PASS src/__tests__/task.repeat-event.spec.ts
#   ✓ RepeatInfo 타입 정의 확인
#   ✓ 반복 일정 생성 테스트
#   ✓ 매일 반복 설정 테스트
#   ...
# Tests: 15 passed, 15 total

# 5. 검증 체크리스트
# ✅ 구현 파일 생성됨 (types, hooks, utils)
# ✅ 모든 테스트 통과 (GREEN) ⭐ 중요!
# ✅ TypeScript 컴파일 성공
# ✅ 프로젝트 컨벤션 준수 (import order, naming)

# 6. 검증 통과 후 커밋
git add src/
git add .claude/agent-docs/code-writer/
git commit -m "Phase-4: 반복 일정 기능 GREEN 단계 완료

- 구현 코드 작성 완료
  - RepeatInfo 타입 추가 (src/types.ts)
  - useRepeatEvent 훅 구현
  - repeatUtils 유틸 함수 추가
- 모든 테스트 통과 (GREEN) ✓
- TypeScript 컴파일 성공
- 산출물: src/hooks/useRepeatEvent.ts, src/utils/repeatUtils.ts"

# 7. Phase 태그 생성
git tag phase-4-repeat-event

# 8. 다음 Phase 준비
# → handoff/phase5.md 생성
```

**산출물**:

```
src/
  ├── types.ts (수정)
  ├── hooks/useRepeatEvent.ts (생성)
  └── utils/repeatUtils.ts (생성)
.claude/agent-docs/code-writer/
  └── logs/green-phase-log.md
```

---

### Phase 5: REFACTOR (refactoring-expert)

**Orchestrator 작업**:

1. handoff/phase5.md 생성
2. Task tool로 refactoring-expert 호출
3. 테스트 재실행 및 품질 검증

**Git 워크플로우**:

```bash
# 1. refactoring-expert 에이전트 실행
<Task tool 호출>

# 2. 리팩토링 결과 확인
git diff src/

# 3. 테스트 재실행 (여전히 통과해야 함)
pnpm test
# 예상: ✓ All tests passed

# 4. 품질 검사
pnpm lint
# 예상: ✓ No ESLint errors or warnings

# 5. 검증 체크리스트
# ✅ 코드 품질 개선 완료
#   - 중복 코드 제거
#   - 변수명 명확화
#   - 함수 분리 (단일 책임)
# ✅ 테스트 여전히 통과 ⭐
# ✅ ESLint 검사 통과
# ✅ 성능 최적화 적용 (useMemo, useCallback)

# 6. 검증 통과 후 커밋
git add src/
git add .claude/agent-docs/refactoring-expert/
git commit -m "Phase-5: 반복 일정 기능 REFACTOR 단계 완료

- 코드 품질 개선
  - useRepeatEvent 훅 최적화 (useMemo, useCallback)
  - repeatUtils 함수 분리 및 명확화
  - 중복 코드 제거
- 성능 최적화 적용
- 모든 테스트 통과 유지 ✓
- ESLint 검사 통과
- 산출물: refactor-log.md"

# 7. Phase 태그 생성
git tag phase-5-repeat-event

# 8. 다음 Phase 준비 (마지막 Phase)
```

**산출물**:

```
src/ (개선됨)
.claude/agent-docs/refactoring-expert/
  └── logs/refactor-log.md
```

---

### Phase 6: VALIDATE (Orchestrator)

**Orchestrator 작업**:

1. 전체 통합 테스트 실행
2. 커버리지 확인
3. 품질 메트릭 확인
4. 최종 보고서 작성
5. Feature 완성 태그 생성
6. Main 브랜치 머지 옵션 제안

**Git 워크플로우**:

```bash
# 1. 전체 테스트 실행
pnpm test
# 예상: Tests: 42 passed, 42 total (기존 27 + 신규 15)

# 2. 커버리지 확인
pnpm test:coverage
# 예상: Coverage: 85% (목표 80% 달성)

# 3. 타입 검사
pnpm lint:tsc
# 예상: ✓ No errors

# 4. ESLint 검사
pnpm lint:eslint
# 예상: ✓ No errors or warnings

# 5. 수동 테스트 (개발 서버 실행)
pnpm dev
# → localhost:5173에서 반복 일정 기능 테스트

# 6. 검증 체크리스트
# ✅ 전체 테스트 통과율: 100% (42/42)
# ✅ 테스트 커버리지: 85%
# ✅ TypeScript 에러: 0
# ✅ ESLint 에러: 0
# ✅ 통합 시나리오 정상 작동
# ✅ 최종 보고서 작성됨

# 7. 최종 보고서 커밋
git add .claude/agent-docs/orchestrator/logs/
git commit -m "Phase-6: 반복 일정 기능 최종 검증 완료

- 전체 테스트 통과율: 100% (42/42)
- 테스트 커버리지: 85% (목표 80% 달성)
- TypeScript/ESLint 검사 통과
- 수동 테스트 완료
- 산출물: logs/2024-10-30_repeat-event-final-report.md"

# 8. Feature 완성 태그 생성
git tag feature/repeat-event-v1.0.0

# 9. 현재 브랜치 상태 확인
git log --oneline --decorate
```

**산출물**:

```
.claude/agent-docs/orchestrator/
  └── logs/2024-10-30_repeat-event-final-report.md
```

---

### Main 브랜치 머지

**Orchestrator가 사용자에게 제안**:

```text
✅ 모든 Phase 완료!

다음 중 선택하세요:

1. [추천] main 브랜치에 머지
   → git checkout main && git merge --no-ff feat/repeat-event

2. PR 생성 (팀 리뷰 필요 시)
   → gh pr create --base main --head feat/repeat-event

3. 추가 작업 계속 (브랜치 유지)
```

**사용자가 1번 선택 시**:

```bash
# 1. main 브랜치로 전환
git checkout main

# 2. Feature 브랜치 머지 (--no-ff로 머지 커밋 생성)
git merge --no-ff feat/repeat-event \
  -m "Feat: 반복 일정 기능 추가

- 매일/매주/매월/매년 반복 유형 지원
- RepeatInfo 타입 활성화 및 UI 통합
- useRepeatEvent 훅 추가
- repeatUtils 유틸리티 함수 추가
- 완료된 Phase: 0~6
- 테스트 커버리지: 85%"

# 3. 최종 히스토리 확인
git log --oneline --graph --all

# 예상 결과:
# *   9c8d7e6 (HEAD -> main) Feat: 반복 일정 기능 추가
# |\
# | * 8a9b2c3 (tag: feature/repeat-event-v1.0.0, feat/repeat-event) Phase-6: 반복 일정 기능 최종 검증 완료
# | * 7f8e1d2 (tag: phase-5-repeat-event) Phase-5: 반복 일정 기능 REFACTOR 단계 완료
# | * 6d7c0a1 (tag: phase-4-repeat-event) Phase-4: 반복 일정 기능 GREEN 단계 완료
# | * 5b6a9f0 (tag: phase-3-repeat-event) Phase-3: 반복 일정 기능 RED 단계 완료
# | * 4a5b8e9 (tag: phase-2-repeat-event) Phase-2: 반복 일정 테스트 전략 수립
# | * 3f4e7d8 (tag: phase-1-repeat-event) Phase-1: 반복 일정 기능 설계 완료
# | * 2d3c6a7 (tag: phase-0-repeat-event) Phase-0: 반복 일정 기능 계획 수립
# |/
# * 1a2b5c6 Docs: 프로젝트 규칙 업데이트

# 4. Feature 브랜치 정리 (선택)
git branch -d feat/repeat-event
```

---

## 🚨 검증 실패 및 롤백

### 시나리오 1: Phase 3에서 테스트가 통과함

**문제**:

```bash
# Phase 3 검증
$ pnpm test task.repeat-event.spec.ts

PASS src/__tests__/task.repeat-event.spec.ts  ← 문제! RED여야 함
  ✓ RepeatInfo 타입 정의 확인
  ✓ 반복 일정 생성 테스트

# Orchestrator 판단: 검증 실패
# 원인: 테스트 파일에 구현 코드가 포함되었거나, 이미 구현이 존재함
```

**롤백 프로세스**:

```bash
# 1. Phase 2로 롤백
git reset --hard phase-2-repeat-event

# 2. Phase 3 태그 제거 (생성되었을 경우)
git tag -d phase-3-repeat-event

# 3. 현재 상태 확인
git log --oneline -1
# 4a5b8e9 (HEAD -> feat/repeat-event, tag: phase-2-repeat-event) Phase-2: 반복 일정 테스트 전략 수립

# 4. 문제 분석 및 기록
cat > .claude/agent-docs/orchestrator/references/issues-log.md <<EOF
## Phase 3 검증 실패 (2024-10-30)

### 문제
- 테스트가 RED가 아닌 GREEN으로 통과함
- test-writer가 테스트 파일에 구현 코드를 포함시킴

### 원인
- handoff/phase3.md의 제약조건이 불명확함
- "구현 코드 절대 작성 금지" 강조 부족

### 해결책
- handoff/phase3-v2.md 생성
- 제약조건 강화:
  - "src/hooks, src/utils에 파일 생성 금지"
  - "테스트 파일만 작성, 다른 파일 수정 금지"
  - "테스트는 반드시 실패해야 함"

### 재시도
- test-writer 에이전트 재호출 (handoff/phase3-v2.md 사용)
EOF

# 5. 개선된 handoff 생성
# → handoff/phase3-v2.md (제약조건 강화)

# 6. Phase 3 재실행
<Task tool: test-writer 재호출>

# 7. 재검증
pnpm test task.repeat-event.spec.ts
# 예상: FAIL (모든 테스트 실패) ✓

# 8. 검증 통과 후 Phase 3 진행
git add src/__tests__/
git commit -m "Phase-3: 반복 일정 기능 RED 단계 완료

- 테스트 파일 작성 완료 (재작업)
- 모든 테스트 실패 확인 (RED)
- 구현 코드 없음 검증 완료"

git tag phase-3-repeat-event
```

---

### 시나리오 2: Phase 4에서 테스트가 여전히 실패함

**문제**:

```bash
# Phase 4 검증
$ pnpm test task.repeat-event.spec.ts

FAIL src/__tests__/task.repeat-event.spec.ts  ← 문제! GREEN이어야 함
  ✗ 반복 일정 생성 테스트
  ✗ 매일 반복 설정 테스트

# Orchestrator 판단: 검증 실패
# 원인: 구현이 불완전하거나 테스트 케이스와 맞지 않음
```

**롤백 프로세스**:

```bash
# 1. Phase 3으로 롤백
git reset --hard phase-3-repeat-event

# 2. Phase 4 태그 제거
git tag -d phase-4-repeat-event

# 3. 문제 분석
# → code-writer가 일부 기능만 구현
# → 테스트 케이스와 구현이 불일치

# 4. handoff/phase4-v2.md 생성 (실패 원인 명시)

# 5. Phase 4 재실행
<Task tool: code-writer 재호출>

# 6. 재검증 및 진행
```

---

### 시나리오 3: Phase 5에서 리팩토링 후 테스트 실패

**문제**:

```bash
# Phase 5 검증
$ pnpm test

FAIL src/__tests__/task.repeat-event.spec.ts  ← 문제! 리팩토링 후에도 통과해야 함
  ✗ 반복 일정 생성 테스트

# Orchestrator 판단: 검증 실패
# 원인: 리팩토링 중 로직 변경으로 테스트 깨짐
```

**롤백 프로세스**:

```bash
# 1. Phase 4로 롤백
git reset --hard phase-4-repeat-event

# 2. Phase 5 태그 제거
git tag -d phase-5-repeat-event

# 3. handoff/phase5-v2.md 생성
# → "테스트 통과 유지" 제약조건 강화
# → "로직 변경 금지, 구조 개선만" 명시

# 4. Phase 5 재실행
```

---

## 🔀 병렬 기능 개발

### 시나리오: 3개 기능 동시 개발

**요구사항**:

1. 반복 일정 기능 (feat/repeat-event)
2. 카테고리 필터 기능 (feat/category-filter)
3. 드래그 앤 드롭 기능 (feat/drag-drop)

**브랜치 구조**:

```bash
main
  ├── feat/repeat-event (Phase 4 진행 중)
  ├── feat/category-filter (Phase 1 완료)
  └── feat/drag-drop (Phase 0 완료)
```

**Git 히스토리**:

```bash
$ git log --oneline --all --graph

# feat/repeat-event 브랜치
* 6d7c0a1 (HEAD -> feat/repeat-event, tag: phase-4-repeat-event) Phase-4: 반복 일정 기능 GREEN 단계 완료
* 5b6a9f0 (tag: phase-3-repeat-event) Phase-3: 반복 일정 기능 RED 단계 완료
* 4a5b8e9 (tag: phase-2-repeat-event) Phase-2: 반복 일정 테스트 전략 수립
* 3f4e7d8 (tag: phase-1-repeat-event) Phase-1: 반복 일정 기능 설계 완료
* 2d3c6a7 (tag: phase-0-repeat-event) Phase-0: 반복 일정 기능 계획 수립

# feat/category-filter 브랜치
| * 8e9f1a2 (feat/category-filter, tag: phase-1-category-filter) Phase-1: 카테고리 필터 설계 완료
| * 7d8c0b1 (tag: phase-0-category-filter) Phase-0: 카테고리 필터 계획 수립

# feat/drag-drop 브랜치
| | * 9f0a2b3 (feat/drag-drop, tag: phase-0-drag-drop) Phase-0: 드래그 앤 드롭 계획 수립
| |/
|/
* 1a2b5c6 (main) Docs: 프로젝트 규칙 업데이트
```

**Phase 태그 구분**:

```bash
# feat/repeat-event의 Phase 태그
phase-0-repeat-event
phase-1-repeat-event
phase-2-repeat-event
phase-3-repeat-event
phase-4-repeat-event

# feat/category-filter의 Phase 태그
phase-0-category-filter
phase-1-category-filter

# feat/drag-drop의 Phase 태그
phase-0-drag-drop
```

**완료 순서대로 main에 머지**:

```bash
# 1. repeat-event 먼저 완료 (Phase 6 완료)
git checkout main
git merge --no-ff feat/repeat-event \
  -m "Feat: 반복 일정 기능 추가

- 매일/매주/매월/매년 반복 유형 지원
- 완료된 Phase: 0~6"

# 2. category-filter 나중에 완료
git merge --no-ff feat/category-filter \
  -m "Feat: 카테고리 필터 기능 추가

- 업무/개인/기타 카테고리 필터링
- 완료된 Phase: 0~6"

# 3. drag-drop 마지막 완료
git merge --no-ff feat/drag-drop \
  -m "Feat: 드래그 앤 드롭 기능 추가

- 일정을 드래그하여 시간 변경
- 완료된 Phase: 0~6"
```

---

## 🔍 트러블슈팅

### 문제 1: "Phase 태그가 이미 존재합니다"

**증상**:

```bash
$ git tag phase-3-repeat-event
fatal: tag 'phase-3-repeat-event' already exists
```

**원인**: 이전 시도에서 생성된 태그가 남아있음

**해결**:

```bash
# 기존 태그 삭제
git tag -d phase-3-repeat-event

# 새 태그 생성
git tag phase-3-repeat-event
```

---

### 문제 2: "롤백 후 파일이 사라지지 않습니다"

**증상**:

```bash
$ git reset --hard phase-2-repeat-event
$ ls src/hooks/
useRepeatEvent.ts  ← Phase 4에서 생성된 파일인데 아직 있음
```

**원인**: 파일이 `.gitignore`에 포함되어 Git 추적 안 됨

**해결**:

```bash
# Git이 추적하지 않는 파일 확인
git status --ignored

# Untracked 파일 모두 삭제
git clean -fd

# Ignored 파일도 삭제 (주의!)
git clean -fdx
```

---

### 문제 3: "머지 충돌이 발생했습니다"

**증상**:

```bash
$ git merge --no-ff feat/category-filter
Auto-merging src/types.ts
CONFLICT (content): Merge conflict in src/types.ts
```

**원인**: 두 기능이 같은 파일을 수정함

**해결**:

```bash
# 1. 충돌 파일 확인
git status

# 2. 충돌 해결 (VS Code에서 열기)
code src/types.ts

# 3. 충돌 마커 제거 후 저장
# <<<<<<< HEAD
# =======
# >>>>>>> feat/category-filter

# 4. 해결 완료 표시
git add src/types.ts

# 5. 머지 커밋 생성
git commit  # 자동으로 머지 커밋 메시지 생성됨
```

---

### 문제 4: "Feature 브랜치가 main과 너무 멀어졌습니다"

**증상**:

```bash
# feat/repeat-event에서 Phase 3 진행 중
# 하지만 main에 다른 기능 10개가 이미 머지됨
# feat/repeat-event는 오래된 main에서 분기됨
```

**해결** (Phase 진행 중에는 권장하지 않음):

```bash
# 옵션 1: Feature 브랜치에서 main을 머지 (권장)
git checkout feat/repeat-event
git merge main \
  -m "Merge: main 브랜치 최신 변경사항 반영

- 다른 기능들의 타입 변경 반영"

# 옵션 2: Rebase (Phase 도중에는 위험, 권장 안 함)
# git rebase main  # 태그 위치가 변경됨!
```

**권장사항**: Feature 브랜치는 빠르게 완료하고 main에 머지하는 것이 좋습니다.

---

## 📚 참고 문서

- [git-commit-convention.md](./git-commit-convention.md) - Git 커밋 메시지 규칙
- [orchestrator/contract.md](../agent-docs/orchestrator/contract.md) - Orchestrator 계약 명세
- [orchestrator/prompt.md](../agent-docs/orchestrator/prompt.md) - Orchestrator 실행 매뉴얼
- [orchestrator/getting-started.md](../agent-docs/orchestrator/getting-started.md) - Orchestrator 시작 가이드

---

**마지막 업데이트**: 2024-10-30
**버전**: 1.0.0
