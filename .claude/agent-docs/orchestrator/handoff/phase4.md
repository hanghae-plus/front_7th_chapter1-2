---
phase: 4
agent: code-writer
timestamp: 2025-10-30T22:12:00Z
status: ready
previous_phase: 3

inputs:
  requirement: "반복 일정 수정 기능 구현으로 모든 테스트 통과 (TDD GREEN Phase)"
  context_files:
    - ./phase0-plan.md
    - .claude/agent-docs/feature-designer/logs/spec.md
    - .claude/agent-docs/test-designer/logs/test-strategy.md
    - .claude/agent-docs/test-writer/logs/YYYY-MM-DD_test-writing-log.md
    - /Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/__tests__/integration/task.recurring-edit.spec.tsx
    - /Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/App.tsx

references:
  agent_definition: ../../agents/code-writer.md
  agent_prompt: ../code-writer/prompt.md
  shared_docs:
    - ../../docs/folder-tree.md
    - ../../docs/git-commit-convention.md

output_requirements:
  path: /Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/App.tsx
  required_sections:
    - RecurringEditDialog 개선
    - handleEditSingleOccurrence 구현
    - handleEditAllOccurrences 구현
    - editEvent 연동
  format: typescript
  additional:
    - .claude/agent-docs/code-writer/logs/YYYY-MM-DD_implementation-log.md

constraints:
  - 모든 테스트가 통과해야 함 (GREEN Phase)
  - 기존 코드 최소 변경
  - TypeScript 타입 안전성 유지
  - 한글 메시지 사용
  - 접근성 속성 추가

validation_criteria:
  - 모든 테스트 통과 (pnpm test)
  - TypeScript 컴파일 성공 (pnpm lint:tsc)
  - ESLint 통과 (pnpm lint:eslint)
  - 기존 기능 정상 작동
---

# Phase 4 Handoff: GREEN - Implementation

## 에이전트 정보
**수신자**: code-writer
**발신자**: orchestrator
**Phase**: 4/6 - GREEN (Implementation)
**생성일**: 2025-10-30

---

## 작업 목표

반복 일정 수정 기능을 구현하여 모든 테스트를 통과시킵니다 (TDD GREEN Phase).

### 입력 산출물
- [계획 문서](./phase0-plan.md)
- [기능 설계](.claude/agent-docs/feature-designer/logs/spec.md)
- [테스트 설계](.claude/agent-docs/test-designer/logs/test-strategy.md)
- [RED Phase 결과](.claude/agent-docs/test-writer/logs/YYYY-MM-DD_test-writing-log.md)
- [실패하는 테스트](../src/__tests__/integration/task.recurring-edit.spec.tsx)
- 현재 구현: `/Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/App.tsx`

### 출력 산출물
- `src/App.tsx` 수정 (RecurringEditDialog 개선 + 핸들러 함수 구현)
- `.claude/agent-docs/code-writer/logs/YYYY-MM-DD_implementation-log.md` 작성 (구현 내용 기록)
- 모든 테스트 통과

---

## 현재 상태 (실패하는 테스트)

```
Test Files  1 failed (1)
      Tests  8 failed (8)

1. ❌ 반복 일정 수정 시 다이얼로그를 표시해야 함
   - Expected: data-testid="recurring-edit-single-button"
   - Received: element not found

2. ❌ 단일 일정 수정 시 다이얼로그가 표시되지 않아야 함
   - PASS (이미 구현됨)

3. ❌ 예 버튼 클릭 시 단일 일정으로 수정되어야 함
   - Expected: data-testid="recurring-edit-single-button"
   - Received: element not found

4. ❌ 아니오 버튼 클릭 시 폼에 데이터가 로드되어야 함
   - Expected: data-testid="recurring-edit-all-button"
   - Received: element not found

5. ❌ 전체 시리즈 수정 후 모든 일정이 업데이트되어야 함
   - Expected: data-testid="recurring-edit-all-button"
   - Received: element not found

6. ❌ 취소 버튼 클릭 시 다이얼로그만 닫혀야 함
   - Expected: data-testid="recurring-edit-cancel-button"
   - Received: element not found

7. ❌ 단일 수정 API 실패 시 에러 메시지를 표시해야 함
   - Expected: data-testid="recurring-edit-single-button"
   - Received: element not found

8. ❌ 반복 시리즈가 존재하지 않으면 404 에러를 처리해야 함
   - Expected: data-testid="recurring-edit-all-button"
   - Received: element not found
```

**문제**: RecurringEditDialog에 data-testid가 없고, 버튼이 "전체 수정"만 있음

---

## 구현 요구사항

### 1. RecurringEditDialog 개선 (App.tsx, Line 722-737)

**현재 코드**:
```typescript
<Dialog open={isRecurringEditDialogOpen} onClose={() => setIsRecurringEditDialogOpen(false)}>
  <DialogTitle>반복 일정 수정</DialogTitle>
  <DialogContent>
    <DialogContentText>
      이 반복 시리즈의 모든 일정을 수정하시겠습니까?
      <br />
      시리즈의 모든 일정에 동일하게 적용됩니다.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setIsRecurringEditDialogOpen(false)}>취소</Button>
    <Button onClick={handleRecurringSeriesUpdate} color="primary">
      전체 수정
    </Button>
  </DialogActions>
</Dialog>
```

