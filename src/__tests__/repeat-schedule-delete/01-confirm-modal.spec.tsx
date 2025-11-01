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

describe('[Story] 삭제 확인 모달 노출', () => {
  it('반복 일정 삭제 클릭 시 "해당 일정만 삭제하시겠어요?" 모달이 노출된다 (Red)', async () => {
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

    // 삭제 클릭 시점에 확인 모달 노출 기대
    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);

    // Red: 현재 구현에는 삭제 확인 모달이 없어 실패해야 함
    expect(await screen.findByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '예' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '아니오' })).toBeInTheDocument();
  });

  it('비반복 일정 삭제 클릭 시 본 모달이 노출되지 않는다', async () => {
    setupMockHandlerCreation([
      {
        id: '1',
        title: '단일 회의',
        date: '2025-11-06',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ]);

    const { user } = setup();

    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);

    expect(screen.queryByText('해당 일정만 삭제하시겠어요?')).toBeNull();
  });
});
