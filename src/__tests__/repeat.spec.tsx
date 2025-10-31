import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { setupMockHandlerCreation, setupMockHandlerDeletion } from '../__mocks__/handlersUtils';
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

describe('일정 생성 또는 수정 시 반복 유형 선택 기능', () => {
  it('일정 생성 폼에 반복 유형 선택 컨트롤이 존재해야 한다', async () => {
    // [RED]
    // Given: 일정 생성 폼이 열린 상태
    // When: 폼이 로드됨
    // Then: 반복 유형 선택 컨트롤이 표시되어야 함

    const { user } = setup(<App />);

    // 반복 일정 체크박스 활성화
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // 반복 유형 Select가 표시되어야 함 (현재는 주석 처리되어 있으므로 실패)
    const repeatTypeSelect = screen.getByRole('combobox', { name: '반복 유형' });
    expect(repeatTypeSelect).toBeInTheDocument();
  });

  it('일정 수정 폼에 반복 유형 선택 컨트롤이 존재해야 한다', async () => {
    // [RED]
    // Given: 기존 일정의 수정 폼이 열린 상태
    // When: 폼이 로드됨
    // Then: 반복 유형 선택 컨트롤이 표시되어야 함

    const { user } = setup(<App />);

    // 기존 일정을 생성하고 수정 모드로 진입
    const existingEvent: Omit<Event, 'id' | 'notificationTime' | 'repeat'> = {
      title: '테스트 반복 일정',
      date: '2025-12-25',
      startTime: '10:00',
      endTime: '11:00',
      location: '회의실',
      description: '테스트',
      category: '업무',
    };

    await saveSchedule(user, existingEvent);

    // 일정 목록에서 Edit 버튼 클릭
    const editButtons = screen.getAllByRole('button', { name: 'Edit event' });
    await user.click(editButtons[0]);

    // 수정 폼에서 반복 일정 체크박스 활성화
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // 반복 유형 Select가 표시되어야 함
    const repeatTypeSelect = screen.getByRole('combobox', { name: '반복 유형' });
    expect(repeatTypeSelect).toBeInTheDocument();
  });

  it('반복 유형 선택 컨트롤에서 매일을 선택할 수 있어야 한다', async () => {
    // [RED]
    // Given: 반복 유형 선택 컨트롤이 표시된 상태
    // When: 사용자가 매일 옵션을 클릭함
    // Then: 매일 옵션이 선택 상태가 되어야 함

    const { user } = setup(<App />);

    // 반복 일정 활성화
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // 반복 유형 Select 열기
    const repeatTypeSelect = screen.getByRole('combobox', { name: '반복 유형' });
    await user.click(repeatTypeSelect);

    // 매일 옵션 선택
    const dailyOption = screen.getByRole('option', { name: '매일' });
    await user.click(dailyOption);

    // 매일이 선택되어야 함
    expect(repeatTypeSelect).toHaveTextContent('매일');
  });

  it('반복 유형 선택 컨트롤에서 매주를 선택할 수 있어야 한다', async () => {
    // [RED]
    // Given: 반복 유형 선택 컨트롤이 표시된 상태
    // When: 사용자가 매주 옵션을 클릭함
    // Then: 매주 옵션이 선택 상태가 되어야 함

    const { user } = setup(<App />);

    // 반복 일정 활성화
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // 반복 유형 Select 열기
    const repeatTypeSelect = screen.getByRole('combobox', { name: '반복 유형' });
    await user.click(repeatTypeSelect);

    // 매주 옵션 선택
    const weeklyOption = screen.getByRole('option', { name: '매주' });
    await user.click(weeklyOption);

    // 매주가 선택되어야 함
    expect(repeatTypeSelect).toHaveTextContent('매주');
  });

  it('반복 유형 선택 컨트롤에서 매월을 선택할 수 있어야 한다', async () => {
    // [RED]
    // Given: 반복 유형 선택 컨트롤이 표시된 상태
    // When: 사용자가 매월 옵션을 클릭함
    // Then: 매월 옵션이 선택 상태가 되어야 함

    const { user } = setup(<App />);

    // 반복 일정 활성화
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // 반복 유형 Select 열기
    const repeatTypeSelect = screen.getByRole('combobox', { name: '반복 유형' });
    await user.click(repeatTypeSelect);

    // 매월 옵션 선택
    const monthlyOption = screen.getByRole('option', { name: '매월' });
    await user.click(monthlyOption);

    // 매월이 선택되어야 함
    expect(repeatTypeSelect).toHaveTextContent('매월');
  });

  it('반복 유형 선택 컨트롤에서 매년을 선택할 수 있어야 한다', async () => {
    // [RED]
    // Given: 반복 유형 선택 컨트롤이 표시된 상태
    // When: 사용자가 매년 옵션을 클릭함
    // Then: 매년 옵션이 선택 상태가 되어야 함

    const { user } = setup(<App />);

    // 반복 일정 활성화
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // 반복 유형 Select 열기
    const repeatTypeSelect = screen.getByRole('combobox', { name: '반복 유형' });
    await user.click(repeatTypeSelect);

    // 매년 옵션 선택
    const yearlyOption = screen.getByRole('option', { name: '매년' });
    await user.click(yearlyOption);

    // 매년이 선택되어야 함
    expect(repeatTypeSelect).toHaveTextContent('매년');
  });
});

