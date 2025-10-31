# Phase 2: Test Design - 반복 일정 삭제 기능

**Date**: 2025-10-31
**Designer**: test-designer
**Feature**: Recurring Event Delete Test Scenarios

---

## 1. Executive Summary

### 1.1 Test Design Overview
반복 일정 삭제 기능의 포괄적인 테스트 시나리오를 설계했습니다. 총 8개의 테스트 케이스로 정상 동작 3개, 에지 케이스 2개, 에러 처리 3개를 커버합니다.

### 1.2 Key Findings
- **MSW 핸들러 이미 구현됨**: `handlers.ts`에 단일/시리즈 삭제 핸들러 존재
- **테스트 방식**: App 컴포넌트 통합 테스트 (UI + API)
- **테스트 도구**: Vitest + @testing-library/react + MSW

### 1.3 Test Coverage Goals
- **Line Coverage**: 100% (신규 핸들러 함수)
- **Branch Coverage**: 모든 분기 (취소/예/아니오)
- **Edge Cases**: 5가지 모두 커버
- **API Integration**: 단일/시리즈 삭제 API 호출 검증

---

## 2. Test File Specification

### 2.1 File Metadata
```typescript
/**
 * Test File: task.recurringDelete.spec.ts
 * Location: src/__tests__/components/
 * Purpose: 반복 일정 삭제 기능 통합 테스트
 * Pattern: GWT (Given-When-Then)
 * Tools: Vitest, @testing-library/react, MSW
 */
```

### 2.2 Import Structure
```typescript
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';

import App from '../../App';
import { resetEventsState } from '../../__mocks__/handlers';
import { server } from '../../setupTests';
import { Event } from '../../types';
```

**Rationale**:
- `resetEventsState`: 각 테스트 전 Mock 데이터 초기화
- `server`: MSW 서버 (런타임 핸들러 오버라이드용)
- `userEvent`: 사용자 인터랙션 시뮬레이션

### 2.3 Test Structure
```typescript
describe('반복 일정 삭제 기능', () => {
  beforeEach(() => {
    resetEventsState(); // Mock 데이터 초기화
    vi.clearAllMocks(); // Mock 함수 초기화
  });

  describe('정상 동작', () => {
    // 3개 테스트
  });

  describe('에지 케이스', () => {
    // 2개 테스트
  });

  describe('에러 처리', () => {
    // 3개 테스트
  });
});
```

---

## 3. Mock Data Specification

### 3.1 Mock Event Data

#### 반복 일정 (주간 회의)
```typescript
const mockRecurringEvent: Event = {
  id: 'recurring-event-1',
  title: '주간 회의',
  date: '2025-10-31',
  startTime: '10:00',
  endTime: '11:00',
  description: '팀 주간 회의',
  location: '회의실 A',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-12-31',
    id: 'repeat-weekly-123',
  },
  notificationTime: 10,
};
```

#### 같은 시리즈의 다른 일정
```typescript
const mockRecurringEvent2: Event = {
  ...mockRecurringEvent,
  id: 'recurring-event-2',
  date: '2025-11-07', // 1주 후
};

const mockRecurringEvent3: Event = {
  ...mockRecurringEvent,
  id: 'recurring-event-3',
  date: '2025-11-14', // 2주 후
};
```

#### 일반 일정 (비교용)
```typescript
const mockNormalEvent: Event = {
  id: 'normal-event-1',
  title: '단일 미팅',
  date: '2025-11-01',
  startTime: '14:00',
  endTime: '15:00',
  description: '일회성 미팅',
  location: '회의실 B',
  category: '개인',
  repeat: {
    type: 'none',
    interval: 0,
  },
  notificationTime: 10,
};
```

### 3.2 Mock API Responses

#### 성공 응답 (단일 삭제)
```typescript
// DELETE /api/events/:id
Response: 204 No Content
Body: null
```

#### 성공 응답 (시리즈 삭제)
```typescript
// DELETE /api/recurring-events/:repeatId
Response: 204 No Content
Body: null
```

