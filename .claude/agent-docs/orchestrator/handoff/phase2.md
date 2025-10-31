---
phase: 2
agent: test-designer
timestamp: 2025-10-30T22:05:00Z
status: ready
previous_phase: 1

inputs:
  requirement: "반복 일정 수정 기능의 테스트 시나리오 및 케이스 설계"
  context_files:
    - ./phase0-plan.md
    - .claude/agent-docs/feature-designer/logs/spec.md
    - /Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/__tests__/
    - /Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/__mocks__/handlers.ts

references:
  agent_definition: ../../agents/test-designer.md
  agent_prompt: ../test-designer/prompt.md
  shared_docs:
    - ../../docs/folder-tree.md
    - ../../docs/rule-of-make-good-test.md

output_requirements:
  path: .claude/agent-docs/test-designer/logs/test-strategy.md
  required_sections:
    - 테스트 전략
    - 테스트 시나리오
    - 에러 케이스
    - 엣지 케이스
    - MSW 핸들러 설계
    - 테스트 데이터
    - 테스트 케이스 목록
    - 참고 사항
  format: markdown

constraints:
  - Vitest + @testing-library/react 사용
  - MSW로 API 모킹
  - GWT 패턴 준수
  - 파일명: task.recurring-edit.spec.tsx
  - 접근성 테스트 포함

validation_criteria:
  - 모든 주요 시나리오 테스트 케이스 작성 (5개)
  - 에러 케이스 테스트 케이스 작성 (3개)
  - 엣지 케이스 테스트 케이스 작성 (3개)
  - MSW 핸들러 전략 작성 (3개 API)
  - 테스트 데이터 설계 완료
  - GWT 패턴 적용 방법 명시
  - 접근성 테스트 전략 포함
  - 기존 테스트 파일 분석 완료
---

# Phase 2 Handoff: Test Design

## 에이전트 정보
**수신자**: test-designer
**발신자**: orchestrator
**Phase**: 2/6 - Test Design
**생성일**: 2025-10-30

---

## 작업 목표

반복 일정 수정 기능의 테스트 시나리오 및 케이스를 설계합니다.

### 입력 산출물
- [계획 문서](./phase0-plan.md)
- [기능 설계](.claude/agent-docs/feature-designer/logs/spec.md)
- 기존 테스트: `/Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/__tests__/`
- MSW 핸들러: `/Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/__mocks__/handlers.ts`

### 출력 산출물
`.claude/agent-docs/test-designer/logs/test-strategy.md` 파일 생성

---

## 요구사항

### 1. 테스트 전략

다음 내용을 포함하여 작성하세요:

#### 테스트 범위
- **단위 테스트**: 개별 함수 (handleEditSingleOccurrence, handleEditAllOccurrences)
- **통합 테스트**: 다이얼로그 상호작용 + API 호출
- **E2E 시나리오**: 전체 사용자 흐름

#### 테스트 도구
- Vitest + @testing-library/react
- MSW (Mock Service Worker) - API 모킹
- GWT 패턴 (Given-When-Then)

#### 커버리지 목표
- 모든 사용자 시나리오 커버
- 에러 케이스 포함
- 엣지 케이스 포함

### 2. 테스트 시나리오

다음 시나리오에 대한 테스트 케이스를 작성하세요:

#### 시나리오 1: 반복 일정 수정 다이얼로그 표시
**Given**: 반복 일정이 존재할 때
**When**: Edit 버튼을 클릭하면
**Then**: "반복 일정 수정" 다이얼로그가 표시되어야 함

**검증 항목**:
- 다이얼로그 제목: "반복 일정 수정"
- 메시지: "해당 일정만 수정하시겠어요?"
- 버튼: "예", "아니오", "취소"

#### 시나리오 2: 단일 일정으로 수정 (예 선택)
**Given**: 반복 일정 수정 다이얼로그가 열려 있을 때
**When**: "예" 버튼을 클릭하면
**Then**:
- API 호출: PUT /api/events/:id (repeatInfo 제거된 데이터)
- 성공 메시지: "일정이 수정되었습니다."
- 다이얼로그 닫힘
- 일정 목록에서 반복 아이콘 제거됨

#### 시나리오 3: 전체 시리즈 수정 (아니오 선택)
**Given**: 반복 일정 수정 다이얼로그가 열려 있을 때
**When**: "아니오" 버튼을 클릭하면
**Then**:
- 다이얼로그 닫힘
- 폼에 선택된 일정 데이터 로드됨
- 반복 일정 체크박스 활성화됨

**후속 동작**:
**When**: 사용자가 폼 수정 후 "일정 수정" 버튼 클릭
**Then**:
- API 호출: PUT /api/recurring-events/:repeatId
- 성공 메시지: "반복 일정 시리즈가 수정되었습니다."
- 같은 repeatId를 가진 모든 일정이 수정됨

#### 시나리오 4: 다이얼로그 취소
**Given**: 반복 일정 수정 다이얼로그가 열려 있을 때
**When**: "취소" 버튼을 클릭하면
**Then**:
- 다이얼로그 닫힘
- 아무 작업도 수행되지 않음

#### 시나리오 5: 단일 일정 수정 (반복 아님)
**Given**: 단일 일정 (repeat.type === 'none')이 존재할 때
**When**: Edit 버튼을 클릭하면
**Then**:
- 다이얼로그가 표시되지 않음
- 바로 폼에 데이터 로드됨

### 3. 에러 케이스

다음 에러 상황에 대한 테스트 케이스를 작성하세요:

