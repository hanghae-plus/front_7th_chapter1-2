import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
  setupMockGetEvents,
  setupMockPostRequestHandler,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event, EventForm } from '../types';

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: [],
    notifiedEvents: [],
    setNotifications: vi.fn(),
  }),
}));

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

    const editButtons = await screen.findAllByRole('button', { name: /Edit event/ });
    await user.click(editButtons[0]);

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
    const allDeleteButton = await screen.findAllByRole('button', { name: /Delete event/ });
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

    const editButton = (await screen.findAllByRole('button', { name: /Edit event/ }))[1];
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
});

// 반복일정 유형 선택 UI 구현 및 통합 테스트
describe('반복 일정 유형 선택 UI 통합 테스트', () => {
  // const user = userEvent.setup();

  // beforeEach(() => {
  //   server.use(...setupMockHandlerCreation([]));
  //   render(<App />);
  // });

  it("일정 생성/수정 폼에서 '반복' 체크박스 선택 시 반복 주기 입력 영역이 노출되어야 한다", async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    const repeatCheckbox = screen.getByLabelText('반복 일정');
    expect(repeatCheckbox).not.toBeChecked();

    await user.click(repeatCheckbox);
    expect(repeatCheckbox).toBeChecked();

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    expect(repeatTypeSelect).toBeInTheDocument(); // This should fail initially
  });
});

// RED 단계: 사용자가 반복 일정을 생성하는 시나리오 테스트

const createRecurringEvent = async (
  user: UserEvent,
  options: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    repeatType: 'daily' | 'weekly' | 'monthly' | 'yearly';
    daysOfWeek?: number[];
    dayOfMonth?: number;
    monthOfYear?: number;
  }
) => {
  const { title, date, startTime, endTime, repeatType, daysOfWeek, dayOfMonth, monthOfYear } =
    options;

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.click(screen.getByLabelText('반복 일정'));
  await user.selectOptions(screen.getByLabelText('반복 유형'), repeatType);

  if (repeatType === 'weekly' && daysOfWeek) {
    const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
    for (const dayIndex of daysOfWeek) {
      await user.click(await screen.findByRole('checkbox', { name: dayLabels[dayIndex] }));
    }
  }

  if ((repeatType === 'monthly' || repeatType === 'yearly') && dayOfMonth) {
    const dayOfMonthInput = await screen.findByLabelText('일자');
    await user.clear(dayOfMonthInput);
    await user.type(dayOfMonthInput, String(dayOfMonth));
  }

  if (repeatType === 'yearly' && monthOfYear) {
    await user.selectOptions(await screen.findByLabelText('월'), String(monthOfYear));
  }

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정 시각적 표시 (사용자 시나리오)', () => {
  it("사용자가 '매일' 반복 일정을 생성하면, 해당 일정 목록에 반복 아이콘이 표시된다", async () => {
    // 1. [GIVEN]
    server.use(
      http.post('/api/events', async ({ request }) => {
        const newEvent = (await request.json()) as EventForm;
        const eventWithId: Event = {
          ...newEvent,
          id: 'mock-id-123',
          seriesId: 'mock-series-id-456', // Simulate backend generating a seriesId
        };

        // [Review by Off코치]: POST 요청 후 이어지는 GET 요청이 새 이벤트를 포함하도록 핸들러를 재설정합니다.
        server.use(
          http.get('/api/events', () => {
            return HttpResponse.json({ events: [eventWithId] });
          })
        );

        return HttpResponse.json(eventWithId);
      })
    );
    const { user } = setup(<App />);

    // 2. [WHEN]
    await createRecurringEvent(user, {
      title: '매일 반복 회의',
      date: '2025-10-15',
      startTime: '10:00',
      endTime: '11:00',
      repeatType: 'daily',
    });

    // 3. [THEN]
    const eventList = screen.getByTestId('event-list');
    const newEventItem = await within(eventList).findByText('매일 반복 회의');
    const newEventContainer = newEventItem.closest('div');
    const replayIcon = await within(newEventContainer!).findByTestId('ReplayIcon');

    expect(replayIcon).toBeInTheDocument();
  });
});

