import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { useEventOperations } from '../../hooks/useEventOperations';
import { server } from '../../setupTests';
import { Event, EventForm } from '../../types';

// [Review by Off코치]: notistack을 모킹하여 wrapper 없이 테스트합니다.
const enqueueSnackbarFn = vi.fn();
vi.mock('notistack', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

describe('useEventOperations', () => {
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  const initialEvents: Event[] = [
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
      seriesId: null,
    },
  ];

  it('초기 이벤트를 올바르게 불러온다', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: initialEvents });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual(initialEvents);
    });
  });

  it('새로운 이벤트를 생성한다', async () => {
    const newEvent: EventForm = {
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
    const eventWithId: Event = { ...newEvent, id: '2', seriesId: null };

    server.use(
      http.get('/api/events', () => HttpResponse.json({ events: initialEvents })),
      http.post('/api/events', async () => {
        server.use(
          http.get('/api/events', () =>
            HttpResponse.json({ events: [...initialEvents, eventWithId] })
          )
        );
        return HttpResponse.json(eventWithId, { status: 201 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.addOrUpdateEvent(newEvent);
    });

    expect(result.current.events).toEqual([...initialEvents, eventWithId]);
  });

  it('기존 이벤트를 수정한다', async () => {
    const updatedEvent: Event = {
      ...initialEvents[0],
      title: '수정된 회의',
      endTime: '11:00',
    };

    server.use(
      http.get('/api/events', () => HttpResponse.json({ events: initialEvents })),
      http.put('/api/events/:id', async () => {
        server.use(http.get('/api/events', () => HttpResponse.json({ events: [updatedEvent] })));
        return HttpResponse.json(updatedEvent);
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.addOrUpdateEvent(updatedEvent);
    });

    expect(result.current.events).toEqual([updatedEvent]);
  });

  it('이벤트를 삭제한다', async () => {
    server.use(
      http.get('/api/events', () => HttpResponse.json({ events: initialEvents })),
      http.delete('/api/events/:id', () => {
        server.use(http.get('/api/events', () => HttpResponse.json({ events: [] })));
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    expect(result.current.events).toEqual([]);
  });
});

describe('useEventOperations 에러 핸들링', () => {
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  it("이벤트 로딩 실패 시 '이벤트 로딩 실패' 에러 토스트가 표시되어야 한다", async () => {
    server.use(http.get('/api/events', () => new HttpResponse(null, { status: 500 })));

    renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
    });
  });

  it("이벤트 저장 실패 시 '일정 저장 실패' 토스트가 노출되어야 한다", async () => {
    server.use(http.post('/api/events', () => new HttpResponse(null, { status: 500 })));

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.addOrUpdateEvent({} as EventForm);
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
  });

  it("이벤트 삭제 실패 시 '일정 삭제 실패' 토스트가 노출되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => HttpResponse.json({ events: [{ id: '1' }] })),
      http.delete('/api/events/:id', () => new HttpResponse(null, { status: 500 }))
    );

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => expect(result.current.events).toHaveLength(1));

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
    expect(result.current.events).toHaveLength(1);
  });
});
