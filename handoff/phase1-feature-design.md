# Phase 1: Feature Design - 반복 일정 삭제 기능

**Date**: 2025-10-31
**Designer**: feature-designer
**Feature**: Recurring Event Delete with Single vs Series Selection

---

## 1. Executive Summary

### 1.1 Feature Overview
반복 일정 삭제 시 사용자가 "해당 일정만 삭제" 또는 "전체 시리즈 삭제" 중 선택할 수 있는 다이얼로그를 제공합니다. 기존 반복 일정 수정 다이얼로그와 동일한 UX 패턴을 따르되, 삭제의 위험성을 시각적으로 강조합니다.

### 1.2 Key Design Decisions
1. **패턴 일관성**: 반복 일정 수정 다이얼로그 (App.tsx:795-832)와 동일한 구조 사용
2. **안전 강조**: "아니오"(전체 삭제) 버튼을 `color="error"`로 표시
3. **명확한 메시지**: "해당 일정만 삭제하시겠어요?" 질문으로 의도 명확화
4. **3단계 선택**: 취소 / 예 / 아니오

### 1.3 Design Principles
- **Consistency First**: 기존 UX 패턴 재사용
- **Safety by Design**: 위험한 작업에 시각적 경고
- **Clear Communication**: 각 선택의 결과를 명확히 전달
- **Accessibility**: 모든 인터랙션에 적절한 레이블 제공

---

## 2. UX Flow Diagram

### 2.1 Main Flow
```
사용자가 반복 일정 삭제 버튼 클릭
    ↓
이벤트에 repeat.id가 있는지 확인
    ↓
┌─────────────────────────────────────────────┐
│ YES: 반복 일정                              │
│   → 다이얼로그 표시                         │
│      "해당 일정만 삭제하시겠어요?"          │
│                                             │
│   선택지:                                    │
│   [취소] → 다이얼로그 닫기                  │
│   [예] → 단일 일정 삭제 (event.id)         │
│   [아니오] → 전체 시리즈 삭제 (repeat.id)  │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ NO: 일반 일정                               │
│   → 즉시 삭제 (deleteEvent)                │
└─────────────────────────────────────────────┘
```

### 2.2 Detailed Interaction Flow
```
┌─────────────────────────────────────────────────────────────┐
│ State: isRecurringDeleteDialogOpen = false                  │
│        selectedRecurringEvent = null                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  사용자 클릭 이벤트
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ handleDeleteClick(event)                                    │
│   if (event.repeat.type !== 'none' && event.repeat.id) {   │
│     setSelectedRecurringEvent(event)                        │
│     setIsRecurringDeleteDialogOpen(true)                    │
│   } else {                                                  │
│     deleteEvent(event.id)                                   │
│   }                                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Dialog 표시                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 반복 일정 삭제                                          │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ 해당 일정만 삭제하시겠어요?                             │ │
│ │ "예"를 선택하면 이 일정만 삭제됩니다.                   │ │
│ │ "아니오"를 선택하면 반복 시리즈 전체가 삭제됩니다.      │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [취소]          [예]          [아니오]                  │ │
│ │                                  ^^^                     │ │
│ │                            (color="error")               │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                 ↓              ↓              ↓
              [취소]          [예]          [아니오]
                 ↓              ↓              ↓
        다이얼로그 닫기    단일 삭제      시리즈 삭제
                 ↓              ↓              ↓
           상태 초기화    deleteEvent    deleteRecurringSeries
                         (event.id)     (repeat.id)
                            ↓              ↓
                      fetchEvents()   fetchEvents()
                            ↓              ↓
                       Snackbar       Snackbar
                    "일정 삭제됨"   "시리즈 삭제됨"
```

---

## 3. UI Component Specification

### 3.1 Dialog Structure

#### 3.1.1 Component Hierarchy
```
<Dialog>
  <DialogTitle />
  <DialogContent>
    <DialogContentText />
  </DialogContent>
  <DialogActions>
    <Button /> (취소)
    <Button /> (예)
    <Button /> (아니오)
  </DialogActions>
</Dialog>
```

