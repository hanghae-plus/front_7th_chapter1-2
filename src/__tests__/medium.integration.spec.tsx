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

    await user.click(await screen.findByLabelText('Edit event'));

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

// Phase 4: Additional Functionality
describe('반복 일정 폼 검증', () => {
  beforeEach(() => {
    setupMockHandlerCreation();
  });

  describe('TC-012: 반복 종료일 최대 날짜 검증 (2025-12-31)', () => {
    it('반복 종료일이 2025-12-31을 초과하면 에러 메시지가 표시된다', async () => {
      const { user } = setup(<App />);

      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText('제목'), '반복 테스트');
      await user.type(screen.getByLabelText('날짜'), '2025-01-01');
      await user.type(screen.getByLabelText('시작 시간'), '09:00');
      await user.type(screen.getByLabelText('종료 시간'), '10:00');

      // 반복 유형 선택
      await user.click(screen.getByLabelText('반복 유형'));
      await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '매일-option' }));

      // 최대 날짜 초과 입력
      await user.type(screen.getByLabelText('반복 종료일'), '2026-01-01');

      // 에러 메시지 확인
      expect(
        screen.getByText('반복 종료일은 2025년 12월 31일을 초과할 수 없습니다')
      ).toBeInTheDocument();

      // 제출 버튼 비활성화 확인
      expect(screen.getByTestId('event-submit-button')).toBeDisabled();
    });

    it('반복 종료일이 정확히 2025-12-31이면 유효하다', async () => {
      const { user } = setup(<App />);

      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText('제목'), '반복 테스트');
      await user.type(screen.getByLabelText('날짜'), '2025-01-01');
      await user.type(screen.getByLabelText('시작 시간'), '09:00');
      await user.type(screen.getByLabelText('종료 시간'), '10:00');

      await user.click(screen.getByLabelText('반복 유형'));
      await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '매일-option' }));

      await user.type(screen.getByLabelText('반복 종료일'), '2025-12-31');

      // 에러 메시지 없음
      expect(
        screen.queryByText('반복 종료일은 2025년 12월 31일을 초과할 수 없습니다')
      ).not.toBeInTheDocument();

      // 제출 버튼 활성화
      expect(screen.getByTestId('event-submit-button')).not.toBeDisabled();
    });
  });

  describe('TC-013: 반복 종료일 시작일 이후 검증', () => {
    it('반복 종료일이 시작일보다 이전이면 에러 메시지가 표시된다', async () => {
      const { user } = setup(<App />);

      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText('제목'), '반복 테스트');
      await user.type(screen.getByLabelText('날짜'), '2025-01-10');
      await user.type(screen.getByLabelText('시작 시간'), '09:00');
      await user.type(screen.getByLabelText('종료 시간'), '10:00');

      await user.click(screen.getByLabelText('반복 유형'));
      await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '매일-option' }));

      // 시작일보다 이른 종료일 입력
      await user.type(screen.getByLabelText('반복 종료일'), '2025-01-05');

      expect(screen.getByText('반복 종료일은 시작일 이후여야 합니다')).toBeInTheDocument();
      expect(screen.getByTestId('event-submit-button')).toBeDisabled();
    });

    it('반복 종료일이 시작일과 같으면 에러 메시지가 표시된다', async () => {
      const { user } = setup(<App />);

      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText('제목'), '반복 테스트');
      await user.type(screen.getByLabelText('날짜'), '2025-01-10');
      await user.type(screen.getByLabelText('시작 시간'), '09:00');
      await user.type(screen.getByLabelText('종료 시간'), '10:00');

      await user.click(screen.getByLabelText('반복 유형'));
      await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '매일-option' }));

      await user.type(screen.getByLabelText('반복 종료일'), '2025-01-10');

      expect(screen.getByText('반복 종료일은 시작일 이후여야 합니다')).toBeInTheDocument();
    });
  });

  describe('TC-014: 반복 유형 선택 시 종료일 필수', () => {
    it('반복 유형을 선택하고 종료일을 비우면 에러 메시지가 표시된다', async () => {
      const { user } = setup(<App />);

      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText('제목'), '반복 테스트');
      await user.type(screen.getByLabelText('날짜'), '2025-01-10');
      await user.type(screen.getByLabelText('시작 시간'), '09:00');
      await user.type(screen.getByLabelText('종료 시간'), '10:00');

      await user.click(screen.getByLabelText('반복 유형'));
      await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '매일-option' }));

      // 종료일 필드가 필수이지만 비어있음
      await user.click(screen.getByTestId('event-submit-button'));

      expect(screen.getByText('반복 종료일을 입력해주세요')).toBeInTheDocument();
    });
  });
});

