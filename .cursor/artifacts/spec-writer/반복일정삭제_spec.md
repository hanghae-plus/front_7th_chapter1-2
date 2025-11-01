# 명세서: 반복 일정 삭제

**Status**: Specification Complete - Awaiting User Approval
**Next Action**: 사용자 승인되면 이 문서를 @po에게 User Story 작성을 요청합니다.

명세서 확인되면 "확인" 또는 "ok"로 답변해주세요.
수정 사항이 있으시면 구체적인 내용을 말씀해주세요.

---

## 1. 개요

### 1.1 목적

사용자가 반복 일정을 삭제할 때, 해당 일정만 삭제할지 전체 반복 시리즈를 삭제할지 선택할 수 있는 기능을 제공한다.

### 1.2 범위

- 반복 일정 삭제 시 선택 다이얼로그 표시 기능
- 단일 인스턴스와 전체 시리즈 삭제 기능 분리
- 일반 일정 삭제 기능 유지

### 1.3 배경

현재 시스템은 모든 일정을 동일한 방식으로 삭제하고 있다. 반복 일정의 경우 사용자 의도에 따라 단일 또는 전체 삭제를 선택할 수 있는 UI가 필요하다.

---

## 2. 세부 기능 명세

### 2.1 반복 일정 삭제 판별 조건

**반복 일정으로 판별하는 조건**:

- `event.repeat.type !== 'none'`
- 반복 유형이 `'daily'`, `'weekly'`, `'monthly'`, `'yearly'` 중 하나인 경우

**일반 일정으로 판별하는 조건**:

- `event.repeat.type === 'none'`인 경우

**삭제 방식**: 조건에 따라 다른 플로우

### 2.2 삭제 선택 다이얼로그

#### 2.2.1 다이얼로그 표시 조건

**반복 일정인 경우**:

- 삭제 버튼 클릭 시 즉시 삭제하지 않고 다이얼로그 표시
- 다이얼로그 제목: "반복 일정 삭제"
- 다이얼로그 내용: "해당 일정만 삭제하시겠어요?"

**일반 일정인 경우**:

- 기존 삭제 로직 (다이얼로그 표시하지 않고 바로 삭제 또는 기존 확인 다이얼로그)
- 변경점: 없음 (기존 동작 유지)

#### 2.2.2 다이얼로그 UI 구성

**버튼 1: "예"**

- 텍스트: "예"
- 동작: 해당 일정만 삭제 (단일 삭제)
- 색상: 기본 버튼 스타일

**버튼 2: "아니오"**

- 텍스트: "아니오"
- 동작: 반복 일정의 모든 일정 삭제 (전체 삭제)
- 색상: 기본 버튼 스타일

#### 2.2.3 다이얼로그 플로우 차트

```
사용자가 반복 일정의 삭제 버튼 클릭
    ↓
다이얼로그 표시: "해당 일정만 삭제하시겠어요?"
    ↓
사용자 선택
    사용자가 "예" 선택 시 → 해당 일정만 삭제 (2.3.1 참조)
    사용자가 "아니오" 선택 시 → 반복 일정 전체 삭제 (2.3.2 참조)
```

### 2.3 삭제 처리 로직

#### 2.3.1 단일 일정 삭제 ("예" 선택)

**API 엔드포인트**: `DELETE /api/events/:id`

**요청**:

- Method: `DELETE`
- Path: `/api/events/{eventId}`
- Body: 없음

**응답**:

- Status: `204 No Content`
- Body: 없음

**처리과정**:

1. 선택된 일정만 삭제
2. 동일한 `repeat.id`를 가진 다른 인스턴스는 유지
3. 일정 목록에서 해당 날짜 항목만 제거
4. 성공 토스트 메시지: "일정이 삭제되었습니다."

**예시**:

- 기존 반복 일정: 2025-01-15, 2025-01-22, 2025-01-29 (매주 수요일)
- 2025-01-22 일정 삭제 시도 → "예" 선택
- 결과: 2025-01-22만 삭제, 2025-01-15와 2025-01-29는 유지

