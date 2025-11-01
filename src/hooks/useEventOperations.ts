import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';

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

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;
      if (editing) {
        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      } else {
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        if (response.status === 404) {
          enqueueSnackbar('수정할 일정을 찾을 수 없습니다.', { variant: 'error' });
          await fetchEvents();
          return;
        }
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar(editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar('일정 수정 실패', { variant: 'error' });
      throw error;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        if (response.status === 404) {
          enqueueSnackbar('삭제할 일정을 찾을 수 없습니다.', { variant: 'error' });
          await fetchEvents();
          return;
        }
        // 기존 테스트와의 호환성을 위해 에러를 throw하지 않고 에러 메시지만 표시
        enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
        return;
      }

      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
      throw error;
    }
  };

  const deleteRecurringEvents = async (repeatId: string) => {
    try {
      const response = await fetch(`/api/recurring-events/${repeatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          enqueueSnackbar('반복 일정을 찾을 수 없습니다.', { variant: 'error' });
          await fetchEvents();
          return;
        }
        throw new Error('Failed to delete recurring events');
      }

      await fetchEvents();
      enqueueSnackbar('반복 일정이 모두 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting recurring events:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
      // 네트워크 오류의 경우 다이얼로그는 열린 상태로 유지하기 위해 에러를 throw하지 않음
    }
  };

  const updateRecurringEvents = async (repeatId: string, updateData: Partial<EventForm>) => {
    try {
      const response = await fetch(`/api/recurring-events/${repeatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        if (response.status === 404) {
          enqueueSnackbar('반복 일정을 찾을 수 없습니다.', { variant: 'error' });
          await fetchEvents();
          return;
        }
        throw new Error('Failed to update recurring events');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar('일정이 수정되었습니다.', { variant: 'success' });
    } catch (error) {
      console.error('Error updating recurring events:', error);
      enqueueSnackbar('반복 일정 수정 실패', { variant: 'error' });
      throw error;
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

  return {
    events,
    fetchEvents,
    saveEvent,
    deleteEvent,
    deleteRecurringEvents,
    updateRecurringEvents,
  };
};
