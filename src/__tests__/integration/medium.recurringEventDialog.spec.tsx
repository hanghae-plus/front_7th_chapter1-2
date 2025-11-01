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

// Phase 3: User Interactions - Edit/Delete Dialogs
describe('TC-018 ~ TC-024: 반복 일정 수정/삭제 다이얼로그', () => {
  const mockRecurringEvents: Event[] = [
    {
      id: '1',
      title: '반복 회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 반복 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-10-05',
        id: 'repeat-id-1',
      },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '반복 회의',
      date: '2025-10-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 반복 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-10-05',
        id: 'repeat-id-1',
      },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '반복 회의',
      date: '2025-10-03',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 반복 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-10-05',
        id: 'repeat-id-1',
      },
      notificationTime: 10,
    },
    {
      id: '4',
      title: '반복 회의',
      date: '2025-10-04',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 반복 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-10-05',
        id: 'repeat-id-1',
      },
      notificationTime: 10,
    },
    {
      id: '5',
      title: '반복 회의',
      date: '2025-10-05',
      startTime: '09:00',
      endTime: '10:00',
      description: '일일 반복 회의',
      location: '회의실 A',
      category: '업무',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2025-10-05',
        id: 'repeat-id-1',
      },
      notificationTime: 10,
    },
  ];

  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockRecurringEvents });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('TC-018: 반복 일정 수정 시 확인 다이얼로그 표시', () => {
    it('반복 일정의 수정 버튼을 클릭하면 확인 다이얼로그가 표시된다', async () => {
      const { user } = setup(<App />);

      // 일정 로딩 대기
      await screen.findByText('일정 로딩 완료!');

      // 반복 일정의 수정 버튼 클릭
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // 다이얼로그 확인
      expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
      expect(screen.getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '아니오' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '예' })).toBeInTheDocument();
    });

    it('다이얼로그가 모달 형태로 표시된다', async () => {
      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // 다이얼로그가 표시되면 편집 폼은 아직 표시되지 않아야 함
      expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
      expect(screen.queryByLabelText('제목')).not.toBeInTheDocument();
    });
  });

  describe('TC-019: 수정 다이얼로그 "예" 버튼 - 단일 일정 수정', () => {
    it('"예" 버튼을 클릭하면 단일 일정 수정 폼이 열린다', async () => {
      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // "예" 버튼 클릭
      await user.click(screen.getByRole('button', { name: '예' }));

      // 다이얼로그가 닫히고 수정 폼이 열림
      expect(screen.queryByText('반복 일정 수정')).not.toBeInTheDocument();
      expect(screen.getByLabelText('제목')).toBeInTheDocument();
    });

    it('단일 수정 모드로 폼이 열린다', async () => {
      server.use(
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          const updatedEvent = (await request.json()) as Event;

          // 단일 수정 시 repeat.type이 'none'으로 변경되어야 함
          expect(updatedEvent.repeat.type).toBe('none');

          return HttpResponse.json({ ...updatedEvent, id });
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[2]); // 3번째 일정 수정

      await user.click(screen.getByRole('button', { name: '예' }));

      // 제목 수정
      await user.clear(screen.getByLabelText('제목'));
      await user.type(screen.getByLabelText('제목'), '수정된 단일 일정');

      await user.click(screen.getByTestId('event-submit-button'));

      // PUT /api/events/:id 호출 확인 (위의 server.use에서 검증됨)
    });
  });

  describe('TC-020: 수정 다이얼로그 "아니오" 버튼 - 시리즈 수정', () => {
    it('"아니오" 버튼을 클릭하면 시리즈 수정 폼이 열린다', async () => {
      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // "아니오" 버튼 클릭
      await user.click(screen.getByRole('button', { name: '아니오' }));

      // 다이얼로그가 닫히고 수정 폼이 열림
      expect(screen.queryByText('반복 일정 수정')).not.toBeInTheDocument();
      expect(screen.getByLabelText('제목')).toBeInTheDocument();
    });

    it('시리즈 수정 모드로 폼이 열린다', async () => {
      server.use(
        http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
          const { repeatId } = params;
          const updatedEventData = (await request.json()) as Partial<Event>;

          // 시리즈 수정 확인
          expect(repeatId).toBe('repeat-id-1');
          expect(updatedEventData.repeat?.type).toBe('daily');

          return HttpResponse.json({ success: true });
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      await user.click(screen.getByRole('button', { name: '아니오' }));

      // 위치 수정
      await user.clear(screen.getByLabelText('위치'));
      await user.type(screen.getByLabelText('위치'), '회의실 B');

      await user.click(screen.getByTestId('event-submit-button'));

      // PUT /api/recurring-events/:repeatId 호출 확인 (위의 server.use에서 검증됨)
    });
  });

  describe('TC-021: 수정 다이얼로그 "취소" 버튼', () => {
    it('"취소" 버튼을 클릭하면 다이얼로그가 닫히고 아무 동작도 하지 않는다', async () => {
      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // "취소" 버튼 클릭
      await user.click(screen.getByRole('button', { name: '취소' }));

      // 다이얼로그가 닫힘
      await waitFor(() => {
        expect(screen.queryByText('반복 일정 수정')).not.toBeInTheDocument();
      });

      // 수정 폼은 다시 나타나지만 편집 상태가 아님 (제목이 일정 추가로 표시됨)
      expect(screen.getByRole('heading', { name: '일정 추가' })).toBeInTheDocument();
      expect(screen.getByLabelText('제목')).toBeInTheDocument();
      expect(screen.getByLabelText('제목')).toHaveValue(''); // 빈 값

      // 캘린더 뷰가 그대로 유지됨
      expect(screen.getByTestId('month-view')).toBeInTheDocument();
    });
  });

  describe('TC-022: 반복 일정 삭제 시 확인 다이얼로그 표시', () => {
    it('반복 일정의 삭제 버튼을 클릭하면 확인 다이얼로그가 표시된다', async () => {
      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      // 반복 일정의 삭제 버튼 클릭
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      // 다이얼로그 확인
      expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
      expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '아니오' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '예' })).toBeInTheDocument();
    });

    it('삭제 버튼들이 에러 색상으로 표시된다', async () => {
      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      // "아니오"와 "예" 버튼이 에러 색상(빨간색)으로 표시되어야 함
      const noButton = screen.getByRole('button', { name: '아니오' });
      const yesButton = screen.getByRole('button', { name: '예' });

      // Material-UI의 error 버튼은 특정 클래스를 가짐
      expect(noButton.className).toMatch(/error/i);
      expect(yesButton.className).toMatch(/error/i);
    });
  });

  describe('TC-023: 삭제 다이얼로그 "예" 버튼 - 단일 일정 삭제', () => {
    it('"예" 버튼을 클릭하면 해당 일정만 삭제된다', async () => {
      const remainingEvents = mockRecurringEvents.filter((e) => e.id !== '3');

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      // Set up handlers after app has loaded with all 5 events
      server.use(
        http.delete('/api/events/:id', ({ params }) => {
          const { id } = params;
          expect(id).toBe('3');
          return new HttpResponse(null, { status: 204 });
        }),
        http.get('/api/events', () => {
          return HttpResponse.json({ events: remainingEvents });
        })
      );

      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[2]); // 3번째 일정 (id: '3')

      await user.click(screen.getByRole('button', { name: '예' }));

      // 삭제 성공 스낵바 확인
      await waitFor(() => {
        expect(screen.getByText('일정이 삭제되었습니다')).toBeInTheDocument();
      });

      // 나머지 4개 일정은 여전히 존재
      const eventList = within(screen.getByTestId('event-list'));
      const eventItems = eventList.getAllByText('반복 회의');
      expect(eventItems).toHaveLength(4);
    });
  });

  describe('TC-024: 삭제 다이얼로그 "아니오" 버튼 - 시리즈 전체 삭제', () => {
    it('"아니오" 버튼을 클릭하면 시리즈 전체가 삭제된다', async () => {
      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      // Set up handlers after app has loaded
      server.use(
        http.delete('/api/recurring-events/:repeatId', ({ params }) => {
          const { repeatId } = params;
          expect(repeatId).toBe('repeat-id-1');
          return new HttpResponse(null, { status: 204 });
        }),
        http.get('/api/events', () => {
          return HttpResponse.json({ events: [] });
        })
      );

      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      await user.click(screen.getByRole('button', { name: '아니오' }));

      // 삭제 성공 스낵바 확인
      await waitFor(() => {
        expect(screen.getByText('일정이 삭제되었습니다')).toBeInTheDocument();
      });

      // 모든 일정이 삭제됨
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    it('DELETE /api/recurring-events/:repeatId 엔드포인트를 호출한다', async () => {
      let deleteCalled = false;

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      // Set up handlers after app has loaded
      server.use(
        http.delete('/api/recurring-events/:repeatId', ({ params }) => {
          deleteCalled = true;
          expect(params.repeatId).toBe('repeat-id-1');
          return new HttpResponse(null, { status: 204 });
        }),
        http.get('/api/events', () => {
          return HttpResponse.json({ events: [] });
        })
      );

      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      await user.click(screen.getByRole('button', { name: '아니오' }));

      await waitFor(() => {
        expect(deleteCalled).toBe(true);
      });
    });
  });

  describe('TC-039: 다이얼로그 키보드 내비게이션', () => {
    it('Tab 키로 버튼 간 포커스를 이동할 수 있다', async () => {
      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // 다이얼로그가 열림
      expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();

      // Tab 키로 포커스 이동
      await user.tab();

      // 버튼들에 포커스가 순차적으로 이동해야 함
      const cancelButton = screen.getByRole('button', { name: '취소' });
      const noButton = screen.getByRole('button', { name: '아니오' });
      const yesButton = screen.getByRole('button', { name: '예' });

      // 포커스 확인 (하나의 버튼이 포커스를 가져야 함)
      const focusedButtons = [cancelButton, noButton, yesButton].filter(
        (btn) => document.activeElement === btn
      );
      expect(focusedButtons.length).toBeGreaterThan(0);
    });

    it('Escape 키로 다이얼로그를 닫을 수 있다', async () => {
      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();

      // Escape 키 입력
      await user.keyboard('{Escape}');

      // 다이얼로그가 닫힘
      await waitFor(() => {
        expect(screen.queryByText('반복 일정 수정')).not.toBeInTheDocument();
      });
    });
  });

  describe('TC-054: 동시 다이얼로그 열림 방지', () => {
    it('삭제 다이얼로그가 열린 상태에서 수정 다이얼로그를 열면 삭제 다이얼로그가 닫힌다', async () => {
      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      // 삭제 다이얼로그 열기
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();

      // 다른 일정의 수정 다이얼로그 열기
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[1]);

      // 삭제 다이얼로그는 닫히고 수정 다이얼로그만 열려야 함
      await waitFor(() => {
        expect(screen.queryByText('반복 일정 삭제')).not.toBeInTheDocument();
      });
      expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
    });
  });

  // Phase 5: Edge Cases & Error Handling - Integration
  describe('TC-051: 이전에 단일 수정된 일정은 시리즈 수정에서 제외', () => {
    it('단일 수정된 일정은 시리즈 수정 시 영향받지 않는다', async () => {
      const eventsWithSingleEdit: Event[] = [
        {
          id: '1',
          title: '반복 회의',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '반복 일정',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'daily',
            interval: 1,
            endDate: '2025-10-05',
            id: 'repeat-id-1',
          },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '반복 회의',
          date: '2025-10-02',
          startTime: '09:00',
          endTime: '10:00',
          description: '반복 일정',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'daily',
            interval: 1,
            endDate: '2025-10-05',
            id: 'repeat-id-1',
          },
          notificationTime: 10,
        },
        {
          id: '3',
          title: '단일 수정된 회의',
          date: '2025-10-03',
          startTime: '09:00',
          endTime: '10:00',
          description: '이전에 단일 수정됨',
          location: '회의실 C',
          category: '업무',
          repeat: {
            type: 'none', // 단일 수정으로 반복 제거됨
            interval: 0,
          },
          notificationTime: 10,
        },
        {
          id: '4',
          title: '반복 회의',
          date: '2025-10-04',
          startTime: '09:00',
          endTime: '10:00',
          description: '반복 일정',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'daily',
            interval: 1,
            endDate: '2025-10-05',
            id: 'repeat-id-1',
          },
          notificationTime: 10,
        },
        {
          id: '5',
          title: '반복 회의',
          date: '2025-10-05',
          startTime: '09:00',
          endTime: '10:00',
          description: '반복 일정',
          location: '회의실 A',
          category: '업무',
          repeat: {
            type: 'daily',
            interval: 1,
            endDate: '2025-10-05',
            id: 'repeat-id-1',
          },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: eventsWithSingleEdit });
        }),
        http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
          const updatedData = (await request.json()) as Partial<Event>;
          const updatedEvents = eventsWithSingleEdit.map((event) => {
            // repeat-id-1을 가진 이벤트만 업데이트 (id: 3은 제외)
            if (event.repeat.id === params.repeatId) {
              return { ...event, location: updatedData.location || event.location };
            }
            return event;
          });
          return HttpResponse.json({ events: updatedEvents });
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      // 시리즈 수정
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      await user.click(screen.getByRole('button', { name: '아니오' })); // 시리즈 수정

      await user.clear(screen.getByLabelText('위치'));
      await user.type(screen.getByLabelText('위치'), '회의실 B');

      await user.click(screen.getByTestId('event-submit-button'));

      // ID 3번(단일 수정된 일정)은 여전히 "회의실 C"
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('회의실 C')).toBeInTheDocument();
      expect(eventList.getByText('단일 수정된 회의')).toBeInTheDocument();
    });
  });

  describe('TC-052: 마지막 남은 일정 삭제', () => {
    it('개별 삭제 후 마지막 남은 일정도 확인 다이얼로그가 표시된다', async () => {
      const singleRemainingEvent: Event[] = [
        {
          id: '1',
          title: '반복 회의',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '마지막 남은 일정',
          location: '회의실',
          category: '업무',
          repeat: {
            type: 'daily',
            interval: 1,
            endDate: '2025-10-05',
            id: 'repeat-id-1',
          },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: singleRemainingEvent });
        }),
        http.delete('/api/events/:id', () => {
          return new HttpResponse(null, { status: 204 });
        }),
        http.delete('/api/recurring-events/:repeatId', () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { user } = setup(<App />);

      await screen.findByText('일정 로딩 완료!');

      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      // 다이얼로그가 여전히 표시됨
      expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
      expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
    });
  });

  describe('TC-055: 폼 검증 실패 시 반복 일정 생성 안됨', () => {
    it('시간 검증 실패 시 반복 일정이 생성되지 않는다', async () => {
      let apiCalled = false;

      server.use(
        http.post('/api/events-list', () => {
          apiCalled = true;
          return HttpResponse.json({ success: true }, { status: 201 });
        })
      );

      const { user } = setup(<App />);

      await user.click(screen.getAllByText('일정 추가')[0]);

      await user.type(screen.getByLabelText('제목'), '반복 테스트');
      await user.type(screen.getByLabelText('날짜'), '2025-01-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '09:00'); // 잘못된 시간

      await user.click(screen.getByLabelText('반복 유형'));
      await user.click(within(screen.getByLabelText('반복 유형')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '매일-option' }));

      await user.type(screen.getByLabelText('반복 종료일'), '2025-01-05');

      // 시간 검증 에러 표시
      expect(screen.getByText(/종료 시간은 시작 시간보다 늦어야 합니다/)).toBeInTheDocument();

      // 제출 버튼이 비활성화됨
      expect(screen.getByTestId('event-submit-button')).toBeDisabled();

      // API가 호출되지 않음 (버튼이 비활성화되어 클릭할 수 없으므로)
      expect(apiCalled).toBe(false);
    });
  });
});