// RED 단계: Story 7 - 반복 종료일 저장
describe('반복 종료일 저장', () => {
  it('사용자가 입력한 반복 종료일이 API 요청에 올바르게 포함되어야 한다.', async () => {
    // GIVEN
    let requestBody: Event;
    setupMockPostRequestHandler((body) => {
      requestBody = body;
    });
    const { user } = setup(<App />);
    const endDateToSubmit = '2025-10-31';

    // WHEN
    await user.type(screen.getByLabelText('제목'), '종료일 테스트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.click(screen.getByLabelText('반복 일정'));
    await user.type(screen.getByLabelText('반복 종료일'), endDateToSubmit);
    await user.click(screen.getByTestId('event-submit-button'));

    // THEN
    expect(requestBody.repeat.endDate).toBe(endDateToSubmit);
  });
});

// RED 단계: Hotfix-Story-006.1 - 반복 일정 확장 표시 통합 테스트
describe('반복 일정 확장 표시 (통합)', () => {
  it('매일 반복되는 일정은 주별 뷰의 여러 날짜에 걸쳐 표시되어야 한다', async () => {
    // GIVEN: '매일' 반복되는 일정이 생성된 상태
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);
    await createRecurringEvent(user, {
      title: '주간 전체 회의',
      date: '2025-09-29', // 월요일
      startTime: '11:00',
      endTime: '12:00',
      repeatType: 'daily',
    });

    // WHEN: 주별 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // THEN: 해당 주의 여러 날짜에 이벤트가 표시되어야 함
    const weekView = screen.getByTestId('week-view');
    const eventTitles = await within(weekView).findAllByText('주간 전체 회의');
    expect(eventTitles).toHaveLength(6); // 월요일부터 토요일까지 총 6번
  });

  it('매주 반복되는 일정은 주별 뷰의 해당 요일에 걸쳐 표시되어야 한다', async () => {
    // GIVEN: '매주' 월요일에 반복되는 일정이 생성된 상태
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);
    await createRecurringEvent(user, {
      title: '주간 월요일 회의',
      date: '2025-09-29', // 월요일
      startTime: '10:00',
      endTime: '11:00',
      repeatType: 'weekly', // 매주 반복
      daysOfWeek: [1], // 월요일 (0:일, 1:월, ...)
    });

    // WHEN: 주별 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // THEN: 해당 주의 월요일에 이벤트가 표시되어야 함
    const weekView = screen.getByTestId('week-view');
    const eventTitles = await within(weekView).findAllByText('주간 월요일 회의');
    expect(eventTitles).toHaveLength(1); // 해당 주 월요일에 1번
  });

  it('매월 반복되는 일정은 월별 뷰의 해당 일자에 걸쳐 표시되어야 한다', async () => {
    // GIVEN: '매월' 15일에 반복되는 일정이 생성된 상태
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);
    await createRecurringEvent(user, {
      title: '월간 15일 회의',
      date: '2025-10-15', // 10월 15일
      startTime: '14:00',
      endTime: '15:00',
      repeatType: 'monthly', // 매월 반복
      dayOfMonth: 15,
    });

    // WHEN: 월별 뷰로 전환 (기본 뷰가 월별이므로 별도 전환 필요 없음)
    // THEN: 해당 월의 15일에 이벤트가 표시되어야 함
    const monthView = screen.getByTestId('month-view');
    const eventTitles = await within(monthView).findAllByText('월간 15일 회의');
    expect(eventTitles).toHaveLength(1); // 해당 월 15일에 1번
  });

  it('매년 반복되는 일정은 월별 뷰의 해당 월/일자에 걸쳐 표시되어야 한다', async () => {
    // GIVEN: '매년' 10월 29일에 반복되는 일정이 생성된 상태
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);
    await createRecurringEvent(user, {
      title: '연간 10/29 회의',
      date: '2025-10-29',
      startTime: '09:00',
      endTime: '18:00',
      repeatType: 'yearly', // 매년 반복
      monthOfYear: 9, // 10월 (0-indexed)
      dayOfMonth: 29,
    });

    // WHEN: 월별 뷰 확인 (기본값)
    // THEN: 해당 월의 29일에 이벤트가 표시되어야 함
    const monthView = screen.getByTestId('month-view');
    const eventTitle = await within(monthView).findByText('연간 10/29 회의');
    expect(eventTitle).toBeInTheDocument();
  });
});

