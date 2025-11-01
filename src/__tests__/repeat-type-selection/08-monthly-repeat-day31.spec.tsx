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

describe('매월 반복 생성 - 31일 특수 케이스', () => {
  it('31일 매월 반복 시 31일 있는 달에만 표시 (10월 ✓ / 11월 ✗ / 12월 ✓)', async () => {
    setupMockHandlerCreation([
      // 10월 31일 시작 (10월에 표시)
      {
        id: '1',
        title: '31일 반복 테스트',
        date: '2025-10-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-10-31' },
        notificationTime: 10,
      },
      // 12월 31일 시작 (12월에 표시)
      {
        id: '2',
        title: '31일 반복 테스트',
        date: '2025-12-31',
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

    // 월간 뷰 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    // 10월(31일 있음) → 표시됨
    const monthViewOct = await screen.findByTestId('month-view');
    expect(
      (await within(monthViewOct).findAllByText('31일 반복 테스트')).length
    ).toBeGreaterThanOrEqual(1);

    // 11월(31일 없음) → 표시되지 않음
    await user.click(screen.getByLabelText('Next'));
    const monthViewNov = await screen.findByTestId('month-view');
    expect(within(monthViewNov).queryByText('31일 반복 테스트')).toBeNull();

    // 12월(31일 있음) → 표시됨
    await user.click(screen.getByLabelText('Next'));
    const monthViewDec = await screen.findByTestId('month-view');
    expect(
      (await within(monthViewDec).findAllByText('31일 반복 테스트')).length
    ).toBeGreaterThanOrEqual(1);
  });
});