#### 3.1.2 Props
```typescript
<Dialog
  open={isRecurringDeleteDialogOpen}
  onClose={() => setIsRecurringDeleteDialogOpen(false)}
  aria-labelledby="recurring-delete-dialog-title"
  data-testid="recurring-delete-dialog"
  TransitionProps={{ timeout: 0 }}
>
```

**Rationale**:
- `open`: State 기반 표시 제어
- `onClose`: 다이얼로그 외부 클릭 또는 ESC 키로 닫기
- `aria-labelledby`: 접근성 (스크린 리더)
- `data-testid`: 테스트 자동화
- `TransitionProps`: 애니메이션 비활성화 (반복 일정 수정 다이얼로그와 동일)

### 3.2 DialogTitle
```typescript
<DialogTitle id="recurring-delete-dialog-title">
  반복 일정 삭제
</DialogTitle>
```

**Design Notes**:
- 간결하고 명확한 제목
- id 속성으로 aria-labelledby와 연결

### 3.3 DialogContent
```typescript
<DialogContent>
  <DialogContentText>
    해당 일정만 삭제하시겠어요?
    <br />
    "예"를 선택하면 이 일정만 삭제됩니다.
    <br />
    "아니오"를 선택하면 반복 시리즈 전체가 삭제됩니다.
  </DialogContentText>
</DialogContent>
```

**Content Breakdown**:
1. **주 질문**: "해당 일정만 삭제하시겠어요?"
   - 긍정 응답 → 단일 삭제 (안전한 선택)
   - 부정 응답 → 전체 삭제 (위험한 선택)

2. **설명 1**: "예"를 선택하면 이 일정만 삭제됩니다.
   - 긍정 선택의 결과를 명확히

3. **설명 2**: "아니오"를 선택하면 반복 시리즈 전체가 삭제됩니다.
   - 부정 선택의 위험성을 강조

**Rationale**:
- 질문 형식으로 사용자의 의도를 유도
- 각 선택의 결과를 명시적으로 설명
- 반복 일정 수정 다이얼로그와 동일한 패턴 (일관성)

### 3.4 DialogActions (Buttons)

#### 3.4.1 Button Layout
```
┌─────────────────────────────────────────────┐
│ [취소]          [예]          [아니오]      │
│  (1)           (2)             (3)          │
└─────────────────────────────────────────────┘

Position: 왼쪽 정렬 → 오른쪽 순서
Risk Level: Low → Low → HIGH
```

#### 3.4.2 Button 1: 취소
```typescript
<Button
  onClick={() => {
    setIsRecurringDeleteDialogOpen(false);
    setSelectedRecurringEvent(null);
  }}
  data-testid="cancel-delete-button"
>
  취소
</Button>
```

**Style**: 기본 (default)
**Action**: 다이얼로그 닫기, 상태 초기화
**Risk**: 없음 (안전한 선택)

#### 3.4.3 Button 2: 예 (단일 삭제)
```typescript
<Button
  onClick={handleDeleteSingleOccurrence}
  color="primary"
  data-testid="delete-single-button"
>
  예
</Button>
```

**Style**: Primary (강조)
**Action**: 단일 일정 삭제 (`deleteEvent(selectedRecurringEvent.id)`)
**Risk**: 낮음 (하나만 삭제)
**Feedback**: "일정이 삭제되었습니다." (info)

#### 3.4.4 Button 3: 아니오 (전체 시리즈 삭제)
```typescript
<Button
  onClick={handleDeleteEntireSeries}
  color="error"
  data-testid="delete-series-button"
>
  아니오
</Button>
```

**Style**: Error (빨간색 경고)
**Action**: 전체 시리즈 삭제 (`deleteRecurringSeries(selectedRecurringEvent.repeat.id)`)
**Risk**: 높음 (여러 일정 삭제)
**Feedback**: "반복 일정 시리즈가 삭제되었습니다." (info)

