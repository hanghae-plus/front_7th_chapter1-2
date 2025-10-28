# Code Writing Agent

## 역할
테스트 코드를 바탕으로 실제 구현 코드를 작성하는 에이전트입니다.

## 주요 기능

### 1. 구현 코드 생성
- 실패하는 테스트를 통과시키는 최소한의 코드 작성
- 기존 코드베이스 패턴과 일관성 유지
- TypeScript 타입 안전성 보장

### 2. API 연동 구현
- RESTful API 호출 로직 구현
- 에러 처리 및 예외 상황 대응
- 상태 관리 및 데이터 흐름 구현

### 3. 컴포넌트 구현
- React 컴포넌트 및 Hook 구현
- 사용자 인터랙션 처리
- 접근성 및 사용성 고려

## 입력 형식

```json
{
  "testFile": "useRecurringEventOperations.spec.ts",
  "featureSpec": "반복 일정 수정 기능 명세",
  "existingCodebase": "기존 코드베이스 구조",
  "codingStandards": "eslint, prettier 설정"
}
```

## 출력 형식

### Hook 구현 (useRecurringEventOperations.ts)

```typescript
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { Event, EventForm } from '../types';

export const useRecurringEventOperations = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const editSingleEvent = async (eventId: string, updates: Partial<EventForm>) => {
    try {
      const response = await fetch(`/api/events/${eventId}/single`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Event not found');
        }
        throw new Error('Network error');
      }

      const updatedEvent = await response.json();
      
      // 해당 일정을 단일 일정으로 변경 (반복 일정에서 제외)
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...updatedEvent, repeat: { type: 'none', interval: 0 } }
            : event
        )
      );

      enqueueSnackbar('일정이 수정되었습니다.', { variant: 'success' });
    } catch (error) {
      console.error('Error editing single event:', error);
      enqueueSnackbar('일정 수정 실패', { variant: 'error' });
      throw error;
    }
  };

  const editRecurringEvent = async (eventId: string, updates: Partial<EventForm>) => {
    try {
      const response = await fetch(`/api/events/${eventId}/recurring`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Event not found');
        }
        throw new Error('Network error');
      }

      const updatedEvents = await response.json();
      
      // 모든 관련 반복 일정 업데이트
      setEvents(prevEvents => 
        prevEvents.map(event => {
          const updatedEvent = updatedEvents.find((e: Event) => e.id === event.id);
          return updatedEvent || event;
        })
      );

      enqueueSnackbar('반복 일정이 수정되었습니다.', { variant: 'success' });
    } catch (error) {
      console.error('Error editing recurring event:', error);
      enqueueSnackbar('반복 일정 수정 실패', { variant: 'error' });
      throw error;
    }
  };

  const showEditDialog = (event: Event) => {
    // 수정 옵션 다이얼로그 표시 로직
    // 이 부분은 RecurringEventDialog 컴포넌트에서 처리
  };

  return {
    events,
    editSingleEvent,
    editRecurringEvent,
    showEditDialog,
  };
};
```

### 컴포넌트 구현 (RecurringEventDialog.tsx)

```typescript
import React from 'react';
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

interface RecurringEventDialogProps {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  onSingleEdit: () => void;
  onRecurringEdit: () => void;
}

export const RecurringEventDialog: React.FC<RecurringEventDialogProps> = ({
  open,
  onClose,
  event,
  onSingleEdit,
  onRecurringEdit,
}) => {
  if (!event) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>일정 수정 옵션</DialogTitle>
      <DialogContent>
        <DialogContentText>
          "{event.title}" 일정을 수정하시겠습니까?
        </DialogContentText>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              onSingleEdit();
              onClose();
            }}
            fullWidth
          >
            해당 일정만 수정
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              onRecurringEdit();
              onClose();
            }}
            fullWidth
          >
            전체 반복 일정 수정
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};
```

## 검증 기준

1. **GREEN 상태**: 모든 테스트가 통과하는가?
2. **최소 구현**: 테스트를 통과시키는 최소한의 코드만 작성했는가?
3. **코드 품질**: ESLint 규칙을 준수하는가?
4. **타입 안전성**: TypeScript 타입 오류가 없는가?

## 주의사항

- **테스트 수정 금지**: 테스트 코드는 절대 수정하지 않습니다
- **기존 패턴 준수**: 기존 코드베이스의 패턴과 일관성을 유지합니다
- **에러 처리**: 모든 예외 상황에 대한 적절한 처리를 구현합니다
- **접근성**: 웹 접근성 가이드라인을 준수합니다

## 사용 예시

```bash
# 구현 코드 생성
node code-writing-agent.js --test="useRecurringEventOperations.spec.ts"

# 특정 컴포넌트만 구현
node code-writing-agent.js --component="RecurringEventDialog" --test="integration.spec.tsx"
```
