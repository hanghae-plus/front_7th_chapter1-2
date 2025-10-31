# Refactoring Agent

## 역할
구현된 코드의 품질을 개선하고 최적화하는 에이전트입니다.

## 주요 기능

### 1. 코드 품질 개선
- 중복 코드 제거 및 리팩토링
- 함수 분리 및 모듈화
- 네이밍 개선 및 가독성 향상

### 2. 성능 최적화
- 불필요한 리렌더링 방지
- 메모이제이션 적용
- 번들 크기 최적화

### 3. 아키텍처 개선
- 관심사 분리 (Separation of Concerns)
- 의존성 주입 및 결합도 감소
- 확장성 및 유지보수성 향상

## 입력 형식

```json
{
  "targetFiles": ["useRecurringEventOperations.ts", "RecurringEventDialog.tsx"],
  "testFiles": ["useRecurringEventOperations.spec.ts"],
  "refactoringGoals": ["성능 최적화", "코드 중복 제거", "가독성 향상"],
  "constraints": ["테스트 실패 금지", "기존 API 호환성 유지"]
}
```

## 출력 형식

### 리팩토링된 Hook (useRecurringEventOperations.ts)

```typescript
import { useSnackbar } from 'notistack';
import { useState, useCallback, useMemo } from 'react';
import { Event, EventForm } from '../types';

// 타입 정의 분리
interface EditEventParams {
  eventId: string;
  updates: Partial<EventForm>;
}

interface UseRecurringEventOperationsReturn {
  events: Event[];
  editSingleEvent: (params: EditEventParams) => Promise<void>;
  editRecurringEvent: (params: EditEventParams) => Promise<void>;
  showEditDialog: (event: Event) => void;
}

// API 호출 공통 로직 추출
const createApiCall = (endpoint: string, method: string = 'PUT') => {
  return async (eventId: string, updates: Partial<EventForm>) => {
    const response = await fetch(`/api/events/${eventId}/${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Event not found');
      }
      throw new Error('Network error');
    }

    return response.json();
  };
};

// 에러 처리 공통 로직
const handleApiError = (error: unknown, operation: string, enqueueSnackbar: any) => {
  console.error(`Error ${operation}:`, error);
  enqueueSnackbar(`${operation} 실패`, { variant: 'error' });
  throw error;
};

export const useRecurringEventOperations = (): UseRecurringEventOperationsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  // API 호출 함수들 메모이제이션
  const apiCalls = useMemo(() => ({
    editSingle: createApiCall('single'),
    editRecurring: createApiCall('recurring'),
  }), []);

  // 단일 일정 수정 로직
  const editSingleEvent = useCallback(async ({ eventId, updates }: EditEventParams) => {
    try {
      const updatedEvent = await apiCalls.editSingle(eventId, updates);
      
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...updatedEvent, repeat: { type: 'none', interval: 0 } }
            : event
        )
      );

      enqueueSnackbar('일정이 수정되었습니다.', { variant: 'success' });
    } catch (error) {
      handleApiError(error, '일정 수정', enqueueSnackbar);
    }
  }, [apiCalls.editSingle, enqueueSnackbar]);

  // 반복 일정 수정 로직
  const editRecurringEvent = useCallback(async ({ eventId, updates }: EditEventParams) => {
    try {
      const updatedEvents = await apiCalls.editRecurring(eventId, updates);
      
      setEvents(prevEvents => 
        prevEvents.map(event => {
          const updatedEvent = updatedEvents.find((e: Event) => e.id === event.id);
          return updatedEvent || event;
        })
      );

      enqueueSnackbar('반복 일정이 수정되었습니다.', { variant: 'success' });
    } catch (error) {
      handleApiError(error, '반복 일정 수정', enqueueSnackbar);
    }
  }, [apiCalls.editRecurring, enqueueSnackbar]);

  // 다이얼로그 표시 로직
  const showEditDialog = useCallback((event: Event) => {
    // 다이얼로그 표시 로직
    console.log('Show edit dialog for event:', event.id);
  }, []);

  return {
    events,
    editSingleEvent,
    editRecurringEvent,
    showEditDialog,
  };
};
```

### 리팩토링된 컴포넌트 (RecurringEventDialog.tsx)

```typescript
import React, { memo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Stack,
} from '@mui/material';
import { Event } from '../types';

// Props 타입 정의
interface RecurringEventDialogProps {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  onSingleEdit: () => void;
  onRecurringEdit: () => void;
}

// 버튼 컴포넌트 분리
const EditOptionButton = memo<{
  onClick: () => void;
  children: React.ReactNode;
}>(({ onClick, children }) => (
  <Button
    variant="outlined"
    onClick={onClick}
    fullWidth
    sx={{ minHeight: '48px' }} // 접근성을 위한 최소 높이
  >
    {children}
  </Button>
));

EditOptionButton.displayName = 'EditOptionButton';

// 메인 컴포넌트
export const RecurringEventDialog = memo<RecurringEventDialogProps>(({
  open,
  onClose,
  event,
  onSingleEdit,
  onRecurringEdit,
}) => {
  // 이벤트 핸들러 메모이제이션
  const handleSingleEdit = React.useCallback(() => {
    onSingleEdit();
    onClose();
  }, [onSingleEdit, onClose]);

  const handleRecurringEdit = React.useCallback(() => {
    onRecurringEdit();
    onClose();
  }, [onRecurringEdit, onClose]);

  // 접근성을 위한 키보드 이벤트 처리
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  if (!event) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      onKeyDown={handleKeyDown}
      aria-labelledby="edit-dialog-title"
      aria-describedby="edit-dialog-description"
    >
      <DialogTitle id="edit-dialog-title">일정 수정 옵션</DialogTitle>
      <DialogContent>
        <DialogContentText id="edit-dialog-description">
          "{event.title}" 일정을 수정하시겠습니까?
        </DialogContentText>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <EditOptionButton onClick={handleSingleEdit}>
            해당 일정만 수정
          </EditOptionButton>
          <EditOptionButton onClick={handleRecurringEdit}>
            전체 반복 일정 수정
          </EditOptionButton>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="text">
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
});

RecurringEventDialog.displayName = 'RecurringEventDialog';
```

## 리팩토링 체크리스트

### 코드 품질
- [ ] 중복 코드 제거
- [ ] 함수 분리 및 단일 책임 원칙 적용
- [ ] 의미 있는 변수명 및 함수명 사용
- [ ] 주석 및 문서화 개선

### 성능 최적화
- [ ] 불필요한 리렌더링 방지 (memo, useMemo, useCallback)
- [ ] 메모리 누수 방지
- [ ] 번들 크기 최적화

### 접근성
- [ ] ARIA 속성 추가
- [ ] 키보드 네비게이션 지원
- [ ] 스크린 리더 지원

### 테스트 유지
- [ ] 모든 기존 테스트 통과
- [ ] 리팩토링 후 테스트 실행
- [ ] 새로운 테스트 케이스 추가 (필요시)

## 검증 기준

1. **테스트 통과**: 모든 기존 테스트가 여전히 통과하는가?
2. **기능 보존**: 기존 기능이 변경되지 않았는가?
3. **성능 향상**: 성능이 개선되었는가?
4. **가독성**: 코드가 더 읽기 쉬워졌는가?

## 사용 예시

```bash
# 리팩토링 실행
node refactoring-agent.js --target="useRecurringEventOperations.ts"

# 특정 목표로 리팩토링
node refactoring-agent.js --goals="성능 최적화,코드 중복 제거" --target="RecurringEventDialog.tsx"
```
