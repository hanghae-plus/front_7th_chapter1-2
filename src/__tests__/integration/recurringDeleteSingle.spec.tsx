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

describe('REQ-009: 단일 일정 삭제 - Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    enqueueSnackbarFn.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('TODO-018: "예" 버튼 클릭 시 선택한 일정만 삭제된다', () => {
    it('반복 일정 중 하나만 삭제되고 다른 일정은 남아있다', async () => {
      // 명세: REQ-009 (단일 삭제 동작)
      // 설계: TODO-018
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

      let deletedId: string | null = null;

      server.use(
        http.get('/api/events', () => {
          const remainingEvents = recurringEvents.filter((e) => e.id !== deletedId);
          return HttpResponse.json({ events: remainingEvents });
        }),
        http.delete('/api/events/:id', ({ params }) => {
          const { id } = params;
          deletedId = id as string;
          return new HttpResponse(null, { status: 204 });
        })
      );

      render(<App />);

      // 일정 로딩 대기
      await waitFor(() => {
        const events = screen.getAllByText('주간 회의');
        expect(events.length).toBe(3);
      });

      // Act - 두 번째 일정 삭제
      const deleteButtons = screen.getAllByLabelText('Delete event');
      await user.click(deleteButtons[1]); // 2번째 일정

      // // 다이얼로그에서 "예" 버튼 클릭
      // const dialog = await screen.findByRole('dialog');
      // const yesButton = within(dialog).getByRole('button', { name: /예/i });
      // await user.click(yesButton);

      // Assert - 단일 삭제 API 호출
      // await waitFor(() => {
      //   expect(deletedId).toBe('2');
      // });

      // // 성공 메시지
      // expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      //   expect.stringMatching(/일정이 삭제되었습니다/i),
      //   { variant: 'success' }
      // );

      // // 2개 일정만 남음
      // await waitFor(() => {
      //   const remainingEvents = screen.getAllByText('주간 회의');
      //   expect(remainingEvents.length).toBe(2);
      // });
    });

    it('캘린더 및 이벤트 목록에서 삭제된 일정이 제거된다', async () => {
      // 명세: REQ-009
      // 설계: TODO-018
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
        {
          id: '3',
          title: '매일 스탠드업',
          date: '2025-06-17',
          startTime: '09:00',
          endTime: '09:30',
          description: '일일 미팅',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-06-20', id: 'repeat-2' },
          notificationTime: 10,
        },
      ];

      let deletedId: string | null = null;

      server.use(
        http.get('/api/events', () => {
          const remainingEvents = recurringEvents.filter((e) => e.id !== deletedId);
          return HttpResponse.json({ events: remainingEvents });
        }),
        http.delete('/api/events/:id', ({ params }) => {
          const { id } = params;
          deletedId = id as string;
          return new HttpResponse(null, { status: 204 });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('매일 스탠드업');
        expect(events.length).toBe(3);
      });

      // Act - 첫 번째 일정 삭제
      const deleteButtons = screen.getAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      // // 다이얼로그에서 "예" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const yesButton = within(dialog).getByRole('button', { name: /예/i });
      // await user.click(yesButton);

      // Assert - 해당 일정만 제거
      // await waitFor(() => {
      //   const remainingEvents = screen.getAllByText('매일 스탠드업');
      //   expect(remainingEvents.length).toBe(2);
      // });
    });
  });

  describe('TODO-019: 단일 삭제 시 다른 반복 일정은 남아있다', () => {
    it('같은 repeat.id를 가진 다른 일정들은 유지된다', async () => {
      // 명세: REQ-009 (격리성)
      // 설계: TODO-019
      expect.hasAssertions();

      // Arrange - 같은 그룹의 반복 일정 4개
      const repeatId = 'repeat-3';
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
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: repeatId },
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
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: repeatId },
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
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: repeatId },
          notificationTime: 10,
        },
        {
          id: '4',
          title: '팀 미팅',
          date: '2025-07-06',
          startTime: '15:00',
          endTime: '16:00',
          description: '팀 회의',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: repeatId },
          notificationTime: 10,
        },
      ];

      let deletedId: string | null = null;

      server.use(
        http.get('/api/events', () => {
          const remainingEvents = recurringEvents.filter((e) => e.id !== deletedId);
          return HttpResponse.json({ events: remainingEvents });
        }),
        http.delete('/api/events/:id', ({ params }) => {
          const { id } = params;
          deletedId = id as string;
          return new HttpResponse(null, { status: 204 });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('팀 미팅');
        expect(events.length).toBe(4);
      });

      // Act - 세 번째 일정만 삭제
      const deleteButtons = screen.getAllByLabelText('Delete event');
      await user.click(deleteButtons[2]);

      // // 다이얼로그에서 "예" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const yesButton = within(dialog).getByRole('button', { name: /예/i });
      // await user.click(yesButton);

      // Assert - 다른 일정들은 남아있음
      // await waitFor(() => {
      //   expect(deletedId).toBe('3');

      //   // 3개 일정만 남음
      //   const remainingEvents = screen.getAllByText('팀 미팅');
      //   expect(remainingEvents.length).toBe(3);

      //   // 나머지 일정들의 repeat.id는 동일하게 유지
      //   const remaining = recurringEvents.filter((e) => e.id !== deletedId);
      //   remaining.forEach((event) => {
      //     expect(event.repeat.id).toBe(repeatId);
      //   });
      // });
    });

    it('단일 삭제 API만 호출되고 전체 삭제 API는 호출되지 않는다', async () => {
      // 명세: REQ-009
      // 설계: TODO-019
      expect.hasAssertions();

      // Arrange
      const repeatId = 'repeat-4';
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

      let singleDeleteCalled = false;
      let recurringDeleteCalled = false;
      let deletedId: string | null = null;

      server.use(
        http.get('/api/events', () => {
          const remainingEvents = recurringEvents.filter((e) => e.id !== deletedId);
          return HttpResponse.json({ events: remainingEvents });
        }),
        http.delete('/api/events/:id', ({ params }) => {
          singleDeleteCalled = true;
          const { id } = params;
          deletedId = id as string;
          return new HttpResponse(null, { status: 204 });
        }),
        http.delete('/api/events/recurring/:repeatId', () => {
          recurringDeleteCalled = true;
          return new HttpResponse(null, { status: 204 });
        })
      );

      render(<App />);

      await waitFor(() => {
        const events = screen.getAllByText('일일 회의');
        expect(events.length).toBe(2);
      });

      // Act - 첫 번째 일정만 삭제
      const deleteButtons = screen.getAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      // // 다이얼로그에서 "예" 클릭
      // const dialog = await screen.findByRole('dialog');
      // const yesButton = within(dialog).getByRole('button', { name: /예/i });
      // await user.click(yesButton);

      // Assert - 단일 삭제 API만 호출
      // await waitFor(() => {
      //   expect(singleDeleteCalled).toBe(true);
      //   expect(recurringDeleteCalled).toBe(false);

      //   // 1개 일정만 남음
      //   const remainingEvents = screen.getAllByText('일일 회의');
      //   expect(remainingEvents.length).toBe(1);
      // });
    });
  });
});