**변경 후 코드**:
```typescript
<Dialog
  open={isRecurringEditDialogOpen}
  onClose={() => setIsRecurringEditDialogOpen(false)}
  aria-labelledby="recurring-edit-dialog-title"
  data-testid="recurring-edit-dialog"
>
  <DialogTitle id="recurring-edit-dialog-title">반복 일정 수정</DialogTitle>
  <DialogContent>
    <DialogContentText>
      해당 일정만 수정하시겠어요?
      <br />
      "예"를 선택하면 이 일정만 단일 일정으로 변경됩니다.
      <br />
      "아니오"를 선택하면 반복 시리즈 전체를 수정할 수 있습니다.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button
      onClick={() => setIsRecurringEditDialogOpen(false)}
      data-testid="recurring-edit-cancel-button"
    >
      취소
    </Button>
    <Button
      onClick={handleEditSingleOccurrence}
      color="primary"
      data-testid="recurring-edit-single-button"
    >
      예
    </Button>
    <Button
      onClick={handleEditAllOccurrences}
      color="primary"
      variant="contained"
      data-testid="recurring-edit-all-button"
    >
      아니오
    </Button>
  </DialogActions>
</Dialog>
```

**변경 사항**:
- 메시지 변경: "모든 일정을 수정하시겠습니까?" → "해당 일정만 수정하시겠어요?"
- 버튼 3개로 변경: "취소", "예" (단일 수정), "아니오" (전체 수정)
- data-testid 추가: 모든 버튼에 고유 식별자 부여
- 접근성 개선: aria-labelledby, id 추가

---

### 2. handleEditSingleOccurrence 함수 구현

**위치**: App.tsx (Line 135 이후 추가)
**목적**: 선택된 반복 일정을 단일 일정으로 변경

