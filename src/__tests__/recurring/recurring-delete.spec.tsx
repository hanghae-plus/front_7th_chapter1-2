import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

const theme = createTheme();

const setup = (element: ReactElement) => {
  const user = userEvent.setup();
  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

describe('반복 일정 기능 - 반복 일정 삭제', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('반복 일정 삭제 모달에서 "예"를 클릭하면 해당 일정만 삭제된다', async () => {
    // Given: 반복 일정이 존재하고 삭제 대화상자가 열림
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '주간 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 목요일 정기 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, id: 'repeat-1' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '주간 회의',
        date: '2025-10-08',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 목요일 정기 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, id: 'repeat-1' },
        notificationTime: 10,
      },
    ];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      }),
      http.delete('/api/events/:id', ({ params }) => {
        const { id } = params;
        const index = mockEvents.findIndex((event) => event.id === id);
        if (index !== -1) {
          mockEvents.splice(index, 1);
        }
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 초기: 반복 일정이 2개 표시됨 (Delete 버튼으로 카운트)
    const initialDeleteButtons = screen.getAllByLabelText('Delete event');
    expect(initialDeleteButtons.length).toBeGreaterThan(0);

    // 첫 번째 일정의 삭제 버튼 클릭
    const deleteButtons = screen.getAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    // When: "해당 일정만 삭제하시겠어요?" 모달에서 "예" 버튼 클릭
    const deleteConfirmText = await screen.findByText('해당 일정만 삭제하시겠어요?');
    expect(deleteConfirmText).toBeInTheDocument();

    const yesButtons = screen.getAllByRole('button', { name: /예/i });
    const deleteYesButton = yesButtons[yesButtons.length - 1]; // 모달의 "예" 버튼
    await user.click(deleteYesButton);

    // Then: 한 개의 일정만 삭제되고, 나머지 반복 일정은 유지됨
    await waitFor(() => {
      const remainingDeleteButtons = screen.getAllByLabelText('Delete event');
      expect(remainingDeleteButtons.length).toBe(1);
    });
  });

  it('반복 일정 삭제 모달에서 "아니오"를 클릭하면 전체 반복 일정이 삭제된다', async () => {
    // Given: 반복 일정이 존재하고 삭제 대화상자가 열림
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '주간 회의',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 목요일 정기 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, id: 'repeat-1' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '주간 회의',
        date: '2025-10-08',
        startTime: '09:00',
        endTime: '10:00',
        description: '매주 목요일 정기 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, id: 'repeat-1' },
        notificationTime: 10,
      },
    ];

    server.use(
      http.delete('/api/recurring-events/:repeatId', ({ params }) => {
        const { repeatId } = params;
        const initialLength = mockEvents.length;
        const remainingEvents = mockEvents.filter((event) => event.repeat.id !== repeatId);
        if (remainingEvents.length === initialLength) {
          return new HttpResponse(null, { status: 404 });
        }
        mockEvents.length = 0;
        mockEvents.push(...remainingEvents);
        return new HttpResponse(null, { status: 204 });
      }),
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockEvents });
      })
    );

    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    // 초기: 반복 일정이 2개 표시됨 (Delete 버튼으로 카운트)
    const initialDeleteButtons = screen.getAllByLabelText('Delete event');
    console.log(initialDeleteButtons.length);
    expect(initialDeleteButtons.length).toBeGreaterThan(1);

    // 첫 번째 일정의 삭제 버튼 클릭
    const deleteButtons = screen.getAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    // When: "해당 일정만 삭제하시겠어요?" 모달에서 "아니오" 버튼 클릭
    const deleteConfirmText = await screen.findByText('해당 일정만 삭제하시겠어요?');
    expect(deleteConfirmText).toBeInTheDocument();

    const noButtons = screen.getAllByRole('button', { name: /아니오/i });
    const deleteNoButton = noButtons[noButtons.length - 1]; // 모달의 "아니오" 버튼
    await user.click(deleteNoButton);

    // Then: 반복 일정 시리즈의 모든 일정이 삭제됨
    await waitFor(() => {
      const remainingDeleteButtons = screen.queryAllByLabelText('Delete event');
      expect(remainingDeleteButtons).toHaveLength(0);
    });
  });
});