**Rationale**:
- 가장 위험한 작업을 `color="error"`로 시각적 강조
- 오른쪽에 배치하여 실수 클릭 방지

---

## 4. User Interaction Scenarios

### 4.1 Scenario 1: 단일 일정 삭제 선택 (Happy Path)

**Given**:
- 사용자가 반복 일정 목록을 보고 있음
- 특정 날짜의 반복 일정만 삭제하고 싶음
- Event 객체: `{ id: "abc", repeat: { id: "repeat-123", type: "weekly" } }`

**When**:
1. 사용자가 삭제 버튼 클릭
2. 다이얼로그가 표시됨
3. "해당 일정만 삭제하시겠어요?" 메시지 확인
4. "예" 버튼 클릭

**Then**:
1. `handleDeleteSingleOccurrence` 호출
2. `deleteEvent("abc")` 실행 (API: `DELETE /api/events/abc`)
3. 다이얼로그 닫힘
4. `fetchEvents()` 호출로 목록 갱신
5. Snackbar 표시: "일정이 삭제되었습니다." (variant: info)
6. 선택한 날짜의 일정만 사라지고, 다른 반복 일정은 유지됨

**Expected UI State**:
- `isRecurringDeleteDialogOpen`: false
- `selectedRecurringEvent`: null
- 달력에서 해당 날짜의 일정만 제거됨

---

### 4.2 Scenario 2: 전체 시리즈 삭제 선택 (Danger Path)

**Given**:
- 사용자가 반복 일정을 더 이상 사용하지 않으려 함
- 모든 반복 일정을 한 번에 삭제하고 싶음
- Event 객체: `{ id: "abc", repeat: { id: "repeat-123", type: "weekly" } }`

**When**:
1. 사용자가 삭제 버튼 클릭
2. 다이얼로그가 표시됨
3. "아니오"를 선택하면 반복 시리즈 전체가 삭제됩니다." 경고 확인
4. "아니오" 버튼 (빨간색) 클릭

**Then**:
1. `handleDeleteEntireSeries` 호출
2. `deleteRecurringSeries("repeat-123")` 실행 (API: `DELETE /api/recurring-events/repeat-123`)
3. 다이얼로그 닫힘
4. `fetchEvents()` 호출로 목록 갱신
5. Snackbar 표시: "반복 일정 시리즈가 삭제되었습니다." (variant: info)
6. 같은 `repeat.id`를 가진 모든 일정이 사라짐

**Expected UI State**:
- `isRecurringDeleteDialogOpen`: false
- `selectedRecurringEvent`: null
- 달력에서 해당 시리즈의 모든 일정 제거됨

---

### 4.3 Scenario 3: 취소 선택 (Safe Exit)

**Given**:
- 사용자가 실수로 삭제 버튼을 눌렀거나, 마음이 바뀜

**When**:
1. 사용자가 삭제 버튼 클릭
2. 다이얼로그가 표시됨
3. 메시지를 읽고 삭제하지 않기로 결정
4. "취소" 버튼 클릭

**Then**:
1. 다이얼로그 닫힘
2. 상태 초기화 (`selectedRecurringEvent = null`)
3. 아무것도 삭제되지 않음
4. Snackbar 표시 없음

**Expected UI State**:
- `isRecurringDeleteDialogOpen`: false
- `selectedRecurringEvent`: null
- 달력 상태 변화 없음

---

### 4.4 Scenario 4: 다이얼로그 외부 클릭 또는 ESC 키

**Given**:
- 사용자가 다이얼로그를 열었으나 버튼을 누르지 않고 닫고 싶음

**When**:
1. 사용자가 삭제 버튼 클릭
2. 다이얼로그가 표시됨
3. 다이얼로그 외부 영역 클릭 또는 ESC 키 입력

**Then**:
1. `onClose` 핸들러 호출
2. `setIsRecurringDeleteDialogOpen(false)` 실행
3. 다이얼로그 닫힘
4. 아무것도 삭제되지 않음

