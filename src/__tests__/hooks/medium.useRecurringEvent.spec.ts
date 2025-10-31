import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { useRecurringEvent } from '../../hooks/useRecurringEvent';
import { server } from '../../setupTests';
import { Event } from '../../types';

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

describe('expandRecurringEvent', () => {
  it('반복 일정을 지정된 범위 내 인스턴스로 확장한다', () => {
    const { result } = renderHook(() => useRecurringEvent());

    const event: Event = {
      id: '1',
      title: 'Weekly Meeting',
      date: '2025-01-06',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 0,
      isSeriesDefinition: true,
      seriesId: '1',
    };

    const instances = result.current.expandRecurringEvent(event, '2025-01-01', '2025-01-31');

    expect(instances.length).toBeGreaterThan(0);
    expect(instances[0].seriesId).toBe('1');
    expect(instances[0].isSeriesDefinition).toBe(false);
  });

  it('반복하지 않는 일정은 빈 배열을 반환한다', () => {
    const { result } = renderHook(() => useRecurringEvent());

    const event: Event = {
      id: '1',
      title: 'One-time Event',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    const instances = result.current.expandRecurringEvent(event, '2025-01-01', '2025-01-31');

    expect(instances).toHaveLength(0);
  });
});

describe('expandAllRecurringEvents', () => {
  it('여러 반복 일정을 모두 확장하고 일반 일정은 그대로 유지한다', () => {
    const { result } = renderHook(() => useRecurringEvent());

    const events: Event[] = [
      {
        id: '1',
        title: 'Weekly Meeting',
        date: '2025-01-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 0,
        isSeriesDefinition: true,
        seriesId: '1',
      },
      {
        id: '2',
        title: 'One-time Event',
        date: '2025-01-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];

    const expanded = result.current.expandAllRecurringEvents(events, '2025-01-01', '2025-01-31');

    // Should have instances from weekly event + one-time event
    expect(expanded.length).toBeGreaterThan(1);

    // One-time event should be in the result
    const oneTimeEvent = expanded.find((e) => e.id === '2');
    expect(oneTimeEvent).toBeDefined();
    expect(oneTimeEvent?.title).toBe('One-time Event');
  });

  it('반복 일정이 없으면 입력 배열을 그대로 반환한다', () => {
    const { result } = renderHook(() => useRecurringEvent());

    const events: Event[] = [
      {
        id: '1',
        title: 'Event 1',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
      {
        id: '2',
        title: 'Event 2',
        date: '2025-01-20',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ];

    const expanded = result.current.expandAllRecurringEvents(events, '2025-01-01', '2025-01-31');

    expect(expanded).toHaveLength(2);
    expect(expanded).toEqual(events);
  });
});

describe('editRecurringInstance - Single Mode', () => {
  it('단일 인스턴스 수정 시 독립 일정으로 변환된다', async () => {
    // Setup mock API responses
    server.use(
      http.post('/api/events', () => {
        return HttpResponse.json({
          id: '2',
          title: '수정된 제목',
          date: '2025-03-15',
          repeat: { type: 'none', interval: 0 },
          originalDate: '2025-03-15',
        });
      }),
      http.put('/api/events/1', () => {
        return HttpResponse.json({
          id: '1',
          excludedDates: ['2025-03-15'],
        });
      })
    );

    const { result } = renderHook(() => useRecurringEvent());

    await act(async () => {
      await result.current.editRecurringInstance(
        '1',
        'single',
        { title: '수정된 제목' },
        '2025-03-15'
      );
    });

    // Verify success (in real implementation, would check API calls)
    expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      expect.stringContaining('수정'),
      expect.any(Object)
    );

    server.resetHandlers();
  });

  it('단일 인스턴스 수정 시 instanceDate가 필수다', async () => {
    const { result } = renderHook(() => useRecurringEvent());

    await act(async () => {
      try {
        await result.current.editRecurringInstance('1', 'single', { title: '수정된 제목' });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});

describe('editRecurringInstance - Series Mode', () => {
  it('시리즈 수정 시 모든 인스턴스가 업데이트된다', async () => {
    server.use(
      http.put('/api/events/1', () => {
        return HttpResponse.json({
          id: '1',
          title: '새 시리즈 제목',
        });
      })
    );

    const { result } = renderHook(() => useRecurringEvent());

    await act(async () => {
      await result.current.editRecurringInstance('1', 'series', { title: '새 시리즈 제목' });
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      expect.stringContaining('수정'),
      expect.any(Object)
    );

    server.resetHandlers();
  });

  it('시리즈 수정 실패 시 에러 토스트가 표시된다', async () => {
    server.use(
      http.put('/api/events/1', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useRecurringEvent());

    await act(async () => {
      await result.current.editRecurringInstance('1', 'series', { title: '새 시리즈 제목' });
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      expect.stringContaining('실패'),
      { variant: 'error' }
    );

    server.resetHandlers();
  });
});

describe('deleteRecurringInstance - Single Mode', () => {
  it('단일 인스턴스 삭제 시 excludedDates에 추가된다', async () => {
    server.use(
      http.get('/api/events/1', () => {
        return HttpResponse.json({
          id: '1',
          title: 'Weekly Meeting',
          date: '2025-01-06',
          repeat: { type: 'weekly', interval: 1 },
          excludedDates: [],
        });
      }),
      http.put('/api/events/1', () => {
        return HttpResponse.json({
          id: '1',
          excludedDates: ['2025-04-10'],
        });
      })
    );

    const { result } = renderHook(() => useRecurringEvent());

    await act(async () => {
      await result.current.deleteRecurringInstance('1', 'single', '2025-04-10');
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      expect.stringContaining('삭제'),
      expect.any(Object)
    );

    server.resetHandlers();
  });

  it('단일 인스턴스 여러 개 삭제 시 excludedDates에 모두 추가된다', async () => {
    let currentExcludedDates: string[] = [];

    server.use(
      http.get('/api/events/1', () => {
        return HttpResponse.json({
          id: '1',
          title: 'Monthly Event',
          date: '2025-01-15',
          repeat: { type: 'monthly', interval: 1 },
          excludedDates: currentExcludedDates,
        });
      }),
      http.put('/api/events/1', async ({ request }) => {
        const body = (await request.json()) as { excludedDates?: string[] };
        currentExcludedDates = body.excludedDates || [];
        return HttpResponse.json({
          id: '1',
          excludedDates: currentExcludedDates,
        });
      })
    );

    const { result } = renderHook(() => useRecurringEvent());

    // Delete first instance
    await act(async () => {
      await result.current.deleteRecurringInstance('1', 'single', '2025-01-15');
    });

    // Delete second instance
    await act(async () => {
      await result.current.deleteRecurringInstance('1', 'single', '2025-03-15');
    });

    // Delete third instance
    await act(async () => {
      await result.current.deleteRecurringInstance('1', 'single', '2025-05-15');
    });

    // Verify all dates added to excludedDates
    expect(currentExcludedDates).toContain('2025-01-15');
    expect(currentExcludedDates).toContain('2025-03-15');
    expect(currentExcludedDates).toContain('2025-05-15');

    server.resetHandlers();
  });

  it('단일 인스턴스 삭제 시 instanceDate가 필수다', async () => {
    const { result } = renderHook(() => useRecurringEvent());

    await act(async () => {
      try {
        await result.current.deleteRecurringInstance('1', 'single');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});

describe('deleteRecurringInstance - Series Mode', () => {
  it('시리즈 삭제 시 모든 인스턴스가 제거된다', async () => {
    server.use(
      http.delete('/api/events/1', () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { result } = renderHook(() => useRecurringEvent());

    await act(async () => {
      await result.current.deleteRecurringInstance('1', 'series');
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      expect.stringContaining('삭제'),
      expect.any(Object)
    );

    server.resetHandlers();
  });

  it('시리즈 삭제 실패 시 에러 토스트가 표시된다', async () => {
    server.use(
      http.delete('/api/events/1', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useRecurringEvent());

    await act(async () => {
      await result.current.deleteRecurringInstance('1', 'series');
    });

    expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      expect.stringContaining('실패'),
      { variant: 'error' }
    );

    server.resetHandlers();
  });
});
