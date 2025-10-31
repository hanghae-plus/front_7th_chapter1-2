import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';
import { renderWithProviders } from '../test-helpers/setup';

describe('캘린더 뷰 반복 아이콘 표시', () => {
  beforeEach(() => {
    expect.hasAssertions();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('주간 뷰에서 반복 일정에 반복 아이콘이 표시된다', async () => {
    // Given: 반복 일정과 일반 일정이 있는 상태
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '반복 회의',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          recurrenceId: 'rec-1',
        },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '일반 일정',
        date: '2025-10-02',
        startTime: '14:00',
        endTime: '15:00',
        description: '일반 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      })
    );

    const { user } = renderWithProviders(<App />);

    // When: 주간 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // Then: 주간 뷰가 표시됨
    const weekView = await screen.findByTestId('week-view');
    expect(weekView).toBeInTheDocument();

    // 반복 일정에 반복 아이콘이 표시됨
    const recurringEventElements = within(weekView).getAllByText('반복 회의');
    expect(recurringEventElements.length).toBeGreaterThan(0);

    // 첫 번째 반복 일정 요소의 부모에서 반복 아이콘 확인
    const recurringEventBox = recurringEventElements[0].closest('[role]')?.parentElement;
    if (recurringEventBox) {
      const repeatIcon = within(recurringEventBox).queryByTestId('RepeatIcon');
      expect(repeatIcon).toBeInTheDocument();
    }

    // 일반 일정에는 반복 아이콘이 없음
    const normalEventElements = within(weekView).getAllByText('일반 일정');
    const normalEventBox = normalEventElements[0].closest('[role]')?.parentElement;
    if (normalEventBox) {
      const repeatIcon = within(normalEventBox).queryByTestId('RepeatIcon');
      expect(repeatIcon).not.toBeInTheDocument();
    }
  });

  it('월간 뷰에서 반복 일정에 반복 아이콘이 표시된다', async () => {
    // Given: 반복 일정과 일반 일정이 있는 상태
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '반복 회의',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          recurrenceId: 'rec-1',
        },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '일반 일정',
        date: '2025-10-02',
        startTime: '14:00',
        endTime: '15:00',
        description: '일반 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: {
          type: 'none',
          interval: 0,
        },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      })
    );

    renderWithProviders(<App />);

    // When: 월간 뷰로 전환 (기본값이 월간 뷰)
    const monthView = await screen.findByTestId('month-view');
    expect(monthView).toBeInTheDocument();

    // Then: 반복 일정에 반복 아이콘이 표시됨
    const recurringEventElements = within(monthView).getAllByText('반복 회의');
    expect(recurringEventElements.length).toBeGreaterThan(0);

    // 첫 번째 반복 일정 요소의 부모에서 반복 아이콘 확인
    const recurringEventBox = recurringEventElements[0].closest('[role]')?.parentElement;
    if (recurringEventBox) {
      const repeatIcon = within(recurringEventBox).queryByTestId('RepeatIcon');
      expect(repeatIcon).toBeInTheDocument();
    }

    // 일반 일정에는 반복 아이콘이 없음
    const normalEventElements = within(monthView).getAllByText('일반 일정');
    const normalEventBox = normalEventElements[0].closest('[role]')?.parentElement;
    if (normalEventBox) {
      const repeatIcon = within(normalEventBox).queryByTestId('RepeatIcon');
      expect(repeatIcon).not.toBeInTheDocument();
    }
  });

  it('이벤트 리스트에서 반복 일정에 반복 아이콘이 표시된다 (기존 기능 확인)', async () => {
    // Given: 반복 일정이 있는 상태
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '반복 회의',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          recurrenceId: 'rec-1',
        },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      })
    );

    renderWithProviders(<App />);

    // When: 이벤트 리스트 확인
    const eventList = await screen.findByTestId('event-list');

    // Then: 반복 아이콘이 표시됨
    const repeatIcon = within(eventList).getByLabelText('반복 일정');
    expect(repeatIcon).toBeInTheDocument();
  });
});
