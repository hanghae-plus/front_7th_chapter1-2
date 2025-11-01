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

describe('[Story] 종료일 적용 - 매월 반복(존재하지 않는 날짜 건너뜀)', () => {
  it("31일 시작, interval 1, 종료일 '2025-04-30' → 1월과 3월에만 표시, 2월/4월은 표시되지 않음", async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '먼슬리 종료일 포함(31일)',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-04-30' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 월간 뷰로 전환 (기준: 이벤트 첫 날짜 2025-01-31 → 1월)
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    // 1월: 31일에 1회 표시
    const monthViewJan = await screen.findByTestId('month-view');
    expect(await within(monthViewJan).findAllByText('먼슬리 종료일 포함(31일)')).toHaveLength(1);

    // 2월로 이동 → 31일 없음 → 표시되지 않음
    await user.click(screen.getByLabelText('Next'));
    const monthViewFeb = await screen.findByTestId('month-view');
    expect(within(monthViewFeb).queryByText('먼슬리 종료일 포함(31일)')).not.toBeInTheDocument();

    // 3월로 이동 → 31일 존재 → 1회 표시
    await user.click(screen.getByLabelText('Next'));
    const monthViewMar = await screen.findByTestId('month-view');
    expect(await within(monthViewMar).findAllByText('먼슬리 종료일 포함(31일)')).toHaveLength(1);

    // 4월로 이동 → 종료일 4/30, 31일 없음 → 표시되지 않음
    await user.click(screen.getByLabelText('Next'));
    const monthViewApr = await screen.findByTestId('month-view');
    expect(within(monthViewApr).queryByText('먼슬리 종료일 포함(31일)')).not.toBeInTheDocument();
  });
});
