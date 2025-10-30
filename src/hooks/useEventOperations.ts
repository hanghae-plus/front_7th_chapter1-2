import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { formatDate } from '../utils/dateUtils';

/**
 * silent 옵션에 따라 스낵바를 표시합니다.
 * @param enqueue - 스낵바 함수
 * @param message - 표시할 메시지
 * @param variant - 스낵바 타입
 * @param silent - silent 모드 여부
 */
function showSnackbar(
  enqueue: ReturnType<typeof useSnackbar>['enqueueSnackbar'],
  message: string,
  variant: 'success' | 'info' | 'error',
  silent?: boolean
) {
  if (!silent) {
    enqueue(message, { variant });
  }
}

/**
 * 반복 일정 그룹의 모든 이벤트를 업데이트합니다.
 * @param eventData - 업데이트할 이벤트 데이터
 * @param events - 전체 이벤트 목록
 * @returns 업데이트 요청 Promise 배열
 */
async function updateRepeatGroupEvents(eventData: Event, events: Event[]): Promise<void> {
  const groupedEvents = events.filter(
    (event) => event.repeatGroupId === eventData.repeatGroupId && event.id !== eventData.id
  );

  if (groupedEvents.length === 0) return;

  // 요일 차이 계산
  const dayOfEvent = new Date(eventData.date).getDay();

  await Promise.all(
    groupedEvents.map((event) => {
      const dayOfTarget = new Date(event.date).getDay();
      const dayDiff = dayOfEvent - dayOfTarget;

      const calibratedDate = new Date(event.date);
      calibratedDate.setDate(calibratedDate.getDate() + dayDiff);

      const calibratedEndDate = event.repeat.endDate ? new Date(event.repeat.endDate) : undefined;
      if (calibratedEndDate) {
        calibratedEndDate.setDate(calibratedEndDate.getDate() + dayDiff);
      }

      return fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          id: event.id,
          date: formatDate(calibratedDate),
          repeat: {
            ...eventData.repeat,
            endDate: calibratedEndDate ? formatDate(calibratedEndDate) : undefined,
          },
        }),
      });
    })
  );
}

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
    }
  };

  const saveEvent = async (eventData: Event | EventForm, options?: { silent?: boolean }) => {
    try {
      let response;
      const isUpdate = 'id' in eventData && eventData.id !== undefined;

      if (isUpdate) {
        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });

        if (response.ok && eventData.repeatGroupId != null) {
          await updateRepeatGroupEvents(eventData as Event, events);
        }
      } else {
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();

      showSnackbar(
        enqueueSnackbar,
        isUpdate ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.',
        'success',
        options?.silent
      );
    } catch (error) {
      console.error('Error saving event:', error);
      showSnackbar(enqueueSnackbar, '일정 저장 실패', 'error', options?.silent);
    }
  };

  const deleteEvent = async (id: string, options?: { silent?: boolean }) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      showSnackbar(enqueueSnackbar, '일정이 삭제되었습니다.', 'info', options?.silent);
    } catch (error) {
      console.error('Error deleting event:', error);
      showSnackbar(enqueueSnackbar, '일정 삭제 실패', 'error', options?.silent);
    }
  };

  async function init() {
    await fetchEvents();
    enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