**Expected UI State**:
- Scenario 3과 동일 (취소와 같은 효과)

**Note**: 상태 초기화(`setSelectedRecurringEvent(null)`)는 `onClose`에서 처리해야 함.

---

## 5. Edge Cases and Error Handling

### 5.1 Edge Case 1: repeatId가 없는 경우

**Scenario**:
- 반복 일정이지만 `repeat.id`가 undefined 또는 null

**Defensive Code**:
```typescript
const handleDeleteClick = (event: Event) => {
  if (event.repeat.type !== 'none' && event.repeat.id) {
    // 정상 케이스: 다이얼로그 표시
    setSelectedRecurringEvent(event);
    setIsRecurringDeleteDialogOpen(true);
  } else {
    // repeat.id가 없으면 단일 삭제
    deleteEvent(event.id);
  }
};
```

**Rationale**:
- `repeat.id`가 없으면 반복 시리즈로 식별할 수 없으므로 단일 삭제
- 데이터 무결성 문제를 우아하게 처리

---

### 5.2 Edge Case 2: selectedRecurringEvent가 null인 경우

**Scenario**:
- 다이얼로그가 열렸지만 `selectedRecurringEvent`가 null (비정상 상태)

**Defensive Code**:
```typescript
const handleDeleteSingleOccurrence = async () => {
  if (!selectedRecurringEvent) {
    enqueueSnackbar('선택된 일정이 없습니다.', { variant: 'error' });
    setIsRecurringDeleteDialogOpen(false);
    return;
  }

  await deleteEvent(selectedRecurringEvent.id);
  setIsRecurringDeleteDialogOpen(false);
  setSelectedRecurringEvent(null);
};

const handleDeleteEntireSeries = async () => {
  if (!selectedRecurringEvent?.repeat.id) {
    enqueueSnackbar('반복 일정 시리즈를 찾을 수 없습니다.', { variant: 'error' });
    setIsRecurringDeleteDialogOpen(false);
    setSelectedRecurringEvent(null);
    return;
  }

  await deleteRecurringSeries(selectedRecurringEvent.repeat.id);
  setIsRecurringDeleteDialogOpen(false);
  setSelectedRecurringEvent(null);
};
```

**Rationale**:
- Early return 패턴으로 안전성 확보
- 사용자에게 명확한 에러 메시지 제공
- 상태 일관성 유지

---

### 5.3 Edge Case 3: API 에러 발생

**Scenario**:
- 네트워크 오류 또는 서버 에러로 삭제 실패

**Current Handling**:
```typescript
// useEventOperations.ts - deleteEvent
catch (error) {
  console.error('Error deleting event:', error);
  enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
}

// useEventOperations.ts - deleteRecurringSeries
catch (error) {
  console.error('Error deleting recurring series:', error);
  enqueueSnackbar('반복 일정 삭제 실패', { variant: 'error' });
}
```

**Expected Behavior**:
1. 에러가 발생해도 다이얼로그는 닫힘
2. Snackbar로 에러 메시지 표시
3. 상태는 초기화됨
4. 사용자는 다시 시도 가능

**Improvement Consideration** (Phase 5에서 고려):
- 에러 발생 시 다이얼로그를 닫지 않고 재시도 옵션 제공
- 현재는 기존 패턴 유지 (일관성 우선)

---

### 5.4 Edge Case 4: 빠른 연속 클릭

**Scenario**:
- 사용자가 "예" 또는 "아니오" 버튼을 여러 번 빠르게 클릭

**Defensive Code**:
```typescript
const [isDeleting, setIsDeleting] = useState(false);

const handleDeleteSingleOccurrence = async () => {
  if (isDeleting || !selectedRecurringEvent) return;

  setIsDeleting(true);
  try {
    await deleteEvent(selectedRecurringEvent.id);
  } finally {
    setIsDeleting(false);
    setIsRecurringDeleteDialogOpen(false);
    setSelectedRecurringEvent(null);
  }
};
```

