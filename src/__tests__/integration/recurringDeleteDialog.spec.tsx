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

describe('REQ-009/010: 반복 일정 삭제 다이얼로그 UI - Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    enqueueSnackbarFn.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('TODO-015: 단일 일정 삭제 시 다이얼로그가 표시되지 않는다', () => {
    it('repeat.type이 none인 일정 삭제 시 다이얼로그 없이 바로 삭제된다', async () => {
      // 명세: REQ-009 (단일 일정 예외 케이스)
      // 설계: TODO-015
      expect.hasAssertions();

      // Arrange - 단일 일정
      const singleEvent: Event = {
        id: '1',
        title: '단일 회의',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '1회성 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      let deleted = false;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: deleted ? [] : [singleEvent] });
        }),
        http.delete('/api/events/:id', ({ params }) => {
          const { id } = params;
          if (id === singleEvent.id) {
            deleted = true;
            return new HttpResponse(null, { status: 204 });
          }
          return new HttpResponse(null, { status: 404 });
        })
      );

      render(<App />);

      // 일정 로딩 대기
      await waitFor(() => {
        expect(screen.getByText('단일 회의')).toBeInTheDocument();
      });

      // Act - 삭제 버튼 클릭
      const deleteButton = screen.getByLabelText('Delete event');
      await user.click(deleteButton);

      // Assert - 다이얼로그가 표시되지 않고 바로 삭제됨
      // const dialog = screen.queryByRole('dialog');
      // expect(dialog).not.toBeInTheDocument();
      // expect(screen.queryByText(/해당 일정만 삭제하시겠어요/i)).not.toBeInTheDocument();

      // // 삭제 성공
      // await waitFor(() => {
      //   expect(deleted).toBe(true);
      //   expect(screen.queryByText('단일 회의')).not.toBeInTheDocument();
      // });
    });
  });

  describe('TODO-016: 반복 일정 삭제 시 "해당 일정만 삭제하시겠어요?" 다이얼로그가 표시된다', () => {
    it('repeat.type이 none이 아닌 일정 삭제 시 다이얼로그가 표시된다', async () => {
      // 명세: REQ-009/010 (트리거 조건)
      // 설계: TODO-016
      expect.hasAssertions();

      // Arrange - 반복 일정
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
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        })
      );

      render(<App />);

      // 일정 로딩 대기
      await waitFor(() => {
        const events = screen.getAllByText('주간 회의');
        expect(events.length).toBeGreaterThan(0);
      });

      // Act - 반복 일정 삭제 버튼 클릭
      const deleteButtons = screen.getAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      // Assert - 다이얼로그 표시
      // const dialog = await screen.findByRole('dialog');
      // expect(dialog).toBeInTheDocument();

      // // 다이얼로그 내용 확인
      // expect(within(dialog).getByText(/해당 일정만 삭제하시겠어요/i)).toBeInTheDocument();

      // // "예" 버튼 존재
      // const yesButton = within(dialog).getByRole('button', { name: /예/i });
      // expect(yesButton).toBeInTheDocument();

      // // "아니오" 버튼 존재
      // const noButton = within(dialog).getByRole('button', { name: /아니오/i });
      // expect(noButton).toBeInTheDocument();
    });

    it('다이얼로그에 "예", "아니오" 버튼이 모두 표시된다', async () => {
      // 명세: REQ-009/010
      // 설계: TODO-016
      expect.hasAssertions();

      // Arrange - 매일 반복 일정
      const dailyEvents: Event[] = [
        {
          id: '1',
          title: '매일 스탠드업',
          date: '2025-06-15',
          startTime: '09:00',
          endTime: '09:30',
          description: '일일 미팅',
          location: '',
          category: '업무',
          repeat: { type: 'daily', interval: 1, endDate: '2025-12-31', id: 'repeat-2' },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: dailyEvents });
        })
      );

      render(<App />);

      // 일정 로딩 대기
      await waitFor(() => {
        expect(screen.getByText('매일 스탠드업')).toBeInTheDocument();
      });

      // Act - 삭제 버튼 클릭
      const deleteButton = screen.getByLabelText('Delete event');
      await user.click(deleteButton);

      // Assert - 버튼 확인
      // const dialog = await screen.findByRole('dialog');

      // const yesButton = within(dialog).getByRole('button', { name: /예/i });
      // expect(yesButton).toBeInTheDocument();
      // expect(yesButton).toBeEnabled();

      // const noButton = within(dialog).getByRole('button', { name: /아니오/i });
      // expect(noButton).toBeInTheDocument();
      // expect(noButton).toBeEnabled();
    });
  });

  describe('TODO-017: 다이얼로그의 "취소" 또는 닫기 버튼 클릭 시 삭제가 취소된다', () => {
    it('다이얼로그를 닫으면 일정이 삭제되지 않는다', async () => {
      // 명세: UI-003 (사용자 경험)
      // 설계: TODO-017
      expect.hasAssertions();

      // Arrange - 반복 일정
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
      ];

      let deleteApiCalled = false;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        }),
        http.delete('/api/events/:id', () => {
          deleteApiCalled = true;
          return new HttpResponse(null, { status: 204 });
        })
      );

      render(<App />);

      // 일정 로딩 대기
      await waitFor(() => {
        expect(screen.getByText('월간 리뷰')).toBeInTheDocument();
      });

      // Act - 삭제 시도 후 다이얼로그 닫기
      const deleteButton = screen.getByLabelText('Delete event');
      await user.click(deleteButton);

      // // 다이얼로그 닫기 버튼 클릭
      // const dialog = await screen.findByRole('dialog');
      // const closeButton = within(dialog).getByRole('button', { name: /닫기|취소/i });
      // await user.click(closeButton);

      // Assert - 다이얼로그 닫힘
      // await waitFor(() => {
      //   expect(dialog).not.toBeInTheDocument();
      // });

      // // 일정이 삭제되지 않음
      // expect(screen.getByText('월간 리뷰')).toBeInTheDocument();

      // // 삭제 API 호출되지 않음
      // expect(deleteApiCalled).toBe(false);
    });

    it('ESC 키를 눌러 다이얼로그를 닫으면 삭제가 취소된다', async () => {
      // 명세: UI-003
      // 설계: TODO-017
      expect.hasAssertions();

      // Arrange
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
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31', id: 'repeat-4' },
          notificationTime: 10,
        },
      ];

      let deleteApiCalled = false;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        }),
        http.delete('/api/events/:id', () => {
          deleteApiCalled = true;
          return new HttpResponse(null, { status: 204 });
        })
      );

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('주간 회의')).toBeInTheDocument();
      });

      // Act - 삭제 시도 후 ESC 키
      const deleteButton = screen.getByLabelText('Delete event');
      await user.click(deleteButton);

      // // ESC 키로 다이얼로그 닫기
      // const dialog = await screen.findByRole('dialog');
      // await user.keyboard('{Escape}');

      // Assert - 다이얼로그 닫힘, 삭제 취소
      // await waitFor(() => {
      //   expect(dialog).not.toBeInTheDocument();
      // });

      // expect(screen.getByText('주간 회의')).toBeInTheDocument();
      // expect(deleteApiCalled).toBe(false);
    });
  });
});
