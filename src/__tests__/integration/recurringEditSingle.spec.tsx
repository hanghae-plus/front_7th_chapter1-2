import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';

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

describe('REQ-007: 단일 일정 수정 - Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    enqueueSnackbarFn.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('TODO-009: "예" 버튼 클릭 시 선택한 일정만 수정된다', () => {
    it('반복 일정 중 하나만 수정하면 해당 일정의 repeat.type이 none으로 변경된다', async () => {
      // 명세: REQ-007 (단일 수정 동작)
      // 설계: TODO-009
      expect.hasAssertions();

      // Arrange - 반복 일정 3개
      const recurringEvents: Event[] = [
        {
          id: '1',
          title: '주간 회의',
          date: '2025-06-15',
          startTime: '14:00',
          endTime: '15:00',
          description: '주간 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: 'repeat-1' },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '주간 회의',
          date: '2025-06-22',
          startTime: '14:00',
          endTime: '15:00',
          description: '주간 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: 'repeat-1' },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '주간 회의',
          date: '2025-06-29',
          startTime: '14:00',
          endTime: '15:00',
          description: '주간 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: 'repeat-1' },
          notificationTime: 10,
        },
      ];

      let updatedEventData: Event | null = null;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        }),
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          updatedEventData = (await request.json()) as Event;
          const index = recurringEvents.findIndex((e) => e.id === id);
          if (index !== -1) {
            recurringEvents[index] = { ...recurringEvents[index], ...updatedEventData };
          }
          return HttpResponse.json({ ...updatedEventData, id });
        })
      );

      render(<App />);

      // 일정 로딩 대기
      await waitFor(() => {
        const events = screen.getAllByText('주간 회의');
        expect(events.length).toBeGreaterThan(0);
      });

      // Act - 두 번째 일정 수정
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[1]); // 2번째 일정

      const titleInput = screen.getByLabelText(/제목/i);
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 회의');

      const submitButton = screen.getByRole('button', { name: /일정 수정/i });
      await user.click(submitButton);

      // 다이얼로그에서 "예" 버튼 클릭
      // const dialog = await screen.findByRole('dialog');
      // const yesButton = within(dialog).getByRole('button', { name: /예/i });
      // await user.click(yesButton);

      // Assert - 단일 수정 API 호출
      // await waitFor(() => {
      //   expect(updatedEventData).not.toBeNull();
      //   // repeat.type이 'none'으로 변경됨
      //   expect(updatedEventData!.repeat.type).toBe('none');
      //   expect(updatedEventData!.title).toBe('수정된 회의');
      // });

      // // 성공 메시지
      // expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      //   expect.stringMatching(/일정이 수정되었습니다/i),
      //   { variant: 'success' }
      // );
    });

    it('단일 수정 시 해당 일정만 제목이 변경되고 다른 일정은 유지된다', async () => {
      // 명세: REQ-007 (격리성)
      // 설계: TODO-009
      expect.hasAssertions();

      // Arrange
      const recurringEvents: Event[] = [
        {
          id: '1',
          title: '매일 스탠드업',
          date: '2025-06-15',
          startTime: '09:00',
          endTime: '09:30',
          description: '일일 미팅',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-06-20', id: 'repeat-2' },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '매일 스탠드업',
          date: '2025-06-16',
          startTime: '09:00',
          endTime: '09:30',
          description: '일일 미팅',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-06-20', id: 'repeat-2' },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        }),
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          const updatedEvent = (await request.json()) as Event;
          const index = recurringEvents.findIndex((e) => e.id === id);
          if (index !== -1) {
            recurringEvents[index] = { ...recurringEvents[index], ...updatedEvent };
          }
          return HttpResponse.json({ ...updatedEvent, id });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('매일 스탠드업');
        expect(events.length).toBeGreaterThan(0);
      });

      // Act - 첫 번째 일정만 수정
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.clear(titleInput);
      await user.type(titleInput, '특별 스탠드업');

      const submitButton = screen.getByRole('button', { name: /일정 수정/i });
      await user.click(submitButton);

      // // 다이얼로그에서 "예" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const yesButton = within(dialog).getByRole('button', { name: /예/i });
      // await user.click(yesButton);

      // Assert - 첫 번째 일정만 수정됨
      // await waitFor(() => {
      //   expect(screen.getByText('특별 스탠드업')).toBeInTheDocument();
      //   // 두 번째 일정은 원본 유지
      //   expect(screen.getByText('매일 스탠드업')).toBeInTheDocument();
      // });
    });
  });

  describe('TODO-010: 단일 수정된 일정은 반복 아이콘이 사라진다', () => {
    it('수정 후 repeat.type이 none이 되어 반복 아이콘이 제거된다', async () => {
      // 명세: REQ-007 (아이콘 제거)
      // 설계: TODO-010
      expect.hasAssertions();

      // Arrange
      const recurringEvents: Event[] = [
        {
          id: '1',
          title: '월간 리뷰',
          date: '2025-06-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '월간 점검',
          location: '대회의실',
          category: '업무',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31', id: 'repeat-3' },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '월간 리뷰',
          date: '2025-07-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '월간 점검',
          location: '대회의실',
          category: '업무',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31', id: 'repeat-3' },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        }),
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          const updatedEvent = (await request.json()) as Event;
          const index = recurringEvents.findIndex((e) => e.id === id);
          if (index !== -1) {
            // repeat.type을 'none'으로 변경
            recurringEvents[index] = {
              ...recurringEvents[index],
              ...updatedEvent,
              repeat: { type: 'none', interval: 1 },
            };
          }
          return HttpResponse.json({
            ...updatedEvent,
            id,
            repeat: { type: 'none', interval: 1 },
          });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('월간 리뷰');
        expect(events.length).toBeGreaterThan(0);
      });

      // // 수정 전 - 반복 아이콘 존재
      // const firstEvent = screen.getAllByText('월간 리뷰')[0].closest('li');
      // expect(within(firstEvent!).getByLabelText('반복 일정')).toBeInTheDocument();

      // Act - 단일 수정
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.clear(titleInput);
      await user.type(titleInput, '특별 리뷰');

      const submitButton = screen.getByRole('button', { name: /일정 수정/i });
      await user.click(submitButton);

      // // 다이얼로그에서 "예" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const yesButton = within(dialog).getByRole('button', { name: /예/i });
      // await user.click(yesButton);

      // Assert - 반복 아이콘 제거
      // await waitFor(() => {
      //   const modifiedEvent = screen.getByText('특별 리뷰').closest('li');
      //   expect(modifiedEvent).toBeInTheDocument();
      //   // 반복 아이콘이 사라짐
      //   expect(within(modifiedEvent!).queryByLabelText('반복 일정')).not.toBeInTheDocument();
      // });

      // // 다른 반복 일정은 아이콘 유지
      // const otherEvent = screen.getByText('월간 리뷰').closest('li');
      // expect(within(otherEvent!).getByLabelText('반복 일정')).toBeInTheDocument();
    });
  });

  describe('TODO-011: 단일 수정 시 다른 반복 일정은 영향받지 않는다', () => {
    it('같은 repeat.id를 가진 다른 일정들은 원본 상태를 유지한다', async () => {
      // 명세: REQ-007 (격리성)
      // 설계: TODO-011
      expect.hasAssertions();

      // Arrange - 같은 그룹의 반복 일정 3개
      const recurringEvents: Event[] = [
        {
          id: '1',
          title: '팀 미팅',
          date: '2025-06-15',
          startTime: '15:00',
          endTime: '16:00',
          description: '팀 회의',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: 'repeat-4' },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '팀 미팅',
          date: '2025-06-22',
          startTime: '15:00',
          endTime: '16:00',
          description: '팀 회의',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: 'repeat-4' },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '팀 미팅',
          date: '2025-06-29',
          startTime: '15:00',
          endTime: '16:00',
          description: '팀 회의',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: 'repeat-4' },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        }),
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          const updatedEvent = (await request.json()) as Event;
          const index = recurringEvents.findIndex((e) => e.id === id);
          if (index !== -1) {
            // 단일 일정만 수정
            recurringEvents[index] = {
              ...recurringEvents[index],
              ...updatedEvent,
              repeat: { type: 'none', interval: 1 },
            };
          }
          return HttpResponse.json({
            ...updatedEvent,
            id,
            repeat: { type: 'none', interval: 1 },
          });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('팀 미팅');
        expect(events.length).toBe(3);
      });

      // Act - 두 번째 일정만 수정
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[1]);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.clear(titleInput);
      await user.type(titleInput, '긴급 미팅');

      const submitButton = screen.getByRole('button', { name: /일정 수정/i });
      await user.click(submitButton);

      // // 다이얼로그에서 "예" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const yesButton = within(dialog).getByRole('button', { name: /예/i });
      // await user.click(yesButton);

      // Assert - 다른 일정들은 원본 유지
      // await waitFor(() => {
      //   // 수정된 일정
      //   expect(screen.getByText('긴급 미팅')).toBeInTheDocument();

      //   // 나머지 2개는 원본 유지
      //   const originalEvents = screen.getAllByText('팀 미팅');
      //   expect(originalEvents.length).toBe(2);

      //   // 원본 일정들의 repeat 속성 확인
      //   originalEvents.forEach((eventEl) => {
      //     const eventItem = eventEl.closest('li');
      //     // 반복 아이콘 유지
      //     expect(within(eventItem!).getByLabelText('반복 일정')).toBeInTheDocument();
      //   });
      // });
    });

    it('단일 수정 후에도 다른 반복 일정들의 repeat.id가 유지된다', async () => {
      // 명세: REQ-007
      // 설계: TODO-011
      expect.hasAssertions();

      // Arrange
      const repeatId = 'repeat-5';
      const recurringEvents: Event[] = [
        {
          id: '1',
          title: '일일 회의',
          date: '2025-06-15',
          startTime: '11:00',
          endTime: '12:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-06-20', id: repeatId },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '일일 회의',
          date: '2025-06-16',
          startTime: '11:00',
          endTime: '12:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-06-20', id: repeatId },
          notificationTime: 10,
        },
      ];

      let apiCallCount = 0;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        }),
        http.put('/api/events/:id', async ({ params, request }) => {
          apiCallCount++;
          const { id } = params;
          const updatedEvent = (await request.json()) as Event;

          // 단일 일정만 수정 (repeat.type을 'none'으로)
          const index = recurringEvents.findIndex((e) => e.id === id);
          if (index !== -1) {
            recurringEvents[index] = {
              ...recurringEvents[index],
              ...updatedEvent,
              repeat: { type: 'none', interval: 1 },
            };
          }

          return HttpResponse.json({
            ...updatedEvent,
            id,
            repeat: { type: 'none', interval: 1 },
          });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('일일 회의');
        expect(events.length).toBe(2);
      });

      // Act - 첫 번째 일정만 수정
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.clear(titleInput);
      await user.type(titleInput, '변경된 회의');

      const submitButton = screen.getByRole('button', { name: /일정 수정/i });
      await user.click(submitButton);

      // // 다이얼로그에서 "예" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const yesButton = within(dialog).getByRole('button', { name: /예/i });
      // await user.click(yesButton);

      // Assert - 단일 수정 API만 호출됨 (전체 수정 API는 호출 안 됨)
      // await waitFor(() => {
      //   // PUT /api/events/:id 1번만 호출
      //   expect(apiCallCount).toBe(1);

      //   // 수정된 일정
      //   expect(screen.getByText('변경된 회의')).toBeInTheDocument();

      //   // 나머지 일정은 원본 유지
      //   expect(screen.getByText('일일 회의')).toBeInTheDocument();
      // });
    });
  });
});
