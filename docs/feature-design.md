# 반복 일정 수정 기능 설계

## 개요

### 기능 설명
반복 일정을 수정할 때 사용자에게 두 가지 선택지를 제공합니다:
1. **해당 일정만 수정**: 선택한 일정을 반복 시리즈에서 제외하고 단일 일정으로 변경
2. **전체 시리즈 수정**: 같은 repeatId를 가진 모든 반복 일정을 동일하게 수정

### 사용자 가치
- 일정 관리의 유연성 향상: 특정 날짜의 일정만 예외 처리 가능
- 직관적인 UX: 명확한 선택 다이얼로그로 의도 확인
- 데이터 무결성: 의도하지 않은 전체 수정 방지

---

## 사용자 흐름

### Flow Chart

```
[사용자가 반복 일정의 Edit 버튼 클릭]
          ↓
[handleEditClick(event) 호출]
          ↓
[event.repeat.type !== 'none' && event.repeat.id?]
          ├─ No → [editEvent(event)] → 폼에 데이터 로드 (기존 로직)
          └─ Yes ↓
[RecurringEditDialog 표시]
   ├─ "예" 클릭 → [handleEditSingleOccurrence()]
   │                  ↓
   │               [repeatInfo 제거]
   │                  ↓
   │               [PUT /api/events/:id]
   │                  ↓
   │               [fetchEvents() → 목록 갱신]
   │                  ↓
   │               [다이얼로그 닫기]
   │                  ↓
   │               [성공 메시지: "일정이 수정되었습니다."]
   │
   ├─ "아니오" 클릭 → [handleEditAllOccurrences()]
   │                     ↓
   │                  [폼에 데이터 로드 (editEvent)]
   │                     ↓
   │                  [isEditingRecurringSeries = true 설정]
   │                     ↓
   │                  [다이얼로그 닫기]
   │                     ↓
   │                  [사용자가 폼에서 수정]
   │                     ↓
   │                  [일정 수정 버튼 클릭]
   │                     ↓
   │                  [saveEvent() 호출]
   │                     ↓
   │                  [isEditingRecurringSeries === true?]
   │                     ↓
   │                  [PUT /api/recurring-events/:repeatId]
   │                     ↓
   │                  [fetchEvents() → 목록 갱신]
   │                     ↓
   │                  [성공 메시지: "반복 일정 시리즈가 수정되었습니다."]
   │
   └─ "취소" 클릭 → [다이얼로그 닫기] (아무 작업 없음)
```

### 단계별 설명

#### 1. 수정 버튼 클릭 감지
- 사용자가 일정 목록에서 Edit 아이콘 클릭
- `handleEditClick(event)` 호출
- event 객체에 `repeat.type !== 'none'` && `repeat.id` 존재 시 다이얼로그 표시

#### 2. 다이얼로그 상호작용
- **제목**: "반복 일정 수정"
- **메시지**: "해당 일정만 수정하시겠어요?"
- **선택지**:
  - "예": 단일 수정
  - "아니오": 전체 수정
  - "취소": 작업 취소

#### 3. 단일 수정 흐름
1. 선택된 이벤트의 repeatInfo 제거
2. 단일 이벤트로 PUT 요청
3. 목록 갱신 및 성공 메시지

#### 4. 전체 수정 흐름
1. 폼에 이벤트 데이터 로드
2. `isEditingRecurringSeries` 플래그 설정
3. 사용자가 폼에서 수정
4. 저장 시 전체 시리즈 수정 API 호출

---

## UI 명세

### RecurringEditDialog

**컴포넌트 위치**: App.tsx (기존 Dialog 개선)

**Props**:
```typescript
{
  open: boolean;                           // isRecurringEditDialogOpen
  onClose: () => void;                    // () => setIsRecurringEditDialogOpen(false)
  event: Event | null;                    // selectedRecurringEvent
  onEditSingle: () => Promise<void>;      // handleEditSingleOccurrence
  onEditAll: () => void;                  // handleEditAllOccurrences
}
```

