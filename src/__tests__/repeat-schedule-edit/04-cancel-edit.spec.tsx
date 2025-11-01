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

describe('[Story] 취소 - 저장 중단 및 상태 유지', () => {
  it('모달에서 "취소"를 선택하면 저장되지 않고 폼 값이 원래 값으로 복원된다 (Red)', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '주간 회의',
        date: '2025-11-05',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    // 편집 진입 후 제목을 임시로 변경
    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '변경 임시');

    // 저장 → 모달 노출 → '취소' 선택
    await user.click(screen.getByTestId('event-submit-button'));
    expect(await screen.findByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '취소' }));

    // 기대 1: 리스트에는 원본 제목만 보이고 임시 제목은 보이지 않음 (저장 안 됨)
    const list = screen.getByTestId('event-list');
    expect(await within(list).findByText('주간 회의')).toBeInTheDocument();
    expect(within(list).queryByText('변경 임시')).toBeNull();

    // 기대 2 (Red 유도): 폼의 제목 입력값이 원래 값으로 복원되어야 함
    // 현재 구현은 취소 시 폼을 되돌리지 않으므로 이 단언이 실패해야 함
    expect(screen.getByLabelText('제목')).toHaveValue('주간 회의');
  });
});