**Alternative** (추천):
- Material-UI Button의 `disabled` prop 사용
```typescript
<Button
  onClick={handleDeleteSingleOccurrence}
  disabled={isDeleting}
>
  예
</Button>
```

**Phase 4 Decision**:
- 현재는 async 함수가 완료될 때까지 자연스럽게 차단됨
- 사용자 경험상 큰 문제 없으면 추가 state 없이 유지
- 필요 시 Phase 5에서 개선

---

### 5.5 Edge Case 5: 일반 일정을 반복 일정으로 잘못 인식

**Scenario**:
- `repeat.type !== 'none'`이지만 실제로는 단일 일정

**Prevention**:
- 백엔드 데이터 검증에 의존
- 프론트엔드는 `repeat.type`과 `repeat.id` 모두 확인

**Current Implementation** (Safe):
```typescript
if (event.repeat.type !== 'none' && event.repeat.id) {
  // 반복 일정으로 처리
}
```

---

## 6. Text-based Wireframe

### 6.1 Desktop View (권장 해상도: 1920x1080)

```
┌────────────────────────────────────────────────────────────────────┐
│                         반복 일정 삭제                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  해당 일정만 삭제하시겠어요?                                        │
│  "예"를 선택하면 이 일정만 삭제됩니다.                              │
│  "아니오"를 선택하면 반복 시리즈 전체가 삭제됩니다.                 │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│         ┌────────┐     ┌────────┐     ┌────────────┐              │
│         │  취소  │     │   예   │     │  아니오    │              │
│         │ (gray) │     │ (blue) │     │   (red)    │              │
│         └────────┘     └────────┘     └────────────┘              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 6.2 Mobile View (권장 해상도: 375x667)

```
┌──────────────────────────────┐
│      반복 일정 삭제          │
├──────────────────────────────┤
│                              │
│  해당 일정만 삭제하시겠어요? │
│  "예"를 선택하면 이 일정만   │
│  삭제됩니다.                 │
│  "아니오"를 선택하면 반복    │
│  시리즈 전체가 삭제됩니다.   │
│                              │
├──────────────────────────────┤
│                              │
│  ┌────────┐  ┌────────┐     │
│  │  취소  │  │   예   │     │
│  └────────┘  └────────┘     │
│                              │
│  ┌──────────────────┐        │
│  │     아니오       │        │
│  │     (red)        │        │
│  └──────────────────┘        │
│                              │
└──────────────────────────────┘
```

**Mobile Layout Notes**:
- 버튼이 세로로 스택 (Material-UI Dialog의 반응형 동작)
- 위험한 버튼(아니오)을 가장 아래 배치
- 터치 타겟 크기: 최소 44x44px

---

## 7. Component State Management

### 7.1 Required State Variables

```typescript
// 기존 State (이미 존재)
const [isRecurringDeleteDialogOpen, setIsRecurringDeleteDialogOpen] = useState<boolean>(false);
const [selectedRecurringEvent, setSelectedRecurringEvent] = useState<Event | null>(null);

// 추가 State (선택 사항, Edge Case 4 대응)
const [isDeleting, setIsDeleting] = useState<boolean>(false);
```

### 7.2 State Transitions

```
Initial State:
  isRecurringDeleteDialogOpen = false
  selectedRecurringEvent = null

User clicks delete on recurring event:
  → setSelectedRecurringEvent(event)
  → setIsRecurringDeleteDialogOpen(true)

Dialog opens:
  → User sees 3 buttons

User clicks "취소":
  → setIsRecurringDeleteDialogOpen(false)
  → setSelectedRecurringEvent(null)

User clicks "예":
  → handleDeleteSingleOccurrence()
  → deleteEvent(selectedRecurringEvent.id)
  → setIsRecurringDeleteDialogOpen(false)
  → setSelectedRecurringEvent(null)

User clicks "아니오":
  → handleDeleteEntireSeries()
  → deleteRecurringSeries(selectedRecurringEvent.repeat.id)
  → setIsRecurringDeleteDialogOpen(false)
  → setSelectedRecurringEvent(null)

