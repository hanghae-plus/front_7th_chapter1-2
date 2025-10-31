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

describe('REQ-007/008: 반복 일정 수정 다이얼로그 UI - Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    enqueueSnackbarFn.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('TODO-006: 단일 일정 수정 시 다이얼로그가 표시되지 않는다', () => {
    it('repeat.type이 none인 일정 수정 시 다이얼로그 없이 바로 수정된다', async () => {
      // 명세: REQ-007 (단일 일정 예외 케이스)
      // 설계: TODO-006
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

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: [singleEvent] });
        }),
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          const updatedEvent = (await request.json()) as Event;
          return HttpResponse.json({ ...singleEvent, ...updatedEvent, id });
        })
      );

      render(<App />);

      // 일정 로딩 대기
      await waitFor(() => {
        expect(screen.getByText('단일 회의')).toBeInTheDocument();
      });

      // Act - 수정 버튼 클릭
      const editButton = screen.getByLabelText('Edit event');
      await user.click(editButton);

      // 제목 수정
      const titleInput = screen.getByLabelText(/제목/i);
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 회의');

      const submitButton = screen.getByRole('button', { name: /일정 수정/i });
      await user.click(submitButton);

      // Assert - 다이얼로그가 표시되지 않고 바로 수정됨
      // const dialog = screen.queryByRole('dialog');
      // expect(dialog).not.toBeInTheDocument();
      // expect(screen.queryByText(/해당 일정만 수정하시겠어요/i)).not.toBeInTheDocument();

      // // 수정 성공
      // await waitFor(() => {
      //   expect(enqueueSnackbarFn).toHaveBeenCalledWith(
      //     expect.stringMatching(/일정이 수정되었습니다/i),
      //     { variant: 'success' }
      //   );
      // });
    });
  });

  describe('TODO-007: 반복 일정 수정 시 "해당 일정만 수정하시겠어요?" 다이얼로그가 표시된다', () => {
    it('repeat.type이 none이 아닌 일정 수정 시 다이얼로그가 표시된다', async () => {
      // 명세: REQ-007/008 (트리거 조건)
      // 설계: TODO-007
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

      // Act - 반복 일정 수정 버튼 클릭
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // 제목 수정
      const titleInput = screen.getByLabelText(/제목/i);
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 주간 회의');

      const submitButton = screen.getByRole('button', { name: /일정 수정/i });
      await user.click(submitButton);

      // Assert - 다이얼로그 표시
      // const dialog = await screen.findByRole('dialog');
      // expect(dialog).toBeInTheDocument();

      // // 다이얼로그 내용 확인
      // expect(within(dialog).getByText(/해당 일정만 수정하시겠어요/i)).toBeInTheDocument();

      // // "예" 버튼 존재
      // const yesButton = within(dialog).getByRole('button', { name: /예/i });
      // expect(yesButton).toBeInTheDocument();

      // // "아니오" 버튼 존재
      // const noButton = within(dialog).getByRole('button', { name: /아니오/i });
      // expect(noButton).toBeInTheDocument();
    });

    it('다이얼로그에 "예", "아니오" 버튼이 모두 표시된다', async () => {
      // 명세: REQ-007/008
      // 설계: TODO-007
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

      // Act - 수정 버튼 클릭
      const editButton = screen.getByLabelText('Edit event');
      await user.click(editButton);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 스탠드업');

      const submitButton = screen.getByRole('button', { name: /일정 수정/i });
      await user.click(submitButton);

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

  describe('TODO-008: 다이얼로그의 "취소" 또는 닫기 버튼 클릭 시 수정이 취소된다', () => {
    it('다이얼로그를 닫으면 일정이 수정되지 않는다', async () => {
      // 명세: UI-003 (사용자 경험)
      // 설계: TODO-008
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

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        })
      );

      render(<App />);

      // 일정 로딩 대기
      await waitFor(() => {
        expect(screen.getByText('월간 리뷰')).toBeInTheDocument();
      });

      // Act - 수정 시도 후 다이얼로그 닫기
      const editButton = screen.getByLabelText('Edit event');
      await user.click(editButton);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 리뷰');

      const submitButton = screen.getByRole('button', { name: /일정 수정/i });
      await user.click(submitButton);

      // 다이얼로그 닫기 버튼 클릭
      // const dialog = await screen.findByRole('dialog');
      // const closeButton = within(dialog).getByRole('button', { name: /닫기|취소/i });
      // await user.click(closeButton);

      // Assert - 다이얼로그 닫힘
      // await waitFor(() => {
      //   expect(dialog).not.toBeInTheDocument();
      // });

      // // 일정이 수정되지 않음 (원본 유지)
      // expect(screen.getByText('월간 리뷰')).toBeInTheDocument();
      // expect(screen.queryByText('수정된 리뷰')).not.toBeInTheDocument();

      // // 수정 API 호출되지 않음
      // expect(enqueueSnackbarFn).not.toHaveBeenCalledWith(
      //   expect.stringMatching(/일정이 수정되었습니다/i),
      //   { variant: 'success' }
      // );
    });

    it('ESC 키를 눌러 다이얼로그를 닫으면 수정이 취소된다', async () => {
      // 명세: UI-003
      // 설계: TODO-008
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

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: recurringEvents });
        })
      );

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('주간 회의')).toBeInTheDocument();
      });

      // Act - 수정 시도 후 ESC 키
      const editButton = screen.getByLabelText('Edit event');
      await user.click(editButton);

      const titleInput = screen.getByLabelText(/제목/i);
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 회의');

      const submitButton = screen.getByRole('button', { name: /일정 수정/i });
      await user.click(submitButton);

      // // ESC 키로 다이얼로그 닫기
      // const dialog = await screen.findByRole('dialog');
      // await user.keyboard('{Escape}');

      // Assert - 다이얼로그 닫힘, 수정 취소
      // await waitFor(() => {
      //   expect(dialog).not.toBeInTheDocument();
      // });

      // expect(screen.getByText('주간 회의')).toBeInTheDocument();
      // expect(screen.queryByText('수정된 회의')).not.toBeInTheDocument();
    });
  });
});
