import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';

const theme = createTheme();

// 테스트용 App 컴포넌트 렌더링 헬퍼
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

describe('반복 간격 입력 검증', () => {
  it('1을 입력하면 유효한 값으로 인정됨', async () => {
    const { user } = setup();

    // Given: 반복 일정 활성화 및 반복 간격 입력 준비
    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));

    const intervalInput = screen.getByLabelText(/반복 간격/i);
    await user.clear(intervalInput);
    await user.type(intervalInput, '1');

    // Then: 오류 메시지가 표시되지 않음
    expect(screen.queryByText('반복 간격은 1 이상이어야 합니다.')).not.toBeInTheDocument();
    expect(screen.queryByText('반복 간격은 정수여야 합니다.')).not.toBeInTheDocument();
  });

  it('0을 입력하면 "반복 간격은 1 이상이어야 합니다." 오류 표시', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
    const intervalInput = screen.getByLabelText(/반복 간격/i);
    await user.clear(intervalInput);
    await user.type(intervalInput, '0');

    expect(screen.getByText('반복 간격은 1 이상이어야 합니다.')).toBeInTheDocument();
  });

  it('-1을 입력하면 "반복 간격은 1 이상이어야 합니다." 오류 표시', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
    const intervalInput = screen.getByLabelText(/반복 간격/i);
    await user.clear(intervalInput);
    await user.type(intervalInput, '-1');

    expect(screen.getByText('반복 간격은 1 이상이어야 합니다.')).toBeInTheDocument();
  });

  it('1.5를 입력하면 "반복 간격은 정수여야 합니다." 오류 표시', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
    const intervalInput = screen.getByLabelText(/반복 간격/i);
    await user.clear(intervalInput);
    await user.type(intervalInput, '1.5');

    expect(screen.getByText('반복 간격은 정수여야 합니다.')).toBeInTheDocument();
  });

  it('오류가 있는 상태에서 일정 추가 버튼 클릭 시 일정이 저장되지 않음', async () => {
    // 빈 리스트로 시작하도록 서버 목 구성
    setupMockHandlerCreation([]);

    const { user } = setup();

    // Given: 반복 일정 활성화 및 잘못된 반복 간격 설정(0)
    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
    const intervalInput = screen.getByLabelText(/반복 간격/i);
    await user.clear(intervalInput);
    await user.type(intervalInput, '0');

    // 필수 입력값 채우기
    await user.type(screen.getByLabelText('제목'), '테스트 일정');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '09:00');
    await user.type(screen.getByLabelText('종료 시간'), '10:00');
    await user.type(screen.getByLabelText('설명'), '설명');
    await user.type(screen.getByLabelText('위치'), '회의실 A');

    // When: 저장 시도
    await user.click(screen.getByTestId('event-submit-button'));

    // Then: 이벤트 리스트에 여전히 아무 일정도 없어야 함
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});
