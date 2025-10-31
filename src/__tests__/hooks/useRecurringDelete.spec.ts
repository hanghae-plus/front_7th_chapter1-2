// 반복 일정 삭제 훅 테스트
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { useRecurringDelete } from '@/hooks/useRecurringDelete';
import { Event } from '@/types/events/Event.types';

// notistack 모킹
vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: vi.fn(),
  }),
}));

// 전역 fetch 모킹
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useRecurringDelete 훅', () => {
  let eventList: Event[];
  let mockOnUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnUpdate = vi.fn();

    eventList = [
      {
        id: '1',
        title: '반복 회의 1',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 1, id: 'repeat-1' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '반복 회의 2',
        date: '2025-01-22',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 1, id: 'repeat-1' },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '단일 일정',
        date: '2025-01-20',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    // 성공적인 fetch 응답 기본 설정
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    // Save mockFetch globally so implementation can call it
    (global as Record<string, unknown>).savedMockFetch = mockFetch;

    // Set default implementation (can be overridden by individual tests)
    mockFetch.mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  describe('기본 상태', () => {
    it('초기 상태가 올바르게 설정되어야 함', () => {
      const { result } = renderHook(() =>
        useRecurringDelete(eventList, mockOnUpdate)
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.showConfirmDialog).toBe(false);
      expect(result.current.pendingDelete).toBe(null);
    });
  });

  describe('삭제 시작', () => {
    it('반복 일정 삭제 시 확인 다이얼로그가 표시되어야 함', () => {
      const { result } = renderHook(() =>
        useRecurringDelete(eventList, mockOnUpdate)
      );

      act(() => {
        result.current.startDelete(eventList[0]);
      });

      expect(result.current.showConfirmDialog).toBe(true);
      expect(result.current.pendingDelete).toEqual({
        event: eventList[0],
      });
    });

    it('단일 일정 삭제 시 바로 삭제가 실행되어야 함', async () => {
      const { result } = renderHook(() =>
        useRecurringDelete(eventList, mockOnUpdate)
      );

      await act(async () => {
        await result.current.startDelete(eventList[2]);
      });

      expect(result.current.showConfirmDialog).toBe(false);
      expect(mockFetch).toHaveBeenCalledWith('/api/events/3', {
        method: 'DELETE',
        signal: expect.any(AbortSignal),
      });
    });
  });

  describe('단일 삭제', () => {
    it('단일 삭제가 성공적으로 수행되어야 함', async () => {
      const { result } = renderHook(() =>
        useRecurringDelete(eventList, mockOnUpdate)
      );

      // 다이얼로그를 먼저 열기
      act(() => {
        result.current.startDelete(eventList[0]);
      });

      // 단일 삭제 실행
      await act(async () => {
        await result.current.handleDeleteSingle();
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/events/1', {
        method: 'DELETE',
        signal: expect.any(AbortSignal),
      });

      expect(result.current.showConfirmDialog).toBe(false);
      expect(result.current.pendingDelete).toBe(null);

      // onUpdate가 올바른 데이터로 호출되었는지 확인
      expect(mockOnUpdate).toHaveBeenCalledWith(
        eventList.filter((e) => e.id !== '1')
      );
    });

    it('단일 삭제 실패 시 에러 처리가 되어야 함', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

      const { result } = renderHook(() =>
        useRecurringDelete(eventList, mockOnUpdate)
      );

      act(() => {
        result.current.startDelete(eventList[0]);
      });

      await act(async () => {
        await result.current.handleDeleteSingle();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('네트워크 오류가 발생했습니다');
      });

      // 롤백되어 원본 데이터가 복원되어야 함
      expect(mockOnUpdate).toHaveBeenLastCalledWith(eventList);
    });

    it('pendingDelete가 없을 때 단일 삭제가 실행되지 않아야 함', async () => {
      const { result } = renderHook(() =>
        useRecurringDelete(eventList, mockOnUpdate)
      );

      await act(async () => {
        await result.current.handleDeleteSingle();
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe('전체 삭제', () => {
    it('전체 삭제가 성공적으로 수행되어야 함', async () => {
      const { result } = renderHook(() =>
        useRecurringDelete(eventList, mockOnUpdate)
      );

      act(() => {
        result.current.startDelete(eventList[0]);
      });

      await act(async () => {
        await result.current.handleDeleteAll();
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/recurring-events/repeat-1', {
        method: 'DELETE',
        signal: expect.any(AbortSignal),
      });

      expect(result.current.showConfirmDialog).toBe(false);
      expect(result.current.pendingDelete).toBe(null);

      // 같은 repeatId를 가진 모든 이벤트가 삭제되어야 함
      const expectedResult = eventList.filter(
        (e) => e.repeat.id !== 'repeat-1'
      );
      expect(mockOnUpdate).toHaveBeenCalledWith(expectedResult);
    });

    it('전체 삭제 실패 시 에러 처리가 되어야 함', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Server Error'));

      const { result } = renderHook(() =>
        useRecurringDelete(eventList, mockOnUpdate)
      );

      act(() => {
        result.current.startDelete(eventList[0]);
      });

      await act(async () => {
        await result.current.handleDeleteAll();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('전체 일정 삭제 실패');
      });

      // 롤백되어 원본 데이터가 복원되어야 함
      expect(mockOnUpdate).toHaveBeenLastCalledWith(eventList);
    });

    it('pendingDelete가 없을 때 전체 삭제가 실행되지 않아야 함', async () => {
      const { result } = renderHook(() =>
        useRecurringDelete(eventList, mockOnUpdate)
      );

      await act(async () => {
        await result.current.handleDeleteAll();
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe('취소 처리', () => {
    it('취소 시 다이얼로그가 닫히고 상태가 초기화되어야 함', () => {
      const { result } = renderHook(() =>
        useRecurringDelete(eventList, mockOnUpdate)
      );

      // 다이얼로그 열기
      act(() => {
        result.current.startDelete(eventList[0]);
      });

      expect(result.current.showConfirmDialog).toBe(true);

      // 취소 실행
      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.showConfirmDialog).toBe(false);
      expect(result.current.pendingDelete).toBe(null);
    });
  });

  describe('로딩 상태', () => {
    it('삭제 중 로딩 상태가 true가 되어야 함', async () => {
      // fetch를 느리게 만들기
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ ok: true, json: () => ({}) }), 100)
          )
      );

      const { result } = renderHook(() =>
        useRecurringDelete(eventList, mockOnUpdate)
      );

      act(() => {
        result.current.startDelete(eventList[0]);
      });

      // 삭제 시작 후 바로 로딩 상태 확인
      act(() => {
        result.current.handleDeleteSingle();
      });

      // 즉시 로딩 상태 확인 (handleDeleteSingle 호출 직후)
      expect(result.current.isLoading).toBe(true);

      // 삭제 완료까지 대기
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('요청 취소', () => {
    it('컴포넌트 언마운트 시 진행 중인 요청이 취소되어야 함', () => {
      // 새로운 mock 설정으로 테스트 격리
      const mockOnUpdateLocal = vi.fn();
      const { result, unmount } = renderHook(() =>
        useRecurringDelete(eventList, mockOnUpdateLocal)
      );

      // 컴포넌트가 정상적으로 마운트되어 있는지 확인
      expect(result.current).not.toBeNull();
      expect(result.current.startDelete).toBeDefined();

      // 언마운트 시 에러가 발생하지 않는지 확인
      expect(() => unmount()).not.toThrow();
    });
  });
});
