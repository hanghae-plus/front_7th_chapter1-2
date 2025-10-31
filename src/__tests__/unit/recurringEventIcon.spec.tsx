import { render, screen, within, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

/**
 * REQ-005: 반복 일정 시각적 표시
 *
 * 테스트 범위: Unit Tests (TODO-001 ~ TODO-008)
 * - Phase 1: Happy Path (반복 유형별 아이콘 표시) - TODO-001 ~ TODO-005
 * - Phase 2: 접근성 검증 - TODO-006
 * - Phase 3: 종료일 검증 - TODO-008
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

describe.skip('REQ-005: 반복 일정 시각적 표시 - Unit Tests', () => {
  const today = new Date().toISOString().split('T')[0]; // 현재 날짜
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1); // 1년 후
  const futureEndDate = futureDate.toISOString().split('T')[0];

  const testEvents = {
    daily: {
      id: '1',
      title: '매일 운동',
      date: today,
      startTime: '07:00',
      endTime: '08:00',
      description: '아침 운동',
      location: '헬스장',
      category: '개인',
      repeat: { type: 'daily' as const, interval: 1, endDate: futureEndDate },
      notificationTime: 10,
    },
    weekly: {
      id: '2',
      title: '주간 회의',
      date: today,
      startTime: '14:00',
      endTime: '15:00',
      description: '주간 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly' as const, interval: 1, endDate: futureEndDate },
      notificationTime: 10,
    },
    monthly: {
      id: '3',
      title: '월간 리뷰',
      date: today,
      startTime: '10:00',
      endTime: '11:00',
      description: '월간 점검',
      location: '대회의실',
      category: '업무',
      repeat: { type: 'monthly' as const, interval: 1, endDate: futureEndDate },
      notificationTime: 10,
    },
    yearly: {
      id: '4',
      title: '생일',
      date: today,
      startTime: '00:00',
      endTime: '23:59',
      description: '생일 축하',
      location: '',
      category: '개인',
      repeat: { type: 'yearly' as const, interval: 1, endDate: futureEndDate },
      notificationTime: 1440,
    },
    none: {
      id: '5',
      title: '단일 회의',
      date: today,
      startTime: '10:00',
      endTime: '11:00',
      description: '1회성 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as const, interval: 1 },
      notificationTime: 10,
    },
  };

  beforeEach(() => {
    // 테스트 간 독립성 확보
    enqueueSnackbarFn.mockClear();

    // MSW handler 설정 - 테스트 데이터 반환
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: Object.values(testEvents),
        });
      })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Phase 1: Happy Path (반복 유형별 아이콘 표시)', () => {
    it('TODO-001: 매일 반복 일정은 제목 옆에 반복 아이콘(🔁)을 표시한다', async () => {
      // 명세: REQ-005
      // 설계: TODO-001
      expect.hasAssertions();

      // Arrange
      // Act
      render(<App />);

      // Assert
      const eventList = await screen.findByTestId('event-list');

      await waitFor(
        () => {
          const dailyEventTitle = within(eventList).getByText(/매일 운동/);
          expect(dailyEventTitle).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const icon = within(eventList).getByLabelText('반복 일정');
      expect(icon).toBeInTheDocument();

      const dailyEventTitle = within(eventList).getByText(/매일 운동/);
      expect(dailyEventTitle.textContent).toContain('🔁');
    });

    it('TODO-002: 매주 반복 일정은 제목 옆에 반복 아이콘(🔁)을 표시한다', async () => {
      // 명세: REQ-005
      // 설계: TODO-002
      expect.hasAssertions();

      // Arrange
      // Act
      render(<App />);

      // Assert
      const eventList = await screen.findByTestId('event-list');

      await waitFor(
        () => {
          const weeklyEvent = within(eventList).getByText(/주간 회의/);
          expect(weeklyEvent).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(within(eventList).getByLabelText('반복 일정')).toBeInTheDocument();
    });

    it('TODO-003: 매월 반복 일정은 제목 옆에 반복 아이콘(🔁)을 표시한다', async () => {
      // 명세: REQ-005
      // 설계: TODO-003
      expect.hasAssertions();

      // Arrange
      // Act
      render(<App />);

      // Assert
      const eventList = await screen.findByTestId('event-list');

      await waitFor(
        () => {
          const monthlyEvent = within(eventList).getByText(/월간 리뷰/);
          expect(monthlyEvent).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(within(eventList).getByLabelText('반복 일정')).toBeInTheDocument();
    });

    it('TODO-004: 매년 반복 일정은 제목 옆에 반복 아이콘(🔁)을 표시한다', async () => {
      // 명세: REQ-005
      // 설계: TODO-004
      expect.hasAssertions();

      // Arrange
      // Act
      render(<App />);

      // Assert
      const eventList = await screen.findByTestId('event-list');

      await waitFor(
        () => {
          const yearlyEvent = within(eventList).getByText(/생일/);
          expect(yearlyEvent).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(within(eventList).getByLabelText('반복 일정')).toBeInTheDocument();
    });

    it('TODO-005: 단일 일정(반복 안 함)은 반복 아이콘을 표시하지 않는다', async () => {
      // 명세: REQ-005
      // 설계: TODO-005
      expect.hasAssertions();

      // Arrange
      // Act
      render(<App />);

      // Assert
      const eventList = await screen.findByTestId('event-list');

      await waitFor(
        () => {
          const nonRecurringEventText = within(eventList).getByText(/단일 회의/);
          expect(nonRecurringEventText).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const nonRecurringEventText = within(eventList).getByText(/단일 회의/);

      // 단일 일정 항목의 부모 컨테이너에서 반복 아이콘이 없는지 확인
      const eventItem = nonRecurringEventText.closest('li');
      expect(eventItem).toBeInTheDocument();
      expect(within(eventItem!).queryByLabelText('반복 일정')).not.toBeInTheDocument();
    });
  });

  describe('Phase 2: 접근성 및 종료 조건', () => {
    it('TODO-006: 반복 아이콘은 ARIA 레이블을 가진다', async () => {
      // 명세: REQ-005
      // 설계: TODO-006
      expect.hasAssertions();

      // Arrange
      // Act
      render(<App />);

      // Assert
      const eventList = await screen.findByTestId('event-list');

      await waitFor(
        () => {
          const dailyEvent = within(eventList).getByText(/매일 운동/);
          expect(dailyEvent).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // 접근성: ARIA 레이블 검증
      const recurringIcon = within(eventList).getByLabelText('반복 일정');
      expect(recurringIcon).toBeInTheDocument();
      expect(recurringIcon).toHaveAttribute('aria-label', '반복 일정');
    });
  });

  describe('Phase 3: 종료일 검증', () => {
    it('TODO-008: 반복 종료일(endDate)이 지난 일정은 반복 아이콘을 표시하지 않는다', async () => {
      // 명세: REQ-005
      // 설계: TODO-008
      expect.hasAssertions();

      // Arrange - 종료일이 지난 반복 일정
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30); // 30일 전
      const expiredEndDate = pastDate.toISOString().split('T')[0];

      const expiredRecurringEvent: Event = {
        id: '6',
        title: '종료된 반복 일정',
        date: today,
        startTime: '09:00',
        endTime: '10:00',
        description: '이미 종료된 반복 일정',
        location: '회의실',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: expiredEndDate }, // 과거 날짜
        notificationTime: 10,
      };

      // MSW handler에 종료된 일정 추가
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [...Object.values(testEvents), expiredRecurringEvent],
          });
        })
      );

      // Act
      render(<App />);

      // Assert
      const eventList = await screen.findByTestId('event-list');

      await waitFor(
        () => {
          const expiredEvent = within(eventList).getByText(/종료된 반복 일정/);
          expect(expiredEvent).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // 활성 반복 일정(endDate='2025-12-31')은 아이콘 표시
      const activeRecurringEvents = within(eventList).getAllByLabelText('반복 일정');
      expect(activeRecurringEvents.length).toBeGreaterThan(0);

      // 종료된 반복 일정은 아이콘 미표시
      const expiredEvent = within(eventList).getByText(/종료된 반복 일정/);
      expect(expiredEvent).toBeInTheDocument();
      const expiredEventItem = expiredEvent.closest('li');
      expect(within(expiredEventItem!).queryByLabelText('반복 일정')).not.toBeInTheDocument();
    });
  });
});

