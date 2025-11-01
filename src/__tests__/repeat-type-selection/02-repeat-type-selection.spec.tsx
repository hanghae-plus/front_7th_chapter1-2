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

describe('반복 유형 선택', () => {
  // 테스트 케이스 1: 반복 유형 드롭다운에 4가지 옵션이 표시됨
  it('반복 유형 드롭다운에 4가지 옵션(매일, 매주, 매월, 매년)이 표시됨', async () => {
    const { user } = setup();

    // Given: 반복 일정이 비활성화
    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });

    // When: 반복 일정 활성화 및 드롭다운 열기
    await user.click(repeatCheckbox);
    await user.click(screen.getByLabelText(/반복 유형/i));

    // Then: 4가지 옵션 노출
    expect(screen.getByRole('option', { name: '매일' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '매주' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '매월' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '매년' })).toBeInTheDocument();
  });

  // 테스트 케이스 2: 기본값은 매일(daily)임
  it('반복 일정을 활성화하면 반복 유형 기본값이 매일(daily)임', async () => {
    const { user } = setup();
    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });

    // When: 반복 일정 활성화
    await user.click(repeatCheckbox);

    // Then: 기본 선택이 "매일"
    await user.click(screen.getByLabelText(/반복 유형/i));
    expect(screen.getByRole('option', { name: '매일' })).toHaveAttribute('aria-selected', 'true');
  });

  // 테스트 케이스 3: 매주 선택 시 repeatType이 weekly가 됨
  it('매주(weekly)를 선택하면 선택 표시가 매주로 바뀜', async () => {
    const { user } = setup();
    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });
    await user.click(repeatCheckbox);

    // When: 드롭다운에서 "매주" 선택
    await user.click(screen.getByLabelText(/반복 유형/i));
    await user.click(screen.getByRole('option', { name: '매주' }));

    // Then: 트리거에 "매주"가 표시되고, 선택 상태가 "매주"
    expect(screen.getByLabelText(/반복 유형/i)).toHaveTextContent('매주');
    await user.click(screen.getByLabelText(/반복 유형/i));
    expect(screen.getByRole('option', { name: '매주' })).toHaveAttribute('aria-selected', 'true');
  });

  // 테스트 케이스 4: 매월 선택 시 repeatType이 monthly가 됨
  it('매월(monthly)을 선택하면 선택 표시가 매월로 바뀜', async () => {
    const { user } = setup();
    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });
    await user.click(repeatCheckbox);

    await user.click(screen.getByLabelText(/반복 유형/i));
    await user.click(screen.getByRole('option', { name: '매월' }));

    expect(screen.getByLabelText(/반복 유형/i)).toHaveTextContent('매월');
    await user.click(screen.getByLabelText(/반복 유형/i));
    expect(screen.getByRole('option', { name: '매월' })).toHaveAttribute('aria-selected', 'true');
  });

  // 테스트 케이스 5: 매년 선택 시 repeatType이 yearly가 됨
  it('매년(yearly)을 선택하면 선택 표시가 매년으로 바뀜', async () => {
    const { user } = setup();
    const repeatCheckbox = screen.getByRole('checkbox', { name: /반복 일정/i });
    await user.click(repeatCheckbox);

    await user.click(screen.getByLabelText(/반복 유형/i));
    await user.click(screen.getByRole('option', { name: '매년' }));

    expect(screen.getByLabelText(/반복 유형/i)).toHaveTextContent('매년');
    await user.click(screen.getByLabelText(/반복 유형/i));
    expect(screen.getByRole('option', { name: '매년' })).toHaveAttribute('aria-selected', 'true');
  });
});
