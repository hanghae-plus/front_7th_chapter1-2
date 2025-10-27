import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { useEventOperations } from '../../hooks/useEventOperations';
import { server } from '../../setupTests';
import { Event, EventForm, RepeatType } from '../../types';

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

describe('useEventOperations - Recurring Events', () => {
  beforeEach(() => {
    expect.hasAssertions();
  });

  describe('단일 반복 이벤트 생성', () => {
    it('MEDIUM.3.1 - 일일 반복 이벤트 생성 (5일)', async () => {
      // Setup mock handler for bulk creation
      server.use(
        http.post('/api/events-list', async ({ request }) => {
          const events = (await request.json()) as Event[];
          const repeatId = 'repeat-daily-001';

          const createdEvents = events.map((event, index) => ({
            ...event,
            id: String(Date.now() + index),
          }));

          return HttpResponse.json(createdEvents, { status: 201 });
        }),

        http.get('/api/events', () => {
          return HttpResponse.json({ events: [] });
        })
      );

      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      const eventForm: EventForm = {
        title: '일일 스탠드업',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '09:30',
        description: '매일 스탠드업 회의',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'daily' as RepeatType,
          interval: 1,
          endDate: '2025-10-05',
        },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(eventForm as Event);
      });

      // Verify that the event was saved
      expect(result.current.events.length).toBeGreaterThan(0);
    });

    it('MEDIUM.3.2 - 주간 반복 이벤트 생성 (3주)', async () => {
      server.use(
        http.post('/api/events-list', async ({ request }) => {
          const events = (await request.json()) as Event[];
          return HttpResponse.json(events, { status: 201 });
        }),

        http.get('/api/events', () => {
          return HttpResponse.json({ events: [] });
        })
      );

      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      const eventForm: EventForm = {
        title: '주간 팀 미팅',
        date: '2025-10-06',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: {
          type: 'weekly' as RepeatType,
          interval: 1,
          endDate: '2025-10-20',
        },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(eventForm as Event);
      });

      expect(result.current.events.length).toBeGreaterThan(0);
    });

    it('MEDIUM.3.3 - 월간 반복 이벤트 생성 (3개월)', async () => {
      server.use(
        http.post('/api/events-list', async ({ request }) => {
          const events = (await request.json()) as Event[];
          return HttpResponse.json(events, { status: 201 });
        }),

        http.get('/api/events', () => {
          return HttpResponse.json({ events: [] });
        })
      );

      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      const eventForm: EventForm = {
        title: '월간 리포트',
        date: '2025-10-01',
        startTime: '15:00',
        endTime: '16:00',
        description: '월간 진행상황 리포트',
        location: '회의실 C',
        category: '업무',
        repeat: {
          type: 'monthly' as RepeatType,
          interval: 1,
          endDate: '2025-12-01',
        },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(eventForm as Event);
      });

      expect(result.current.events.length).toBeGreaterThan(0);
    });

    it('MEDIUM.3.4 - 연간 반복 이벤트 생성 (2년)', async () => {
      server.use(
        http.post('/api/events-list', async ({ request }) => {
          const events = (await request.json()) as Event[];
          return HttpResponse.json(events, { status: 201 });
        }),

        http.get('/api/events', () => {
          return HttpResponse.json({ events: [] });
        })
      );

      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      const eventForm: EventForm = {
        title: '생일',
        date: '2025-06-15',
        startTime: '00:00',
        endTime: '23:59',
        description: '생일 축하',
        location: 'Home',
        category: '개인',
        repeat: {
          type: 'yearly' as RepeatType,
          interval: 1,
          endDate: '2027-06-15',
        },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(eventForm as Event);
      });

      expect(result.current.events.length).toBeGreaterThan(0);
    });

    it('MEDIUM.3.5 - 반복 없는 이벤트는 기존 로직 사용', async () => {
      server.use(
        http.post('/api/events', async ({ request }) => {
          const newEvent = (await request.json()) as Event;
          newEvent.id = '1';
          return HttpResponse.json(newEvent, { status: 201 });
        }),

        http.get('/api/events', () => {
          return HttpResponse.json({ events: [] });
        })
      );

      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      const eventForm: EventForm = {
        title: '단일 회의',
        date: '2025-10-01',
        startTime: '14:00',
        endTime: '15:00',
        description: '일회성 미팅',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(eventForm as Event);
      });

      expect(result.current.events.length).toBe(1);
      expect(result.current.events[0].repeat.type).toBe('none');
    });
  });

  describe('반복 이벤트 수정', () => {
    it('MEDIUM.3.6 - 전체 반복 시리즈 수정 (모든 제목 변경)', async () => {
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '기존 회의',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '회의',
          location: '회의실',
          category: '업무',
          repeat: { type: 'daily' as RepeatType, interval: 1, endDate: '2025-10-05' },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),

        http.put('/api/recurring-events/:repeatId', async ({ request }) => {
          const updates = (await request.json()) as Partial<Event>;
          const updatedEvents = mockEvents.map(event => ({
            ...event,
            ...updates,
          }));
          return HttpResponse.json(updatedEvents, { status: 200 });
        })
      );

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      const updatedForm: EventForm = {
        title: '수정된 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '회의',
        location: '회의실',
        category: '업무',
        repeat: { type: 'daily' as RepeatType, interval: 1, endDate: '2025-10-05' },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(updatedForm as Event);
      });

      expect(result.current.events[0].title).toBe('수정된 회의');
    });

    it('MEDIUM.3.7 - 반복 이벤트 수정 시 시간 변경', async () => {
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '회의',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '회의',
          location: '회의실',
          category: '업무',
          repeat: { type: 'daily' as RepeatType, interval: 1 },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),

        http.put('/api/recurring-events/:repeatId', async ({ request }) => {
          const updates = (await request.json()) as Partial<Event>;
          mockEvents[0] = { ...mockEvents[0], ...updates };
          return HttpResponse.json([mockEvents[0]], { status: 200 });
        })
      );

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      const updatedForm: EventForm = {
        title: '회의',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '회의',
        location: '회의실',
        category: '업무',
        repeat: { type: 'daily' as RepeatType, interval: 1 },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(updatedForm as Event);
      });

      expect(result.current.events[0].startTime).toBe('10:00');
      expect(result.current.events[0].endTime).toBe('11:00');
    });
  });

  describe('반복 이벤트 삭제', () => {
    it('MEDIUM.3.9 - 전체 반복 시리즈 삭제', async () => {
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '삭제할 이벤트',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '삭제',
          location: '회의실',
          category: '기타',
          repeat: { type: 'daily' as RepeatType, interval: 1 },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),

        http.delete('/api/recurring-events/:repeatId', ({ params }) => {
          mockEvents.length = 0;
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      const eventToDelete = mockEvents[0];

      await act(async () => {
        await result.current.deleteEvent(eventToDelete);
      });

      expect(result.current.events.length).toBe(0);
    });

    it('MEDIUM.3.10 - 단일 이벤트 삭제는 기존 로직 사용', async () => {
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '삭제할 이벤트',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '삭제',
          location: '회의실',
          category: '기타',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),

        http.delete('/api/events/:id', ({ params }) => {
          mockEvents.length = 0;
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      const eventToDelete = mockEvents[0];

      await act(async () => {
        await result.current.deleteEvent(eventToDelete);
      });

      expect(result.current.events.length).toBe(0);
    });
  });

  describe('API 에러 처리', () => {
    it('MEDIUM.3.11 - 반복 이벤트 생성 실패', async () => {
      server.use(
        http.post('/api/events-list', () => {
          return new HttpResponse(null, { status: 500 });
        }),

        http.get('/api/events', () => {
          return HttpResponse.json({ events: [] });
        })
      );

      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      const eventForm: EventForm = {
        title: '실패할 이벤트',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '실패',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'daily' as RepeatType,
          interval: 1,
          endDate: '2025-10-05',
        },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(eventForm as Event);
      });

      expect(enqueueSnackbarFn).toHaveBeenCalled();
    });
  });
});
