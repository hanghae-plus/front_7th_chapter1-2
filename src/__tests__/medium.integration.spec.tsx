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
    expect(eventList.getAllByText('새 회의')[0]).toBeInTheDocument();
    expect(eventList.getAllByText('2025-10-15')[0]).toBeInTheDocument();
    expect(eventList.getAllByText('14:00 - 15:00')[0]).toBeInTheDocument();
    expect(eventList.getAllByText('프로젝트 진행 상황 논의')[0]).toBeInTheDocument();
    expect(eventList.getAllByText('회의실 A')[0]).toBeInTheDocument();
    expect(eventList.getAllByText(/카테고리:\s*업무/)[0]).toBeInTheDocument();
  }, 10000);

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
  }, 10000);

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
    const events = await weekView.findAllByText('이번주 팀 회의');
    expect(events[0]).toBeInTheDocument();
  }, 15000);

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
    const events = await monthView.findAllByText('이번달 팀 회의');
    expect(events[0]).toBeInTheDocument();
  }, 10000);

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2025-01-01'));
    setup(<App />);

    const monthView = screen.getByTestId('month-view');

    // 1월 1일 셀 확인
    const januaryFirstCell = within(monthView).getByText('1').closest('td')!;
    expect(within(januaryFirstCell).getByText('신정')).toBeInTheDocument();
  });

  it('주별 뷰에서 반복 일정에는 반복 아이콘이 표시되고 일반 일정에는 표시되지 않는다', async () => {
    // Mock 데이터로 일반 일정과 반복 일정을 명시적으로 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: '1',
              title: '일반 회의',
              date: '2025-10-02',
              startTime: '09:00',
              endTime: '10:00',
              description: '일반 회의입니다.',
              location: '회의실 A',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
            {
              id: '2',
              title: '반복 회의',
              date: '2025-10-03',
              startTime: '11:00',
              endTime: '12:00',
              description: '반복 회의입니다.',
              location: '회의실 B',
              category: '업무',
              repeat: { type: 'weekly', interval: 1 },
              notificationTime: 10,
            },
          ],
        });
      })
    );

    const { user } = setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // Week View로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    const weekView = within(screen.getByTestId('week-view'));

    // 일반 회의와 반복 회의가 week view에 표시될 때까지 대기
    await weekView.findAllByText('일반 회의');
    await weekView.findAllByText('반복 회의');

    // 일반 회의가 있는 셀 찾기
    const normalEventCell = weekView.getAllByText('일반 회의')[0].closest('div');
    // 일반 일정에는 Repeat 아이콘이 없어야 함
    expect(within(normalEventCell!).queryByTestId('RepeatIcon')).not.toBeInTheDocument();

    // 반복 회의가 있는 셀 찾기
    const recurringEventCell = weekView.getAllByText('반복 회의')[0].closest('div');
    // 반복 일정에는 Repeat 아이콘이 있어야 함
    expect(within(recurringEventCell!).getByTestId('RepeatIcon')).toBeInTheDocument();
  }, 10000);

  it('월별 뷰에서 반복 일정에는 반복 아이콘이 표시되고 일반 일정에는 표시되지 않는다', async () => {
    // Mock 데이터로 일반 일정과 반복 일정을 명시적으로 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({
          events: [
            {
              id: '3',
              title: '일반 미팅',
              date: '2025-10-15',
              startTime: '14:00',
              endTime: '15:00',
              description: '일반 미팅입니다.',
              location: '회의실 C',
              category: '업무',
              repeat: { type: 'none', interval: 0 },
              notificationTime: 10,
            },
            {
              id: '4',
              title: '반복 미팅',
              date: '2025-10-16',
              startTime: '16:00',
              endTime: '17:00',
              description: '반복 미팅입니다.',
              location: '회의실 D',
              category: '업무',
              repeat: { type: 'monthly', interval: 1 },
              notificationTime: 10,
            },
          ],
        });
      })
    );

    setup(<App />);

    // 일정 로딩 완료 대기
    await screen.findByText('일정 로딩 완료!');

    // Month View는 기본값이므로 별도 전환 불필요
    const monthView = within(screen.getByTestId('month-view'));

    // 일반 미팅과 반복 미팅이 month view에 표시될 때까지 대기
    await monthView.findAllByText('일반 미팅');
    await monthView.findAllByText('반복 미팅');

    // 일반 미팅이 있는 셀 찾기
    const normalEventCell = monthView.getAllByText('일반 미팅')[0].closest('div');
    // 일반 일정에는 Repeat 아이콘이 없어야 함
    expect(within(normalEventCell!).queryByTestId('RepeatIcon')).not.toBeInTheDocument();

    // 반복 미팅이 있는 셀 찾기
    const recurringEventCell = monthView.getAllByText('반복 미팅')[0].closest('div');
    // 반복 일정에는 Repeat 아이콘이 있어야 함
    expect(within(recurringEventCell!).getByTestId('RepeatIcon')).toBeInTheDocument();
  }, 10000);
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

