import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';
import { createMockRecurringSeries } from '../test-helpers/factories';
import { renderWithProviders } from '../test-helpers/setup';

describe('반복 일정 수정 및 삭제', () => {
  beforeEach(() => {
    expect.hasAssertions();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('반복 일정 중 하나를 단일 수정하면 해당 일정만 변경되고 반복 아이콘이 제거된다', async () => {
    // Given: 4개의 주간 반복 일정 설정
    const mockEvents: Event[] = createMockRecurringSeries(
      ['2025-10-06', '2025-10-13', '2025-10-20', '2025-10-27'],
      {
        title: '주간 회의',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-27',
        },
      },
      'rec-1'
    );

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedEvent = (await request.json()) as Event;
        const index = mockEvents.findIndex((e) => e.id === id);

        if (index !== -1) {
          // 단일 수정: repeat.type을 'none'으로 변경
          mockEvents[index] = {
            ...mockEvents[index],
            ...updatedEvent,
            repeat: { type: 'none', interval: 0 },
          };
        }

        return HttpResponse.json(mockEvents[index]);
      })
    );

    const { user } = renderWithProviders(<App />);

    // When: 두 번째 일정 편집
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[1]);

    // 제목 변경
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '긴급 회의');

    await user.click(screen.getByTestId('event-submit-button'));

    // 모달에서 "예" (단일 수정) 클릭
    const modal = await screen.findByRole('dialog');
    expect(within(modal).getByText('반복 일정 수정')).toBeInTheDocument();
    expect(within(modal).getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '예' }));

    // Then: 검증
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('긴급 회의')).toBeInTheDocument();

    const weeklyMeetings = eventList.getAllByText('주간 회의');
    expect(weeklyMeetings).toHaveLength(3);

    // 수정된 일정에는 반복 아이콘이 없어야 함
    const urgentMeetingItem = eventList.getByText('긴급 회의').closest('[role="listitem"]');
    expect(within(urgentMeetingItem!).queryByLabelText('반복 일정')).not.toBeInTheDocument();

    // 다른 3개 일정은 반복 아이콘 유지
    const repeatIcons = eventList.getAllByLabelText('반복 일정');
    expect(repeatIcons).toHaveLength(3);
  });

  it('반복 일정 전체를 수정하면 모든 일정이 변경되고 반복 아이콘이 유지된다', async () => {
    // Given: 4개의 주간 반복 일정 설정
    const mockEvents: Event[] = createMockRecurringSeries(
      ['2025-10-06', '2025-10-13', '2025-10-20', '2025-10-27'],
      {
        title: '주간 회의',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-27',
        },
      },
      'rec-1'
    );

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedEvent = (await request.json()) as Event;
        const targetEvent = mockEvents.find((e) => e.id === id);

        if (targetEvent?.repeat.recurrenceId) {
          // 전체 수정: 동일한 recurrenceId를 가진 모든 일정 수정
          const recurrenceId = targetEvent.repeat.recurrenceId;
          mockEvents.forEach((event) => {
            if (event.repeat.recurrenceId === recurrenceId) {
              Object.assign(event, updatedEvent);
            }
          });
        }

        return HttpResponse.json(targetEvent);
      })
    );

    const { user } = renderWithProviders(<App />);

    // When: 두 번째 일정 편집
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[1]);

    // 제목 변경
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '전체 회의 변경');

    await user.click(screen.getByTestId('event-submit-button'));

    // 모달에서 "아니오" (전체 수정) 클릭
    const modal = await screen.findByRole('dialog');
    expect(within(modal).getByText('반복 일정 수정')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '아니오' }));

    // Then: 검증
    const eventList = within(screen.getByTestId('event-list'));
    const allEvents = eventList.getAllByText('전체 회의 변경');
    expect(allEvents).toHaveLength(4);

    expect(eventList.queryByText('주간 회의')).not.toBeInTheDocument();

    // 모든 일정이 반복 아이콘 유지
    const repeatIcons = eventList.getAllByLabelText('반복 일정');
    expect(repeatIcons).toHaveLength(4);
  });

  it('반복 일정 중 하나를 단일 삭제하면 해당 일정만 삭제된다', async () => {
    // Given: 4개의 주간 반복 일정 설정
    const mockEvents: Event[] = createMockRecurringSeries(
      ['2025-10-06', '2025-10-13', '2025-10-20', '2025-10-27'],
      {
        title: '주간 회의',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-27',
        },
      },
      'rec-1'
    );

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.delete('/api/events/:id', ({ params }) => {
        const { id } = params;
        const index = mockEvents.findIndex((e) => e.id === id);

        if (index !== -1) {
          mockEvents.splice(index, 1);
        }

        return new HttpResponse(null, { status: 204 });
      })
    );

    const { user } = renderWithProviders(<App />);

    // When: 두 번째 일정 삭제
    const deleteButtons = await screen.findAllByLabelText('Delete event');
    await user.click(deleteButtons[1]);

    // 모달에서 "예" (단일 삭제) 클릭
    const modal = await screen.findByRole('dialog');
    expect(within(modal).getByText('반복 일정 삭제')).toBeInTheDocument();
    expect(within(modal).getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '예' }));

    // Then: 검증
    const eventList = within(screen.getByTestId('event-list'));
    const weeklyMeetings = eventList.getAllByText('주간 회의');
    expect(weeklyMeetings).toHaveLength(3);

    const repeatIcons = eventList.getAllByLabelText('반복 일정');
    expect(repeatIcons).toHaveLength(3);
  });

  it('반복 일정 전체를 삭제하면 모든 일정이 삭제된다', async () => {
    // Given: 4개의 주간 반복 일정 설정
    const mockEvents: Event[] = createMockRecurringSeries(
      ['2025-10-06', '2025-10-13', '2025-10-20', '2025-10-27'],
      {
        title: '주간 회의',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-27',
        },
      },
      'rec-1'
    );

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.delete('/api/events/:id', ({ params }) => {
        const { id } = params;
        const targetEvent = mockEvents.find((e) => e.id === id);

        if (targetEvent?.repeat.recurrenceId) {
          // 전체 삭제: 동일한 recurrenceId를 가진 모든 일정 삭제
          const recurrenceId = targetEvent.repeat.recurrenceId;
          const indicesToRemove = mockEvents
            .map((e, index) => (e.repeat.recurrenceId === recurrenceId ? index : -1))
            .filter((index) => index !== -1)
            .reverse();

          indicesToRemove.forEach((index) => mockEvents.splice(index, 1));
        }

        return new HttpResponse(null, { status: 204 });
      })
    );

    const { user } = renderWithProviders(<App />);

    // When: 첫 번째 일정 삭제
    const deleteButtons = await screen.findAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    // 모달에서 "아니오" (전체 삭제) 클릭
    const modal = await screen.findByRole('dialog');
    expect(within(modal).getByText('반복 일정 삭제')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '아니오' }));

    // Then: 검증
    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    expect(eventList.queryByText('주간 회의')).not.toBeInTheDocument();
  });
});

