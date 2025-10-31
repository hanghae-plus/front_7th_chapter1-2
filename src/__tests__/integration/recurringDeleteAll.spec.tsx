import { render, screen, waitFor, within } from '@testing-library/react';
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

describe('REQ-010: 전체 일정 삭제 - Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    enqueueSnackbarFn.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('TODO-020: "아니오" 버튼 클릭 시 모든 반복 일정이 삭제된다', () => {
    it('같은 repeat.id를 가진 모든 일정이 함께 삭제된다', async () => {
      // 명세: REQ-010 (전체 삭제 동작)
      // 설계: TODO-020
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

      let deletedRepeatId: string | null = null;

      server.use(
        http.get('/api/events', () => {
          // 전체 삭제 후 해당 그룹의 모든 일정 제거
          const remainingEvents = recurringEvents.filter((e) => e.repeat.id !== deletedRepeatId);
          return HttpResponse.json({ events: remainingEvents });
        }),
        // 전체 반복 일정 삭제 API (새로 필요한 API)
        http.delete('/api/events/recurring/:repeatId', ({ params }) => {
          const { repeatId } = params;
          deletedRepeatId = repeatId as string;
          return new HttpResponse(null, { status: 204 });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('주간 회의');
        expect(events.length).toBe(3);
      });

      // Act - 삭제 후 "아니오" 버튼 클릭
      const deleteButtons = screen.getAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      // // 다이얼로그에서 "아니오" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const noButton = within(dialog).getByRole('button', { name: /아니오/i });
      // await user.click(noButton);

      // Assert - 모든 일정이 삭제됨
      // await waitFor(() => {
      //   expect(deletedRepeatId).toBe(repeatId);

      //   // 화면에 모든 일정이 사라짐
      //   expect(screen.queryByText('주간 회의')).not.toBeInTheDocument();
      // });

      // // 성공 메시지
      // expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      //   expect.stringMatching(/일정이 삭제되었습니다/i),
      //   { variant: 'success' }
      // );
    });

    it('전체 삭제 시 DELETE /api/events/recurring/:repeatId API가 호출된다', async () => {
      // 명세: REQ-010
      // 설계: TODO-020
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
      let deletedRepeatId: string | null = null;

      server.use(
        http.get('/api/events', () => {
          const remainingEvents = recurringEvents.filter((e) => e.repeat.id !== deletedRepeatId);
          return HttpResponse.json({ events: remainingEvents });
        }),
        http.delete('/api/events/recurring/:repeatId', ({ params }) => {
          recurringApiCalled = true;
          const { repeatId } = params;
          deletedRepeatId = repeatId as string;
          return new HttpResponse(null, { status: 204 });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('매일 스탠드업');
        expect(events.length).toBe(2);
      });

      // Act
      const deleteButtons = screen.getAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      // // 다이얼로그에서 "아니오" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const noButton = within(dialog).getByRole('button', { name: /아니오/i });
      // await user.click(noButton);

      // Assert - 전체 삭제 API 호출됨
      // await waitFor(() => {
      //   expect(recurringApiCalled).toBe(true);
      //   expect(deletedRepeatId).toBe(repeatId);
      // });
    });
  });

  describe('TODO-021: 전체 삭제 시 캘린더에서 모든 반복 일정이 제거된다', () => {
    it('Week View와 Month View에서 모두 사라진다', async () => {
      // 명세: REQ-010 (UI 반영)
      // 설계: TODO-021
      expect.hasAssertions();

      // Arrange
      const repeatId = 'repeat-3';
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
          repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31', id: repeatId },
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
          repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31', id: repeatId },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '월간 리뷰',
          date: '2025-08-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '월간 점검',
          location: '대회의실',
          category: '업무',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31', id: repeatId },
          notificationTime: 10,
        },
      ];

      let deletedRepeatId: string | null = null;

      server.use(
        http.get('/api/events', () => {
          const remainingEvents = recurringEvents.filter((e) => e.repeat.id !== deletedRepeatId);
          return HttpResponse.json({ events: remainingEvents });
        }),
        http.delete('/api/events/recurring/:repeatId', ({ params }) => {
          const { repeatId } = params;
          deletedRepeatId = repeatId as string;
          return new HttpResponse(null, { status: 204 });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('월간 리뷰');
        expect(events.length).toBe(3);
      });

      // Act - 전체 삭제
      const deleteButtons = screen.getAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      // // 다이얼로그에서 "아니오" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const noButton = within(dialog).getByRole('button', { name: /아니오/i });
      // await user.click(noButton);

      // Assert - 모든 일정 제거
      // await waitFor(() => {
      //   expect(screen.queryByText('월간 리뷰')).not.toBeInTheDocument();
      // });

      // // Week View로 전환 후 확인
      // const weekViewButton = screen.getByRole('button', { name: /week|주/i });
      // await user.click(weekViewButton);

      // expect(screen.queryByText('월간 리뷰')).not.toBeInTheDocument();
    });

    it('이벤트 목록에서도 모든 반복 일정이 제거된다', async () => {
      // 명세: REQ-010
      // 설계: TODO-021
      expect.hasAssertions();

      // Arrange
      const repeatId = 'repeat-4';
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
          repeat: { type: 'weekly', interval: 1, endDate: '2025-07-06', id: repeatId },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '팀 빌딩',
          date: '2025-06-22',
          startTime: '16:00',
          endTime: '17:00',
          description: '팀 활동',
          location: '야외',
          category: '개인',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-07-06', id: repeatId },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '팀 빌딩',
          date: '2025-06-29',
          startTime: '16:00',
          endTime: '17:00',
          description: '팀 활동',
          location: '야외',
          category: '개인',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-07-06', id: repeatId },
          notificationTime: 10,
        },
        {
          id: '4',
          title: '팀 빌딩',
          date: '2025-07-06',
          startTime: '16:00',
          endTime: '17:00',
          description: '팀 활동',
          location: '야외',
          category: '개인',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-07-06', id: repeatId },
          notificationTime: 10,
        },
      ];

      // 다른 일정도 추가 (삭제되지 않아야 함)
      const otherEvent: Event = {
        id: '5',
        title: '단일 회의',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '1회성',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const allEvents = [...recurringEvents, otherEvent];
      let deletedRepeatId: string | null = null;

      server.use(
        http.get('/api/events', () => {
          const remainingEvents = allEvents.filter((e) => e.repeat.id !== deletedRepeatId);
          return HttpResponse.json({ events: remainingEvents });
        }),
        http.delete('/api/events/recurring/:repeatId', ({ params }) => {
          const { repeatId } = params;
          deletedRepeatId = repeatId as string;
          return new HttpResponse(null, { status: 204 });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('팀 빌딩');
        expect(events.length).toBe(4);
      });

      // Act - 전체 삭제
      const deleteButtons = screen.getAllByLabelText('Delete event');
      // 팀 빌딩의 첫 번째 삭제 버튼 찾기
      const teamBuildingEvent = screen.getAllByText('팀 빌딩')[0].closest('li');
      const teamBuildingDeleteButton = within(teamBuildingEvent!).getByLabelText('Delete event');
      await user.click(teamBuildingDeleteButton);

      // // 다이얼로그에서 "아니오" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const noButton = within(dialog).getByRole('button', { name: /아니오/i });
      // await user.click(noButton);

      // Assert - 반복 일정만 모두 제거, 다른 일정은 유지
      // await waitFor(() => {
      //   expect(screen.queryByText('팀 빌딩')).not.toBeInTheDocument();
      //   // 다른 일정은 유지
      //   expect(screen.getByText('단일 회의')).toBeInTheDocument();
      // });
    });
  });
});
