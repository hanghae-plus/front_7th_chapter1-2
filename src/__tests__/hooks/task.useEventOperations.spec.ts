/**
 * TDD RED 단계 테스트
 * 작성일: 2025-10-30
 * 기능: 반복 일정 배치 API 메서드
 *
 * 예상 실패 (구현 전):
 * - ✗ saveRecurringEvents 메서드가 존재하지 않음
 * - ✗ updateRecurringSeries 메서드가 존재하지 않음
 * - ✗ deleteRecurringSeries 메서드가 존재하지 않음
 * - ✗ saveEvent의 분기 로직이 구현되지 않음
 *
 * GREEN 단계 이후 (예상):
 * - ✓ 모든 테스트가 통과해야 함
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { useEventOperations } from '../../hooks/useEventOperations';
import { server } from '../../setupTests';
import { EventForm, UpdateRecurringSeriesRequest } from '../../types';

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

describe('useEventOperations - saveRecurringEvents', () => {
  it('반복 일정 배치 생성 성공 시 POST /api/events-list를 호출하고 성공 메시지를 표시한다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const recurringEvent: EventForm = {
      title: '주간 회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 주간 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' },
      notificationTime: 10,
    };

    // MSW 핸들러 설정
    let requestBody: { events: EventForm[] };
    server.use(
      http.post('/api/events-list', async ({ request }) => {
        requestBody = (await request.json()) as { events: EventForm[] };
        const events = requestBody.events.map((event: EventForm, index: number) => ({
          id: String(index + 1),
          ...event,
          repeat: {
            ...event.repeat,
            id: 'repeat-xyz789',
          },
        }));
        return HttpResponse.json({ events }, { status: 201 });
      })
    );

    // When
    await act(async () => {
      await result.current.saveEvent(recurringEvent);
    });

    // Then
    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith(
        expect.stringContaining('반복 일정이 생성되었습니다'),
        expect.objectContaining({ variant: 'success' })
      );
    });
  });

  it('반복 날짜가 없는 경우 에러 메시지를 표시한다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const invalidEvent: EventForm = {
      title: '잘못된 반복 일정',
      date: 'invalid-date',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트',
      location: '',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-12-31' },
      notificationTime: 10,
    };

    // When
    await act(async () => {
      await result.current.saveEvent(invalidEvent);
    });

    // Then
    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith(
        '반복 일정을 생성할 수 없습니다.',
        expect.objectContaining({ variant: 'error' })
      );
    });
  });

  it('배치 API 호출 실패 시 에러 메시지를 표시한다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const recurringEvent: EventForm = {
      title: '주간 회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 주간 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' },
      notificationTime: 10,
    };

    // MSW 핸들러: 500 에러 반환
    server.use(
      http.post('/api/events-list', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    // When
    await act(async () => {
      await result.current.saveEvent(recurringEvent);
    });

    // Then
    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith(
        '반복 일정 생성 실패',
        expect.objectContaining({ variant: 'error' })
      );
    });
  });

  it('31일 특수 규칙으로 인한 배치 생성 - 5개의 일정만 생성된다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const monthlyEvent: EventForm = {
      title: '월말 회의',
      date: '2025-01-31',
      startTime: '14:00',
      endTime: '15:00',
      description: '월말 팀 미팅',
      location: '회의실 C',
      category: '업무',
      repeat: { type: 'monthly', interval: 1, endDate: '2025-06-31' },
      notificationTime: 10,
    };

    // MSW 핸들러 설정
    server.use(
      http.post('/api/events-list', async ({ request }) => {
        const body = (await request.json()) as { events: EventForm[] };
        const events = body.events.map((event: EventForm, index: number) => ({
          id: String(index + 1),
          ...event,
          repeat: {
            ...event.repeat,
            id: 'repeat-monthly',
          },
        }));
        return HttpResponse.json({ events }, { status: 201 });
      })
    );

    // When
    await act(async () => {
      await result.current.saveEvent(monthlyEvent);
    });

    // Then
    await waitFor(() => {
      // 31일이 있는 달만: 1, 3, 5월 (6월은 30일까지) = 3개 또는 5개 (7, 8월 포함 여부에 따라)
      expect(enqueueSnackbarFn).toHaveBeenCalledWith(
        expect.stringMatching(/반복 일정이 생성되었습니다\./),
        expect.objectContaining({ variant: 'success' })
      );
    });
  });

  it('네트워크 에러 발생 시 적절한 에러 메시지를 표시한다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const recurringEvent: EventForm = {
      title: '주간 회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 주간 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' },
      notificationTime: 10,
    };

    // MSW 핸들러: 네트워크 에러 시뮬레이션
    server.use(
      http.post('/api/events-list', () => {
        return HttpResponse.error();
      })
    );

    // When
    await act(async () => {
      await result.current.saveEvent(recurringEvent);
    });

    // Then
    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith(
        expect.stringContaining('실패'),
        expect.objectContaining({ variant: 'error' })
      );
    });
  });
});

describe('useEventOperations - updateRecurringSeries', () => {
  it('반복 시리즈 전체 수정 성공 시 PUT /api/recurring-events/:repeatId를 호출한다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const repeatId = 'repeat-123';
    const updateData = {
      title: '수정된 제목',
      description: '수정된 설명',
    };

    // MSW 핸들러 설정
    let requestCalled = false;
    server.use(
      http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
        requestCalled = true;
        expect(params.repeatId).toBe(repeatId);
        const body = await request.json();
        expect(body).toEqual(updateData);
        return HttpResponse.json({ success: true }, { status: 200 });
      })
    );

    // When
    await act(async () => {
      // @ts-expect-error - updateRecurringSeries는 아직 구현되지 않음 (RED phase)
      await result.current.updateRecurringSeries?.(repeatId, updateData);
    });

    // Then
    await waitFor(() => {
      expect(requestCalled).toBe(true);
      expect(enqueueSnackbarFn).toHaveBeenCalledWith(
        '반복 일정 시리즈가 수정되었습니다.',
        expect.objectContaining({ variant: 'success' })
      );
    });
  });

  it('존재하지 않는 repeatId로 수정 시도 시 404 에러를 처리한다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const repeatId = 'invalid-repeat-id';
    const updateData = { title: '수정된 제목' };

    // MSW 핸들러: 404 에러 반환
    server.use(
      http.put('/api/recurring-events/:repeatId', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    // When & Then
    await act(async () => {
      try {
        // @ts-expect-error - updateRecurringSeries는 아직 구현되지 않음 (RED phase)
        await result.current.updateRecurringSeries?.(repeatId, updateData);
      } catch (error) {
        // 에러가 throw되므로 여기서 catch
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Recurring series not found');
      }
    });
  });

  it('반복 정보 부분 수정 시 repeat 필드만 업데이트된다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const repeatId = 'repeat-123';
    const updateData = {
      repeat: { endDate: '2025-12-31' },
    };

    // MSW 핸들러 설정
    let requestBody: UpdateRecurringSeriesRequest;
    server.use(
      http.put('/api/recurring-events/:repeatId', async ({ request }) => {
        requestBody = (await request.json()) as UpdateRecurringSeriesRequest;
        return HttpResponse.json({ success: true }, { status: 200 });
      })
    );

    // When
    await act(async () => {
      // @ts-expect-error - updateRecurringSeries는 아직 구현되지 않음 (RED phase)
      await result.current.updateRecurringSeries?.(repeatId, updateData);
    });

    // Then
    await waitFor(() => {
      expect(requestBody).toHaveProperty('repeat');
      expect(requestBody.repeat.endDate).toBe('2025-12-31');
    });
  });

  it('수정 실패 시 에러 메시지를 표시한다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const repeatId = 'repeat-123';
    const updateData = { title: '수정된 제목' };

    // MSW 핸들러: 500 에러 반환
    server.use(
      http.put('/api/recurring-events/:repeatId', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    // When & Then
    await act(async () => {
      try {
        // @ts-expect-error - updateRecurringSeries는 아직 구현되지 않음 (RED phase)
        await result.current.updateRecurringSeries?.(repeatId, updateData);
      } catch (error) {
        // 에러가 throw되므로 여기서 catch
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Failed to update recurring series');
      }
    });
  });
});

describe('useEventOperations - deleteRecurringSeries', () => {
  it('반복 시리즈 전체 삭제 성공 시 DELETE /api/recurring-events/:repeatId를 호출한다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const repeatId = 'repeat-123';

    // MSW 핸들러 설정
    let requestCalled = false;
    server.use(
      http.delete('/api/recurring-events/:repeatId', ({ params }) => {
        requestCalled = true;
        expect(params.repeatId).toBe(repeatId);
        return new HttpResponse(null, { status: 204 });
      })
    );

    // When
    await act(async () => {
      // @ts-expect-error - deleteRecurringSeries는 아직 구현되지 않음 (RED phase)
      await result.current.deleteRecurringSeries?.(repeatId);
    });

    // Then
    await waitFor(() => {
      expect(requestCalled).toBe(true);
      expect(enqueueSnackbarFn).toHaveBeenCalledWith(
        '반복 일정 시리즈가 삭제되었습니다.',
        expect.objectContaining({ variant: 'info' })
      );
    });
  });

  it('존재하지 않는 repeatId로 삭제 시도 시 404 에러를 처리한다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const repeatId = 'invalid-repeat-id';

    // MSW 핸들러: 404 에러 반환
    server.use(
      http.delete('/api/recurring-events/:repeatId', () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    // When
    await act(async () => {
      // @ts-expect-error - deleteRecurringSeries는 아직 구현되지 않음 (RED phase)
      await result.current.deleteRecurringSeries?.(repeatId);
    });

    // Then
    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith(
        expect.stringContaining('찾을 수 없습니다'),
        expect.objectContaining({ variant: 'error' })
      );
    });
  });

  it('삭제 실패 시 에러 메시지를 표시한다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const repeatId = 'repeat-123';

    // MSW 핸들러: 500 에러 반환
    server.use(
      http.delete('/api/recurring-events/:repeatId', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    // When
    await act(async () => {
      // @ts-expect-error - deleteRecurringSeries는 아직 구현되지 않음 (RED phase)
      await result.current.deleteRecurringSeries?.(repeatId);
    });

    // Then
    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith(
        '반복 일정 삭제 실패',
        expect.objectContaining({ variant: 'error' })
      );
    });
  });

  it('네트워크 에러 발생 시 에러 메시지를 표시한다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const repeatId = 'repeat-123';

    // MSW 핸들러: 네트워크 에러 시뮬레이션
    server.use(
      http.delete('/api/recurring-events/:repeatId', () => {
        return HttpResponse.error();
      })
    );

    // When
    await act(async () => {
      // @ts-expect-error - deleteRecurringSeries는 아직 구현되지 않음 (RED phase)
      await result.current.deleteRecurringSeries?.(repeatId);
    });

    // Then
    await waitFor(() => {
      expect(enqueueSnackbarFn).toHaveBeenCalledWith(
        expect.stringContaining('실패'),
        expect.objectContaining({ variant: 'error' })
      );
    });
  });
});

describe('useEventOperations - saveEvent 분기 로직', () => {
  it('신규 반복 일정 생성 시 POST /api/events-list를 호출한다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const recurringEvent: EventForm = {
      title: '주간 회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 주간 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-02-05' },
      notificationTime: 10,
    };

    // MSW 핸들러 설정
    let batchApiCalled = false;
    let singleApiCalled = false;

    server.use(
      http.post('/api/events-list', async ({ request }) => {
        batchApiCalled = true;
        const body = (await request.json()) as { events: EventForm[] };
        const events = body.events.map((event: EventForm, index: number) => ({
          id: String(index + 1),
          ...event,
          repeat: { ...event.repeat, id: 'repeat-xyz' },
        }));
        return HttpResponse.json({ events }, { status: 201 });
      }),
      http.post('/api/events', () => {
        singleApiCalled = true;
        return HttpResponse.json({}, { status: 201 });
      })
    );

    // When
    await act(async () => {
      await result.current.saveEvent(recurringEvent);
    });

    // Then
    await waitFor(() => {
      expect(batchApiCalled).toBe(true);
      expect(singleApiCalled).toBe(false);
    });
  });

  it('신규 일반 일정 생성 시 POST /api/events를 호출한다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const normalEvent: EventForm = {
      title: '일반 회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '일반 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    // MSW 핸들러 설정
    let batchApiCalled = false;
    let singleApiCalled = false;

    server.use(
      http.post('/api/events-list', () => {
        batchApiCalled = true;
        return HttpResponse.json({}, { status: 201 });
      }),
      http.post('/api/events', async ({ request }) => {
        singleApiCalled = true;
        const event = await request.json();
        return HttpResponse.json({ id: '1', ...event }, { status: 201 });
      })
    );

    // When
    await act(async () => {
      await result.current.saveEvent(normalEvent);
    });

    // Then
    await waitFor(() => {
      expect(batchApiCalled).toBe(false);
      expect(singleApiCalled).toBe(true);
    });
  });

  it('반복 일정 수정 시 PUT /api/events/:id를 호출한다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(true)); // editing=true
    await act(() => Promise.resolve(null));

    const recurringEvent = {
      id: '1',
      title: '수정된 회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '수정된 팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'daily' as const, interval: 1 },
      notificationTime: 10,
    };

    // MSW 핸들러 설정
    let putApiCalled = false;
    let batchApiCalled = false;

    server.use(
      http.put('/api/events/:id', async ({ params, request }) => {
        putApiCalled = true;
        expect(params.id).toBe('1');
        const body = await request.json();
        return HttpResponse.json({ id: '1', ...body }, { status: 200 });
      }),
      http.post('/api/events-list', () => {
        batchApiCalled = true;
        return HttpResponse.json({}, { status: 201 });
      })
    );

    // When
    await act(async () => {
      await result.current.saveEvent(recurringEvent);
    });

    // Then
    await waitFor(() => {
      expect(putApiCalled).toBe(true);
      expect(batchApiCalled).toBe(false);
    });
  });
});
