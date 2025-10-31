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

describe('[Story] 비반복 일정 삭제', () => {
  it('삭제 클릭 시 단일 일정이 목록과 달력에서 사라지고, 검색 입력으로 포커스가 이동한다 (Red)', async () => {
    const singleEvent: Event = {
      id: 'e-1',
      title: '단일 회의',
      date: '2025-11-06',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: [singleEvent] });
      }),
      http.delete('/api/events/:id', ({ params }) => {
        expect((params as Record<string, string>).id).toBe('e-1');
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { user } = setup();

    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);

    // 토스트
    expect(await screen.findByText('일정이 삭제되었습니다.')).toBeInTheDocument();

    // 목록에서 사라짐
    const list = screen.getByTestId('event-list');
    expect(within(list).queryByText('단일 회의')).toBeNull();

    // 달력(week view)에서도 사라짐 (현재 구현 미반영 시 실패 → Red)
    const week = screen.getByTestId('week-view');
    expect(within(week).queryByText('단일 회의')).toBeNull();

    // 접근성/UX: 삭제 후 검색 입력으로 포커스 이동 (현재 미구현 → Red)
    const search = screen.getByLabelText('일정 검색');
    expect(search).toHaveFocus();
  });
});
