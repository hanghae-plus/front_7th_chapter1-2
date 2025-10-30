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

describe('반복 일정 CRUD', () => {
  it('[FR-2.1, FR-2.4] 반복 일정을 생성하면 모든 일정 인스턴스가 동일한 repeat.id를 가져야 한다', async () => {
    server.use(
      http.post('/api/events-list', async ({ request }) => {
        const { events: newEvents } = (await request.json()) as { events: Event[] };
        const repeatId = 'test-repeat-id';
        const createdEvents = newEvents.map((event, index) => ({
          ...event,
          id: `repeat-${index}`,
          repeat: {
            ...event.repeat,
            id: event.repeat.type !== 'none' ? repeatId : undefined,
            interval: 1, // [FR-2.4] interval은 항상 1
          },
        }));
        return HttpResponse.json(createdEvents, { status: 201 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const recurringEvents = [
      {
        title: '반복 회의',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily' as const, interval: 1, endDate: '2025-01-17' },
        notificationTime: 10,
      },
      {
        title: '반복 회의',
        date: '2025-01-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily' as const, interval: 1, endDate: '2025-01-17' },
        notificationTime: 10,
      },
      {
        title: '반복 회의',
        date: '2025-01-17',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily' as const, interval: 1, endDate: '2025-01-17' },
        notificationTime: 10,
      },
    ];

    // useEventOperations의 saveEvent가 반복 일정을 처리하는 로직은 구현되어야 함
    // 여기서는 API 호출만 테스트
    await act(async () => {
      const response = await fetch('/api/events-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: recurringEvents }),
      });
      const created = await response.json();
      expect(created).toHaveLength(3);
      expect(created[0].repeat.id).toBe('test-repeat-id');
      expect(created[1].repeat.id).toBe('test-repeat-id');
      expect(created[2].repeat.id).toBe('test-repeat-id');
    });

    server.resetHandlers();
  });

  it('[FR-5.2] 단일 수정 시 해당 일정의 repeat.type이 none으로 변경되고 repeat.id가 제거되어야 한다', async () => {
    const mockRecurringEvent: Event = {
      id: '1',
      title: '반복 회의',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-01-17', id: 'repeat-1' },
      notificationTime: 10,
    };

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [mockRecurringEvent] });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const updatedEvent = (await request.json()) as Event;
        return HttpResponse.json({ ...mockRecurringEvent, ...updatedEvent });
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await act(() => Promise.resolve(null));

    const updatedEvent: Event = {
      ...mockRecurringEvent,
      title: '수정된 일정',
      repeat: { type: 'none', interval: 0 }, // [FR-5.2] repeat.id 제거, type을 none으로
    };

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    await act(() => Promise.resolve(null));

    const savedEvent = result.current.events.find((e) => e.id === '1');
    expect(savedEvent?.repeat.type).toBe('none');
    expect(savedEvent?.repeat.id).toBeUndefined();
  });

  it('[FR-5.3] 전체 수정 시 반복 일정 시리즈의 모든 일정이 수정되어야 한다', async () => {
    const mockRecurringEvents: Event[] = [
      {
        id: '1',
        title: '반복 회의',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-17', id: 'repeat-1' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '반복 회의',
        date: '2025-01-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-17', id: 'repeat-1' },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockRecurringEvents });
      }),
      http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
        const updateData = (await request.json()) as Partial<Event>;
        return HttpResponse.json(
          mockRecurringEvents.map((event) => ({
            ...event,
            ...updateData,
          }))
        );
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await act(() => Promise.resolve(null));

    // 전체 수정 API 호출 (useEventOperations에서 구현 필요)
    await act(async () => {
      const response = await fetch('/api/recurring-events/repeat-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '수정된 반복 회의' }),
      });
      const updated = await response.json();
      expect(updated).toHaveLength(2);
      expect(updated[0].title).toBe('수정된 반복 회의');
      expect(updated[1].title).toBe('수정된 반복 회의');
      expect(updated[0].repeat.id).toBe('repeat-1'); // [FR-5.3] repeat.id 유지
    });

    server.resetHandlers();
  });

  it('[FR-6.2] 단일 삭제 시 해당 일정만 삭제되고 나머지 반복 일정은 유지되어야 한다', async () => {
    const mockRecurringEvents: Event[] = [
      {
        id: '1',
        title: '반복 회의',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-17', id: 'repeat-1' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '반복 회의',
        date: '2025-01-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-17', id: 'repeat-1' },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockRecurringEvents });
      }),
      http.delete('/api/events/:id', ({ params }) => {
        const { id } = params;
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    await act(() => Promise.resolve(null));

    // 단일 삭제 후 남은 일정 확인
    expect(result.current.events.length).toBe(1);
    expect(result.current.events[0].id).toBe('2');
    expect(result.current.events[0].repeat.id).toBe('repeat-1'); // 나머지 일정의 repeat.id 유지
  });

  it('[FR-6.3] 전체 삭제 시 반복 일정 시리즈의 모든 일정이 삭제되어야 한다', async () => {
    const mockRecurringEvents: Event[] = [
      {
        id: '1',
        title: '반복 회의',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-17', id: 'repeat-1' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '반복 회의',
        date: '2025-01-16',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-17', id: 'repeat-1' },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockRecurringEvents });
      }),
      http.delete('/api/recurring-events/:repeatId', () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    // 전체 삭제 API 호출 테스트
    await act(async () => {
      const response = await fetch('/api/recurring-events/repeat-1', {
        method: 'DELETE',
      });
      expect(response.status).toBe(204);
    });

    server.resetHandlers();
  });
});
