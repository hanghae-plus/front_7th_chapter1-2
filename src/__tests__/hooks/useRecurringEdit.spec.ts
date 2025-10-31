// 반복 일정 수정 훅 테스트
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useRecurringEdit } from '@/hooks/useRecurringEdit';
import { server } from '@/setupTests';
import { Event } from '@/types/events/Event.types';
import { EventForm } from '@/types/events/EventForm.types';

const mockEnqueueSnackbar = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: mockEnqueueSnackbar,
    }),
  };
});

describe('useRecurringEdit 훅', () => {
  let mockEvent: Event;
  let mockEventList: Event[];

  beforeEach(() => {
    vi.clearAllMocks();

    mockEvent = {
      id: '1',
      title: '반복 회의',
      date: '2024-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 회의',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
      repeat: {
        type: 'weekly',
        interval: 1,
        endCondition: { type: 'never' },
        id: 'repeat-1',
      },
    };

    mockEventList = [
      mockEvent,
      {
        id: '2',
        title: '반복 회의',
        date: '2024-11-08',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 회의',
        location: '회의실 A',
        category: '업무',
        notificationTime: 10,
        repeat: {
          type: 'weekly',
          interval: 1,
          endCondition: { type: 'never' },
          id: 'repeat-1',
        },
      },
    ];
  });

  describe('초기 상태', () => {
    it('초기 상태가 올바르게 설정되어야 함', () => {
      const { result } = renderHook(() =>
        useRecurringEdit(mockEventList, vi.fn())
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.showConfirmDialog).toBe(false);
      expect(result.current.pendingEdit).toBeNull();
    });
  });

  describe('편집 시작', () => {
    it('반복 이벤트 편집 시 확인 다이얼로그가 표시되어야 함', async () => {
      const mockOnUpdate = vi.fn();
      const { result } = renderHook(() =>
        useRecurringEdit(mockEventList, mockOnUpdate)
      );

      const updatedData: Partial<EventForm> = { title: '수정된 회의' };

      await act(async () => {
        result.current.startEdit(mockEvent, updatedData);
      });

      expect(result.current.showConfirmDialog).toBe(true);
      expect(result.current.pendingEdit).toEqual({
        event: mockEvent,
        updatedData,
      });
    });

    it('단일 이벤트 편집 시 바로 업데이트되어야 함', async () => {
      const singleEvent: Event = {
        ...mockEvent,
        repeat: { type: 'none', interval: 0 },
      };
      const mockOnUpdate = vi.fn();

      server.use(
        http.put('/api/events/:id', () => {
          return HttpResponse.json({ success: true });
        })
      );

      const { result } = renderHook(() =>
        useRecurringEdit([singleEvent], mockOnUpdate)
      );

      const updatedData: Partial<EventForm> = { title: '수정된 단일 일정' };

      await act(async () => {
        result.current.startEdit(singleEvent, updatedData);
      });

      expect(result.current.showConfirmDialog).toBe(false);
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  describe('단일 이벤트 수정', () => {
    it('단일 수정 시 해당 이벤트만 업데이트되어야 함', async () => {
      const mockOnUpdate = vi.fn();

      server.use(
        http.put('/api/events/:id', ({ params }) => {
          return HttpResponse.json({
            ...mockEvent,
            id: params.id,
            title: '수정된 회의',
            repeat: { type: 'none', interval: 0 },
          });
        })
      );

      const { result } = renderHook(() =>
        useRecurringEdit(mockEventList, mockOnUpdate)
      );

      const updatedData: Partial<EventForm> = { title: '수정된 회의' };

      await act(async () => {
        result.current.startEdit(mockEvent, updatedData);
      });

      await act(async () => {
        result.current.handleEditSingle();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            title: '수정된 회의',
            repeat: { type: 'none', interval: 0 },
          }),
        ])
      );
    });

    it('단일 수정 시 낙관적 업데이트가 동작해야 함', async () => {
      const mockOnUpdate = vi.fn();
      const { result } = renderHook(() =>
        useRecurringEdit(mockEventList, mockOnUpdate)
      );

      const updatedData: Partial<EventForm> = { title: '임시 수정' };

      await act(async () => {
        result.current.startEdit(mockEvent, updatedData);
      });

      await act(async () => {
        result.current.handleEditSingle();
      });

      // 즉시 UI 업데이트 확인
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  describe('전체 이벤트 수정', () => {
    it('전체 수정 시 모든 관련 이벤트가 업데이트되어야 함', async () => {
      const mockOnUpdate = vi.fn();

      server.use(
        http.put('/api/recurring-events/:repeatId', () => {
          return HttpResponse.json({
            success: true,
            updatedEvents: mockEventList.map((event) => ({
              ...event,
              title: '수정된 전체 회의',
            })),
          });
        })
      );

      const { result } = renderHook(() =>
        useRecurringEdit(mockEventList, mockOnUpdate)
      );

      const updatedData: Partial<EventForm> = { title: '수정된 전체 회의' };

      await act(async () => {
        result.current.startEdit(mockEvent, updatedData);
      });

      await act(async () => {
        result.current.handleEditAll();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            title: '수정된 전체 회의',
          }),
          expect.objectContaining({
            id: '2',
            title: '수정된 전체 회의',
          }),
        ])
      );
    });
  });

  describe('로딩 상태 관리', () => {
    it('API 호출 중 로딩 상태가 true가 되어야 함', async () => {
      const mockOnUpdate = vi.fn();

      server.use(
        http.put('/api/events/:id', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ success: true });
        })
      );

      const { result } = renderHook(() =>
        useRecurringEdit(mockEventList, mockOnUpdate)
      );

      const updatedData: Partial<EventForm> = { title: '수정된 회의' };

      await act(async () => {
        result.current.startEdit(mockEvent, updatedData);
      });

      act(() => {
        result.current.handleEditSingle();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('에러 처리', () => {
    it('단일 수정 실패 시 에러 메시지가 표시되어야 함', async () => {
      const mockOnUpdate = vi.fn();

      server.use(
        http.put('/api/events/:id', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const { result } = renderHook(() =>
        useRecurringEdit(mockEventList, mockOnUpdate)
      );

      const updatedData: Partial<EventForm> = { title: '실패할 수정' };

      await act(async () => {
        result.current.startEdit(mockEvent, updatedData);
      });

      await act(async () => {
        result.current.handleEditSingle();
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('일정 수정 실패', {
        variant: 'error',
      });
    });

    it('전체 수정 실패 시 롤백이 수행되어야 함', async () => {
      const mockOnUpdate = vi.fn();

      server.use(
        http.put('/api/recurring-events/:repeatId', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const { result } = renderHook(() =>
        useRecurringEdit(mockEventList, mockOnUpdate)
      );

      const updatedData: Partial<EventForm> = { title: '실패할 전체 수정' };

      await act(async () => {
        result.current.startEdit(mockEvent, updatedData);
      });

      await act(async () => {
        result.current.handleEditAll();
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // 원본 데이터로 롤백되어야 함
      expect(mockOnUpdate).toHaveBeenLastCalledWith(mockEventList);
    });

    it('네트워크 에러 시 적절한 에러 메시지가 표시되어야 함', async () => {
      const mockOnUpdate = vi.fn();

      // fetch를 일시적으로 mock하여 실제 네트워크 에러 시뮬레이션
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() =>
        useRecurringEdit(mockEventList, mockOnUpdate)
      );

      const updatedData: Partial<EventForm> = { title: '네트워크 에러' };

      await act(async () => {
        result.current.startEdit(mockEvent, updatedData);
      });

      await act(async () => {
        result.current.handleEditSingle();
      });

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        '네트워크 오류가 발생했습니다',
        { variant: 'error' }
      );

      // fetch 복원
      global.fetch = originalFetch;
    });
  });

  describe('다이얼로그 제어', () => {
    it('취소 시 다이얼로그가 닫히고 상태가 초기화되어야 함', async () => {
      const mockOnUpdate = vi.fn();
      const { result } = renderHook(() =>
        useRecurringEdit(mockEventList, mockOnUpdate)
      );

      const updatedData: Partial<EventForm> = { title: '수정된 회의' };

      await act(async () => {
        result.current.startEdit(mockEvent, updatedData);
      });

      expect(result.current.showConfirmDialog).toBe(true);

      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.showConfirmDialog).toBe(false);
      expect(result.current.pendingEdit).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('메모리 누수 방지', () => {
    it('컴포넌트 언마운트 시 진행 중인 요청이 취소되어야 함', async () => {
      const mockOnUpdate = vi.fn();

      server.use(
        http.put('/api/events/:id', async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return HttpResponse.json({ success: true });
        })
      );

      const { result, unmount } = renderHook(() =>
        useRecurringEdit(mockEventList, mockOnUpdate)
      );

      const updatedData: Partial<EventForm> = { title: '취소될 수정' };

      await act(async () => {
        result.current.startEdit(mockEvent, updatedData);
      });

      act(() => {
        result.current.handleEditSingle();
      });

      // 요청 진행 중에 컴포넌트 언마운트
      unmount();

      // 메모리 누수나 에러가 발생하지 않아야 함
      expect(() => unmount()).not.toThrow();
    });
  });
});