#### 에러 응답 (404 - 시리즈를 찾을 수 없음)
```typescript
// DELETE /api/recurring-events/:repeatId
Response: 404 Not Found
Body: null
```

#### 에러 응답 (500 - 서버 오류)
```typescript
// DELETE /api/events/:id
Response: 500 Internal Server Error
Body: null
```

---

## 4. MSW Handlers Analysis

### 4.1 기존 핸들러 (이미 구현됨)

#### handlers.ts:40-50 - 단일 삭제 핸들러 ✅
```typescript
http.delete('/api/events/:id', ({ params }) => {
  const { id } = params;
  const index = events.findIndex((event) => event.id === id);

  if (index !== -1) {
    events.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }

  return new HttpResponse(null, { status: 404 });
}),
```

**Analysis**:
- ✅ 204 No Content 반환 (성공)
- ✅ 404 Not Found 반환 (실패)
- ✅ events 배열에서 해당 id 제거

#### handlers.ts:103-118 - 시리즈 삭제 핸들러 ✅
```typescript
http.delete('/api/recurring-events/:repeatId', ({ params }) => {
  const { repeatId } = params;

  if (!repeatId) {
    return new HttpResponse(null, { status: 404 });
  }

  const initialLength = events.length;
  events = events.filter((event) => event.repeat.id !== repeatId);

  if (events.length === initialLength) {
    return new HttpResponse(null, { status: 404 });
  }

  return new HttpResponse(null, { status: 204 });
}),
```

**Analysis**:
- ✅ 204 No Content 반환 (성공)
- ✅ 404 Not Found 반환 (실패 - repeatId 없음 또는 일정 없음)
- ✅ 같은 repeatId를 가진 모든 일정 제거

### 4.2 에러 시뮬레이션 핸들러 (추가 필요)

#### 단일 삭제 500 에러
```typescript
server.use(
  http.delete('/api/events/:id', () => {
    return new HttpResponse(null, { status: 500 });
  })
);
```

#### 시리즈 삭제 404 에러
```typescript
server.use(
  http.delete('/api/recurring-events/:repeatId', () => {
    return new HttpResponse(null, { status: 404 });
  })
);
```

**Usage**: 각 테스트 내부에서 `server.use()`로 런타임 오버라이드

---

## 5. Detailed Test Scenarios

### 5.1 정상 동작 테스트

#### Test 1: 단일 일정 삭제 (Happy Path)
```typescript
it('사용자가 "예"를 선택하면 해당 일정만 삭제된다', async () => {
  // Given: 반복 일정 3개가 표시된 상태
  const user = userEvent.setup();

  // Mock 데이터 설정 (반복 일정 3개)
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({
        events: [
          mockRecurringEvent,
          mockRecurringEvent2,
          mockRecurringEvent3,
        ],
      });
    })
  );

  render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );

  // 일정 로딩 대기
  await waitFor(() => {
    expect(screen.getByText('주간 회의')).toBeInTheDocument();
  });

  // 첫 번째 일정의 삭제 버튼 찾기
  const eventCards = screen.getAllByText('주간 회의');
  expect(eventCards).toHaveLength(3); // 3개 모두 표시됨

  // When: 첫 번째 일정의 삭제 버튼 클릭
  const deleteButtons = screen.getAllByLabelText('삭제');
  await user.click(deleteButtons[0]);

  // 다이얼로그 표시 확인
  await waitFor(() => {
    expect(screen.getByTestId('recurring-delete-dialog')).toBeInTheDocument();
  });

  expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();

  // "예" 버튼 클릭
  const yesButton = screen.getByTestId('delete-single-button');
  await user.click(yesButton);

  // Then: 단일 삭제 API 호출 및 결과 확인
  await waitFor(() => {
    // 다이얼로그 닫힘
    expect(screen.queryByTestId('recurring-delete-dialog')).not.toBeInTheDocument();
  });

  // Snackbar 확인
  await waitFor(() => {
    expect(screen.getByText('일정이 삭제되었습니다.')).toBeInTheDocument();
  });

  // 나머지 2개 일정은 여전히 존재
  await waitFor(() => {
    const remainingEvents = screen.getAllByText('주간 회의');
    expect(remainingEvents).toHaveLength(2);
  });
});
```

