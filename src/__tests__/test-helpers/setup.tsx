import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

const theme = createTheme();

/**
 * 통합 테스트용 공통 렌더링 설정
 *
 * App 컴포넌트를 테스트할 때 필요한 모든 Provider로 감싸고,
 * userEvent 인스턴스를 함께 반환합니다.
 *
 * @example
 * const { user } = renderWithProviders(<App />);
 * await user.click(screen.getByText('버튼'));
 */
export const renderWithProviders = (element: ReactElement) => {
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