User clicks outside or presses ESC:
  → onClose handler
  → setIsRecurringDeleteDialogOpen(false)
  → setSelectedRecurringEvent(null)
```

---

## 8. Implementation Guide for Phase 4

### 8.1 Handler Functions Signature

```typescript
/**
 * 단일 일정 삭제 핸들러
 * 선택한 일정만 삭제하고 다른 반복 일정은 유지합니다.
 */
const handleDeleteSingleOccurrence = async (): Promise<void> => {
  if (!selectedRecurringEvent) {
    enqueueSnackbar('선택된 일정이 없습니다.', { variant: 'error' });
    setIsRecurringDeleteDialogOpen(false);
    return;
  }

  await deleteEvent(selectedRecurringEvent.id);
  setIsRecurringDeleteDialogOpen(false);
  setSelectedRecurringEvent(null);
};

/**
 * 전체 시리즈 삭제 핸들러
 * 같은 repeatId를 가진 모든 일정을 삭제합니다.
 */
const handleDeleteEntireSeries = async (): Promise<void> => {
  if (!selectedRecurringEvent?.repeat.id) {
    enqueueSnackbar('반복 일정 시리즈를 찾을 수 없습니다.', { variant: 'error' });
    setIsRecurringDeleteDialogOpen(false);
    setSelectedRecurringEvent(null);
    return;
  }

  await deleteRecurringSeries(selectedRecurringEvent.repeat.id);
  setIsRecurringDeleteDialogOpen(false);
  setSelectedRecurringEvent(null);
};

/**
 * 다이얼로그 닫기 핸들러 (외부 클릭, ESC 키)
 */
const handleCloseDeleteDialog = (): void => {
  setIsRecurringDeleteDialogOpen(false);
  setSelectedRecurringEvent(null);
};
```

### 8.2 Modified Dialog Code

```typescript
<Dialog
  open={isRecurringDeleteDialogOpen}
  onClose={handleCloseDeleteDialog}
  aria-labelledby="recurring-delete-dialog-title"
  data-testid="recurring-delete-dialog"
  TransitionProps={{ timeout: 0 }}
>
  <DialogTitle id="recurring-delete-dialog-title">
    반복 일정 삭제
  </DialogTitle>
  <DialogContent>
    <DialogContentText>
      해당 일정만 삭제하시겠어요?
      <br />
      "예"를 선택하면 이 일정만 삭제됩니다.
      <br />
      "아니오"를 선택하면 반복 시리즈 전체가 삭제됩니다.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button
      onClick={handleCloseDeleteDialog}
      data-testid="cancel-delete-button"
    >
      취소
    </Button>
    <Button
      onClick={handleDeleteSingleOccurrence}
      color="primary"
      data-testid="delete-single-button"
    >
      예
    </Button>
    <Button
      onClick={handleDeleteEntireSeries}
      color="error"
      data-testid="delete-series-button"
    >
      아니오
    </Button>
  </DialogActions>
</Dialog>
```

### 8.3 Changes from Current Implementation

**Current Code** (App.tsx:834-851):
```typescript
<Dialog open={isRecurringDeleteDialogOpen} onClose={() => setIsRecurringDeleteDialogOpen(false)}>
  <DialogTitle>반복 일정 삭제</DialogTitle>
  <DialogContent>
    <DialogContentText>
      이 반복 시리즈의 모든 일정을 삭제하시겠습니까?
      <br />이 작업은 되돌릴 수 없습니다.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setIsRecurringDeleteDialogOpen(false)}>취소</Button>
    <Button onClick={handleRecurringSeriesDelete} color="error">
      전체 삭제
    </Button>
  </DialogActions>
