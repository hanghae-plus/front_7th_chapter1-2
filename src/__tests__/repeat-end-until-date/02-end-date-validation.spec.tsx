import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';

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

describe('[Story] 종료일 형식 및 유효성 검증', () => {
  it("잘못된 형식('2025-1-5') 입력 시 '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)' 오류 표시", async () => {
    const { user } = setup();

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));

    const endDateInput = screen.getByLabelText(/반복 종료일/i);
    fireEvent.change(endDateInput, { target: { value: '2025-1-5' } });

    expect(screen.getByText('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)')).toBeInTheDocument();
  });

  it("존재하지 않는 날짜('2025-02-30') 입력 시 '유효하지 않은 날짜입니다.' 오류 표시", async () => {
    const { user } = setup();

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));

    const endDateInput = screen.getByLabelText(/반복 종료일/i);
    fireEvent.change(endDateInput, { target: { value: '2025-02-30' } });

    expect(screen.getByText('유효하지 않은 날짜입니다.')).toBeInTheDocument();
  });

  it("종료일이 시작일보다 과거('2025-03-09')면 '종료일은 시작일보다 미래여야 합니다.'", async () => {
    const { user } = setup();

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));

    // 시작일 설정
    const startDateInput = screen.getByLabelText('날짜');
    await user.type(startDateInput, '2025-03-10');

    // 종료일 설정 (과거)
    const endDateInput = screen.getByLabelText(/반복 종료일/i);
    await user.clear(endDateInput);
    await user.type(endDateInput, '2025-03-09');

    expect(screen.getByText('종료일은 시작일보다 미래여야 합니다.')).toBeInTheDocument();
  });

  it('종료일이 시작일과 동일하면 오류가 없어야 한다', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));

    // 시작일 설정
    const startDateInput = screen.getByLabelText('날짜');
    await user.type(startDateInput, '2025-03-10');

    // 종료일 설정 (동일)
    const endDateInput = screen.getByLabelText(/반복 종료일/i);
    await user.clear(endDateInput);
    await user.type(endDateInput, '2025-03-10');

    expect(
      screen.queryByText('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('유효하지 않은 날짜입니다.')).not.toBeInTheDocument();
    expect(screen.queryByText('종료일은 시작일보다 미래여야 합니다.')).not.toBeInTheDocument();
  });
});
