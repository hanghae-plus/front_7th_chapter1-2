import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
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
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  // 반복 일정 설정
  if (repeat.type !== 'none') {
    await user.click(screen.getByLabelText('반복 일정'));

    await user.click(screen.getByLabelText('반복 유형'));
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
      expect(eventList.getByText('반복: 1일마다 (종료: 2025-01-07)')).toBeInTheDocument();
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
      expect(eventList.getByText('반복: 1주마다 (종료: 2025-01-29)')).toBeInTheDocument();
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
      expect(eventList.getByText('반복: 1일마다')).toBeInTheDocument();
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

      // 1월, 3월, 5월에만 일정이 생성되어야 함
      const monthView = within(screen.getByTestId('month-view'));
      const eventElements = monthView.getAllByText('월말 정산');
      expect(eventElements).toHaveLength(3);
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

      // 2024, 2028에만 일정이 생성되어야 함
      const monthView = within(screen.getByTestId('month-view'));
      const eventElements = monthView.getAllByText('윤년 기념일');
      expect(eventElements).toHaveLength(2);
    });
  });

  describe('반복 일정 수정', () => {
    it('반복 일정의 단일 인스턴스를 수정할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-01-01'));
      setupMockHandlerUpdating();

      const { user } = setup(<App />);

      // 2025-01-03 날짜의 '매일 회의' 일정 수정 버튼 클릭
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[2]); // 세 번째 일정 (2025-01-03)

      // 제목 변경
      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '긴급 회의');

      // 시간 변경
      await user.clear(screen.getByLabelText('시작 시간'));
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.clear(screen.getByLabelText('종료 시간'));
      await user.type(screen.getByLabelText('종료 시간'), '11:00');

      await user.click(screen.getByTestId('event-submit-button'));

      // 다이얼로그 확인
      expect(screen.getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
      await user.click(screen.getByText('예'));

      // 성공 메시지 확인
      expect(screen.getByText('일정이 수정되었습니다.')).toBeInTheDocument();

      // 2025-01-03만 변경되었는지 확인
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('긴급 회의')).toBeInTheDocument();
      expect(eventList.getAllByText('매일 회의')).toHaveLength(6); // 나머지 6개는 유지
    });

    it('반복 일정 전체를 수정할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-01-01'));
      setupMockHandlerUpdating();

      const { user } = setup(<App />);

      // 2025-01-03 날짜의 '매일 회의' 일정 수정 버튼 클릭
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[2]);

      // 제목 변경
      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '전체 회의');

      // 시간 변경
      await user.clear(screen.getByLabelText('시작 시간'));
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.clear(screen.getByLabelText('종료 시간'));
      await user.type(screen.getByLabelText('종료 시간'), '15:00');

      await user.click(screen.getByTestId('event-submit-button'));

      // 다이얼로그 확인
      expect(screen.getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
      await user.click(screen.getByText('아니오'));

      // 성공 메시지 확인
      expect(screen.getByText('일정이 수정되었습니다.')).toBeInTheDocument();

      // 모든 일정이 변경되었는지 확인
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getAllByText('전체 회의')).toHaveLength(7);
    });
  });

  describe('반복 일정 삭제', () => {
    it('반복 일정의 단일 인스턴스를 삭제할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-01-01'));
      setupMockHandlerDeletion();

      const { user } = setup(<App />);

      // 2025-01-03 날짜의 '매일 회의' 일정 삭제 버튼 클릭
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[2]);

      // 다이얼로그 확인
      expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
      await user.click(screen.getByText('예'));

      // 성공 메시지 확인
      expect(screen.getByText('일정이 삭제되었습니다.')).toBeInTheDocument();

      // 2025-01-03만 삭제되었는지 확인
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getAllByText('매일 회의')).toHaveLength(6); // 6개만 남음
    });

    it('반복 일정 전체를 삭제할 수 있다', async () => {
      vi.setSystemTime(new Date('2025-01-01'));
      setupMockHandlerDeletion();

      const { user } = setup(<App />);

      // 2025-01-03 날짜의 '매일 회의' 일정 삭제 버튼 클릭
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[2]);

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
      expect(eventElements).toHaveLength(7);

      // 반복 아이콘 표시 확인
      const repeatIcons = weekView.getAllByTestId('repeat-icon');
      expect(repeatIcons.length).toBeGreaterThanOrEqual(7);
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
});