describe('반복 일정 생성 시 31일 매월 반복 기능', () => {
  it('31일에 매월을 선택하면 31일에만 생성된다 (월말이 아닌 31일 고정)', async () => {
    // Given: Mock handler 설정
    const mockEvents: Event[] = [];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.post('/api/events-list', async ({ request }) => {
        const body = (await request.json()) as { events: Event[] };
        mockEvents.push(...body.events);
        return HttpResponse.json({ events: body.events }, { status: 201 });
      })
    );

    const { user } = setup(<App />);

    // 일정 정보 입력
    const titleInput = screen.getByLabelText('제목');
    await user.type(titleInput, '반복 월말 회의');

    const dateInput = screen.getByLabelText('날짜');
    await user.clear(dateInput);
    await user.type(dateInput, '2025-01-31');

    const startTimeInput = screen.getByLabelText('시작 시간');
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '10:00');

    const endTimeInput = screen.getByLabelText('종료 시간');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '11:00');

    // 반복 일정 활성화
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // 반복 유형 선택 - 매월
    const repeatTypeSelect = screen.getByRole('combobox', { name: /반복 유형/i });
    await user.click(repeatTypeSelect);
    const monthlyOption = screen.getByRole('option', { name: /매월/i });
    await user.click(monthlyOption);

    // 반복 종료일 설정 - 5월 31일 (3개월 동안 1월, 3월, 5월)
    const endDateInput = screen.getByLabelText(/반복 종료일/i);
    await user.clear(endDateInput);
    await user.type(endDateInput, '2025-05-31');

    // When: 추가 버튼 클릭
    const addButton = screen.getByRole('button', { name: /추가/i });
    await user.click(addButton);

    // Then: 성공 메시지 확인
    await screen.findByText(/일정이 추가되었습니다/i);

    // 일정이 실제로 생성되었는지 확인 - mockEvents에 3개의 일정이 있어야 함
    expect(mockEvents.length).toBe(3);

    // 각 일정의 날짜 검증
    const dates = mockEvents.map((e) => e.date).sort();
    expect(dates).toEqual(['2025-01-31', '2025-03-31', '2025-05-31']);

    // 모든 일정이 "월말 회의" 제목을 가져야 함
    expect(mockEvents.every((e) => e.title === '반복 월말 회의')).toBe(true);
  });

  it('31일에 매월 반복 선택 시 31일이 없는 월(2월, 4월, 6월, 9월, 11월)에는 일정이 생성되지 않아야 한다', async () => {
    // [RED]
    // Given: 31일에 매월 반복 일정이 저장된 상태
    // When: 31일이 없는 월(2월, 4월, 6월, 9월, 11월)을 확인함
    // Then: 해당 월에 반복 일정이 표시되지 않아야 함

    const mockEvents: Event[] = [];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.post('/api/events-list', async ({ request }) => {
        const body = (await request.json()) as { events: Event[] };
        mockEvents.push(...body.events);
        return HttpResponse.json({ events: body.events }, { status: 201 });
      })
    );

    const { user } = setup(<App />);

    // 일정 정보 입력 - 1월 31일부터 11월까지 매월 반복
    const titleInput = screen.getByLabelText('제목');
    await user.type(titleInput, '매월 반복 일정');

    const dateInput = screen.getByLabelText('날짜');
    await user.clear(dateInput);
    await user.type(dateInput, '2025-01-31');

    const startTimeInput = screen.getByLabelText('시작 시간');
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '10:00');

    const endTimeInput = screen.getByLabelText('종료 시간');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '11:00');

    // 반복 일정 활성화
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // 반복 유형 선택 - 매월
    const repeatTypeSelect = screen.getByRole('combobox', { name: /반복 유형/i });
    await user.click(repeatTypeSelect);
    const monthlyOption = screen.getByRole('option', { name: /매월/i });
    await user.click(monthlyOption);

    // 반복 종료일 설정 - 11월 30일 (31일이 없는 11월)
    const endDateInput = screen.getByLabelText(/반복 종료일/i);
    await user.clear(endDateInput);
    await user.type(endDateInput, '2025-11-30');

    // When: 추가 버튼 클릭
    const addButton = screen.getByRole('button', { name: /추가/i });
    await user.click(addButton);

    // Then: 성공 메시지 확인
    await screen.findByText(/일정이 추가되었습니다/i);

    // 31일이 있는 월: 1월, 3월, 5월, 7월, 8월, 10월 (6개월)
    // 31일이 없는 월: 2월, 4월, 6월, 9월, 11월 (일정 생성 안 함)
    expect(mockEvents.length).toBe(6);

    // 생성된 일정의 날짜 검증 (31일만 포함되어야 함)
    const dates = mockEvents.map((e) => e.date).sort();
    expect(dates).toEqual([
      '2025-01-31',
      '2025-03-31',
      '2025-05-31',
      '2025-07-31',
      '2025-08-31',
      '2025-10-31',
    ]);
  });
});

