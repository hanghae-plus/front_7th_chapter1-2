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

describe('[Story] 종료일 적용 - 매주 반복', () => {
  it("월요일 시작(2025-01-06), 간격 1, 종료일 '2025-01-20' → 01/06, 01/13, 01/20 세 번만 표시", async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '위클리 종료일 포함',
        date: '2025-01-06', // 월요일
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-01-20' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 월간 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    const monthView = await screen.findByTestId('month-view');
    const titles = await within(monthView).findAllByText('위클리 종료일 포함');

    // 2025-01-06, 2025-01-13, 2025-01-20 → 총 3회만 표시되어야 함
    expect(titles).toHaveLength(3);
  });
});