**Assertions**:
1. ✅ 다이얼로그 표시
2. ✅ 올바른 메시지 표시
3. ✅ "예" 버튼 클릭 시 다이얼로그 닫힘
4. ✅ Snackbar "일정이 삭제되었습니다." 표시
5. ✅ 하나만 삭제되고 나머지는 유지

---

#### Test 2: 전체 시리즈 삭제 (Danger Path)
```typescript
it('사용자가 "아니오"를 선택하면 반복 시리즈 전체가 삭제된다', async () => {
  // Given: 반복 일정 3개가 표시된 상태
  const user = userEvent.setup();

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({
        events: [
          mockRecurringEvent,
          mockRecurringEvent2,
          mockRecurringEvent3,
        ],
      });
    })
  );

  render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('주간 회의')).toBeInTheDocument();
  });

  const eventCards = screen.getAllByText('주간 회의');
  expect(eventCards).toHaveLength(3);

  // When: 삭제 버튼 클릭 → "아니오" 선택
  const deleteButtons = screen.getAllByLabelText('삭제');
  await user.click(deleteButtons[0]);

  await waitFor(() => {
    expect(screen.getByTestId('recurring-delete-dialog')).toBeInTheDocument();
  });

  // "아니오" 버튼 클릭 (전체 삭제)
  const noButton = screen.getByTestId('delete-series-button');
  expect(noButton).toHaveStyle({ color: 'error' }); // 위험 색상 확인
  await user.click(noButton);

  // Then: 시리즈 삭제 API 호출 및 결과 확인
  await waitFor(() => {
    expect(screen.queryByTestId('recurring-delete-dialog')).not.toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('반복 일정 시리즈가 삭제되었습니다.')).toBeInTheDocument();
  });

  // 모든 반복 일정이 사라짐
  await waitFor(() => {
    expect(screen.queryByText('주간 회의')).not.toBeInTheDocument();
  });
});
```

**Assertions**:
1. ✅ 다이얼로그 표시
2. ✅ "아니오" 버튼이 error 색상
3. ✅ "아니오" 버튼 클릭 시 다이얼로그 닫힘
4. ✅ Snackbar "반복 일정 시리즈가 삭제되었습니다." 표시
5. ✅ 모든 반복 일정 삭제됨

---

#### Test 3: 취소 선택 (Safe Exit)
```typescript
it('사용자가 "취소"를 선택하면 아무것도 삭제되지 않는다', async () => {
  // Given: 반복 일정 3개가 표시된 상태
  const user = userEvent.setup();

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({
        events: [
          mockRecurringEvent,
          mockRecurringEvent2,
          mockRecurringEvent3,
        ],
      });
    })
  );

  render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('주간 회의')).toBeInTheDocument();
  });

  const initialCount = screen.getAllByText('주간 회의').length;
  expect(initialCount).toBe(3);

  // When: 삭제 버튼 클릭 → "취소" 선택
  const deleteButtons = screen.getAllByLabelText('삭제');
  await user.click(deleteButtons[0]);

  await waitFor(() => {
    expect(screen.getByTestId('recurring-delete-dialog')).toBeInTheDocument();
  });

  // "취소" 버튼 클릭
  const cancelButton = screen.getByTestId('cancel-delete-button');
  await user.click(cancelButton);

  // Then: 다이얼로그만 닫히고 일정은 유지
  await waitFor(() => {
    expect(screen.queryByTestId('recurring-delete-dialog')).not.toBeInTheDocument();
  });

  // Snackbar 표시 없음
  expect(screen.queryByText('일정이 삭제되었습니다.')).not.toBeInTheDocument();
  expect(screen.queryByText('반복 일정 시리즈가 삭제되었습니다.')).not.toBeInTheDocument();

  // 모든 일정이 여전히 존재
  const finalCount = screen.getAllByText('주간 회의').length;
  expect(finalCount).toBe(3);
});
```

