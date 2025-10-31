---
phase: 0
agent: orchestrator
timestamp: 2025-10-30T21:54:00Z
status: completed
previous_phase: null

inputs:
  requirement: "반복 일정 수정 시 단일/전체 수정 선택 기능"
  context_files:
    - /Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/CLAUDE.md
    - /Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/App.tsx
    - /Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/types.ts

references:
  agent_definition: ../../agents/orchestrator.md
  agent_prompt: ../orchestrator/prompt.md
  shared_docs:
    - ../../docs/folder-tree.md
    - ../../docs/git-workflow-guide.md

output_requirements:
  path: .claude/agent-docs/orchestrator/logs/orchestrator-log.md
  required_sections:
    - 요구사항 분석
    - 현재 상태 (AS-IS)
    - 개선 방향 (TO-BE)
    - 6단계 TDD 파이프라인
    - 기술 스택
    - 위험 요소
  format: markdown

constraints:
  - 기존 코드 최소 변경
  - Material-UI 컴포넌트 사용
  - GWT 패턴 테스트
  - 한글 메시지

validation_criteria:
  - 요구사항 명확화 완료
  - 6개 Phase 작업 계획 수립
  - 기술 스택 선정 완료
  - 위험 요소 식별 완료
---

# Phase 0: 반복 일정 수정 기능 계획

## 개요

**Feature**: 반복 일정 수정 시 단일/전체 수정 선택 기능
**Date**: 2025-10-30
**Status**: Planning Complete

---

## 요구사항 분석

### 사용자 스토리
```
AS a 사용자
WHEN 반복 일정을 수정하려고 할 때
THEN 해당 일정만 수정할지, 전체 시리즈를 수정할지 선택할 수 있다

조건:
- "해당 일정만 수정하시겠어요?" 다이얼로그 표시
- "예" 선택 시: 단일 일정으로 변경 (repeatInfo 제거)
- "아니오" 선택 시: 전체 반복 시리즈 수정 (PUT /api/recurring-events/:repeatId)
```

### 현재 상태 (AS-IS)

**문제점**:
- 반복 일정 수정 다이얼로그가 있지만, "전체 수정"만 가능
- 단일 일정만 수정하는 옵션이 없음
- 다이얼로그 메시지가 부정확 ("전체 수정하시겠습니까?" → "해당 일정만 수정하시겠어요?")

**기존 코드 구조**:
```typescript
// App.tsx (Line 111-119)
const handleEditClick = (event: Event) => {
  if (event.repeat.type !== 'none' && event.repeat.id) {
    setSelectedRecurringEvent(event);
    setIsRecurringEditDialogOpen(true);
  } else {
    editEvent(event);
  }
};

// App.tsx (Line 135-145)
const handleRecurringSeriesUpdate = async () => {
  if (!selectedRecurringEvent?.repeat.id) return;
  await updateRecurringSeries(selectedRecurringEvent.repeat.id, {
    title: selectedRecurringEvent.title,
    description: selectedRecurringEvent.description,
    location: selectedRecurringEvent.location,
    category: selectedRecurringEvent.category,
    notificationTime: selectedRecurringEvent.notificationTime,
  });
  setIsRecurringEditDialogOpen(false);
  setSelectedRecurringEvent(null);
};
```

### 목표 상태 (TO-BE)

1. **다이얼로그 UI 개선**
   - 제목: "반복 일정 수정"
   - 메시지: "해당 일정만 수정하시겠어요?"
   - 버튼: "예" / "아니오" / "취소"

2. **단일 수정 흐름 (예 선택)**
   - repeatInfo 제거 (`repeat: { type: 'none', interval: 1 }`)
   - 단일 이벤트로 수정 (PUT /api/events/:id)
   - 성공 메시지: "일정이 수정되었습니다."

3. **전체 수정 흐름 (아니오 선택)**
   - 폼에 현재 이벤트 데이터 로드
   - 사용자가 수정 후 저장
   - 전체 시리즈 수정 (PUT /api/recurring-events/:repeatId)
   - 성공 메시지: "반복 일정 시리즈가 수정되었습니다."

---

## 아키텍처 설계

### 컴포넌트 구조

```
App.tsx
  ├── RecurringEditDialog (기존 개선)
  │   ├── 제목: "반복 일정 수정"
  │   ├── 메시지: "해당 일정만 수정하시겠어요?"
  │   └── 버튼: "예" | "아니오" | "취소"
  │
  └── Event List Item
      └── Edit Button → handleEditClick()
```

### 상태 관리

