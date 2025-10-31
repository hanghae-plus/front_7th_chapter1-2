---
phase: 1
agent: feature-designer
timestamp: 2025-10-30T21:55:00Z
status: ready
previous_phase: 0

inputs:
  requirement: "반복 일정 수정 기능의 사용자 흐름 및 UI 명세 작성"
  context_files:
    - ./phase0-plan.md
    - /Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/App.tsx
    - /Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/types.ts
    - /Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/hooks/useEventForm.ts
    - /Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/hooks/useEventOperations.ts

references:
  agent_definition: ../../agents/feature-designer.md
  agent_prompt: ../feature-designer/prompt.md
  shared_docs:
    - ../../docs/folder-tree.md
    - ../../docs/git-commit-convention.md

output_requirements:
  path: .claude/agent-docs/feature-designer/logs/spec.md
  required_sections:
    - 개요
    - 사용자 흐름
    - UI 명세
    - 함수 명세
    - 에러 핸들링
    - 메시지 목록
    - 참고 사항
  format: markdown

constraints:
  - Material-UI Dialog 컴포넌트 사용
  - 기존 useEventForm, useEventOperations 훅 활용
  - App.tsx 구조 최소 변경
  - 한글 메시지 사용
  - 접근성 속성 필수
  - GWT 패턴 준수

validation_criteria:
  - RecurringEditDialog UI 명세 완료
  - handleEditSingleOccurrence 함수 명세 완료
  - handleEditAllOccurrences 함수 명세 완료
  - saveEvent 수정 방안 제시
  - 에러 핸들링 시나리오 작성
  - 사용자 피드백 메시지 목록 작성
  - 기존 코드와의 통합 포인트 문서화
---

# Phase 1 Handoff: Feature Design

## 에이전트 정보
**수신자**: feature-designer
**발신자**: orchestrator
**Phase**: 1/6 - Feature Design
**생성일**: 2025-10-30

---

## 작업 목표

반복 일정 수정 기능의 사용자 흐름 및 UI 명세를 작성합니다.

### 입력 산출물
- [계획 문서](./phase0-plan.md)
- 현재 구현: `/Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/App.tsx`
- 타입 정의: `/Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/types.ts`
- 폼 훅: `/Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/hooks/useEventForm.ts`
- API 훅: `/Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/hooks/useEventOperations.ts`

### 출력 산출물
`.claude/agent-docs/feature-designer/logs/spec.md` 파일 생성

---

## 요구사항

### 1. RecurringEditDialog UI 명세

다음 내용을 포함하여 작성하세요:

- **Dialog Props**: open, onClose, event (선택된 반복 일정)
- **제목**: "반복 일정 수정"
- **메시지**: "해당 일정만 수정하시겠어요?"
- **버튼 구성**:
  - "예": 단일 수정 (primary)
  - "아니오": 전체 수정 (기본)
  - "취소": 다이얼로그 닫기
- **접근성**: aria-label, data-testid 정의

### 2. 단일 수정 흐름 (handleEditSingleOccurrence)

**함수 시그니처**:
```typescript
const handleEditSingleOccurrence = async () => {
  // 구현 내용을 명세로 작성
}
```

**로직**:
1. selectedRecurringEvent가 없으면 early return
2. repeatInfo 제거: `repeat: { type: 'none', interval: 1 }`
3. 단일 이벤트로 수정: `PUT /api/events/${event.id}`
4. fetchEvents() 호출하여 목록 갱신
5. 다이얼로그 닫기
6. 성공 메시지: "일정이 수정되었습니다."
7. 에러 시 메시지: "일정 수정 실패"

### 3. 전체 수정 흐름 (handleEditAllOccurrences)

**함수 시그니처**:
```typescript
const handleEditAllOccurrences = () => {
  // 구현 내용을 명세로 작성
}
```

