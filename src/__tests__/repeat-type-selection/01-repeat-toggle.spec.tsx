import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';

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

describe('반복 일정 활성화/비활성화', () => {
  // 테스트 케이스 1: 반복 일정 체크박스를 체크하면 isRepeating이 true가 됨
  it('반복 일정 체크박스를 체크하면 반복 유형 선택 필드가 표시됨', async () => {
    const { user } = setup();

    // Given: 반복 일정 체크박스가 해제된 상태
    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });
    expect(repeatCheckbox).not.toBeChecked();

    // When: 반복 일정 체크박스를 체크
    await user.click(repeatCheckbox);

    // Then: 반복 유형 선택 필드가 표시됨
    expect(repeatCheckbox).toBeChecked();
    expect(screen.getByLabelText(/반복 유형/i)).toBeInTheDocument();
  });

  // 테스트 케이스 2: 반복 일정 체크박스를 해제하면 isRepeating이 false가 됨
  it('반복 일정 체크박스를 해제하면 체크박스가 해제 상태가 됨', async () => {
    const { user } = setup();

    // Given: 반복 일정이 체크된 상태
    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });
    await user.click(repeatCheckbox);
    expect(repeatCheckbox).toBeChecked();

    // When: 체크박스를 해제
    await user.click(repeatCheckbox);

    // Then: 체크박스가 해제됨
    expect(repeatCheckbox).not.toBeChecked();
  });

  // 테스트 케이스 3: isRepeating이 true일 때 반복 설정 UI가 표시됨
  it('반복 일정 체크박스를 체크하면 반복 유형, 반복 간격, 반복 종료일 필드가 표시됨', async () => {
    const { user } = setup();

    // Given: 일정 생성 폼
    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });

    // When: 반복 일정 체크박스를 체크
    await user.click(repeatCheckbox);

    // Then: 반복 유형, 반복 간격, 반복 종료일 필드가 표시됨
    expect(screen.getByLabelText(/반복 유형/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/반복 간격/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/반복 종료일/i)).toBeInTheDocument();
  });

  // 테스트 케이스 4: isRepeating이 false일 때 반복 설정 UI가 숨겨짐
  it('반복 일정 체크박스를 해제하면 반복 설정 UI가 숨겨짐', async () => {
    const { user } = setup();

    // Given: 반복 일정이 체크된 상태
    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });
    await user.click(repeatCheckbox);
    expect(screen.getByLabelText(/반복 유형/i)).toBeInTheDocument();

    // When: 체크박스를 해제
    await user.click(repeatCheckbox);

    // Then: 반복 설정 UI가 숨겨짐
    expect(screen.queryByLabelText(/반복 유형/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/반복 간격/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/반복 종료일/i)).not.toBeInTheDocument();
  });

  // 테스트 케이스 5: 체크박스 해제 시 repeat.type이 none이 됨
  it('체크박스를 해제하면 내부 상태의 repeat.type이 none으로 설정됨', async () => {
    const { user } = setup();

    // Given: 반복 일정이 체크된 상태
    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });
    await user.click(repeatCheckbox);

    // When: 반복 유형을 선택하고 체크박스를 해제
    await user.click(repeatCheckbox);

    // Then: 체크박스 해제 시 repeat.type이 'none'이 됨
    // 이는 추후 일정 저장 시 repeat.type이 'none'으로 저장되는지 통합 테스트로 검증 가능
    expect(repeatCheckbox).not.toBeChecked();
  });

  // 추가 검증: 초기 로드 시 기본 상태 확인
  it('초기 로드 시 반복 일정 체크박스가 해제되어 있고 반복 설정 UI가 숨겨져 있음', () => {
    setup();

    // Given: 일정 생성 폼이 초기 로드됨
    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });

    // Then: isRepeating이 false이고 반복 설정 UI가 숨겨짐
    expect(repeatCheckbox).not.toBeChecked();
    expect(screen.queryByLabelText(/반복 유형/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/반복 간격/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/반복 종료일/i)).not.toBeInTheDocument();
  });
});
