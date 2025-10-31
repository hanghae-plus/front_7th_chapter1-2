import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRecurringEvents } from '../utils/recurringEventUtils';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events: rawEvents } = await response.json();

      // New approach: DB stores actual instances, not templates
      // Only expand old template-style events (those without repeat.id)
      // <!-- 새 방식: DB에 실제 인스턴스 저장, 템플릿 아님 -->
      // <!-- repeat.id 없는 구형 템플릿 이벤트만 확장 -->
      const expandedEvents: Event[] = [];
      for (const event of rawEvents) {
        const isTemplateEvent = event.repeat.type !== 'none' && !event.repeat.id;

        if (isTemplateEvent) {
          // Old template-style event: expand it
          // <!-- 구형 템플릿 이벤트: 확장 -->
          const occurrences = generateRecurringEvents(event);
          expandedEvents.push(...occurrences);
        } else {
          // Single event or already-expanded instance: use as is
          // <!-- 단일 이벤트 또는 이미 확장된 인스턴스: 그대로 사용 -->
          expandedEvents.push(event);
        }
      }

      setEvents(expandedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
    }
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;

      // Check if this is a new repeating event
      // <!-- 새로운 반복 일정인지 확인 -->
      const isNewRepeatingEvent = !editing && eventData.repeat.type !== 'none';

      if (editing) {
        const event = eventData as Event;
        // For recurring events, use original event ID and original start date
        // <!-- 반복 일정의 경우 원본 이벤트 ID와 원본 시작 날짜 사용 -->
        const updateId = event.repeat?.originalEventId || event.id;
        const updateDate = event.repeat?.originalDate || event.date;

        // Prepare data for update (use original start date for recurring events)
        // <!-- 수정 데이터 준비 (반복 일정은 원본 시작 날짜 사용) -->
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        const { id: _id, repeat: _repeat, ...eventWithoutIdAndRepeat } = event;
        // <!-- Virtual ID와 repeat 제거 (메타데이터 포함) -->

        const updateData = {
          ...eventWithoutIdAndRepeat,
          date: updateDate,
          repeat: {
            type: event.repeat.type,
            interval: event.repeat.interval,
            endDate: event.repeat.endDate,
            // Don't send internal fields to server
            // <!-- 내부 필드는 서버로 전송하지 않음 -->
          },
        };

        response = await fetch(`/api/events/${updateId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
      } else if (isNewRepeatingEvent) {
        // New repeating event: generate all instances and save at once
        // <!-- 새로운 반복 일정: 모든 인스턴스를 생성하여 한 번에 저장 -->
        const tempEvent = { ...eventData, id: 'temp' } as Event;
        const recurringEvents = generateRecurringEvents(tempEvent);

        response = await fetch('/api/events-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: recurringEvents }),
        });
      } else {
        // Single event: save as is
        // <!-- 단일 이벤트: 그대로 저장 -->
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
      // Simply delete the ID provided - no transformation needed
      // <!-- 제공된 ID만 삭제 - 변환 불필요 -->
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