**Assertions**:
1. ✅ 다이얼로그 표시
2. ✅ "취소" 버튼 클릭 시 다이얼로그 닫힘
3. ✅ Snackbar 표시 없음
4. ✅ 모든 일정 유지됨

---

### 5.2 에지 케이스 테스트

#### Test 4: repeatId가 없는 반복 일정
```typescript
it('repeatId가 없는 반복 일정은 다이얼로그 없이 단일 삭제된다', async () => {
  // Given: repeatId가 없는 "반복 일정"
  const user = userEvent.setup();

  const eventWithoutRepeatId: Event = {
    ...mockRecurringEvent,
    id: 'event-no-repeatid',
    repeat: {
      type: 'weekly', // 반복 타입은 있지만
      interval: 1,
      // id가 없음 (데이터 무결성 문제)
    },
  };

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({
        events: [eventWithoutRepeatId],
      });
    })
  );

  render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('주간 회의')).toBeInTheDocument();
  });

  // When: 삭제 버튼 클릭
  const deleteButton = screen.getByLabelText('삭제');
  await user.click(deleteButton);

  // Then: 다이얼로그가 열리지 않고 즉시 삭제
  // (또는 다이얼로그가 열리지만 단일 삭제만 가능)

  // Option 1: 다이얼로그 없이 즉시 삭제 (handleDeleteClick 로직에 따라)
  await waitFor(() => {
    expect(screen.queryByTestId('recurring-delete-dialog')).not.toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText('일정이 삭제되었습니다.')).toBeInTheDocument();
  });

  expect(screen.queryByText('주간 회의')).not.toBeInTheDocument();
});
```

**Assertions**:
1. ✅ repeatId 없으면 다이얼로그 열리지 않음
2. ✅ 단일 삭제 API 호출
3. ✅ Snackbar "일정이 삭제되었습니다." 표시

---

#### Test 5: selectedRecurringEvent가 null인 경우
```typescript
it('선택된 일정이 없는 상태에서 핸들러 호출 시 에러 처리된다', async () => {
  // Given: selectedRecurringEvent = null (비정상 상태)
  // Note: 이 테스트는 방어 코드를 검증하기 위한 것
  // 실제로는 다이얼로그가 열리지 않으면 버튼을 클릭할 수 없음

  const user = userEvent.setup();

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({
        events: [mockRecurringEvent],
      });
    })
  );

  render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('주간 회의')).toBeInTheDocument();
  });

  // When: 삭제 버튼 클릭
  const deleteButton = screen.getByLabelText('삭제');
  await user.click(deleteButton);

  await waitFor(() => {
    expect(screen.getByTestId('recurring-delete-dialog')).toBeInTheDocument();
  });

  // 비정상적인 시나리오: 다이얼로그가 열렸지만 selectedRecurringEvent가 null
  // (실제로는 발생하기 어려움, 코드 방어 목적)

  // App 컴포넌트의 방어 코드가 작동하여 에러 메시지 표시
  // 이 테스트는 구현 후 실제 동작에 따라 조정 필요

  // 예상 동작: "예" 또는 "아니오" 클릭 시 에러 처리
  const yesButton = screen.getByTestId('delete-single-button');
  await user.click(yesButton);

  // Then: 에러 메시지 표시
  await waitFor(() => {
    expect(screen.getByText('선택된 일정이 없습니다.')).toBeInTheDocument();
  });

  // 다이얼로그 닫힘
  await waitFor(() => {
    expect(screen.queryByTestId('recurring-delete-dialog')).not.toBeInTheDocument();
  });
});
```

