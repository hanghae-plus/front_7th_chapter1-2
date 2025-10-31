import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetEventsState } from '../../__mocks__/handlers';
import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

// Mock 데이터
const mockRecurringEvent: Event = {
  id: 'recurring-event-1',
  title: '주간 회의',
  date: '2025-10-31',
  startTime: '10:00',
  endTime: '11:00',
  description: '팀 주간 회의',
  location: '회의실 A',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-12-31',
    id: 'repeat-weekly-123',
  },
  notificationTime: 10,
};

const mockRecurringEvent2: Event = {
  ...mockRecurringEvent,
  id: 'recurring-event-2',
  date: '2025-10-07',
};

const mockRecurringEvent3: Event = {
  ...mockRecurringEvent,
  id: 'recurring-event-3',
  date: '2025-10-14',
};

// Helper 함수
const renderApp = () => {
  return render(
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  );
};

describe('반복 일정 삭제 기능', () => {
  beforeEach(() => {
    resetEventsState();
    vi.clearAllMocks();
  });

  describe('정상 동작', () => {
    it('사용자가 "예"를 선택하면 해당 일정만 삭제된다', async () => {
      // Given: 반복 일정 3개가 표시된 상태
      const user = userEvent.setup();

      let currentEvents = [mockRecurringEvent, mockRecurringEvent2, mockRecurringEvent3];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: currentEvents,
          });
        }),
        http.delete('/api/events/:id', ({ params }) => {
          currentEvents = currentEvents.filter((e) => e.id !== params.id);
          return new HttpResponse(null, { status: 204 });
        })
      );

      renderApp();

      // 일정 로딩 대기
      await waitFor(() => {
        const eventCards = screen.getAllByText('주간 회의');
        expect(eventCards.length).toBeGreaterThan(0);
      });

      const eventCards = screen.getAllByText('주간 회의');
      expect(eventCards.length).toBeGreaterThanOrEqual(3);

      // When: 첫 번째 일정의 삭제 버튼 클릭 (일정 목록의 버튼만 선택)
      const deleteButtons = screen.getAllByLabelText('Delete event');
      // 일정 목록은 오른쪽에 있고, 각 일정마다 수정/삭제 버튼이 있음
      // 3개 이벤트 * 1개 삭제 버튼 = 최소 3개 (달력에도 표시될 수 있음)
      await user.click(deleteButtons[0]);

      // 다이얼로그 표시 확인
      await waitFor(() => {
        expect(screen.getByTestId('recurring-delete-dialog')).toBeInTheDocument();
      });

      expect(screen.getByText(/해당 일정만 삭제하시겠어요?/)).toBeInTheDocument();

      // "예" 버튼 클릭
      const yesButton = screen.getByTestId('delete-single-button');
      await user.click(yesButton);

      // Then: 단일 삭제 API 호출 및 결과 확인
      await waitFor(() => {
        expect(screen.queryByTestId('recurring-delete-dialog')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('일정이 삭제되었습니다.')).toBeInTheDocument();
      });

      // 나머지 2개 일정은 여전히 존재 (달력 + 목록에 표시되므로 최소 2개)
      await waitFor(() => {
        const remainingEvents = screen.getAllByText('주간 회의');
        expect(remainingEvents.length).toBeGreaterThanOrEqual(2);
        expect(remainingEvents.length).toBeLessThan(6); // 원래 6개였으니 줄어들었는지 확인
      });
    });

    it('사용자가 "아니오"를 선택하면 반복 시리즈 전체가 삭제된다', async () => {
      // Given: 반복 일정 3개가 표시된 상태
      const user = userEvent.setup();

      let currentEvents = [mockRecurringEvent, mockRecurringEvent2, mockRecurringEvent3];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: currentEvents,
          });
        }),
        http.delete('/api/recurring-events/:repeatId', ({ params }) => {
          currentEvents = currentEvents.filter((e) => e.repeat.id !== params.repeatId);
          return new HttpResponse(null, { status: 204 });
        })
      );

      renderApp();

      await waitFor(() => {
        const eventCards = screen.getAllByText('주간 회의');
        expect(eventCards.length).toBeGreaterThan(0);
      });

      const eventCards = screen.getAllByText('주간 회의');
      expect(eventCards.length).toBeGreaterThanOrEqual(3);

      // When: 삭제 버튼 클릭 → "아니오" 선택
      const deleteButtons = screen.getAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('recurring-delete-dialog')).toBeInTheDocument();
      });

      // "아니오" 버튼 클릭 (전체 삭제)
      const noButton = screen.getByTestId('delete-series-button');
      await user.click(noButton);

      // Then: 시리즈 삭제 API 호출 및 결과 확인
      await waitFor(() => {
        expect(screen.queryByTestId('recurring-delete-dialog')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('반복 일정 시리즈가 삭제되었습니다.')).toBeInTheDocument();
      });

      // 모든 반복 일정이 사라짐
      await waitFor(() => {
        expect(screen.queryByText('주간 회의')).not.toBeInTheDocument();
      });
    });

    it('사용자가 "취소"를 선택하면 아무것도 삭제되지 않는다', async () => {
      // Given: 반복 일정 3개가 표시된 상태
      const user = userEvent.setup();

      const currentEvents = [mockRecurringEvent, mockRecurringEvent2, mockRecurringEvent3];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: currentEvents,
          });
        })
      );

      renderApp();

      await waitFor(() => {
        const eventCards = screen.getAllByText('주간 회의');
        expect(eventCards.length).toBeGreaterThan(0);
      });

      const initialCount = screen.getAllByText('주간 회의').length;
      expect(initialCount).toBeGreaterThanOrEqual(3);

      // When: 삭제 버튼 클릭 → "취소" 선택
      const deleteButtons = screen.getAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('recurring-delete-dialog')).toBeInTheDocument();
      });

      // "취소" 버튼 클릭
      const cancelButton = screen.getByTestId('cancel-delete-button');
      await user.click(cancelButton);

      // Then: 다이얼로그만 닫히고 일정은 유지
      await waitFor(() => {
        expect(screen.queryByTestId('recurring-delete-dialog')).not.toBeInTheDocument();
      });

      // Snackbar 표시 없음
      expect(screen.queryByText('일정이 삭제되었습니다.')).not.toBeInTheDocument();
      expect(screen.queryByText('반복 일정 시리즈가 삭제되었습니다.')).not.toBeInTheDocument();

      // 모든 일정이 여전히 존재
      const finalCount = screen.getAllByText('주간 회의').length;
      expect(finalCount).toBe(initialCount); // 변화 없음
    });
  });

  describe('에러 처리', () => {
    it('단일 삭제 API 에러 시 에러 메시지를 표시한다', async () => {
      // Given: 반복 일정이 표시된 상태
      const user = userEvent.setup();

      const currentEvents = [mockRecurringEvent];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: currentEvents,
          });
        }),
        // 삭제 API를 500 에러로 오버라이드
        http.delete('/api/events/:id', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      renderApp();

      await waitFor(() => {
        const eventCards = screen.getAllByText('주간 회의');
        expect(eventCards.length).toBeGreaterThan(0);
      });

      // When: 삭제 버튼 클릭 → "예" 선택
      const deleteButtons = screen.getAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('recurring-delete-dialog')).toBeInTheDocument();
      });

      const yesButton = screen.getByTestId('delete-single-button');
      await user.click(yesButton);

      // Then: 에러 메시지 표시
      await waitFor(() => {
        expect(screen.getByText('일정 삭제 실패')).toBeInTheDocument();
      });

      // 다이얼로그는 닫힘
      await waitFor(() => {
        expect(screen.queryByTestId('recurring-delete-dialog')).not.toBeInTheDocument();
      });

      // 일정은 여전히 존재 (삭제 실패)
      expect(screen.getAllByText('주간 회의').length).toBeGreaterThan(0);
    });

    it('시리즈 삭제 API 404 에러 시 에러 메시지를 표시한다', async () => {
      // Given: 반복 일정이 표시된 상태
      const user = userEvent.setup();

      const currentEvents = [mockRecurringEvent];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: currentEvents,
          });
        }),
        // 시리즈 삭제 API를 404 에러로 오버라이드
        http.delete('/api/recurring-events/:repeatId', () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      renderApp();

      await waitFor(() => {
        const eventCards = screen.getAllByText('주간 회의');
        expect(eventCards.length).toBeGreaterThan(0);
      });

      // When: 삭제 버튼 클릭 → "아니오" 선택
      const deleteButtons = screen.getAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('recurring-delete-dialog')).toBeInTheDocument();
      });

      const noButton = screen.getByTestId('delete-series-button');
      await user.click(noButton);

      // Then: 에러 메시지 표시
      await waitFor(() => {
        expect(screen.getByText('반복 일정 시리즈를 찾을 수 없습니다.')).toBeInTheDocument();
      });

      // 다이얼로그는 닫힘
      await waitFor(() => {
        expect(screen.queryByTestId('recurring-delete-dialog')).not.toBeInTheDocument();
      });

      // 일정은 여전히 존재 (삭제 실패)
      expect(screen.getAllByText('주간 회의').length).toBeGreaterThan(0);
    });
  });
});