#### 에러 1: 단일 수정 API 실패
**Given**: 반복 일정 수정 다이얼로그가 열려 있을 때
**When**: "예" 버튼 클릭 시 API가 실패하면
**Then**:
- 에러 메시지: "일정 수정 실패"
- 다이얼로그 상태 유지 (재시도 가능)

#### 에러 2: 반복 시리즈 없음 (404)
**Given**: 반복 일정 수정 다이얼로그가 열려 있을 때
**When**: "아니오" 선택 후 시리즈 수정 시 404 응답
**Then**:
- 에러 메시지: "반복 일정 시리즈를 찾을 수 없습니다."
- 다이얼로그 닫힘

#### 에러 3: 선택된 일정 없음
**Given**: selectedRecurringEvent가 null일 때
**When**: 핸들러 함수 호출 시
**Then**:
- 에러 메시지: "선택된 일정이 없습니다."
- 작업 중단

### 4. 엣지 케이스

다음 엣지 케이스에 대한 테스트 케이스를 작성하세요:

#### 엣지 1: repeatId는 있지만 repeat.type이 'none'
**Expect**: 다이얼로그 표시 안 됨 (repeat.type !== 'none' 조건)

#### 엣지 2: repeat.type은 있지만 repeatId가 없음
**Expect**: 다이얼로그 표시 안 됨 (repeat.id 조건)

#### 엣지 3: 단일 수정 후 재수정
**Expect**: 단일 일정으로 변경되었으므로 다이얼로그 없이 수정됨

### 5. MSW 핸들러 전략

다음 API 엔드포인트에 대한 모킹 전략을 작성하세요:

#### GET /api/events
- 반복 일정 포함한 목록 반환
- 테스트용 repeatId 생성 (예: "repeat-1")

#### PUT /api/events/:id
- 단일 일정 수정 응답
- 성공 시 200 + 업데이트된 이벤트
- 실패 시 500 + 에러 메시지

#### PUT /api/recurring-events/:repeatId
- 반복 시리즈 수정 응답
- 성공 시 200 + 업데이트된 이벤트 목록
- 404 시 에러 메시지
- 실패 시 500 + 에러 메시지

### 6. 테스트 데이터 설계

다음 데이터를 포함한 목업 이벤트를 설계하세요:

```typescript
// 반복 일정 (weekly, 3주)
{
  id: '1',
  title: '주간 회의',
  date: '2025-10-30',
  startTime: '10:00',
  endTime: '11:00',
  description: '팀 주간 회의',
  location: '회의실 A',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-11-20',
    id: 'repeat-1',
  },
  notificationTime: 10,
}

// 같은 시리즈의 다른 일정들
// id: '2', date: '2025-11-06', repeat.id: 'repeat-1'
// id: '3', date: '2025-11-13', repeat.id: 'repeat-1'
// id: '4', date: '2025-11-20', repeat.id: 'repeat-1'

// 단일 일정
{
  id: '5',
  title: '개인 약속',
  date: '2025-10-31',
  startTime: '14:00',
  endTime: '15:00',
  description: '병원 방문',
  location: '서울대병원',
  category: '개인',
  repeat: { type: 'none', interval: 1 },
  notificationTime: 60,
}
```

---

## 제약 조건

### 테스트 파일 네이밍
- **파일명**: `task.recurring-edit.spec.tsx`
- **위치**: `/Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/__tests__/`

### GWT 패턴 준수
```typescript
describe('반복 일정 수정 다이얼로그', () => {
  it('반복 일정 수정 시 다이얼로그를 표시해야 함', () => {
    // Given - 준비
    // When - 실행
    // Then - 검증
  });
});
```

### 접근성 테스트
- `data-testid`로 요소 선택
- `getByRole`, `getByText` 활용
- aria-label 검증

---

## 출력 형식

### .claude/agent-docs/test-designer/logs/test-strategy.md 구조

```markdown
# 반복 일정 수정 기능 테스트 설계

## 테스트 전략
- 범위
- 도구
- 커버리지 목표

## 테스트 시나리오
### 시나리오 1: ...
- Given
- When
- Then
- 검증 항목

## 에러 케이스
### 에러 1: ...
- Given
- When
- Then

## 엣지 케이스
### 엣지 1: ...
- 조건
- Expect

## MSW 핸들러 설계
- API 엔드포인트별 모킹 전략

## 테스트 데이터
- 목업 이벤트 정의

## 테스트 케이스 목록
- 우선순위별 정리
- 예상 실행 시간

## 참고 사항
- 기존 테스트와의 통합
- 주의사항
```

---

## 검증 체크리스트

완료 시 다음 항목을 확인하세요:

- [ ] 모든 주요 시나리오 테스트 케이스 작성 (5개)
- [ ] 에러 케이스 테스트 케이스 작성 (3개)
- [ ] 엣지 케이스 테스트 케이스 작성 (3개)
- [ ] MSW 핸들러 전략 작성 (3개 API)
- [ ] 테스트 데이터 설계 (반복 일정 + 단일 일정)
- [ ] GWT 패턴 적용 방법 명시
- [ ] 접근성 테스트 전략 포함
- [ ] 기존 테스트 파일 분석 (easy.*, medium.*)

---

## 다음 Phase

Phase 3로 전달할 내용:
- `.claude/agent-docs/test-designer/logs/test-strategy.md` (이번 Phase 산출물)
- 테스트 케이스 구현 가이드
- MSW 핸들러 확장 가이드

**다음 에이전트**: test-writer
**다음 작업**: 실패하는 테스트 작성 (RED)

---

**생성자**: orchestrator
**최종 수정**: 2025-10-30
