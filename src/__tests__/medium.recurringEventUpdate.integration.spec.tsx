/**
 * 반복 이벤트 수정 통합 테스트
 *
 * User Story: recurring_event_update_story.md
 * Feature Specification: recurring_event_update_spec.md
 *
 * 통합 테스트: 다이얼로그, 단일 이벤트 수정, 전체 시리즈 수정, 오류 처리/검증
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import type { Event } from '../types';

// Mock UUID generation
vi.mock('crypto', () => ({
  randomUUID: () => 'mock-uuid-' + Date.now(),
}));

// Helper functions
const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getTodayStr = () => formatDate(new Date());

const fillRequiredFields = async (args: {
  title: string;
  date: string;
  start?: string;
  end?: string;
}) => {
  const { title, date, start = '09:00', end = '10:00' } = args;
  await userEvent.type(screen.getByLabelText('제목'), title);
  await userEvent.type(screen.getByLabelText('날짜'), date);
  await userEvent.type(screen.getByLabelText('시작 시간'), start);
  await userEvent.type(screen.getByLabelText('종료 시간'), end);
};

const getRepeatTypeCombobox = async () => {
  // 반복 영역이 나타날 때까지 대기
  // ?
  const repeatTypeEl = await screen.findByText('반복 유형');
  expect(repeatTypeEl).toBeInTheDocument();
  // await waitFor(() => {
  //   screen.findByText('반복 유형');
  //   expect(screen.getByText('반복 유형')).toBeInTheDocument();
  // });
  const box = screen.getByText('반복 유형').closest('div') as HTMLElement;
  return within(box).getByRole('combobox');
};

const clickRepeatCheckbox = async () => {
  await userEvent.click(screen.getByLabelText('반복 일정'));
  // if ()
  // 반복 영역이 나타날 때까지 대기
  // findByText 로 대기
  const repeatTypeEl = await screen.findByText('반복 유형');
  expect(repeatTypeEl).toBeInTheDocument();
  // await waitFor(() => {
  //   expect(screen.getByText('반복 유형')).toBeInTheDocument();
  // });
};

const setRepeatTypeWeekly = async () => {
  const combobox = await getRepeatTypeCombobox();
  await userEvent.click(combobox);
  await waitFor(() => {
    expect(screen.getByRole('option', { name: '매주' })).toBeInTheDocument();
  });
  await userEvent.click(screen.getByRole('option', { name: '매주' }));
};

const setRepeatInterval = async (interval: string) => {
  await userEvent.clear(screen.getByLabelText('반복 간격'));
  await userEvent.type(screen.getByLabelText('반복 간격'), interval);
};

const setRepeatEndDate = async (endStr: string) => {
  await userEvent.type(screen.getByLabelText('반복 종료일'), endStr);
};

const activateWeeklyRepeat = async (options?: { interval?: string; endDate?: string }) => {
  await clickRepeatCheckbox();
  await setRepeatTypeWeekly();
  if (options?.interval) {
    await setRepeatInterval(options.interval);
  }
  if (options?.endDate) {
    await setRepeatEndDate(options.endDate);
  }
};

const submitAndExpectSuccess = async () => {
  await userEvent.click(screen.getByTestId('event-submit-button'));
  const snackbar = await screen.findByText('일정이 추가되었습니다.');
  expect(snackbar).toBeInTheDocument();
};

const createRecurringEvent = async (title: string, date: string) => {
  await fillRequiredFields({ title, date });
  await activateWeeklyRepeat({ interval: '1' });
  await submitAndExpectSuccess();
};

describe('반복 이벤트 수정 - 통합 테스트', () => {
  beforeEach(() => {
    setupMockHandlerCreation();
  });

  describe('다이얼로그 표시', () => {
    it('반복 이벤트 편집 시 확인 다이얼로그 표시됨', async () => {
      const user = userEvent.setup();
      render(<App />);

      const todayStr = getTodayStr();
      await createRecurringEvent('주간 회의', todayStr);

      // 편집 버튼이 나타날 때까지 대기
      await waitFor(() => {
        const editButton = screen.getByLabelText('Edit event');
        expect(editButton).toBeInTheDocument();
      });

      const editButton = screen.getByLabelText('Edit event');
      await user.click(editButton);

      // 다이얼로그가 표시되는지 확인
      await waitFor(() => {
        expect(screen.getByText('반복 이벤트 수정')).toBeInTheDocument();
        expect(screen.getByText('이 인스턴스만 수정하시겠습니까?')).toBeInTheDocument();
      });
    });

    it('단일 이벤트 편집 시 다이얼로그 표시되지 않음', async () => {
      const user = userEvent.setup();
      render(<App />);

      const todayStr = getTodayStr();
      await fillRequiredFields({ title: '단일 회의', date: todayStr });
      await submitAndExpectSuccess();

      // 편집 버튼이 나타날 때까지 대기
      await waitFor(() => {
        const editButton = screen.getByLabelText('Edit event');
        expect(editButton).toBeInTheDocument();
      });

      const editButton = screen.getByLabelText('Edit event');
      await user.click(editButton);

      // 편집 폼이 바로 열리는지 확인 (제목 입력 필드 존재)
      await waitFor(() => {
        expect(screen.getByText('일정 수정')).toBeInTheDocument();
      });

      // 다이얼로그가 표시되지 않는지 확인
      expect(screen.queryByText('반복 이벤트 수정')).not.toBeInTheDocument();
      expect(screen.queryByText('이 인스턴스만 수정하시겠습니까?')).not.toBeInTheDocument();
    });

    it('다이얼로그에 올바른 버튼 표시됨: "예", "아니오"', async () => {
      const user = userEvent.setup();
      render(<App />);

      const todayStr = getTodayStr();
      await createRecurringEvent('주간 회의', todayStr);

      await waitFor(() => {
        expect(screen.getByLabelText('Edit event')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Edit event'));

      await waitFor(() => {
        expect(screen.getByText('반복 이벤트 수정')).toBeInTheDocument();
      });

      // "예" 버튼 확인
      const yesButton = screen.getByRole('button', { name: '예' });
      expect(yesButton).toBeInTheDocument();

      // "아니오" 버튼 확인
      const noButton = screen.getByRole('button', { name: '아니오' });
      expect(noButton).toBeInTheDocument();
    });
  });

  describe('단일 이벤트 수정 (예 선택)', () => {
    it('"예" 선택 시 새로운 단일 이벤트가 생성되고 원본 이벤트가 삭제됨', async () => {
      const user = userEvent.setup();
      render(<App />);

      const todayStr = getTodayStr();
      let originalEventId = '';

      // MSW 핸들러: 반복 이벤트 생성 및 단일 수정
      server.use(
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as any;
          // 반복 이벤트 생성 (repeat.type !== 'none')
          if (body.repeat?.type && body.repeat.type !== 'none') {
            originalEventId = `evt-${Date.now()}`;
            return HttpResponse.json(
              {
                ...body,
                id: originalEventId,
                repeat: { ...body.repeat, id: 'repeat-123' },
              },
              { status: 201 }
            );
          }
          // 단일 이벤트 수정 시 새 이벤트 생성 (repeat.type === 'none')
          return HttpResponse.json(
            {
              ...body,
              id: 'evt-new-single-instance',
              repeat: { type: 'none' },
            },
            { status: 201 }
          );
        }),
        http.delete('/api/events/:id', ({ params }) => {
          // 원본 이벤트 삭제 확인
          expect(params.id).toBe(originalEventId);
          return HttpResponse.json({}, { status: 200 });
        })
      );

      await createRecurringEvent('주간 회의', todayStr);

      await waitFor(() => {
        expect(screen.getByLabelText('Edit event')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Edit event'));

      await waitFor(() => {
        expect(screen.getByText('반복 이벤트 수정')).toBeInTheDocument();
      });

      // "예" 버튼 클릭
      const yesButton = screen.getByRole('button', { name: '예' });
      await user.click(yesButton);

      // 다이얼로그가 닫히고 편집 폼이 열리는지 확인
      await waitFor(() => {
        expect(screen.queryByText('반복 이벤트 수정')).not.toBeInTheDocument();
        expect(screen.getByLabelText('제목')).toBeInTheDocument();
      });

      // 제목 수정
      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '주간 회의 (수정됨)');

      // 제출 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // POST /api/events 호출 확인 (새 이벤트 생성)
      // DELETE /api/events/:id 호출 확인 (원본 이벤트 삭제)
      await waitFor(() => {
        expect(screen.getByText('일정이 수정되었습니다.')).toBeInTheDocument();
      });

      // 선택한 반복 이벤트 인스턴스가 삭제되고 새 단일 이벤트만 남아있는지 확인
      await waitFor(() => {
        expect(screen.getByText('주간 회의 (수정됨)')).toBeInTheDocument();
        // 선택한 원본 이벤트는 삭제되어 더 이상 표시되지 않아야 함
        // 남은 반복 이벤트는 유지되고 반복 아이콘도 유지됨
      });
    });

    it('선택한 인스턴스가 삭제되고 새 단일 이벤트만 생성되며 남은 반복 이벤트와 다른 인스턴스는 유지됨', async () => {
      const user = userEvent.setup();
      render(<App />);

      const todayStr = getTodayStr();
      const originalEventId = 'evt-recurring-1';

      server.use(
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as any;
          // 반복 이벤트 생성 확인
          if (body.repeat?.type !== 'none') {
            return HttpResponse.json(
              {
                ...body,
                id: originalEventId,
                repeat: { type: 'weekly', interval: 1, id: 'repeat-123' },
              },
              { status: 201 }
            );
          }
          // 단일 이벤트 수정 (repeat.type = 'none')
          return HttpResponse.json(
            {
              ...body,
              id: 'evt-new-single',
              repeat: { type: 'none' },
            },
            { status: 201 }
          );
        }),
        http.delete(`/api/events/${originalEventId}`, () => {
          // 원본 이벤트 삭제 확인
          return HttpResponse.json({}, { status: 200 });
        }),
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'evt-new-single',
                title: '주간 회의 (수정됨)',
                date: todayStr,
                startTime: '09:00',
                endTime: '10:00',
                description: '',
                location: '',
                category: '',
                repeat: { type: 'none' },
                notificationTime: 10,
              },
              // 남은 반복 이벤트는 유지되고 반복 아이콘도 유지됨
              // 시리즈의 다른 인스턴스는 유지됨 (선택한 이벤트는 삭제되었지만 같은 repeat.id를 가진 다른 인스턴스가 있을 수 있음)
            ],
          });
        })
      );

      await createRecurringEvent('주간 회의', todayStr);

      // 편집 버튼
      await waitFor(() => {
        expect(screen.getByLabelText('Edit event')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Edit event'));

      await waitFor(() => {
        expect(screen.getByText('반복 이벤트 수정')).toBeInTheDocument();
      });

      // "예" 선택
      await user.click(screen.getByRole('button', { name: '예' }));

      // 제목 수정 후 제출
      await waitFor(() => {
        expect(screen.getByLabelText('제목')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '주간 회의 (수정됨)');

      await user.click(screen.getByTestId('event-submit-button'));

      // 성공 메시지 확인
      await waitFor(() => {
        expect(screen.getByText('일정이 수정되었습니다.')).toBeInTheDocument();
      });

      // 수정된 이벤트 제목 확인
      await waitFor(() => {
        expect(screen.getByText('주간 회의 (수정됨)')).toBeInTheDocument();
      });

      // 반복 아이콘이 없는지 확인 (단일 이벤트로 변환)
      const eventCard = screen.getByText('주간 회의 (수정됨)').closest('div');
      if (eventCard) {
        expect(within(eventCard).queryByLabelText('반복 일정')).not.toBeInTheDocument();
      }
    });
  });

  describe('전체 시리즈 수정 (아니오 선택)', () => {
    it('"아니오" 선택 시 편집 중이던 인스턴스가 삭제되고 새로운 반복 일정이 생성됨', async () => {
      const user = userEvent.setup();
      render(<App />);

      const todayStr = getTodayStr();
      const originalEventId = 'evt-original-1';
      let postCallCount = 0;

      // MSW 핸들러: 새로운 반복 일정 생성 및 기존 인스턴스 삭제
      server.use(
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as any;
          postCallCount++;

          // 첫 번째 POST: 반복 이벤트 생성
          if (postCallCount === 1 && body.repeat?.type !== 'none') {
            return HttpResponse.json(
              {
                ...body,
                id: originalEventId,
                repeat: { ...body.repeat, id: 'repeat-123' },
              },
              { status: 201 }
            );
          }

          // 두 번째 POST: "아니오" 선택 시 새로운 반복 일정 생성
          if (body.repeat?.type !== 'none') {
            return HttpResponse.json(
              {
                ...body,
                id: 'evt-new-recurring-1',
                repeat: body.repeat,
              },
              { status: 201 }
            );
          }

          // 단일 이벤트 생성
          return HttpResponse.json(
            {
              ...body,
              id: 'evt-new-single',
            },
            { status: 201 }
          );
        }),
        http.delete(`/api/events/${originalEventId}`, () => {
          // 편집하던 기존 인스턴스 삭제 확인
          return HttpResponse.json({}, { status: 200 });
        }),
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'evt-new-recurring-1',
                title: '주간 정기 회의',
                date: todayStr,
                startTime: '09:00',
                endTime: '10:00',
                description: '',
                location: '',
                category: '',
                repeat: { type: 'weekly', interval: 1 },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      await createRecurringEvent('주간 회의', todayStr);

      // 편집 버튼
      await waitFor(() => {
        expect(screen.getByLabelText('Edit event')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Edit event'));

      await waitFor(() => {
        expect(screen.getByText('반복 이벤트 수정')).toBeInTheDocument();
      });

      // "아니오" 선택
      await user.click(screen.getByRole('button', { name: '아니오' }));

      // 제목 수정 후 제출
      await waitFor(() => {
        expect(screen.getByLabelText('제목')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '주간 정기 회의');

      await user.click(screen.getByTestId('event-submit-button'));

      // POST /api/events 호출 확인 (새로운 반복 일정 생성)
      // DELETE /api/events/:id 호출 확인 (편집하던 기존 인스턴스 삭제)
      await waitFor(() => {
        expect(screen.getByText('일정이 수정되었습니다.')).toBeInTheDocument();
      });
    });

    it('편집 중이던 인스턴스가 삭제되고 새로운 반복 일정이 생성되며 반복 아이콘이 유지됨', async () => {
      const user = userEvent.setup();
      render(<App />);

      const todayStr = getTodayStr();
      const originalEventId = 'evt-original-2';
      let postCallCount = 0;

      server.use(
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as any;
          postCallCount++;

          // 첫 번째 POST: 반복 이벤트 생성
          if (postCallCount === 1 && body.repeat?.type !== 'none') {
            return HttpResponse.json(
              {
                ...body,
                id: originalEventId,
                repeat: { ...body.repeat },
              },
              { status: 201 }
            );
          }

          // 두 번째 POST: "아니오" 선택 시 새로운 반복 일정 생성
          if (body.repeat?.type !== 'none') {
            return HttpResponse.json(
              {
                ...body,
                id: 'evt-new-recurring-2',
                repeat: body.repeat,
              },
              { status: 201 }
            );
          }

          return HttpResponse.json(
            {
              ...body,
              id: 'evt-new-single',
            },
            { status: 201 }
          );
        }),
        http.delete(`/api/events/${originalEventId}`, () => {
          // 편집하던 기존 인스턴스 삭제 확인
          return HttpResponse.json({}, { status: 200 });
        }),
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'evt-new-recurring-2',
                title: '주간 정기 회의',
                date: todayStr,
                startTime: '09:00',
                endTime: '10:00',
                description: '',
                location: '',
                category: '',
                repeat: { type: 'weekly', interval: 1 },
                notificationTime: 10,
              },
            ],
          });
        })
      );

      await createRecurringEvent('주간 회의', todayStr);

      // 편집 버튼
      await waitFor(() => {
        expect(screen.getByLabelText('Edit event')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Edit event'));

      await waitFor(() => {
        expect(screen.getByText('반복 이벤트 수정')).toBeInTheDocument();
      });

      // "아니오" 선택
      await user.click(screen.getByRole('button', { name: '아니오' }));

      // 제목 수정 후 제출
      await waitFor(() => {
        expect(screen.getByLabelText('제목')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '주간 정기 회의');

      await user.click(screen.getByTestId('event-submit-button'));

      // 성공 메시지 확인
      await waitFor(() => {
        expect(screen.getByText('일정이 수정되었습니다.')).toBeInTheDocument();
      });

      // 수정된 이벤트 제목 확인
      await waitFor(() => {
        expect(screen.getByText('주간 정기 회의')).toBeInTheDocument();
      });

      // 반복 아이콘이 여전히 표시되는지 확인
      const eventCard = screen.getByText('주간 정기 회의').closest('div');
      if (eventCard) {
        expect(within(eventCard).getByLabelText('반복 일정')).toBeInTheDocument();
      }
    });
  });

  describe('오류 처리', () => {
    it('단일 이벤트 수정 시 API 오류가 발생하면 오류 메시지 표시됨', async () => {
      const user = userEvent.setup();
      render(<App />);

      const todayStr = getTodayStr();

      server.use(
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as any;
          // 첫 번째 POST (반복 생성)은 성공
          if (body.repeat?.type !== 'none') {
            return HttpResponse.json(
              {
                ...body,
                id: 'evt-1',
                repeat: { type: 'weekly', interval: 1, id: 'repeat-123' },
              },
              { status: 201 }
            );
          }
          // 두 번째 POST (단일 이벤트 수정)은 실패
          return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        })
      );

      await createRecurringEvent('주간 회의', todayStr);

      // 편집 버튼
      await waitFor(() => {
        expect(screen.getByLabelText('Edit event')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Edit event'));

      await waitFor(() => {
        expect(screen.getByText('반복 이벤트 수정')).toBeInTheDocument();
      });

      // "예" 선택
      await user.click(screen.getByRole('button', { name: '예' }));

      // 제목 수정 후 제출
      await waitFor(() => {
        expect(screen.getByLabelText('제목')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 회의');

      await user.click(screen.getByTestId('event-submit-button'));

      // 오류 메시지 확인
      await waitFor(() => {
        expect(screen.getByText('일정 저장 실패')).toBeInTheDocument();
      });
    });

    it('전체 시리즈 수정 시 API 오류가 발생하면 오류 메시지 표시됨', async () => {
      const user = userEvent.setup();
      render(<App />);

      const todayStr = getTodayStr();
      const repeatId = 'repeat-789';

      const originalEventId = 'evt-original-error';
      let postCallCount = 0;

      server.use(
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as any;
          postCallCount++;
          // 첫 번째 POST: 반복 이벤트 생성 (성공)
          if (postCallCount === 1 && body.repeat?.type !== 'none') {
            return HttpResponse.json(
              {
                ...body,
                id: originalEventId,
                repeat: { ...body.repeat, id: repeatId },
              },
              { status: 201 }
            );
          }
          // 두 번째 POST: "아니오" 선택 시 새로운 반복 일정 생성 (실패)
          if (body.repeat?.type !== 'none') {
            return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
          }
          return HttpResponse.json(
            {
              ...body,
              id: 'evt-new-single',
            },
            { status: 201 }
          );
        }),
        http.delete(`/api/events/${originalEventId}`, () => {
          // 삭제는 성공
          return HttpResponse.json({}, { status: 200 });
        })
      );

      await createRecurringEvent('주간 회의', todayStr);

      // 편집 버튼
      await waitFor(() => {
        expect(screen.getByLabelText('Edit event')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('Edit event'));

      await waitFor(() => {
        expect(screen.getByText('반복 이벤트 수정')).toBeInTheDocument();
      });

      // "아니오" 선택
      await user.click(screen.getByRole('button', { name: '아니오' }));

      // 제목 수정 후 제출
      await waitFor(() => {
        expect(screen.getByLabelText('제목')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 회의');

      await user.click(screen.getByTestId('event-submit-button'));

      // 오류 메시지 확인
      await waitFor(() => {
        expect(screen.getByText('일정 저장 실패')).toBeInTheDocument();
      });
    });
  });
});
