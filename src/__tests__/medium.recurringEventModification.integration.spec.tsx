import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();

// 테스트 컴포넌트 설정
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

// MSW 핸들러: 반복 일정 데이터로 목킹 설정
const setupMockEventsWithRepeat = (events: Event[]) => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    })
  );
};

describe('반복 일정 수정', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('AC-1: 반복 일정 수정 판별 확인', () => {
    it('반복 일정 수정 시 다이얼로그 표시', async () => {
      // Given: 반복 일정이 있고, 사용자가 수정 폼에서 데이터를 수정한 후 저장 버튼을 클릭했을 때
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-31',
          id: 'repeat-1',
        },
        notificationTime: 10,
      };

      setupMockEventsWithRepeat([recurringEvent]);

      server.use(
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          const updatedEvent = (await request.json()) as Event;
          return HttpResponse.json({ ...updatedEvent, id }, { status: 200 });
        })
      );

      const { user } = setup(<App />);

      // 일정 로딩 완료 대기
      await screen.findByText('일정 로딩 완료!');

      // 수정 버튼 클릭
      await waitFor(async () => {
        const editButtons = await screen.findAllByLabelText('Edit event');
        expect(editButtons.length).toBeGreaterThan(0);
      });
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // editEvent 호출 후 상태 업데이트 대기 (제목 필드가 채워졌는지 확인)
      await waitFor(() => {
        const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
        expect(titleInput.value).toBeTruthy();
      });

      // 폼 데이터 수정
      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의');

      // When: 저장 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // Then: 수정 선택 다이얼로그가 표시되어야함
      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // 다이얼로그 제목 확인
      expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
    });

    it('일반 일정 수정 시 다이얼로그 미표시', async () => {
      // Given: 일반 일정이 있고, 사용자가 수정 폼에서 데이터를 수정한 후 저장 버튼을 클릭했을 때
      const singleEvent: Event = {
        id: '1',
        title: '점심 약속',
        date: '2025-10-15',
        startTime: '12:00',
        endTime: '13:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'none', interval: 1, endDate: '' },
        notificationTime: 0,
      };

      let apiCalled = false;

      setupMockEventsWithRepeat([singleEvent]);

      server.use(
        http.put('/api/events/:id', async ({ params, request }) => {
          apiCalled = true;
          const { id } = params;
          const updatedEvent = (await request.json()) as Event;
          return HttpResponse.json({ ...updatedEvent, id }, { status: 200 });
        })
      );

      const { user } = setup(<App />);

      // 일정 로딩 완료 대기
      await screen.findByText('일정 로딩 완료!');

      // 수정 버튼 클릭
      await waitFor(async () => {
        const editButtons = await screen.findAllByLabelText('Edit event');
        expect(editButtons.length).toBeGreaterThan(0);
      });
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // 폼 데이터 수정
      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 약속');

      // When: 저장 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // Then: 다이얼로그가 표시되지 않아야함
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /반복 일정 수정/ })).not.toBeInTheDocument();
      });

      // And: API가 즉시 호출되어야함
      expect(apiCalled).toBe(true);
    });
  });

  describe('AC-2: 반복 일정 수정 다이얼로그 표시', () => {
    it('다이얼로그 제목 및 내용 표시', async () => {
      // Given: 반복 일정 수정 확인 다이얼로그가 표시되었을 때
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-31',
          id: 'repeat-1',
        },
        notificationTime: 10,
      };

      setupMockEventsWithRepeat([recurringEvent]);

      server.use(
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          const updatedEvent = (await request.json()) as Event;
          return HttpResponse.json({ ...updatedEvent, id }, { status: 200 });
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await waitFor(async () => {
        const editButtons = await screen.findAllByLabelText('Edit event');
        expect(editButtons.length).toBeGreaterThan(0);
      });
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // editEvent 호출 후 상태 업데이트 대기 (제목 필드가 채워졌는지 확인)
      await waitFor(() => {
        const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
        expect(titleInput.value).toBeTruthy();
      });

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      // When: 다이얼로그가 렌더링되면
      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // Then: 다이얼로그 제목은 "반복 일정 수정"이어야함
      expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();

      // And: 다이얼로그 내용은 "해당 일정만 수정하시겠어요?"이어야함
      expect(screen.getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
    });

    it('버튼 표시', async () => {
      // Given: 반복 일정 수정 확인 다이얼로그가 표시되었을 때
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-31',
          id: 'repeat-1',
        },
        notificationTime: 10,
      };

      setupMockEventsWithRepeat([recurringEvent]);

      server.use(
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          const updatedEvent = (await request.json()) as Event;
          return HttpResponse.json({ ...updatedEvent, id }, { status: 200 });
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await waitFor(async () => {
        const editButtons = await screen.findAllByLabelText('Edit event');
        expect(editButtons.length).toBeGreaterThan(0);
      });
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // editEvent 호출 후 상태 업데이트 대기 (제목 필드가 채워졌는지 확인)
      await waitFor(() => {
        const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
        expect(titleInput.value).toBeTruthy();
      });

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      // When: 다이얼로그가 렌더링되면
      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // Then: "예" 버튼이 표시되어야함
      expect(screen.getByRole('button', { name: '예' })).toBeInTheDocument();

      // And: "아니오" 버튼이 표시되어야함
      expect(screen.getByRole('button', { name: '아니오' })).toBeInTheDocument();
    });
  });

  describe('AC-3: 단일 인스턴스 수정 ("예" 선택)', () => {
    it('단일 수정 API 호출 및 반복 정보 제거', async () => {
      // Given: 수정 선택 다이얼로그가 표시된 상태에서
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-31',
          id: 'repeat-1',
        },
        notificationTime: 10,
      };

      setupMockEventsWithRepeat([recurringEvent]);

      let requestBody: Event | null = null;

      server.use(
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          requestBody = (await request.json()) as Event;
          return HttpResponse.json({ ...requestBody, id }, { status: 200 });
        }),
        http.get('/api/events', () => {
          return HttpResponse.json({ events: [{ ...recurringEvent, ...requestBody }] });
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await waitFor(async () => {
        const editButtons = await screen.findAllByLabelText('Edit event');
        expect(editButtons.length).toBeGreaterThan(0);
      });
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // editEvent 호출 후 상태 업데이트 대기 (제목 필드가 채워졌는지 확인)
      await waitFor(() => {
        const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
        expect(titleInput.value).toBeTruthy();
      });

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // When: 사용자가 "예" 버튼을 클릭했을때
      await user.click(screen.getByRole('button', { name: '예' }));

      // Then: PUT /api/events/:id API가 호출되어야함
      await waitFor(() => {
        expect(requestBody).not.toBeNull();
      });

      // And: 요청 body에 repeat.type: 'none'이 포함되어야함
      expect(requestBody?.repeat.type).toBe('none');

      // And: 요청 body에 repeat.id가 제거되어야함
      expect(requestBody?.repeat.id).toBeUndefined();
    });

    it('단일 수정 후 반복 아이콘 제거', async () => {
      // Given: 수정 선택 다이얼로그에서 "예"를 선택하여 단일 수정이 완료된 후
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-31',
          id: 'repeat-1',
        },
        notificationTime: 10,
      };

      const otherRecurringEvent: Event = {
        id: '2',
        title: '다른 회의',
        date: '2025-10-22',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-31',
          id: 'repeat-1',
        },
        notificationTime: 10,
      };

      setupMockEventsWithRepeat([recurringEvent, otherRecurringEvent]);

      server.use(
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          const updatedEvent = (await request.json()) as Event;
          return HttpResponse.json({ ...updatedEvent, id }, { status: 200 });
        }),
        http.get('/api/events', async () => {
          return HttpResponse.json({
            events: [
              {
                ...recurringEvent,
                id: '1',
                title: '수정된 회의',
                repeat: { type: 'none', interval: 1, endDate: '' },
              },
              otherRecurringEvent,
            ],
          });
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await waitFor(async () => {
        const editButtons = await screen.findAllByLabelText('Edit event');
        expect(editButtons.length).toBeGreaterThan(0);
      });
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // editEvent 호출 후 상태 업데이트 대기 (제목 필드가 채워졌는지 확인)
      await waitFor(() => {
        const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
        expect(titleInput.value).toBeTruthy();
      });

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '예' }));

      // When: 일정 목록이 새로고침되면
      await waitFor(() => {
        expect(screen.getByText('일정이 수정되었습니다.')).toBeInTheDocument();
      });

      // 이벤트 목록이 갱신될 때까지 대기
      await waitFor(
        () => {
          expect(screen.getByText('수정된 회의')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Then: 수정된 일정의 반복 일정 아이콘이 사라져야함
      const modifiedEventElement = screen.getByText('수정된 회의').closest('div');
      expect(
        modifiedEventElement?.querySelector('[aria-label="반복 일정"]')
      ).not.toBeInTheDocument();

      // And: 동일한 repeat.id를 가진 다른 일정들은 반복 아이콘이 유지되어야함
      const otherEventElement = screen.getByText('다른 회의').closest('div');
      expect(otherEventElement?.querySelector('[aria-label="반복 일정"]')).toBeInTheDocument();
    });

    it('단일 수정 성공 메시지', async () => {
      // Given: 수정 선택 다이얼로그에서 "예"를 선택하여 단일 수정이 완료된 후
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-31',
          id: 'repeat-1',
        },
        notificationTime: 10,
      };

      setupMockEventsWithRepeat([recurringEvent]);

      server.use(
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          const updatedEvent = (await request.json()) as Event;
          return HttpResponse.json({ ...updatedEvent, id }, { status: 200 });
        }),
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                ...recurringEvent,
                title: '수정된 회의',
                repeat: { type: 'none', interval: 1, endDate: '' },
              },
            ],
          });
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await waitFor(async () => {
        const editButtons = await screen.findAllByLabelText('Edit event');
        expect(editButtons.length).toBeGreaterThan(0);
      });
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // editEvent 호출 후 상태 업데이트 대기 (제목 필드가 채워졌는지 확인)
      await waitFor(() => {
        const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
        expect(titleInput.value).toBeTruthy();
      });

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // When: 사용자가 "예" 버튼을 클릭
      await user.click(screen.getByRole('button', { name: '예' }));

      // Then: "일정이 수정되었습니다." 성공 메시지가 표시되어야함
      await waitFor(() => {
        expect(screen.getByText('일정이 수정되었습니다.')).toBeInTheDocument();
      });

      // And: 다이얼로그가 닫혀야함
      await waitFor(
        () => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // And: 폼이 닫혀야함
      await waitFor(() => {
        expect(screen.queryByLabelText('제목')).not.toBeInTheDocument();
      });
    });
  });

  describe('AC-4: 전체 반복 시리즈 수정 ("아니오" 선택)', () => {
    it('전체 수정 API 호출 및 반복 정보 유지', async () => {
      // Given: 수정 선택 다이얼로그가 표시된 상태에서
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-31',
          id: 'repeat-1',
        },
        notificationTime: 10,
      };

      setupMockEventsWithRepeat([recurringEvent]);

      let requestBody: any = null;
      let apiCalled = false;

      server.use(
        http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
          apiCalled = true;
          const { repeatId } = params;
          requestBody = await request.json();
          return HttpResponse.json(
            [
              { id: '1', ...requestBody, repeat: { ...requestBody.repeat, id: repeatId } },
              { id: '2', ...requestBody, repeat: { ...requestBody.repeat, id: repeatId } },
            ],
            { status: 200 }
          );
        }),
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              { ...recurringEvent, title: '수정된 회의', ...requestBody },
              { ...recurringEvent, id: '2', date: '2025-10-22', ...requestBody },
            ],
          });
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await waitFor(async () => {
        const editButtons = await screen.findAllByLabelText('Edit event');
        expect(editButtons.length).toBeGreaterThan(0);
      });
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // editEvent 호출 후 상태 업데이트 대기 (제목 필드가 채워졌는지 확인)
      await waitFor(() => {
        const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
        expect(titleInput.value).toBeTruthy();
      });

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // When: 사용자가 "아니오" 버튼을 클릭했을때
      await user.click(screen.getByRole('button', { name: '아니오' }));

      // Then: PUT /api/recurring-events/:repeatId API가 호출되어야함
      await waitFor(() => {
        expect(apiCalled).toBe(true);
      });

      // And: 요청 body에 반복 정보가 포함되어야함 (repeat.type !== 'none')
      expect(requestBody?.repeat?.type).not.toBe('none');

      // And: 요청 body에 수정된 필드가 포함되어야함
      expect(requestBody?.title).toBe('수정된 회의');
    });

    it('전체 수정 후 반복 아이콘 유지', async () => {
      // Given: 수정 선택 다이얼로그에서 "아니오"를 선택하여 전체 수정이 완료된 후
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-31',
          id: 'repeat-1',
        },
        notificationTime: 10,
      };

      setupMockEventsWithRepeat([recurringEvent]);

      let requestBody: any = null;

      server.use(
        http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
          const { repeatId } = params;
          requestBody = await request.json();
          return HttpResponse.json(
            [
              { id: '1', ...requestBody, repeat: { ...requestBody.repeat, id: repeatId } },
              { id: '2', ...requestBody, repeat: { ...requestBody.repeat, id: repeatId } },
            ],
            { status: 200 }
          );
        }),
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              { ...recurringEvent, title: '수정된 회의', ...requestBody },
              {
                ...recurringEvent,
                id: '2',
                date: '2025-10-22',
                title: '수정된 회의',
                ...requestBody,
              },
            ],
          });
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await waitFor(async () => {
        const editButtons = await screen.findAllByLabelText('Edit event');
        expect(editButtons.length).toBeGreaterThan(0);
      });
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // editEvent 호출 후 상태 업데이트 대기 (제목 필드가 채워졌는지 확인)
      await waitFor(() => {
        const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
        expect(titleInput.value).toBeTruthy();
      });

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '아니오' }));

      // When: 일정 목록이 새로고침되면
      await waitFor(() => {
        expect(screen.getByText('일정이 수정되었습니다.')).toBeInTheDocument();
      });

      // Then: 모든 반복 시리즈 일정에 반복 일정 아이콘이 유지되어야함
      const repeatIcons = screen.getAllByLabelText('반복 일정');
      expect(repeatIcons.length).toBeGreaterThan(0);
    });

    it('전체 수정 성공 메시지', async () => {
      // Given: 수정 선택 다이얼로그에서 "아니오"를 선택하여 전체 수정이 완료된 후
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-31',
          id: 'repeat-1',
        },
        notificationTime: 10,
      };

      setupMockEventsWithRepeat([recurringEvent]);

      server.use(
        http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
          const { repeatId } = params;
          const requestBody = await request.json();
          return HttpResponse.json(
            [{ id: '1', ...requestBody, repeat: { ...requestBody.repeat, id: repeatId } }],
            { status: 200 }
          );
        }),
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [{ ...recurringEvent, title: '수정된 회의' }],
          });
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await waitFor(async () => {
        const editButtons = await screen.findAllByLabelText('Edit event');
        expect(editButtons.length).toBeGreaterThan(0);
      });
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // editEvent 호출 후 상태 업데이트 대기 (제목 필드가 채워졌는지 확인)
      await waitFor(() => {
        const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
        expect(titleInput.value).toBeTruthy();
      });

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // When: 사용자가 "아니오" 버튼을 클릭
      await user.click(screen.getByRole('button', { name: '아니오' }));

      // Then: "일정이 수정되었습니다." 성공 메시지가 표시되어야함
      await waitFor(() => {
        expect(screen.getByText('일정이 수정되었습니다.')).toBeInTheDocument();
      });

      // And: 다이얼로그가 닫혀야함
      await waitFor(
        () => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // And: 폼이 닫혀야함
      await waitFor(
        () => {
          expect(screen.queryByLabelText('제목')).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe('AC-8: 네트워크 오류 처리', () => {
    it('단일 수정 시 네트워크 오류', async () => {
      // Given: 수정 선택 다이얼로그에서 "예"를 선택하여 API 호출 시
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-31',
          id: 'repeat-1',
        },
        notificationTime: 10,
      };

      setupMockEventsWithRepeat([recurringEvent]);

      server.use(
        http.put('/api/events/:id', () => {
          return HttpResponse.error();
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await waitFor(async () => {
        const editButtons = await screen.findAllByLabelText('Edit event');
        expect(editButtons.length).toBeGreaterThan(0);
      });
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // editEvent 호출 후 상태 업데이트 대기 (제목 필드가 채워졌는지 확인)
      await waitFor(() => {
        const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
        expect(titleInput.value).toBeTruthy();
      });

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // When: 네트워크 오류가 발생하면
      await user.click(screen.getByRole('button', { name: '예' }));

      // Then: 에러 토스트 메시지가 표시되어야함 ("일정 수정 실패")
      await waitFor(() => {
        expect(screen.getByText(/일정 수정 실패|수정 실패/)).toBeInTheDocument();
      });

      // And: 다이얼로그는 닫혀야함
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // And: 폼은 열린 상태로 유지되어야함 (재시도 가능)
      expect(screen.getByLabelText('제목')).toBeInTheDocument();
    });

    it('전체 수정 시 네트워크 오류', async () => {
      // Given: 수정 선택 다이얼로그에서 "아니오"를 선택하여 API 호출 시
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-31',
          id: 'repeat-1',
        },
        notificationTime: 10,
      };

      setupMockEventsWithRepeat([recurringEvent]);

      server.use(
        http.put('/api/recurring-events/:repeatId', () => {
          return HttpResponse.error();
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await waitFor(async () => {
        const editButtons = await screen.findAllByLabelText('Edit event');
        expect(editButtons.length).toBeGreaterThan(0);
      });
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // editEvent 호출 후 상태 업데이트 대기 (제목 필드가 채워졌는지 확인)
      await waitFor(() => {
        const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
        expect(titleInput.value).toBeTruthy();
      });

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // When: 네트워크 오류가 발생하면
      await user.click(screen.getByRole('button', { name: '아니오' }));

      // Then: 에러 토스트 메시지가 표시되어야함 ("반복 일정 수정 실패")
      await waitFor(() => {
        expect(screen.getByText(/반복 일정 수정 실패|수정 실패/)).toBeInTheDocument();
      });

      // And: 다이얼로그는 닫혀야함
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // And: 폼은 열린 상태로 유지되어야함 (재시도 가능)
      expect(screen.getByLabelText('제목')).toBeInTheDocument();
    });
  });

  describe('AC-9: 404 오류 처리', () => {
    it('단일 수정 시 404 오류', async () => {
      // Given: 수정하려는 일정이 이미 삭제된 상태에서
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-31',
          id: 'repeat-1',
        },
        notificationTime: 10,
      };

      setupMockEventsWithRepeat([recurringEvent]);

      server.use(
        http.put('/api/events/:id', () => {
          return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
        }),
        http.get('/api/events', () => {
          return HttpResponse.json({ events: [] });
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await waitFor(async () => {
        const editButtons = await screen.findAllByLabelText('Edit event');
        expect(editButtons.length).toBeGreaterThan(0);
      });
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // editEvent 호출 후 상태 업데이트 대기 (제목 필드가 채워졌는지 확인)
      await waitFor(() => {
        const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
        expect(titleInput.value).toBeTruthy();
      });

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // When: "예" 선택 후 API 호출 시 404 오류가 발생하면
      await user.click(screen.getByRole('button', { name: '예' }));

      // Then: 에러 토스트 메시지가 표시되어야함 ("수정할 일정을 찾을 수 없습니다.")
      await waitFor(
        () => {
          expect(
            screen.getByText(/일정 저장 실패|수정할 일정을 찾을 수 없습니다|찾을 수 없습니다/)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // And: 이벤트 목록이 새로고침되어야함
      await waitFor(
        () => {
          expect(screen.queryByText('팀 회의')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // And: 폼이 닫혀야함
      await waitFor(
        () => {
          expect(screen.queryByLabelText('제목')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('전체 수정 시 404 오류', async () => {
      // Given: 수정하려는 반복 일정이 이미 삭제된 상태에서
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-31',
          id: 'repeat-1',
        },
        notificationTime: 10,
      };

      setupMockEventsWithRepeat([recurringEvent]);

      server.use(
        http.put('/api/recurring-events/:repeatId', () => {
          return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
        }),
        http.get('/api/events', () => {
          return HttpResponse.json({ events: [] });
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      await waitFor(async () => {
        const editButtons = await screen.findAllByLabelText('Edit event');
        expect(editButtons.length).toBeGreaterThan(0);
      });
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // editEvent 호출 후 상태 업데이트 대기 (제목 필드가 채워졌는지 확인)
      await waitFor(() => {
        const titleInput = screen.getByLabelText('제목') as HTMLInputElement;
        expect(titleInput.value).toBeTruthy();
      });

      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // When: "아니오" 선택 후 API 호출 시 404 오류가 발생하면
      await user.click(screen.getByRole('button', { name: '아니오' }));

      // Then: 에러 토스트 메시지가 표시되어야함 ("반복 일정을 찾을 수 없습니다.")
      await waitFor(
        () => {
          expect(
            screen.getByText(/반복 일정을 찾을 수 없습니다|찾을 수 없습니다/)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // And: 이벤트 목록이 새로고침되어야함
      await waitFor(
        () => {
          expect(screen.queryByText('팀 회의')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // And: 폼이 닫혀야함
      await waitFor(
        () => {
          expect(screen.queryByLabelText('제목')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });
});
