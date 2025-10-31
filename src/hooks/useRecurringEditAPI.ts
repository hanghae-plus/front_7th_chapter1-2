// 반복 일정 수정 API 훅
import { useSnackbar } from 'notistack';
import { useState, useCallback, useRef, useEffect } from 'react';

import { Event } from '@/types/events/Event.types';
import { EventForm } from '@/types/events/EventForm.types';
import { getErrorMessage } from '@/utils/errors/networkError';
import {
  convertToSingleEvent,
  updateAllRecurringEvents,
} from '@/utils/recurring/recurringEdit';

/**
 * 반복 일정 수정 API 처리를 담당하는 훅
 * @param eventList 현재 이벤트 목록
 * @param onUpdate 이벤트 목록 업데이트 콜백
 */
export const useRecurringEditAPI = (
  eventList: Event[],
  onUpdate: (events: Event[]) => void
) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
   * 단일 이벤트 수정 수행
   * @param event 수정할 이벤트
   * @param updatedData 업데이트할 데이터
   */
  const performSingleEdit = useCallback(
    async (event: Event, updatedData: Partial<EventForm>) => {
      setIsLoading(true);
      setError(null);

      // 낙관적 업데이트
      const convertedEvent = convertToSingleEvent(event);
      const updatedEvent = { ...convertedEvent, ...updatedData };
      const optimisticEvents = eventList.map((e) =>
        e.id === event.id ? updatedEvent : e
      );
      onUpdate(optimisticEvents);

      try {
        // 기존 요청이 있다면 취소
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const response = await fetch(`/api/events/${event.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedEvent),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error('서버 오류');
        }
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === 'AbortError') return;

        // 에러 시 롤백
        onUpdate(eventList);

        const errorMessage = getErrorMessage(error, '일정 수정 실패');
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [eventList, onUpdate, enqueueSnackbar]
  );

  /**
   * 전체 반복 이벤트 수정 수행
   * @param repeatId 반복 이벤트 ID
   * @param updatedData 업데이트할 데이터
   */
  const performAllEdit = useCallback(
    async (repeatId: string, updatedData: Partial<EventForm>) => {
      setIsLoading(true);
      setError(null);

      const optimisticEvents = updateAllRecurringEvents(
        eventList,
        repeatId,
        updatedData
      );
      onUpdate(optimisticEvents);

      try {
        // 기존 요청이 있다면 취소
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const response = await fetch(`/api/recurring-events/${repeatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error('서버 오류');
        }
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === 'AbortError') return;

        // 에러 시 롤백
        onUpdate(eventList);
        const errorMessage = getErrorMessage(error, '전체 일정 수정 실패');
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
    [eventList, onUpdate, enqueueSnackbar]
  );

  return {
    isLoading,
    error,
    performSingleEdit,
    performAllEdit,
  };
};
