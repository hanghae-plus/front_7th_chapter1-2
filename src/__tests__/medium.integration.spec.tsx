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

describe('Epic1: 반복 일정 관리', () => {
  describe('Story S01-S02: 반복 일정 생성', () => {
    it('매일 반복 일정을 생성하면 서버에 정상적으로 저장된다', async () => {
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      // 일정 추가 버튼 클릭
      await user.click(screen.getAllByText('일정 추가')[0]);

      // 일정 정보 입력
      await user.type(screen.getByLabelText('제목'), '매일 운동');
      await user.type(screen.getByLabelText('날짜'), '2025-10-01');
      await user.type(screen.getByLabelText('시작 시간'), '07:00');
      await user.type(screen.getByLabelText('종료 시간'), '08:00');
      await user.type(screen.getByLabelText('설명'), '아침 조깅');
      await user.type(screen.getByLabelText('위치'), '공원');
      await user.click(screen.getByLabelText('카테고리'));
      await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '개인-option' }));

      // 반복 일정 설정 - MUI Checkbox는 role="checkbox"로 접근
      const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
      await user.click(repeatCheckbox);

      // 반복 유형 선택 (매일) - 상태 업데이트 대기
      await waitFor(() => {
        expect(screen.getByTestId('repeat-type-select')).toBeInTheDocument();
      });
      // MUI Select는 role="combobox"를 사용
      const repeatTypeCombobox = within(screen.getByTestId('repeat-type-select')).getByRole(
        'combobox'
      );
      await user.click(repeatTypeCombobox);
      await user.click(screen.getByRole('option', { name: '매일' }));

      // 반복 종료일 설정
      await user.type(screen.getByTestId('repeat-end-date-input'), '2025-10-05');

      // 저장
      await user.click(screen.getByTestId('event-submit-button'));

      // 저장 성공 확인
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('매일 운동')).toBeInTheDocument();
    });

    it('매주 반복 일정을 생성하면 서버에 정상적으로 저장된다', async () => {
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      // 일정 추가
      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText('제목'), '주간 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-10-06'); // 월요일
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      await user.type(screen.getByLabelText('설명'), '주간 스프린트 미팅');
      await user.type(screen.getByLabelText('위치'), '회의실');
      await user.click(screen.getByLabelText('카테고리'));
      await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '업무-option' }));

      // 반복 일정 설정 - MUI Checkbox는 role="checkbox"로 접근
      const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
      await user.click(repeatCheckbox);

      // 반복 유형 선택 (매주) - 상태 업데이트 대기
      await waitFor(() => {
        expect(screen.getByTestId('repeat-type-select')).toBeInTheDocument();
      });
      // MUI Select는 role="combobox"를 사용
      const repeatTypeCombobox = within(screen.getByTestId('repeat-type-select')).getByRole(
        'combobox'
      );
      await user.click(repeatTypeCombobox);
      await user.click(screen.getByRole('option', { name: '매주' }));

      // 반복 종료일 설정
      await user.type(screen.getByTestId('repeat-end-date-input'), '2025-10-27');

      // 저장
      await user.click(screen.getByTestId('event-submit-button'));

      // 저장 성공 확인
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('주간 회의')).toBeInTheDocument();
    });
  });

  describe('Story S03-S04: 특수 규칙 (31일/윤일)', () => {
    it('매월 반복 일정에서 31일 규칙이 적용된다', async () => {
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      // 일정 추가
      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText('제목'), '월말 결산');
      await user.type(screen.getByLabelText('날짜'), '2025-10-31');
      await user.type(screen.getByLabelText('시작 시간'), '17:00');
      await user.type(screen.getByLabelText('종료 시간'), '18:00');
      await user.type(screen.getByLabelText('설명'), '재무 결산');
      await user.type(screen.getByLabelText('위치'), '본사');
      await user.click(screen.getByLabelText('카테고리'));
      await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '업무-option' }));

      // 반복 일정 설정 - MUI Checkbox는 role="checkbox"로 접근
      const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
      await user.click(repeatCheckbox);

      // 반복 유형 선택 (매월) - 상태 업데이트 대기
      await waitFor(() => {
        expect(screen.getByTestId('repeat-type-select')).toBeInTheDocument();
      });
      // MUI Select는 role="combobox"를 사용
      const repeatTypeCombobox = within(screen.getByTestId('repeat-type-select')).getByRole(
        'combobox'
      );
      await user.click(repeatTypeCombobox);
      await user.click(screen.getByRole('option', { name: '매월' }));

      // 반복 종료일 설정
      await user.type(screen.getByTestId('repeat-end-date-input'), '2026-12-31');

      // 저장
      await user.click(screen.getByTestId('event-submit-button'));

      // 저장 성공 확인
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('월말 결산')).toBeInTheDocument();
    });

    it('매년 반복 일정에서 윤일 규칙이 적용된다', async () => {
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      // 일정 추가
      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText('제목'), '연간 행사');
      await user.type(screen.getByLabelText('날짜'), '2025-10-15');
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.type(screen.getByLabelText('종료 시간'), '15:00');
      await user.type(screen.getByLabelText('설명'), '매년 반복');
      await user.type(screen.getByLabelText('위치'), '행사장');
      await user.click(screen.getByLabelText('카테고리'));
      await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '개인-option' }));

      // 반복 일정 설정 - MUI Checkbox는 role="checkbox"로 접근
      const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
      await user.click(repeatCheckbox);

      // 반복 유형 선택 (매년) - 상태 업데이트 대기
      await waitFor(() => {
        expect(screen.getByTestId('repeat-type-select')).toBeInTheDocument();
      });
      // MUI Select는 role="combobox"를 사용
      const repeatTypeCombobox = within(screen.getByTestId('repeat-type-select')).getByRole(
        'combobox'
      );
      await user.click(repeatTypeCombobox);
      await user.click(screen.getByRole('option', { name: '매년' }));

      // 반복 종료일 설정
      await user.type(screen.getByTestId('repeat-end-date-input'), '2030-10-15');

      // 저장
      await user.click(screen.getByTestId('event-submit-button'));

      // 저장 성공 확인
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('연간 행사')).toBeInTheDocument();
    });
  });

  describe('Story S05-S06: UI 기능', () => {
    it('반복 일정 체크박스를 토글하면 반복 설정 UI가 나타나고 사라진다', async () => {
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      // 일정 추가 버튼 클릭
      await user.click(screen.getAllByText('일정 추가')[0]);

      // 반복 일정 체크박스 확인
      const repeatCheckbox = screen.getByTestId('repeat-checkbox');
      expect(repeatCheckbox).toBeInTheDocument();

      // 초기에는 반복 설정 UI가 보이지 않음
      expect(screen.queryByTestId('repeat-type-select')).not.toBeInTheDocument();

      // 반복 일정 활성화
      await user.click(repeatCheckbox);

      // 반복 설정 UI가 나타남 (비동기 업데이트 대기)
      await waitFor(() => {
        expect(screen.getByTestId('repeat-type-select')).toBeInTheDocument();
      });
      expect(screen.getByTestId('repeat-interval-input')).toBeInTheDocument();
      expect(screen.getByTestId('repeat-end-date-input')).toBeInTheDocument();

      // 다시 비활성화
      await user.click(repeatCheckbox);

      // 반복 설정 UI가 사라짐
      await waitFor(() => {
        expect(screen.queryByTestId('repeat-type-select')).not.toBeInTheDocument();
      });
    });

    it('캘린더에서 반복 일정에 반복 아이콘이 표시된다', async () => {
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      // 반복 일정 추가
      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText('제목'), '반복 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-10-15');
      await user.type(screen.getByLabelText('시작 시간'), '09:00');
      await user.type(screen.getByLabelText('종료 시간'), '10:00');
      await user.type(screen.getByLabelText('설명'), '주간 회의');
      await user.type(screen.getByLabelText('위치'), '회의실');
      await user.click(screen.getByLabelText('카테고리'));
      await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '업무-option' }));

      // 반복 일정 설정
      const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
      await user.click(repeatCheckbox);

      await waitFor(() => {
        expect(screen.getByTestId('repeat-type-select')).toBeInTheDocument();
      });

      const repeatTypeCombobox = within(screen.getByTestId('repeat-type-select')).getByRole(
        'combobox'
      );
      await user.click(repeatTypeCombobox);
      await user.click(screen.getByRole('option', { name: '매주' }));

      await user.type(screen.getByTestId('repeat-end-date-input'), '2025-10-31');

      // 저장
      await user.click(screen.getByTestId('event-submit-button'));

      // 반복 아이콘이 표시되는지 확인
      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getByText('반복 회의')).toBeInTheDocument();
      });

      // Repeat 아이콘이 존재하는지 확인 (data-testid로 확인)
      const repeatIcons = screen.getAllByTestId('RepeatIcon');
      expect(repeatIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Story S07-S08: 반복 일정 수정', () => {
    it('반복 일정 단일 수정 시 해당 일정만 수정되고 반복이 해제된다', async () => {
      // 반복 일정이 있는 초기 상태 설정
      const repeatEvent: Event = {
        id: '1',
        title: '주간 회의',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '매주 회의',
        location: '회의실',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      };

      const mockEvents: Event[] = [repeatEvent];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          const updatedEvent = (await request.json()) as Event;
          const index = mockEvents.findIndex((event) => event.id === id);
          if (index !== -1) {
            mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
            return HttpResponse.json(mockEvents[index]);
          }
          return new HttpResponse(null, { status: 404 });
        })
      );

      const { user } = setup(<App />);

      // 일정 로딩 대기
      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getByText('주간 회의')).toBeInTheDocument();
      });

      // 일정 수정 버튼 클릭
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // 다이얼로그 확인
      await waitFor(() => {
        expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
        expect(screen.getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
      });

      // "예 (단일 수정)" 클릭
      const singleEditButton = screen.getByRole('button', { name: /예 \(단일 수정\)/i });
      await user.click(singleEditButton);

      // 일정 폼이 열리고 편집 가능한지 확인
      await waitFor(() => {
        expect(screen.getByLabelText('제목')).toHaveValue('주간 회의');
      });

      // 제목 수정
      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '특별 회의');

      // 저장
      await user.click(screen.getByTestId('event-submit-button'));

      // 수정된 일정 확인
      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getByText('특별 회의')).toBeInTheDocument();
      });
    });

    it('반복 일정 전체 수정 시 반복 설정이 유지된다', async () => {
      const repeatEvent: Event = {
        id: '1',
        title: '팀 미팅',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '매주 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      };

      const mockEvents: Event[] = [repeatEvent];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          const updatedEvent = (await request.json()) as Event;
          const index = mockEvents.findIndex((event) => event.id === id);
          if (index !== -1) {
            mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
            return HttpResponse.json(mockEvents[index]);
          }
          return new HttpResponse(null, { status: 404 });
        })
      );

      const { user } = setup(<App />);

      // 일정 로딩 대기
      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getByText('팀 미팅')).toBeInTheDocument();
      });

      // 일정 수정 버튼 클릭
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // 다이얼로그 확인
      await waitFor(() => {
        expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
      });

      // "아니오 (전체 수정)" 클릭
      const allEditButton = screen.getByRole('button', { name: /아니오 \(전체 수정\)/i });
      await user.click(allEditButton);

      // 일정 폼이 열리고 편집 가능한지 확인
      await waitFor(() => {
        expect(screen.getByLabelText('제목')).toHaveValue('팀 미팅');
      });

      // 시간 수정
      const startTimeInput = screen.getByLabelText('시작 시간');
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '15:00');

      const endTimeInput = screen.getByLabelText('종료 시간');
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '16:00');

      // 저장
      await user.click(screen.getByTestId('event-submit-button'));

      // 일정이 여전히 존재하는지 확인
      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getByText('팀 미팅')).toBeInTheDocument();
      });
    });
  });

  describe('Story S09-S10: 반복 일정 삭제', () => {
    it('반복 일정 단일 삭제 시 해당 일정만 삭제된다', async () => {
      const repeatEvent: Event = {
        id: '1',
        title: '매일 운동',
        date: '2025-10-15',
        startTime: '07:00',
        endTime: '08:00',
        description: '아침 운동',
        location: '헬스장',
        category: '개인',
        repeat: { type: 'daily', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      };

      const mockEvents: Event[] = [repeatEvent];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.delete('/api/events/:id', ({ params }) => {
          const { id } = params;
          const index = mockEvents.findIndex((event) => event.id === id);
          if (index !== -1) {
            mockEvents.splice(index, 1);
            return new HttpResponse(null, { status: 204 });
          }
          return new HttpResponse(null, { status: 404 });
        })
      );

      const { user } = setup(<App />);

      // 일정 로딩 대기
      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getByText('매일 운동')).toBeInTheDocument();
      });

      // 일정 삭제 버튼 클릭
      const deleteButtons = screen.getAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      // 다이얼로그 확인
      await waitFor(() => {
        expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
        expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
      });

      // "예 (단일 삭제)" 클릭
      const singleDeleteButton = screen.getByRole('button', { name: /예 \(단일 삭제\)/i });
      await user.click(singleDeleteButton);

      // 일정이 삭제되었는지 확인
      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.queryByText('매일 운동')).not.toBeInTheDocument();
      });
    });

    it('반복 일정 전체 삭제 시 모든 반복 일정이 삭제된다', async () => {
      const repeatEvent: Event = {
        id: '1',
        title: '주간 보고',
        date: '2025-10-15',
        startTime: '16:00',
        endTime: '17:00',
        description: '매주 보고',
        location: '사무실',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      };

      const mockEvents: Event[] = [repeatEvent];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.delete('/api/events/:id', ({ params }) => {
          const { id } = params;
          const index = mockEvents.findIndex((event) => event.id === id);
          if (index !== -1) {
            mockEvents.splice(index, 1);
            return new HttpResponse(null, { status: 204 });
          }
          return new HttpResponse(null, { status: 404 });
        })
      );

      const { user } = setup(<App />);

      // 일정 로딩 대기
      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.getByText('주간 보고')).toBeInTheDocument();
      });

      // 일정 삭제 버튼 클릭
      const deleteButtons = screen.getAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      // 다이얼로그 확인
      await waitFor(() => {
        expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
      });

      // "아니오 (전체 삭제)" 클릭
      const allDeleteButton = screen.getByRole('button', { name: /아니오 \(전체 삭제\)/i });
      await user.click(allDeleteButton);

      // 일정이 삭제되었는지 확인
      await waitFor(() => {
        const eventList = within(screen.getByTestId('event-list'));
        expect(eventList.queryByText('주간 보고')).not.toBeInTheDocument();
      });
    });
  });
});
