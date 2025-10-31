import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRecurringEvents } from '../utils/recurringEvents';

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
        const event = eventData as Event;

        // 반복 일정 시리즈 전체 수정
        if (event.repeat.id && event.repeat.type !== 'none') {
          response = await fetch(`/api/recurring-events/${event.repeat.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
          });
        }
        // 일반 일정을 반복 일정으로 변경하는 경우
        else if (event.repeat.type !== 'none' && !event.repeat.id) {
          // 기존 일정 삭제
          await fetch(`/api/events/${event.id}`, { method: 'DELETE' });

          // 새로운 반복 일정들 생성
          const baseEvent: Event = {
            ...event,
            id: Date.now().toString(),
          };

          const recurringEvents = generateRecurringEvents(baseEvent, event.repeat);
          console.log('🔄 반복 일정 생성:', recurringEvents.length, '개');
          console.log(
            '📅 생성된 일정 날짜:',
            recurringEvents.map((e) => e.date)
          );

          // /api/events-list 엔드포인트 사용
          response = await fetch('/api/events-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: recurringEvents }),
          });

          if (!response.ok) {
            throw new Error('Failed to save recurring events');
          }
        } else {
          // 일반 수정
          response = await fetch(`/api/events/${event.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
          });
        }
      } else {
        const baseEvent: Event = {
          ...(eventData as EventForm),
          id: '', // 서버에서 ID 생성
        };

        if (eventData.repeat.type !== 'none') {
          const recurringEvents = generateRecurringEvents(baseEvent, eventData.repeat);
          console.log('🔄 반복 일정 생성:', recurringEvents.length, '개');
          console.log(
            '📅 생성된 일정 날짜:',
            recurringEvents.map((e) => e.date)
          );

          // /api/events-list 엔드포인트 사용
          response = await fetch('/api/events-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: recurringEvents }),
          });

          if (!response.ok) {
            throw new Error('Failed to save recurring events');
          }
        } else {
          response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(baseEvent),
          });
        }
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar(editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', {
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

  return { events, fetchEvents, saveEvent, deleteEvent };
};