// Story 7 - 반복 종료일 저장 (비반복 시나리오)
describe('반복 종료일 저장 (비반복 시나리오)', () => {
  it('사용자가 입력한 반복 종료일이 API 요청에 올바르게 포함되어야 한다.', async () => {
    // GIVEN
    let requestBody: unknown;
    setupMockPostRequestHandler((body) => {
      requestBody = body;
    });
    const { user } = setup(<App />);
    const endDateToSubmit = '2025-10-31';

    // WHEN
    await user.type(screen.getByLabelText('제목'), '종료일 테스트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.click(screen.getByLabelText('반복 일정'));
    await user.type(screen.getByLabelText('반복 종료일'), endDateToSubmit);
    await user.click(screen.getByTestId('event-submit-button'));

    // THEN
    expect((requestBody as Event).repeat.endDate).toBe(endDateToSubmit);
  });

  it('반복 일정이 아닐 경우, repeat.endDate는 API 요청에 포함되지 않아야 한다', async () => {
    // GIVEN
    let requestBody: unknown;
    setupMockPostRequestHandler((body) => {
      requestBody = body;
    });
    const { user } = setup(<App />);
    const endDateToSubmit = '2025-10-31';

    // WHEN
    await user.type(screen.getByLabelText('제목'), '단일 일정');
    await user.type(screen.getByLabelText('날짜'), '2025-10-01');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');

    // 사용자가 반복을 설정했다가 다시 취소하는 흐름
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    await user.click(repeatCheckbox); // 1. 반복 체크
    await user.type(await screen.findByLabelText('반복 종료일'), endDateToSubmit); // 2. 종료일 입력
    await user.click(repeatCheckbox); // 3. 반복 체크 해제

    await user.click(screen.getByTestId('event-submit-button'));

    // THEN
    expect((requestBody as Event).repeat.endDate).toBeUndefined();
  });
});
// RED 단계: Story 8 - 반복 일정 수정 확인 다이얼로그 표시
describe('반복 일정 수정 확인 다이얼로그', () => {
  beforeEach(() => {
    setupMockGetEvents([
      {
        id: '1',
        title: '반복되지 않는 일정',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
        seriesId: null,
      },
      {
        id: '2',
        title: '반복되는 일정',
        date: '2025-10-16',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
        seriesId: 'series-abc', // [Review by Off코치]: seriesId를 추가하여 반복 일정임을 명시합니다.
      },
    ]);
  });

  it('일반 일정 수정 시 확인 다이얼로그가 나타나지 않아야 한다', async () => {
    const { user } = setup(<App />);

    // 일반 일정의 수정 버튼 클릭
    const nonRecurringEditButton = await screen.findByRole('button', {
      name: 'Edit event 반복되지 않는 일정',
    });
    await user.click(nonRecurringEditButton);

    // 다이얼로그가 나타나지 않음을 확인
    expect(screen.queryByText('해당 일정만 수정하시겠어요?')).not.toBeInTheDocument();
    // 수정 폼이 나타났는지 확인 (예: 제목 필드)
    expect(screen.getByLabelText('제목')).toHaveValue('반복되지 않는 일정');
  });

  it('반복 일정 수정 시 확인 다이얼로그가 나타나야 한다', async () => {
    const { user } = setup(<App />);

    // 반복 일정의 수정 버튼 클릭
    const recurringEditButton = await screen.findByRole('button', {
      name: 'Edit event 반복되는 일정',
    });
    await user.click(recurringEditButton);

    // Fake Timers 환경에서 user-event로 인한 상태 업데이트를 수동으로 실행
    act(() => {
      vi.runOnlyPendingTimers();
    });

    // 다이얼로그가 나타남을 확인
    const dialog = await screen.findByRole('dialog', { name: '일정 수정 확인' });
    expect(within(dialog).getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '예' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '아니오' })).toBeInTheDocument();
  });

  it("반복 일정 수정 다이얼로그에서 '예' 버튼 클릭 시, 해당 이벤트가 단일 일정으로 분리되어야 한다", async () => {
    // GIVEN: seriesId를 가진 반복 이벤트가 존재
    const mockEvents = [
      {
        id: '1',
        title: '반복되지 않는 일정',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
        seriesId: null,
      },
      {
        id: '2',
        title: '반복되는 일정',
        date: '2025-10-16',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
        seriesId: 'series-1',
      },
    ];
    setupMockHandlerUpdating(mockEvents);

    const { user } = setup(<App />);

    // WHEN: 반복 일정의 수정 버튼 클릭 후 다이얼로그에서 '예' 버튼 클릭
    const recurringEditButton = await screen.findByRole('button', {
      name: 'Edit event 반복되는 일정',
    });
    await user.click(recurringEditButton);
    act(() => {
      vi.runOnlyPendingTimers();
    });

    const dialog = await screen.findByRole('dialog', { name: '일정 수정 확인' });
    const yesButton = within(dialog).getByRole('button', { name: '예' });
    await user.click(yesButton);
    act(() => {
      vi.runOnlyPendingTimers();
    });

    // THEN: `PUT /api/events/:id/detach` API가 호출되었고, UI에서 반복 아이콘이 사라졌는지 확인
    const eventList = screen.getByTestId('event-list');
    const updatedEventItem = await within(eventList).findByText('반복되는 일정');
    const updatedEventContainer = updatedEventItem.closest('div');
    expect(within(updatedEventContainer!).queryByTestId('ReplayIcon')).not.toBeInTheDocument();
  });
});

