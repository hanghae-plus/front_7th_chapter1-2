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

describe('[Story] 종료일 적용 - 매년 반복(윤년 2/29 특수 케이스)', () => {
  it("시작일 2024-02-29(윤년), interval 1, 종료일 '2025-12-31' → 2024-02-29만 표시, 2025년에는 표시되지 않음", async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '이어리 종료일 포함(윤년)',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'yearly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 월간 뷰로 전환 (기준: 첫 이벤트 2024-02-29 → 2024년 2월)
    await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /month/i }));

    // 2024-02: 1회 표시
    const monthView2024Feb = await screen.findByTestId('month-view');
    expect(await within(monthView2024Feb).findAllByText('이어리 종료일 포함(윤년)')).toHaveLength(
      1
    );

    // 2025-02로 이동 (12개월 앞으로)
    for (let i = 0; i < 12; i++) {
      // Next 버튼은 월 단위 이동

      await user.click(screen.getByLabelText('Next'));
    }

    // 2025-02: 평년 → 표시되지 않음
    const monthView2025Feb = await screen.findByTestId('month-view');
    expect(
      within(monthView2025Feb).queryByText('이어리 종료일 포함(윤년)')
    ).not.toBeInTheDocument();
  });
});
