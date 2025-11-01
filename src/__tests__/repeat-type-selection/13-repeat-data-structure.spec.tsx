import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
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

describe('일정 저장 데이터 구조 (repeat)', () => {
  it('반복 활성화 시 repeat 객체에 type/interval/endDate가 반영되고 리스트에 표시됨', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup();

    // 폼 입력
    await user.type(screen.getByLabelText('제목'), '반복 저장 테스트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-10');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
    // 기본 type=daily, interval=1 가정. endDate 지정
    await user.type(screen.getByLabelText(/반복 종료일/i), '2025-12-31');

    // 저장
    await user.click(screen.getByTestId('event-submit-button'));

    // 리스트에 반복 정보 텍스트가 표시되어야 함
    expect(await screen.findByText('반복: 1일마다 (종료: 2025-12-31)')).toBeInTheDocument();
  });

  it("반복 비활성화 시 repeat.type이 'none'으로 저장되어 리스트에 반복 정보가 표시되지 않음", async () => {
    setupMockHandlerCreation([]);
    const { user } = setup();

    await user.type(screen.getByLabelText('제목'), '비반복 저장 테스트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-11');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');

    // 반복 체크 안 함 → type=none
    await user.click(screen.getByTestId('event-submit-button'));

    // 리스트 아이템 내에 '반복:' 텍스트가 없어야 함
    expect(screen.queryByText(/^반복:/)).toBeNull();
  });
});