#### 2.3.2 전체 반복 일정 삭제 ("아니오" 선택)

**API 엔드포인트**: `DELETE /api/recurring-events/:repeatId`

**요청**:

- Method: `DELETE`
- Path: `/api/recurring-events/{repeatId}`
- Body: 없음

**응답**:

- Status: `204 No Content`
- Body: 없음

**처리과정**:

1. 선택된 일정의 `repeat.id`를 통해 동일한 `repeat.id`를 가진 모든 인스턴스 삭제
2. 일정 목록에서 모든 관련 항목 제거
3. 성공 토스트 메시지: "반복 일정 전체가 삭제되었습니다."

**예시**:

- 기존 반복 일정: 2025-01-15, 2025-01-22, 2025-01-29 (매주 수요일, 동일 `repeat.id = 'repeat-123'`)
- 2025-01-22 일정 삭제 시도 → "아니오" 선택
- 결과: 2025-01-15, 2025-01-22, 2025-01-29 모두 삭제됨

#### 2.3.3 repeat.id 검증

**repeat.id 없는 경우 처리**:

- 반복일정이지만 `event.repeat.id` 가 없는 경우
- `repeat.id`가 없으면 전체 시리즈 삭제가 불가능한 상황 (데이터 정합성 오류)
- 이런 경우 오류 처리: "반복 일정 정보를 찾을 수 없습니다."

---

## 3. 엣지 케이스

### 3.1 반복 정보 불완전 케이스

#### 케이스 1: repeat.id가 없는 반복 일정

**상황**: `event.repeat.type !== 'none'`이지만 `event.repeat.id`가 없는 경우

**문제 상황**:

- 전체 삭제 시 `repeat.id`가 없어서 다른 인스턴스 찾을 수 없음
- 데이터 정합성 오류가 발생할 수 있음

**해결 방안**:

- "아니오" 선택 시 에러 메시지 표시: "반복 일정 정보가 없어 전체 삭제할 수 없습니다."
- 단일 삭제만 허용 (`DELETE /api/events/:id`)

#### 케이스 2: repeat.type이 'none'인데 repeat.id가 있는 경우

**상황**: 일반 일정(`repeat.type === 'none'`)인데 `repeat.id`가 존재하는 경우

**문제 상황**:

- 데이터 불일치로 인해 예상치 못한 동작이 발생할 수 있음
- 다이얼로그 표시 여부를 판단하기 어려운 상황

**해결 방안**:

- 우선순위 규칙: 일반 삭제 로직을 `repeat.type`을 기준
- `repeat.id`가 있어도 `repeat.type === 'none'`이면 일반 삭제로 처리

### 3.2 네트워크 오류 처리

#### 케이스 3: 네트워크 오류 발생

**상황**: 삭제 API 호출 중 네트워크 오류 발생

**문제 상황**:

- 요청 실패
- 사용자 혼란 발생

**해결 방안**:

- 에러 토스트 메시지: "삭제 실패"
- 다이얼로그는 열린 상태로 유지 (재시도 가능)

#### 케이스 4: 삭제 대상이 이미 없는 경우

**상황**: 삭제 하려는 일정이 다른 세션에서 이미 삭제된 상황

**문제 상황**:

- 서버에서 404 오류 반환
- 삭제 실패

**해결 방안**:

- 에러 토스트 메시지: "일정을 찾을 수 없습니다."
- 일정 목록 새로고침
- 다이얼로그 닫기

#### 케이스 5: 전체 삭제 시 repeatId를 찾지못하는 오류 처리

**상황**: 전체 삭제 API 호출 시 해당 `repeatId`가 서버에 존재하지 않는 경우

**문제 상황**:

- 서버에서 404 오류 반환
- 삭제 실패

**해결 방안**:

- 에러 토스트 메시지: "반복 일정을 찾을 수 없습니다."
- 일정 목록 새로고침
- 다이얼로그 닫기

### 3.3 UI 사용자 경험 케이스

#### 케이스 6: 다이얼로그 취소 또는 닫기 시 ESC 키

**상황**: 다이얼로그 표시 중 사용자가 취소 버튼 또는 ESC 키 입력