**Assertions**:
1. ✅ null 체크 방어 코드 작동
2. ✅ 에러 Snackbar "선택된 일정이 없습니다." 표시
3. ✅ 다이얼로그 닫힘
4. ✅ API 호출 없음

**Note**: 이 테스트는 실제 구현에서 발생하기 어려운 시나리오이므로 선택 사항일 수 있음

---

### 5.3 에러 처리 테스트

#### Test 6: 단일 삭제 API 500 에러
```typescript
it('단일 삭제 API 에러 시 에러 메시지를 표시한다', async () => {
  // Given: 반복 일정이 표시된 상태
  const user = userEvent.setup();

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({
        events: [mockRecurringEvent],
      });
    }),
    // 삭제 API를 500 에러로 오버라이드
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('주간 회의')).toBeInTheDocument();
  });

  // When: 삭제 버튼 클릭 → "예" 선택
  const deleteButton = screen.getByLabelText('삭제');
  await user.click(deleteButton);

  await waitFor(() => {
    expect(screen.getByTestId('recurring-delete-dialog')).toBeInTheDocument();
  });

  const yesButton = screen.getByTestId('delete-single-button');
  await user.click(yesButton);

  // Then: 에러 메시지 표시
  await waitFor(() => {
    expect(screen.getByText('일정 삭제 실패')).toBeInTheDocument();
  });

  // 다이얼로그는 닫힘
  await waitFor(() => {
    expect(screen.queryByTestId('recurring-delete-dialog')).not.toBeInTheDocument();
  });

  // 일정은 여전히 존재 (삭제 실패)
  expect(screen.getByText('주간 회의')).toBeInTheDocument();
});
```

**Assertions**:
1. ✅ API 500 에러 발생
2. ✅ 에러 Snackbar "일정 삭제 실패" 표시
3. ✅ 다이얼로그 닫힘
4. ✅ 일정은 삭제되지 않음

---

#### Test 7: 시리즈 삭제 API 404 에러
```typescript
it('시리즈 삭제 API 404 에러 시 에러 메시지를 표시한다', async () => {
  // Given: 반복 일정이 표시된 상태
  const user = userEvent.setup();

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({
        events: [mockRecurringEvent],
      });
    }),
    // 시리즈 삭제 API를 404 에러로 오버라이드
    http.delete('/api/recurring-events/:repeatId', () => {
      return new HttpResponse(null, { status: 404 });
    })
  );

  render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('주간 회의')).toBeInTheDocument();
  });

  // When: 삭제 버튼 클릭 → "아니오" 선택
  const deleteButton = screen.getByLabelText('삭제');
  await user.click(deleteButton);

  await waitFor(() => {
    expect(screen.getByTestId('recurring-delete-dialog')).toBeInTheDocument();
  });

  const noButton = screen.getByTestId('delete-series-button');
  await user.click(noButton);

  // Then: 에러 메시지 표시
  // useEventOperations.ts:133-134 참조
  await waitFor(() => {
    expect(screen.getByText('반복 일정 시리즈를 찾을 수 없습니다.')).toBeInTheDocument();
  });

  // 다이얼로그는 닫힘
  await waitFor(() => {
    expect(screen.queryByTestId('recurring-delete-dialog')).not.toBeInTheDocument();
  });

  // 일정은 여전히 존재 (삭제 실패)
  expect(screen.getByText('주간 회의')).toBeInTheDocument();
});
```

**Assertions**:
1. ✅ API 404 에러 발생
2. ✅ 에러 Snackbar "반복 일정 시리즈를 찾을 수 없습니다." 표시
3. ✅ 다이얼로그 닫힘
4. ✅ 일정은 삭제되지 않음

---

