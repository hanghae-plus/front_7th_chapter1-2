# Git 커밋 및 브랜치 규칙

Orchestrator 에이전트가 관리하는 Git 커밋 메시지 및 브랜치 네이밍 규칙입니다.

---

## 📝 커밋 메시지 규칙

### 기본 원칙

1. **말머리 (Prefix)**: 파스칼케이스 영어
2. **타이틀/본문**: 한글
3. **Claude 서명**: 제외 (자동 생성 시그니처 사용 안 함)

### 말머리 종류

| 말머리 | 용도 | 예시 |
|--------|------|------|
| `Phase-N:` | Phase N 완료 커밋 | `Phase-3: RED 단계 완료` |
| `Feat:` | 새 기능 추가 (Main 머지) | `Feat: 반복 일정 기능 추가` |
| `Fix:` | 버그 수정 | `Fix: 일정 겹침 감지 오류 수정` |
| `Refactor:` | 코드 리팩토링 | `Refactor: 유틸 함수 구조 개선` |
| `Docs:` | 문서 수정 | `Docs: README 업데이트` |
| `Test:` | 테스트 추가/수정 | `Test: 반복 일정 테스트 추가` |
| `Chore:` | 기타 작업 | `Chore: 패키지 업데이트` |

### 커밋 메시지 포맷

**기본 구조**:

```text
말머리: 한글 타이틀

- 한글 상세 내용 1
- 한글 상세 내용 2
- 한글 상세 내용 3
```

**Phase 커밋 예시**:

```text
Phase-0: 반복 일정 기능 계획 수립

- 6단계 TDD 파이프라인 수립
- 타입, 유틸, 훅, UI 작업 세분화
- 산출물: logs/2024-10-30_repeat-event-plan.md
```

```text
Phase-3: 반복 일정 기능 RED 단계 완료

- 테스트 파일 작성 완료
- 모든 테스트 실패 확인 (RED)
- 산출물: src/__tests__/task.repeat-event.spec.ts
```

**Feature 완료 커밋 예시** (Main 머지 시):

```text
Feat: 반복 일정 기능 추가

- 매일/매주/매월/매년 반복 유형 지원
- RepeatInfo 타입 활성화 및 UI 통합
- 완료된 Phase: 0~6
```

**Bug Fix 커밋 예시**:

```text
Fix: 일정 겹침 감지 오류 수정

- 시간 비교 로직 수정
- 종일 이벤트 처리 개선
- 테스트 케이스 추가
```

### ❌ 피해야 할 커밋 메시지

**1. Claude 자동 생성 서명 포함**:

```text
❌ Phase-0: 반복 일정 기능 계획 수립

- 6단계 TDD 파이프라인 수립

🤖 Generated with Claude Code (https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**2. 영어 타이틀/본문**:

```text
❌ Phase-0: Repeat event feature planning

- Setup 6-phase TDD pipeline
- Break down tasks
```

**3. 소문자 말머리**:

```text
❌ phase-0: 반복 일정 기능 계획 수립
❌ feat: 반복 일정 기능 추가
```

### ✅ 올바른 커밋 메시지

```text
✅ Phase-0: 반복 일정 기능 계획 수립

- 6단계 TDD 파이프라인 수립
- 타입, 유틸, 훅, UI 작업 세분화
```

```text
✅ Feat: 반복 일정 기능 추가

- 매일/매주/매월/매년 반복 유형 지원
- RepeatInfo 타입 활성화
- 완료된 Phase: 0~6
```

---

## 🌿 브랜치 네이밍 규칙

### 브랜치 타입

| 브랜치 타입 | 네이밍 패턴 | 용도 | 예시 |
|------------|------------|------|------|
| Feature | `feat/[feature-slug]` | 새 기능 개발 | `feat/repeat-event` |
| Bug Fix | `fix/[bug-slug]` | 버그 수정 | `fix/overlap-detection` |
| Refactor | `refactor/[scope-slug]` | 코드 리팩토링 | `refactor/event-utils` |
| Experiment | `exp/[experiment-slug]` | 실험적 기능 | `exp/drag-drop-api` |

### Feature Slug 생성 방법

**규칙**:

1. 요구사항의 핵심 키워드 2-3개 추출
2. kebab-case로 작성 (소문자 + 하이픈)
3. 명사 중심 (동사 제외)

**예시**:

| 요구사항 | Feature Slug |
|---------|--------------|
| 반복 일정 기능 추가 | `repeat-event` |
| 카테고리별 필터링 기능 | `category-filter` |
| 드래그 앤 드롭으로 일정 변경 | `drag-drop` |
| 일정 검색 성능 개선 | `search-optimization` |
| 알림 시스템 리팩토링 | `notification-refactor` |

### 브랜치 예시

```bash
# 좋은 예
✅ feat/repeat-event
✅ feat/category-filter
✅ fix/overlap-bug
✅ refactor/date-utils

# 나쁜 예
❌ feature/add-repeat-event-feature  # 너무 길고 중복
❌ feat/repeatEvent                  # camelCase 사용
❌ feat/repeat_event                 # snake_case 사용
❌ repeat-event                      # 타입 접두사 없음
```

---

## 🏷️ Git 태그 규칙

### Phase 태그

**포맷**: `phase-N-[feature-slug]`

**예시**:

```bash
phase-0-repeat-event
phase-1-repeat-event
phase-2-repeat-event
phase-3-repeat-event
phase-4-repeat-event
phase-5-repeat-event
```

**사용 시점**: 각 Phase 검증 통과 직후

**명령어**:

```bash
git tag phase-0-repeat-event
git tag phase-1-repeat-event
```

### Feature 완성 태그

**포맷**: `feature/[feature-slug]-v[major].[minor].[patch]`

**예시**:

```bash
feature/repeat-event-v1.0.0
feature/category-filter-v1.0.0
```

**사용 시점**: Phase 6 (VALIDATE) 완료 직후, Main 머지 전

**버전 규칙**:

- **Major (1.x.x)**: 첫 릴리스는 항상 1.0.0
- **Minor (x.1.x)**: 기능 개선 시
- **Patch (x.x.1)**: 버그 수정 시

**명령어**:

```bash
git tag feature/repeat-event-v1.0.0
```

### 태그 확인

```bash
# 모든 태그 보기
git tag -l