**문제 상황**:

- 사용자가 "예" 또는 "아니오"를 선택하지 않고 다이얼로그를 닫힘

**해결 방안**:

- 다이얼로그 닫기
- 삭제 작업 취소
- 일정 목록 변화 없음
- 사용자는 반드시 "예" 또는 "아니오" 중 하나를 선택해야 함

---

## 4. 사용자 흐름

### 4.1 단일 인스턴스 삭제 흐름

1. **반복 일정인지 확인 단계**

   - 반복 일정(`repeat.type !== 'none'`)인 경우 다이얼로그 표시

2. **삭제 다이얼로그 표시**

   - 제목: "반복 일정 삭제"
   - 내용: "해당 일정만 삭제하시겠어요?"
   - 선택: "예", "아니오"

3. **"예" 선택**

   - 다이얼로그 닫기
   - `DELETE /api/events/:id` API 호출

4. **완료 처리**
   - 일정 목록 새로고침
   - 성공 메시지: "일정이 삭제되었습니다."
   - 동일한 `repeat.id`를 가진 다른 인스턴스는 유지

### 4.2 전체 시리즈 삭제 흐름

1. **반복 일정인지 확인 단계**

   - 반복 일정(`repeat.type !== 'none'`)인 경우 다이얼로그 표시

2. **삭제 다이얼로그 표시**

   - 제목: "반복 일정 삭제"
   - 내용: "해당 일정만 삭제하시겠어요?"
   - 선택: "예", "아니오"

3. **"아니오" 선택**

   - 다이얼로그 닫기
   - `DELETE /api/recurring-events/:repeatId` API 호출

4. **완료 처리**
   - 일정 목록 새로고침
   - 성공 메시지: "반복 일정 전체가 삭제되었습니다."
   - 동일한 `repeat.id`를 가진 모든 인스턴스 삭제

### 4.3 일반 일정 삭제 흐름

1. **반복 일정인지 확인 단계**

   - 일반 일정(`repeat.type === 'none'`)인 경우 기존 삭제

2. **기존 삭제 로직**
   - 기존 다이얼로그 표시 없이 바로 삭제 또는 기존 확인 다이얼로그 표시
   - (현재 구현된 삭제 방식)

---

## 5. 타입 정의

### 5.1 Event 인터페이스 (기존 유지)

```typescript
interface Event {
  id: string;
  title: string;
  date: string; // ISO 8601 형식
  startTime: string; // HH:mm 형식
  endTime: string; // HH:mm 형식
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number;
}

interface RepeatInfo {
  type: RepeatType; // 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number;
  endDate: string;
  id?: string; // 반복 시리즈 식별자용 필드 (선택적 필드)
}
```

### 5.2 삭제 다이얼로그 상태관리 타입

```typescript
interface DeleteDialogState {
  open: boolean;
  eventId: string | null;
  repeatId: string | null;
  eventTitle: string;
}
```

---

## 6. 테스트 시나리오

### 시나리오 1: 단일 인스턴스 삭제

1. 사용자가 반복 일정의 삭제 버튼을 클릭한다.
2. "해당 일정만 삭제하시겠어요?" 다이얼로그가 나타난다.
3. 사용자가 "예"를 선택한다.
4. 해당 일정만 삭제되고, 동일한 `repeat.id`를 가진 다른 인스턴스는 유지된다.
5. 성공 메시지 "일정이 삭제되었습니다."가 표시된다.

### 시나리오 2: 전체 시리즈 삭제

1. 사용자가 반복 일정의 삭제 버튼을 클릭한다.
2. "해당 일정만 삭제하시겠어요?" 다이얼로그가 나타난다.
3. 사용자가 "아니오"를 선택한다.
4. 동일한 `repeat.id`를 가진 모든 일정이 삭제된다.
5. 성공 메시지 "반복 일정 전체가 삭제되었습니다."가 표시된다.

### 시나리오 3: 일반 일정 삭제

1. 사용자가 일반 일정의 삭제 버튼을 클릭한다.
2. 삭제 다이얼로그는 표시되지 않거나 기존 삭제 확인만 표시된다.
3. 일정이 삭제된다.
4. (현재 구현된 방식)