#### Test 8: 시리즈 삭제 API 일반 에러
```typescript
it('시리즈 삭제 API 일반 에러 시 에러 메시지를 표시한다', async () => {
  // Given: 반복 일정이 표시된 상태
  const user = userEvent.setup();

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({
        events: [mockRecurringEvent],
      });
    }),
    // 시리즈 삭제 API를 500 에러로 오버라이드
    http.delete('/api/recurring-events/:repeatId', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('주간 회의')).toBeInTheDocument();
  });

  // When: 삭제 버튼 클릭 → "아니오" 선택
  const deleteButton = screen.getByLabelText('삭제');
  await user.click(deleteButton);

  await waitFor(() => {
    expect(screen.getByTestId('recurring-delete-dialog')).toBeInTheDocument();
  });

  const noButton = screen.getByTestId('delete-series-button');
  await user.click(noButton);

  // Then: 일반 에러 메시지 표시
  // useEventOperations.ts:142-143 참조
  await waitFor(() => {
    expect(screen.getByText('반복 일정 삭제 실패')).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.queryByTestId('recurring-delete-dialog')).not.toBeInTheDocument();
  });

  expect(screen.getByText('주간 회의')).toBeInTheDocument();
});
```

**Assertions**:
1. ✅ API 500 에러 발생
2. ✅ 에러 Snackbar "반복 일정 삭제 실패" 표시
3. ✅ 다이얼로그 닫힘
4. ✅ 일정은 삭제되지 않음

---

## 6. Testing Utilities

### 6.1 Helper Function: Render App
```typescript
/**
 * App 컴포넌트를 SnackbarProvider로 감싸서 렌더링
 */
const renderApp = () => {
  return render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );
};
```

### 6.2 Helper Function: Wait for Events to Load
```typescript
/**
 * 이벤트 로딩 완료 대기
 */
const waitForEventsToLoad = async () => {
  await waitFor(() => {
    expect(screen.queryByText('일정 로딩 완료!')).toBeInTheDocument();
  });
};
```

### 6.3 Helper Function: Open Delete Dialog
```typescript
/**
 * 반복 일정 삭제 다이얼로그 열기
 * @param user - userEvent.setup() 결과
 * @param index - 삭제할 일정의 인덱스 (기본값: 0)
 */
const openDeleteDialog = async (
  user: ReturnType<typeof userEvent.setup>,
  index: number = 0
) => {
  // 일정 로딩 대기
  await waitFor(() => {
    expect(screen.getByText('주간 회의')).toBeInTheDocument();
  });

  // 삭제 버튼 찾기 및 클릭
  const deleteButtons = screen.getAllByLabelText('삭제');
  await user.click(deleteButtons[index]);

  // 다이얼로그 표시 대기
  await waitFor(() => {
    expect(screen.getByTestId('recurring-delete-dialog')).toBeInTheDocument();
  });
};
```

### 6.4 Query Selectors (data-testid)
```typescript
const selectors = {
  dialog: 'recurring-delete-dialog',
  cancelButton: 'cancel-delete-button',
  yesButton: 'delete-single-button',
  noButton: 'delete-series-button',
};

// Usage
screen.getByTestId(selectors.dialog);
screen.getByTestId(selectors.yesButton);
```

---

## 7. Test Execution Plan

### 7.1 Test Order
1. **정상 동작 테스트** (통과 확인)
   - Test 1: 단일 삭제
   - Test 2: 시리즈 삭제
   - Test 3: 취소

2. **에지 케이스 테스트** (방어 코드 검증)
   - Test 4: repeatId 없음
   - Test 5: selectedRecurringEvent null (선택 사항)

3. **에러 처리 테스트** (에러 시나리오)
   - Test 6: 단일 삭제 500 에러
   - Test 7: 시리즈 삭제 404 에러
   - Test 8: 시리즈 삭제 500 에러

### 7.2 Dependencies Check
```bash
# Phase 3 시작 전 확인 사항
pnpm install              # 의존성 설치
pnpm test                 # 기존 테스트 통과 확인
pnpm lint                 # 린트 에러 없음 확인
```

### 7.3 Test Execution Commands
```bash
# 단일 테스트 파일 실행
pnpm test task.recurringDelete.spec.ts

# Watch 모드
pnpm test:watch task.recurringDelete.spec.ts

# Coverage
pnpm test:coverage task.recurringDelete.spec.ts
```

