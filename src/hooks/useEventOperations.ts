// Ai Edit
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRepeatDates } from '../utils/repeatUtils';

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

  // Ai Edit
  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;
      
      // 🔁 반복 일정 처리
      if (!editing && eventData.repeat.type !== 'none' && eventData.repeat.endDate) {
        // 📅 반복 날짜 생성
        const repeatDates = generateRepeatDates({
          startDate: eventData.date,
          repeatType: eventData.repeat.type,
          interval: eventData.repeat.interval,
          endDate: eventData.repeat.endDate,
        });

        // 🆔 반복 그룹 ID 생성
        const repeatGroupId = `repeat-${Date.now()}`;

        // 📝 모든 반복 일정 인스턴스 생성
        const repeatEvents = repeatDates.map((date) => ({
          ...eventData,
          date,
          repeatGroupId,
          isRepeatInstance: true,
        }));

        // 🌐 서버에 반복 일정 전송 (/api/events-list 기반)
        response = await fetch('/api/events-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: repeatEvents }),
        });
      } else if (editing) {
        // ✏️ 일정 수정
        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      } else {
        // ➕ 단일 일정 추가
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