---

## 7. 검증 기준

### 7.1 기능 요구

- 반복 일정 삭제 시에만 선택 다이얼로그 표시됨 (`repeat.type !== 'none'`).
- 일반 일정 삭제 시 기존 동작 유지됨.
- "예" 선택 시 단일 일정만 삭제됨.
- "아니오" 선택 시 반복 일정 전체가 삭제됨.
- 삭제 완료 후 일정 목록이 새로고침됨.
- 적절한 성공/오류 메시지가 표시됨.

### 7.2 API 요구

- 단일 삭제 시 `DELETE /api/events/:id` API가 호출됨.
- 전체 삭제 시 `DELETE /api/recurring-events/:repeatId` API가 호출됨.
- 삭제 후 일정 목록이 최신 상태로 갱신됨.

### 7.3 예외 처리 요구

- `repeat.id`가 없는 경우에도 오류 없이 처리됨.
- 네트워크 오류 시 적절한 에러 메시지 표시됨.
- 존재하지 않는 일정 삭제 시도 시 적절한 오류 처리됨.

---

## 8. 구현 가이드

### 8.1 파일 위치

- 다이얼로그 컴포넌트: `src/App.tsx`에 Dialog 컴포넌트 추가
- 삭제 로직: `src/hooks/useEventOperations.ts`에 `deleteEvent` 함수 수정 및 새로운 함수 추가

### 8.2 삭제 다이얼로그 상태 관리

```typescript
// 다이얼로그 상태 관리
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [deleteTargetEvent, setDeleteTargetEvent] = useState<Event | null>(null);

// 삭제 버튼 클릭 핸들러
const handleDeleteClick = (event: Event) => {
  if (event.repeat.type !== 'none') {
    // 반복 일정인 경우 삭제 선택 다이얼로그 표시
    setDeleteTargetEvent(event);
    setDeleteDialogOpen(true);
  } else {
    // 일반 일정인 경우 기존 삭제 로직 실행
    deleteEvent(event.id);
  }
};

// 단일 삭제 처리
const handleSingleDelete = () => {
  if (deleteTargetEvent) {
    deleteEvent(deleteTargetEvent.id);
    setDeleteDialogOpen(false);
    setDeleteTargetEvent(null);
  }
};

// 전체 삭제 처리
const handleDeleteAll = async () => {
  if (deleteTargetEvent?.repeat.id) {
    try {
      const response = await fetch(`/api/recurring-events/${deleteTargetEvent.repeat.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete recurring events');
      }
      await fetchEvents();
      enqueueSnackbar('반복 일정 전체가 삭제되었습니다.', { variant: 'info' });
      setDeleteDialogOpen(false);
      setDeleteTargetEvent(null);
    } catch (error) {
      console.error('Error deleting recurring events:', error);
      enqueueSnackbar('삭제 실패', { variant: 'error' });
    }
  } else {
    enqueueSnackbar('반복 일정 정보를 찾을 수 없습니다.', { variant: 'error' });
  }
};
```

### 8.3 다이얼로그 UI 구현

```tsx
<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
  <DialogTitle>반복 일정 삭제</DialogTitle>
  <DialogContent>
    <DialogContentText>해당 일정만 삭제하시겠어요?</DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleSingleDelete}>예</Button>
    <Button onClick={handleDeleteAll}>아니오</Button>
  </DialogActions>
</Dialog>
```

### 8.4 시간대 처리

- 모든 날짜/시간은 한국표준시(KST, UTC+9) 기준으로 처리한다.
- 날짜 형식은 ISO 8601 형식 (YYYY-MM-DD) 사용한다.

---

**Version**: 1.2.0
**Last Updated**: 2025-01-31
**Author**: Spec Writer Agent
**Changelog**:

- v1.2.0: 버튼 텍스트를 "예", "아니오"로 변경, 다이얼로그 내용을 "해당 일정만 삭제하시겠어요?"로 변경
- v1.1.0: "모두" 버튼 의미 명확화