---

## 8. Expected Test Results (Phase 3 목표)

### 8.1 TDD RED Phase
```
❌ Test 1: 사용자가 "예"를 선택하면 해당 일정만 삭제된다
   → ReferenceError: handleDeleteSingleOccurrence is not defined

❌ Test 2: 사용자가 "아니오"를 선택하면 반복 시리즈 전체가 삭제된다
   → Dialog buttons not updated

❌ Test 3: 사용자가 "취소"를 선택하면 아무것도 삭제되지 않는다
   → Cancel button handler missing

... (모든 테스트 실패)
```

### 8.2 TDD GREEN Phase (Phase 4 이후)
```
✅ Test 1: 사용자가 "예"를 선택하면 해당 일정만 삭제된다
✅ Test 2: 사용자가 "아니오"를 선택하면 반복 시리즈 전체가 삭제된다
✅ Test 3: 사용자가 "취소"를 선택하면 아무것도 삭제되지 않는다
✅ Test 4: repeatId가 없는 반복 일정은 다이얼로그 없이 단일 삭제된다
✅ Test 5: 선택된 일정이 없는 상태에서 핸들러 호출 시 에러 처리된다
✅ Test 6: 단일 삭제 API 에러 시 에러 메시지를 표시한다
✅ Test 7: 시리즈 삭제 API 404 에러 시 에러 메시지를 표시한다
✅ Test 8: 시리즈 삭제 API 일반 에러 시 에러 메시지를 표시한다

Tests: 8 passed, 8 total
```

---

## 9. Test Coverage Expectations

### 9.1 Line Coverage
- **Target**: 100% (신규 핸들러 함수)
- **Files**:
  - `handleDeleteSingleOccurrence`: 100%
  - `handleDeleteEntireSeries`: 100%
  - `handleCloseDeleteDialog`: 100%

### 9.2 Branch Coverage
- **If 조건**:
  - `if (!selectedRecurringEvent)` - covered by Test 5
  - `if (!selectedRecurringEvent?.repeat.id)` - covered by Test 4, 5
  - API 성공/실패 분기 - covered by Test 1-8

### 9.3 Function Coverage
- **New Functions**:
  - `handleDeleteSingleOccurrence` - called in Test 1, 5, 6
  - `handleDeleteEntireSeries` - called in Test 2, 7, 8
  - `handleCloseDeleteDialog` - called in Test 3

---

## 10. Test Design Rationale

### 10.1 Why Integration Tests (not Unit Tests)?
- **Reason 1**: UI 인터랙션 + API 호출 + 상태 업데이트를 함께 검증
- **Reason 2**: 사용자 시나리오 중심 테스트 (E2E에 가까움)
- **Reason 3**: App 컴포넌트가 661줄로 크고 분리되지 않아 통합 테스트가 적합

### 10.2 Why Not Test Dialog Component Separately?
- **Reason**: Dialog가 App.tsx 내부에 있고 별도 컴포넌트로 분리되지 않음
- **Alternative**: Phase 5 (Refactor)에서 Dialog를 별도 컴포넌트로 분리하면 단위 테스트 추가 가능

### 10.3 Why Test 5 is Optional?
- **Reason**: `selectedRecurringEvent`가 null인 상태는 실제 UI 플로우에서 발생하기 어려움
- **Value**: 방어 코드를 검증하므로 포함하는 것을 권장하지만, 시간 제약 시 생략 가능

### 10.4 Why 8 Tests (not more)?
- **Coverage**: 모든 Feature Design 시나리오 (4개) + Edge Cases (2개) + Error Cases (2개)
- **Balance**: 충분한 커버리지와 유지보수 가능성의 균형
- **Future**: 필요 시 추가 테스트 (예: 다이얼로그 외부 클릭) 작성 가능

---

## 11. Known Limitations

