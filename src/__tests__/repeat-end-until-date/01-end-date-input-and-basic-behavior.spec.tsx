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

describe('[Story] 종료일 입력 및 기본 동작', () => {
  it('종료일이 설정되면 해당 날짜까지(포함)만 표시된다 (월간 뷰)', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '종료일 포함 표시',
        date: '2025-01-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-13' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 월간 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    const monthView = await screen.findByTestId('month-view');
    const occurrences = await within(monthView).findAllByText('종료일 포함 표시');

    // 2025-01-10, 11, 12, 13 → 총 4회 표시
    expect(occurrences).toHaveLength(4);
  });

  it('종료일이 비어 있으면 표시 범위 내에서만 표시된다 (월간 뷰, 무기한)', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '무기한 표시',
        date: '2025-01-10',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1 }, // endDate 없음(무기한)
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 월간 뷰로 전환
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    const monthView = await screen.findByTestId('month-view');
    const occurrences = await within(monthView).findAllByText('무기한 표시');

    // 2025-01-10부터 말일까지 최소 20회 이상 표시 (표시 범위 내에서만 표시됨을 간접 확인)
    expect(occurrences.length).toBeGreaterThanOrEqual(20);
  });
});
