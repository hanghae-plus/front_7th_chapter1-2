import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

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

describe('[Story] 시리즈 전체 삭제(아니오)', () => {
  it("'아니오' 선택 시 시리즈 전체가 삭제되고, 목록과 달력(week view)에 노출되지 않아야 한다 (Red)", async () => {
    const mockEvent: Event = {
      id: '1',
      title: '매일 운동',
      date: '2025-11-05',
      startTime: '07:00',
      endTime: '08:00',
      description: '',
      location: '',
      category: '개인',
      repeat: { type: 'daily', interval: 1, id: 'r-456' },
      notificationTime: 10,
    };

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [mockEvent] });
      }),
      http.delete('/api/recurring-events/:repeatId', ({ params }) => {
        expect((params as Record<string, string>).repeatId).toBe('r-456');
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { user } = setup();

    // 삭제 → 모달에서 '아니오' 선택
    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);
    expect(await screen.findByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '아니오' }));

    // 토스트 확인
    expect(await screen.findByText('일정이 삭제되었습니다.')).toBeInTheDocument();

    // 목록에서 사라져야 함 (현재 구현: 통과 가능)
    const list = screen.getByTestId('event-list');
    expect(within(list).queryByText('매일 운동')).toBeNull();

    // 달력(week view)에서도 사라져야 함 (현재 구현: 실패 예상 → Red)
    const week = screen.getByTestId('week-view');
    expect(within(week).queryByText('매일 운동')).toBeNull();
  });
});