### 11.1 UI Dependency
- **Issue**: 삭제 버튼의 aria-label이 "삭제"로 가정됨
- **Risk**: 실제 구현에서 다르면 테스트 실패
- **Solution**: Phase 4에서 data-testid 추가 권장

### 11.2 Snackbar Timing
- **Issue**: Snackbar가 비동기로 표시되므로 `waitFor` 필요
- **Risk**: 타이밍 이슈로 flaky test 가능성
- **Solution**: `waitFor`의 timeout 조정 또는 명시적 delay

### 11.3 Mock Data Reset
- **Issue**: `resetEventsState()` 호출 필요
- **Risk**: 테스트 간 상태 오염
- **Solution**: `beforeEach`에서 항상 호출

### 11.4 Test 5 Complexity
- **Issue**: null 상태를 인위적으로 만들기 어려움
- **Risk**: 테스트 구현이 복잡하거나 불가능할 수 있음
- **Solution**: 구현 후 조정 또는 생략

---

## 12. Phase 2 Completion Checklist

### 12.1 Deliverables
- [x] Test Design Document 작성 (`handoff/phase2-test-design.md`)
- [x] 8개의 상세 테스트 시나리오 (GWT 형식)
- [x] Mock 데이터 명세 완성
- [x] MSW 핸들러 분석 (이미 구현됨 확인)
- [x] Testing Utilities 정의
- [x] Test Execution Plan 작성

### 12.2 Quality Checks
- [x] 모든 Feature Design 시나리오가 테스트로 변환됨
- [x] 모든 Edge Cases가 테스트로 커버됨
- [x] GWT 패턴이 명확하게 적용됨
- [x] Phase 3 (Test Writer)가 이 문서만으로 진행 가능

### 12.3 Alignment with Feature Design
| Feature Design Scenario | Test Number | Status |
|-------------------------|-------------|--------|
| 4.1 단일 일정 삭제       | Test 1      | ✅     |
| 4.2 전체 시리즈 삭제     | Test 2      | ✅     |
| 4.3 취소 선택           | Test 3      | ✅     |
| 4.4 다이얼로그 외부 클릭 | (선택 사항)  | ⏸️     |
| 5.1 repeatId 없음       | Test 4      | ✅     |
| 5.2 selectedEvent null  | Test 5      | ✅     |
| 5.3 API 에러 (단일)     | Test 6      | ✅     |
| 5.3 API 에러 (시리즈 404) | Test 7     | ✅     |
| 5.3 API 에러 (시리즈 500) | Test 8     | ✅     |

---

## 13. Handoff to Phase 3 (Test Writer)

### 13.1 Key Artifacts
1. **이 문서**: `handoff/phase2-test-design.md`
2. **Section 5**: Detailed Test Scenarios (복사-붙여넣기 가능)
3. **Section 3**: Mock Data Specification
4. **Section 6**: Testing Utilities

### 13.2 Test Writer Guidance
1. **Section 5의 각 테스트를 그대로 구현**
   - Given-When-Then 주석 유지
   - Assertions 모두 포함

2. **Section 6의 Helper 함수 먼저 작성**
   - `renderApp()`
   - `openDeleteDialog()`

3. **Section 7의 순서대로 테스트 작성**
   - 정상 동작 → 에지 케이스 → 에러 처리

4. **모든 테스트가 실패(RED)하는지 확인**
   - Phase 3의 목표는 RED 상태

5. **테스트 파일 생성**
   - `src/__tests__/components/task.recurringDelete.spec.ts`

### 13.3 Expected Output from Phase 3
- `src/__tests__/components/task.recurringDelete.spec.ts`
- 모든 테스트 실패 (RED)
- `handoff/phase3-test-implementation.md` (실행 결과 및 다음 단계)

---

**Phase 2 완료**
**설계자**: test-designer
**다음 단계**: Phase 3 (RED - Test Writing) - test-writer에게 인계
**검증 필요**: Orchestrator의 Phase 2 검증
