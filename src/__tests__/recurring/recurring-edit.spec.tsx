import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor } from '@testing-library/react';
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

describe('반복 일정 기능 - 반복 일정 수정', () => {
  describe('단일 수정 시나리오 ("예" 클릭)', () => {
    it('반복 일정 수정 모달에서 "예"를 클릭하면 해당 일정만 수정된다', async () => {
      // Given: 반복 일정이 존재하고 수정 대화상자가 열림
      let mockEvents: Event[] = [
        {
          id: '1',
          title: '주간 회의',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '매주 목요일 정기 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.put('/api/events/:id', () => {
          // PUT 요청 후 반복을 제거한 이벤트로 업데이트
          mockEvents = mockEvents.map((event) =>
            event.id === '1' ? { ...event, repeat: { type: 'none', interval: 1 } } : event
          );
          return HttpResponse.json(mockEvents[0]);
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      // 일정 수정 버튼 클릭
      const editButton = screen.getByLabelText('Edit event');
      await user.click(editButton);

      // When: "해당 일정만 수정하시겠어요?" 모달에서 "예" 버튼 클릭
      const singleEditButton = await screen.findByRole('button', { name: /예/i });
      await user.click(singleEditButton);

      // 그 다음 "일정 수정" 버튼 클릭
      const submitButton = screen.getByTestId('event-submit-button');
      await user.click(submitButton);

      // Then: 단일 일정만 수정되고, 반복 설정은 제거됨
      await waitFor(() => {
        expect(screen.queryByText(/반복:/i)).not.toBeInTheDocument();
      });
    });

    it('반복 일정을 단일 수정하면 반복일정 아이콘이 사라진다', async () => {
      // Given: 반복 아이콘이 있는 반복 일정
      let mockEvents: Event[] = [
        {
          id: '1',
          title: '주간 회의',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '매주 목요일 정기 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.put('/api/events/:id', () => {
          // PUT 요청 후 반복을 제거한 이벤트로 업데이트
          mockEvents = mockEvents.map((event) =>
            event.id === '1' ? { ...event, repeat: { type: 'none', interval: 1 } } : event
          );
          return HttpResponse.json(mockEvents[0]);
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      // 반복 아이콘 존재 확인
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText(/반복:/i)).toBeInTheDocument();

      // 일정 수정
      const editButton = screen.getByLabelText('Edit event');
      await user.click(editButton);

      // When: 단일 수정("예") 완료
      const singleEditButton = await screen.findByRole('button', { name: /예/i });
      await user.click(singleEditButton);

      // "일정 수정" 버튼 클릭
      const submitButton = screen.getByTestId('event-submit-button');
      await user.click(submitButton);

      // Then: 해당 일정의 반복일정 아이콘이 더 이상 렌더링되지 않음
      await waitFor(() => {
        expect(within(eventList).queryByText(/반복:/i)).not.toBeInTheDocument();
      });
    });

    it('반복 일정의 단일 수정 후 나머지 반복 일정은 유지된다', async () => {
      // Given: 반복 일정 시리즈 (예: 매주 월요일 3주)
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '주간 회의',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '매주 수요일 정기 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '주간 회의',
          date: '2025-10-08',
          startTime: '09:00',
          endTime: '10:00',
          description: '매주 수요일 정기 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '주간 회의',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '매주 수요일 정기 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        },
      ];

      let updatedEvents = [...mockEvents];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: updatedEvents });
        }),
        http.put('/api/events/:id', async ({ params }) => {
          updatedEvents = updatedEvents.map((event) =>
            event.id === params.id ? { ...event, repeat: { type: 'none', interval: 1 } } : event
          );
          return HttpResponse.json({ ...mockEvents[0], repeat: { type: 'none', interval: 1 } });
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      // 첫 번째 일정 수정
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // When: 특정 인스턴스를 단일 수정("예")
      const singleEditButton = await screen.findByRole('button', { name: /예/i });
      await user.click(singleEditButton);

      // "일정 수정" 버튼 클릭
      const submitButton = screen.getByTestId('event-submit-button');
      await user.click(submitButton);

      // Then: 수정된 일정만 단일로 변경되고, 나머지 반복 일정은 그대로 유지됨
      const eventList = screen.getByTestId('event-list');
      await waitFor(() => {
        const repeatInfos = within(eventList).queryAllByText(/반복:/i);
        expect(repeatInfos.length).toBe(2); // 나머지 2개는 유지
      });
    });
  });

  describe('전체 수정 시나리오 ("아니오" 클릭)', () => {
    it('반복 일정 수정 모달에서 "아니오"를 클릭하면 전체 반복 일정이 수정된다', async () => {
      // Given: 반복 일정이 존재하고 수정 대화상자가 열림
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
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.put('/api/recurring-events/:repeatId', () => {
          return HttpResponse.json(mockEvents);
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      // 일정 수정 버튼 클릭
      const editButton = screen.getByLabelText('Edit event');
      await user.click(editButton);

      // When: "해당 일정만 수정하시겠어요?" 모달에서 "아니오" 버튼 클릭
      const fullEditButton = await screen.findByRole('button', { name: /아니오/i });
      await user.click(fullEditButton);

      // "일정 수정" 버튼 클릭
      const submitButton = screen.getByTestId('event-submit-button');
      await user.click(submitButton);

      // Then: 반복 설정이 변경되고, 반복 시리즈 전체에 적용됨
      await waitFor(() => {
        expect(screen.getByText(/반복:/i)).toBeInTheDocument();
      });
    });

    it('반복 일정을 전체 수정하면 반복일정 아이콘이 유지된다', async () => {
      // Given: 반복 아이콘이 있는 반복 일정
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
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.put('/api/recurring-events/:repeatId', () => {
          return HttpResponse.json(mockEvents);
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      // 일정 수정
      const editButton = screen.getByLabelText('Edit event');
      await user.click(editButton);

      // When: 전체 수정("아니오") 완료
      const fullEditButton = await screen.findByRole('button', { name: /아니오/i });
      await user.click(fullEditButton);

      // "일정 수정" 버튼 클릭
      const submitButton = screen.getByTestId('event-submit-button');
      await user.click(submitButton);

      // Then: 반복일정 아이콘이 여전히 렌더링됨
      const eventList = screen.getByTestId('event-list');
      await waitFor(() => {
        expect(within(eventList).getByText(/반복:/i)).toBeInTheDocument();
      });
    });
  });

  describe('에러 케이스', () => {
    it('반복 일정 수정 모달이 표시되지 않으면 단일/전체 수정 로직이 실행되지 않는다', async () => {
      // Given: 반복 일정이 존재하지만 수정 모달이 표시되지 않음
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
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        })
      );

      setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      // When: 수정 작업 시도하지 않음 (모달이 열리지 않음)
      // Then: 일정이 변경되지 않음 (모달이 없으므로 예/아니오 버튼도 없음)
      expect(screen.queryByRole('button', { name: /예/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /아니오/i })).not.toBeInTheDocument();
    });
  });
});