**로직**:
1. selectedRecurringEvent가 없으면 early return
2. editEvent(selectedRecurringEvent) 호출하여 폼에 데이터 로드
3. 다이얼로그 닫기
4. 사용자가 폼에서 수정 후 "일정 수정" 버튼 클릭
5. saveEvent 호출 시 반복 일정 감지
6. updateRecurringSeries API 호출 (기존 로직 활용)

**문제**: saveEvent가 단일 수정과 전체 수정을 구분하지 못함
**해결**: 플래그 변수 또는 상태로 구분 필요 (예: `isEditingRecurringSeries`)

### 4. 에러 핸들링 시나리오

다음 상황에 대한 처리 방법을 명세하세요:

- **API 실패** (네트워크 에러, 500 에러)
  - 에러 메시지 표시
  - 다이얼로그 상태 유지 (사용자가 재시도 가능)

- **404 Not Found** (반복 시리즈 없음)
  - "반복 일정 시리즈를 찾을 수 없습니다."
  - 다이얼로그 닫기

- **유효성 검사 실패** (폼 에러)
  - 기존 useEventForm 에러 처리 활용
  - 저장 버튼 비활성화 (기존 로직)

### 5. 사용자 피드백 메시지

모든 메시지를 한글로 작성하세요:

- 성공 메시지 (snackbar, variant: 'success')
- 에러 메시지 (snackbar, variant: 'error')
- 정보 메시지 (dialog, alert)

---

## 제약 조건

### 기술 제약
- Material-UI Dialog 컴포넌트 사용
- 기존 useEventForm, useEventOperations 훅 활용
- App.tsx 구조 최소 변경 (추가 컴포넌트 분리 없이)

### 스타일 가이드
- 한글 메시지 사용
- 접근성 속성 필수 (aria-label, data-testid)
- GWT 패턴 준수 (테스트용)

### 호환성
- 기존 단일 일정 수정 로직 유지
- 기존 반복 일정 삭제 기능 유지
- 기존 일정 생성 로직 영향 없음

---

## 출력 형식

### .claude/agent-docs/feature-designer/logs/spec.md 구조

```markdown
# 반복 일정 수정 기능 설계

## 개요
- 기능 설명
- 사용자 가치

## 사용자 흐름
- Flow Chart (Mermaid 또는 텍스트)
- 단계별 설명

## UI 명세
- RecurringEditDialog 디자인
- 버튼 레이아웃
- 접근성 속성

## 함수 명세
- handleEditSingleOccurrence
- handleEditAllOccurrences
- 관련 상태 변경

## 에러 핸들링
- 시나리오별 처리 방법
- 사용자 피드백

## 메시지 목록
- 성공/에러/정보 메시지

## 참고 사항
- 기존 코드와의 통합 포인트
- 주의사항
```

---

## 검증 체크리스트

완료 시 다음 항목을 확인하세요:

- [ ] RecurringEditDialog UI 명세 완료 (props, 제목, 메시지, 버튼)
- [ ] handleEditSingleOccurrence 함수 명세 완료 (시그니처, 로직)
- [ ] handleEditAllOccurrences 함수 명세 완료 (시그니처, 로직)
- [ ] saveEvent 수정 방안 제시 (단일/전체 구분 로직)
- [ ] 에러 핸들링 시나리오 작성 (API 실패, 404, 유효성)
- [ ] 사용자 피드백 메시지 목록 작성 (한글)
- [ ] 기존 코드와의 통합 포인트 문서화
- [ ] 제약 조건 준수 확인

---

## 다음 Phase

Phase 2로 전달할 내용:
- `.claude/agent-docs/feature-designer/logs/spec.md` (이번 Phase 산출물)
- 테스트 시나리오 도출을 위한 사용자 흐름
- 테스트 케이스 작성을 위한 함수 명세

**다음 에이전트**: test-designer
**다음 작업**: 테스트 시나리오 및 케이스 설계

---

**생성자**: orchestrator
**최종 수정**: 2025-10-30
