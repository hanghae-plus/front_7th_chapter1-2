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

describe('[Story] 단일 수정(예) - 인스턴스 분리 저장', () => {
  it('모달에서 "예" 선택 시 단일 일정으로 분리 저장되고 반복 표시가 사라진다 (Red)', async () => {
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
    await user.type(titleInput, '외부 미팅');

    // 저장 → 확인 모달 노출 → '예' 선택
    await user.click(screen.getByTestId('event-submit-button'));
    expect(await screen.findByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '예' }));

    // 기대: 이벤트 목록에 단일 일정(반복 없음)으로 변경된 제목 노출, "반복:" 표시 없음, 원본 제목 미노출
    const list = screen.getByTestId('event-list');
    expect(await within(list).findByText('외부 미팅')).toBeInTheDocument();
    expect(within(list).queryByText(/반복:\s*/)).toBeNull();
    expect(within(list).queryByText('주간 회의')).toBeNull();
  });
});
