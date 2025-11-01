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

describe('[Story] 전체 수정(아니오) - 시리즈 전체 반영', () => {
  it('모달에서 "아니오" 선택 시 제목이 업데이트되고 반복 표시는 유지된다 (Red)', async () => {
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

    // 편집 진입 후 제목 변경
    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);
    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '주간 스탠드업');

    // 저장 → 모달 노출 → '아니오' 선택(전체 수정)
    await user.click(screen.getByTestId('event-submit-button'));
    expect(await screen.findByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '아니오' }));

    // 기대: 제목이 업데이트되고 반복 표시는 유지됨
    const list = screen.getByTestId('event-list');
    expect(await within(list).findByText('주간 스탠드업')).toBeInTheDocument();
    expect(within(list).getByText(/반복:\s*/)).toBeInTheDocument();
  });
});
