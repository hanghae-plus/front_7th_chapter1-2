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

  // 단일 인스턴스만 수정 (새 이벤트 생성, 반복 제거, 원본 이벤트 삭제)
  const updateSingleInstance = async (originalEvent: Event, updateData: EventForm) => {
    try {
      // 새 UUID로 새 이벤트 생성
      const newEventData: EventForm = {
        ...updateData,
        repeat: { ...updateData.repeat, type: 'none' }, // 반복 제거
      };

      // 새 이벤트 생성
      const createResponse = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEventData),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create new event');
      }

      // 원본 이벤트 삭제
      const deleteResponse = await fetch(`/api/events/${originalEvent.id}`, {
        method: 'DELETE',
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete original event');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar('일정이 수정되었습니다.', {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error updating single instance:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
      throw error;
    }
  };

  // 전체 반복 시리즈 수정
  const updateRecurringSeries = async (originalEvent: Event, updateData: EventForm) => {
    try {
      // 새로운 반복 일정으로 재생성 (기존 시리즈를 직접 갱신하지 않고 새로 생성)
      const newRecurringEvent: EventForm = {
        title: updateData.title,
        date: updateData.date,
        startTime: updateData.startTime,
        endTime: updateData.endTime,
        description: updateData.description,
        location: updateData.location,
        category: updateData.category,
        notificationTime: updateData.notificationTime,
        repeat: {
          type: originalEvent.repeat.type,
          interval: originalEvent.repeat.interval,
          endDate: originalEvent.repeat.endDate,
        },
      };

      const createResponse = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecurringEvent),
      });
      if (!createResponse.ok) {
        throw new Error('Failed to create new recurring series');
      }

      // 편집하던 기존 인스턴스는 삭제
      await fetch(`/api/events/${originalEvent.id}`, { method: 'DELETE' });

      await fetchEvents();
      onSave?.();
      enqueueSnackbar('일정이 수정되었습니다.', { variant: 'success' });
    } catch (error) {
      console.error('Error updating recurring series:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
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
    updateSingleInstance,
    updateRecurringSeries,
  };
};
