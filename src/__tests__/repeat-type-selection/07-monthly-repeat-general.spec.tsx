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

describe('매월 반복 생성 - 일반 케이스', () => {
  it('간격 1로 매월 15일 반복: 현재 월에 1회 이상 표시됨', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '매월 15일 테스트',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    const items = await screen.findAllByText('매월 15일 테스트');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it('간격 2로 매월 15일 반복: 현재 월에 1회 이상 표시됨', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '격월 15일 테스트',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 2, endDate: '2025-12-31' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    const items = await screen.findAllByText('격월 15일 테스트');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });
});
