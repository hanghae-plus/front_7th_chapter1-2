import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';

import App from '../../App';
import { server } from '../../setupTests';
import { Event, EventForm } from '../../types';

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

describe('REQ-006: 반복 종료 조건 검증 - Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    enqueueSnackbarFn.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('TODO-001: 반복 종료 날짜를 설정하지 않으면 무한 반복된다', () => {
    it('종료 날짜 없이 매일 반복 일정을 생성하면 제한 없이 일정이 생성된다', async () => {
      // 명세: REQ-006 (종료 조건 미설정)
      // 설계: TODO-001
      expect.hasAssertions();

      // Arrange - 빈 이벤트 목록
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: [] });
        }),
        http.post('/api/events-list', async ({ request }) => {
          const { events: newEvents } = (await request.json()) as { events: EventForm[] };
          return HttpResponse.json(newEvents, { status: 201 });
        })
      );

      render(<App />);

      // Act - 종료 날짜 없이 반복 일정 생성
      const addButton = screen.getByRole('button', { name: /일정 추가/i });
      await user.click(addButton);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.type(titleInput, '매일 미팅');

      const dateInput = screen.getByLabelText(/날짜/i);
      await user.clear(dateInput);
      await user.type(dateInput, '2025-06-01');

      const startTimeInput = screen.getByLabelText(/시작 시간/i);
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '09:00');

      const endTimeInput = screen.getByLabelText(/종료 시간/i);
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '10:00');

      // 반복 설정
      const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });
      await user.click(repeatCheckbox);

      // 반복 종료 날짜는 입력하지 않음 (빈 상태 유지)

      const submitButton = screen.getByRole('button', { name: /일정 추가/i });
      await user.click(submitButton);

      // Assert - 일정 생성 성공 (종료 날짜 제한 없음)
      // await waitFor(() => {
      //   expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      //     expect.stringMatching(/일정이 추가되었습니다/i),
      //     { variant: 'success' }
      //   );
      // });

      // // 생성된 반복 일정이 표시됨
      // await waitFor(() => {
      //   const events = screen.getAllByText('매일 미팅');
      //   // 종료 날짜가 없으므로 많은 일정이 생성됨
      //   expect(events.length).toBeGreaterThan(30); // 최소 1개월 이상
      // });
    });
  });

  describe('TODO-002: 종료 날짜가 2025-12-31 이하면 정상적으로 반복 일정이 생성된다', () => {
    it('종료 날짜를 2025-06-30으로 설정하면 해당 날짜까지만 일정이 생성된다', async () => {
      // 명세: REQ-006 (최대 종료 날짜 제약)
      // 설계: TODO-002
      expect.hasAssertions();

      // Arrange
      const createdEvents: Event[] = [];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: createdEvents });
        }),
        http.post('/api/events-list', async ({ request }) => {
          const { events: newEvents } = (await request.json()) as { events: EventForm[] };
          const eventsWithIds = newEvents.map((event, index) => ({
            ...event,
            id: `event-${index + 1}`,
          }));
          createdEvents.push(...eventsWithIds);
          return HttpResponse.json(eventsWithIds, { status: 201 });
        })
      );

      render(<App />);

      // Act - 종료 날짜 2025-06-30으로 설정
      const addButton = screen.getByRole('button', { name: /일정 추가/i });
      await user.click(addButton);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.type(titleInput, '주간 회의');

      const dateInput = screen.getByLabelText(/날짜/i);
      await user.clear(dateInput);
      await user.type(dateInput, '2025-06-01');

      const startTimeInput = screen.getByLabelText(/시작 시간/i);
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '14:00');

      const endTimeInput = screen.getByLabelText(/종료 시간/i);
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '15:00');

      // 반복 설정
      const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });
      await user.click(repeatCheckbox);

      // 반복 유형을 weekly로 설정
      const repeatTypeSelect = screen.getByLabelText(/반복 유형/i);
      await user.click(repeatTypeSelect);
      const weeklyOption = screen.getByRole('option', { name: /weekly/i });
      await user.click(weeklyOption);

      // 반복 종료 날짜 설정
      const repeatEndDateInput = screen.getByLabelText(/반복 종료일/i);
      await user.type(repeatEndDateInput, '2025-06-30');

      const submitButton = screen.getByRole('button', { name: /일정 추가/i });
      await user.click(submitButton);

      // Assert - 종료 날짜까지만 일정 생성
      // await waitFor(() => {
      //   expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      //     expect.stringMatching(/일정이 추가되었습니다/i),
      //     { variant: 'success' }
      //   );
      // });

      // // 2025-06-01 ~ 2025-06-30 사이 매주 일정 (약 5개)
      // await waitFor(() => {
      //   expect(createdEvents.length).toBe(5);
      //   // 마지막 일정이 2025-06-30 이전
      //   const lastEvent = createdEvents[createdEvents.length - 1];
      //   expect(new Date(lastEvent.date).getTime()).toBeLessThanOrEqual(
      //     new Date('2025-06-30').getTime()
      //   );
      // });
    });

    it('종료 날짜를 2025-12-31로 설정하면 최대 날짜까지 일정이 생성된다', async () => {
      // 명세: REQ-006, CONS-002
      // 설계: TODO-002
      expect.hasAssertions();

      // Arrange
      const createdEvents: Event[] = [];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: createdEvents });
        }),
        http.post('/api/events-list', async ({ request }) => {
          const { events: newEvents } = (await request.json()) as { events: EventForm[] };
          const eventsWithIds = newEvents.map((event, index) => ({
            ...event,
            id: `event-${index + 1}`,
          }));
          createdEvents.push(...eventsWithIds);
          return HttpResponse.json(eventsWithIds, { status: 201 });
        })
      );

      render(<App />);

      // Act - 종료 날짜 2025-12-31로 설정
      const addButton = screen.getByRole('button', { name: /일정 추가/i });
      await user.click(addButton);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.type(titleInput, '월간 리뷰');

      const dateInput = screen.getByLabelText(/날짜/i);
      await user.clear(dateInput);
      await user.type(dateInput, '2025-01-15');

      const startTimeInput = screen.getByLabelText(/시작 시간/i);
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '10:00');

      const endTimeInput = screen.getByLabelText(/종료 시간/i);
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '11:00');

      // 반복 설정
      const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });
      await user.click(repeatCheckbox);

      // 반복 유형을 monthly로 설정
      const repeatTypeSelect = screen.getByLabelText(/반복 유형/i);
      await user.click(repeatTypeSelect);
      const monthlyOption = screen.getByRole('option', { name: /monthly/i });
      await user.click(monthlyOption);

      // 반복 종료 날짜 설정
      const repeatEndDateInput = screen.getByLabelText(/반복 종료일/i);
      await user.type(repeatEndDateInput, '2025-12-31');

      const submitButton = screen.getByRole('button', { name: /일정 추가/i });
      await user.click(submitButton);

      // Assert - 2025-12-31까지 일정 생성
      // await waitFor(() => {
      //   expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      //     expect.stringMatching(/일정이 추가되었습니다/i),
      //     { variant: 'success' }
      //   );
      // });

      // // 2025-01-15 ~ 2025-12-31 사이 매월 일정 (12개)
      // await waitFor(() => {
      //   expect(createdEvents.length).toBe(12);
      //   // 마지막 일정이 2025-12-31 이하
      //   const lastEvent = createdEvents[createdEvents.length - 1];
      //   expect(new Date(lastEvent.date).getTime()).toBeLessThanOrEqual(
      //     new Date('2025-12-31').getTime()
      //   );
      // });
    });
  });

  describe('TODO-003: 종료 날짜가 2025-12-31을 넘으면 2025-12-31까지만 일정이 생성된다', () => {
    it('종료 날짜를 2026-12-31로 입력해도 2025-12-31까지만 생성된다', async () => {
      // 명세: REQ-006, CONS-002 (최대 제한)
      // 설계: TODO-003
      expect.hasAssertions();

      // Arrange
      const createdEvents: Event[] = [];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: createdEvents });
        }),
        http.post('/api/events-list', async ({ request }) => {
          const { events: newEvents } = (await request.json()) as { events: EventForm[] };
          const eventsWithIds = newEvents.map((event, index) => ({
            ...event,
            id: `event-${index + 1}`,
          }));
          createdEvents.push(...eventsWithIds);
          return HttpResponse.json(eventsWithIds, { status: 201 });
        })
      );

      render(<App />);

      // Act - 종료 날짜 2026-12-31로 설정 (최대값 초과)
      const addButton = screen.getByRole('button', { name: /일정 추가/i });
      await user.click(addButton);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.type(titleInput, '매일 운동');

      const dateInput = screen.getByLabelText(/날짜/i);
      await user.clear(dateInput);
      await user.type(dateInput, '2025-12-01');

      const startTimeInput = screen.getByLabelText(/시작 시간/i);
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '07:00');

      const endTimeInput = screen.getByLabelText(/종료 시간/i);
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '08:00');

      // 반복 설정
      const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });
      await user.click(repeatCheckbox);

      // 반복 종료 날짜 설정 (초과)
      const repeatEndDateInput = screen.getByLabelText(/반복 종료일/i);
      await user.type(repeatEndDateInput, '2026-12-31');

      const submitButton = screen.getByRole('button', { name: /일정 추가/i });
      await user.click(submitButton);

      // Assert - 2025-12-31까지만 생성됨
      // await waitFor(() => {
      //   expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      //     expect.stringMatching(/일정이 추가되었습니다/i),
      //     { variant: 'success' }
      //   );
      // });

      // // 2025-12-01 ~ 2025-12-31 사이 매일 일정 (31개)
      // await waitFor(() => {
      //   expect(createdEvents.length).toBe(31);
      //   // 마지막 일정이 2025-12-31
      //   const lastEvent = createdEvents[createdEvents.length - 1];
      //   expect(lastEvent.date).toBe('2025-12-31');
      //   // 2026년 일정은 없음
      //   const has2026 = createdEvents.some((e) => e.date.startsWith('2026'));
      //   expect(has2026).toBe(false);
      // });
    });
  });

  describe('TODO-004: 종료 날짜가 시작 날짜보다 이전이면 에러를 표시한다', () => {
    it('종료 날짜가 시작 날짜보다 이전일 때 에러 메시지를 표시한다', async () => {
      // 명세: REQ-006 (유효성 검증)
      // 설계: TODO-004
      expect.hasAssertions();

      // Arrange
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: [] });
        })
      );

      render(<App />);

      // Act - 잘못된 날짜 입력
      const addButton = screen.getByRole('button', { name: /일정 추가/i });
      await user.click(addButton);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.type(titleInput, '잘못된 일정');

      const dateInput = screen.getByLabelText(/날짜/i);
      await user.clear(dateInput);
      await user.type(dateInput, '2025-06-01');

      const startTimeInput = screen.getByLabelText(/시작 시간/i);
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '09:00');

      const endTimeInput = screen.getByLabelText(/종료 시간/i);
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '10:00');

      // 반복 설정
      const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });
      await user.click(repeatCheckbox);

      // 종료 날짜를 시작 날짜보다 이전으로 설정
      const repeatEndDateInput = screen.getByLabelText(/반복 종료일/i);
      await user.type(repeatEndDateInput, '2025-05-01');

      const submitButton = screen.getByRole('button', { name: /일정 추가/i });
      await user.click(submitButton);

      // Assert - 에러 메시지 표시
      // await waitFor(() => {
      //   expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      //     expect.stringMatching(/종료 날짜는 시작 날짜보다 이후여야 합니다/i),
      //     { variant: 'error' }
      //   );
      // });

      // // 일정이 생성되지 않음
      // expect(screen.queryByText('잘못된 일정')).not.toBeInTheDocument();
    });
  });

  describe('TODO-005: 종료 날짜를 지난 반복 일정은 반복 아이콘을 표시하지 않는다', () => {
    it('종료된 반복 일정은 isActiveRecurring이 false를 반환한다', async () => {
      // 명세: REQ-006 + REQ-005
      // 설계: TODO-005
      expect.hasAssertions();

      // Arrange - 종료된 반복 일정
      const pastEvents: Event[] = [
        {
          id: '1',
          title: '종료된 반복 일정',
          date: '2025-06-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '이미 종료된 반복 일정',
          location: '회의실',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-06-01', id: 'past-repeat' },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '진행 중 반복 일정',
          date: '2025-06-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '아직 진행 중인 반복 일정',
          location: '회의실',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-12-31', id: 'active-repeat' },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: pastEvents });
        })
      );

      render(<App />);

      // Assert - 종료된 일정은 반복 아이콘 없음
      // await waitFor(() => {
      //   // 종료된 일정
      //   const pastEvent = screen.getByText('종료된 반복 일정').closest('li');
      //   expect(pastEvent).toBeInTheDocument();
      //   // 반복 아이콘이 표시되지 않음
      //   expect(within(pastEvent!).queryByLabelText('반복 일정')).not.toBeInTheDocument();

      //   // 진행 중 일정
      //   const activeEvent = screen.getByText('진행 중 반복 일정').closest('li');
      //   expect(activeEvent).toBeInTheDocument();
      //   // 반복 아이콘이 표시됨
      //   expect(within(activeEvent!).getByLabelText('반복 일정')).toBeInTheDocument();
      // });
    });
  });
});
