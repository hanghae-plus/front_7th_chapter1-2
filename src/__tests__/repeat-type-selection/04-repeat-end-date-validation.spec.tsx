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

describe('반복 종료일 입력 검증', () => {
  it('종료일을 입력하지 않으면 유효한 상태(무기한 반복)', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));

    // 종료일 미입력 상태에서 오류가 없어야 함
    expect(
      screen.queryByText('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('유효하지 않은 날짜입니다.')).not.toBeInTheDocument();
    expect(screen.queryByText('종료일은 시작일보다 미래여야 합니다.')).not.toBeInTheDocument();
  });

  it('유효한 날짜 형식(YYYY-MM-DD)을 입력하면 유효함', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
    await user.type(screen.getByLabelText('날짜'), '2024-01-15');

    const endDateInput = screen.getByLabelText(/반복 종료일/i);
    await user.clear(endDateInput);
    await user.type(endDateInput, '2024-12-31');

    expect(
      screen.queryByText('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('유효하지 않은 날짜입니다.')).not.toBeInTheDocument();
    expect(screen.queryByText('종료일은 시작일보다 미래여야 합니다.')).not.toBeInTheDocument();
  });

  it("유효하지 않은 날짜(2024-02-30)를 입력하면 '유효하지 않은 날짜입니다.' 오류 표시", async () => {
    const { user } = setup();

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));

    const endDateInput = screen.getByLabelText(/반복 종료일/i);
    fireEvent.change(endDateInput, { target: { value: '2024-02-30' } });

    expect(screen.getByText('유효하지 않은 날짜입니다.')).toBeInTheDocument();
  });

  it("잘못된 형식(24-01-01)을 입력하면 '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)' 오류 표시", async () => {
    const { user } = setup();

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));

    const endDateInput = screen.getByLabelText(/반복 종료일/i);
    fireEvent.change(endDateInput, { target: { value: '24-01-01' } });

    expect(screen.getByText('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)')).toBeInTheDocument();
  });

  it("시작일보다 이전 날짜를 입력하면 '종료일은 시작일보다 미래여야 합니다.' 오류 표시", async () => {
    const { user } = setup();

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
    await user.type(screen.getByLabelText('날짜'), '2024-01-15');

    const endDateInput = screen.getByLabelText(/반복 종료일/i);
    await user.clear(endDateInput);
    await user.type(endDateInput, '2024-01-14');

    expect(screen.getByText('종료일은 시작일보다 미래여야 합니다.')).toBeInTheDocument();
  });
});
