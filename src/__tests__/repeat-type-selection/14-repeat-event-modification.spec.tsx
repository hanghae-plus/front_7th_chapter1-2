import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';

import { setupMockHandlerUpdating } from '../../__mocks__/handlersUtils';
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

describe('반복 일정 수정', () => {
  it('편집 폼에서 반복 유형/간격/종료일을 변경할 수 있다 (weekly → monthly)', async () => {
    setupMockHandlerUpdating();
    const { user } = setup();

    // 두 번째 이벤트 편집
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[1]);

    // 반복 활성화 및 유형 변경
    await user.click(screen.getByRole('checkbox', { name: /반복 일정/i }));
    const repeatTypeCombobox = screen.getByRole('combobox', { name: /반복 유형/i });
    await user.click(repeatTypeCombobox);
    await user.click(screen.getByRole('option', { name: '매월' }));

    // 간격 2, 종료일 지정
    await user.clear(screen.getByLabelText(/반복 간격/i));
    await user.type(screen.getByLabelText(/반복 간격/i), '2');
    await user.type(screen.getByLabelText(/반복 종료일/i), '2024-12-31');

    // 폼 내 값이 즉시 반영되는지 확인
    expect(screen.getByRole('combobox', { name: /반복 유형/i })).toHaveTextContent('매월');
    expect(screen.getByLabelText(/반복 간격/i)).toHaveValue(2);
    expect(screen.getByLabelText(/반복 종료일/i)).toHaveValue('2024-12-31');
  });

  it('반복 체크 해제 시 단일 일정으로 전환되어 반복 정보가 사라짐', async () => {
    setupMockHandlerUpdating();
    const { user } = setup();

    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    const checkbox = screen.getByRole('checkbox', { name: /반복 일정/i });
    await user.click(checkbox); // on
    await user.click(checkbox); // off

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.queryByText(/^반복:/)).toBeNull();
  });

  it('제목 수정 시 리스트의 제목이 변경됨', async () => {
    setupMockHandlerUpdating();
    const { user } = setup();

    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 제목');
    await user.click(screen.getByTestId('event-submit-button'));

    const matches = await screen.findAllByText('수정된 제목');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
