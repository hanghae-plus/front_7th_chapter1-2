import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';

const theme = createTheme();

const setup = () => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

describe('달력 뷰에서 반복 일정 표시', () => {
  it('매일 반복 일정이 주간 뷰의 여러 날짜에 표시됨', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '주간-매일-테스트',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-07' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 주간 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /week/i }));

    const weekView = await screen.findByTestId('week-view');
    const items = await within(weekView).findAllByText('주간-매일-테스트');
    expect(items.length).toBeGreaterThanOrEqual(4);
  });

  it('매주 월요일 반복 일정이 월간 뷰의 해당 월 월요일에 표시됨', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '월요일 반복 테스트',
        date: '2025-10-06', // 월요일 시작
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-10-31' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 월간 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    const monthView = await screen.findByTestId('month-view');
    const items = await within(monthView).findAllByText('월요일 반복 테스트');
    expect(items.length).toBeGreaterThanOrEqual(4);
  });

  it('31일 매월 반복 일정은 31일 없는 달(11월)에는 표시되지 않음', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '31일 월반복',
        date: '2025-10-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2026-01-31' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 월간 뷰 확인 (10월)
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    const monthViewOct = await screen.findByTestId('month-view');
    expect(await within(monthViewOct).findAllByText('31일 월반복')).toHaveLength(1);

    // 11월로 이동 (31일 없음) → 표시되지 않음
    await user.click(screen.getByLabelText('Next'));
    const monthViewNov = await screen.findByTestId('month-view');
    expect(within(monthViewNov).queryByText('31일 월반복')).not.toBeInTheDocument();
  });
});
