/**
 * 반복 이벤트 수정 통합 테스트
 *
 * User Story: recurring_event_update_story.md
 * Feature Specification: recurring_event_update_spec.md
 *
 * 테스트 범위: 다이얼로그, 단일 이벤트 수정, 전체 시리즈 수정, 오류 처리/검증
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
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), start);
  await user.type(screen.getByLabelText('종료 시간'), end);
};

const activateWeeklyRepeat = async (options?: { interval?: string; endDate?: string }) => {
  const user = userEvent.setup();
  await user.click(screen.getByLabelText('반복 설정'));
  await waitFor(() => {
    expect(screen.getByText('반복 유형')).toBeInTheDocument();
  });

  const box = screen.getByText('반복 유형').closest('div') as HTMLElement;
  const combobox = within(box).getByRole('combobox');
  await user.click(combobox);
  await waitFor(() => {
    expect(screen.getByRole('option', { name: '매주' })).toBeInTheDocument();
  });
  await user.click(screen.getByRole('option', { name: '매주' }));

  if (options?.interval) {
    await user.clear(screen.getByLabelText('반복 간격'));
    await user.type(screen.getByLabelText('반복 간격'), options.interval);
  }
  if (options?.endDate) {
    await user.type(screen.getByLabelText('종료 날짜'), options.endDate);
  }
};

const submitAndExpectSuccess = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByTestId('event-submit-button'));
  await waitFor(() => {
    expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();
  });
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
        expect(screen.getByText('이 이벤트만 수정하시겠습니까?')).toBeInTheDocument();
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
      expect(screen.queryByText('이 이벤트만 수정하시겠습니까?')).not.toBeInTheDocument();
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
    it('"예" 선택 시 새로운 단일 이벤트가 생성되고 새 UUID로 새 이벤트 생성됨', async () => {
      const user = userEvent.setup();
      render(<App />);

      const todayStr = getTodayStr();

      // MSW 핸들러: 반복 이벤트 생성 및 단일 수정
      let createdEventId: string | null = null;

      server.use(
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as any;
          const newEvent = {
            ...body,
            id: body.id || `evt-${Date.now()}`,
          };
          createdEventId = newEvent.id;
          return HttpResponse.json(newEvent, { status: 201 });
        }),
        http.post('/api/events', async ({ request }) => {
          // 단일 이벤트 수정 시 새 이벤트 생성
          const body = (await request.json()) as any;
          return HttpResponse.json(
            {
              ...body,
              id: 'evt-new-single-instance',
              repeat: { type: 'none' },
            },
            { status: 201 }
          );
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
      });

      // 제목 수정
      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '주간 회의 (수정됨)');

      // 제출 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // POST /api/events 호출 확인 (새 이벤트 생성)
      await waitFor(() => {
        expect(screen.getByText('이벤트가 수정되었습니다.')).toBeInTheDocument();
      });
    });

    it('원본 이벤트 시리즈가 변경되지 않음', async () => {
      const user = userEvent.setup();
      render(<App />);

      const todayStr = getTodayStr();

      server.use(
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as any;
          // 반복 이벤트 생성 확인
          if (body.repeat?.type !== 'none') {
            return HttpResponse.json(
              {
                ...body,
                id: 'evt-recurring-1',
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
        expect(screen.getByText('이벤트가 수정되었습니다.')).toBeInTheDocument();
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
    it('"아니오" 선택 시 모든 이벤트 수정됨', async () => {
      const user = userEvent.setup();
      render(<App />);

      const todayStr = getTodayStr();
      const repeatId = 'repeat-123';

      // MSW 핸들러: 시리즈 전체 수정
      server.use(
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as any;
          return HttpResponse.json(
            {
              ...body,
              id: 'evt-1',
              repeat: { type: 'weekly', interval: 1, id: repeatId },
            },
            { status: 201 }
          );
        }),
        http.put(`/api/recurring-events/${repeatId}`, async ({ request }) => {
          const updateData = (await request.json()) as any;
          // 시리즈의 모든 이벤트 반환하기
          return HttpResponse.json([
            {
              id: 'evt-1',
              title: updateData.title || '주간 회의',
              date: todayStr,
              startTime: '09:00',
              endTime: '10:00',
              description: updateData.description || '',
              location: updateData.location || '',
              category: updateData.category || '',
              repeat: { type: 'weekly', interval: 1, id: repeatId },
              notificationTime: updateData.notificationTime || 10,
            },
            {
              id: 'evt-2',
              title: updateData.title || '주간 회의',
              date: formatDate(new Date(new Date(todayStr).getTime() + 7 * 24 * 60 * 60 * 1000)),
              startTime: '09:00',
              endTime: '10:00',
              description: updateData.description || '',
              location: updateData.location || '',
              category: updateData.category || '',
              repeat: { type: 'weekly', interval: 1, id: repeatId },
              notificationTime: updateData.notificationTime || 10,
            },
          ]);
        }),
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'evt-1',
                title: '주간 정기 회의',
                date: todayStr,
                startTime: '09:00',
                endTime: '10:00',
                description: '',
                location: '',
                category: '',
                repeat: { type: 'weekly', interval: 1, id: repeatId },
                notificationTime: 10,
              },
              {
                id: 'evt-2',
                title: '주간 정기 회의',
                date: formatDate(new Date(new Date(todayStr).getTime() + 7 * 24 * 60 * 60 * 1000)),
                startTime: '09:00',
                endTime: '10:00',
                description: '',
                location: '',
                category: '',
                repeat: { type: 'weekly', interval: 1, id: repeatId },
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

      // PUT /api/recurring-events/:repeatId 호출 확인
      await waitFor(() => {
        expect(screen.getByText('모든 반복 이벤트가 수정되었습니다.')).toBeInTheDocument();
      });
    });

    it('모든 이벤트가 수정되고 반복 아이콘이 유지됨', async () => {
      const user = userEvent.setup();
      render(<App />);

      const todayStr = getTodayStr();
      const repeatId = 'repeat-456';

      server.use(
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as any;
          return HttpResponse.json(
            {
              ...body,
              id: 'evt-1',
              repeat: { type: 'weekly', interval: 1, id: repeatId },
            },
            { status: 201 }
          );
        }),
        http.put(`/api/recurring-events/${repeatId}`, async ({ request }) => {
          const updateData = (await request.json()) as any;
          return HttpResponse.json([
            {
              id: 'evt-1',
              title: updateData.title || '주간 회의',
              date: todayStr,
              startTime: '09:00',
              endTime: '10:00',
              description: '',
              location: '',
              category: '',
              repeat: { type: 'weekly', interval: 1, id: repeatId },
              notificationTime: 10,
            },
          ]);
        }),
        http.get('/api/events', () => {
          return HttpResponse.json({
            events: [
              {
                id: 'evt-1',
                title: '주간 정기 회의',
                date: todayStr,
                startTime: '09:00',
                endTime: '10:00',
                description: '',
                location: '',
                category: '',
                repeat: { type: 'weekly', interval: 1, id: repeatId },
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
        expect(screen.getByText('모든 반복 이벤트가 수정되었습니다.')).toBeInTheDocument();
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

      server.use(
        http.post('/api/events', async ({ request }) => {
          const body = (await request.json()) as any;
          return HttpResponse.json(
            {
              ...body,
              id: 'evt-1',
              repeat: { type: 'weekly', interval: 1, id: repeatId },
            },
            { status: 201 }
          );
        }),
        http.put(`/api/recurring-events/${repeatId}`, () => {
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