# 특정 feature의 태그만 보기
git tag -l "phase-*-repeat-event"
git tag -l "feature/repeat-event-*"
```

---

## 🔄 Git 워크플로우 통합

### Phase별 커밋 및 태그

**Phase 0**:

```bash
git checkout -b feat/repeat-event
git add .claude/agent-docs/orchestrator/
git commit -m "Phase-0: 반복 일정 기능 계획 수립

- 6단계 TDD 파이프라인 수립
- 타입, 유틸, 훅, UI 작업 세분화"

git tag phase-0-repeat-event
```

**Phase 1**:

```bash
git add .claude/agent-docs/feature-designer/
git commit -m "Phase-1: 반복 일정 기능 설계 완료

- RepeatInfo 타입 정의
- 반복 로직 설계"

git tag phase-1-repeat-event
```

**Phase 2**:

```bash
git add .claude/agent-docs/test-designer/
git commit -m "Phase-2: 반복 일정 테스트 전략 수립

- 테스트 케이스 설계 완료
- 목킹 전략 및 GWT 패턴 적용"

git tag phase-2-repeat-event
```

**Phase 3**:

```bash
git add src/__tests__/task.*.spec.ts
git add .claude/agent-docs/test-writer/
git commit -m "Phase-3: 반복 일정 기능 RED 단계 완료

- 테스트 파일 작성 완료
- 모든 테스트 실패 확인 (RED)"

git tag phase-3-repeat-event
```

**Phase 4**:

```bash
git add src/
git add .claude/agent-docs/code-writer/
git commit -m "Phase-4: 반복 일정 기능 GREEN 단계 완료

- 구현 코드 작성 완료
- 모든 테스트 통과 (GREEN)
- TypeScript 컴파일 성공"

git tag phase-4-repeat-event
```

**Phase 5**:

```bash
git add src/
git add .claude/agent-docs/refactoring-expert/
git commit -m "Phase-5: 반복 일정 기능 REFACTOR 단계 완료

- 코드 품질 개선 완료
- 성능 최적화 적용
- 모든 테스트 통과 유지"

git tag phase-5-repeat-event
```

**Phase 6**:

```bash
git add .claude/agent-docs/orchestrator/logs/
git commit -m "Phase-6: 반복 일정 기능 최종 검증 완료

- 전체 테스트 통과율: 100%
- 테스트 커버리지: 85%
- TypeScript/ESLint 검사 통과"

git tag feature/repeat-event-v1.0.0
```

### Main 브랜치 머지

```bash
git checkout main
git merge --no-ff feat/repeat-event \
  -m "Feat: 반복 일정 기능 추가

- 매일/매주/매월/매년 반복 유형 지원
- RepeatInfo 타입 활성화 및 UI 통합
- 완료된 Phase: 0~6"
```

---

## 🚨 검증 실패 시 롤백

### 롤백 명령어

```bash
# Phase N 검증 실패 시 Phase N-1로 롤백
git reset --hard phase-{N-1}-[feature-slug]

# 실패한 Phase 태그 제거
git tag -d phase-N-[feature-slug]
```

### 예시: Phase 3 검증 실패

```bash
# 원인: 테스트가 통과해버림 (구현 코드 포함)

# Phase 2로 롤백
git reset --hard phase-2-repeat-event

# Phase 3 태그 제거
git tag -d phase-3-repeat-event

# 문제 분석 및 재시도
# → handoff/phase3-v2.md 생성
# → test-writer 에이전트 재호출
```

---

## 📊 Git 히스토리 예시

```bash
$ git log --oneline --decorate --graph

* 8a9b2c3 (tag: feature/repeat-event-v1.0.0, HEAD -> feat/repeat-event) Phase-6: 반복 일정 기능 최종 검증 완료
* 7f8e1d2 (tag: phase-5-repeat-event) Phase-5: 반복 일정 기능 REFACTOR 단계 완료
* 6d7c0a1 (tag: phase-4-repeat-event) Phase-4: 반복 일정 기능 GREEN 단계 완료
* 5b6a9f0 (tag: phase-3-repeat-event) Phase-3: 반복 일정 기능 RED 단계 완료
* 4a5b8e9 (tag: phase-2-repeat-event) Phase-2: 반복 일정 테스트 전략 수립
* 3f4e7d8 (tag: phase-1-repeat-event) Phase-1: 반복 일정 기능 설계 완료
* 2d3c6a7 (tag: phase-0-repeat-event) Phase-0: 반복 일정 기능 계획 수립
* 1a2b5c6 (main) Docs: 프로젝트 규칙 업데이트
```

---

## 📚 참고 문서

- [git-workflow-guide.md](./git-workflow-guide.md) - Git 워크플로우 상세 가이드
- [orchestrator/contract.md](../agent-docs/orchestrator/contract.md) - Orchestrator 계약 명세
- [orchestrator/prompt.md](../agent-docs/orchestrator/prompt.md) - Orchestrator 실행 매뉴얼
- [orchestrator/getting-started.md](../agent-docs/orchestrator/getting-started.md) - Orchestrator 시작 가이드

---

**마지막 업데이트**: 2024-10-30
**버전**: 1.0.0
