import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, waitFor, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

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
  form: Omit<Event, 'id' | 'notificationTime'> & { repeatType: string; repeatEndDate?: string }
) => {
  const {
    title,
    date,
    startTime,
    endTime,
    location,
    description,
    category,
    repeatType,
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

  await user.click(screen.getByLabelText('반복 유형'));
  await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));

  const repeatLabels: Record<string, string> = {
    daily: '매일',
    weekly: '매주',
    monthly: '매월',
    yearly: '매년',
  };
  await user.click(screen.getByText(repeatLabels[repeatType]));

  if (repeatEndDate) {
    const repeatEndDateInput = screen.getByLabelText('반복 종료일');
    await user.type(repeatEndDateInput, repeatEndDate);
  }

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정 UI 통합 테스트', () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it('TD-013: 캘린더 뷰 반복 아이콘 표시 - 캘린더 뷰에서 반복 일정에 Repeat 아이콘 표시됨', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveRecurringSchedule(user, {
      title: '반복 일정 테스트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1 },
      repeatType: 'daily',
    });

    await waitFor(() => {
      const repeatIcons = screen.queryAllByTestId('RepeatIcon');
      expect(repeatIcons.length).toBeGreaterThan(0);
    });
  });

  it('TD-014: 이벤트 리스트 반복 정보 표시 - 이벤트 리스트에서 반복 유형 정보 표시됨', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveRecurringSchedule(user, {
      title: '매주 반복 일정',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '테스트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'weekly', interval: 1 },
      repeatType: 'weekly',
    });

    await waitFor(() => {
      const repeatTexts = screen.queryAllByText(/매주 반복/i);
      expect(repeatTexts.length).toBeGreaterThan(0);
    });
  });

  it('TD-015: 단일 일정 수정 다이얼로그 표시 - 반복 일정 수정 시 수정 범위 선택 다이얼로그 표시됨', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveRecurringSchedule(user, {
      title: '수정 테스트 반복 일정',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1 },
      repeatType: 'daily',
    });

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText(/Edit event/i);
      expect(editButtons.length).toBeGreaterThan(0);
    });

    const editButtons = screen.getAllByLabelText(/Edit event/i);
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
      expect(screen.getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
    });
  });

  it('TD-016: 단일 일정만 수정 - "예" 선택 시 선택한 일정만 수정되고 일반 일정으로 변경됨', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveRecurringSchedule(user, {
      title: '단일 수정 테스트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1 },
      repeatType: 'daily',
    });

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText(/Edit event/i);
      expect(editButtons.length).toBeGreaterThan(0);
    });

    const editButtons = screen.getAllByLabelText(/Edit event/i);
    await user.click(editButtons[0]);

    await waitFor(() => {
      const yesButton = screen.getByRole('button', { name: /예/i });
      expect(yesButton).toBeInTheDocument();
    });

    const yesButton = screen.getByRole('button', { name: /예/i });
    await user.click(yesButton);

    await waitFor(() => {
      const titleInputAfter = screen.getByLabelText('제목');
      expect(titleInputAfter).toHaveValue('단일 수정 테스트');
    });

    const titleInputAfter = screen.getByLabelText('제목');
    await user.clear(titleInputAfter);
    await user.type(titleInputAfter, '수정된 제목');

    const updateButton = screen.getByRole('button', { name: /일정 수정/i });
    await user.click(updateButton);

    await waitFor(
      () => {
        const modifiedTitles = screen.queryAllByText('수정된 제목');
        expect(modifiedTitles.length).toBeGreaterThan(0);
      },
      { timeout: 5000 }
    );
  });

  it('TD-017: 전체 일정 수정 - "아니오" 선택 시 모든 반복 인스턴스가 수정됨', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveRecurringSchedule(user, {
      title: '전체 수정 테스트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1 },
      repeatType: 'daily',
    });

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText(/Edit event/i);
      expect(editButtons.length).toBeGreaterThan(0);
    });

    const editButtons = screen.getAllByLabelText(/Edit event/i);
    await user.click(editButtons[0]);

    await waitFor(() => {
      const noButton = screen.getByRole('button', { name: /아니오/i });
      expect(noButton).toBeInTheDocument();
    });

    const noButton = screen.getByRole('button', { name: /아니오/i });
    await user.click(noButton);

    await waitFor(() => {
      const titleInputAfter = screen.getByLabelText('제목');
      expect(titleInputAfter).toHaveValue('전체 수정 테스트');
    });

    const titleInputAfter = screen.getByLabelText('제목');
    await user.clear(titleInputAfter);
    await user.type(titleInputAfter, '전체 수정된 제목');

    const updateButton = screen.getByRole('button', { name: /일정 수정/i });
    await user.click(updateButton);

    await waitFor(
      () => {
        const allEvents = screen.getAllByText('전체 수정된 제목');
        expect(allEvents.length).toBeGreaterThan(1);
      },
      { timeout: 3000 }
    );
  });

  it('TD-018: 단일 수정 후 원본 유지 - 단일 수정 후 다른 반복 인스턴스는 영향 없음', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveRecurringSchedule(user, {
      title: '원본 유지 테스트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-20' },
      repeatType: 'daily',
      repeatEndDate: '2025-10-20',
    });

    await waitFor(() => {
      const eventList = within(screen.getByTestId('event-list'));
      const originalEvents = eventList.getAllByText('원본 유지 테스트');
      expect(originalEvents.length).toBeGreaterThan(1);
    });

    const eventList = within(screen.getByTestId('event-list'));
    const originalCount = eventList.getAllByText('원본 유지 테스트').length;

    const editButtons = screen.getAllByLabelText(/Edit event/i);
    await user.click(editButtons[0]);

    await waitFor(() => {
      const yesButton = screen.getByRole('button', { name: /예/i });
      expect(yesButton).toBeInTheDocument();
    });

    const yesButton = screen.getByRole('button', { name: /예/i });
    await user.click(yesButton);

    await waitFor(() => {
      const titleInputAfter = screen.getByLabelText('제목');
      expect(titleInputAfter).toHaveValue('원본 유지 테스트');
    });

    const titleInputAfter = screen.getByLabelText('제목');
    await user.clear(titleInputAfter);
    await user.type(titleInputAfter, '수정된 단일 일정');

    const updateButton = screen.getByRole('button', { name: /일정 수정/i });
    await user.click(updateButton);

    await waitFor(() => {
      const eventList = within(screen.getByTestId('event-list'));
      const modifiedEvents = eventList.queryAllByText('수정된 단일 일정');
      expect(modifiedEvents.length).toBeGreaterThan(0);
      const remainingOriginalEvents = eventList.getAllByText('원본 유지 테스트');
      expect(remainingOriginalEvents.length).toBe(originalCount - 1);
    });
  });

  it('TD-019: 단일 일정 삭제 다이얼로그 표시 - 반복 일정 삭제 시 삭제 범위 선택 다이얼로그 표시됨', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveRecurringSchedule(user, {
      title: '삭제 테스트 반복 일정',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1 },
      repeatType: 'daily',
    });

    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText(/Delete event/i);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByLabelText(/Delete event/i);
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
      expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
    });
  });

  it('TD-020: 단일 일정만 삭제 - "예" 선택 시 선택한 일정만 삭제됨', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveRecurringSchedule(user, {
      title: '단일 삭제 테스트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-20' },
      repeatType: 'daily',
      repeatEndDate: '2025-10-20',
    });

    await waitFor(() => {
      const eventList = within(screen.getByTestId('event-list'));
      const events = eventList.getAllByText('단일 삭제 테스트');
      expect(events.length).toBeGreaterThan(1);
    });

    const eventList = within(screen.getByTestId('event-list'));
    const originalCount = eventList.getAllByText('단일 삭제 테스트').length;

    const deleteButtons = screen.getAllByLabelText(/Delete event/i);
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      const yesButton = screen.getByRole('button', { name: /예/i });
      expect(yesButton).toBeInTheDocument();
    });

    const yesButton = screen.getByRole('button', { name: /예/i });
    await user.click(yesButton);

    await waitFor(() => {
      const eventListAfter = within(screen.getByTestId('event-list'));
      const remainingEvents = eventListAfter.getAllByText('단일 삭제 테스트');
      expect(remainingEvents.length).toBe(originalCount - 1);
    });
  });

  it('TD-021: 전체 일정 삭제 - "아니오" 선택 시 모든 반복 인스턴스가 삭제됨', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveRecurringSchedule(user, {
      title: '전체 삭제 테스트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-20' },
      repeatType: 'daily',
      repeatEndDate: '2025-10-20',
    });

    await waitFor(() => {
      const eventList = within(screen.getByTestId('event-list'));
      const events = eventList.getAllByText('전체 삭제 테스트');
      expect(events.length).toBeGreaterThan(1);
    });

    const deleteButtons = screen.getAllByLabelText(/Delete event/i);
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      const noButton = screen.getByRole('button', { name: /아니오/i });
      expect(noButton).toBeInTheDocument();
    });

    const noButton = screen.getByRole('button', { name: /아니오/i });
    await user.click(noButton);

    await waitFor(() => {
      const eventList = within(screen.getByTestId('event-list'));
      const events = eventList.queryAllByText('전체 삭제 테스트');
      expect(events.length).toBe(0);
    });
  });

  it('TD-022: 단일 수정 후 재수정 - 단일 수정으로 일반 일정이 된 일정 재수정 시 다이얼로그 미표시', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveRecurringSchedule(user, {
      title: '재수정 테스트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-10-20' },
      repeatType: 'daily',
      repeatEndDate: '2025-10-20',
    });

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText(/Edit event/i);
      expect(editButtons.length).toBeGreaterThan(0);
    });

    const editButtons = screen.getAllByLabelText(/Edit event/i);
    await user.click(editButtons[0]);

    await waitFor(() => {
      const yesButton = screen.getByRole('button', { name: /예/i });
      expect(yesButton).toBeInTheDocument();
    });

    const yesButton = screen.getByRole('button', { name: /예/i });
    await user.click(yesButton);

    await waitFor(() => {
      const titleInputAfter = screen.getByLabelText('제목');
      expect(titleInputAfter).toHaveValue('재수정 테스트');
    });

    const titleInputAfter = screen.getByLabelText('제목');
    await user.clear(titleInputAfter);
    await user.type(titleInputAfter, '첫 번째 수정');

    const updateButton = screen.getByRole('button', { name: /일정 수정/i });
    await user.click(updateButton);

    await waitFor(() => {
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText('첫 번째 수정')).toBeInTheDocument();
    });

    await waitFor(() => {
      const editButtonsAfter = screen.getAllByLabelText(/Edit event/i);
      expect(editButtonsAfter.length).toBeGreaterThan(0);
    });

    const editButtonsAfter = screen.getAllByLabelText(/Edit event/i);
    const firstEventEditButton = editButtonsAfter[0];
    await user.click(firstEventEditButton);

    await waitFor(() => {
      const titleInputFinal = screen.getByLabelText('제목');
      expect(titleInputFinal).toHaveValue('첫 번째 수정');
      expect(screen.queryByText('반복 일정 수정')).not.toBeInTheDocument();
    });
  });
});
