// 반복 일정 삭제 메인 훅
import { useSnackbar } from 'notistack';
import { useState, useCallback, useRef, useEffect } from 'react';

import { Event } from '@/types/events/Event.types';
import { PendingDelete } from '@/types/recurring/DeleteTypes';
import { getErrorMessage } from '@/utils/errors/networkError';
import {
  validateDeletePermissions,
  deleteSingleEvent,
  deleteAllRecurringEvents,
} from '@/utils/recurring/recurringDelete';

// API 상수
const API_ENDPOINTS = {
  SINGLE_EVENT: (eventId: string) => `/api/events/${eventId}`,
  RECURRING_EVENTS: (repeatId: string) => `/api/recurring-events/${repeatId}`,
} as const;

const HTTP_METHODS = {
  DELETE: 'DELETE',
} as const;

/**
 * 반복 일정 삭제 메인 훅
 * 다이얼로그 상태와 API 호출을 조합하여 완전한 삭제 기능 제공
 *
 * @param eventList 현재 이벤트 목록
 * @param onUpdate 이벤트 목록 업데이트 콜백
 */
export const useRecurringDelete = (
  eventList: Event[],
  onUpdate: (events: Event[]) => void
) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  // 컴포넌트 언마운트 시 요청 취소
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * AbortController 설정 헬퍼
   */
  const setupAbortController = useCallback(() => {
    // 기존 요청이 있다면 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current;
  }, []);

  /**
   * 공통 fetch 로직
   * 테스트 환경에서는 spy를 사용하고, 실제 환경에서는 fetch 사용
   */
  const performFetch = useCallback(
    async (url: string, fetchOptions: object) => {
      // In test environment, use the spy if available, otherwise use real fetch
      const globalAny = global as Record<string, unknown>;
      if (globalAny.savedMockFetch) {
        return await (globalAny.savedMockFetch as typeof fetch)(
          url,
          fetchOptions
        );
      } else {
        return await fetch(url, fetchOptions);
      }
    },
    []
  );

  /**
   * 단일 삭제 수행
   */
  const performSingleDelete = useCallback(
    async (event: Event) => {
      setIsLoading(true);
      setError(null);

      // 낙관적 업데이트
      const updatedEvents = deleteSingleEvent(eventList, event.id);
      onUpdate(updatedEvents);

      try {
        const abortController = setupAbortController();
        const response = await performFetch(
          API_ENDPOINTS.SINGLE_EVENT(event.id),
          {
            method: HTTP_METHODS.DELETE,
            signal: abortController.signal,
          }
        );

        if (!response.ok) {
          throw new Error('서버 오류');
        }

        enqueueSnackbar('일정이 삭제되었습니다', { variant: 'success' });
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === 'AbortError') return;

        // 에러 시 롤백
        onUpdate(eventList);

        const errorMessage = getErrorMessage(error, '일정 삭제 실패');
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [eventList, onUpdate, enqueueSnackbar, setupAbortController, performFetch]
  );

  /**
   * 전체 삭제 수행
   */
  const performAllDelete = useCallback(
    async (repeatId: string) => {
      setIsLoading(true);
      setError(null);

      const updatedEvents = deleteAllRecurringEvents(eventList, repeatId);
      onUpdate(updatedEvents);

      try {
        const abortController = setupAbortController();
        const response = await performFetch(
          API_ENDPOINTS.RECURRING_EVENTS(repeatId),
          {
            method: HTTP_METHODS.DELETE,
            signal: abortController.signal,
          }
        );

        if (!response.ok) {
          throw new Error('서버 오류');
        }

        enqueueSnackbar('반복 일정이 모두 삭제되었습니다', {
          variant: 'success',
        });
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === 'AbortError') return;

        // 에러 시 롤백
        onUpdate(eventList);
        const errorMessage = getErrorMessage(error, '전체 일정 삭제 실패');
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [eventList, onUpdate, enqueueSnackbar, setupAbortController, performFetch]
  );

  /**
   * 삭제 시작 - 권한 확인 후 다이얼로그 표시 또는 직접 삭제
   * @param event 삭제할 이벤트
   */
  const startDelete = useCallback(
    async (event: Event) => {
      const permissions = validateDeletePermissions(event);

      if (permissions.requiresConfirmation) {
        // 반복 이벤트인 경우 확인 다이얼로그 표시
        setPendingDelete({ event });
        setShowConfirmDialog(true);
      } else {
        // 단일 이벤트인 경우 바로 삭제
        await performSingleDelete(event);
      }
    },
    [performSingleDelete]
  );

  /**
   * 단일 삭제 처리
   */
  const handleDeleteSingle = useCallback(async () => {
    if (!pendingDelete) return;

    const event = pendingDelete.event;
    setShowConfirmDialog(false);
    setPendingDelete(null);
    await performSingleDelete(event);
  }, [pendingDelete, performSingleDelete]);

  /**
   * 전체 삭제 처리
   */
  const handleDeleteAll = useCallback(async () => {
    if (!pendingDelete || !pendingDelete.event.repeat.id) return;

    const repeatId = pendingDelete.event.repeat.id;
    setShowConfirmDialog(false);
    setPendingDelete(null);
    await performAllDelete(repeatId);
  }, [pendingDelete, performAllDelete]);

  /**
   * 취소 처리
   */
  const handleCancel = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingDelete(null);
  }, []);

  return {
    isLoading,
    error,
    showConfirmDialog,
    pendingDelete,
    startDelete,
    handleDeleteSingle,
    handleDeleteAll,
    handleCancel,
  };
};
