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

describe('[Story] 월간 뷰 반복 아이콘 표시', () => {
  it('매일 반복 일정은 해당 월의 날짜 칩에서 반복 아이콘이 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '데일리 체크',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 월간 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    const monthView = await screen.findByTestId('month-view');
    const titles = await within(monthView).findAllByText('데일리 체크');
    expect(titles.length).toBeGreaterThanOrEqual(3);

    // 임의의 한 칩에서 반복 아이콘 확인
    const anyTitle = titles[0];
    const stackEl = anyTitle.closest('[class]')!.parentElement as HTMLElement;
    expect(within(stackEl).getByTestId('repeat-icon')).toBeInTheDocument();
    expect(within(stackEl).getByTestId('repeat-icon')).toHaveAttribute('aria-label', '반복 일정');
  });

  it('매월 31일 반복은 31일 없는 달(11월)에는 표시되지 않는다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '월말 정기 점검',
        date: '2025-10-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 월간 뷰로 전환 (10월)
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    const monthViewOct = await screen.findByTestId('month-view');
    expect(await within(monthViewOct).findAllByText('월말 정기 점검')).toHaveLength(1);

    // 11월로 이동 → 표시되지 않음 (31일 없음)
    await user.click(screen.getByLabelText('Next'));
    const monthViewNov = await screen.findByTestId('month-view');
    expect(within(monthViewNov).queryByText('월말 정기 점검')).not.toBeInTheDocument();
  });
});
