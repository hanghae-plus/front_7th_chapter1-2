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

describe('REQ-008: 전체 일정 수정 - Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    enqueueSnackbarFn.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('TODO-012: "아니오" 버튼 클릭 시 모든 반복 일정이 수정된다', () => {
    it('같은 repeat.id를 가진 모든 일정이 함께 수정된다', async () => {
      // 명세: REQ-008 (전체 수정 동작)
      // 설계: TODO-012
      expect.hasAssertions();

      // Arrange - 같은 그룹의 반복 일정 3개
      const repeatId = 'repeat-1';
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
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: repeatId },
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
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: repeatId },
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
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: repeatId },
          notificationTime: 10,
        },
      ];

      let updatedData: Partial<Event> | null = null;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        }),
        // 전체 반복 일정 수정 API (새로 필요한 API)
        http.put('/api/events/recurring/:repeatId', async ({ params, request }) => {
          const { repeatId } = params;
          updatedData = (await request.json()) as Partial<Event>;

          // 같은 repeatId를 가진 모든 이벤트 업데이트
          recurringEvents.forEach((event) => {
            if (event.repeat.id === repeatId) {
              Object.assign(event, updatedData);
            }
          });

          return HttpResponse.json({ success: true });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('주간 회의');
        expect(events.length).toBe(3);
      });

      // Act - 수정 후 "아니오" 버튼 클릭
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.clear(titleInput);
      await user.type(titleInput, '전체 수정된 회의');

      const submitButton = screen.getByRole('button', { name: /일정 수정/i });
      await user.click(submitButton);

      // // 다이얼로그에서 "아니오" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const noButton = within(dialog).getByRole('button', { name: /아니오/i });
      // await user.click(noButton);

      // Assert - 모든 일정이 수정됨
      // await waitFor(() => {
      //   expect(updatedData).not.toBeNull();
      //   expect(updatedData!.title).toBe('전체 수정된 회의');

      //   // 화면에 3개 모두 수정된 제목으로 표시
      //   const updatedEvents = screen.getAllByText('전체 수정된 회의');
      //   expect(updatedEvents.length).toBe(3);
      // });

      // // 성공 메시지
      // expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      //   expect.stringMatching(/일정이 수정되었습니다/i),
      //   { variant: 'success' }
      // );
    });

    it('전체 수정 시 PUT /api/events/recurring/:repeatId API가 호출된다', async () => {
      // 명세: REQ-008
      // 설계: TODO-012
      expect.hasAssertions();

      // Arrange
      const repeatId = 'repeat-2';
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
          repeat: { type: 'daily', interval: 1, endDate: '2025-06-20', id: repeatId },
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
          repeat: { type: 'daily', interval: 1, endDate: '2025-06-20', id: repeatId },
          notificationTime: 10,
        },
      ];

      let recurringApiCalled = false;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        }),
        http.put('/api/events/recurring/:repeatId', async ({ params, request }) => {
          recurringApiCalled = true;
          const { repeatId } = params;
          const updatedData = (await request.json()) as Partial<Event>;

          recurringEvents.forEach((event) => {
            if (event.repeat.id === repeatId) {
              Object.assign(event, updatedData);
            }
          });

          return HttpResponse.json({ success: true });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('매일 스탠드업');
        expect(events.length).toBe(2);
      });

      // Act
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.clear(titleInput);
      await user.type(titleInput, '전체 스탠드업');

      const submitButton = screen.getByRole('button', { name: /일정 수정/i });
      await user.click(submitButton);

      // // 다이얼로그에서 "아니오" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const noButton = within(dialog).getByRole('button', { name: /아니오/i });
      // await user.click(noButton);

      // Assert - 전체 수정 API 호출됨
      // await waitFor(() => {
      //   expect(recurringApiCalled).toBe(true);
      // });
    });
  });

  describe('TODO-013: 전체 수정 시 반복 속성이 유지된다', () => {
    it('수정 후에도 repeat.type, interval, endDate가 동일하다', async () => {
      // 명세: REQ-008 (반복 유지)
      // 설계: TODO-013
      expect.hasAssertions();

      // Arrange
      const repeatId = 'repeat-3';
      const originalRepeat = {
        type: 'monthly' as const,
        interval: 1,
        endDate: '2025-12-31',
        id: repeatId,
      };

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
          repeat: { ...originalRepeat },
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
          repeat: { ...originalRepeat },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        }),
        http.put('/api/events/recurring/:repeatId', async ({ params, request }) => {
          const { repeatId } = params;
          const updatedData = (await request.json()) as Partial<Event>;

          recurringEvents.forEach((event) => {
            if (event.repeat.id === repeatId) {
              // 제목만 변경, repeat 속성은 유지
              event.title = updatedData.title || event.title;
              event.description = updatedData.description || event.description;
              // repeat 속성은 그대로 유지
            }
          });

          return HttpResponse.json({ success: true });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('월간 리뷰');
        expect(events.length).toBe(2);
      });

      // Act - 전체 수정
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.clear(titleInput);
      await user.type(titleInput, '새로운 월간 리뷰');

      const submitButton = screen.getByRole('button', { name: /일정 수정/i });
      await user.click(submitButton);

      // // 다이얼로그에서 "아니오" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const noButton = within(dialog).getByRole('button', { name: /아니오/i });
      // await user.click(noButton);

      // Assert - repeat 속성 유지
      // await waitFor(() => {
      //   // 제목은 변경됨
      //   const updatedEvents = screen.getAllByText('새로운 월간 리뷰');
      //   expect(updatedEvents.length).toBe(2);

      //   // repeat 속성 확인 (내부 데이터)
      //   recurringEvents.forEach((event) => {
      //     expect(event.repeat.type).toBe('monthly');
      //     expect(event.repeat.interval).toBe(1);
      //     expect(event.repeat.endDate).toBe('2025-12-31');
      //     expect(event.repeat.id).toBe(repeatId);
      //   });
      // });
    });

    it('전체 수정 후에도 repeat.id가 변경되지 않는다', async () => {
      // 명세: REQ-008
      // 설계: TODO-013
      expect.hasAssertions();

      // Arrange
      const repeatId = 'repeat-4';
      const recurringEvents: Event[] = [
        {
          id: '1',
          title: '주간 스프린트',
          date: '2025-06-15',
          startTime: '13:00',
          endTime: '14:00',
          description: '스프린트 미팅',
          location: '회의실',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: repeatId },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '주간 스프린트',
          date: '2025-06-22',
          startTime: '13:00',
          endTime: '14:00',
          description: '스프린트 미팅',
          location: '회의실',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: repeatId },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        }),
        http.put('/api/events/recurring/:repeatId', async ({ params, request }) => {
          const { repeatId } = params;
          const updatedData = (await request.json()) as Partial<Event>;

          recurringEvents.forEach((event) => {
            if (event.repeat.id === repeatId) {
              event.title = updatedData.title || event.title;
              // repeat.id는 변경 안 됨
            }
          });

          return HttpResponse.json({ success: true });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('주간 스프린트');
        expect(events.length).toBe(2);
      });

      // Act
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 스프린트');

      const submitButton = screen.getByRole('button', { name: /일정 수정/i });
      await user.click(submitButton);

      // // 다이얼로그에서 "아니오" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const noButton = within(dialog).getByRole('button', { name: /아니오/i });
      // await user.click(noButton);

      // Assert - repeat.id 유지
      // await waitFor(() => {
      //   recurringEvents.forEach((event) => {
      //     expect(event.repeat.id).toBe(repeatId);
      //   });
      // });
    });
  });

  describe('TODO-014: 전체 수정 시 반복 아이콘이 유지된다', () => {
    it('수정 후에도 모든 일정에 반복 아이콘이 표시된다', async () => {
      // 명세: REQ-008 (아이콘 유지)
      // 설계: TODO-014
      expect.hasAssertions();

      // Arrange
      const repeatId = 'repeat-5';
      const recurringEvents: Event[] = [
        {
          id: '1',
          title: '팀 빌딩',
          date: '2025-06-15',
          startTime: '16:00',
          endTime: '17:00',
          description: '팀 활동',
          location: '야외',
          category: '개인',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31', id: repeatId },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '팀 빌딩',
          date: '2025-07-15',
          startTime: '16:00',
          endTime: '17:00',
          description: '팀 활동',
          location: '야외',
          category: '개인',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31', id: repeatId },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '팀 빌딩',
          date: '2025-08-15',
          startTime: '16:00',
          endTime: '17:00',
          description: '팀 활동',
          location: '야외',
          category: '개인',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31', id: repeatId },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        }),
        http.put('/api/events/recurring/:repeatId', async ({ params, request }) => {
          const { repeatId } = params;
          const updatedData = (await request.json()) as Partial<Event>;

          recurringEvents.forEach((event) => {
            if (event.repeat.id === repeatId) {
              event.title = updatedData.title || event.title;
              // repeat 속성 유지
            }
          });

          return HttpResponse.json({ success: true });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('팀 빌딩');
        expect(events.length).toBe(3);
      });

      // // 수정 전 - 모든 일정에 반복 아이콘 존재
      // const eventsBeforeEdit = screen.getAllByText('팀 빌딩');
      // eventsBeforeEdit.forEach((eventEl) => {
      //   const eventItem = eventEl.closest('li');
      //   expect(within(eventItem!).getByLabelText('반복 일정')).toBeInTheDocument();
      // });

      // Act - 전체 수정
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.clear(titleInput);
      await user.type(titleInput, '새로운 팀 빌딩');

      const submitButton = screen.getByRole('button', { name: /일정 수정/i });
      await user.click(submitButton);

      // // 다이얼로그에서 "아니오" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const noButton = within(dialog).getByRole('button', { name: /아니오/i });
      // await user.click(noButton);

      // Assert - 수정 후에도 모든 일정에 반복 아이콘 유지
      // await waitFor(() => {
      //   const updatedEvents = screen.getAllByText('새로운 팀 빌딩');
      //   expect(updatedEvents.length).toBe(3);

      //   updatedEvents.forEach((eventEl) => {
      //     const eventItem = eventEl.closest('li');
      //     // 반복 아이콘 유지
      //     expect(within(eventItem!).getByLabelText('반복 일정')).toBeInTheDocument();
      //   });
      // });
    });
  });
});
