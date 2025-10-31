import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

/**
 * REQ-005: 반복 일정 시각적 표시
 *
 * 테스트 범위: Integration Tests - Views (TODO-007 ~ TODO-008)
 * - Phase 3: 캘린더 뷰별 검증 (월간/주간 뷰)
 */

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

describe.skip('REQ-005: 반복 일정 시각적 표시 - Integration Tests (Views)', () => {
  let user: ReturnType<typeof userEvent.setup>;

  const dailyRecurringEvent: Event = {
    id: '1',
    title: '매일 운동',
    date: '2025-06-15',
    startTime: '07:00',
    endTime: '08:00',
    description: '아침 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'daily', interval: 1, endDate: '2025-12-31' },
    notificationTime: 10,
  };

  const nonRecurringEvent: Event = {
    id: '2',
    title: '단일 회의',
    date: '2025-06-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '1회성 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  };

  beforeEach(() => {
    user = userEvent.setup();
    enqueueSnackbarFn.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Phase 3: 캘린더 뷰별 검증', () => {
    it('TODO-007: 월간 뷰에서 반복 일정 아이콘이 표시된다', async () => {
      // 명세: REQ-005
      // 설계: TODO-007
      expect.hasAssertions();

      // Arrange - Mock 데이터 설정
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [dailyRecurringEvent, nonRecurringEvent],
          });
        })
      );

      // Act - 앱 렌더링 및 월간 뷰 전환
      render(<App />);

      // 월간 뷰로 전환
      const viewSelect = screen.getByLabelText('뷰 타입 선택');
      await user.click(viewSelect);
      const monthOption = screen.getByLabelText('month-option');
      await user.click(monthOption);

      // Assert
      await waitFor(() => {
        const monthView = screen.getByTestId('month-view');
        expect(monthView).toBeInTheDocument();
      });

      const monthView = screen.getByTestId('month-view');
      const recurringIcon = within(monthView).getByLabelText('반복 일정');
      expect(recurringIcon).toBeInTheDocument();
      expect(within(monthView).getByText(/매일 운동/)).toBeInTheDocument();
    });

    it('TODO-008: 주간 뷰에서 반복 일정 아이콘이 표시된다', async () => {
      // 명세: REQ-005
      // 설계: TODO-008
      expect.hasAssertions();

      // Arrange - Mock 데이터 설정
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [dailyRecurringEvent, nonRecurringEvent],
          });
        })
      );

      // Act - 앱 렌더링 및 주간 뷰 전환
      render(<App />);

      // 주간 뷰로 전환
      const viewSelect = screen.getByLabelText('뷰 타입 선택');
      await user.click(viewSelect);
      const weekOption = screen.getByLabelText('week-option');
      await user.click(weekOption);

      // Assert
      await waitFor(() => {
        const weekView = screen.getByTestId('week-view');
        expect(weekView).toBeInTheDocument();
      });

      const weekView = screen.getByTestId('week-view');
      const recurringIcon = within(weekView).getByLabelText('반복 일정');
      expect(recurringIcon).toBeInTheDocument();
      expect(within(weekView).getByText(/매일 운동/)).toBeInTheDocument();
    });
  });
});
