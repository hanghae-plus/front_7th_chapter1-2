import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRecurringEvents } from '../utils/eventUtils';

interface SaveEventOptions {
  editMode?: 'single' | 'series';
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

  const saveEvent = async (eventData: Event | EventForm, options?: SaveEventOptions) => {
    try {
      let response;

      // Check if editing a recurring event in series mode first
      if (options?.editMode === 'series' && 'id' in eventData && eventData.repeat.id) {
        const event = eventData as Event;

        response = await fetch(`/api/recurring-events/${event.repeat.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          throw new Error('Failed to update event series');
        }

        await fetchEvents();
        onSave?.();
        enqueueSnackbar('일정이 수정되었습니다.', { variant: 'success' });
        return;
      } else if (options?.editMode === 'single' && 'id' in eventData) {
        // Single edit mode: convert to non-recurring event
        const event = eventData as Event;
        const singleEventData = {
          ...eventData,
          repeat: {
            type: 'none' as const,
            interval: 0,
          },
        };

        response = await fetch(`/api/events/${event.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(singleEventData),
        });
      } else if (!editing && eventData.repeat && eventData.repeat.type !== 'none') {
        // Generate recurring events for creation
        const recurringEvents = generateRecurringEvents(eventData as EventForm);

        response = await fetch('/api/events-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: recurringEvents }),
        });
      } else if (editing && 'id' in eventData) {
        const event = eventData as Event;

        // Regular edit (not series, not single from recurring)
        response = await fetch(`/api/events/${event.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      } else {
        // Regular creation
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        // For 404 errors on update, treat as save failure
        if (editing && response.status === 404) {
          throw new Error('Event not found');
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
      // Check if error message indicates a series update failure or event not found
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage === 'Failed to update event series') {
        enqueueSnackbar('일정 수정 실패', { variant: 'error' });
      } else {
        enqueueSnackbar('일정 저장 실패', { variant: 'error' });
      }
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
    }
  };

  const deleteEventSeries = async (repeatId: string) => {
    try {
      const response = await fetch(`/api/recurring-events/${repeatId}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event series');
      }

      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event series:', error);
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

  return { events, fetchEvents, saveEvent, deleteEvent, deleteEventSeries };
};
