import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();

// ! Hard 여기 제공 안함
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

// ! Hard 여기 제공 안함
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('새 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
    expect(eventList.getByText('14:00 - 15:00')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 진행 상황 논의')).toBeInTheDocument();
    expect(eventList.getByText('회의실 A')).toBeInTheDocument();
    expect(eventList.getByText('카테고리: 업무')).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const { user } = setup(<App />);

    setupMockHandlerUpdating();

    const firstEditBtn = (await screen.findAllByLabelText('Edit event'))[0];
    await user.click(firstEditBtn);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');
    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '회의 내용 변경');

    await user.click(screen.getByTestId('event-submit-button'));

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('수정된 회의')).toBeInTheDocument();
    expect(eventList.getByText('회의 내용 변경')).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('삭제할 이벤트')).toBeInTheDocument();

    // 삭제 버튼 클릭
    const allDeleteButton = await screen.findAllByLabelText('Delete event');
    await user.click(allDeleteButton[0]);

    expect(eventList.queryByText('삭제할 이벤트')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    // ! 현재 시스템 시간 2025-10-01
    const { user } = setup(<App />);

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번주 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번주 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = within(screen.getByTestId('week-view'));
    expect(weekView.getByText('이번주 팀 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    vi.setSystemTime(new Date('2025-01-01'));

    setup(<App />);

    // ! 일정 로딩 완료 후 테스트
    await screen.findByText('일정 로딩 완료!');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);
    await saveSchedule(user, {
      title: '이번달 팀 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '이번달 팀 회의입니다.',
      location: '회의실 A',
      category: '업무',
    });

    const monthView = within(screen.getByTestId('month-view'));
    expect(monthView.getByText('이번달 팀 회의')).toBeInTheDocument();
  });

  it('주별 뷰에서 반복 일정은 반복 아이콘이 표시된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 폼 열기
    await user.click(screen.getAllByText('일정 추가')[0]);

    // 필드 입력
    await user.type(screen.getByLabelText('제목'), '반복 테스트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-02');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.type(screen.getByLabelText('설명'), '반복 일정 아이콘 확인');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 설정 체크 (기본 repeatType은 daily로 설정됨)
    await user.click(screen.getByLabelText('반복 일정'));

    // 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 주별 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // 반복 이벤트가 주간 뷰에 표시되고, 각 발생마다 반복 아이콘이 함께 표시되어야 한다
    const weekView = within(screen.getByTestId('week-view'));
    const titleEls = weekView.getAllByText('반복 테스트');
    titleEls.forEach((titleEl) => {
      expect(within(titleEl.closest('div')!).getByTestId('repeat-icon')).toBeInTheDocument();
    });
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));
    setup(<App />);

    const monthView = screen.getByTestId('month-view');

    // 1월 1일 셀 확인
    const januaryFirstCell = within(monthView).getByText('1').closest('td')!;
    expect(within(januaryFirstCell).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: 1,
              title: '팀 회의',
              date: '2025-10-15',
              startTime: '09:00',
              endTime: '10:00',
              description: '주간 팀 미팅',
              location: '회의실 A',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
            {
              id: 2,
              title: '프로젝트 계획',
              date: '2025-10-16',
              startTime: '14:00',
              endTime: '15:00',
              description: '새 프로젝트 계획 수립',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
          ],
        });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '존재하지 않는 일정');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');
    await user.clear(searchInput);

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('팀 회의')).toBeInTheDocument();
    expect(eventList.getByText('프로젝트 계획')).toBeInTheDocument();
  });

  // RED: 검색 카드 뷰에서도 반복 일정은 아이콘으로 표기되어야 한다
  it('검색 결과 카드에서도 반복 일정 아이콘이 표시된다', async () => {
    // 핸들러를 생성/저장 가능하도록 교체
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 반복 일정 생성
    await user.click(screen.getAllByText('일정 추가')[0]);
    await user.type(screen.getByLabelText('제목'), '검색 반복 이벤트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.type(screen.getByLabelText('설명'), '검색 카드 뷰 테스트');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));
    await user.click(screen.getByLabelText('반복 일정'));
    await user.click(screen.getByTestId('event-submit-button'));

    // 검색으로 해당 카드만 보이게 필터링
    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '검색 반복 이벤트');

    const eventList = within(screen.getByTestId('event-list'));
    const titleEls = eventList.getAllByText('검색 반복 이벤트');
    // 동일 제목의 반복 발생분이 여러 개일 수 있으므로, 각 카드에 아이콘이 있는지 확인
    const icons = eventList.getAllByTestId('repeat-icon');
    expect(icons.length).toBe(titleEls.length);
  });
});

