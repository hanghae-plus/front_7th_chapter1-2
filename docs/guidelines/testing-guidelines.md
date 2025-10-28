# 테스트 작성 가이드라인

## 1. 테스트 구조 표준

### 기본 테스트 파일 구조

```typescript
import { renderHook, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { useFeatureName } from '../../hooks/useFeatureName.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

describe('useFeatureName', () => {
  beforeEach(() => {
    server.resetHandlers();
    enqueueSnackbarFn.mockClear();
  });

  // 테스트 케이스들...
});
```

## 2. 테스트 케이스 작성 규칙

### Given-When-Then 패턴

```typescript
it('시나리오 설명', async () => {
  // Given: 초기 상태 설정
  server.use(
    http.get('/api/endpoint', () => {
      return HttpResponse.json({ data: 'mock-data' });
    })
  );

  // When: 액션 실행
  const { result } = renderHook(() => useFeatureName());
  await act(async () => {
    await result.current.someMethod('param');
  });

  // Then: 결과 검증
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBeNull();
});
```

## 3. MSW 핸들러 작성 규칙

### 성공 케이스

```typescript
server.use(
  http.post('/api/endpoint', () => {
    return HttpResponse.json({ success: true, data: mockData });
  })
);
```

### 실패 케이스

```typescript
server.use(
  http.post('/api/endpoint', () => {
    return HttpResponse.error();
  })
);
```

## 4. Hook 테스트 패턴

### 상태 관리 테스트

```typescript
it('로딩 상태 관리', async () => {
  const { result } = renderHook(() => useFeatureName());

  expect(result.current.loading).toBe(false);

  await act(async () => {
    result.current.startAction();
  });

  expect(result.current.loading).toBe(true);
});
```

### 에러 처리 테스트

```typescript
it('에러 상태 관리', async () => {
  server.use(http.get('/api/endpoint', () => HttpResponse.error()));

  const { result } = renderHook(() => useFeatureName());

  await act(async () => {
    await result.current.fetchData();
  });

  expect(result.current.error).toBeDefined();
});
```

## 5. 메서드별 테스트 패턴

### API 호출 메서드

```typescript
it('API 호출 성공', async () => {
  server.use(
    http.put('/api/events/1', () => {
      return HttpResponse.json({ success: true });
    })
  );

  const { result } = renderHook(() => useFeatureName());

  await act(async () => {
    await result.current.updateEvent('1', { title: 'Updated' });
  });

  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBeNull();
});
```

### 다이얼로그 관리 메서드

```typescript
it('다이얼로그 열기', async () => {
  const { result } = renderHook(() => useFeatureName());

  await act(async () => {
    result.current.openDialog(mockEvent);
  });

  expect(result.current.isDialogOpen).toBe(true);
  expect(result.current.editingEvent).toEqual(mockEvent);
});
```

## 6. 테스트 데이터 관리

### Mock 데이터 생성

```typescript
const mockEvent: Event = {
  id: '1',
  title: '테스트 이벤트',
  date: '2024-01-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '테스트 설명',
  location: '테스트 장소',
  category: '테스트 카테고리',
  repeat: { type: 'weekly', interval: 1 },
  notificationTime: 15,
};
```

## 7. 검증 패턴

### 상태 검증

```typescript
expect(result.current.loading).toBe(false);
expect(result.current.error).toBeNull();
expect(result.current.data).toEqual(expectedData);
```

### 함수 호출 검증

```typescript
expect(enqueueSnackbarFn).toHaveBeenCalledWith('성공 메시지', {
  variant: 'success',
});
```

### 조건부 검증

```typescript
if (shouldHaveError) {
  expect(result.current.error).toBeDefined();
} else {
  expect(result.current.error).toBeNull();
}
```

## 8. 비동기 테스트 패턴

### Promise 기반

```typescript
await act(async () => {
  await result.current.asyncMethod();
});
```

### 상태 변화 대기

```typescript
await waitFor(() => {
  expect(result.current.loading).toBe(false);
});
```

## 9. 에러 케이스 테스트

### 네트워크 에러

```typescript
server.use(http.get('/api/endpoint', () => HttpResponse.error()));
```

### 권한 에러

```typescript
server.use(
  http.post('/api/endpoint', () => {
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  })
);
```

### 데이터 검증 에러

```typescript
server.use(
  http.post('/api/endpoint', () => {
    return HttpResponse.json({ error: 'Validation failed' }, { status: 400 });
  })
);
```

## 10. 테스트 명명 규칙

### 시나리오 기반 명명

```typescript
it('1. 사용자 로그인 성공', async () => {});
it('2. 잘못된 비밀번호로 로그인 실패', async () => {});
it('3. 네트워크 오류로 로그인 실패', async () => {});
```

### 기능 기반 명명

```typescript
it('로그인 - 정상 케이스', async () => {});
it('로그인 - 에러 케이스', async () => {});
it('로그아웃 - 정상 케이스', async () => {});
```