**App.tsx 상태 (기존 유지)**:
```typescript
const [isRecurringEditDialogOpen, setIsRecurringEditDialogOpen] = useState(false);
const [selectedRecurringEvent, setSelectedRecurringEvent] = useState<Event | null>(null);
```

### 핵심 로직 흐름

```
[Edit 버튼 클릭]
     ↓
[handleEditClick(event)]
     ↓
[event.repeat.type !== 'none' && event.repeat.id?]
     ├─ Yes → [다이얼로그 표시]
     │          ├─ "예" → [handleEditSingleOccurrence] → 단일 수정
     │          ├─ "아니오" → [handleEditAllOccurrences] → 폼 로드 → 전체 수정
     │          └─ "취소" → [다이얼로그 닫기]
     └─ No → [editEvent(event)] (기존 로직)
```

---

## 기술 스택

- React + TypeScript
- Material-UI Dialog
- Existing Hooks: useEventForm, useEventOperations
- API: PUT /api/events/:id, PUT /api/recurring-events/:repeatId

---

## Phase별 작업 분해

### Phase 1: Feature Design (feature-designer)
**목표**: 사용자 흐름 및 UI 명세 작성
- RecurringEditDialog 개선 명세
- 단일/전체 수정 흐름 상세 설계
- 에러 핸들링 시나리오

### Phase 2: Test Design (test-designer)
**목표**: 테스트 시나리오 및 케이스 정의
- 단일 수정 테스트 시나리오
- 전체 수정 테스트 시나리오
- 다이얼로그 상호작용 테스트
- API 모킹 전략

### Phase 3: RED - Test Writing (test-writer)
**목표**: 실패하는 테스트 작성
- `task.recurring-edit.spec.tsx` 작성
- GWT 패턴 적용
- MSW 핸들러 확장

### Phase 4: GREEN - Implementation (code-writer)
**목표**: 기능 구현
- `handleEditSingleOccurrence` 함수 구현
- `handleEditAllOccurrences` 함수 구현
- RecurringEditDialog UI 개선
- useEventOperations 훅 확장 (필요 시)

### Phase 5: REFACTOR - Code Quality (refactoring-expert)
**목표**: 코드 품질 개선
- 중복 코드 제거
- 타입 안전성 강화
- 접근성 개선
- 에러 메시지 일관성

### Phase 6: VALIDATE - Final Verification (orchestrator)
**목표**: 통합 테스트 및 검증
- 전체 테스트 통과 확인
- 커버리지 목표 달성
- 브라우저 테스트
- 문서 업데이트

---

## 우선순위

**P0 (Critical)**:
- [x] 프로젝트 구조 분석
- [ ] Phase 1-6 순차 실행

**제약 조건**:
- 기존 단일 일정 수정 로직 유지
- 기존 반복 일정 삭제 기능 유지
- App.tsx 구조 최소 변경 (661줄 → 추가 분리 없이)
- CLAUDE.md 컨벤션 준수

---

## 성공 기준

### 기능 요구사항
- [x] 반복 일정 수정 시 다이얼로그 표시
- [ ] "예" 선택 시 단일 일정으로 변경 (repeatInfo 제거)
- [ ] "아니오" 선택 시 폼에 데이터 로드
- [ ] 전체 시리즈 수정 API 호출 성공
- [ ] 적절한 성공/에러 메시지 표시

### 품질 요구사항
- [ ] 모든 테스트 통과 (100%)
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 없음
- [ ] GWT 패턴 준수
- [ ] 한글 메시지 사용

### 사용자 경험
- [ ] 명확한 다이얼로그 메시지
- [ ] 직관적인 버튼 레이블
- [ ] 즉각적인 피드백 (snackbar)
- [ ] 에러 상황 graceful 처리

---

## 다음 단계

### Handoff → Phase 1
**파일**: `handoff/phase1.md`
**담당**: feature-designer
**입력**:
- 이 계획 문서 (phase0-plan.md)
- src/App.tsx (현재 구현)
- src/types.ts (타입 정의)
- src/hooks/useEventForm.ts (폼 로직)
- src/hooks/useEventOperations.ts (API 로직)

**출력 요구사항**:
1. RecurringEditDialog 개선 명세 (props, 메시지, 버튼)
2. handleEditSingleOccurrence 함수 명세 (시그니처, 로직)
3. handleEditAllOccurrences 함수 명세 (시그니처, 로직)
4. 에러 핸들링 시나리오 (API 실패, 네트워크 에러)
5. 사용자 피드백 메시지 목록 (한글)

---

**작성자**: Orchestrator
**검토자**: -
**승인일**: 2025-10-30