describe('일정 충돌', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 회의',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '설명',
      location: '회의실 A',
      category: '업무',
    });

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);

    const editButton = (await screen.findAllByLabelText('Edit event'))[1];
    await user.click(editButton);

    // 시간 수정하여 다른 일정과 충돌 발생
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '08:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
    expect(screen.getByText('기존 회의 (2025-10-15 09:00-10:00)')).toBeInTheDocument();
  });

  // RED: 반복일정은 일정 겹침을 고려하지 않는다 (현재 구현은 겹침 경고가 뜨므로 실패해야 함)
  it('[RED] 반복 일정 생성 시 기존 단일 일정과 겹쳐도 경고가 뜨지 않아야 한다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '기존 단일',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '단일 일정',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 반복 일정 생성: 같은 날 09:30-10:30 (겹침 발생)
    await user.click(screen.getAllByText('일정 추가')[0]);
    await user.type(screen.getByLabelText('제목'), '반복 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '09:30');
    await user.type(screen.getByLabelText('종료 시간'), '10:30');
    await user.type(screen.getByLabelText('설명'), '설명');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 체크 (repeatType은 훅에서 daily로 기본 지정됨)
    await user.click(screen.getByLabelText('반복 일정'));

    await user.click(screen.getByTestId('event-submit-button'));

    // 기대: 경고가 뜨지 않아야 함 (현재 구현에서는 떠서 이 테스트는 실패해야 함)
    await waitFor(() => {
      expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
    });
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-10-15 08:49:59'));

  setup(<App />);

  // ! 일정 로딩 완료 후 테스트
  await screen.findByText('일정 로딩 완료!');

  expect(screen.queryByText('10분 후 기존 회의 일정이 시작됩니다.')).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(screen.getByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});

describe('반복 이벤트', () => {
  // RED: non-yearly(매일/매주/매월) 반복 종료일은 해당 년의 말일이어야 한다
  it('매일 반복 저장 시 종료일이 해당 년의 말일(2025-12-31)로 지정된다', async () => {
    vi.setSystemTime(new Date('2025-10-01'));
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 폼 열기 및 입력
    await user.click(screen.getAllByText('일정 추가')[0]);
    await user.type(screen.getByLabelText('제목'), '종료일 강제 이벤트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '반복 종료일 테스트');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 설정 (repeatType 기본 daily)
    await user.click(screen.getByLabelText('반복 일정'));

    // 종료일은 설정하지 않음 -> 저장 시 해당 연말로 지정되어야 함
    await user.click(screen.getByTestId('event-submit-button'));

    // 우측 리스트에서 종료일 텍스트가 렌더되는지 확인 (동일 제목 다중 발생 고려)
    const eventList = within(await screen.findByTestId('event-list'));
    const endDateNodes = eventList.getAllByText(/\(종료: 2025-12-31\)/);
    expect(endDateNodes.length).toBeGreaterThan(0);
  });

  it('반복 일정 단일 수정', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 반복 일정 생성
    await user.click((await screen.findAllByText('일정 추가'))[0]);
    await user.type(screen.getByLabelText('제목'), '단일 수정 이벤트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '단일 수정 테스트');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: '업무-option' }));
    await user.click(screen.getByLabelText('반복 일정'));
    await user.click(await screen.findByTestId('event-submit-button'));

    // 카드 내 편집 버튼 클릭: 역할+이름으로 바로 찾기
    const list = within(await screen.findByTestId('event-list'));
    const editBtn = (await list.findAllByRole('button', { name: /Edit event/i }))[0];
    await user.click(editBtn);

    // 다이얼로그는 실제로 열리는 role만 대기 (hidden 금지)
    const dialog = await screen.findByRole('dialog');
    await within(dialog).findByText(/해당 일정만 수정하시겠어요\??/);
    await user.click(within(dialog).getByText('예'));

    const titleInput = await screen.findByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '단일 수정 이벤트 (수정)');
    await user.click(await screen.findByTestId('event-submit-button'));

    const eventListAfterEdit = within(await screen.findByTestId('event-list'));
    await eventListAfterEdit.findAllByText('단일 수정 이벤트 (수정)');

    const editedTitles = eventListAfterEdit.getAllByText('단일 수정 이벤트 (수정)');
    editedTitles.forEach((node) => {
      expect(within(node.closest('div')!).queryByTestId('repeat-icon')).toBeNull();
    });

    const otherTitles = eventListAfterEdit.getAllByText('단일 수정 이벤트');
    otherTitles.forEach((node) => {
      expect(within(node.closest('div')!).getByTestId('repeat-icon')).toBeInTheDocument();
    });
  });

  it('반복 일정 단일 삭제', async () => {
    // 커스텀 핸들러: 생성/조회/수정(예외 추가) 지원하여 상태를 유지
    const mockEvents: Event[] = [];
    server.use(
      http.get('/api/events', () => HttpResponse.json({ events: mockEvents })),
      http.post('/api/events', async ({ request }) => {
        const newEvent = (await request.json()) as Event;
        newEvent.id = String(mockEvents.length + 1);
        mockEvents.push(newEvent);
        return HttpResponse.json(newEvent, { status: 201 });
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params as { id: string };
        const updated = (await request.json()) as Event;
        const idx = mockEvents.findIndex((e) => e.id === id);
        if (idx !== -1) {
          mockEvents[idx] = { ...mockEvents[idx], ...updated };
        }
        return HttpResponse.json(mockEvents[idx] ?? updated);
      })
    );

    const { user } = setup(<App />);

    // 반복 일정 생성
    await user.click(screen.getAllByText('일정 추가')[0]);
    await user.type(screen.getByLabelText('제목'), '단일 삭제 이벤트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '단일 삭제 테스트');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));
    await user.click(screen.getByLabelText('반복 일정'));
    await user.click(screen.getByTestId('event-submit-button'));

    // 우측 리스트에서 해당 카드의 타이틀로 카드 영역을 특정한 뒤, 그 카드에 속한 편집 버튼 클릭
    const eventList = within(await screen.findByTestId('event-list'));
    const beforeTitles = await eventList.findAllByText('단일 삭제 이벤트');
    expect(beforeTitles.length).toBeGreaterThan(1);
    let container: HTMLElement | null = (beforeTitles[0] as HTMLElement) || null;
    let deleteBtn: HTMLElement | null = null;
    for (let i = 0; i < 10 && container; i++) {
      const candidate = within(container).queryByLabelText('Delete event');
      if (candidate) {
        deleteBtn = candidate as HTMLElement;
        break;
      }
      container = container.parentElement as HTMLElement | null;
    }
    expect(deleteBtn).not.toBeNull();
    await user.click(deleteBtn!);

    // 단일 삭제 다이얼로그에서 '예' 선택
    const dialog = await screen.findByRole('dialog');
    await within(dialog).findByText(/해당 일정만 삭제하시겠어요\??/);
    await user.click(within(dialog).getByText('예'));

    // 우측 리스트에서 해당 카드가 삭제되었는지 확인
    const eventListAfterDelete = within(await screen.findByTestId('event-list'));
    const afterTitles = eventListAfterDelete.queryAllByText('단일 삭제 이벤트');
    expect(afterTitles.length).toBe(beforeTitles.length - 1);
  });

  it('반복 일정 전체 삭제', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 반복 일정 생성
    await user.click(screen.getAllByText('일정 추가')[0]);
    await user.type(screen.getByLabelText('제목'), '전체 삭제 이벤트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '전체 삭제 테스트');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));
    await user.click(screen.getByLabelText('반복 일정'));
    await user.click(screen.getByTestId('event-submit-button'));

    // 우측 리스트에서 해당 카드의 타이틀로 카드 영역을 특정한 뒤, 그 카드에 속한 편집 버튼 클릭
    const eventList = within(await screen.findByTestId('event-list'));
    const beforeTitles = await eventList.findAllByText('전체 삭제 이벤트');
    expect(beforeTitles.length).toBeGreaterThan(1);
    let container: HTMLElement | null = (beforeTitles[0] as HTMLElement) || null;
    let deleteBtn: HTMLElement | null = null;
    for (let i = 0; i < 10 && container; i++) {
      const candidate = within(container).queryByLabelText('Delete event');
      if (candidate) {
        deleteBtn = candidate as HTMLElement;
        break;
      }
      container = container.parentElement as HTMLElement | null;
    }
    expect(deleteBtn).not.toBeNull();
    await user.click(deleteBtn!);

    // 전체 삭제 다이얼로그에서 '예' 선택
    const dialog = await screen.findByRole('dialog');
    await within(dialog).findByText(/해당 일정만 삭제하시겠어요\??/);
    await user.click(within(dialog).getByText('아니오'));

    // 우측 리스트에서 해당 카드가 삭제되었는지 확인
    const eventListAfterDelete = within(await screen.findByTestId('event-list'));
    const afterTitles = eventListAfterDelete.queryAllByText('전체 삭제 이벤트');
    expect(afterTitles.length).toBe(0);
  });
});