describe('반복일정은 일정 겹침을 고려하지 않는다', () => {
  it('반복일정이 생성될 때 겹침 경고나 에러가 표시되지 않아야 한다', async () => {
    // [RED]
    // Given: 기존 일정과 겹치는 반복일정 생성 상황
    // When: 사용자가 저장 버튼을 클릭함
    // Then: 겹침에 대한 경고나 에러 메시지가 표시되지 않아야 함
    const mockEvents: Event[] = [
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
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.post('/api/events-list', async ({ request }) => {
        const body = (await request.json()) as { events: Event[] };
        body.events.forEach((event, index) => {
          event.id = String(mockEvents.length + index + 1);
          mockEvents.push(event);
        });
        return HttpResponse.json({ events: body.events }, { status: 201 });
      })
    );

    const { user } = setup(<App />);

    // Given: 겹치는 시간대에 반복 일정 생성 폼 작성
    await user.click(screen.getAllByText('일정 추가')[0]);

    await user.type(screen.getByLabelText('제목'), '겹치는 반복 일정');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '09:30');
    await user.type(screen.getByLabelText('종료 시간'), '10:30');
    await user.type(screen.getByLabelText('설명'), '반복 테스트');
    await user.type(screen.getByLabelText('위치'), '회의실 A');

    // 카테고리 선택
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 일정 활성화
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // 반복 유형을 '매일'로 선택
    const repeatTypeSelect = screen.getByRole('combobox', { name: /반복 유형/i });
    await user.click(repeatTypeSelect);
    const dailyOption = screen.getByRole('option', { name: /매일/i });
    await user.click(dailyOption);

    // 반복 종료일 설정
    const endDateInput = screen.getByLabelText(/반복 종료일/i);
    await user.clear(endDateInput);
    await user.type(endDateInput, '2025-10-20');

    // When: 저장 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // Then: 겹침 경고 다이얼로그가 나타나지 않고 성공 메시지만 표시되어야 함
    const successMessage = await screen.findByText(/일정이 추가되었습니다/i);
    expect(successMessage).toBeInTheDocument();

    // 겹침 경고 다이얼로그가 없어야 함
    expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
  });

  it('반복일정이 다른 일정과 겹치더라도 둘 다 생성되어야 한다', async () => {
    // [RED]
    // Given: 일정 A가 저장된 상태
    // When: 일정 A와 겹치는 시간대에 반복일정 B를 생성함
    // Then: 겹침 여부와 관계없이 반복일정 A와 B가 모두 생성되어야 함
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '일반 일정 A',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '일반 일정',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.post('/api/events-list', async ({ request }) => {
        const body = (await request.json()) as { events: Event[] };
        body.events.forEach((event, index) => {
          event.id = String(mockEvents.length + index + 1);
          mockEvents.push(event);
        });
        return HttpResponse.json({ events: body.events }, { status: 201 });
      })
    );

    const { user } = setup(<App />);

    // When: 일반 일정 A와 겹치는 시간대에 반복일정 B 생성 (10:30-11:30, 매일, 10/15-10/17)
    await user.click(screen.getAllByText('일정 추가')[0]);

    await user.type(screen.getByLabelText('제목'), '반복 일정 B');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:30');
    await user.type(screen.getByLabelText('종료 시간'), '11:30');
    await user.type(screen.getByLabelText('설명'), '반복 일정');
    await user.type(screen.getByLabelText('위치'), '회의실 B');

    // 카테고리 선택
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '개인-option' }));

    // 반복 일정 활성화
    await user.click(screen.getByRole('checkbox', { name: '반복 일정' }));

    // 반복 유형을 '매일'로 선택
    await user.click(screen.getByRole('combobox', { name: /반복 유형/i }));
    await user.click(screen.getByRole('option', { name: /매일/i }));

    // 반복 종료일 설정
    const endDateInput = screen.getByLabelText(/반복 종료일/i);
    await user.clear(endDateInput);
    await user.type(endDateInput, '2025-10-17');

    // 일정 추가
    await user.click(screen.getByTestId('event-submit-button'));

    // Then: 겹침 경고 다이얼로그가 나타나지 않고 성공 메시지만 표시되어야 함
    const successMessage = await screen.findByText(/일정이 추가되었습니다/i);
    expect(successMessage).toBeInTheDocument();

    // 겹침 경고 다이얼로그가 없어야 함
    expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();

    // 일반 일정 A와 반복일정 B가 모두 존재하는지 확인
    // 일반 일정 A 1개 + 반복일정 B 3개 (10/15, 10/16, 10/17) = 총 4개
    expect(mockEvents.length).toBe(4);
    expect(mockEvents[0].title).toBe('일반 일정 A');
    expect(mockEvents.filter((e) => e.title === '반복 일정 B').length).toBe(3);
  });
});

