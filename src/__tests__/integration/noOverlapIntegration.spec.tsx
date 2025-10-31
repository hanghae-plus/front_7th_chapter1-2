import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

// notistack mock
const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
      closeSnackbar: vi.fn(),
    }),
    SnackbarProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

describe('REQ-004: 반복 일정 겹침 미고려 - Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    enqueueSnackbarFn.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('TODO-009: UI에서 겹치는 시간에 반복 일정 생성 시 경고 없이 생성된다', () => {
    it('기존 일정과 같은 시간대에 반복 일정을 생성해도 경고 메시지가 표시되지 않는다', async () => {
      // 명세: REQ-004, CONS-001 - 겹침 경고 없음
      // 설계: TODO-009
      expect.hasAssertions();

      // Arrange - 기존 일정 포함된 Mock 데이터
      const existingEvents: Event[] = [
        {
          id: '1',
          title: '기존 회의',
          date: '2025-06-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '기존 단일 일정',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: existingEvents });
        }),
        http.post('/api/events-list', async ({ request }) => {
          const { events: newEvents } = (await request.json()) as { events: Event[] };
          return HttpResponse.json(newEvents, { status: 201 });
        })
      );

      render(<App />);

      // 초기 로딩 대기
      await waitFor(() => {
        const events = screen.getAllByText('기존 회의');
        expect(events.length).toBeGreaterThan(0);
      });

      // Act - 겹치는 시간에 반복 일정 추가
      const addButton = screen.getByRole('button', { name: /일정 추가/i });
      await user.click(addButton);

      // 동일한 시간대 입력
      const titleInput = screen.getByLabelText(/제목/i);
      await user.type(titleInput, '반복 회의');

      const dateInput = screen.getByLabelText(/날짜/i);
      await user.clear(dateInput);
      await user.type(dateInput, '2025-06-15');

      const startTimeInput = screen.getByLabelText(/시작 시간/i);
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '10:00');

      const endTimeInput = screen.getByLabelText(/종료 시간/i);
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '11:00');

      // 반복 설정
      const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });
      await user.click(repeatCheckbox);

      // 저장 버튼 클릭
      const submitButton = screen.getByRole('button', { name: /일정 (추가|저장)/i });
      await user.click(submitButton);

      // Assert - 경고 없이 성공 메시지만 표시
      await waitFor(() => {
        expect(enqueueSnackbarFn).toHaveBeenCalledWith(
          expect.stringMatching(/일정이 추가되었습니다/i),
          { variant: 'success' }
        );
      });

      // 경고나 에러 메시지가 표시되지 않음
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(enqueueSnackbarFn).not.toHaveBeenCalledWith(
        expect.stringMatching(/겹침|중복/i),
        expect.objectContaining({ variant: 'warning' })
      );
    });

    it('여러 반복 일정이 같은 시간대에 있어도 경고 없이 추가된다', async () => {
      // 명세: REQ-004
      // 설계: TODO-009
      expect.hasAssertions();

      // Arrange - 여러 반복 일정
      const recurringEvents: Event[] = [
        {
          id: '1',
          title: '매일 스탠드업',
          date: '2025-06-15',
          startTime: '09:00',
          endTime: '09:30',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-06-20', id: 'repeat-1' },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '매일 리뷰',
          date: '2025-06-15',
          startTime: '09:00',
          endTime: '09:30',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-06-20', id: 'repeat-2' },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        })
      );

      render(<App />);

      // Assert - 모든 일정이 경고 없이 표시됨
      await waitFor(() => {
        const standupEvents = screen.getAllByText('매일 스탠드업');
        const reviewEvents = screen.getAllByText('매일 리뷰');
        expect(standupEvents.length).toBeGreaterThan(0);
        expect(reviewEvents.length).toBeGreaterThan(0);
      });

      // 경고 메시지 없음
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('TODO-010: 여러 사용자가 같은 시간에 반복 일정을 생성해도 모두 저장된다', () => {
    it('API 레벨에서 동시에 여러 반복 일정이 요청되어도 모두 저장된다', async () => {
      // 명세: REQ-004, CONS-001
      // 설계: TODO-010
      expect.hasAssertions();

      // Arrange - 동시 요청 시뮬레이션
      let requestCount = 0;
      const createdEvents: Event[] = [];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: createdEvents });
        }),
        http.post('/api/events-list', async ({ request }) => {
          requestCount++;
          const { events: newEvents } = (await request.json()) as { events: Event[] };

          // 동시 요청 처리 (모두 저장)
          const eventsWithIds = newEvents.map((event, index) => ({
            ...event,
            id: `req${requestCount}-${index + 1}`,
          }));

          createdEvents.push(...eventsWithIds);

          return HttpResponse.json(eventsWithIds, { status: 201 });
        })
      );

      // Act - 동시에 3개의 반복 일정 생성 요청
      const requests = [
        {
          events: [
            {
              title: '사용자1 회의',
              date: '2025-06-15',
              startTime: '10:00',
              endTime: '11:00',
              description: '',
              location: '',
              category: '업무',
              repeat: { type: 'daily', interval: 1, endDate: '2025-06-20' },
              notificationTime: 10,
            },
          ],
        },
        {
          events: [
            {
              title: '사용자2 회의',
              date: '2025-06-15',
              startTime: '10:00',
              endTime: '11:00',
              description: '',
              location: '',
              category: '업무',
              repeat: { type: 'daily', interval: 1, endDate: '2025-06-20' },
              notificationTime: 10,
            },
          ],
        },
        {
          events: [
            {
              title: '사용자3 회의',
              date: '2025-06-15',
              startTime: '10:00',
              endTime: '11:00',
              description: '',
              location: '',
              category: '업무',
              repeat: { type: 'daily', interval: 1, endDate: '2025-06-20' },
              notificationTime: 10,
            },
          ],
        },
      ];

      const responses = await Promise.all(
        requests.map((body) =>
          fetch('/api/events-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        )
      );

      // Assert - 모든 요청이 성공
      expect(responses).toHaveLength(3);
      responses.forEach((response) => {
        expect(response.status).toBe(201);
      });

      // 3개의 요청이 모두 처리됨
      expect(requestCount).toBe(3);
    });

    it('여러 클라이언트가 동시에 같은 시간대 일정을 생성해도 모두 저장된다', async () => {
      // 명세: REQ-004
      // 설계: TODO-010
      expect.hasAssertions();

      // Arrange
      const savedEvents: Event[] = [];

      server.use(
        http.post('/api/events-list', async ({ request }) => {
          const { events: newEvents } = (await request.json()) as { events: Event[] };

          // 각 클라이언트의 요청을 독립적으로 처리
          const eventsWithIds = newEvents.map((event, index) => ({
            ...event,
            id: `event-${Date.now()}-${index}`,
          }));

          savedEvents.push(...eventsWithIds);

          return HttpResponse.json(eventsWithIds, { status: 201 });
        })
      );

      // Act - 5개 클라이언트 동시 요청
      const concurrentRequests = Array.from({ length: 5 }, (_, i) => ({
        events: [
          {
            title: `클라이언트${i + 1}`,
            date: '2025-06-15',
            startTime: '14:00',
            endTime: '15:00',
            description: '',
            location: '',
            category: '업무',
            repeat: { type: 'weekly', interval: 1, endDate: '2025-07-06' },
            notificationTime: 10,
          },
        ],
      }));

      const results = await Promise.all(
        concurrentRequests.map((body) =>
          fetch('/api/events-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        )
      );

      // Assert - 모든 요청 성공
      expect(results.every((r) => r.status === 201)).toBe(true);
      expect(savedEvents.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('TODO-011: 캘린더 뷰에서 겹친 일정들이 모두 표시된다', () => {
    it('같은 시간대의 여러 일정이 캘린더에 모두 표시된다', async () => {
      // 명세: REQ-004, REQ-005
      // 설계: TODO-011
      expect.hasAssertions();

      // Arrange - 같은 날, 같은 시간대의 여러 일정
      const overlappingEvents: Event[] = [
        {
          id: '1',
          title: '회의 A',
          date: '2025-06-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '회의 B',
          date: '2025-06-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '회의 C',
          date: '2025-06-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '회의실 C',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: overlappingEvents });
        })
      );

      render(<App />);

      // Assert - 모든 겹친 일정이 표시됨
      await waitFor(() => {
        const eventA = screen.getAllByText('회의 A');
        const eventB = screen.getAllByText('회의 B');
        const eventC = screen.getAllByText('회의 C');
        expect(eventA.length).toBeGreaterThan(0);
        expect(eventB.length).toBeGreaterThan(0);
        expect(eventC.length).toBeGreaterThan(0);
      });

      // 3개 일정 모두 화면에 렌더링됨
      const eventItems = screen.getAllByText(/회의 [ABC]/);
      expect(eventItems.length).toBeGreaterThanOrEqual(3);
    });

    it('반복 일정과 단일 일정이 겹쳐도 모두 표시된다', async () => {
      // 명세: REQ-004, REQ-005
      // 설계: TODO-011
      expect.hasAssertions();

      // Arrange - 반복 일정 + 단일 일정
      const mixedEvents: Event[] = [
        {
          id: '1',
          title: '매일 스탠드업',
          date: '2025-06-15',
          startTime: '09:00',
          endTime: '09:30',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-06-20', id: 'repeat-1' },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '단일 회의',
          date: '2025-06-15',
          startTime: '09:00',
          endTime: '09:30',
          description: '',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mixedEvents });
        })
      );

      render(<App />);

      // Assert - 반복 일정과 단일 일정 모두 표시
      await waitFor(() => {
        const standup = screen.getAllByText('매일 스탠드업');
        const single = screen.getAllByText('단일 회의');
        expect(standup.length).toBeGreaterThan(0);
        expect(single.length).toBeGreaterThan(0);
      });
    });

    it('주간 뷰에서 겹친 일정들이 모두 보인다', async () => {
      // 명세: REQ-004
      // 설계: TODO-011
      expect.hasAssertions();

      // Arrange - 2025-06-15 (일요일)의 여러 일정
      const weekEvents: Event[] = [
        {
          id: '1',
          title: '아침 운동',
          date: '2025-06-15',
          startTime: '07:00',
          endTime: '08:00',
          description: '',
          location: '',
          category: '개인',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '아침 명상',
          date: '2025-06-15',
          startTime: '07:00',
          endTime: '08:00',
          description: '',
          location: '',
          category: '개인',
          repeat: { type: 'none', interval: 1 },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: weekEvents });
        })
      );

      render(<App />);

      // 주간 뷰로 전환
      const weekViewButton = screen.getByRole('button', { name: /week|주/i });
      await user.click(weekViewButton);

      // Assert - 주간 뷰에서 겹친 일정들이 모두 표시됨
      await waitFor(() => {
        const exercise = screen.getAllByText('아침 운동');
        const meditation = screen.getAllByText('아침 명상');
        expect(exercise.length).toBeGreaterThan(0);
        expect(meditation.length).toBeGreaterThan(0);
      });
    });

    it('월간 뷰에서 한 날짜에 여러 겹친 일정이 표시된다', async () => {
      // 명세: REQ-004
      // 설계: TODO-011
      expect.hasAssertions();

      // Arrange - 2025-06-15에 5개 일정
      const manyEvents: Event[] = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        title: `일정 ${i + 1}`,
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      }));

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: manyEvents });
        })
      );

      render(<App />);

      // Assert - 5개 일정 모두 표시됨
      await waitFor(() => {
        const allEvents = screen.getAllByText(/일정 [1-5]/);
        expect(allEvents.length).toBeGreaterThanOrEqual(5);
      });
    });
  });
});

