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
      console.log('[DEBUG] Fetched Events:', events); // 디버깅 로그 추가
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
    }
  };

  const addOrUpdateEvent = async (eventData: Event | EventForm, seriesId?: string | null) => {
    try {
      let url: string;
      let method: 'POST' | 'PUT';

      switch (true) {
        case Boolean(seriesId): // 반복 시리즈 수정
          url = `/api/events-series/${seriesId}`;
          method = 'PUT';
          break;
        case editing && eventData.repeat.type !== 'none' && !eventData.seriesId: // 단일 이벤트를 반복 이벤트로 변경
          url = `/api/events/convert-to-recurring`;
          method = 'POST';
          break;
        case editing: // 단일 이벤트 수정 (반복 아님)
          url = `/api/events/${(eventData as Event).id}`;
          method = 'PUT';
          break;
        default: // 새 이벤트 생성
          url = '/api/events';
          method = 'POST';
          break;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Failed to save event:', errorBody);
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar(editing || seriesId ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      console.log(id, response);

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
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

  const detachEventFromSeries = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/detach`, { method: 'PUT' });
      if (!response.ok) {
        throw new Error('Failed to detach event');
      }
      await fetchEvents();
      enqueueSnackbar('일정이 단일 일정으로 변경되었습니다.', { variant: 'success' });
    } catch (error) {
      console.error('Error detaching event:', error);
      enqueueSnackbar('일정 분리 실패', { variant: 'error' });
    }
  };

  return { events, fetchEvents, addOrUpdateEvent, deleteEvent, detachEventFromSeries };
};