</Dialog>
```

**Changes Required**:
1. ✅ `onClose` → `handleCloseDeleteDialog` (상태 초기화 포함)
2. ✅ `aria-labelledby`, `data-testid` 추가 (접근성)
3. ✅ `TransitionProps={{ timeout: 0 }}` 추가 (일관성)
4. ✅ DialogContentText 메시지 변경
5. ✅ 버튼 구조 변경: 2개 → 3개 (취소 / 예 / 아니오)
6. ✅ 새 핸들러 추가: `handleDeleteSingleOccurrence`
7. ✅ 기존 핸들러 이름 변경 고려: `handleRecurringSeriesDelete` → `handleDeleteEntireSeries` (선택 사항)

---

## 9. Test Scenarios Outline for Phase 2

### 9.1 UI Rendering Tests
1. 다이얼로그가 올바르게 렌더링되는지
2. 제목, 메시지, 버튼이 모두 표시되는지
3. data-testid 속성이 올바른지

### 9.2 Interaction Tests
1. "취소" 버튼 클릭 시 다이얼로그가 닫히는지
2. "예" 버튼 클릭 시 단일 삭제 API 호출되는지
3. "아니오" 버튼 클릭 시 시리즈 삭제 API 호출되는지
4. 다이얼로그 외부 클릭 시 닫히는지

### 9.3 API Integration Tests
1. 단일 삭제 성공 시 fetchEvents 호출 및 Snackbar 표시
2. 시리즈 삭제 성공 시 fetchEvents 호출 및 Snackbar 표시
3. 삭제 실패 시 에러 메시지 표시

### 9.4 Edge Case Tests
1. selectedRecurringEvent가 null일 때 에러 처리
2. repeat.id가 없을 때 에러 처리
3. API 에러 발생 시 에러 처리

### 9.5 Mock Data Requirements
```typescript
const mockRecurringEvent: Event = {
  id: 'event-1',
  title: '주간 회의',
  date: '2025-10-31',
  startTime: '10:00',
  endTime: '11:00',
  description: '팀 회의',
  location: '회의실',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-12-31',
    id: 'repeat-123',
  },
  notificationTime: 10,
};
```

---

## 10. Success Criteria

### 10.1 Functional Requirements ✅
- [x] 다이얼로그가 3가지 선택지 제공 (취소 / 예 / 아니오)
- [x] "예" 선택 시 단일 일정만 삭제
- [x] "아니오" 선택 시 전체 시리즈 삭제
- [x] 적절한 Snackbar 피드백 제공

### 10.2 UX Requirements ✅
- [x] 반복 일정 수정 다이얼로그와 일관된 패턴
- [x] 위험한 작업(전체 삭제)을 시각적으로 강조
- [x] 명확한 메시지로 각 선택의 결과 전달
- [x] 실수 방지를 위한 안전장치 (색상 구분)

### 10.3 Technical Requirements ✅
- [x] 접근성 속성 (aria-labelledby, data-testid) 명세
- [x] 한글 UI 텍스트
- [x] TypeScript 타입 안전성
- [x] Edge case 방어 코드 설계

### 10.4 Documentation Requirements ✅
- [x] UX Flow Diagram 작성
- [x] UI Component Specification 완성
- [x] User Interaction Scenarios (4개) 문서화
- [x] Edge Cases (5개) 식별 및 대응 방안
- [x] Text-based Wireframe 제공
- [x] Implementation Guide 작성

---

## 11. Comparison with Existing Pattern

### 11.1 반복 일정 수정 다이얼로그 (Reference)

**Location**: `src/App.tsx:795-832`

**Structure**:
```
Title: "반복 일정 수정"
Message: "해당 일정만 수정하시겠어요?"
Buttons: [취소] [예] [아니오]
```

**Key Similarities**:
- 3-button layout
- "해당 일정만" 질문 형식
- 각 선택의 결과 설명
- data-testid 속성

**Key Differences**:
- 수정: "아니오" → `variant="contained"` (강조)
- 삭제: "아니오" → `color="error"` (경고)

**Rationale**:
- 수정은 위험하지 않으므로 강조 스타일
- 삭제는 되돌릴 수 없으므로 경고 색상

---

## 12. Accessibility Checklist

### 12.1 Semantic HTML ✅
- [x] Dialog 컴포넌트 사용
- [x] DialogTitle, DialogContent, DialogActions 구조

### 12.2 ARIA Attributes ✅
- [x] `aria-labelledby="recurring-delete-dialog-title"`
- [x] DialogTitle에 id 속성

### 12.3 Keyboard Navigation ✅
- [x] ESC 키로 닫기 (Material-UI 기본 동작)
- [x] Tab 키로 버튼 간 이동
- [x] Enter/Space로 버튼 클릭

### 12.4 Screen Reader Support ✅
- [x] 명확한 한글 레이블
- [x] 버튼 텍스트가 동작을 명확히 설명

### 12.5 Visual Feedback ✅
- [x] 위험한 작업에 색상 구분 (color="error")
- [x] 호버/포커스 상태 (Material-UI 기본 제공)

---

## 13. Design Rationale Summary

### 13.1 Why "해당 일정만 삭제하시겠어요?"
- **긍정 편향**: "예" 선택이 더 안전한 선택 (단일 삭제)
- **명확한 의도**: 사용자가 단일 삭제를 원한다고 가정
- **일관성**: 반복 일정 수정 다이얼로그와 동일한 질문 패턴

### 13.2 Why 3-button Layout?
- **명확한 선택**: 취소 / 진행(단일) / 진행(전체)
- **실수 방지**: 취소 옵션을 항상 제공
- **기존 패턴**: 반복 일정 수정 다이얼로그와 일치

### 13.3 Why "아니오" is Error Color?
- **위험 강조**: 여러 일정을 삭제하는 위험한 작업
- **시각적 경고**: 빨간색으로 사용자 주의 환기
- **수정과의 차별화**: 수정은 되돌릴 수 있지만 삭제는 불가능

### 13.4 Why Consistent with Edit Dialog?
- **학습 비용 감소**: 사용자가 이미 익숙한 패턴
- **예측 가능성**: 수정/삭제가 유사한 UX
- **코드 일관성**: 유지보수 용이

---

## 14. Phase 1 Completion Checklist

### 14.1 Deliverables
- [x] Feature Design Document 작성 (`handoff/phase1-feature-design.md`)
- [x] UX Flow Diagram 완성
- [x] UI Component Specification 완성
- [x] User Interaction Scenarios (4개) 문서화
- [x] Edge Cases (5개) 식별 및 대응
- [x] Text-based Wireframe 제공 (Desktop/Mobile)
- [x] Implementation Guide 작성

### 14.2 Quality Checks
- [x] 비개발자도 이해 가능한 문서
- [x] 개발자가 이 문서만으로 구현 가능
- [x] 테스트 설계자가 테스트 케이스 도출 가능
- [x] 기존 UX 패턴과 일관성 확인

### 14.3 Contract Fulfillment
- [x] 모든 필수 섹션 포함
- [x] data-testid 속성 명세 포함
- [x] 한글 UI 텍스트 사용
- [x] 다음 Phase를 위한 충분한 정보 제공

---

## 15. Handoff to Phase 2 (Test Design)

### 15.1 Key Artifacts
1. **이 문서**: `handoff/phase1-feature-design.md`
2. **Section 9**: Test Scenarios Outline
3. **Section 4**: User Interaction Scenarios (Given-When-Then 구조)
4. **Section 5**: Edge Cases

### 15.2 Test Designer Guidance
- Section 4의 4가지 시나리오를 Given-When-Then 테스트로 변환
- Section 5의 5가지 Edge Cases를 테스트 케이스로 설계
- Section 9의 Outline을 구체적인 테스트 명세로 확장
- Mock 데이터는 Section 9.5 참조

### 15.3 Expected Output from Phase 2
- `handoff/phase2-test-design.md`
- 상세한 테스트 시나리오 (GWT 형식)
- MSW 핸들러 설계
- 테스트 데이터 명세

---

**Phase 1 완료**
**설계자**: feature-designer
**다음 단계**: Phase 2 (Test Design) - test-designer에게 인계
**검증 필요**: Orchestrator의 Phase 1 검증