describe('반복 일정 수정 시 단일/전체 선택 기능', () => {
  it('반복 일정 단일 수정 시 일반 일정으로 변환된다', async () => {
    const { createRecurringEvent, getCurrentTestDate } = await import('./fixtures/eventFixtures');
    const { setupRecurringEventMocks } = await import('./helpers/mockHelpers');
    const { waitForEventInList, saveEventWithDialogHandling } = await import(
      './helpers/asyncHelpers'
    );
    const { hasRepeatIcon } = await import('./helpers/domHelpers');

    const recurringEvent = createRecurringEvent({
      title: '주간 회의',
      date: getCurrentTestDate(7),
    });

    setupRecurringEventMocks([recurringEvent]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '특별 회의');

    await saveEventWithDialogHandling(user, {
      editOptionsChoice: 'single',
      handleOverlap: true,
    });

    const newEvent = await waitForEventInList('특별 회의');
    expect(newEvent).toBeInTheDocument();
    expect(hasRepeatIcon('특별 회의')).toBe(false);

    const eventList = within(screen.getByTestId('event-list'));
    const allEventElements = eventList.queryAllByText(/./);
    console.log(
      'All events in list:',
      allEventElements.map((el) => el.textContent)
    );

    const allWeeklyMeetings = eventList.queryAllByText('주간 회의');
    console.log('Found "주간 회의" instances:', allWeeklyMeetings.length);

    expect(newEvent).toBeInTheDocument();
    expect(hasRepeatIcon('특별 회의')).toBe(false);
  }, 10000);

  it('반복 일정 전체 수정 시 모든 인스턴스가 업데이트된다', async () => {
    const { createRecurringEvent, getCurrentTestDate } = await import('./fixtures/eventFixtures');
    const { setupRecurringEventMocks } = await import('./helpers/mockHelpers');
    const { waitForEventInList, saveEventWithDialogHandling } = await import(
      './helpers/asyncHelpers'
    );
    const { hasRepeatIcon } = await import('./helpers/domHelpers');

    const recurringEvent = createRecurringEvent({
      title: '주간 회의',
      date: getCurrentTestDate(7),
    });

    setupRecurringEventMocks([recurringEvent]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '팀 미팅');

    await saveEventWithDialogHandling(user, {
      editOptionsChoice: 'all',
      handleOverlap: true,
    });

    const updatedEvent = await waitForEventInList('팀 미팅');
    expect(updatedEvent).toBeInTheDocument();

    const eventList = within(screen.getByTestId('event-list'));
    const allEventElements = eventList.queryAllByText(/./);
    console.log(
      'All events after edit all:',
      allEventElements.map((el) => el.textContent)
    );

    console.log('Has repeat icon for 팀 미팅?', hasRepeatIcon('팀 미팅'));

    expect(updatedEvent).toBeInTheDocument();

    const oldTitleEvents = eventList.queryAllByText('주간 회의');
    expect(oldTitleEvents.length).toBe(0);
  }, 10000);

  it('일반 일정 수정 시 다이얼로그가 표시되지 않는다', async () => {
    const { createNormalEvent, getCurrentTestDate } = await import('./fixtures/eventFixtures');
    const { setupRecurringEventMocks } = await import('./helpers/mockHelpers');
    const { waitForEventInList } = await import('./helpers/asyncHelpers');

    const normalEvent = createNormalEvent({
      title: '단일 미팅',
      date: getCurrentTestDate(9),
    });

    setupRecurringEventMocks([normalEvent]);

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    await waitForEventInList('단일 미팅');

    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 미팅');

    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(
      () => {
        expect(screen.queryByText('반복 일정 수정')).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    const updatedEvent = await waitForEventInList('수정된 미팅');
    expect(updatedEvent).toBeInTheDocument();
  }, 10000);
});

describe('반복 종료 날짜 UI', () => {
  it('반복 일정 체크 시 반복 종료 날짜 필드가 표시된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // "반복 일정" 체크박스 찾기
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });

    // 초기 상태: 반복 종료 날짜 필드가 없어야 함
    expect(screen.queryByLabelText(/반복 종료 날짜/)).not.toBeInTheDocument();

    // "반복 일정" 체크
    await user.click(repeatCheckbox);

    // 반복 종료 날짜 필드가 표시되어야 함
    expect(screen.getByLabelText(/반복 종료 날짜/)).toBeInTheDocument();
  });

  it('반복 일정 체크 해제 시 반복 종료 날짜 필드가 숨겨진다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // "반복 일정" 체크박스 찾기
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });

    // "반복 일정" 체크
    await user.click(repeatCheckbox);

    // 반복 종료 날짜 필드가 표시되어야 함
    expect(screen.getByLabelText(/반복 종료 날짜/)).toBeInTheDocument();

    // "반복 일정" 체크 해제
    await user.click(repeatCheckbox);

    // 반복 종료 날짜 필드가 숨겨져야 함
    expect(screen.queryByLabelText(/반복 종료 날짜/)).not.toBeInTheDocument();
  });

  it('반복 종료 날짜가 시작 날짜보다 이전이면 에러가 표시된다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 반복 일정 체크
    await user.click(screen.getByRole('checkbox', { name: '반복 일정' }));

    // 시작 날짜 입력
    await user.type(screen.getByLabelText('날짜'), '2025-12-31');

    // 종료 날짜를 시작 날짜보다 이전으로 입력
    const endDateField = screen.getByLabelText(/반복 종료 날짜/);
    await user.type(endDateField, '2025-12-01');

    // 에러 메시지가 표시되어야 함
    expect(screen.getByText(/종료 날짜는 시작 날짜 이후여야 합니다/i)).toBeInTheDocument();
  });

  it('반복 종료 날짜가 시작 날짜와 같으면 에러가 표시되지 않는다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 반복 일정 체크
    await user.click(screen.getByRole('checkbox', { name: '반복 일정' }));

    // 시작 날짜 입력
    await user.type(screen.getByLabelText('날짜'), '2025-12-31');

    // 종료 날짜를 시작 날짜와 동일하게 입력
    const endDateField = screen.getByLabelText(/반복 종료 날짜/);
    await user.type(endDateField, '2025-12-31');

    // 에러 메시지가 표시되지 않아야 함
    expect(screen.queryByText(/종료 날짜는 시작 날짜 이후여야 합니다/i)).not.toBeInTheDocument();
  });
});

