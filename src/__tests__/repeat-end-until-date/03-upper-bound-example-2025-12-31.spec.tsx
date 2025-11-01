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

describe('[Story] 예시 상한 적용 (2025-12-31)', () => {
  it('종료일이 없더라도 월간 뷰 범위(12월)에서는 12/30, 12/31 두 번만 표시된다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '상한 예시',
        date: '2025-12-30',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1 }, // endDate 없음 (무기한)
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 월간 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    const monthView = await screen.findByTestId('month-view');
    const titles = await within(monthView).findAllByText('상한 예시');

    // 2025-12-30, 2025-12-31 → 총 2회만 표시되어야 함
    expect(titles).toHaveLength(2);
  });
});
