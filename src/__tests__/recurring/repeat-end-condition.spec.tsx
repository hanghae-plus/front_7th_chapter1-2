import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import App from '../../App';

const theme = createTheme();

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

describe('반복 종료 조건 지정', () => {
  it('반복 일정 생성 시 종료 날짜를 지정할 수 있다', async () => {
    const { user } = setup(<App />);

    // 반복 일정 체크박스 활성화
    const repeatCheckbox = screen.getByRole('checkbox', { name: '반복 일정' });
    await user.click(repeatCheckbox);

    // 반복 종료일 입력 필드가 표시되는지 확인
    const repeatEndDateInput = screen.getByLabelText('반복 종료일') as HTMLInputElement;
    expect(repeatEndDateInput).toBeInTheDocument();

    // 종료 날짜 입력
    const endDate = '2025-12-31';
    await user.type(repeatEndDateInput, endDate);

    // 입력된 값이 올바르게 설정되었는지 확인
    expect(repeatEndDateInput.value).toBe(endDate);
  });
});