describe('반복 일정 겹침 검사', () => {
  beforeEach(() => {
    expect.hasAssertions();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('반복 일정 생성 시 기존 일정과 겹쳐도 경고가 나타나지 않는다', async () => {
    // Given: 기존 일정이 있는 상태
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '12:00',
        description: '기존 미팅',
        location: '회의실 A',
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
      }),
      http.post('/api/events', async ({ request }) => {
        const newEvent = (await request.json()) as Event;
        const eventWithId = { ...newEvent, id: `${mockEvents.length + 1}` };
        mockEvents.push(eventWithId);
        return HttpResponse.json(eventWithId);
      })
    );

    const { user } = renderWithProviders(<App />);

    // When: 시간이 겹치는 반복 일정 생성
    await user.type(screen.getByLabelText('제목'), '반복 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '11:00');
    await user.type(screen.getByLabelText('종료 시간'), '13:00');
    await user.type(screen.getByLabelText('설명'), '반복 미팅');
    await user.type(screen.getByLabelText('위치'), '회의실 B');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 일정 설정
    const checkbox = screen.getByRole('checkbox', { name: '반복 일정' });

    // 체크박스가 체크되지 않은 경우에만 클릭
    if (!checkbox.hasAttribute('checked') || checkbox.getAttribute('checked') === 'false') {
      await user.click(checkbox);
    }

    const repeatSelect = await screen.findByLabelText('반복');
    await user.click(within(repeatSelect).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매주' }));

    await user.click(screen.getByTestId('event-submit-button'));

    // Then: 겹침 경고 다이얼로그가 나타나지 않음
    expect(screen.queryByText(/일정 겹침 경고/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/다음 일정과 겹칩니다/i)).not.toBeInTheDocument();

    // 일정이 정상적으로 생성됨
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('반복 회의')).toBeInTheDocument();
  });

  it('일반 일정 생성 시 기존 일정과 겹치면 경고가 나타난다', async () => {
    // Given: 기존 일정이 있는 상태
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '12:00',
        description: '기존 미팅',
        location: '회의실 A',
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
      }),
      http.post('/api/events', async ({ request }) => {
        const newEvent = (await request.json()) as Event;
        const eventWithId = { ...newEvent, id: `${mockEvents.length + 1}` };
        mockEvents.push(eventWithId);
        return HttpResponse.json(eventWithId);
      })
    );

    const { user } = renderWithProviders(<App />);

    // When: 시간이 겹치는 일반 일정 생성
    await user.click(screen.getAllByText('일정 추가')[0]);

    await user.type(screen.getByLabelText('제목'), '새 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '11:00');
    await user.type(screen.getByLabelText('종료 시간'), '13:00');
    await user.type(screen.getByLabelText('설명'), '새 미팅');
    await user.type(screen.getByLabelText('위치'), '회의실 B');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 일정 체크박스는 체크하지 않음 (일반 일정)

    await user.click(screen.getByTestId('event-submit-button'));

    // Then: 겹침 경고 다이얼로그가 나타남
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/일정 겹침 경고/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/다음 일정과 겹칩니다/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/기존 회의/)).toBeInTheDocument();

    // 계속 진행 버튼 클릭
    await user.click(screen.getByRole('button', { name: /계속/i }));

    // 일정이 정상적으로 생성됨
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('새 회의')).toBeInTheDocument();
  });
});