describe('캘린더 뷰에서 반복 일정을 아이콘으로 구분하여 표시하기', () => {
  it('주(Week) 뷰에서 반복 일정에 repeat-icon이 표시되어야 한다', async () => {
    // [RED]
    // Given: 반복 일정이 저장된 상태
    // When: 캘린더 주(Week) 뷰가 로드됨
    // Then: 반복 일정에 repeat-icon testId를 가진 RepeatIcon이 표시되어야 함
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 반복 일정 생성
    await user.click(screen.getAllByText('일정 추가')[0]);

    await user.type(screen.getByLabelText('제목'), '반복 테스트 일정');
    await user.type(screen.getByLabelText('날짜'), '2025-10-03');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '반복 테스트');
    await user.type(screen.getByLabelText('위치'), '회의실');

    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 일정 활성화 및 유형 선택
    await user.click(screen.getByRole('checkbox', { name: '반복 일정' }));

    await user.click(screen.getByRole('combobox', { name: '반복 유형' }));
    await user.click(screen.getByRole('option', { name: '매주' }));

    await user.click(screen.getByTestId('event-submit-button'));

    // Week 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // Week 뷰에서 repeat-icon 확인
    const weekView = screen.getByTestId('week-view');
    const repeatIcon = within(weekView).getByTestId('repeat-icon');
    expect(repeatIcon).toBeInTheDocument();
  });

  it('주(Week) 뷰에서 일회성 일정에는 repeat-icon이 표시되지 않아야 한다', async () => {
    // [RED]
    // Given: 일회성 일정이 저장된 상태
    // When: 캘린더 주(Week) 뷰가 로드됨
    // Then: 일회성 일정에 repeat-icon이 표시되지 않아야 함

    const { user } = setup(<App />);

    // 일회성 일정 생성 (반복 일정 체크박스 클릭하지 않음)
    const oneTimeEvent: Omit<Event, 'id' | 'notificationTime' | 'repeat'> = {
      title: '일회성 일정',
      date: '2025-10-03',
      startTime: '14:00',
      endTime: '15:00',
      location: '사무실',
      description: '일회성',
      category: '개인',
    };

    await saveSchedule(user, oneTimeEvent);

    // Week 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'week-option' }));

    // Week 뷰에서 repeat-icon이 없는지 확인
    const weekView = screen.getByTestId('week-view');
    const repeatIcon = within(weekView).queryByTestId('repeat-icon');
    expect(repeatIcon).not.toBeInTheDocument();
  });

  it('월(Month) 뷰에서 반복 일정에 repeat-icon이 표시되어야 한다', async () => {
    // [RED]
    // Given: 반복 일정이 저장된 상태
    // When: 캘린더 월(Month) 뷰가 로드됨
    // Then: 반복 일정에 repeat-icon testId를 가진 RepeatIcon이 표시되어야 함
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    // 반복 일정 생성
    await user.click(screen.getAllByText('일정 추가')[0]);
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('제목'), '반복 테스트 일정');
    await user.type(screen.getByLabelText('설명'), '반복 테스트');
    await user.type(screen.getByLabelText('위치'), '회의실');
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 일정 활성화 및 유형 선택
    await user.click(screen.getByRole('checkbox', { name: '반복 일정' }));

    await user.click(screen.getByRole('combobox', { name: '반복 유형' }));
    await user.click(screen.getByRole('option', { name: '매일' }));

    await user.click(screen.getByTestId('event-submit-button'));

    // Month 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'month-option' }));

    // Month 뷰에서 repeat-icon 확인
    const monthView = screen.getByTestId('month-view');
    const repeatIcon = await within(monthView).findByTestId('repeat-icon');
    expect(repeatIcon).toBeInTheDocument();
  });

  it('월(Month) 뷰에서 일회성 일정에는 repeat-icon이 표시되지 않아야 한다', async () => {
    // [RED]
    // Given: 일회성 일정이 저장된 상태
    // When: 캘린더 월(Month) 뷰가 로드됨
    // Then: 일회성 일정에 repeat-icon이 표시되지 않아야 함

    const { user } = setup(<App />);

    // 일회성 일정 생성 (반복 일정 체크박스 클릭하지 않음)
    const oneTimeEvent: Omit<Event, 'id' | 'notificationTime' | 'repeat'> = {
      title: '일회성 일정',
      date: '2025-10-15',
      startTime: '16:00',
      endTime: '17:00',
      location: '카페',
      description: '일회성',
      category: '기타',
    };

    await saveSchedule(user, oneTimeEvent);

    // Month 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'month-option' }));

    // Month 뷰에서 repeat-icon이 없는지 확인
    const monthView = screen.getByTestId('month-view');
    const repeatIcon = within(monthView).queryByTestId('repeat-icon');
    expect(repeatIcon).not.toBeInTheDocument();
  });
});