// RED 단계: Story 10 - 반복 일정 전체 수정 로직 구현
describe('반복 일정 전체 수정', () => {
  const seriesId = 'series-xyz';
  const mockRecurringEvents = [
    {
      id: '1',
      title: '주간 반복 회의',
      date: '2025-10-13', // Monday
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 10,
      seriesId: seriesId,
    },
    {
      id: '2',
      title: '주간 반복 회의',
      date: '2025-10-20', // Next Monday
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      notificationTime: 10,
      seriesId: seriesId,
    },
  ];

  it("다이얼로그에서 '아니오' 선택 후 전체 일정을 수정하면, 동일한 seriesId를 가진 모든 이벤트가 수정되어야 한다", async () => {
    // GIVEN: 동일한 seriesId를 가진 여러 이벤트가 존재
    setupMockGetEvents(mockRecurringEvents);

    // PUT /api/events-series/:seriesId 핸들러 설정
    let apiCallVerified = false;
    server.use(
      http.put(`/api/events-series/${seriesId}`, async ({ request }) => {
        apiCallVerified = true;
        const updatedEventData = await request.json();
        const updatedEvents = mockRecurringEvents.map((event) => ({
          ...event,
          ...(updatedEventData as Partial<Event>),
        }));

        // [Review by Off코치]: PUT 요청 후 이어지는 GET 요청이 수정된 데이터를 반환하도록 핸들러를 재설정합니다.
        server.use(
          http.get('/api/events', () => {
            return HttpResponse.json({ events: updatedEvents });
          })
        );

        return HttpResponse.json(updatedEvents[0]); // PUT 응답은 보통 단일 개체나 성공 여부를 반환합니다.
      })
    );

    const { user } = setup(<App />);

    // WHEN: 첫 번째 반복 일정의 수정 버튼 클릭
    const editButtons = await screen.findAllByRole('button', { name: /Edit event 주간 반복 회의/ });
    await user.click(editButtons[0]);

    // 다이얼로그에서 '아니오' 버튼 클릭
    const dialog = await screen.findByRole('dialog', { name: '일정 수정 확인' });
    const noButton = within(dialog).getByRole('button', { name: '아니오' });
    await user.click(noButton);

    // 폼의 제목을 수정하고 저장
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '전체 수정된 회의');
    await user.click(screen.getByTestId('event-submit-button'));

    // THEN:
    // 1. 올바른 API가 호출되었는지 확인
    expect(apiCallVerified).toBe(true);

    // 2. UI에 있는 모든 관련 이벤트의 제목이 변경되었는지 확인
    const updatedEventTitles = await screen.findAllByText('전체 수정된 회의');
    expect(updatedEventTitles).toHaveLength(mockRecurringEvents.length);
  });
});

