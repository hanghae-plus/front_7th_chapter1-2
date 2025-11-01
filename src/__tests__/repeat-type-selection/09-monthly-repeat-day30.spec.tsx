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

describe('매월 반복 생성 - 30일 특수 케이스', () => {
  it('30일 매월 반복 시 2월은 표시되지 않고 10월/11월은 표시됨', async () => {
    setupMockHandlerCreation([
      // 10월 30일 표시
      {
        id: '1',
        title: '30일 반복 테스트',
        date: '2025-10-30',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-10-30' },
        notificationTime: 10,
      },
      // 11월 30일 표시
      {
        id: '2',
        title: '30일 반복 테스트',
        date: '2025-11-30',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-11-30' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 월간 뷰 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    const monthViewOct = await screen.findByTestId('month-view');
    expect(
      (await within(monthViewOct).findAllByText('30일 반복 테스트')).length
    ).toBeGreaterThanOrEqual(1);

    // 11월 표시 확인
    await user.click(screen.getByLabelText('Next'));
    const monthViewNov = await screen.findByTestId('month-view');
    expect(
      (await within(monthViewNov).findAllByText('30일 반복 테스트')).length
    ).toBeGreaterThanOrEqual(1);

    // 12월 → 1월 → 2월 이동 후 2월에는 표시되지 않음
    await user.click(screen.getByLabelText('Next'));
    await user.click(screen.getByLabelText('Next'));
    await user.click(screen.getByLabelText('Next'));
    const monthViewFeb = await screen.findByTestId('month-view');
    expect(within(monthViewFeb).queryByText('30일 반복 테스트')).toBeNull();
  });
});
