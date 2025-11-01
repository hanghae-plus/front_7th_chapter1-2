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

describe('매주 반복 생성', () => {
  it('간격 1로 매주 반복 시 해당 월의 동일 요일에 일정이 생성됨 (월간 뷰)', async () => {
    // 테스트 기준 현재 월은 2025-10 (setupTests 참고)
    setupMockHandlerCreation([
      {
        id: '1',
        title: '매주 반복 테스트',
        date: '2025-10-01', // 수요일 시작
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

    // 10월 내 수요일(1, 8, 15, 22, 29)에 전개되어 총 5회 이상 등장
    const items = await screen.findAllByText('매주 반복 테스트');
    expect(items.length).toBeGreaterThanOrEqual(5);
  });

  it('간격 2로 매주 반복 시 격주 동일 요일에 일정이 생성됨 (월간 뷰)', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '격주 반복 테스트',
        date: '2025-10-01', // 수요일 시작
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 2, endDate: '2025-10-31' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    // 10월 내 격주 수요일(1, 15, 29)로 총 3회 이상
    const items = await screen.findAllByText('격주 반복 테스트');
    expect(items.length).toBeGreaterThanOrEqual(3);
  });
});