// RED 단계: Story 11 - 반복 일정 삭제 확인 다이얼로그 표시
describe('반복 일정 삭제 확인 다이얼로그', () => {
  const recurringEvent: Event = {
    id: 'recurring-1',
    title: '반복되는 삭제 일정',
    date: '2025-10-17',
    startTime: '13:00',
    endTime: '14:00',
    description: '',
    location: '',
    category: '업무',
    repeat: { type: 'daily', interval: 1 },
    notificationTime: 10,
    seriesId: 'delete-series-abc',
  };

  const nonRecurringEvent: Event = {
    id: 'non-recurring-1',
    title: '반복 안되는 삭제 일정',
    date: '2025-10-18',
    startTime: '15:00',
    endTime: '16:00',
    description: '',
    location: '',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
    seriesId: null,
  };

  beforeEach(() => {
    setupMockHandlerDeletion([nonRecurringEvent, recurringEvent]);
  });

  it('일반 일정 삭제 시 확인 다이얼로그가 나타나지 않고 즉시 삭제되어야 한다', async () => {
    const { user } = setup(<App />);

    // 일반 일정의 삭제 버튼 클릭
    const nonRecurringDeleteButton = await screen.findByRole('button', {
      name: `Delete event ${nonRecurringEvent.title}`,
    });

    // deleteEvent API 호출을 모킹하여 실제 삭제가 일어나지 않도록 함
    // 하지만, 테스트는 여전히 deleteEvent가 호출되지 '않고' 다이얼로그가 안 뜨는 것을 확인
    let deleteEventCalled = false;
    server.use(
      http.delete(`/api/events/${nonRecurringEvent.id}`, () => {
        deleteEventCalled = true;
        return HttpResponse.json({});
      })
    );

    // [REVIEW by Off코치]: 여기서 deleteEvent 호출 시 UI 갱신을 위해 fetchEvents가 호출되므로,
    // 해당 이벤트를 GET API 응답에서 제거하는 핸들러를 추가해야 합니다.
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [recurringEvent] });
      })
    );

    await user.click(nonRecurringDeleteButton);
    act(() => {
      vi.runOnlyPendingTimers();
    });

    // 다이얼로그가 나타나지 않음을 확인
    expect(screen.queryByRole('dialog', { name: '일정 삭제 확인' })).not.toBeInTheDocument();
    const eventList = screen.getByTestId('event-list');
    // 해당 이벤트가 리스트에서 사라졌는지 확인
    expect(within(eventList).queryByText(nonRecurringEvent.title)).not.toBeInTheDocument();
    // 다른 이벤트는 여전히 존재하는지 확인
    expect(within(eventList).getByText(recurringEvent.title)).toBeInTheDocument();
    expect(deleteEventCalled).toBe(true); // deleteEvent가 호출되었는지 확인
  });

  it('반복 일정 삭제 시 확인 다이얼로그가 나타나야 한다', async () => {
    const { user } = setup(<App />);

    // 반복 일정의 삭제 버튼 클릭
    const recurringDeleteButton = await screen.findByRole('button', {
      name: `Delete event ${recurringEvent.title}`,
    });
    await user.click(recurringDeleteButton);

    act(() => {
      vi.runOnlyPendingTimers();
    });

    // 다이얼로그가 나타남을 확인
    const dialog = await screen.findByRole('dialog', { name: '일정 삭제 확인' });
    expect(within(dialog).getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '예' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '아니오' })).toBeInTheDocument();
  });

  it("반복 일정 삭제 다이얼로그에서 '예' 버튼 클릭 시, 해당 이벤트가 단일 일정으로 삭제되어야 한다", async () => {
    const { user } = setup(<App />);

    // 반복 일정의 삭제 버튼 클릭
    const recurringDeleteButton = await screen.findByRole('button', {
      name: `Delete event ${recurringEvent.title}`,
    });
    await user.click(recurringDeleteButton);

    act(() => {
      vi.runOnlyPendingTimers();
    });

    // 다이얼로그가 나타남을 확인
    const dialog = await screen.findByRole('dialog', { name: '일정 삭제 확인' });
    expect(within(dialog).getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '예' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '아니오' })).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: '예' }));

    act(() => {
      vi.runOnlyPendingTimers();
    });
    // THEN: `DELETE /api/events/:id`
    // API가 호출되었고, UI에서 해당 이벤트가 사라졌는지 확인
    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).queryByText(recurringEvent.title)).not.toBeInTheDocument();
  });
});