describe('TC-016, TC-017: 반복 일정 아이콘 표시', () => {
  it('반복 일정은 반복 아이콘이 표시된다', async () => {
    const recurringEvent: Event = {
      id: '1',
      title: '반복 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '반복 일정',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-10-20',
        id: 'repeat-1',
      },
      notificationTime: 10,
    };

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [recurringEvent] });
      })
    );

    setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 반복 아이콘 확인
    const icon = screen.getByLabelText('반복 일정');
    expect(icon).toBeInTheDocument();
  });

  it('반복하지 않는 일정은 반복 아이콘이 표시되지 않는다', async () => {
    const nonRecurringEvent: Event = {
      id: '1',
      title: '단일 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '단일 일정',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 10,
    };

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [nonRecurringEvent] });
      })
    );

    setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 반복 아이콘 없음
    expect(screen.queryByLabelText('반복 일정')).not.toBeInTheDocument();
  });
});

describe('TC-037: 반복 일정은 겹침 감지 제외', () => {
  it('반복 일정 생성 시 겹침 경고가 표시되지 않는다', async () => {
    const existingRecurringEvent: Event = {
      id: '1',
      title: '기존 반복 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '반복 일정',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-10-20',
        id: 'repeat-1',
      },
      notificationTime: 10,
    };

    setupMockHandlerCreation([existingRecurringEvent]);

    const { user } = setup(<App />);

    // Fill form without submitting yet - need to add repeat settings before submitting
    await user.click(screen.getAllByText('일정 추가')[0]);

    await user.type(screen.getByLabelText('제목'), '새 반복 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '09:30');
    await user.type(screen.getByLabelText('종료 시간'), '10:30');
    await user.type(screen.getByLabelText('설명'), '겹치는 반복 일정');
    await user.type(screen.getByLabelText('위치'), '회의실 B');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 유형 설정
    await user.click(screen.getByLabelText('반복 유형'));
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '매일-option' }));
    await user.type(screen.getByLabelText('반복 종료일'), '2025-10-20');

    // Now submit the form
    await user.click(screen.getByTestId('event-submit-button'));

    // 겹침 경고 없음
    expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
  });
});

describe('TC-040: 주간 반복 일정 요일 유지', () => {
  it('주간 반복 일정이 동일한 요일에 생성된다', async () => {
    const weeklyEvents: Event[] = [
      {
        id: '1',
        title: '주간 회의',
        date: '2025-10-06', // Monday
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 반복',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-27',
          id: 'weekly-1',
        },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '주간 회의',
        date: '2025-10-13', // Monday
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 반복',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-27',
          id: 'weekly-1',
        },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '주간 회의',
        date: '2025-10-20', // Monday
        startTime: '09:00',
        endTime: '10:00',
        description: '주간 반복',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-27',
          id: 'weekly-1',
        },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: weeklyEvents });
      })
    );

    setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 모든 이벤트가 월요일인지 확인
    weeklyEvents.forEach((event) => {
      const date = new Date(event.date);
      expect(date.getUTCDay()).toBe(1); // Monday = 1
    });

    // 이벤트 표시 확인
    const eventList = within(screen.getByTestId('event-list'));
    const events = eventList.getAllByText('주간 회의');
    expect(events).toHaveLength(3);
  });
});