**구조**:
```tsx
<Dialog
  open={isRecurringEditDialogOpen}
  onClose={() => setIsRecurringEditDialogOpen(false)}
  aria-labelledby="recurring-edit-dialog-title"
  data-testid="recurring-edit-dialog"
>
  <DialogTitle id="recurring-edit-dialog-title">
    반복 일정 수정
  </DialogTitle>
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

### 버튼 레이아웃
- **취소**: 텍스트 버튼 (기본 색상)
- **예**: 텍스트 버튼 (primary 색상)
- **아니오**: Contained 버튼 (primary 색상) - 기본 액션 강조

### 접근성 속성
- `aria-labelledby`: 다이얼로그 제목 ID 참조
- `data-testid`: 각 요소에 고유 식별자 부여
- `role`: Dialog는 Material-UI가 자동 설정

---

## 함수 명세

### handleEditSingleOccurrence

**위치**: App.tsx
**타입**: `async () => Promise<void>`

**목적**: 선택된 반복 일정을 단일 일정으로 변경하여 수정

**로직**:
```typescript
const handleEditSingleOccurrence = async () => {
  // 1. 방어 로직
  if (!selectedRecurringEvent) {
    enqueueSnackbar('선택된 일정이 없습니다.', { variant: 'error' });
    return;
  }

  try {
    // 2. repeatInfo 제거 (단일 일정으로 변경)
    const updatedEvent: Event = {
      ...selectedRecurringEvent,
      repeat: {
        type: 'none',
        interval: 1,
        id: undefined,
        endDate: undefined,
      },
    };

    // 3. 단일 이벤트로 수정 (PUT /api/events/:id)
    const response = await fetch(`/api/events/${updatedEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent),
    });

    if (!response.ok) {
      throw new Error('Failed to update single event');
    }

    // 4. 목록 갱신
    await fetchEvents();

    // 5. 상태 초기화
    setIsRecurringEditDialogOpen(false);
    setSelectedRecurringEvent(null);

    // 6. 성공 메시지
    enqueueSnackbar('일정이 수정되었습니다.', { variant: 'success' });
  } catch (error) {
    console.error('Error updating single occurrence:', error);
    enqueueSnackbar('일정 수정 실패', { variant: 'error' });
  }
};
```

**에러 처리**:
- `selectedRecurringEvent`가 null인 경우 early return
- API 실패 시 에러 메시지 표시 및 다이얼로그 유지 (재시도 가능)

---

### handleEditAllOccurrences

**위치**: App.tsx
**타입**: `() => void`

**목적**: 반복 시리즈 전체를 수정하기 위해 폼에 데이터 로드

**로직**:
```typescript
const handleEditAllOccurrences = () => {
  // 1. 방어 로직
  if (!selectedRecurringEvent) {
    enqueueSnackbar('선택된 일정이 없습니다.', { variant: 'error' });
    return;
  }

  // 2. 폼에 데이터 로드 (기존 editEvent 함수 활용)
  editEvent(selectedRecurringEvent);

  // 3. 반복 시리즈 수정 플래그 설정
  setIsEditingRecurringSeries(true);

  // 4. 다이얼로그 닫기
  setIsRecurringEditDialogOpen(false);
  setSelectedRecurringEvent(null);
};
```

**후속 처리**:
- 사용자가 폼에서 수정 후 "일정 수정" 버튼 클릭
- `saveEvent()` 호출 시 `isEditingRecurringSeries` 플래그 확인
- 플래그가 true이면 `updateRecurringSeries()` 호출

---

### saveEvent 수정 (기존 함수 확장)

**위치**: hooks/useEventOperations.ts 또는 App.tsx

**문제점**:
- 현재 `saveEvent`는 단일 수정만 처리 (PUT /api/events/:id)
- 반복 시리즈 수정 여부를 구분하지 못함

**해결 방안**:

#### Option 1: App.tsx에서 플래그 관리 (권장)

```typescript
// App.tsx에 상태 추가
const [isEditingRecurringSeries, setIsEditingRecurringSeries] = useState(false);

// 일정 수정 버튼 핸들러
const handleSaveEvent = async () => {
  if (!editingEvent) return;

  // 반복 시리즈 수정 플래그 확인
  if (isEditingRecurringSeries && editingEvent.repeat.id) {
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
  await saveEvent({
    id: editingEvent.id,
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

#### Option 2: useEventOperations 훅 확장

```typescript
// hooks/useEventOperations.ts
const saveEvent = async (eventData: Event | EventForm, isRecurringSeries = false) => {
  try {
    if (editing && isRecurringSeries && (eventData as Event).repeat.id) {
      await updateRecurringSeries((eventData as Event).repeat.id, {
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        category: eventData.category,
        notificationTime: eventData.notificationTime,
        repeat: eventData.repeat,
      });
      return;
    }

    // 기존 로직...
  }
};
```

**권장**: Option 1 (App.tsx에서 플래그 관리)
- 명확한 의도 표현
- useEventOperations 훅 수정 불필요
- 테스트 용이

---

### 관련 상태 변경

**추가 상태** (App.tsx):
```typescript
const [isEditingRecurringSeries, setIsEditingRecurringSeries] = useState(false);
```

**상태 초기화 시점**:
- 반복 시리즈 수정 완료 후
- 폼 리셋 시 (`resetForm` 확장)
- 편집 취소 시

**기존 상태 유지**:
```typescript
const [isRecurringEditDialogOpen, setIsRecurringEditDialogOpen] = useState(false);
const [selectedRecurringEvent, setSelectedRecurringEvent] = useState<Event | null>(null);
```

---

## 에러 핸들링

### 시나리오별 처리 방법

#### 1. API 실패 (네트워크 에러, 500 에러)

**단일 수정 (handleEditSingleOccurrence)**:
```typescript
catch (error) {
  console.error('Error updating single occurrence:', error);
  enqueueSnackbar('일정 수정 실패', { variant: 'error' });
  // 다이얼로그 상태 유지 (사용자가 재시도 가능)
}
```

**전체 수정 (updateRecurringSeries)**:
```typescript
// hooks/useEventOperations.ts (기존 코드)
catch (error) {
  console.error('Error updating recurring series:', error);
  enqueueSnackbar('반복 일정 수정 실패', { variant: 'error' });
}
```

#### 2. 404 Not Found (반복 시리즈 없음)

**처리**:
```typescript
if (response.status === 404) {
  enqueueSnackbar('반복 일정 시리즈를 찾을 수 없습니다.', { variant: 'error' });
  setIsRecurringEditDialogOpen(false);
  setSelectedRecurringEvent(null);
  return;
}
```

#### 3. 유효성 검사 실패 (폼 에러)

**시간 검증** (기존 useEventForm):
- `startTimeError`, `endTimeError` 상태로 관리
- 에러가 있으면 저장 버튼 비활성화

**날짜 검증**:
- 반복 종료일이 시작일보다 이른 경우 (기존 로직)

**처리**:
```typescript
const isSaveDisabled = !title ||
                       !date ||
                       !startTime ||
                       !endTime ||
                       !!startTimeError ||
                       !!endTimeError;
```

#### 4. 선택된 일정 없음

**처리**:
```typescript
if (!selectedRecurringEvent) {
  enqueueSnackbar('선택된 일정이 없습니다.', { variant: 'error' });
  return;
}
```

### 사용자 피드백

**원칙**:
- 모든 작업에 즉각적인 피드백 제공
- 에러 시 구체적인 메시지 표시
- 성공 시 간결한 메시지 표시

---

## 메시지 목록

### 성공 메시지 (snackbar, variant: 'success')

| 상황 | 메시지 |
|------|--------|
| 단일 일정 수정 성공 | "일정이 수정되었습니다." |
| 반복 시리즈 수정 성공 | "반복 일정 시리즈가 수정되었습니다." |

### 에러 메시지 (snackbar, variant: 'error')

| 상황 | 메시지 |
|------|--------|
| 단일 수정 API 실패 | "일정 수정 실패" |
| 반복 시리즈 수정 실패 | "반복 일정 수정 실패" |
| 반복 시리즈 없음 (404) | "반복 일정 시리즈를 찾을 수 없습니다." |
| 선택된 일정 없음 | "선택된 일정이 없습니다." |

### 정보 메시지 (dialog)

| 위치 | 메시지 |
|------|--------|
| RecurringEditDialog 제목 | "반복 일정 수정" |
| RecurringEditDialog 본문 | "해당 일정만 수정하시겠어요?<br />"예"를 선택하면 이 일정만 단일 일정으로 변경됩니다.<br />"아니오"를 선택하면 반복 시리즈 전체를 수정할 수 있습니다." |

---

## 참고 사항

### 기존 코드와의 통합 포인트

#### 1. useEventForm 훅 (hooks/useEventForm.ts)
- `editEvent(event)` 함수 활용
- 기존 폼 상태 관리 로직 재사용
- `resetForm()` 확장하여 `isEditingRecurringSeries` 초기화 필요

#### 2. useEventOperations 훅 (hooks/useEventOperations.ts)
- `updateRecurringSeries()` 함수 활용 (기존 구현)
- `saveEvent()` 로직은 App.tsx에서 분기 처리 (훅 수정 불필요)

#### 3. App.tsx 기존 로직
- `handleEditClick()` 함수 유지 (이미 구현됨)
- RecurringEditDialog 개선 (버튼 추가)
- 일정 수정 버튼 핸들러에 플래그 체크 로직 추가

### 주의사항

#### 1. 상태 동기화
- `isEditingRecurringSeries` 플래그는 반복 시리즈 수정 완료 후 즉시 초기화
- `editingEvent`와 `selectedRecurringEvent` 독립적 관리

#### 2. API 호출 순서
- 단일 수정: `PUT /api/events/:id` (즉시 호출)
- 전체 수정: 폼 로드 → 사용자 수정 → `PUT /api/recurring-events/:repeatId`

#### 3. 반복 정보 처리
- 단일 수정 시 `repeat.id` 제거 필수
- 전체 수정 시 `repeat.id` 유지

#### 4. 기존 기능 보호
- 단일 일정 수정 로직 영향 없음 (repeat.type === 'none')
- 반복 일정 삭제 기능 영향 없음 (handleDeleteClick 독립)

---

**작성자**: feature-designer (orchestrator 역할 수행)
**작성일**: 2025-10-30
**검토자**: -
**승인일**: 2025-10-30