```typescript
const handleEditSingleOccurrence = async () => {
  if (!selectedRecurringEvent) {
    enqueueSnackbar('선택된 일정이 없습니다.', { variant: 'error' });
    return;
  }

  try {
    // repeatInfo 제거 (단일 일정으로 변경)
    const updatedEvent: Event = {
      ...selectedRecurringEvent,
      repeat: {
        type: 'none',
        interval: 1,
        id: undefined,
        endDate: undefined,
      },
    };

    // 단일 이벤트로 수정 (PUT /api/events/:id)
    const response = await fetch(`/api/events/${updatedEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent),
    });

    if (!response.ok) {
      throw new Error('Failed to update single event');
    }

    // 목록 갱신
    await fetchEvents();

    // 상태 초기화
    setIsRecurringEditDialogOpen(false);
    setSelectedRecurringEvent(null);

    // 성공 메시지
    enqueueSnackbar('일정이 수정되었습니다.', { variant: 'success' });
  } catch (error) {
    console.error('Error updating single occurrence:', error);
    enqueueSnackbar('일정 수정 실패', { variant: 'error' });
    // 에러 시 다이얼로그 유지 (사용자가 재시도 가능)
  }
};
```

---

### 3. handleEditAllOccurrences 함수 구현

**위치**: App.tsx (Line 135 이후 추가)
**목적**: 반복 시리즈 전체를 수정하기 위해 폼에 데이터 로드

```typescript
const handleEditAllOccurrences = () => {
  if (!selectedRecurringEvent) {
    enqueueSnackbar('선택된 일정이 없습니다.', { variant: 'error' });
    return;
  }

  // 폼에 데이터 로드 (기존 editEvent 함수 활용)
  editEvent(selectedRecurringEvent);

  // 반복 시리즈 수정 플래그 설정
  setIsEditingRecurringSeries(true);

  // 다이얼로그 닫기
  setIsRecurringEditDialogOpen(false);
  setSelectedRecurringEvent(null);
};
```

---

### 4. 상태 추가

**위치**: App.tsx (상태 선언부)

```typescript
const [isEditingRecurringSeries, setIsEditingRecurringSeries] = useState(false);
```

---

### 5. saveEvent 로직 수정 (일정 수정 버튼 핸들러)

**문제**: 현재 saveEvent는 단일 수정만 처리하므로, 반복 시리즈 수정을 구분해야 함

**해결**: 일정 수정 버튼 클릭 시 `isEditingRecurringSeries` 플래그 확인

**현재 코드** (App.tsx, Line 157-197):
```typescript
const handleSaveEvent = () => {
  // ... 겹침 검사 로직 ...

  saveEvent({
    id: editingEvent ? editingEvent.id : undefined,
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    repeat: {
      type: isRepeating ? repeatType : 'none',
      interval: repeatInterval,
      endDate: repeatEndDate || undefined,
    },
    notificationTime,
  });
};
```

**변경 후 코드**:
```typescript
const handleSaveEvent = async () => {
  // 반복 시리즈 수정 모드인지 확인
  if (editingEvent && isEditingRecurringSeries && editingEvent.repeat.id) {
    // 전체 시리즈 수정
    await updateRecurringSeries(editingEvent.repeat.id, {
      title,
      description,
      location,
      category,
      notificationTime,
      repeat: {
        type: repeatType,
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
    });

    // 플래그 초기화
    setIsEditingRecurringSeries(false);
    resetForm();
    setEditingEvent(null);
    return;
  }

  // 기존 단일 수정 로직
  const overlapping = findOverlappingEvents(
    {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    } as Event,
    events
  );

  if (overlapping.length > 0) {
    setOverlappingEvents(overlapping);
    setIsOverlapDialogOpen(true);
  } else {
    saveEvent({
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    });
  }
};
```

---

### 6. resetForm 확장

**위치**: hooks/useEventForm.ts (Line 41-54)

**현재 코드**:
```typescript
const resetForm = () => {
  setTitle('');
  setDate('');
  setStartTime('');
  setEndTime('');
  setDescription('');
  setLocation('');
  setCategory('업무');
  setIsRepeating(false);
  setRepeatType('none');
  setRepeatInterval(1);
  setRepeatEndDate('');
  setNotificationTime(10);
};
```

**변경 후** (App.tsx에서 호출 시 플래그 초기화 추가):
- useEventForm의 resetForm은 수정 불필요
- App.tsx에서 resetForm 호출 후 `setIsEditingRecurringSeries(false)` 추가

---

## 구현 순서

### Step 1: 상태 추가
```typescript
const [isEditingRecurringSeries, setIsEditingRecurringSeries] = useState(false);
```

### Step 2: handleEditSingleOccurrence 함수 작성
- selectedRecurringEvent 검증
- repeatInfo 제거
- PUT /api/events/:id 호출
- 성공 메시지 표시

### Step 3: handleEditAllOccurrences 함수 작성
- selectedRecurringEvent 검증
- editEvent() 호출
- isEditingRecurringSeries = true 설정
- 다이얼로그 닫기

### Step 4: RecurringEditDialog 개선
- 메시지 변경
- 버튼 3개로 변경
- data-testid 추가

### Step 5: handleSaveEvent 로직 수정
- isEditingRecurringSeries 확인
- 전체 시리즈 수정 분기 추가
- 플래그 초기화

### Step 6: 테스트 실행 및 확인
```bash
pnpm test task.recurring-edit --run
```

---

## 제약 조건

### TDD GREEN Phase 원칙
- **최소 구현**: 테스트를 통과시키는 최소한의 코드만 작성
- **리팩토링 금지**: 코드 품질 개선은 Phase 5에서 진행
- **테스트 우선**: 테스트가 통과해야 다음 단계로 진행

### 기존 코드 보호
- 단일 일정 수정 로직 영향 없음
- 반복 일정 삭제 기능 영향 없음
- 기존 일정 생성 로직 영향 없음

### 에러 처리
- API 실패 시 사용자 친화적 메시지
- 다이얼로그 상태 유지 (단일 수정 실패 시)
- 404 에러 별도 처리

---

## 검증 체크리스트

완료 시 다음 항목을 확인하세요:

- [ ] isEditingRecurringSeries 상태 추가
- [ ] handleEditSingleOccurrence 함수 구현
- [ ] handleEditAllOccurrences 함수 구현
- [ ] RecurringEditDialog 개선 (메시지, 버튼, data-testid)
- [ ] handleSaveEvent 로직 수정 (플래그 확인)
- [ ] 모든 테스트 통과 (8/8)
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 없음

---

## 실행 방법

### 테스트 실행
```bash
# 특정 파일만
pnpm test task.recurring-edit --run

# 전체 테스트
pnpm test --run
```

### 예상 결과
```
✓ 반복 일정 수정 시 다이얼로그를 표시해야 함
✓ 단일 일정 수정 시 다이얼로그가 표시되지 않아야 함
✓ 예 버튼 클릭 시 단일 일정으로 수정되어야 함
✓ 아니오 버튼 클릭 시 폼에 데이터가 로드되어야 함
✓ 전체 시리즈 수정 후 모든 일정이 업데이트되어야 함
✓ 취소 버튼 클릭 시 다이얼로그만 닫혀야 함
✓ 단일 수정 API 실패 시 에러 메시지를 표시해야 함
✓ 반복 시리즈가 존재하지 않으면 404 에러를 처리해야 함

Test Files  1 passed (1)
      Tests  8 passed (8)
```

---

## 다음 Phase

Phase 5로 전달할 내용:
- 구현된 코드 (`src/App.tsx`)
- 통과한 테스트 결과
- 리팩토링 대상 코드 목록

**다음 에이전트**: refactoring-expert
**다음 작업**: 코드 품질 개선 (REFACTOR Phase)

---

**생성자**: orchestrator
**최종 수정**: 2025-10-30
