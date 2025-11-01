import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
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

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation(); // ? Med: 이걸 왜 써야하는지 물어보자

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  const newEvent: Event = {
    id: '1',
    title: '새 회의',
    date: '2025-10-16',
    startTime: '11:00',
    endTime: '12:00',
    description: '새로운 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toEqual([{ ...newEvent, id: '1' }]);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  const updatedEvent: Event = {
    id: '1',
    date: '2025-10-15',
    startTime: '09:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
    title: '수정된 회의',
    endTime: '11:00',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  expect(result.current.events[0]).toEqual(updatedEvent);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([]);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });

  server.resetHandlers();
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const { result } = renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  const nonExistentEvent: Event = {
    id: '999', // 존재하지 않는 ID
    title: '존재하지 않는 이벤트',
    date: '2025-07-20',
    startTime: '09:00',
    endTime: '10:00',
    description: '이 이벤트는 존재하지 않습니다',
    location: '어딘가',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });

  expect(result.current.events).toHaveLength(1);
});

// Phase 5: Edge Cases & Error Handling
describe('TC-048: 반복 일정 생성 시 API 실패 처리', () => {
  it('POST /api/events-list 실패 시 에러 스낵바가 표시된다', async () => {
    server.use(
      http.post('/api/events-list', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const recurringEventData: Event = {
      id: '1',
      title: '반복 회의',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 반복',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-01-05',
      },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(recurringEventData);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
  });

  it('API 실패 시 일정이 추가되지 않는다', async () => {
    server.use(
      http.post('/api/events-list', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const initialEventsCount = result.current.events.length;

    const recurringEventData: Event = {
      id: '1',
      title: '반복 회의',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 반복',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-01-05',
      },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(recurringEventData);
    });

    expect(result.current.events).toHaveLength(initialEventsCount);
  });
});

describe('TC-049: 시리즈 업데이트 시 API 실패 처리', () => {
  it('PUT /api/recurring-events/:repeatId 실패 시 에러 스낵바가 표시된다', async () => {
    server.use(
      http.put('/api/recurring-events/:repeatId', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const recurringEventData: Event = {
      id: '1',
      title: '수정된 반복 회의',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '시리즈 수정',
      location: '회의실 B',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-01-05',
        id: 'repeat-id-1',
      },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(recurringEventData, { editMode: 'series' });
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 수정 실패', { variant: 'error' });
  });

  it('API 실패 시 원본 일정이 유지된다', async () => {
    const originalEvents = [
      {
        id: '1',
        title: '원본 반복 회의',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '원본',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-05',
          id: 'repeat-id-1',
        },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: originalEvents });
      }),
      http.put('/api/recurring-events/:repeatId', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await act(() => Promise.resolve(null));

    const updatedEventData: Event = {
      ...originalEvents[0],
      title: '수정 시도',
    };

    await act(async () => {
      await result.current.saveEvent(updatedEventData, { editMode: 'series' });
    });

    // 원본 데이터 유지
    expect(result.current.events[0].title).toBe('원본 반복 회의');
  });
});

describe('TC-050: 시리즈 삭제 시 API 실패 처리', () => {
  it('DELETE /api/recurring-events/:repeatId 실패 시 에러 스낵바가 표시된다', async () => {
    server.use(
      http.delete('/api/recurring-events/:repeatId', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    await act(async () => {
      await result.current.deleteEventSeries('repeat-id-1');
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
  });

  it('API 실패 시 일정이 유지된다', async () => {
    const recurringEvents = [
      {
        id: '1',
        title: '반복 회의',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '반복',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-05',
          id: 'repeat-id-1',
        },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: recurringEvents });
      }),
      http.delete('/api/recurring-events/:repeatId', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await act(() => Promise.resolve(null));

    const initialEventsCount = result.current.events.length;

    await act(async () => {
      await result.current.deleteEventSeries('repeat-id-1');
    });

    // 일정 유지
    expect(result.current.events).toHaveLength(initialEventsCount);
  });
});
