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

describe('매일 반복 생성', () => {
  it('간격 1로 매일 반복 시 매일 일정이 생성됨 (월간 뷰)', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '매일 반복 테스트',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-05' },
        notificationTime: 10,
      },
    ]);
    const { user } = setup();

    // 월간 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    // 해당 월(2025-10) 1~5일에 제목이 각각 렌더링되어 총 5회 이상 등장해야 함
    const occurrences = await screen.findAllByText('매일 반복 테스트');
    expect(occurrences.length).toBeGreaterThanOrEqual(5);
  });
});