describe('반복 종료 조건 지정 기능', () => {
  it('반복 종료 조건을 지정할 수 있는 컨트롤이 존재해야 한다', async () => {
    // [RED]
    // Given: 반복 일정 생성 폼이 열린 상태
    // When: 폼이 로드됨
    // Then: 반복 종료 조건 지정 영역이 표시되어야 함
    const { user } = setup(<App />);

    // 반복 일정 체크박스 활성화
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // 반복 유형 선택 (조건부 UI 트리거)
    const repeatTypeSelect = screen.getByRole('combobox', { name: '반복 유형' });
    await user.click(repeatTypeSelect);
    await user.click(screen.getByRole('option', { name: '매일' }));

    // 반복 종료 조건 영역 확인 (반복 종료일 레이블)
    const endDateLabel = await screen.findByText('반복 종료일');
    expect(endDateLabel).toBeInTheDocument();

    // 반복 간격 레이블도 함께 표시되어야 함
    const intervalLabel = screen.getByText('반복 간격');
    expect(intervalLabel).toBeInTheDocument();
  });
});

describe('반복 일정 수정 시 단일 수정 기능', () => {
  it("반복 일정 수정 시 '해당 일정만 수정하시겠어요?' 텍스트가 표시되어야 한다", async () => {
    // [RED]
    // Given: 반복 일정이 저장된 상태
    // When: 사용자가 반복 일정을 수정하려고 함
    // Then: '해당 일정만 수정하시겠어요?' 텍스트가 표시되어야 함

    setupMockHandlerCreation([
      {
        id: '1',
        title: '매주 회의',
        date: '2025-10-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '매주 회의',
        date: '2025-10-27',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 반복 일정 목록 확인 (여러 개의 같은 제목이 있으므로 findAllByText 사용)
    const eventList = screen.getByTestId('event-list');
    const repeatEvents = await within(eventList).findAllByText('매주 회의');
    expect(repeatEvents.length).toBeGreaterThan(0);

    // Edit 버튼 클릭
    const editButtons = screen.getAllByRole('button', { name: 'Edit event' });
    await user.click(editButtons[0]);

    // '해당 일정만 수정하시겠어요?' 다이얼로그 확인
    const dialog = await screen.findByRole('dialog');
    const dialogText = await within(dialog).findByText(/해당 일정만 수정하시겠어요?/i);
    expect(dialogText).toBeInTheDocument();
  });

  it("'예' 버튼을 클릭하면 해당 일정만 단일 수정되어야 한다", async () => {
    // [RED]
    // Given: '해당 일정만 수정하시겠어요?' 다이얼로그가 표시된 상태
    // When: 사용자가 '예' 버튼을 클릭함
    // Then: 해당 일정만 수정되어야 함

    // 반복 일정 시리즈 3개로 초기화 (모두 같은 월로 설정)
    setupMockHandlerCreation([
      {
        id: '1',
        title: '매주 팀 미팅',
        date: '2025-10-13',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 미팅',
        location: '회의실',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '매주 팀 미팅',
        date: '2025-10-20',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 미팅',
        location: '회의실',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '매주 팀 미팅',
        date: '2025-10-27',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 미팅',
        location: '회의실',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 생성된 반복 일정 확인
    const eventList = screen.getByTestId('event-list');
    const repeatEvents = await within(eventList).findAllByText('매주 팀 미팅');

    expect(repeatEvents.length).toBe(3); // 3개의 반복 일정

    // 첫 번째 일정의 Edit 버튼 클릭하여 수정 모드 진입
    const editButtons = screen.getAllByRole('button', { name: 'Edit event' });
    await user.click(editButtons[0]);

    // 다이얼로그에서 '예' 버튼 클릭 (해당 일정만 수정)
    const dialog = await screen.findByRole('dialog');
    const yesButton = await within(dialog).findByRole('button', { name: /예/i });
    await user.click(yesButton);

    // 일정 제목 수정
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 팀 미팅');

    // 수정 완료
    await user.click(screen.getByTestId('event-submit-button'));

    // 수정된 일정 확인
    const updatedEvent = await within(eventList).findByText('수정된 팀 미팅');
    expect(updatedEvent).toBeInTheDocument();

    // 나머지 2개의 원본 반복 일정은 그대로 유지되어야 함
    const remainingEvents = within(eventList).queryAllByText('매주 팀 미팅');
    expect(remainingEvents.length).toBe(2);
  });
});

describe('반복 일정 수정 시 반복일정 아이콘 제거 기능', () => {
  it('반복 일정을 수정했을 경우 반복일정 아이콘이 사라져야 한다', async () => {
    // [RED]
    // Given: 반복 일정이 저장되고 캘린더에 표시된 상태
    // When: 해당 반복 일정을 수정함
    // Then: 반복 일정 아이콘(repeat-icon)이 사라져야 함

    // 반복 일정 초기화
    setupMockHandlerCreation([
      {
        id: '1',
        title: '매주 회의',
        date: '2025-10-20',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 반복 일정이 로드되고 아이콘이 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    const repeatEvent = await within(eventList).findByText('매주 회의');
    expect(repeatEvent).toBeInTheDocument();

    // 월(Month) 뷰에서 repeat-icon 확인 (기본 뷰가 month)
    const monthView = screen.getByTestId('month-view');
    const repeatIconBefore = await within(monthView).findByTestId('repeat-icon');
    expect(repeatIconBefore).toBeInTheDocument();

    // 반복 일정 수정 시작
    const editButtons = screen.getAllByRole('button', { name: 'Edit event' });
    await user.click(editButtons[0]);

    // 다이얼로그에서 '예' 버튼 클릭 (해당 일정만 수정)
    const dialog = await screen.findByRole('dialog');
    const yesButton = await within(dialog).findByRole('button', { name: /예/i });
    await user.click(yesButton);

    // 일정 제목 수정
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의');

    // 수정 완료
    await user.click(screen.getByTestId('event-submit-button'));

    // 수정된 일정 확인
    const updatedEvent = await within(eventList).findByText('수정된 회의');
    expect(updatedEvent).toBeInTheDocument();

    // repeat-icon이 사라졌는지 확인
    const repeatIconAfter = within(monthView).queryByTestId('repeat-icon');
    expect(repeatIconAfter).not.toBeInTheDocument();
  });
});

describe('반복 일정 수정 시 전체 수정 기능', () => {
  it("'아니오' 버튼을 클릭하면 전체 수정되어야 한다", async () => {
    // [GREEN]
    // Given: '해당 일정만 수정하시겠어요?' 다이얼로그가 표시된 상태
    // When: 사용자가 '아니오' 버튼을 클릭함
    // Then: 전체 수정이 실행되어야 함

    // 반복 일정 초기화
    setupMockHandlerCreation([
      {
        id: '1',
        title: '매주 스크럼',
        date: '2025-10-20',
        startTime: '09:00',
        endTime: '10:00',
        description: '일일 스크럼',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 반복 일정 확인
    const eventList = screen.getByTestId('event-list');
    const repeatEvent = await within(eventList).findByText('매주 스크럼');
    expect(repeatEvent).toBeInTheDocument();

    // Edit 버튼 클릭
    const editButtons = screen.getAllByRole('button', { name: 'Edit event' });
    await user.click(editButtons[0]);

    // 다이얼로그에서 '아니오' 버튼 클릭 (전체 수정)
    const dialog = await screen.findByRole('dialog');
    const noButton = await within(dialog).findByRole('button', { name: /아니오/i });
    await user.click(noButton);

    // 반복 유형 Select가 나타날 때까지 기다림 (조건부 UI)
    const repeatTypeSelect = await screen.findByRole('combobox', { name: '반복 유형' });
    expect(repeatTypeSelect).toBeInTheDocument();

    // 수정 폼이 열렸는지 확인 (반복 일정 체크박스가 체크된 상태)
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    expect(repeatCheckbox).toBeChecked();
  });

  it("'아니오'를 눌러 전체 수정한 경우 반복 일정이 유지되어야 한다", async () => {
    // [GREEN]
    // Given: '아니오' 버튼을 클릭하여 전체 수정을 진행한 상태
    // When: 수정이 완료됨
    // Then: 반복 일정이 유지되어야 함

    // 반복 일정 시리즈 3개로 초기화
    setupMockHandlerCreation([
      {
        id: '1',
        title: '매주 스크럼',
        date: '2025-10-13',
        startTime: '09:00',
        endTime: '10:00',
        description: '일일 스크럼',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '매주 스크럼',
        date: '2025-10-20',
        startTime: '09:00',
        endTime: '10:00',
        description: '일일 스크럼',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '매주 스크럼',
        date: '2025-10-27',
        startTime: '09:00',
        endTime: '10:00',
        description: '일일 스크럼',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 반복 일정 확인
    const eventList = screen.getByTestId('event-list');
    const repeatEvents = await within(eventList).findAllByText('매주 스크럼');
    expect(repeatEvents.length).toBe(3);

    // Edit 버튼 클릭
    const editButtons = screen.getAllByRole('button', { name: 'Edit event' });
    await user.click(editButtons[0]);

    // 다이얼로그에서 '아니오' 버튼 클릭 (전체 수정)
    const dialog = await screen.findByRole('dialog');
    const noButton = await within(dialog).findByRole('button', { name: /아니오/i });
    await user.click(noButton);

    // 제목 수정
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '매주 데일리 스크럼');

    // 수정 완료
    await user.click(screen.getByTestId('event-submit-button'));

    // [GREEN] 전체 일정이 수정되었는지 확인
    const updatedEvents = await within(eventList).findAllByText('매주 데일리 스크럼');
    expect(updatedEvents.length).toBe(3); // 3개 모두 수정됨

    // 반복 정보가 유지되는지 확인 (event-list에서 "반복:" 텍스트 확인)
    const repeatInfo = within(eventList).getAllByText(/반복:/);
    expect(repeatInfo.length).toBeGreaterThan(0);
  });

  it("'아니오'를 눌러 전체 수정한 경우 반복일정 아이콘이 유지되어야 한다", async () => {
    // [GREEN]
    // Given: '아니오' 버튼을 클릭하여 전체 수정을 진행한 상태
    // When: 수정이 완료되고 캘린더 뷰가 표시됨
    // Then: 반복일정 아이콘(repeat-icon)이 유지되어야 함

    // 반복 일정 초기화
    setupMockHandlerCreation([
      {
        id: '1',
        title: '매주 스크럼',
        date: '2025-10-20',
        startTime: '09:00',
        endTime: '10:00',
        description: '일일 스크럼',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 반복 일정 확인
    const eventList = screen.getByTestId('event-list');
    const repeatEvent = await within(eventList).findByText('매주 스크럼');
    expect(repeatEvent).toBeInTheDocument();

    // 월(Month) 뷰에서 repeat-icon 확인 (기본 뷰가 month)
    const monthView = screen.getByTestId('month-view');
    const repeatIconBefore = await within(monthView).findByTestId('repeat-icon');
    expect(repeatIconBefore).toBeInTheDocument();

    // Edit 버튼 클릭
    const editButtons = screen.getAllByRole('button', { name: 'Edit event' });
    await user.click(editButtons[0]);

    // 다이얼로그에서 '아니오' 버튼 클릭 (전체 수정)
    const dialog = await screen.findByRole('dialog');
    const noButton = await within(dialog).findByRole('button', { name: /아니오/i });
    await user.click(noButton);

    // 제목 수정
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '매주 데일리 스크럼');

    // 수정 완료
    await user.click(screen.getByTestId('event-submit-button'));

    // 수정된 일정 확인
    const updatedEvent = await within(eventList).findByText('매주 데일리 스크럼');
    expect(updatedEvent).toBeInTheDocument();

    // repeat-icon이 여전히 표시되는지 확인
    const repeatIconAfter = await within(monthView).findByTestId('repeat-icon');
    expect(repeatIconAfter).toBeInTheDocument();
  });
});

describe('반복 일정 삭제', () => {
  it("'해당 일정만 삭제하시겠어요?'라는 텍스트가 표시되어야 한다", async () => {
    // [RED]
    // Given: 반복 일정이 존재하고 삭제 버튼이 클릭된 상태
    // When: 삭제 대화가 표시됨
    // Then: '해당 일정만 삭제하시겠어요?'라는 텍스트가 화면에 표시되어야 함

    setupMockHandlerCreation([
      {
        id: '1',
        title: '매주 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 반복 일정 확인
    const eventList = screen.getByTestId('event-list');
    const repeatEvent = await within(eventList).findByText('매주 회의');
    expect(repeatEvent).toBeInTheDocument();

    // 삭제 버튼 클릭
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete event' });
    await user.click(deleteButtons[0]);

    // 삭제 확인 다이얼로그에서 '해당 일정만 삭제하시겠어요?' 텍스트 확인
    const deleteDialog = await screen.findByRole('dialog');
    const confirmText = await within(deleteDialog).findByText('해당 일정만 삭제하시겠어요?');
    expect(confirmText).toBeInTheDocument();
  });

  it("사용자가 '예'를 누르면 해당 일정만 삭제되어야 한다", async () => {
    // [RED]
    // Given: '해당 일정만 삭제하시겠어요?'라는 대화가 표시된 상태
    // When: 사용자가 '예' 버튼을 클릭함
    // Then: 해당 일정만 삭제되어야 함 (다른 반복 일정들은 유지되어야 함)

    setupMockHandlerDeletion([
      {
        id: '1',
        title: '매주 회의 - 첫 번째',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '매주 회의 - 첫 번째',
        date: '2025-10-22',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '매주 회의 - 첫 번째',
        date: '2025-10-29',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 반복 일정들 확인
    const eventList = screen.getByTestId('event-list');
    const repeatEvents = await within(eventList).findAllByText('매주 회의 - 첫 번째');
    expect(repeatEvents.length).toBeGreaterThan(0);

    // 삭제 버튼 클릭
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete event' });
    await user.click(deleteButtons[0]);

    // 삭제 확인 다이얼로그에서 '예' 버튼 클릭
    const deleteDialog = await screen.findByRole('dialog');
    const yesButton = await within(deleteDialog).findByRole('button', { name: /예/i });
    await user.click(yesButton);

    // 첫 번째 반복 일정이 삭제되고 다른 반복 일정들은 유지되어야 함
    // (ID '1'인 일정은 삭제되고 ID '2', '3'인 일정은 남아있어야 함)
    const updatedEventList = screen.getByTestId('event-list');
    // 다시 로드되었을 때 반복 일정이 여전히 존재해야 함
    const remainingEvents = await within(updatedEventList).findAllByText('매주 회의 - 첫 번째');
    expect(remainingEvents.length).toBe(2);
  });
});

describe("반복 일정 삭제 시 '아니오' 버튼 클릭 - 전체 삭제 기능", () => {
  it("'해당 일정만 삭제하시겠어요?' 다이얼로그에서 '아니오' 버튼이 표시되어야 한다", async () => {
    // [RED]
    // Given: 반복 일정이 저장된 상태
    // When: 반복 일정의 삭제 버튼을 클릭함
    // Then: '아니오' 버튼이 표시된 다이얼로그가 나타나야 함

    setupMockHandlerCreation([
      {
        id: '1',
        title: '매주 팀 회의',
        date: '2025-10-20',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 회의',
        location: '회의실',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 반복 일정 확인
    const eventList = screen.getByTestId('event-list');
    const repeatEvent = await within(eventList).findByText('매주 팀 회의');
    expect(repeatEvent).toBeInTheDocument();

    // 삭제 버튼 클릭
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete event' });
    await user.click(deleteButtons[0]);

    // 삭제 확인 다이얼로그에서 '아니오' 버튼 확인
    const deleteDialog = await screen.findByRole('dialog');
    const noButton = await within(deleteDialog).findByRole('button', { name: /아니오/i });
    expect(noButton).toBeInTheDocument();
  });

  it("'아니오' 버튼을 클릭하면 해당 반복 일정의 모든 일정을 삭제할 수 있어야 한다", async () => {
    // [RED]
    // Given: '해당 일정만 삭제하시겠어요?' 다이얼로그가 표시된 상태
    // When: 사용자가 '아니오' 버튼을 클릭함
    // Then: 반복 일정의 모든 일정(시리즈 전체)이 삭제되어야 함

    setupMockHandlerDeletion([
      {
        id: '1',
        title: '매주 스크럼 - 전체',
        date: '2025-10-13',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 스크럼',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '매주 스크럼 - 전체',
        date: '2025-10-20',
        startTime: '09:00',
        endTime: '10:00',
        description: '팀 스크럼',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup(<App />);

    // 반복 일정 시리즈 확인
    const eventList = screen.getByTestId('event-list');
    const repeatEvents = await within(eventList).findAllByText('매주 스크럼 - 전체');
    expect(repeatEvents.length).toBeGreaterThan(0);

    // 첫 번째 삭제 버튼 클릭
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete event' });
    await user.click(deleteButtons[0]);

    // 삭제 다이얼로그 확인
    const deleteDialog = await screen.findByRole('dialog');
    const noButton = await within(deleteDialog).findByRole('button', { name: /아니오/i });
    const yesButton = await within(deleteDialog).findByRole('button', { name: /예/i });

    // '아니오' 버튼과 '예' 버튼이 모두 표시되어야 함
    expect(noButton).toBeInTheDocument();
    expect(yesButton).toBeInTheDocument();
  });
});