describe('반복 일정 종료 날짜 통합 테스트', () => {
  it('endDate가 있는 반복 일정이 종료 날짜까지만 Week View에 표시된다', async () => {
    const recurringEventWithEndDate: Event = {
      id: '1',
      title: '기간 제한 회의',
      date: '2025-10-01', // 수요일
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2025-10-15', // 2주 후까지만
      },
      notificationTime: 10,
    };

    // MSW mock 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [recurringEventWithEndDate] });
      })
    );

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // Week View로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // 10/01 (첫 번째 주)에 이벤트가 표시되는지 확인
    expect(screen.getAllByText('기간 제한 회의')[0]).toBeInTheDocument();

    // 다음 주 (10/08)로 이동
    const nextButton = screen.getByRole('button', { name: 'Next' });
    await user.click(nextButton);

    // 10/08 (두 번째 주)에도 이벤트가 표시되는지 확인
    expect(screen.getAllByText('기간 제한 회의')[0]).toBeInTheDocument();

    // 다음 주 (10/15)로 이동
    await user.click(nextButton);

    // 10/15 (세 번째 주, endDate 당일)에도 이벤트가 표시되는지 확인
    expect(screen.getAllByText('기간 제한 회의')[0]).toBeInTheDocument();

    // 다음 주 (10/22)로 이동
    await user.click(nextButton);

    // 10/22 (네 번째 주, endDate 이후)에는 이벤트가 표시되지 않아야 함
    expect(screen.queryByText('기간 제한 회의')).not.toBeInTheDocument();
  });

  it('endDate가 있는 반복 일정이 종료 날짜까지만 Month View에 표시된다', async () => {
    const recurringEventWithEndDate: Event = {
      id: '1',
      title: '월간 리뷰',
      date: '2025-10-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '월간 리뷰 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: {
        type: 'weekly',
        interval: 1,
        endDate: '2025-10-15',
      },
      notificationTime: 10,
    };

    // MSW mock 설정
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [recurringEventWithEndDate] });
      })
    );

    const { user } = setup(<App />);
    await screen.findByText('일정 로딩 완료!');

    // Month View로 전환 (기본 view는 month이므로 전환 불필요)
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'month-option' }));

    // 10월에 3개의 이벤트가 표시되어야 함 (10/01, 10/08, 10/15)
    const monthViewEvents = screen.getAllByText('월간 리뷰');
    expect(monthViewEvents.length).toBeGreaterThanOrEqual(3);

    // 다음 달 (11월)로 이동
    const nextButton = screen.getByRole('button', { name: 'Next' });
    await user.click(nextButton);

    // 11월에는 이벤트가 표시되지 않아야 함 (endDate가 10/15이므로)
    expect(screen.queryByText('월간 리뷰')).not.toBeInTheDocument();
  });
});
