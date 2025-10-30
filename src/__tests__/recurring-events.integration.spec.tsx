import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerRecurringDeletion,
  setupMockHandlerRecurringUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

const theme = createTheme();

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

const navigateMonth = async (user: UserEvent, direction: 'next' | 'prev') => {
  const label = direction === 'next' ? 'Next' : 'Previous';
  await user.click(screen.getByLabelText(label));
};

const saveRecurringSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeatGroupId'> & { repeatEndDate?: string }
) => {
  const {
    title,
    date,
    startTime,
    endTime,
    location,
    description,
    category,
    repeat,
    repeatEndDate,
  } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  if (description) await user.type(screen.getByLabelText('설명'), description);
  if (location) await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  // 반복 일정 설정
  if (repeat.type !== 'none') {
    await user.click(screen.getByLabelText('반복 일정'));

    // 반복 설정 UI가 렌더링될 때까지 대기
    const repeatTypeSelect = await screen.findByLabelText('반복 유형');
    await user.click(repeatTypeSelect);
    await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: `${repeat.type}-option` }));

    if (repeatEndDate) {
      await user.type(screen.getByLabelText('반복 종료일'), repeatEndDate);
    }
  }

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정 통합 테스트', () => {
  describe('반복 일정 생성', () => {
    it('사용자가 매일 반복 일정을 생성할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-01-01'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '매일 회의',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-07' },
        repeatEndDate: '2025-01-07',
      });

      // 성공 메시지 확인
      expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();

      // 월간 뷰에서 2025-01-01부터 2025-01-07까지 7일간 일정 표시 확인
      const monthView = within(screen.getByTestId('month-view'));
      const eventElements = monthView.getAllByText('매일 회의');
      expect(eventElements).toHaveLength(7);

      // 반복 아이콘 표시 확인
      const repeatIcons = screen.getAllByTestId('repeat-icon');
      expect(repeatIcons.length).toBeGreaterThanOrEqual(7);

      // 일정 목록에 반복 정보 표시 확인
      const eventList = within(screen.getByTestId('event-list'));
      const repeatTexts = eventList.getAllByText('반복: 1일마다 (종료: 2025-01-07)');
      expect(repeatTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('사용자가 매주 반복 일정을 생성할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-01-01'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '주간 팀 회의',
        date: '2025-01-01',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-01-29' },
        repeatEndDate: '2025-01-29',
      });

      // 성공 메시지 확인
      expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();

      // 일정 목록에 반복 정보 표시 확인
      const eventList = within(screen.getByTestId('event-list'));
      const repeatTexts = eventList.getAllByText('반복: 1주마다 (종료: 2025-01-29)');
      expect(repeatTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('사용자가 매월 반복 일정을 생성할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-01-15'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '월간 보고',
        date: '2025-01-15',
        startTime: '16:00',
        endTime: '17:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-04-15' },
        repeatEndDate: '2025-04-15',
      });

      // 성공 메시지 확인
      expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();

      // 일정 목록에 반복 정보 표시 확인
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('반복: 1월마다 (종료: 2025-04-15)')).toBeInTheDocument();
    });

    it('사용자가 매년 반복 일정을 생성할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-01-01'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '신년 회의',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'yearly', interval: 1, endDate: '2027-01-01' },
        repeatEndDate: '2027-01-01',
      });

      // 성공 메시지 확인
      expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();

      // 일정 목록에 반복 정보 표시 확인
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('반복: 1년마다 (종료: 2027-01-01)')).toBeInTheDocument();
    });

    it('반복 종료일 없이 무한 반복 일정을 생성할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-01-01'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '매일 알림',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '09:30',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
      });

      // 성공 메시지 확인
      expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();

      // 일정 목록에 반복 정보 표시 확인 (종료일 정보 없음)
      const eventList = within(screen.getByTestId('event-list'));
      const repeatTexts = eventList.getAllByText('반복: 1일마다');
      expect(repeatTexts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('반복 일정 경계값 케이스', () => {
    it('매월 31일 반복 시 31일이 없는 달은 건너뛴다', async () => {
      vi.setSystemTime(new Date('2025-01-31'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '월말 정산',
        date: '2025-01-31',
        startTime: '18:00',
        endTime: '19:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-06-30' },
        repeatEndDate: '2025-06-30',
      });

      // 성공 메시지 확인
      expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();

      // 1월 31일 - 일정 있어야 함
      const monthView = within(screen.getByTestId('month-view'));
      expect(monthView.getByText('월말 정산')).toBeInTheDocument();

      // 2월로 이동 - 31일이 없으므로 일정 없어야 함
      await navigateMonth(user, 'next');
      expect(monthView.queryByText('월말 정산')).not.toBeInTheDocument();

      // 3월로 이동 - 31일이 있으므로 일정 있어야 함
      await navigateMonth(user, 'next');
      expect(monthView.getByText('월말 정산')).toBeInTheDocument();

      // 4월로 이동 - 30일까지만 있으므로 일정 없어야 함
      await navigateMonth(user, 'next');
      expect(monthView.queryByText('월말 정산')).not.toBeInTheDocument();

      // 5월로 이동 - 31일이 있으므로 일정 있어야 함
      await navigateMonth(user, 'next');
      expect(monthView.getByText('월말 정산')).toBeInTheDocument();
    });

    it('윤년 2월 29일 매년 반복 시 윤년에만 표시된다', async () => {
      vi.setSystemTime(new Date('2024-02-29'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '윤년 기념일',
        date: '2024-02-29',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'yearly', interval: 1, endDate: '2030-02-28' },
        repeatEndDate: '2030-02-28',
      });

      // 성공 메시지 확인
      expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();

      // 2024년 2월 (윤년) - 일정 있어야 함
      const monthView = within(screen.getByTestId('month-view'));
      expect(monthView.getByText('윤년 기념일')).toBeInTheDocument();

      // 2025년 2월로 이동 (평년) - 일정 없어야 함
      for (let i = 0; i < 12; i++) {
        await navigateMonth(user, 'next');
      }
      expect(monthView.queryByText('윤년 기념일')).not.toBeInTheDocument();

      // 2026년 2월로 이동 (평년) - 일정 없어야 함
      for (let i = 0; i < 12; i++) {
        await navigateMonth(user, 'next');
      }
      expect(monthView.queryByText('윤년 기념일')).not.toBeInTheDocument();

      // 2027년 2월로 이동 (평년) - 일정 없어야 함
      for (let i = 0; i < 12; i++) {
        await navigateMonth(user, 'next');
      }
      expect(monthView.queryByText('윤년 기념일')).not.toBeInTheDocument();

      // 2028년 2월로 이동 (윤년) - 일정 있어야 함
      for (let i = 0; i < 12; i++) {
        await navigateMonth(user, 'next');
      }
      expect(monthView.getByText('윤년 기념일')).toBeInTheDocument();
    }, 10000);
  });

  describe('반복 일정 수정', () => {
    it('반복 일정의 단일 인스턴스를 수정할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-01-01'));
      setupMockHandlerRecurringUpdating();

      const { user } = setup(<App />);

      // 일정 리스트에서 '매일 회의' 일정 수정 버튼 클릭
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]); // 원본 반복 일정

      // 다이얼로그 즉시 표시 확인
      expect(await screen.findByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();

      // "예" 버튼 클릭 (단일 인스턴스 수정)
      await user.click(screen.getByText('예'));

      // 폼이 표시되고 반복 일정 체크박스가 해제되어 있는지 확인
      expect(await screen.findByLabelText('제목')).toBeInTheDocument();
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      expect(repeatCheckbox).not.toBeChecked();

      // 제목 변경
      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '긴급 회의');

      // 시간 변경
      await user.clear(screen.getByLabelText('시작 시간'));
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.clear(screen.getByLabelText('종료 시간'));
      await user.type(screen.getByLabelText('종료 시간'), '11:00');

      // 제출 (다이얼로그 없이 즉시 처리)
      await user.click(screen.getByTestId('event-submit-button'));

      // 성공 메시지 확인
      expect(await screen.findByText('일정이 수정되었습니다.')).toBeInTheDocument();

      // 분할된 일정 확인
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getAllByText(/회의/)).toHaveLength(7);
    });

    it('반복 일정 전체를 수정할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-01-01'));
      setupMockHandlerRecurringUpdating();

      const { user } = setup(<App />);

      // 일정 리스트에서 '매일 회의' 일정 수정 버튼 클릭
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]); // 원본 반복 일정

      // 다이얼로그 즉시 표시 확인
      expect(await screen.findByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();

      // "아니오" 버튼 클릭 (전체 수정)
      await user.click(screen.getByText('아니오'));

      // 폼이 표시되고 반복 일정 체크박스가 선택되어 있는지 확인
      expect(await screen.findByLabelText('제목')).toBeInTheDocument();
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      expect(repeatCheckbox).toBeChecked();

      // 제목 변경
      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '전체 회의');

      // 시간 변경
      await user.clear(screen.getByLabelText('시작 시간'));
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.clear(screen.getByLabelText('종료 시간'));
      await user.type(screen.getByLabelText('종료 시간'), '15:00');

      // 제출 (다이얼로그 없이 즉시 처리)
      await user.click(screen.getByTestId('event-submit-button'));

      // 성공 메시지 확인
      expect(await screen.findByText('일정이 수정되었습니다.')).toBeInTheDocument();

      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getAllByText('전체 회의')).toHaveLength(7);
    });
  });

  describe('반복 일정 삭제', () => {
    it('반복 일정의 단일 인스턴스를 삭제할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-01-01'));
      setupMockHandlerRecurringDeletion();

      const { user } = setup(<App />);

      // 일정 리스트에서 '매일 회의' 일정 삭제 버튼 클릭
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]); // 원본 반복 일정

      // 다이얼로그 확인
      expect(await screen.findByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
      await user.click(screen.getByText('예'));

      // 성공 메시지 확인
      expect(await screen.findByText('일정이 삭제되었습니다.')).toBeInTheDocument();

      const eventList = within(screen.getByTestId('event-list'));
      expect(await eventList.findAllByText('매일 회의')).toHaveLength(6);
    });

    it('반복 일정 전체를 삭제할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-01-01'));
      setupMockHandlerRecurringDeletion();

      const { user } = setup(<App />);

      // 일정 리스트에서 '매일 회의' 일정 삭제 버튼 클릭
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]); // 원본 반복 일정

      // 다이얼로그 확인
      expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
      await user.click(screen.getByText('아니오'));

      // 성공 메시지 확인
      expect(screen.getByText('일정이 삭제되었습니다.')).toBeInTheDocument();

      // 모든 일정이 삭제되었는지 확인
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.queryByText('매일 회의')).not.toBeInTheDocument();
    });
  });

  describe('반복 일정 뷰 표시', () => {
    it('반복 일정이 주간 뷰에 올바르게 표시된다', async () => {
      vi.setSystemTime(new Date('2025-01-01'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '매일 회의',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-07' },
        repeatEndDate: '2025-01-07',
      });

      // 주간 뷰로 변경
      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      // 주간 뷰에서 일정 확인
      const weekView = within(screen.getByTestId('week-view'));
      const eventElements = weekView.getAllByText('매일 회의');
      expect(eventElements).toHaveLength(4);

      // 반복 아이콘 표시 확인
      const repeatIcons = weekView.getAllByTestId('repeat-icon');
      expect(repeatIcons.length).toBeGreaterThanOrEqual(4);
    });

    it('반복 일정이 월간 뷰에 올바르게 표시된다', async () => {
      vi.setSystemTime(new Date('2025-01-15'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '매일 회의',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-31' },
        repeatEndDate: '2025-01-31',
      });

      // 월간 뷰에서 일정 확인
      const monthView = within(screen.getByTestId('month-view'));
      const eventElements = monthView.getAllByText('매일 회의');
      expect(eventElements).toHaveLength(31);

      // 반복 아이콘 표시 확인
      const repeatIcons = monthView.getAllByTestId('repeat-icon');
      expect(repeatIcons.length).toBeGreaterThanOrEqual(31);
    });
  });

  describe('반복 일정 유효성 검증', () => {
    it('반복 종료일은 시작일 이후여야 한다', async () => {
      vi.setSystemTime(new Date('2025-01-10'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '매일 회의',
        date: '2025-01-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-05' },
        repeatEndDate: '2025-01-05', // 시작일보다 이전
      });

      // 에러 메시지 확인
      expect(screen.getByText('반복 종료일은 시작일 이후여야 합니다.')).toBeInTheDocument();
    });

    it('반복 일정은 겹침 검사를 하지 않는다', async () => {
      vi.setSystemTime(new Date('2025-01-01'));
      setupMockHandlerCreation([
        {
          id: '1',
          title: '기존 회의',
          date: '2025-01-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ]);

      const { user } = setup(<App />);

      await saveRecurringSchedule(user, {
        title: '매일 회의',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-07' },
        repeatEndDate: '2025-01-07',
      });

      // 일정 겹침 경고가 표시되지 않음
      expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();

      // 성공 메시지 확인
      expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();
    });
  });

  describe('달력 이동 시 반복 일정 표시', () => {
    it('과거에 시작된 매일 반복 일정이 다음 달에도 표시된다', async () => {
      vi.setSystemTime(new Date('2025-10-01'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      // 10월 3일부터 11월 30일까지 매일 반복 일정 생성
      await saveRecurringSchedule(user, {
        title: '매일 스크럼',
        date: '2025-10-03',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-11-30' },
        repeatEndDate: '2025-11-30',
      });

      // 10월 월간 뷰에서 일정 확인 (10/3 ~ 10/31 = 29일)
      const monthViewOct = within(screen.getByTestId('month-view'));
      const eventsOct = monthViewOct.getAllByText('매일 스크럼');
      expect(eventsOct.length).toBeGreaterThanOrEqual(29);

      // 11월로 이동
      await navigateMonth(user, 'next');

      // 11월 월간 뷰에서 일정 확인 (11/1 ~ 11/30 = 30일)
      const monthViewNov = within(screen.getByTestId('month-view'));
      const eventsNov = monthViewNov.getAllByText('매일 스크럼');
      expect(eventsNov.length).toBeGreaterThanOrEqual(30);

      // MUI Repeat 아이콘 확인
      const repeatIconsNov = monthViewNov.getAllByTestId('repeat-icon');
      expect(repeatIconsNov.length).toBeGreaterThanOrEqual(30);

      // 12월로 이동 (반복 종료일 이후)
      await navigateMonth(user, 'next');

      // 12월에는 일정이 없어야 함
      const monthViewDec = within(screen.getByTestId('month-view'));
      expect(monthViewDec.queryByText('매일 스크럼')).not.toBeInTheDocument();
    });

    it('과거에 시작된 매주 반복 일정이 여러 달에 걸쳐 표시된다', async () => {
      vi.setSystemTime(new Date('2025-09-01'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      // 9월 15일(월요일)부터 11월 17일까지 매주 반복 일정 생성
      await saveRecurringSchedule(user, {
        title: '주간 회의',
        date: '2025-09-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-11-17' },
        repeatEndDate: '2025-11-17',
      });

      // 9월 월간 뷰에서 일정 확인 (9/15, 9/22, 9/29 = 3회)
      const monthViewSep = within(screen.getByTestId('month-view'));
      const eventsSep = monthViewSep.getAllByText('주간 회의');
      expect(eventsSep.length).toBeGreaterThanOrEqual(3);

      // 10월로 이동
      await navigateMonth(user, 'next');

      // 10월 월간 뷰에서 매주 월요일 확인 (10/6, 10/13, 10/20, 10/27 = 4회)
      const monthViewOct = within(screen.getByTestId('month-view'));
      const eventsOct = monthViewOct.getAllByText('주간 회의');
      expect(eventsOct.length).toBeGreaterThanOrEqual(4);

      // MUI Repeat 아이콘 확인
      const repeatIconsOct = monthViewOct.getAllByTestId('repeat-icon');
      expect(repeatIconsOct.length).toBeGreaterThanOrEqual(4);

      // 11월로 이동
      await navigateMonth(user, 'next');

      // 11월 월간 뷰에서 확인 (11/3, 11/10, 11/17 = 3회)
      const monthViewNov = within(screen.getByTestId('month-view'));
      const eventsNov = monthViewNov.getAllByText('주간 회의');
      expect(eventsNov.length).toBeGreaterThanOrEqual(3);
    });

    it('과거에 시작된 매월 반복 일정이 장기간 이동 시 표시된다', async () => {
      vi.setSystemTime(new Date('2025-08-01'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      // 8월 10일부터 12월 10일까지 매월 반복 일정 생성
      await saveRecurringSchedule(user, {
        title: '월간 보고서',
        date: '2025-08-10',
        startTime: '16:00',
        endTime: '17:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-12-10' },
        repeatEndDate: '2025-12-10',
      });

      // 8월에서 일정 확인
      const monthViewAug = within(screen.getByTestId('month-view'));
      expect(monthViewAug.getByText('월간 보고서')).toBeInTheDocument();

      // 9월로 이동
      await navigateMonth(user, 'next');
      const monthViewSep = within(screen.getByTestId('month-view'));
      expect(monthViewSep.getByText('월간 보고서')).toBeInTheDocument();

      // 10월로 이동
      await navigateMonth(user, 'next');
      const monthViewOct = within(screen.getByTestId('month-view'));
      expect(monthViewOct.getByText('월간 보고서')).toBeInTheDocument();

      // 11월로 이동
      await navigateMonth(user, 'next');
      const monthViewNov = within(screen.getByTestId('month-view'));
      expect(monthViewNov.getByText('월간 보고서')).toBeInTheDocument();

      // 12월로 이동
      await navigateMonth(user, 'next');
      const monthViewDec = within(screen.getByTestId('month-view'));
      expect(monthViewDec.getByText('월간 보고서')).toBeInTheDocument();

      // MUI Repeat 아이콘 확인
      const repeatIconsDec = monthViewDec.getAllByTestId('repeat-icon');
      expect(repeatIconsDec.length).toBeGreaterThanOrEqual(1);
    });

    it('무한 반복 일정이 달 이동 시 계속 표시된다', async () => {
      vi.setSystemTime(new Date('2025-01-01'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      // 1월 1일부터 무한 반복 일정 생성 (종료일 없음)
      await saveRecurringSchedule(user, {
        title: '매일 알림',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '09:30',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'daily', interval: 1, endDate: undefined },
        repeatEndDate: undefined,
      });

      // 1월 월간 뷰에서 일정 확인
      const monthViewJan = within(screen.getByTestId('month-view'));
      const eventsJan = monthViewJan.getAllByText('매일 알림');
      expect(eventsJan.length).toBeGreaterThanOrEqual(31);

      // 2월로 이동
      await navigateMonth(user, 'next');
      const monthViewFeb = within(screen.getByTestId('month-view'));
      const eventsFeb = monthViewFeb.getAllByText('매일 알림');
      expect(eventsFeb.length).toBeGreaterThanOrEqual(28);

      // 6월까지 이동
      await navigateMonth(user, 'next'); // 3월
      await navigateMonth(user, 'next'); // 4월
      await navigateMonth(user, 'next'); // 5월
      await navigateMonth(user, 'next'); // 6월

      const monthViewJun = within(screen.getByTestId('month-view'));
      const eventsJun = monthViewJun.getAllByText('매일 알림');
      expect(eventsJun.length).toBeGreaterThanOrEqual(30);

      // 5월로 돌아가기
      await navigateMonth(user, 'prev');
      const monthViewMay = within(screen.getByTestId('month-view'));
      const eventsMay = monthViewMay.getAllByText('매일 알림');
      expect(eventsMay.length).toBeGreaterThanOrEqual(31);
    });

    it('주간 뷰에서 과거 시작된 반복 일정이 표시된다', async () => {
      vi.setSystemTime(new Date('2025-10-01'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      // 10월 3일부터 10월 31일까지 매일 반복 일정 생성
      await saveRecurringSchedule(user, {
        title: '매일 스탠드업',
        date: '2025-10-03',
        startTime: '10:00',
        endTime: '10:30',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-31' },
        repeatEndDate: '2025-10-31',
      });

      // 주간 뷰로 변경
      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      // 10월 첫째 주 (9/28 ~ 10/4): 10/3, 10/4 = 2개
      const weekViewFirst = within(screen.getByTestId('week-view'));
      const eventsFirst = weekViewFirst.getAllByText('매일 스탠드업');
      expect(eventsFirst.length).toBeGreaterThanOrEqual(2);

      // 다음 주로 이동 (10/5 ~ 10/11)
      await navigateMonth(user, 'next');
      const weekViewSecond = within(screen.getByTestId('week-view'));
      const eventsSecond = weekViewSecond.getAllByText('매일 스탠드업');
      expect(eventsSecond.length).toBeGreaterThanOrEqual(7);

      // 다음 주로 이동 (10/12 ~ 10/18)
      await navigateMonth(user, 'next');
      const weekViewThird = within(screen.getByTestId('week-view'));
      const eventsThird = weekViewThird.getAllByText('매일 스탠드업');
      expect(eventsThird.length).toBeGreaterThanOrEqual(7);

      // MUI Repeat 아이콘 확인
      const repeatIconsThird = weekViewThird.getAllByTestId('repeat-icon');
      expect(repeatIconsThird.length).toBeGreaterThanOrEqual(7);
    });

    it('반복 종료일이 뷰 범위보다 이전이면 표시되지 않는다', async () => {
      vi.setSystemTime(new Date('2025-08-01'));
      setupMockHandlerCreation();

      const { user } = setup(<App />);

      // 8월 10일부터 8월 20일까지 매일 반복 일정 생성
      await saveRecurringSchedule(user, {
        title: '여름 캠프',
        date: '2025-08-10',
        startTime: '09:00',
        endTime: '17:00',
        description: '',
        location: '',
        category: '가족',
        repeat: { type: 'daily', interval: 1, endDate: '2025-08-20' },
        repeatEndDate: '2025-08-20',
      });

      // 8월 월간 뷰에서 일정 확인
      const monthViewAug = within(screen.getByTestId('month-view'));
      const eventsAug = monthViewAug.getAllByText('여름 캠프');
      expect(eventsAug.length).toBeGreaterThanOrEqual(11); // 8/10 ~ 8/20 = 11일

      // 9월로 이동
      await navigateMonth(user, 'next');

      // 9월에는 일정이 없어야 함 (종료일이 8월 20일)
      const monthViewSep = within(screen.getByTestId('month-view'));
      expect(monthViewSep.queryByText('여름 캠프')).not.toBeInTheDocument();
    });
  });
});
